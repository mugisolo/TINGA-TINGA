import React from 'react';
import { PERMITS_DATA } from '../data/seedData';
import { Currency } from '../types';
import { formatPrice } from '../lib/currency';
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle, MessageCircle, Clock, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PermitsPageProps {
  currency: Currency;
}

export const PermitsPage: React.FC<PermitsPageProps> = ({ currency }) => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Wildlife Authority Regulations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Gorilla & Primate Trekking Permit Guide
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Everything you need to know about purchasing official government gorilla trekking permits in Uganda and Rwanda. We purchase official permits directly from UWA and RDB and provide official receipts.
          </p>
        </div>

        {/* Comparison Cards: Uganda vs Rwanda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Uganda Card */}
          <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Uganda Wildlife Authority (UWA)
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">Bwindi & Mgahinga</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400 font-display">
                    {formatPrice(800, currency)}
                  </div>
                  <span className="text-[10px] text-stone-400">per person / trek</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                <p>
                  • <strong>Time with Gorillas:</strong> 1 full hour with a habituated gorilla family once located.
                </p>
                <p>
                  • <strong>Terrain & Altitude:</strong> Lush, ancient montane rainforest (1,160m – 2,607m). Steeper, wilder trek offering an authentic rainforest expedition.
                </p>
                <p>
                  • <strong>Trekking Sectors:</strong> Buhoma, Ruhija, Rushaga, Nkuringo.
                </p>
                <p>
                  • <strong>Habituation Upgrade ($1,500):</strong> Spend 4 full hours with researchers in Rushaga habituating a semi-wild family.
                </p>
                <p>
                  • <strong>Logistics:</strong> 8-9 hour scenic drive from Entebbe, or short 1.5-hour scheduled bush flight (Aerolink) to Kihihi/Kisoro airstrips.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">Available Daily: 152 permits total</span>
              <a
                href="https://wa.me/255784123456?text=Hello%20Akim,%20can%20you%20check%20Uganda%20Bwindi%20gorilla%20permit%20availability%20for%20my%20dates?"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
              >
                Inquire Uganda
              </a>
            </div>
          </div>

          {/* Rwanda Card */}
          <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Rwanda Development Board (RDB)
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">Volcanoes National Park</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400 font-display">
                    {formatPrice(1500, currency)}
                  </div>
                  <span className="text-[10px] text-stone-400">per person / trek</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                <p>
                  • <strong>Time with Gorillas:</strong> 1 full hour with habituated gorilla family (max 8 trekkers per group).
                </p>
                <p>
                  • <strong>Terrain & Altitude:</strong> Virunga volcano slopes (2,500m – 4,000m) dominated by bamboo forests. Slightly more open visibility than Bwindi.
                </p>
                <p>
                  • <strong>Key Advantage:</strong> Proximity to capital. Smooth 2.5-hour paved highway drive from Kigali International Airport (KGL). Ideal for guests with limited holiday days.
                </p>
                <p>
                  • <strong>Golden Monkeys ($100):</strong> Can be paired with gorilla trekking in Volcanoes NP.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">Available Daily: 96 permits total</span>
              <a
                href="https://wa.me/255784123456?text=Hello%20Akim,%20can%20you%20check%20Rwanda%20Volcanoes%20gorilla%20permit%20availability%20for%20my%20dates?"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
              >
                Inquire Rwanda
              </a>
            </div>
          </div>
        </div>

        {/* Vital Permit Facts Table & Requirements */}
        <div className="bg-stone-900/60 rounded-3xl p-8 border border-stone-800 space-y-6">
          <h3 className="text-xl font-bold text-white font-display">
            Essential Trekking Rules & Regulations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-300">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <Calendar className="w-4 h-4" />
                <span>6–12 Month Lead Time</span>
              </div>
              <p className="leading-relaxed">
                Permits sell out months in advance for peak dry seasons (June–September and December–February). Booking early is mandatory to guarantee matching sector lodges.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Minimum Age: 15 Years</span>
              </div>
              <p className="leading-relaxed">
                Both UWA and RDB strictly enforce the 15-year minimum age limit without exceptions. Passports are verified at park headquarters before departure into the forest.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>East Africa Tourist Visa ($100)</span>
              </div>
              <p className="leading-relaxed">
                If undertaking a cross-border circuit (e.g., landing in Kigali, trekking gorillas in Uganda, and continuing to Tanzania), the single $100 EATV visa covers Kenya, Uganda, and Rwanda seamlessly.
              </p>
            </div>
          </div>
        </div>

        {/* The Ganda Safaris Receipt Guarantee */}
        <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5" />
              <span>Official Government Receipt Guarantee</span>
            </div>
            <h4 className="text-xl font-bold text-white">Never Risk An Unconfirmed Permit</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Upon receiving your 30% trip deposit, we book directly with the national authorities. We send you the scanned official government permit confirmation card with your passport number before your final trip payment.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/trip-planner"
              className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              Plan Gorilla Safari
            </Link>
            <a
              href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20have%20questions%20about%20gorilla%20permits."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs border border-stone-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Ask Akim on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
