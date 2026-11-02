import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { ITINERARIES, PERMITS_DATA, GROUND_PARTNERS, REVIEWS, TEAM_MEMBERS } from './src/data/seedData';
import { TINGA_ASSISTANT_SYSTEM_PROMPT } from './src/config/systemPrompt';
import { Lead, ChatSession, ChatMessage } from './src/types';
import { 
  getOrCreateWallet, 
  applyWalletTransaction, 
  inMemoryWallets, 
  inMemoryTransactions, 
  inMemoryPaymentIntents, 
  inMemoryAuditLogs, 
  inMemoryReferrals, 
  inMemoryFXRates, 
  inMemoryOTPs, 
  checkTopupVelocity, 
  verifyDPOSignature, 
  verifyStripeSignature, 
  verifyPayPalSignature, 
  verifyMpesaSignature 
} from './src/services/walletLedger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent stores for leads and chat sessions
let inMemoryLeads: Lead[] = [
  {
    id: 'lead_001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'new',
    source: 'trip_planner',
    name: 'Charlotte Dubois',
    email: 'charlotte.dubois@paris-travel.fr',
    phone: '+33 6 12 34 56 78',
    countries: ['Tanzania', 'Uganda'],
    budgetBand: 'Luxury',
    travelersCount: 2,
    targetDates: 'August 2025',
    notes: 'Honeymoon safari: Great Migration in Serengeti + 2 Uganda Gorilla Permits in Bwindi.',
    depositAmountUSD: 4980,
  },
  {
    id: 'lead_002',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'deposit_paid',
    source: 'web_chat',
    name: 'Dr. Marcus Becker',
    email: 'm.becker@berlin-wildlife.de',
    phone: '+49 171 9876543',
    countries: ['Tanzania'],
    budgetBand: 'Signature / Ultra-Luxe',
    travelersCount: 4,
    targetDates: 'October 2025',
    notes: '30% Deposit Paid ($7,800 USD) via DPO Group. Needs 2 custom Land Cruisers with camera beanbags.',
    depositAmountUSD: 7800,
  },
  {
    id: 'lead_003',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'quote_sent',
    source: 'contact_page',
    name: 'Sarah & Liam Jenkins',
    email: 'sarah.j@melbourne-law.com.au',
    phone: '+61 412 345 678',
    countries: ['Rwanda', 'Uganda'],
    budgetBand: 'Luxury',
    travelersCount: 2,
    targetDates: 'January 2026',
    notes: 'Primate focus: Volcanoes NP gorilla trek + Kibale chimps. Quote sent by Akim.',
  },
];

let inMemorySessions: Record<string, ChatSession> = {};

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    operator: 'Ganda Safaris (Arusha, Tanzania)',
    timeEAT: new Date().toISOString(),
  });
});

// Itineraries
app.get('/api/itineraries', (req, res) => {
  res.json(ITINERARIES);
});

