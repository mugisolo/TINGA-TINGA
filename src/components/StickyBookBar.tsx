import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { Itinerary, Currency, BudgetTier } from '../types';
import { formatPrice } from '../lib/currency';

interface StickyBookBarProps {
  itinerary: Itinerary;
  currency: Currency;
  selectedTier: BudgetTier;
  onOpenDepositModal: () => void;
}

export const StickyBookBar: React.FC<StickyBookBarProps> = ({
  itinerary,
  currency,
  selectedTier,
  onOpenDepositModal,
}) => {
  let priceUSD = itinerary.priceBands.luxury.perPersonDouble;
  if (selectedTier === 'Mid-Range') {
    priceUSD = itinerary.priceBands.midRange.perPersonDouble;
  } else if (selectedTier === 'Signature / Ultra-Luxe') {
    priceUSD = itinerary.priceBands.signature.perPersonDouble;
  }

  const depositUSD = Math.round(priceUSD * 0.30);

  const whatsappMessage = encodeURIComponent(
    `Hello Akim! I am reviewing the "${itinerary.title}" (${itinerary.durationDays} days) on your website. I would like to discuss private departures for my group.`
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 px-4 sm:px-8 py-3.5 shadow-2xl transition-transform">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Pricing and Tier Info */}
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-500 font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{selectedTier} Tier • 30% Deposit Secures Permits</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-white font-display">
                {formatPrice(priceUSD, currency)}
              </span>
              <span className="text-xs text-stone-400 font-medium">pp (double occupancy)</span>
              <span className="text-xs text-stone-500 hidden md:inline">
                | 30% Deposit: <strong className="text-amber-400">{formatPrice(depositUSD, currency)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action CTAs */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          {/* WhatsApp Akim */}
          <a
            href={`https://wa.me/255784123456?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-600/40 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden md:inline">Inquire on</span>
            <span>WhatsApp</span>
          </a>

          {/* Pay 30% Deposit Modal trigger */}
          <button
            onClick={onOpenDepositModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>Pay 30% Deposit</span>
          </button>

          {/* Plan Custom Circuit */}
          <Link
            to={`/trip-planner?itinerary=${itinerary.slug}&tier=${encodeURIComponent(selectedTier)}`}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-900/30"
          >
            <span>Customize Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
