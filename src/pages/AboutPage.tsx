import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Plane,
  ShieldCheck,
  Users,
  ArrowRight,
  Award,
} from 'lucide-react';
import {
  BRAND_TAGLINE,
  HQ_ADDRESS,
  HQ_AIRPORT_NOTE,
  GUIDES,
} from '../data/seedData';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { SocialLinks } from '../components/SocialLinks';
import { FrequentlyAskedQuestions } from '../components/FrequentlyAskedQuestions';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="About Enganda Safaris | Our Ugandan Guide Collective, FAQ & Entebbe Head Office"
        description="Learn the story behind Enganda Safaris — a curated collective of 8 licensed local Ugandan safari guides in Entebbe, plus visa, vaccination, and packing FAQs."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Hero Story */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Why We Built Enganda Safaris in Entebbe</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
              “{BRAND_TAGLINE}”
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              In Luganda and Runyankole, <em className="text-white">Enganda</em> speaks to kinship, family, and the people who welcome you home. We founded Enganda Safaris around a simple truth that every seasoned traveler eventually discovers: <strong className="text-white">the guide is the product</strong>.
            </p>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              You can sleep in the most expensive lodge in Africa, but if your guide does not know the alarm call of a red-tailed monkey in Kibale or the family history of the Rushegura silverback in Bwindi, you only see the surface of Uganda. Enganda brings together eight of Uganda’s finest licensed regional guides under one accountable coordination desk in Entebbe.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#safari-faq"
                className="inline-flex items-center gap-2 bg-[#D99B26] hover:bg-[#c3881d] text-[#1A1612] text-xs font-semibold px-4 py-2.5 rounded-md transition-colors"
              >
                <span>Read Safari Planning FAQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 bg-[#1B5632] hover:bg-[#144225] border border-[#34945A] text-[#FAF7F2] text-xs font-semibold px-4 py-2.5 rounded-md transition-colors"
              >
                <span>Meet Our Guides & Partners</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#1B5632] border border-[#34945A] rounded-lg p-6 space-y-4">
            <div className="font-mono text-xs uppercase text-[#D99B26] font-semibold">
              Collective Snapshot
            </div>
            <div className="space-y-3 text-xs text-[#E4DCCF]">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Head Office:</span>
                <strong className="text-white">Bugonga, Entebbe</strong>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Airport Proximity:</span>
                <strong className="text-[#D99B26]">{HQ_AIRPORT_NOTE}</strong>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Licensed Ugandan Guides:</span>
                <strong className="text-white">{GUIDES.length} Regional Specialists</strong>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Geographic Focus:</span>
                <strong className="text-white">100% Uganda Exclusive</strong>
              </div>
              <div className="flex justify-between">
                <span>Accreditations:</span>
                <strong className="text-white">UTB & AUTO</strong>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-semibold">
                Connect on X, Instagram & LinkedIn
              </div>
              <SocialLinks variant="hero-dark" showLabels={true} />
            </div>
          </div>
        </div>

        {/* Core Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-2.5">
            <Users className="w-6 h-6 text-[#C85A28]" />
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Named Guides, Never Anonymous Drivers
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
              Every guide on our website is a real, named Ugandan naturalist with published years of experience, spoken languages, and regional specialties.
            </p>
          </div>

          <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-2.5">
            <ShieldCheck className="w-6 h-6 text-[#226B3E]" />
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              100% Dedicated to Uganda
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
              We do not spread ourselves thin across half a continent. By focusing exclusively on Uganda’s nine core safari regions, our Entebbe desk maintains deep, daily relationships with UWA wardens and lodge managers.
            </p>
          </div>

          <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-2.5">
            <Award className="w-6 h-6 text-[#2D6A4F]" />
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Radical Permit & Pricing Clarity
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
              We publish verified UWA permit tariffs openly, share your official UWA permit receipts before collecting your balance, and confirm lodge availability within 12 hours.
            </p>
          </div>
        </section>

        {/* Meet the Collective Strip */}
        <section className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                8 Specialists Across 9 Regions
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                The Faces of Enganda Safaris
              </h2>
            </div>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#226B3E] hover:text-[#C85A28]"
            >
              <span>Browse Guides & Partners Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {GUIDES.map((g) => (
              <Link
                key={g.id}
                to={`/guides/${g.slug}`}
                className="group text-center space-y-2"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#C85A28] group-hover:scale-105 transition-transform">
                  <SmartImage
                    src={g.photo}
                    alt={g.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A1612] group-hover:text-[#C85A28] leading-tight">
                    {g.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#5A5248] truncate">
                    {g.homeRegion}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions Component */}
        <FrequentlyAskedQuestions />

        {/* Entebbe HQ Overview & Map */}
        <section className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-4 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#C85A28] font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Our Entebbe Head Office</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
              Mugwanya Road, Bugonga, Entebbe
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Our coordination office is located on <strong className="text-[#1A1612]">{HQ_ADDRESS}</strong> — a quiet, leafy lakeside neighborhood just <strong className="text-[#226B3E]">{HQ_AIRPORT_NOTE}</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-semibold">
              <Plane className="w-4 h-4" />
              <span>Complimentary airport meet & greet on every Enganda safari</span>
            </div>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold px-5 py-3 rounded-md transition-colors"
              >
                <span>Contact Our Entebbe Office</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[320px] bg-[#F3ECE1]">
            <iframe
              title="Enganda Safaris Head Office — Mugwanya Road, Bugonga, Entebbe, Uganda"
              src="https://www.openstreetmap.org/export/embed.html?bbox=32.445%2C0.038%2C32.482%2C0.065&layer=mapnik&marker=0.0512%2C32.4637"
              className="w-full h-full min-h-[320px] border-0"
              loading="lazy"
            />
          </div>
        </section>

        {/* Connect With Enganda Safaris On Social Media */}
        <section className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                Field Dispatches & Community Updates
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                Follow Our Guides on X, Instagram & LinkedIn
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5A5248] max-w-md leading-relaxed">
              Daily trail conditions, Bwindi gorilla and Kibale chimpanzee sightings, Mabamba Shoebill reports, and conservation partnerships from across Uganda.
            </p>
          </div>
          <SocialLinks variant="cards" />
        </section>
      </div>
    </div>
  );
};
