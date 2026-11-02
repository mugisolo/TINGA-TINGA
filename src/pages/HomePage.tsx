import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoHero } from '../components/VideoHero';
import { HowWeWorkStrip } from '../components/HowWeWorkStrip';
import { ItineraryCard } from '../components/ItineraryCard';
import { DepositPaymentModal } from '../components/DepositPaymentModal';
import { ITINERARIES, REVIEWS, GROUND_PARTNERS } from '../data/seedData';
import { Currency, LanguageCode, DestinationCountry, Itinerary } from '../types';
import { Compass, ShieldCheck, Sparkles, MessageCircle, ArrowRight, Star, CheckCircle, ExternalLink, MapPin } from 'lucide-react';
import { formatPrice } from '../lib/currency';

interface HomePageProps {
  currency: Currency;
  language: LanguageCode;
}

export const HomePage: React.FC<HomePageProps> = ({ currency, language }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedItineraryForDeposit, setSelectedItineraryForDeposit] = useState<Itinerary | null>(null);

  const countries = ['All', 'Tanzania', 'Uganda', 'Rwanda', 'Kenya', 'Cross-Border'];

  const filteredItineraries = ITINERARIES.filter((item) => {
    if (selectedCountry === 'All') return true;
    if (selectedCountry === 'Cross-Border') return item.countries.length > 1;
    return item.countries.includes(selectedCountry as DestinationCountry);
  });

  const averageRating = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length;

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      {/* 1. Video-capable Hero Section */}
      <VideoHero
        currentLanguage={language}
        averageRating={averageRating}
        reviewCount={128}
      />

      {/* 2. 3-Step "How We Work" Strip */}
      <HowWeWorkStrip currentLanguage={language} />

      {/* 3. Featured Circuits & Itineraries Section */}
      <section id="circuits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-2">
              Bespoke Circuits
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
              Handcrafted East African Expeditions
            </h2>
            <p className="mt-2 text-sm text-stone-400 max-w-xl">
              Each itinerary is an architected foundation—adaptable to your flight dates, preferred lodge aesthetics, and wildlife migration phases.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCountry === country
                    ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-900/30 font-bold'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Itinerary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItineraries.map((itin) => (
            <ItineraryCard
              key={itin.id}
              itinerary={itin}
              currency={currency}
              onOpenDepositModal={(item) => setSelectedItineraryForDeposit(item)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/trip-planner"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-semibold text-sm transition-all shadow-lg hover:border-amber-500"
          >
            <span>Need a completely custom multi-country route? Launch Trip Planner</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </section>

      {/* 4. Radical Transparency: Named Ground Partners Section */}
      <section className="py-16 bg-stone-900/60 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
                Ethics & Accountability
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white font-display leading-snug">
                Why We Openly Name Our Local Ground Partners
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Most international agencies subcontract to local African operators under opaque "white-label" NDA agreements. They mark up costs by 40% while hiding who is actually driving you.
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                At Ganda Safaris, we run our own direct operations in Tanzania, and partner with named, audited, AUTO and KATO-licensed operations in Uganda and Kenya. You get total transparency, fair porter wages, and direct accountability.
              </p>

              <div className="pt-2">
                <Link
                  to="/partners"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>Explore the Verified Ground Partner Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GROUND_PARTNERS.map((partner) => (
                <div
                  key={partner.id}
                  className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-3 hover:border-stone-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{partner.country}</span>
                    <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                      Lic #{partner.licenseNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{partner.partnerName}</h4>
                  <div className="text-xs text-stone-400 space-y-1">
                    <div><strong>Fleet:</strong> {partner.fleetSpecs}</div>
                    <div><strong>Coverage:</strong> {partner.insuranceSpecs}</div>
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center space-x-1 pt-1 border-t border-stone-900">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>HQ: {partner.headquarters}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Gorilla Trekking Permit Transparency Box */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                Official UWA & RDB Regulatory Facts
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Gorilla Permits: Uganda ($800) vs. Rwanda ($1,500)
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Trek with wild mountain gorillas in Bwindi Impenetrable National Park or Volcanoes National Park. We purchase official permits directly from government wildlife authorities on your behalf and deliver official scanned receipts prior to final trip payment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-semibold">Uganda (Bwindi / Mgahinga)</div>
                  <div className="text-2xl font-black text-amber-400 font-display mt-1">
                    {formatPrice(800, currency)}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Official UWA tariff. Dense rainforest, longer treks, pristine wilderness.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-semibold">Rwanda (Volcanoes NP)</div>
                  <div className="text-2xl font-black text-amber-400 font-display mt-1">
                    {formatPrice(1500, currency)}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Official RDB tariff. Shorter driving distances from Kigali airport, bamboo slopes.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/permits"
                  className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Read Full Permit Policy & Guide
                </Link>
                <a
                  href="https://wa.me/255784123456?text=Hello%20Akim,%20can%20you%20check%20gorilla%20permit%20availability%20for%20my%20dates?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs border border-stone-700 transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Check Live Availability with Akim</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-stone-700 shadow-xl relative">
                <img
                  src="https://images.unsplash.com/photo-1574063413132-355dbfd83e12?w=800&auto=format&fit=crop&q=80"
                  alt="Mountain Gorilla in Bwindi Impenetrable Forest"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-stone-950/90 border border-stone-800 text-[11px] text-stone-300">
                  <span className="font-semibold text-white block">Strict Conservation Protocols:</span>
                  1 hour maximum viewing, 10-meter distance rule, masks provided for primate respiratory protection.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Guest Reviews & Field Testimonials */}
      <section className="py-16 bg-stone-900/40 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-2">
                Unfiltered Guest Experiences
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white font-display">
                What Our Safari Travelers Say
              </h2>
            </div>
            <Link
              to="/reviews"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 mt-2 md:mt-0 flex items-center space-x-1"
            >
              <span>View all 128 verified reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-col justify-between space-y-4 hover:border-stone-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    "{rev.title}"
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-4">
                    {rev.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-900 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-200">{rev.guestName}</div>
                    <div className="text-[11px] text-stone-500">{rev.country} • {rev.tripMonthYear}</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded font-medium">
                    Verified Guest
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action Footer Banner */}
      <section className="py-20 bg-stone-950 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-stone-950 flex items-center justify-center mx-auto font-black shadow-xl shadow-amber-900/30">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white font-display leading-tight">
            Ready to Plan an Unforgettable Journey?
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Begin with our interactive Safari Architect or reach founder Akim directly on WhatsApp. We typically turn around a complete custom day-by-day outline within 12 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/trip-planner"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-900/40"
            >
              Launch Custom Trip Planner
            </Link>
            <a
              href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20would%20like%20to%20start%20planning%20an%20East%20African%20safari."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs tracking-wide transition-all border border-emerald-500/40 flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp with Akim</span>
            </a>
          </div>
        </div>
      </section>

      {/* 30% Deposit Modal */}
      {selectedItineraryForDeposit && (
        <DepositPaymentModal
          isOpen={!!selectedItineraryForDeposit}
          onClose={() => setSelectedItineraryForDeposit(null)}
          itinerary={selectedItineraryForDeposit}
          currency={currency}
        />
      )}
    </div>
  );
};