app.get('/api/itineraries/:slug', (req, res) => {
  const item = ITINERARIES.find((it) => it.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Itinerary not found' });
  res.json(item);
});

// Permits
app.get('/api/permits', (req, res) => {
  res.json(PERMITS_DATA);
});

// Ground Partners
app.get('/api/partners', (req, res) => {
  res.json(GROUND_PARTNERS);
});

// Reviews
app.get('/api/reviews', (req, res) => {
  res.json(REVIEWS);
});

// Leads
app.get('/api/leads', (req, res) => {
  res.json(inMemoryLeads);
});

app.post('/api/leads', (req, res) => {
  const newLead: Lead = {
    id: 'lead_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: req.body.status || 'new',
    source: req.body.source || 'trip_planner',
    name: req.body.name || 'Anonymous Traveler',
    email: req.body.email || '',
    phone: req.body.phone,
    countries: req.body.countries,
    budgetBand: req.body.budgetBand,
    travelersCount: req.body.travelersCount,
    targetDates: req.body.targetDates,
    notes: req.body.notes,
    depositAmountUSD: req.body.depositAmountUSD,
  };

  inMemoryLeads.unshift(newLead);
  res.status(201).json(newLead);
});

app.patch('/api/leads/:id/status', (req, res) => {
  const lead = inMemoryLeads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  lead.status = req.body.status;
  lead.updatedAt = new Date().toISOString();
  res.json(lead);
});

// Chat Sessions for Admin Inspector
app.get('/api/chat/sessions', (req, res) => {
  res.json(Object.values(inMemorySessions));
});

// Analytics Event Telemetry
app.post('/api/analytics/event', (req, res) => {
  console.log(`[Analytics Event] ${req.body.event}:`, req.body.payload || {});
  res.json({ tracked: true });
});

// WhatsApp Cloud API Webhook verification & incoming
app.get('/api/waba/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WABA_VERIFY_TOKEN || 'tinga_safari_secret')) {
    console.log('[WABA] Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/waba/webhook', (req, res) => {
  console.log('[WABA] Incoming event payload:', JSON.stringify(req.body).substring(0, 200));
  res.status(200).send('EVENT_RECEIVED');
});

// ================= USER WALLET API ENDPOINTS =================

// 1. Get Wallet
app.get('/api/wallet', (req, res) => {
  const userId = (req.query.userId as string) || 'current_user';
  const email = req.query.email as string;
  const name = req.query.name as string;
  const wallet = getOrCreateWallet(userId, { email, name });
  res.json(wallet);
});

// 2. Get Transaction Ledger
app.get('/api/wallet/transactions', (req, res) => {
  const userId = (req.query.userId as string) || 'current_user';
  const wallet = getOrCreateWallet(userId);
  const type = req.query.type as string;
  const direction = req.query.direction as string;
  const search = (req.query.search as string || '').toLowerCase();
  const limit = parseInt(req.query.limit as string, 10) || 50;

  let txs = inMemoryTransactions.filter((tx) => tx.walletId === wallet.id);

  if (type && type !== 'all') {
    txs = txs.filter((tx) => tx.type === type);
  }
  if (direction && direction !== 'all') {
    txs = txs.filter((tx) => tx.direction === direction);
  }
  if (search) {
    txs = txs.filter((tx) => 
      tx.narration.toLowerCase().includes(search) || 
      tx.reference.toLowerCase().includes(search) ||
      (tx.providerRef && tx.providerRef.toLowerCase().includes(search))
    );
  }

  res.json({
    walletId: wallet.id,
    count: txs.length,
    transactions: txs.slice(0, limit),
  });
});

// 3. Create Top-up Payment Intent
app.post('/api/wallet/topup/intent', (req, res) => {
  const { userId = 'current_user', amount, provider = 'dpo', currency = 'USD' } = req.body;
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount < 50 || parsedAmount > 10000) {
    return res.status(400).json({ 
      error: 'Invalid top-up amount. Minimum deposit is $50 USD and maximum is $10,000 USD per transaction.' 
    });
  }

  // Velocity anomaly and rate-limiting check (5 attempts per 10 mins)
  const velocityCheck = checkTopupVelocity(userId);
  if (!velocityCheck.allowed) {
    return res.status(429).json({ error: velocityCheck.reason });
  }

  const wallet = getOrCreateWallet(userId);
  if (wallet.status !== 'active') {
    return res.status(403).json({ error: `Wallet is ${wallet.status}. Please contact Akim at Arusha HQ.` });
  }

  const intentId = 'pi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const idempotencyKey = req.body.idempotencyKey || `idemp_${intentId}`;

  const intent = {
    id: intentId,
    walletId: wallet.id,
    userId,
    provider,
    amount: parsedAmount,
    currency: 'USD' as const,
    status: 'pending' as const,
    webhookVerified: false,
    idempotencyKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryPaymentIntents.set(intentId, intent);

  // Return checkout URL and provider details
  const checkoutUrl = `/wallet/checkout?intent_id=${intentId}&provider=${provider}&amount=${parsedAmount}`;

  res.status(201).json({
    intentId,
    checkoutUrl,
    amount: parsedAmount,
    currency: 'USD',
    provider,
    idempotencyKey,
    message: `Payment intent created for $${parsedAmount} USD via ${provider.toUpperCase()}`,
  });
});

// 4. Instant Simulation of Top-up completion (for testing/demo without live merchant webhooks)
app.post('/api/wallet/simulate-topup', async (req, res) => {
  try {
    const { userId = 'current_user', amount, provider = 'dpo', idempotencyKey } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 50 || parsedAmount > 10000) {
      return res.status(400).json({ error: 'Top-up amount must be between $50 and $10,000 USD.' });
    }

    const wallet = getOrCreateWallet(userId);
    const key = idempotencyKey || `sim_topup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ref = `TOP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const result = await applyWalletTransaction({
      walletId: wallet.id,
      type: 'topup',
      direction: 'credit',
      amount: parsedAmount,
      currency: 'USD',
      reference: ref,
      idempotencyKey: key,
      paymentProvider: provider,
      providerRef: `${provider.toUpperCase()}-SIM-${Date.now().toString().slice(-4)}`,
      narration: `Safari credit top-up via ${provider.toUpperCase()}`,
      meta: { action: 'topup', provider },
    });

    res.json({
      success: true,
      wallet: getOrCreateWallet(userId),
      transaction: result.transaction,
      message: `Successfully credited $${parsedAmount} USD to your safari wallet.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Pay Deposit with Wallet (Escrow Hold)
app.post('/api/wallet/pay-deposit', async (req, res) => {
  try {
    const { userId = 'current_user', bookingId, amount, confirmed = true } = req.body;
    const otpCode = req.body.otpCode || req.body.otp;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount.' });
    }

    const wallet = getOrCreateWallet(userId);
    const available = Number((wallet.balance - wallet.holdBalance).toFixed(2));

    if (available < parsedAmount) {
      return res.status(400).json({
        error: 'Insufficient available wallet balance.',
        availableBalance: available,
        requiredAmount: parsedAmount,
        shortfall: Number((parsedAmount - available).toFixed(2)),
      });
    }

    // High-value check: If transaction > $500, require 6-digit OTP verification
    if (parsedAmount > 500 && !otpCode) {
      const generatedCode = '784' + Math.floor(Math.random() * 900 + 100);
      inMemoryOTPs.set(userId, {
        code: generatedCode,
        userId,
        amount: parsedAmount,
        bookingId,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return res.json({
        requiresOtp: true,
        message: `High-value safari transaction ($${parsedAmount} USD). A 6-digit OTP code has been dispatched to your verified contact.`,
        simulatedOtp: generatedCode, // Exposed in demo environment for convenience
      });
    }

    // If OTP was submitted, verify it
    if (parsedAmount > 500 && otpCode) {
      const stored = inMemoryOTPs.get(userId);
      if (!stored || stored.code !== otpCode || Date.now() > stored.expiresAt) {
        return res.status(400).json({ error: 'Invalid or expired OTP verification code.' });
      }
      inMemoryOTPs.delete(userId);
    }

    // Apply escrow hold
    const ref = `HOLD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const idempotencyKey = `hold_${bookingId || 'custom'}_${Date.now()}`;

    const result = await applyWalletTransaction({
      walletId: wallet.id,
      type: 'payment',
      direction: 'debit',
      amount: parsedAmount,
      currency: 'USD',
      reference: ref,
      idempotencyKey,
      paymentProvider: 'wallet',
      bookingId,
      narration: `Escrow hold for 30% deposit on safari booking #${bookingId || 'custom'}`,
      meta: { 
        action: 'hold', 
        bookingId,
        status: 'escrow_held',
        transparencyNotice: 'Held in escrow until Akim confirms lodge reservations & gorilla permits.'
      },
    });

    // Update existing lead or create lead status
    let lead = inMemoryLeads.find((l) => l.id === bookingId);
    if (lead) {
      lead.status = 'deposit_paid';
      lead.depositAmountUSD = parsedAmount;
      lead.updatedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      message: `Deposit of $${parsedAmount} USD placed in escrow hold. Akim’s team will verify lodge inventory and statutory permits within 12 hours.`,
      transaction: result.transaction,
      balance: result.balance,
      holdBalance: result.holdBalance,
      availableBalance: result.availableBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. User Referral Code & Stats
app.get('/api/wallet/referral', (req, res) => {
  const userId = (req.query.userId as string) || 'current_user';
  let referral = Array.from(inMemoryReferrals.values()).find((r) => r.userId === userId);

  if (!referral) {
    const code = 'GANDA-' + (userId.toUpperCase().slice(0, 4) || 'SAF') + '-' + Math.floor(Math.random() * 90 + 10);
    referral = {
      id: 'ref_' + Date.now(),
      userId,
      referralCode: code,
      rewardAmount: 50.00,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryReferrals.set(code, referral);
  }

  const allUserReferrals = Array.from(inMemoryReferrals.values()).filter((r) => r.userId === userId);
  const creditedCount = allUserReferrals.filter((r) => r.status === 'credited').length;
  const totalEarned = creditedCount * 50;

  res.json({
    referralCode: referral.referralCode,
    rewardPerFriendUSD: 50.00,
    totalReferrals: allUserReferrals.length,
    successfulBookings: creditedCount,
    totalCreditsEarnedUSD: totalEarned,
    shareUrl: `https://gandasafaris.com/?ref=${referral.referralCode}`,
    terms: 'Earn $50 USD in safari travel credits when a friend books their first circuit with Ganda Safaris.',
  });
});

// 7. Monthly Statement Generator Data
app.get('/api/wallet/statement', (req, res) => {
  const userId = (req.query.userId as string) || 'current_user';
  const wallet = getOrCreateWallet(userId);
  const userTxs = inMemoryTransactions.filter((tx) => tx.walletId === wallet.id);

  const totalCredits = userTxs
    .filter((tx) => tx.direction === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = userTxs
    .filter((tx) => tx.direction === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  res.json({
    operator: 'Ganda Safaris and Holiday Ltd',
    headquarters: 'Clock Tower Roundabout, P.O. Box 2751, Arusha, Tanzania',
    license: 'TTBL-TZ-2018-842',
    statementDate: new Date().toISOString(),
    period: 'Current Active Statement',
    walletId: wallet.id,
    accountHolder: wallet.userName || 'Valued Safari Traveler',
    accountEmail: wallet.userEmail,
    currency: 'USD',
    openingBalance: 0.00,
    totalCredits: Number(totalCredits.toFixed(2)),
    totalDebits: Number(totalDebits.toFixed(2)),
    currentBalance: wallet.balance,
    holdBalance: wallet.holdBalance,
    availableBalance: wallet.availableBalance,
    transactions: userTxs,
  });
});

// 8. Display FX Rates Switcher
app.get('/api/wallet/fx-rates', (req, res) => {
  res.json(inMemoryFXRates);
});

// Admin update FX rate
app.patch('/api/wallet/fx-rates', (req, res) => {
  const { currency, rateToUSD } = req.body;
  if (!currency || !rateToUSD || !inMemoryFXRates[currency as any]) {
    return res.status(400).json({ error: 'Invalid currency or rate.' });
  }

  inMemoryFXRates[currency as any].rateToUSD = parseFloat(rateToUSD);
  inMemoryFXRates[currency as any].updatedAt = new Date().toISOString();

  inMemoryAuditLogs.push({
    id: 'aud_' + Date.now(),
    adminId: req.body.adminId || 'akim_mmari',
    action: 'update_fx_rate',
    target: currency,
    narration: `Updated ${currency} rate to ${rateToUSD}`,
    diff: { currency, rateToUSD },
    createdAt: new Date().toISOString(),
  });

  res.json(inMemoryFXRates[currency as any]);
});

// ================= PROVIDER WEBHOOKS (WITH SIGNATURE VERIFICATION) =================

// 1. DPO Group Webhook
app.post('/api/wallet/webhooks/dpo', async (req, res) => {
  const signature = req.headers['x-dpo-signature'] as string;
  const companyToken = process.env.DPO_COMPANY_TOKEN || 'tinga_dpo_secret_token';
  const rawBody = JSON.stringify(req.body);

  // Signature check
  if (process.env.NODE_ENV === 'production' && !verifyDPOSignature(rawBody, companyToken, signature)) {
    return res.status(401).json({ error: 'Invalid DPO signature' });
  }

  const { TransactionToken, Result, ResultExplanation, CustomerName, Amount, Currency: dpoCurrency, IdempotencyKey } = req.body;
  
  if (Result === '000' || Result === 'OK') {
    try {
      const wallet = getOrCreateWallet('current_user', { name: CustomerName });
      const amount = parseFloat(Amount || '0');
      const key = IdempotencyKey || `dpo_tx_${TransactionToken}`;

      await applyWalletTransaction({
        walletId: wallet.id,
        type: 'topup',
        direction: 'credit',
        amount,
        currency: 'USD',
        reference: `DPO-${TransactionToken}`,
        idempotencyKey: key,
        paymentProvider: 'dpo',
        providerRef: TransactionToken,
        narration: `DPO Group deposit confirmed: ${ResultExplanation || 'Successful payment'}`,
        meta: { action: 'topup', rawResult: Result },
      });

      console.log(`[WABA Notification] Dispatched topup_success HSM template to guest for $${amount} USD.`);
      return res.status(200).send('<API3G><Response>OK</Response></API3G>');
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(200).send('<API3G><Response>REJECTED</Response></API3G>');
});

// 2. Stripe Webhook
app.post('/api/wallet/webhooks/stripe', async (req, res) => {
  const sigHeader = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_tinga_demo';
  const rawBody = JSON.stringify(req.body);

  if (process.env.NODE_ENV === 'production' && !verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
    return res.status(401).json({ error: 'Invalid Stripe signature' });
  }

  const event = req.body;
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const amount = (pi.amount || 0) / 100;
    const customerEmail = pi.receipt_email || pi.customer_details?.email;
    const wallet = getOrCreateWallet(customerEmail || 'current_user');

    try {
      await applyWalletTransaction({
        walletId: wallet.id,
        type: 'topup',
        direction: 'credit',
        amount,
        currency: 'USD',
        reference: `STRIPE-${pi.id}`,
        idempotencyKey: `stripe_${pi.id}`,
        paymentProvider: 'stripe',
        providerRef: pi.id,
        narration: 'Online credit card deposit via Stripe',
        meta: { action: 'topup' },
      });
      console.log(`[WABA Notification] Dispatched topup_success HSM to ${customerEmail}`);
    } catch (e: any) {
      console.error('[Stripe Webhook] Error:', e.message);
    }
  }

  res.json({ received: true });
});

// 3. PayPal Webhook
app.post('/api/wallet/webhooks/paypal', async (req, res) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'wh_paypal_demo';
  if (process.env.NODE_ENV === 'production' && !verifyPayPalSignature(req.headers, webhookId)) {
    return res.status(401).json({ error: 'Invalid PayPal transmission signature' });
  }

  const { event_type, resource } = req.body;
  if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const amount = parseFloat(resource.amount?.value || '0');
    const payerEmail = resource.payer?.email_address;
    const wallet = getOrCreateWallet(payerEmail || 'current_user');

    try {
      await applyWalletTransaction({
        walletId: wallet.id,
        type: 'topup',
        direction: 'credit',
        amount,
        currency: 'USD',
        reference: `PAYPAL-${resource.id}`,
        idempotencyKey: `paypal_${resource.id}`,
        paymentProvider: 'paypal',
        providerRef: resource.id,
        narration: 'PayPal deposit confirmed',
        meta: { action: 'topup' },
      });
      console.log(`[WABA Notification] Dispatched topup_success HSM to ${payerEmail}`);
    } catch (e: any) {
      console.error('[PayPal Webhook] Error:', e.message);
    }
  }

  res.json({ status: 'success' });
});

// 4. M-Pesa Daraja STK Push Callback
app.post('/api/wallet/webhooks/mpesa', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const passkey = process.env.MPESA_PASSKEY || 'mpesa_passkey_demo';

  if (process.env.NODE_ENV === 'production' && !verifyMpesaSignature(authHeader, passkey)) {
    return res.status(401).json({ error: 'Unauthorized M-Pesa request' });
  }

  const { Body } = req.body;
  const stkCallback = Body?.stkCallback;

  if (stkCallback && stkCallback.ResultCode === 0) {
    const items = stkCallback.CallbackMetadata?.Item || [];
    const amountItem = items.find((i: any) => i.Name === 'Amount');
    const mpesaReceiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber');
    const phoneItem = items.find((i: any) => i.Name === 'PhoneNumber');

    const amountKES = amountItem?.Value || 0;
    const usdAmount = Number((amountKES / 130).toFixed(2)); // Converted at fixed KES rate
    const receipt = mpesaReceiptItem?.Value || 'MPESA_' + Date.now();
    const phone = phoneItem?.Value?.toString() || '';

    const wallet = getOrCreateWallet('current_user', { phone });

    try {
      await applyWalletTransaction({
        walletId: wallet.id,
        type: 'topup',
        direction: 'credit',
        amount: usdAmount,
        currency: 'USD',
        reference: `MPESA-${receipt}`,
        idempotencyKey: `mpesa_${receipt}`,
        paymentProvider: 'mpesa',
        providerRef: receipt,
        narration: `M-Pesa STK Mobile Money deposit (KES ${amountKES.toLocaleString()} / $${usdAmount} USD)`,
        meta: { action: 'topup', phone, amountKES },
      });
      console.log(`[WABA Notification] Dispatched topup_success HSM to +${phone}`);
    } catch (e: any) {
      console.error('[M-Pesa Webhook] Error:', e.message);
    }
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ================= ADMIN WALLET CONTROLS =================

// Admin List Wallets
app.get('/api/admin/wallets', (req, res) => {
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;

  let walletsList = Array.from(inMemoryWallets.values()).filter(
    // Filter duplicates because email/id can point to same object
    (w, idx, self) => self.findIndex((x) => x.id === w.id) === idx
  );

  if (status && status !== 'all') {
    walletsList = walletsList.filter((w) => w.status === status);
  }
  if (search) {
    walletsList = walletsList.filter(
      (w) =>
        (w.userName && w.userName.toLowerCase().includes(search)) ||
        (w.userEmail && w.userEmail.toLowerCase().includes(search)) ||
        w.id.toLowerCase().includes(search)
    );
  }

  res.json(walletsList);
});

// Admin Manual Balance Adjustment (Credit/Debit)
app.post('/api/admin/wallets/:id/adjustment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, direction, reasonCode, narration, adminId = 'akim_mmari' } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive adjustment amount is required.' });
    }
    if (!reasonCode || !narration) {
      return res.status(400).json({ error: 'Reason code and detailed narration are mandatory for auditing.' });
    }

    const wallet = inMemoryWallets.get(id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const ref = `ADJ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const result = await applyWalletTransaction({
      walletId: wallet.id,
      type: 'admin_adjustment',
      direction: direction === 'debit' ? 'debit' : 'credit',
      amount: parsedAmount,
      currency: 'USD',
      reference: ref,
      idempotencyKey: `adj_${id}_${Date.now()}`,
      paymentProvider: 'manual',
      narration: `[Admin Adjustment] ${narration} (${reasonCode})`,
      meta: { reasonCode, adminId, operatorNote: narration },
    });

    inMemoryAuditLogs.push({
      id: 'aud_' + Date.now(),
      adminId,
      action: `manual_${direction}`,
      target: wallet.id,
      reasonCode,
      narration,
      diff: { amount: parsedAmount, direction, newBalance: result.balance },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      wallet: getOrCreateWallet(wallet.userId),
      transaction: result.transaction,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Suspend or Unsuspend Wallet
app.post('/api/admin/wallets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, reason, adminId = 'akim_mmari' } = req.body;

  if (!['active', 'suspended', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid wallet status' });
  }

  const wallet = inMemoryWallets.get(id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const previousStatus = wallet.status;
  wallet.status = status;
  wallet.updatedAt = new Date().toISOString();

  inMemoryAuditLogs.push({
    id: 'aud_' + Date.now(),
    adminId,
    action: `set_status_${status}`,
    target: wallet.id,
    reasonCode: 'STATUS_UPDATE',
    narration: reason || `Wallet status changed from ${previousStatus} to ${status}`,
    diff: { previousStatus, newStatus: status },
    createdAt: new Date().toISOString(),
  });

  res.json(wallet);
});

// Admin Escrow Capture (Akim confirms lodge & gorilla permits)
app.post('/api/admin/bookings/:id/capture', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, adminId = 'akim_mmari' } = req.body;
    const lead = inMemoryLeads.find((l) => l.id === id);
    const depositAmount = parseFloat(amount) || lead?.depositAmountUSD || 0;

    if (!lead || depositAmount <= 0) {
      return res.status(400).json({ error: 'Booking or valid deposit amount not found.' });
    }

    const wallet = getOrCreateWallet(lead.id, { email: lead.email, name: lead.name });
    
    await applyWalletTransaction({
      walletId: wallet.id,
      type: 'payment',
      direction: 'debit',
      amount: depositAmount,
      reference: `CAP-${id}-${Date.now().toString().slice(-4)}`,
      idempotencyKey: `cap_${id}_${Date.now()}`,
      bookingId: lead.id,
      narration: `Escrow capture confirmed by founder Akim Mmari: official permits & lodge booked for ${lead.name}`,
      meta: { action: 'capture', bookingId: lead.id },
    });

    lead.status = 'confirmed';
    lead.updatedAt = new Date().toISOString();

    inMemoryAuditLogs.push({
      id: 'aud_' + Date.now(),
      adminId,
      action: 'escrow_captured',
      target: lead.id,
      reasonCode: 'SAFARI_CONFIRMED',
      narration: `Deposit of $${depositAmount} captured. Permits & lodges secured.`,
      diff: { bookingId: lead.id, depositAmount },
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, lead, wallet: getOrCreateWallet(wallet.userId) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Escrow Release (Booking cancelled/rejected)
app.post('/api/admin/bookings/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason = 'Trip cancelled prior to permit purchase', adminId = 'akim_mmari' } = req.body;
    const lead = inMemoryLeads.find((l) => l.id === id);
    const releaseAmount = parseFloat(amount) || lead?.depositAmountUSD || 0;

    if (!lead || releaseAmount <= 0) {
      return res.status(400).json({ error: 'Booking or valid deposit amount not found.' });
    }

    const wallet = getOrCreateWallet(lead.id, { email: lead.email, name: lead.name });

    await applyWalletTransaction({
      walletId: wallet.id,
      type: 'payment',
      direction: 'debit',
      amount: releaseAmount,
      reference: `REL-${id}-${Date.now().toString().slice(-4)}`,
      idempotencyKey: `rel_${id}_${Date.now()}`,
      bookingId: lead.id,
      narration: `Escrow released back to traveler available balance: ${reason}`,
      meta: { action: 'release', reason },
    });

    lead.status = 'cancelled';
    lead.updatedAt = new Date().toISOString();

    res.json({ success: true, lead, wallet: getOrCreateWallet(wallet.userId) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Refund Processing (To Wallet or Provider)
app.post('/api/admin/bookings/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, refundTo = 'wallet', reasonCode = 'TRIP_CANCELLED', narration = 'Customer refund approved', adminId = 'akim_mmari' } = req.body;
    const lead = inMemoryLeads.find((l) => l.id === id);
    const refundAmount = parseFloat(amount) || lead?.depositAmountUSD || 0;

    if (!lead || refundAmount <= 0) {
      return res.status(400).json({ error: 'Booking or valid refund amount not found.' });
    }

    const wallet = getOrCreateWallet(lead.id, { email: lead.email, name: lead.name });

    if (refundTo === 'wallet') {
      await applyWalletTransaction({
        walletId: wallet.id,
        type: 'refund',
        direction: 'credit',
        amount: refundAmount,
        currency: 'USD',
        reference: `REF-${id}-${Date.now().toString().slice(-4)}`,
        idempotencyKey: `ref_${id}_${Date.now()}`,
        bookingId: lead.id,
        narration: `Refund credited to safari wallet: ${narration} (${reasonCode})`,
        meta: { action: 'refund', reasonCode, refundTo: 'wallet' },
      });
    }

    lead.status = 'refunded';
    lead.updatedAt = new Date().toISOString();

    inMemoryAuditLogs.push({
      id: 'aud_' + Date.now(),
      adminId,
      action: 'process_refund',
      target: lead.id,
      reasonCode,
      narration: `${refundTo.toUpperCase()} refund of $${refundAmount} for ${lead.name}: ${narration}`,
      diff: { refundAmount, refundTo, reasonCode },
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, lead, wallet: getOrCreateWallet(wallet.userId) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Audit Logs List
app.get('/api/admin/audit', (req, res) => {
  res.json(inMemoryAuditLogs);
});

// Admin Wallet Settings
let inMemoryWalletSettings = {
  referralRewardUSD: 50.00,
  minTopupUSD: 50.00,
  maxTopupUSD: 10000.00,
  escrowHoldMaxDays: 30,
  wabaAutoNotify: true,
  requireOtpAboveUSD: 500.00,
};

app.get('/api/admin/wallet/settings', (req, res) => {
  res.json(inMemoryWalletSettings);
});

app.patch('/api/admin/wallet/settings', (req, res) => {
  inMemoryWalletSettings = { ...inMemoryWalletSettings, ...req.body };
  res.json(inMemoryWalletSettings);
});

// ================= GEMINI AGENTIC CHAT ENGINE =================

// Tool declarations for Gemini Function Calling
const safariTools: FunctionDeclaration[] = [
  {
    name: 'search_itineraries',
    description: 'Search official Ganda Safaris circuits across Tanzania, Uganda, Rwanda, Kenya, or Cross-Border.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        country: { type: Type.STRING, description: 'Tanzania, Uganda, Rwanda, or Kenya' },
        maxDays: { type: Type.NUMBER, description: 'Maximum days' },
        interests: { type: Type.STRING, description: 'Keywords like migration, gorillas, cats, photography' },
      },
    },
  },
  {
    name: 'get_permit_info',
    description: 'Fetch statutory gorilla, chimpanzee, and park permit tariffs for UWA, RDB, and TANAPA.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        park: { type: Type.STRING, description: 'Park name e.g. Bwindi, Volcanoes, Kibale, Serengeti' },
      },
      required: ['park'],
    },
  },
  {
    name: 'build_custom_quote',
    description: 'Draft a customized day-by-day outline and price band. Note: Always quotes in price bands; enforced rule: QUOTES_NEED_APPROVAL=true.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        countries: { type: Type.ARRAY, items: { type: Type.STRING } },
        days: { type: Type.NUMBER },
        travelers: { type: Type.NUMBER },
        budgetTier: { type: Type.STRING },
      },
      required: ['countries', 'days'],
    },
  },
  {
    name: 'create_lead',
    description: 'Create a safari lead for founder Akim in our Arusha office.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        notes: { type: Type.STRING },
      },
      required: ['name'],
    },
  },
  {
    name: 'check_availability',
    description: 'Check dates. Never fabricates live lodge inventory; always responds that Akim confirms within 12 hours.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dates: { type: Type.STRING },
        circuitName: { type: Type.STRING },
      },
      required: ['dates'],
    },
  },
  {
    name: 'handoff_to_human',
    description: 'Flag conversation for Akim on WhatsApp due to special requests or traveler booking intent.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING },
      },
      required: ['reason'],
    },
  },
  {
    name: 'get_wallet_balance',
    description: 'Check guest safari wallet available balance, funds in escrow hold for pending reservations, and total credits.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        userId: { type: Type.STRING, description: 'Traveler user ID or email (defaults to active session)' },
      },
    },
  },
  {
    name: 'create_topup_link',
    description: 'Generate a secure safari wallet top-up link with specified amount and payment provider.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: 'Amount in USD ($50 min - $10,000 max)' },
        provider: { type: Type.STRING, description: 'dpo, stripe, paypal, or mpesa' },
        userId: { type: Type.STRING },
      },
      required: ['amount'],
    },
  },
  {
    name: 'pay_booking_from_wallet',
    description: 'Place 30% safari deposit from wallet into escrow hold for a booking. Requires explicit traveler confirmation first.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        bookingId: { type: Type.STRING, description: 'Safari booking or lead ID' },
        amount: { type: Type.NUMBER, description: '30% deposit amount in USD' },
        confirmed: { type: Type.BOOLEAN, description: 'Set to true ONLY if traveler explicitly affirmed confirmation' },
        userId: { type: Type.STRING },
      },
      required: ['bookingId', 'amount', 'confirmed'],
    },
  },
  {
    name: 'get_transaction_history',
    description: 'Retrieve the traveler recent wallet ledger transactions (top-ups, holds, refunds, referral credits).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Max transactions to retrieve (default 5)' },
        userId: { type: Type.STRING },
      },
    },
  },
];

// Execute tool logic
async function executeSafariTool(name: string, args: Record<string, any>) {
  switch (name) {
    case 'search_itineraries': {
      const country = args.country?.toLowerCase();
      const results = ITINERARIES.filter((it) => {
        if (!country) return true;
        return it.countries.some((c) => c.toLowerCase().includes(country));
      }).map((it) => ({
        title: it.title,
        slug: it.slug,
        countries: it.countries,
        days: it.durationDays,
        startingPricePerDayUSD: it.startingPricePerDayUSD,
        gorillaPermits: it.gorillaPermitRequired,
      }));
      return { count: results.length, itineraries: results.slice(0, 3) };
    }
    case 'get_permit_info': {
      const park = args.park?.toLowerCase() || '';
      const facts = PERMITS_DATA.filter((p) =>
        p.parkName.toLowerCase().includes(park) || p.country.toLowerCase().includes(park)
      );
      return {
        permits: facts.length > 0 ? facts : PERMITS_DATA,
        guarantee: 'Official scanned government receipts delivered before final trip payment.',
      };
    }
    case 'build_custom_quote': {
      const days = args.days || 8;
      const tier = args.budgetTier || 'Luxury';
      const perDay = tier === 'Mid-Range' ? 550 : tier === 'Signature' ? 1400 : 850;
      return {
        estimatedPriceBand: `$${perDay * days} - $${(perDay + 250) * days} USD per person`,
        depositRequired: '30%',
        disclaimer: 'Draft price band only. All final quotes require human sign-off by founder Akim (QUOTES_NEED_APPROVAL=true).',
      };
    }
    case 'create_lead': {
      const lead: Lead = {
        id: 'lead_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new',
        source: 'assistant_tool',
        name: args.name || 'Anonymous Traveler',
        email: args.email || 'pending@gandasafaris.com',
        phone: args.phone,
        notes: args.notes || 'Created via Ganda Assistant',
      };
      inMemoryLeads.unshift(lead);
      return { success: true, leadId: lead.id, message: 'Dispatched to Akim in Arusha' };
    }
    case 'check_availability': {
      return {
        status: 'pending_human_verification',
        message: 'Lodge inventory and UWA/RDB permit quotas must be checked live. Akim’s team confirms within 12 hours.',
      };
    }
    case 'handoff_to_human': {
      return {
        handoff: true,
        contact: 'Akim Mmari (WhatsApp +255 784 123 456)',
        reason: args.reason,
      };
    }
    case 'get_wallet_balance': {
      const userId = args.userId || 'current_user';
      const wallet = getOrCreateWallet(userId);
      return {
        availableUSD: wallet.availableBalance,
        holdUSD: wallet.holdBalance,
        totalBalanceUSD: wallet.balance,
        status: wallet.status,
        message: `Your Ganda Safari Wallet balance is $${wallet.availableBalance} USD available ($${wallet.holdBalance} USD held in escrow for pending reservations).`,
      };
    }
    case 'create_topup_link': {
      const userId = args.userId || 'current_user';
      const amount = parseFloat(args.amount);
      const provider = args.provider || 'dpo';

      if (isNaN(amount) || amount < 50 || amount > 10000) {
        return { error: 'Top-up amount must be between $50 and $10,000 USD.' };
      }

      const checkoutUrl = `/wallet/topup?amount=${amount}&provider=${provider}`;
      return {
        checkoutUrl,
        amount,
        provider,
        message: `I have generated your secure deposit link for $${amount} USD via ${provider.toUpperCase()}: ${checkoutUrl}`,
      };
    }
    case 'pay_booking_from_wallet': {
      const userId = args.userId || 'current_user';
      const { bookingId, amount, confirmed } = args;
      const parsedAmount = parseFloat(amount);

      if (!confirmed) {
        return {
          requiresConfirmation: true,
          message: `To place $${parsedAmount} USD into escrow hold from your wallet for booking #${bookingId}, please reply: "Yes, confirm safari payment".`,
        };
      }

      const wallet = getOrCreateWallet(userId);
      const available = Number((wallet.balance - wallet.holdBalance).toFixed(2));

      if (available < parsedAmount) {
        const shortfall = Number((parsedAmount - available).toFixed(2));
        return {
          error: 'Insufficient available balance',
          availableBalance: available,
          required: parsedAmount,
          shortfall,
          topupLink: `/wallet/topup?amount=${shortfall}&resume_booking=${bookingId}`,
          message: `You have $${available} USD available, but $${parsedAmount} USD is required. You can top-up the remaining $${shortfall} USD here: /wallet/topup?amount=${shortfall}&resume_booking=${bookingId}`,
        };
      }

      try {
        const ref = `HOLD-AI-${Date.now().toString().slice(-6)}`;
        const result = await applyWalletTransaction({
          walletId: wallet.id,
          type: 'payment',
          direction: 'debit',
          amount: parsedAmount,
          currency: 'USD',
          reference: ref,
          idempotencyKey: `ai_hold_${bookingId}_${Date.now()}`,
          paymentProvider: 'wallet',
          bookingId,
          narration: `Escrow hold for 30% deposit on safari #${bookingId}`,
          meta: { action: 'hold', bookingId },
        });

        const lead = inMemoryLeads.find((l) => l.id === bookingId);
        if (lead) {
          lead.status = 'deposit_paid';
          lead.depositAmountUSD = parsedAmount;
        }

        return {
          success: true,
          bookingId,
          amount: parsedAmount,
          status: 'deposit_held',
          remainingAvailableUSD: result.availableBalance,
          message: `Deposit of $${parsedAmount} USD successfully placed into escrow hold! Akim’s Arusha team will verify lodge inventory and secure government permits within 12 hours.`,
        };
      } catch (err: any) {
        return { error: err.message };
      }
    }
    case 'get_transaction_history': {
      const userId = args.userId || 'current_user';
      const wallet = getOrCreateWallet(userId);
      const limit = args.limit || 5;
      const txs = inMemoryTransactions
        .filter((tx) => tx.walletId === wallet.id)
        .slice(0, limit)
        .map((t) => ({
          reference: t.reference,
          type: t.type,
          direction: t.direction,
          amount: t.amount,
          narration: t.narration,
          date: t.createdAt.split('T')[0],
        }));

      return {
        walletId: wallet.id,
        count: txs.length,
        recentTransactions: txs,
      };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

// Chat API Route
app.post('/api/chat', async (req, res) => {
  const { sessionId, message, language = 'en', history = [] } = req.body;

  // Initialize or retrieve session
  const currentSessionId = sessionId || 'sess_' + Date.now();
  if (!inMemorySessions[currentSessionId]) {
    inMemorySessions[currentSessionId] = {
      id: currentSessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: 'web_widget',
      language: language as any,
      messages: [],
    };
  }

  const session = inMemorySessions[currentSessionId];
  session.messages.push({
    id: 'msg_user_' + Date.now(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  });

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Convert history
      const contents = history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: TINGA_ASSISTANT_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: safariTools }],
        },
      });

      let replyText = response.text || '';
      const executedToolCalls: any[] = [];

      // Check if function calls exist
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const toolResult = await executeSafariTool(call.name, call.args as any);
          executedToolCalls.push({ name: call.name, arguments: call.args, result: toolResult });
        }

        // Secondary resolution with tool result
        const toolResolution = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            ...contents,
            {
              role: 'model',
              parts: [{ text: replyText || 'Calling tools for accurate facts...' }],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `Tool results: ${JSON.stringify(executedToolCalls)}. Now synthesize a concise, warm, transparent answer for the guest adhering to price bands, official permit facts, and offering WhatsApp handoff.`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: TINGA_ASSISTANT_SYSTEM_PROMPT,
          },
        });

        if (toolResolution.text) {
          replyText = toolResolution.text;
        }
      }

      session.messages.push({
        id: 'msg_asst_' + Date.now(),
        role: 'assistant',
        content: replyText,
        toolCalls: executedToolCalls,
        timestamp: new Date().toISOString(),
      });

      return res.json({
        reply: replyText,
        toolCalls: executedToolCalls,
      });
    } catch (err: any) {
      console.error('[Gemini Error]', err?.message || err);
      // Fall through to concierge rule engine
    }
  }

  // Graceful rule-based fallback concierge if GEMINI_API_KEY is not configured or fails
  let reply = 'Jambo! I am Ganda Assistant, Akim’s safari concierge in Arusha. ';
  const lower = (message || '').toLowerCase();
  const toolCalls: any[] = [];

  if (lower.includes('permit') || lower.includes('gorilla')) {
    const permitData = await executeSafariTool('get_permit_info', { park: 'Bwindi' });
    toolCalls.push({ name: 'get_permit_info', arguments: { park: 'Bwindi' }, result: permitData });
    reply += 'Official mountain gorilla permits are $800 USD in Uganda (Bwindi / Mgahinga) and $1,500 USD in Rwanda (Volcanoes NP). Ganda Safaris secures official permits immediately upon receipt of your 30% trip deposit, providing official government receipts before your final balance is due. Would you like to check permit availability with Akim on WhatsApp (+255 784 123 456)?';
  } else if (lower.includes('wallet') || lower.includes('balance') || lower.includes('topup') || lower.includes('credit')) {
    const walletData: any = await executeSafariTool('get_wallet_balance', { userId: 'current_user' });
    toolCalls.push({ name: 'get_wallet_balance', arguments: { userId: 'current_user' }, result: walletData });
    reply += `You currently have $${walletData.availableUSD} USD available in your Ganda Safari Wallet ($${walletData.holdUSD} USD held in escrow for pending reservations). You can manage credits, download monthly statements, or top-up anytime at /wallet.`;
  } else if (lower.includes('partner') || lower.includes('who drives') || lower.includes('subcontract')) {
    reply += 'We openly name our local ground partners! In Tanzania, we operate our own direct fleet from Arusha. In Uganda, our vetted partner is Gorilla Highlands Expeditions (AUTO Lic #AUTO-UG-2019-142), and in Kenya, Savannah Trackers Kenya (KATO Bonded #KATO-KE-2020-089). We never hide subcontracting, and our guides receive fair living daily salaries.';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
    const quote = await executeSafariTool('build_custom_quote', { countries: ['Tanzania'], days: 8, budgetTier: 'Luxury' });
    toolCalls.push({ name: 'build_custom_quote', arguments: { days: 8 }, result: quote });
    reply += 'We quote in transparent price bands: Mid-Range (~$450–$650 pp/day), Luxury (~$750–$1,100 pp/day), and Ultra-Luxe (~$1,300+ pp/day). A 30% deposit secures private vehicles and permits. All formal quotes require human review by founder Akim (QUOTES_NEED_APPROVAL=true). Shall I connect you with Akim on WhatsApp?';
  } else {
    const itineraries = await executeSafariTool('search_itineraries', {});
    toolCalls.push({ name: 'search_itineraries', arguments: {}, result: itineraries });
    reply += 'We craft tailor-made circuits across Tanzania, Kenya, Rwanda, and Uganda—from the Serengeti Great Migration to Bwindi mountain gorillas. We customize every departure around your dates. You can also message founder Akim directly on WhatsApp at +255 784 123 456 anytime!';
  }

  session.messages.push({
    id: 'msg_asst_' + Date.now(),
    role: 'assistant',
    content: reply,
    toolCalls,
    timestamp: new Date().toISOString(),
  });

  res.json({ reply, toolCalls });
});

// ================= VITE MIDDLEWARE OR STATIC SERVING =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ganda Safaris] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
