-- ==========================================================
-- TINGA TINGA SAFARI - USER WALLET SYSTEM ROLLBACK SCRIPT
-- Migration Version: 20260910_wallet_system_rollback
-- Target Database: Supabase PostgreSQL 15+
-- ==========================================================

BEGIN;

-- Drop function and triggers first
DROP TRIGGER IF EXISTS trg_immutable_wallet_transactions ON wallet_transactions;
DROP FUNCTION IF EXISTS prevent_wallet_transaction_modification();
DROP FUNCTION IF EXISTS wallet_apply_transaction(UUID, wallet_tx_type, wallet_tx_direction, NUMERIC, CHAR, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, JSONB);

-- Drop tables in proper foreign key dependency order
DROP TABLE IF EXISTS payment_intents CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS user_referrals CASCADE;
DROP TABLE IF EXISTS admin_audit CASCADE;
DROP TABLE IF EXISTS fx_rates CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;

-- Drop custom ENUM types
DROP TYPE IF EXISTS wallet_tx_status CASCADE;
DROP TYPE IF EXISTS wallet_tx_direction CASCADE;
DROP TYPE IF EXISTS wallet_tx_type CASCADE;
DROP TYPE IF EXISTS wallet_status_type CASCADE;

COMMIT;
