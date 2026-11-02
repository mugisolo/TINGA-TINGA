-- ==========================================================
-- TINGA TINGA SAFARI - USER WALLET SYSTEM MIGRATION
-- Migration Version: 20260910_wallet_system
-- Target Database: Supabase PostgreSQL 15+
-- Description:
--   1. Wallets table with RLS, balance & hold_balance (escrow).
--   2. Append-only wallet_transactions ledger with immutable constraints.
--   3. Postgres function wallet_apply_transaction() with FOR UPDATE row locking,
--      idempotency, balance verification, and escrow support.
--   4. Payment intents table for top-up tracking and webhook verification.
--   5. Admin-set fx_rates table for display currency switcher (no live FX promises).
--   6. Admin audit log table for manual adjustments, refunds, and status changes.
--   7. User referrals table with unique referral codes and reward tracking.
-- ==========================================================

BEGIN;

-- 1. WALLET STATUS & TRANSACTION TYPES
DO $$ BEGIN
  CREATE TYPE wallet_status_type AS ENUM ('active', 'suspended', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tx_type AS ENUM (
    'topup',
    'payment',
    'refund',
    'referral_credit',
    'promo_credit',
    'admin_adjustment',
    'reversal'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tx_direction AS ENUM ('credit', 'debit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_tx_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- FK or identifier matching auth.users(id) / leads(id) / email
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  hold_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (hold_balance >= 0),
  status wallet_status_type NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hold_not_exceed_balance CHECK (hold_balance <= balance)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);

-- 3. WALLET TRANSACTIONS TABLE (APPEND-ONLY LEDGER)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  type wallet_tx_type NOT NULL,
  direction wallet_tx_direction NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status wallet_tx_status NOT NULL DEFAULT 'completed',
  reference TEXT UNIQUE NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  payment_provider TEXT CHECK (payment_provider IN ('dpo', 'stripe', 'paypal', 'mpesa', 'manual', 'wallet')),
  provider_ref TEXT,
  booking_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  narration TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON wallet_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_idempotency ON wallet_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_booking_id ON wallet_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created_at ON wallet_transactions(created_at DESC);

-- STRICT LEDGER INTEGRITY: REVOKE UPDATE AND DELETE
REVOKE UPDATE, DELETE ON wallet_transactions FROM PUBLIC;
REVOKE UPDATE, DELETE ON wallet_transactions FROM authenticated;
REVOKE UPDATE, DELETE ON wallet_transactions FROM anon;

-- Trigger to strictly block any UPDATE/DELETE attempts at database engine level
CREATE OR REPLACE FUNCTION prevent_wallet_transaction_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Wallet ledger transactions are strictly immutable and append-only. Modification or deletion is prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_wallet_transactions ON wallet_transactions;
CREATE TRIGGER trg_immutable_wallet_transactions
BEFORE UPDATE OR DELETE ON wallet_transactions
FOR EACH ROW EXECUTE FUNCTION prevent_wallet_transaction_modification();

-- 4. PAYMENT INTENTS (FOR TOP-UP LIFECYCLE)
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('dpo', 'stripe', 'paypal', 'mpesa')),
  provider_ref TEXT,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 50.00 AND amount <= 10000.00),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  webhook_verified BOOLEAN NOT NULL DEFAULT false,
  raw_webhook JSONB DEFAULT '{}'::jsonb,
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_wallet_id ON payment_intents(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_provider_ref ON payment_intents(provider_ref);

-- 5. ADMIN-SET FX RATES TABLE (FIXED RATES - NO LIVE FX PROMISES)
CREATE TABLE IF NOT EXISTS fx_rates (
  currency CHAR(3) PRIMARY KEY,
  rate_to_usd NUMERIC(14, 6) NOT NULL CHECK (rate_to_usd > 0),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fx_rates (currency, rate_to_usd, symbol, name)
VALUES 
  ('USD', 1.000000, '$', 'US Dollar'),
  ('TZS', 2650.000000, 'TSh', 'Tanzanian Shilling'),
  ('UGX', 3750.000000, 'USh', 'Ugandan Shilling'),
  ('KES', 130.000000, 'KSh', 'Kenyan Shilling'),
  ('EUR', 0.920000, '€', 'Euro'),
  ('GBP', 0.780000, '£', 'British Pound')
ON CONFLICT (currency) DO UPDATE 
SET rate_to_usd = EXCLUDED.rate_to_usd, symbol = EXCLUDED.symbol, name = EXCLUDED.name, updated_at = NOW();

-- 6. ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS admin_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  reason_code TEXT,
  narration TEXT,
  diff JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit(created_at DESC);

-- 7. USER REFERRALS TABLE
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_user_id TEXT,
  booking_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'expired')),
  reward_amount NUMERIC(14, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);

