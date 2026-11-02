import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, ArrowRight, Play, Shield, Compass, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';
import { getTranslation } from '../lib/i18n';

interface VideoHeroProps {
  currentLanguage: LanguageCode;
  averageRating: number;
  reviewCount: number;
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  currentLanguage,
  averageRating,
  reviewCount,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const t = (key: string) => getTranslation(currentLanguage, key);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
      {/* Background Media: High resolution cinematic fallback + subtle ambient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&auto=format&fit=crop&q=85"
          alt="Serengeti landscape wildlife safari"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          loading="eager"
        />
        {/* Cinematic gradients for contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/40"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Live average rating badge */}
        <Link
          to="/reviews"
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 border border-stone-700/80 backdrop-blur-md text-xs text-stone-200 transition-all shadow-lg hover:border-amber-500/60 mb-6 group"
        >
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="font-semibold text-white">{averageRating.toFixed(2)} / 5</span>
          <span className="text-stone-400">({reviewCount} verified guest reviews)</span>
          <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display max-w-4xl leading-[1.12]">
          Unvarnished East Africa.{' '}
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Tailor-Made Craftsmanship.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl font-light leading-relaxed">
          Boutique safari architects headquartered in Arusha. We craft private journeys across Tanzania, Kenya, Rwanda, and Uganda—with named, accredited ground partners and guaranteed official gorilla permits.
        </p>

        {/* Operating Pillars micro-pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-stone-300">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/60 border border-stone-800 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Named AUTO & KATO Partners</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/60 border border-stone-800 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Uganda ($800) & Rwanda ($1,500) Permits</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/60 border border-stone-800 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Founder Akim: 24/7 WhatsApp Lifeline</span>
          </span>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/trip-planner"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-xl shadow-amber-900/40 hover:shadow-2xl hover:scale-[1.02]"
          >
            <span>{t('btn_start_planner')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20am%20exploring%20an%20East%20African%20safari%20and%20would%20love%20to%20discuss%20itineraries."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white font-semibold text-sm transition-all duration-200 border border-emerald-500/40 shadow-lg backdrop-blur-sm"
          >
            <MessageCircle className="w-5 h-5 text-emerald-300" />
            <span>Direct WhatsApp Handoff</span>
          </a>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-4 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 font-medium text-sm transition-all duration-200 border border-stone-700/60 backdrop-blur-sm group"
          >
            <Play className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Watch Field Reel (2 min)</span>
          </button>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-10 text-xs text-stone-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{t('deposit_guarantee')}</span>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div className="text-sm font-semibold text-stone-200 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>Ganda Safaris: On Location in Serengeti & Bwindi</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm font-bold px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {/* Fallback player with authentic safari footage simulation */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
                title="Ganda Safaris Field Highlights"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 bg-stone-950 text-xs text-stone-400 flex items-center justify-between">
              <span>Featuring custom pop-top Land Cruisers & UWA gorilla trackers.</span>
              <Link
                to="/trip-planner"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Plan this trip →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
