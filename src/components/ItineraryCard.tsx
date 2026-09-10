import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Itinerary, Currency } from '../types';
import { formatPrice } from '../lib/currency';

interface ItineraryCardProps {
  itinerary: Itinerary;
  currency: Currency;
  onOpenDepositModal?: (itinerary: Itinerary) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  itinerary,
  currency,
  onOpenDepositModal,
}) => {
  return (
    <div className="bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col group hover:-translate-y-1">
      {/* Card Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-950">
        <img
          src={itinerary.heroImage}
          alt={itinerary.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {itinerary.countries.map((c) => (
            <span
              key={c}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-900/90 text-amber-400 border border-amber-500/40 backdrop-blur-sm shadow-md"
            >
              {c}
            </span>
          ))}
          {itinerary.gorillaPermitRequired && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 backdrop-blur-sm shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Gorilla Permits Included</span>
            </span>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 text-xs font-semibold text-white bg-stone-900/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-stone-700">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{itinerary.durationDays} Days / {itinerary.durationDays - 1} Nights</span>
        </div>

        {/* Pricing badge */}
        <div className="absolute bottom-3 right-3 text-right bg-amber-600 text-stone-950 px-3 py-1 rounded-md font-bold shadow-lg">
          <div className="text-[10px] uppercase tracking-wider font-semibold leading-none">From</div>
          <div className="text-sm font-black leading-tight">
            {formatPrice(itinerary.startingPricePerDayUSD, currency)} <span className="text-[10px] font-medium">pp/day</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {itinerary.title}
          </h3>
          <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
            {itinerary.overview}
          </p>

          {/* Key highlights bullet list */}
          <ul className="mt-4 space-y-1.5 text-xs text-stone-300">
            {itinerary.highlights.slice(0, 3).map((hl, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{hl}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vehicle & Price Band Details */}
        <div className="pt-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Custom 4x4 Pop-Top Land Cruiser</span>
            </span>
            <span className="text-stone-500">
              Total {formatPrice(itinerary.priceBands.midRange.perPersonDouble, currency)} pp
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/itineraries/${itinerary.slug}`}
              className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            >
              <span>View Day-by-Day</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </Link>

            <Link
              to={`/trip-planner?itinerary=${itinerary.slug}`}
              className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Plan This Trip</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