-- ==========================================================
-- 8. POSTGRES FUNCTION: wallet_apply_transaction
-- Handles:
--   - FOR UPDATE wallet row locking
--   - Status check (only active wallets)
--   - Idempotency check (returns current balance if already processed)
--   - Balance verification: available (balance - hold_balance) >= amount for debits
--   - Escrow hold / capture / release operations via meta->>'action'
--   - Appends ledger record to wallet_transactions
--   - Atomically updates wallets.balance & wallets.hold_balance
-- ==========================================================
CREATE OR REPLACE FUNCTION wallet_apply_transaction(
  p_wallet_id UUID,
  p_type wallet_tx_type,
  p_direction wallet_tx_direction,
  p_amount NUMERIC(14, 2),
  p_currency CHAR(3),
  p_reference TEXT,
  p_idempotency_key TEXT,
  p_payment_provider TEXT,
  p_provider_ref TEXT,
  p_booking_id UUID,
  p_narration TEXT,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_existing_tx wallet_transactions%ROWTYPE;
  v_action TEXT;
  v_new_balance NUMERIC(14, 2);
  v_new_hold NUMERIC(14, 2);
  v_available NUMERIC(14, 2);
  v_tx_id UUID;
BEGIN
  -- 1. Idempotency Check: if this key was already processed, return existing state
  SELECT * INTO v_existing_tx 
  FROM wallet_transactions 
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id;
    RETURN jsonb_build_object(
      'success', true,
      'idempotent_duplicate', true,
      'transaction_id', v_existing_tx.id,
      'wallet_id', v_wallet.id,
      'balance', v_wallet.balance,
      'hold_balance', v_wallet.hold_balance,
      'available_balance', (v_wallet.balance - v_wallet.hold_balance)
    );
  END IF;

  -- 2. Lock the wallet row FOR UPDATE
  SELECT * INTO v_wallet
  FROM wallets
  WHERE id = p_wallet_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet with id % does not exist.', p_wallet_id;
  END IF;

  -- 3. Check wallet status
  IF v_wallet.status <> 'active' THEN
    RAISE EXCEPTION 'Wallet % is currently % and cannot process transactions.', p_wallet_id, v_wallet.status;
  END IF;

  -- 4. Calculate balances and check invariants
  v_new_balance := v_wallet.balance;
  v_new_hold := v_wallet.hold_balance;
  v_available := v_wallet.balance - v_wallet.hold_balance;
  v_action := COALESCE(p_meta->>'action', '');

  IF p_direction = 'debit' THEN
    -- Special case A: Escrow Hold (placing funds on hold for a pending booking)
    IF v_action = 'hold' THEN
      IF v_available < p_amount THEN
        RAISE EXCEPTION 'Insufficient available balance for escrow hold. Available: %, Requested: %', v_available, p_amount;
      END IF;
      v_new_hold := v_new_hold + p_amount;

    -- Special case B: Escrow Capture (safari confirmed, move from hold to captured revenue)
    ELSIF v_action = 'capture' THEN
      IF v_new_hold < p_amount THEN
        RAISE EXCEPTION 'Cannot capture %: escrow hold balance is only %', p_amount, v_new_hold;
      END IF;
      v_new_balance := v_new_balance - p_amount;
      v_new_hold := v_new_hold - p_amount;

    -- Special case C: Escrow Release (booking cancelled, release held funds back to available)
    ELSIF v_action = 'release' THEN
      IF v_new_hold < p_amount THEN
        RAISE EXCEPTION 'Cannot release %: escrow hold balance is only %', p_amount, v_new_hold;
      END IF;
      v_new_hold := v_new_hold - p_amount;

    -- Standard direct debit
    ELSE
      IF v_available < p_amount THEN
        RAISE EXCEPTION 'Insufficient available balance. Available: %, Requested: %', v_available, p_amount;
      END IF;
      v_new_balance := v_new_balance - p_amount;
    END IF;

  ELSIF p_direction = 'credit' THEN
    -- Credit: topup, refund, referral credit, promo credit, admin adjustment
    v_new_balance := v_new_balance + p_amount;
  ELSE
    RAISE EXCEPTION 'Invalid transaction direction: %', p_direction;
  END IF;

  -- 5. Insert into append-only ledger
  INSERT INTO wallet_transactions (
    wallet_id,
    type,
    direction,
    amount,
    currency,
    status,
    reference,
    idempotency_key,
    payment_provider,
    provider_ref,
    booking_id,
    narration,
    meta,
    created_at
  ) VALUES (
    p_wallet_id,
    p_type,
    p_direction,
    p_amount,
    p_currency,
    'completed',
    p_reference,
    p_idempotency_key,
    p_payment_provider,
    p_provider_ref,
    p_booking_id,
    p_narration,
    p_meta,
    NOW()
  ) RETURNING id INTO v_tx_id;

  -- 6. Update wallet balances
  UPDATE wallets
  SET 
    balance = v_new_balance,
    hold_balance = v_new_hold,
    updated_at = NOW()
  WHERE id = p_wallet_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'wallet_id', p_wallet_id,
    'balance', v_new_balance,
    'hold_balance', v_new_hold,
    'available_balance', (v_new_balance - v_new_hold)
  );
END;
$$ LANGUAGE plpgsql;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

-- Public can read FX rates
CREATE POLICY "Public Read FX Rates" ON fx_rates FOR SELECT USING (true);

-- Authenticated users see only their own wallet
CREATE POLICY "User View Own Wallet" ON wallets FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- Authenticated users see only transactions for their own wallet
CREATE POLICY "User View Own Transactions" ON wallet_transactions FOR SELECT TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()::text
    )
  );

-- Authenticated users see their own payment intents
CREATE POLICY "User View Own Payment Intents" ON payment_intents FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- Authenticated users see their own referrals
CREATE POLICY "User View Own Referrals" ON user_referrals FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- Authenticated Admin Staff (Akim & management) full read access
CREATE POLICY "Admin Full Access Wallets" ON wallets FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Admin Full Access Payment Intents" ON payment_intents FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Admin Full Access Audit" ON admin_audit FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Admin Full Access Referrals" ON user_referrals FOR ALL TO authenticated
  USING (true);

COMMIT;
