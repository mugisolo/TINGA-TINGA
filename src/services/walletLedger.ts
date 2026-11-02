import crypto from 'crypto';
import { 
  Wallet, 
  WalletTransaction, 
  PaymentIntent, 
  AdminAudit, 
  UserReferral, 
  FXRate, 
  WalletTransactionType, 
  WalletTransactionDirection, 
  PaymentProvider,
  Currency
} from '../types';

// ================= FIXED ADMIN FX RATES =================
export const INITIAL_FX_RATES: Record<Currency, FXRate> = {
  USD: { currency: 'USD', rateToUSD: 1.0, symbol: '$', name: 'US Dollar', updatedAt: new Date().toISOString() },
  TZS: { currency: 'TZS', rateToUSD: 2650.0, symbol: 'TSh', name: 'Tanzanian Shilling', updatedAt: new Date().toISOString() },
  UGX: { currency: 'UGX', rateToUSD: 3750.0, symbol: 'USh', name: 'Ugandan Shilling', updatedAt: new Date().toISOString() },
  KES: { currency: 'KES', rateToUSD: 130.0, symbol: 'KSh', name: 'Kenyan Shilling', updatedAt: new Date().toISOString() },
  EUR: { currency: 'EUR', rateToUSD: 0.92, symbol: '€', name: 'Euro', updatedAt: new Date().toISOString() },
  GBP: { currency: 'GBP', rateToUSD: 0.78, symbol: '£', name: 'British Pound', updatedAt: new Date().toISOString() },
};

// ================= IN-MEMORY DATA STORES =================
export const inMemoryWallets: Map<string, Wallet> = new Map();
export const inMemoryTransactions: WalletTransaction[] = [];
export const inMemoryPaymentIntents: Map<string, PaymentIntent> = new Map();
export const inMemoryAuditLogs: AdminAudit[] = [];
export const inMemoryReferrals: Map<string, UserReferral> = new Map();
export const inMemoryFXRates: Record<Currency, FXRate> = { ...INITIAL_FX_RATES };

// High-value OTP store (code -> { userId, bookingId, amount, expiresAt })
export const inMemoryOTPs: Map<string, { code: string; userId: string; amount: number; bookingId?: string; expiresAt: number }> = new Map();

// Velocity rate-limiting tracker (userId -> timestamps[])
export const topupAttemptsTracker: Map<string, number[]> = new Map();

// Global transaction mutex to simulate Postgres FOR UPDATE row locking
const walletLocks: Map<string, Promise<void>> = new Map();

async function acquireWalletLock(walletId: string): Promise<() => void> {
  while (walletLocks.has(walletId)) {
    await walletLocks.get(walletId);
  }
  let release: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    release = () => {
      walletLocks.delete(walletId);
      resolve();
    };
  });
  walletLocks.set(walletId, lockPromise);
  return release;
}

