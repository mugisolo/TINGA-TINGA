import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ITINERARIES, GROUND_PARTNERS } from '../data/seedData';
import { Currency, BudgetTier } from '../types';
import { formatPrice } from '../lib/currency';
import { StickyBookBar } from '../components/StickyBookBar';
import { DepositPaymentModal } from '../components/DepositPaymentModal';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X as CloseIcon, 
  ChevronDown, 
  ChevronUp, 
  Bed, 
  Plane, 
  Car, 
  Utensils, 
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

interface ItineraryDetailPageProps {
  currency: Currency;
}

export const ItineraryDetailPage: React.FC<ItineraryDetailPageProps> = ({ currency }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<BudgetTier>('Luxury');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const itinerary = ITINERARIES.find((item) => item.slug === slug);

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-display">Itinerary Not Found</h2>
        <p className="text-sm text-stone-400 mt-2 max-w-md">
          The requested safari circuit could not be located in our published index.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 rounded-xl bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider"
        >
          Return to Safari Index
        </Link>
      </div>
    );
  }

  // Identify relevant ground partner for this route
  const partner = GROUND_PARTNERS.find((p) => itinerary.countries.includes(p.country as any)) || GROUND_PARTNERS[0];

  const scheduleDays = (itinerary.days || itinerary.dayByDay || []).map((d, i) => ({
    ...d,
    dayNumber: d.dayNumber ?? d.day ?? (i + 1),
    meals: d.meals ?? d.mealPlan ?? 'Full Board',
    driveDistance: d.driveDistance ?? d.transferTime,
  }));

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    scheduleDays.forEach((d) => (all[d.dayNumber] = true));
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen pb-28">
      {/* Hero Header */}
      <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden bg-stone-900">
        <img
          src={itinerary.heroImage}
          alt={itinerary.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30"></div>

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-xs text-stone-200 border border-stone-700/80 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Circuits</span>
          </button>
        </div>

        {/* Hero Title Container */}
        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {itinerary.countries.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-md text-xs font-bold bg-amber-600 text-stone-950 shadow-md"
              >
                {c}
              </span>
            ))}
            {itinerary.gorillaPermitRequired && (
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-700 text-white shadow-md flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Gorilla Trekking Permits Included</span>
              </span>
            )}
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-stone-900/90 text-stone-200 border border-stone-700">
              {itinerary.durationDays} Days / {itinerary.durationDays - 1} Nights
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display max-w-4xl leading-tight">
            {itinerary.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column (8 cols): Overview, Day-by-Day, Lodges, Inclusions */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview Box */}
            <div className="bg-stone-900/70 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-4">
              <h2 className="text-xl font-bold text-white font-display">Expedition Overview</h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                {itinerary.overview}
              </p>

              <div className="pt-4 border-t border-stone-800">
                <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold mb-3">
                  Signature Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-200">
                  {itinerary.highlights.map((hl, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Accommodation Tier Selector */}
            <div className="bg-stone-900/70 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Choose Accommodation Style</h2>
                  <p className="text-xs text-stone-400">Select your preferred lodge luxury tier to review rates & amenities.</p>
                </div>
                <span className="text-xs text-amber-400 font-semibold">30% Trip Deposit</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Mid-Range', 'Luxury', 'Signature / Ultra-Luxe'] as BudgetTier[]).map((tier) => {
                  let band = itinerary.priceBands.luxury;
                  if (tier === 'Mid-Range') band = itinerary.priceBands.midRange;
                  if (tier === 'Signature / Ultra-Luxe') band = itinerary.priceBands.signature;

                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-600/15 border-amber-500 shadow-xl ring-1 ring-amber-500'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-stone-300'}`}>
                            {tier}
                          </span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                        </div>
                        <div className="text-2xl font-black text-white font-display">
                          {formatPrice(band.perPersonDouble, currency)}
                        </div>
                        <div className="text-[11px] text-stone-400">per person (double occupancy)</div>
                        <p className="text-xs text-stone-300 mt-3 line-clamp-3 leading-relaxed">
                          {band.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-amber-500/90 font-medium">
                        Typical lodges: {(band.lodgesPreview || itinerary.lodges?.map((l) => l.name).slice(0, 3) || ['Boutique Wilderness Camp']).join(', ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day-by-Day Route Itinerary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Day-by-Day Route Schedule</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Detailed daily drive times, game tracks, and meals.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={expandAll}
                    className="text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    Expand All
                  </button>
                  <span className="text-stone-600">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {scheduleDays.map((day) => {
                  const isExpanded = !!expandedDays[day.dayNumber];
                  return (
                    <div
                      key={day.dayNumber}
                      className="rounded-2xl bg-stone-900/90 border border-stone-800 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleDay(day.dayNumber)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-stone-800/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center shrink-0 text-sm">
                            Day {day.dayNumber}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">{day.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-1">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                <span>{day.location}</span>
                              </span>
                              {day.driveDistance && (
                                <span className="flex items-center space-x-1">
                                  <Car className="w-3.5 h-3.5 text-stone-500" />
                                  <span>{day.driveDistance}</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Utensils className="w-3.5 h-3.5 text-stone-500" />
                                <span>{day.meals}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-1 rounded-lg text-stone-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-800/60 space-y-4 text-xs sm:text-sm text-stone-300">
                          <p className="leading-relaxed whitespace-pre-line">
                            {day.description}
                          </p>

                          {/* Wildlife & Lodge info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs">
                              <div className="font-semibold text-amber-400 flex items-center space-x-1.5 mb-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Primary Wildlife Target</span>
                              </div>
                              <div className="text-stone-300">
                                {((day as any).wildlifeTargets || day.wildlifeHighlights || day.activities || ['Big Cats & Plains Wildlife']).join(', ')}
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs">
                              <div className="font-semibold text-emerald-400 flex items-center space-x-1.5 mb-1">
                                <Bed className="w-3.5 h-3.5" />
                                <span>Featured Lodge ({selectedTier})</span>
                              </div>
                              <div className="text-stone-300 font-medium">
                                {day.accommodation}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-stone-900/70 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
              <h2 className="text-xl font-bold text-white font-display">Inclusions & Exclusions Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Included */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Check className="w-4 h-4" />
                    <span>Included in This Circuit</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-stone-300">
                    {itinerary.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <CloseIcon className="w-4 h-4" />
                    <span>Excluded from This Circuit</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-stone-400">
                    {itinerary.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">✗</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Ground Partner Card & Trip Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ground Partner Disclosure Box */}
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Named Ground Partner</span>
              </div>
              <h3 className="text-lg font-bold text-white">{partner.partnerName}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Operating directly in {partner.country} with license #{partner.licenseNumber}. We openly publish who drives your safari to guarantee ethical standards and fair living wages.
              </p>

              <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                <div><strong>Fleet:</strong> {partner.fleetSpecs}</div>
                <div><strong>Insurance:</strong> {partner.insuranceSpecs}</div>
                <div><strong>Guides:</strong> {partner.guideCredentials}</div>
                <div><strong>Emergency:</strong> AMREF Flying Doctors 24/7 evacuation</div>
              </div>

              <div className="pt-2">
                <Link
                  to="/partners"
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  View full ground partners directory →
                </Link>
              </div>
            </div>

            {/* Quick Inquire with Akim Card */}
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Akim Mmari"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Akim Mmari</h4>
                  <p className="text-xs text-amber-400">Founder & Safari Architect</p>
                  <p className="text-[11px] text-stone-400">Arusha Head Office</p>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                "Want to swap a lodge, add extra days in Serengeti, or secure official Bwindi gorilla permits? Message me on WhatsApp anytime. I tailor every departure."
              </p>

              <a
                href={`https://wa.me/255784123456?text=Hello%20Akim!%20I%20am%20interested%20in%20customizing%20the%20${encodeURIComponent(itinerary.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Akim on WhatsApp</span>
              </a>

              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                <span>Reserve with 30% Deposit</span>
              </button>
            </div>

            {/* Permit Policy Reminder */}
            {itinerary.gorillaPermitRequired && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 space-y-1">
                <strong className="text-white block font-semibold">Gorilla Permit Policy:</strong>
                Permits are strictly non-refundable by government authorities. We purchase your official UWA/RDB permit on your 30% deposit and send official scanned receipts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <StickyBookBar
        itinerary={itinerary}
        currency={currency}
        selectedTier={selectedTier}
        onOpenDepositModal={() => setIsDepositModalOpen(true)}
      />

      {/* 30% Deposit Payment Modal */}
      {isDepositModalOpen && (
        <DepositPaymentModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          itinerary={itinerary}
          currency={currency}
          initialTier={selectedTier}
        />
      )}
    </div>
  );
};
