import React, { useState } from 'react';
import { REVIEWS } from '../data/seedData';
import { Review, DestinationCountry, BudgetTier } from '../types';
import { Star, ShieldCheck, CheckCircle2, Filter, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewsPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Filter reviews
  const filteredReviews = REVIEWS.filter((rev) => {
    if (selectedCountry !== 'All' && !rev.itineraryName.toLowerCase().includes(selectedCountry.toLowerCase())) {
      return false;
    }
    if (selectedTier !== 'All' && rev.budgetTier !== selectedTier) {
      return false;
    }
    return true;
  });

  const averageRating = 4.96;

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>4.96 / 5 Verified Guest Score</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Field Reviews & Guest Chronicles
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Read candid feedback from photographers, honeymooners, and multi-generational families who have traversed East Africa with Ganda Safaris.
          </p>
        </div>

        {/* Rating Breakdown Summary Box */}
        <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6 text-center md:text-left">
            <div>
              <div className="text-5xl font-black text-white font-display">4.96</div>
              <div className="flex items-center justify-center md:justify-start text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-xs text-stone-400 mt-1">128+ Verified Departures</div>
            </div>

            <div className="h-12 w-px bg-stone-800 hidden md:block"></div>

            <div className="text-xs text-stone-300 space-y-1 hidden md:block">
              <div>• <strong>Naturalist Guides:</strong> 5.0 / 5 (Wildlife spotting & safety)</div>
              <div>• <strong>Vehicles & Fleet:</strong> 4.95 / 5 (Comfort, inverters & pop-tops)</div>
              <div>• <strong>Akim's Accountability:</strong> 5.0 / 5 (24/7 WhatsApp responsiveness)</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
            >
              Submit Guest Review
            </button>
            <Link
              to="/trip-planner"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Plan Your Trip
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-400 font-medium">Destination:</span>
            {['All', 'Tanzania', 'Uganda', 'Rwanda', 'Kenya'].map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedCountry === country
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
              >
                {country}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-stone-400 font-medium">Tier:</span>
            {['All', 'Mid-Range', 'Luxury', 'Signature / Ultra-Luxe'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedTier === tier
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-stone-900 rounded-2xl border border-stone-800 p-6 sm:p-8 space-y-4 shadow-lg flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] bg-stone-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/60 font-semibold">
                    Verified Guest
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  "{rev.title}"
                </h3>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {rev.content}
                </p>

                <div className="p-3 rounded-lg bg-stone-950 text-[11px] text-stone-400 border border-stone-800/80">
                  <span className="text-amber-400 font-medium">Circuit:</span> {rev.itineraryName} ({rev.budgetTier})
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <div>
                  <span className="font-semibold text-stone-200 block">{rev.guestName}</span>
                  <span className="text-[11px] text-stone-500">{rev.country}</span>
                </div>
                <span className="text-[11px] text-stone-500">{rev.tripMonthYear}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="text-base font-bold text-white">Share Your Field Review</h3>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-stone-400">
                Did you recently return from a safari with Akim? Your direct feedback helps fellow travelers.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Asante sana! Your review has been submitted to Akim for moderation.');
                  setIsSubmitModalOpen(false);
                }}
                className="space-y-3 text-xs"
              >
                <input
                  type="text"
                  required
                  placeholder="Your Full Name & Home Country"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Itinerary / Circuit Name (e.g. Serengeti Great Migration)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your guide, vehicle, lodge experience, and wildlife sightings..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                ></textarea>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold uppercase tracking-wider"
                >
                  Submit Review to Akim
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