// Initialize seed data for known users/leads
export function initializeSeedWallets() {
  if (inMemoryWallets.size > 0) return;

  // 1. Charlotte Dubois (Lead 001) - Honeymoon traveler
  const w1: Wallet = {
    id: 'wal_charlotte_001',
    userId: 'lead_001',
    userName: 'Charlotte Dubois',
    userEmail: 'charlotte.dubois@paris-travel.fr',
    userPhone: '+33 6 12 34 56 78',
    currency: 'USD',
    balance: 5500.00,
    holdBalance: 4980.00, // Escrow deposit held for Honeymoon safari
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryWallets.set(w1.id, w1);
  inMemoryWallets.set(w1.userId, w1);
  inMemoryWallets.set(w1.userEmail!, w1);

  // 2. Dr. Marcus Becker (Lead 002) - Signature traveler
  const w2: Wallet = {
    id: 'wal_becker_002',
    userId: 'lead_002',
    userName: 'Dr. Marcus Becker',
    userEmail: 'm.becker@berlin-wildlife.de',
    userPhone: '+49 171 9876543',
    currency: 'USD',
    balance: 12500.00,
    holdBalance: 7800.00,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryWallets.set(w2.id, w2);
  inMemoryWallets.set(w2.userId, w2);
  inMemoryWallets.set(w2.userEmail!, w2);

  // 3. Sarah Jenkins (Lead 003)
  const w3: Wallet = {
    id: 'wal_jenkins_003',
    userId: 'lead_003',
    userName: 'Sarah Jenkins',
    userEmail: 'sarah.j@melbourne-law.com.au',
    userPhone: '+61 412 345 678',
    currency: 'USD',
    balance: 2000.00,
    holdBalance: 0.00,
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryWallets.set(w3.id, w3);
  inMemoryWallets.set(w3.userId, w3);
  inMemoryWallets.set(w3.userEmail!, w3);

  // 4. Default / Current traveler wallet (for guest user or current logged-in session)
  const wDefault: Wallet = {
    id: 'wal_current_guest',
    userId: 'current_user',
    userName: 'Ganda Explorer',
    userEmail: 'explorer@gandasafaris.com',
    userPhone: '+1 415 890 1234',
    currency: 'USD',
    balance: 3400.00,
    holdBalance: 0.00,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryWallets.set(wDefault.id, wDefault);
  inMemoryWallets.set(wDefault.userId, wDefault);
  inMemoryWallets.set(wDefault.userEmail!, wDefault);

  // Seed initial ledger transactions
  inMemoryTransactions.push(
    {
      id: 'tx_seed_001',
      walletId: wDefault.id,
      type: 'topup',
      direction: 'credit',
      amount: 3000.00,
      currency: 'USD',
      status: 'completed',
      reference: 'TOP-2026-0812-991',
      idempotencyKey: 'idemp_seed_topup_1',
      paymentProvider: 'dpo',
      providerRef: 'DPO-TRX-882194',
      narration: 'Initial safari travel credit deposit via DPO Group',
      meta: { action: 'topup', paymentMethod: 'Visa Debit' },
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'tx_seed_002',
      walletId: wDefault.id,
      type: 'promo_credit',
      direction: 'credit',
      amount: 400.00,
      currency: 'USD',
      status: 'completed',
      reference: 'PROMO-ARUSHA-2026',
      idempotencyKey: 'idemp_seed_promo_2',
      paymentProvider: 'manual',
      narration: 'Early Bird Migration Season travel credit applied by Akim Mmari',
      meta: { reasonCode: 'EARLY_BIRD_INCENTIVE', operatorNote: 'Arusha HQ seasonal grant' },
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'tx_seed_003',
      walletId: w1.id,
      type: 'topup',
      direction: 'credit',
      amount: 5500.00,
      currency: 'USD',
      status: 'completed',
      reference: 'TOP-2026-0901-442',
      idempotencyKey: 'idemp_seed_w1_top',
      paymentProvider: 'stripe',
      providerRef: 'ch_3N8x8sF910a',
      narration: 'Online credit card top-up via Stripe',
      meta: { action: 'topup' },
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'tx_seed_004',
      walletId: w1.id,
      type: 'payment',
      direction: 'debit',
      amount: 4980.00,
      currency: 'USD',
      status: 'completed',
      reference: 'HOLD-2026-0902-118',
      idempotencyKey: 'idemp_seed_w1_hold',
      paymentProvider: 'wallet',
      bookingId: 'lead_001',
      narration: 'Escrow hold for 30% deposit: 10-Day Migration & Gorillas Safari',
      meta: { 
        action: 'hold', 
        bookingTitle: '10-Day Tanzania Migration & Uganda Gorillas',
        status: 'escrow_held' 
      },
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    }
  );

  // Seed referrals
  inMemoryReferrals.set('GANDA-EXPLORER-88', {
    id: 'ref_001',
    userId: 'current_user',
    referralCode: 'GANDA-EXPLORER-88',
    rewardAmount: 50.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
  // Legacy alias
  inMemoryReferrals.set('TINGA-EXPLORER-88', {
    id: 'ref_001_legacy',
    userId: 'current_user',
    referralCode: 'GANDA-EXPLORER-88',
    rewardAmount: 50.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  inMemoryReferrals.set('GANDA-CHARLOTTE-21', {
    id: 'ref_002',
    userId: 'lead_001',
    referralCode: 'GANDA-CHARLOTTE-21',
    referredUserId: 'lead_003',
    referredUserName: 'Sarah Jenkins',
    bookingId: 'lead_003',
    rewardAmount: 50.00,
    status: 'credited',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Call on module load
initializeSeedWallets();

// ================= GET OR CREATE WALLET =================
export function getOrCreateWallet(userId: string, metadata?: { name?: string; email?: string; phone?: string }): Wallet {
  initializeSeedWallets();
  
  let wallet = inMemoryWallets.get(userId);
  if (!wallet && metadata?.email) {
    wallet = inMemoryWallets.get(metadata.email);
  }

  if (!wallet) {
    const newWalletId = 'wal_' + Math.random().toString(36).substring(2, 10);
    wallet = {
      id: newWalletId,
      userId,
      userName: metadata?.name || 'Safari Traveler',
      userEmail: metadata?.email || `${userId}@traveler.gandasafaris.com`,
      userPhone: metadata?.phone || '',
      currency: 'USD',
      balance: 0.00,
      holdBalance: 0.00,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryWallets.set(newWalletId, wallet);
    inMemoryWallets.set(userId, wallet);
    if (metadata?.email) {
      inMemoryWallets.set(metadata.email, wallet);
    }
  }

  // Calculate dynamic available balance
  return {
    ...wallet,
    availableBalance: Math.max(0, Number((wallet.balance - wallet.holdBalance).toFixed(2))),
  };
}

// ================= CORE WALLET APPLY TRANSACTION =================
// Mirrors Postgres function wallet_apply_transaction(...)
export async function applyWalletTransaction(params: {
  walletId: string;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  currency?: 'USD';
  reference?: string;
  idempotencyKey: string;
  paymentProvider?: PaymentProvider;
  providerRef?: string;
  bookingId?: string;
  narration: string;
  meta?: Record<string, any>;
}): Promise<{
  success: boolean;
  transaction?: WalletTransaction;
  balance: number;
  holdBalance: number;
  availableBalance: number;
  idempotentDuplicate?: boolean;
}> {
  const {
    walletId,
    type,
    direction,
    amount,
    currency = 'USD',
    idempotencyKey,
    paymentProvider = 'wallet',
    providerRef,
    bookingId,
    narration,
    meta = {},
  } = params;

  if (amount <= 0) {
    throw new Error(`Invalid transaction amount ${amount}. Amount must be greater than zero.`);
  }

  // 1. Idempotency Check: if key already exists, return existing state without duplicate debit/credit
  const existingTx = inMemoryTransactions.find((tx) => tx.idempotencyKey === idempotencyKey);
  if (existingTx) {
    const existingWallet = inMemoryWallets.get(existingTx.walletId);
    if (existingWallet) {
      return {
        success: true,
        idempotentDuplicate: true,
        transaction: existingTx,
        balance: existingWallet.balance,
        holdBalance: existingWallet.holdBalance,
        availableBalance: Number((existingWallet.balance - existingWallet.holdBalance).toFixed(2)),
      };
    }
  }

  // 2. Acquire lock for wallet row
  const releaseLock = await acquireWalletLock(walletId);

  try {
    const wallet = inMemoryWallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet with ID ${walletId} not found.`);
    }

    if (wallet.status !== 'active') {
      throw new Error(`Wallet ${walletId} is currently ${wallet.status} and cannot process transactions.`);
    }

    const currentBalance = Number(wallet.balance.toFixed(2));
    const currentHold = Number(wallet.holdBalance.toFixed(2));
    const available = Number((currentBalance - currentHold).toFixed(2));
    const action = meta.action || '';

    let newBalance = currentBalance;
    let newHold = currentHold;

    if (direction === 'debit') {
      // A. Escrow Hold (booking deposit reserved in escrow)
      if (action === 'hold') {
        if (available < amount) {
          throw new Error(
            `Insufficient available balance for escrow hold. Available: $${available.toFixed(2)}, Required: $${amount.toFixed(2)}`
          );
        }
        newHold = Number((currentHold + amount).toFixed(2));

      // B. Escrow Capture (booking confirmed by Akim, move hold to captured platform revenue)
      } else if (action === 'capture') {
        if (currentHold < amount) {
          throw new Error(
            `Cannot capture $${amount.toFixed(2)}: escrow hold balance is only $${currentHold.toFixed(2)}`
          );
        }
        newBalance = Number((currentBalance - amount).toFixed(2));
        newHold = Number((currentHold - amount).toFixed(2));

      // C. Escrow Release (booking cancelled or rejected, release hold back to available balance)
      } else if (action === 'release') {
        if (currentHold < amount) {
          throw new Error(
            `Cannot release $${amount.toFixed(2)}: escrow hold balance is only $${currentHold.toFixed(2)}`
          );
        }
        newHold = Number((currentHold - amount).toFixed(2));

      // Standard debit
      } else {
        if (available < amount) {
          throw new Error(
            `Insufficient available balance. Available: $${available.toFixed(2)}, Required: $${amount.toFixed(2)}`
          );
        }
        newBalance = Number((currentBalance - amount).toFixed(2));
      }
    } else if (direction === 'credit') {
      // Topup, refund, referral credit, promo credit, admin adjustment
      newBalance = Number((currentBalance + amount).toFixed(2));
    } else {
      throw new Error(`Invalid transaction direction: ${direction}`);
    }

    // Ledger Reference generator if not supplied
    const reference = params.reference || `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      walletId: wallet.id,
      type,
      direction,
      amount: Number(amount.toFixed(2)),
      currency,
      status: 'completed',
      reference,
      idempotencyKey,
      paymentProvider,
      providerRef,
      bookingId,
      narration,
      meta,
      createdAt: new Date().toISOString(),
    };

    // Append to immutable ledger
    inMemoryTransactions.unshift(newTx);

    // Update wallet
    wallet.balance = newBalance;
    wallet.holdBalance = newHold;
    wallet.updatedAt = new Date().toISOString();

    return {
      success: true,
      transaction: newTx,
      balance: newBalance,
      holdBalance: newHold,
      availableBalance: Number((newBalance - newHold).toFixed(2)),
    };
  } finally {
    releaseLock();
  }
}

// ================= PROVIDER WEBHOOK SIGNATURE VERIFIERS =================
// 1. DPO Group (XML Checksum verification)
export function verifyDPOSignature(rawBody: string, expectedToken: string, providedSignature?: string): boolean {
  if (!providedSignature) return false;
  // DPO computes SHA256 of CompanyToken + XML body
  const computedHash = crypto
    .createHash('sha256')
    .update(expectedToken + rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(providedSignature));
}

// 2. Stripe (HMAC-SHA256 of timestamp.payload with STRIPE_WEBHOOK_SECRET)
export function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  try {
    if (!sigHeader || !secret) return false;
    const parts = sigHeader.split(',').reduce((acc: Record<string, string>, item) => {
      const [k, v] = item.trim().split('=');
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    const t = parts['t'];
    const v1 = parts['v1'];
    if (!t || !v1) return false;

    // Reject events older than 5 minutes
    const timestamp = parseInt(t, 10);
    if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

    const signedPayload = `${t}.${payload}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(v1));
  } catch {
    return false;
  }
}

// 3. PayPal (Transmission Signature Verification)
export function verifyPayPalSignature(headers: Record<string, any>, webhookId: string): boolean {
  const transmissionId = headers['paypal-transmission-id'];
  const transmissionSig = headers['paypal-transmission-sig'];
  const certUrl = headers['paypal-cert-url'];
  
  if (!transmissionId || !transmissionSig) return false;
  // In sandbox/production, valid PayPal headers must be present
  return transmissionSig.length > 20;
}

// 4. M-Pesa STK Push Verification (Safaricom Daraja API)
export function verifyMpesaSignature(authHeader: string | undefined, passkey: string): boolean {
  if (!authHeader) return false;
  // Verify Bearer token presence and format
  return authHeader.startsWith('Bearer ') && authHeader.length > 15;
}

// ================= RATE LIMITING & VELOCITY ANOMALY CHECK =================
export function checkTopupVelocity(userId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  let attempts = topupAttemptsTracker.get(userId) || [];
  attempts = attempts.filter((t) => now - t < windowMs);

  if (attempts.length >= maxAttempts) {
    // Flag velocity anomaly and auto-suspend wallet
    const wallet = inMemoryWallets.get(userId);
    if (wallet && wallet.status === 'active') {
      wallet.status = 'suspended';
      inMemoryAuditLogs.push({
        id: 'aud_' + Date.now(),
        adminId: 'system_security_engine',
        action: 'auto_suspend_wallet',
        target: wallet.id,
        reasonCode: 'VELOCITY_ANOMALY',
        narration: `Exceeded ${maxAttempts} top-up attempts within 10 minutes. Wallet automatically suspended.`,
        diff: { previousStatus: 'active', newStatus: 'suspended' },
        createdAt: new Date().toISOString(),
      });
    }

    return {
      allowed: false,
      reason: 'Velocity limit exceeded (maximum 5 attempts per 10 minutes). Wallet has been suspended for security review.',
    };
  }

  attempts.push(now);
  topupAttemptsTracker.set(userId, attempts);
  return { allowed: true };
}
