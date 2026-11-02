import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  Wallet as WalletIcon, 
  Sparkles, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Itinerary, Currency, BudgetTier, Wallet } from '../types';
import { formatPrice, convertFromUSD } from '../lib/currency';
import { trackEvent } from '../lib/analytics';

interface DepositPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary?: Itinerary;
  currency: Currency;
  initialTravelers?: number;
  initialTier?: BudgetTier;
}

export const DepositPaymentModal: React.FC<DepositPaymentModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  currency,
  initialTravelers = 2,
  initialTier = 'Luxury',
}) => {
  const [travelers, setTravelers] = useState<number>(initialTravelers);
  const [selectedTier, setSelectedTier] = useState<BudgetTier>(initialTier);
  const [selectedGateway, setSelectedGateway] = useState<'wallet' | 'dpo' | 'stripe' | 'paypal'>('wallet');
  const [fullName, setFullName] = useState('Traveler');
  const [email, setEmail] = useState('traveler@gandasafaris.com');
  const [phone, setPhone] = useState('+255 784 123 456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>('842109');
  const [requiresOtp, setRequiresOtp] = useState<boolean>(false);

  // Fetch wallet whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setWalletLoading(true);
      fetch('/api/wallet?userId=current_user')
        .then((r) => r.json())
        .then((data) => {
          setWallet(data);
          setWalletLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching wallet:', err);
          setWalletLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen || !itinerary) return null;

  // Calculate base pricing
  let perPersonPriceUSD = itinerary.priceBands.luxury.perPersonDouble;
  if (selectedTier === 'Mid-Range') {
    perPersonPriceUSD = itinerary.priceBands.midRange.perPersonDouble;
  } else if (selectedTier === 'Signature / Ultra-Luxe') {
    perPersonPriceUSD = itinerary.priceBands.signature.perPersonDouble;
  }

  const totalTripCostUSD = perPersonPriceUSD * travelers;
  const depositRate = 0.30;
  const depositAmountUSD = Math.round(totalTripCostUSD * depositRate);

  const availableWalletUSD = wallet?.availableBalance ?? 0;
  const hasSufficientWalletBalance = availableWalletUSD >= depositAmountUSD;
  const shortfallUSD = Math.max(0, depositAmountUSD - availableWalletUSD);

  const handleProcessDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    // Check if wallet selected with OTP check for large amounts
    if (selectedGateway === 'wallet' && depositAmountUSD > 500 && !requiresOtp) {
      setRequiresOtp(true);
      return;
    }

    setIsProcessing(true);
    setWalletError(null);

    trackEvent('deposit_modal_opened', {
      itinerarySlug: itinerary.slug,
      gateway: selectedGateway,
      depositAmountUSD,
      travelers,
    });

    try {
      if (selectedGateway === 'wallet') {
        // Call wallet payment endpoint to place funds into escrow hold
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        const res = await fetch('/api/wallet/pay-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'current_user',
            bookingId,
            amount: depositAmountUSD,
            idempotencyKey: `deposit_${bookingId}_${Date.now()}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to authorize wallet escrow hold.');
        }

        // Also register lead
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            phone,
            status: 'deposit_paid',
            source: 'wallet_escrow',
            travelersCount: travelers,
            budgetBand: selectedTier,
            countries: itinerary.countries,
            interests: [itinerary.title],
            notes: `30% deposit placed in escrow hold via Ganda Safari Wallet. Reference: ${data.holdReference}.`,
            depositAmountUSD,
          }),
        });

        setSuccessDetails({
          type: 'wallet',
          reference: data.holdReference,
          remainingBalance: data.remainingAvailable,
          bookingId,
        });
        setIsProcessing(false);
        setIsSuccess(true);
      } else {
        // Regular card/gateway flow
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            phone,
            status: 'deposit_paid',
            source: 'trip_planner',
            travelersCount: travelers,
            budgetBand: selectedTier,
            countries: itinerary.countries,
            interests: [itinerary.title],
            notes: `30% Trip deposit initiated via ${selectedGateway.toUpperCase()}. Total deposit: $${depositAmountUSD} USD.`,
            depositAmountUSD,
          }),
        });

        setSuccessDetails({
          type: selectedGateway,
          reference: `EXT-${Date.now().toString().slice(-6)}`,
          bookingId: `BK-${Date.now().toString().slice(-6)}`,
        });
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
        }, 800);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setWalletError(err.message || 'Payment failed. Please try another method.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-950">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official 30% Safari Trip Deposit</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Secure Your Safari: {itinerary.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white">
              {successDetails?.type === 'wallet' ? 'Escrow Deposit Held Successfully!' : 'Deposit Confirmation Initiated!'}
            </h4>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Asante sana, <strong className="text-amber-400">{fullName}</strong>! We have reserved your place for the <strong>{itinerary.title}</strong>.
            </p>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-left text-xs text-stone-300 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-400">Total 30% Deposit:</span>
                <span className="font-bold text-amber-400">{formatPrice(depositAmountUSD, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Escrow Reference:</span>
                <span className="font-mono font-bold text-stone-200">{successDetails?.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Channel:</span>
                <span className="uppercase font-semibold text-white">
                  {selectedGateway === 'wallet' ? 'Ganda Safari Wallet (Escrow)' : selectedGateway}
                </span>
              </div>
              {successDetails?.remainingBalance !== undefined && (
                <div className="flex justify-between pt-2 border-t border-stone-800">
                  <span className="text-stone-400">Remaining Wallet Balance:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${successDetails.remainingBalance.toLocaleString()} USD
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/60 text-xs text-amber-200 text-left max-w-md mx-auto flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Ganda Escrow Protection:</strong> Your deposit is held securely in escrow. Akim Mmari will inspect live lodge allotments and secure official UWA/RDB primate permits within 12 hours.
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={`https://wa.me/255784123456?text=Hello%20Akim,%20I%20just%20placed%20a%2030%25%20deposit%20from%20my%20Ganda%20Wallet%20for%20${encodeURIComponent(itinerary.title)}%20(Ref:%20${successDetails?.reference}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                Confirm with Akim on WhatsApp
              </a>
              <Link
                to="/wallet"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <WalletIcon className="w-3.5 h-3.5 text-amber-400" />
                View Wallet Ledger
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProcessDeposit} className="p-6 space-y-6">
            {/* Step 1: Customize tier and travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Number of Travelers
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setTravelers(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        travelers === num
                          ? 'bg-amber-600 text-stone-950 border-amber-500'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Accommodation Tier
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as BudgetTier)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Mid-Range">Mid-Range ({formatPrice(itinerary.priceBands.midRange.perPersonDouble, currency)} pp)</option>
                  <option value="Luxury">Luxury ({formatPrice(itinerary.priceBands.luxury.perPersonDouble, currency)} pp)</option>
                  <option value="Signature / Ultra-Luxe">Signature Ultra-Luxe ({formatPrice(itinerary.priceBands.signature.perPersonDouble, currency)} pp)</option>
                </select>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Trip Cost ({travelers} travelers @ {formatPrice(perPersonPriceUSD, currency)}):</span>
                <span className="text-white font-medium">{formatPrice(totalTripCostUSD, currency)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Official Deposit Percentage:</span>
                <span className="text-amber-400 font-semibold">30% (Secures Lodges & Permits)</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-white">
                <span>Total 30% Deposit Due Now:</span>
                <span className="text-amber-400 text-base">{formatPrice(depositAmountUSD, currency)}</span>
              </div>
            </div>

            {/* Error Message Banner */}
            {walletError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>{walletError}</div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                Lead Traveler Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name (as in Passport)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <input
                type="tel"
                placeholder="WhatsApp Phone (with Country Code, e.g. +255 784 123 456)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Step 3: Payment Gateway Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  Payment Method
                </span>
                {wallet && (
                  <span className="text-[11px] text-amber-400 font-mono">
                    Wallet Avail: ${wallet.availableBalance.toLocaleString()} USD
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Ganda Wallet */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGateway('wallet');
                    setRequiresOtp(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'wallet'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 w-full">
                    <WalletIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded">
                      Instant
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">Ganda Wallet</span>
                  <span className="text-[10px] text-stone-400">Escrow Hold</span>
                </button>

                {/* 2. DPO */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('dpo')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'dpo'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-xs font-bold text-white">DPO Group</span>
                  <span className="text-[10px] text-stone-400">All African Cards</span>
                </button>

                {/* 3. Stripe */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'stripe'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <Lock className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-xs font-bold text-white">Stripe</span>
                  <span className="text-[10px] text-stone-400">Global Credit/Debit</span>
                </button>

                {/* 4. PayPal */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('paypal')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'paypal'
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-xs font-bold text-white">PayPal</span>
                  <span className="text-[10px] text-stone-400">International</span>
                </button>
              </div>

              {/* Wallet-specific status block */}
              {selectedGateway === 'wallet' && (
                <div className="mt-3 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Available Wallet Balance:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${availableWalletUSD.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Deposit Required (30%):</span>
                    <span className="font-mono font-bold text-amber-400">
                      ${depositAmountUSD.toLocaleString()} USD
                    </span>
                  </div>

                  {!hasSufficientWalletBalance ? (
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <div className="flex justify-between text-xs text-rose-400 font-semibold">
                        <span>Shortfall to Deposit:</span>
                        <span>${shortfallUSD.toLocaleString()} USD</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-normal">
                        Your balance is currently short by ${shortfallUSD.toLocaleString()} USD. You can top-up your wallet instantly or switch to DPO/Stripe above.
                      </p>
                      <Link
                        to={`/wallet/topup?amount=${shortfallUSD}&resume_booking=${itinerary.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-colors"
                      >
                        Top-up ${shortfallUSD.toLocaleString()} USD Now &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-stone-800">
                      {requiresOtp ? (
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-amber-300">
                            Two-Factor Authorization Code (High Value Deposit &gt; $500)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="w-32 bg-stone-800 border border-amber-600 rounded-lg px-3 py-1.5 text-center font-mono font-bold text-sm text-white tracking-widest"
                            />
                            <span className="text-[10px] text-stone-400">
                              Demo OTP pre-filled from WhatsApp session.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sufficient balance available. Funds will be held in escrow.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transparency guarantee note */}
            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80 text-[11px] text-stone-400 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Permit Receipt Guarantee:</strong> Once your deposit is confirmed, Akim personally purchases your UWA/RDB gorilla permits and sends you the scanned official government receipts before your 70% final trip balance is due (60 days before travel).
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isProcessing || (selectedGateway === 'wallet' && !hasSufficientWalletBalance)}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>Authorizing {selectedGateway === 'wallet' ? 'Escrow Hold' : selectedGateway.toUpperCase()}...</span>
              ) : selectedGateway === 'wallet' && !hasSufficientWalletBalance ? (
                <span>Insufficient Wallet Balance</span>
              ) : selectedGateway === 'wallet' && requiresOtp ? (
                <>
                  <span>Verify OTP & Authorize Escrow (${formatPrice(depositAmountUSD, currency)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>
                    {selectedGateway === 'wallet' ? 'Authorize Escrow Hold' : 'Pay 30% Deposit'} ({formatPrice(depositAmountUSD, currency)})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
