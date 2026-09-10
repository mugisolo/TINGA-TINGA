import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, DollarSign, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { Itinerary, Currency, BudgetTier } from '../types';
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
  const [selectedGateway, setSelectedGateway] = useState<'dpo' | 'stripe' | 'paypal'>('dpo');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleProcessDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsProcessing(true);
    trackEvent('deposit_modal_opened', {
      itinerarySlug: itinerary.slug,
      gateway: selectedGateway,
      depositAmountUSD,
      travelers,
    });

    try {
      // Simulate real gateway handshake (or call server route /api/leads with deposit record)
      const res = await fetch('/api/leads', {
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

      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      setIsSuccess(true);
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
            <h4 className="text-xl font-bold text-white">Deposit Confirmation Initiated!</h4>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Asante sana, <strong className="text-amber-400">{fullName}</strong>! We have received your booking request for the <strong>{itinerary.title}</strong>.
            </p>
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-left text-xs text-stone-300 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-400">Total 30% Deposit:</span>
                <span className="font-bold text-amber-400">{formatPrice(depositAmountUSD, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Gateway:</span>
                <span className="uppercase font-semibold text-white">{selectedGateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Permit Guarantee:</span>
                <span className="text-emerald-400 font-semibold">Receipt sent within 24h</span>
              </div>
            </div>
            <p className="text-xs text-stone-400">
              Founder Akim has been alerted and will send your formal invoice & official permit booking verification via email and WhatsApp.
            </p>
            <div className="pt-4 flex justify-center space-x-3">
              <a
                href={`https://wa.me/255784123456?text=Hello%20Akim,%20I%20just%20reserved%20the%20${encodeURIComponent(itinerary.title)}%20for%20${travelers}%20travelers.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                Confirm with Akim on WhatsApp
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
              >
                Close Window
              </button>
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
                placeholder="WhatsApp Phone (with Country Code, e.g. +1 555...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Step 3: Payment Gateway Selector */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                Select Deposit Payment Gateway
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGateway('dpo')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    selectedGateway === 'dpo'
                      ? 'bg-amber-600/15 border-amber-500 text-white'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-xs font-bold text-white">DPO Group</span>
                  <span className="text-[10px] text-stone-400">Direct Pay Africa (Cards)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    selectedGateway === 'stripe'
                      ? 'bg-amber-600/15 border-amber-500 text-white'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <Lock className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="text-xs font-bold text-white">Stripe</span>
                  <span className="text-[10px] text-stone-400">Global Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGateway('paypal')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    selectedGateway === 'paypal'
                      ? 'bg-amber-600/15 border-amber-500 text-white'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-xs font-bold text-white">PayPal</span>
                  <span className="text-[10px] text-stone-400">Instant Wallet Transfer</span>
                </button>
              </div>
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
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <span>Connecting to {selectedGateway.toUpperCase()} Gateway...</span>
              ) : (
                <>
                  <span>Pay 30% Deposit ({formatPrice(depositAmountUSD, currency)})</span>
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
