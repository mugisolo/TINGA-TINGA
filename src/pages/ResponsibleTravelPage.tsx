import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Users,
  Droplets,
  TreePine,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export const ResponsibleTravelPage: React.FC = () => {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Responsible Travel & Conservation Charter | Enganda Safaris"
        description="Our commitment to fair living wages for Ugandan guides and mountain porters, UWA park revenue sharing, zero single-use plastics on safari, and conservation contributions."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Stewardship of Our Ugandan Home</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Responsible Travel & Community Conservation
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Because our guides live in the communities bordering Bwindi, Kibale, Queen Elizabeth, Murchison Falls, and Kidepo, conservation is not an abstract corporate policy for us — it is the future of our own neighborhoods.
            </p>
          </div>
        </div>

        {/* 4 Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white border border-[#E4DCCF] rounded-lg p-8 space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#F3ECE1] text-[#226B3E] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
              01. Fair Wages for Guides & Trail Porters
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Dignified Compensation Above Industry Standards
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Every Enganda guide earns a professional daily retainer, full accommodation and meal allowances, and AMREF emergency medical coverage — never relying solely on tips. On gorilla and volcano treks, we actively encourage and facilitate hiring local community porters at the trailhead (US$20), providing direct household income to forest-edge families.
            </p>
          </article>

          <article className="bg-white border border-[#E4DCCF] rounded-lg p-8 space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#F3ECE1] text-[#226B3E] flex items-center justify-center">
              <TreePine className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
              02. Park-Edge Community Revenue Sharing
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Keeping Tourism Revenue in Local Ugandan Parishes
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Under Uganda Wildlife Authority regulations, 20% of park entrance fees are shared directly with communities bordering the national parks. We amplify this impact by prioritizing Ugandan-owned lodges, community-run wetlands like Bigodi and Mabamba Bay, and women’s craft and coffee cooperatives in Buhoma and Ruboni.
            </p>
          </article>

          <article className="bg-white border border-[#E4DCCF] rounded-lg p-8 space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#F3ECE1] text-[#226B3E] flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
              03. Zero Single-Use Plastics on Safari
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Stainless Steel Refillable Hydration in Every 4x4
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              A two-person week-long safari can easily generate forty disposable plastic water bottles. Instead, we equip every trip with a 20-liter food-grade drinking water dispenser and complimentary insulated stainless-steel bottles for each guest to refill throughout the journey.
            </p>
          </article>

          <article className="bg-white border border-[#E4DCCF] rounded-lg p-8 space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#F3ECE1] text-[#226B3E] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
              04. Direct Conservation Contribution per Booking
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
              Supporting Primate Veterinary Care & Wetland Guardians
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              For every confirmed safari, Enganda Safaris contributes US$25 per traveler to grass-roots Ugandan conservation initiatives — alternating between mountain gorilla veterinary health monitoring in Bwindi (Conservation Through Public Health) and Shoebill nest-protection boatmen in Mabamba Bay.
            </p>
          </article>
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612]">
              Travel With Guides Who Protect What They Show You
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
              Meet our 8 Ugandan specialists or start designing your ethical Uganda itinerary.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <span>Meet Our Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/trip-planner"
              className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <span>Plan My Safari</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
