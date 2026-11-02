import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { Currency, Wallet } from '../types';
import { CURRENCY_RATES, formatPrice } from '../lib/currency';
import { trackEvent } from '../lib/analytics';

export const WalletTopupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialAmount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : 500;
  const resumeBooking = searchParams.get('resume_booking');

  const [amount, setAmount] = useState<number>(initialAmount >= 50 ? initialAmount : 500);
  const [provider, setProvider] = useState<'dpo' | 'stripe' | 'paypal' | 'mpesa'>('dpo');
  const [mpesaPhone, setMpesaPhone] = useState<string>('255784123456');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<any | null>(null);

  // Load active wallet
  useEffect(() => {
    fetch('/api/wallet?userId=current_user')
      .then((r) => r.json())
      .then((data) => setWallet(data))
      .catch((err) => console.error('Error fetching wallet:', err));
  }, []);

  const handleQuickAmount = (val: number) => {
    setAmount(val);
    setError(null);
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 50 || amount > 10000) {
      setError('Deposit amount must be between $50 and $10,000 USD.');
      return;
    }

    setLoading(true);
    setError(null);
    trackEvent('wallet_topup_started', { amountUSD: amount, provider });

    try {
      // Execute top-up simulation to test instant credit
      const res = await fetch('/api/wallet/simulate-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current_user',
          amount,
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete deposit.');
      }

      setWallet(data.wallet);
      setSuccessTx(data.transaction);
      trackEvent('wallet_topup_completed', { amountUSD: amount, provider, reference: data.transaction?.reference });
    } catch (err: any) {
      setError(err.message || 'An error occurred during top-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <Link 
          to="/wallet" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:text-amber-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Safari Wallet
        </Link>

        {/* Shortfall Alert Banner if redirected from deposit modal */}
        {resumeBooking && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-semibold block">Shortfall Top-up Detected</strong>
              You are adding travel credits to guarantee 30% deposit for safari booking #{resumeBooking}. Once completed, your credits will be ready to place in escrow.
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                  Ganda Safari Credits
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold">Top-up Safari Wallet</h1>
                <p className="text-stone-300 text-sm mt-1">
                  Prepay your safari credits via DPO Group, Stripe, PayPal, or M-Pesa.
                </p>
              </div>

              {wallet && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-right">
                  <span className="text-xs text-stone-300 block">Current Available Balance</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${wallet.availableBalance?.toLocaleString() || '0'} USD
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Success State */}
          {successTx ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                Deposit Successful!
              </h2>
              <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
                Your safari wallet has been credited with <strong>${amount.toLocaleString()} USD</strong>. A WhatsApp confirmation notice has been sent to your verified device.
              </p>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 max-w-sm mx-auto mb-8 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Ledger Reference:</span>
                  <span className="font-mono font-bold text-stone-800">{successTx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Provider:</span>
                  <span className="font-semibold text-stone-800">{provider.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">New Available Balance:</span>
                  <span className="font-bold text-emerald-600">${wallet?.availableBalance?.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSuccessTx(null);
                    setAmount(500);
                  }}
                  className="px-6 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-100 transition-colors text-sm"
                >
                  Make Another Deposit
                </button>
                <button
                  onClick={() => navigate('/wallet')}
                  className="px-6 py-2.5 rounded-lg bg-amber-900 text-white font-medium hover:bg-amber-800 transition-colors text-sm shadow-sm"
                >
                  View Wallet & Ledger
                </button>
              </div>
            </div>
          ) : (
            /* Topup Form */
            <form onSubmit={handleTopupSubmit} className="p-6 sm:p-8 space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                  <div>{error}</div>
                </div>
              )}

              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Deposit Amount (USD)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 font-bold text-lg">
                    $
                  </div>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="10"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    className="block w-full pl-8 pr-28 py-3.5 border border-stone-300 rounded-xl text-xl font-bold font-mono text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-stone-500">
                    Min $50 • Max $10,000
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[100, 500, 1500, 3000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        amount === preset
                          ? 'bg-amber-900 border-amber-900 text-white shadow-sm'
                          : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      +${preset.toLocaleString()} USD
                    </button>
                  ))}
                </div>

                {/* Local Currency Reference Display */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Equivalent East African Value:</span>
                  <div className="flex items-center gap-3 font-mono font-medium text-stone-700">
                    <span>{formatPrice(amount, 'TZS')}</span>
                    <span className="text-stone-300">•</span>
                    <span>{formatPrice(amount, 'UGX')}</span>
                    <span className="text-stone-300">•</span>
                    <span>{formatPrice(amount, 'KES')}</span>
                  </div>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Select Payment Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* DPO Group */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      provider === 'dpo'
                        ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="dpo"
                      checked={provider === 'dpo'}
                      onChange={() => setProvider('dpo')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">DPO Group</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Recommended
                      </span>
                    </div>
                    <span className="text-xs text-stone-600">
                      All African & Global Credit Cards (Visa, Mastercard, Amex) + Airtel & M-Pesa.
                    </span>
                  </label>

                  {/* Stripe */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      provider === 'stripe'
                        ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="stripe"
                      checked={provider === 'stripe'}
                      onChange={() => setProvider('stripe')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">Stripe</span>
                      <CreditCard className="w-4 h-4 text-stone-500" />
                    </div>
                    <span className="text-xs text-stone-600">
                      International Cards with 3D-Secure 2.0 and instant verification.
                    </span>
                  </label>

                  {/* PayPal */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      provider === 'paypal'
                        ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="paypal"
                      checked={provider === 'paypal'}
                      onChange={() => setProvider('paypal')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">PayPal</span>
                      <ExternalLink className="w-4 h-4 text-stone-500" />
                    </div>
                    <span className="text-xs text-stone-600">
                      Worldwide balance or linked bank cards via PayPal buyer protection.
                    </span>
                  </label>

                  {/* M-Pesa */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      provider === 'mpesa'
                        ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="mpesa"
                      checked={provider === 'mpesa'}
                      onChange={() => setProvider('mpesa')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">M-Pesa Express</span>
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs text-stone-600">
                      Safaricom & Vodacom East Africa STK Push mobile checkout.
                    </span>
                  </label>
                </div>
              </div>

              {/* M-Pesa Phone Input if selected */}
              {provider === 'mpesa' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <label className="block text-xs font-bold text-emerald-900">
                    M-Pesa Mobile Number (Kenya / Tanzania)
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="255784123456"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm font-mono text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-emerald-700">
                    An STK prompt will appear on your phone asking for your M-Pesa PIN.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing Deposit via {provider.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-amber-300" />
                      Confirm & Deposit ${amount.toLocaleString()} USD
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-stone-500 pt-2">
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PCI-DSS Level 1</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4 text-stone-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <span>Arusha TTBL Licensed</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
