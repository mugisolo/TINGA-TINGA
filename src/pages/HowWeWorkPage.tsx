import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FileCheck,
  Award,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import {
  HQ_ADDRESS,
  HQ_AIRPORT_NOTE,
  AVAILABILITY_PROMISE,
  PERMIT_RECEIPT_GUARANTEE,
} from '../data/seedData';
import { SEO } from '../components/SEO';

export const HowWeWorkPage: React.FC = () => {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="How Our Ugandan Guide Collective Works | Enganda Safaris"
        description="Discover the 4-step Enganda guide-network model, deposit protection guarantee, official UWA permit receipts, and fair wages for Ugandan guides and porters."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>The Guide Is The Product • Coordinated from Entebbe</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              How the Enganda Guide Collective Works
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Most overseas safari brokers sell you a generic package and assign whichever driver happens to be free the night before you land. Enganda Safaris was built in Entebbe to invert that model: you book a named, verified Ugandan guide who designs and leads your safari from start to finish.
            </p>
          </div>
        </div>

        {/* 4-Step Guide-Network Model */}
        <section className="space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              Our 4-Step Operating Model
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] mt-1">
              From Inquiry to Your Final Farewell in Entebbe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <span className="font-mono text-xs font-bold text-[#C85A28]">STEP 01</span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                Choose Your Focus or Guide
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                Browse our 8 Ugandan guides by specialty (mountain gorillas, chimpanzees, birding, photography, hiking, or culture) or share your interests in our Trip Planner.
              </p>
            </div>

            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <span className="font-mono text-xs font-bold text-[#C85A28]">STEP 02</span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                12-Hour Entebbe Verification
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                {AVAILABILITY_PROMISE} We never hallucinate availability — our Entebbe desk verifies real-time UWA permit slots and lodge rooms before confirming your quote.
              </p>
            </div>

            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <span className="font-mono text-xs font-bold text-[#C85A28]">STEP 03</span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                Protected Deposit & UWA Receipts
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                Your deposit is protected and only released once permits and lodges are confirmed. {PERMIT_RECEIPT_GUARANTEE}
              </p>
            </div>

            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <span className="font-mono text-xs font-bold text-[#C85A28]">STEP 04</span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                Guided Across Uganda
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide from airport pickup in Entebbe across every national park.
              </p>
            </div>
          </div>
        </section>

        {/* Deposit Protection & Transparency Commitments */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2D6A4F] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Financial & Permit Protection</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
              Your Deposit Is Protected
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Your deposit is protected and only released once permits and lodges are confirmed. Because Uganda Wildlife Authority gorilla and chimpanzee permits are strictly quota-limited (8 guests per gorilla family per day), we secure your statutory permits immediately upon confirmation and send you the official UWA receipt before collecting your trip balance.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#1A1612] pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <span>Itemized separation of statutory UWA permit fees and accommodation tiers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <span>Named Ugandan guide confirmed on your booking dossier</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                <span>Direct 24/7 support from our Entebbe office ({HQ_ADDRESS})</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#E4DCCF] rounded-lg p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
              <HeartHandshake className="w-4 h-4" />
              <span>Fair Guide Wages & Accreditations</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
              Why the Best Guides Choose Enganda
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Guides are the heroes of every journey we run. Because our collective connects travelers directly with senior Ugandan guides without layers of overseas middlemen, our guides earn dignified professional retainers, full field allowances, and comprehensive medical cover.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5">
                <ShieldCheck className="w-5 h-5 text-[#226B3E] mb-1.5" />
                <div className="text-xs font-bold text-[#1A1612]">UTB Registered</div>
                <div className="text-[11px] text-[#5A5248] mt-0.5">
                  Uganda Tourism Board regulated operator
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5">
                <Award className="w-5 h-5 text-[#C85A28] mb-1.5" />
                <div className="text-xs font-bold text-[#1A1612]">AUTO Member</div>
                <div className="text-[11px] text-[#5A5248] mt-0.5">
                  Association of Uganda Tour Operators
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5">
                <FileCheck className="w-5 h-5 text-[#2D6A4F] mb-1.5" />
                <div className="text-xs font-bold text-[#1A1612]">UWA Receipts</div>
                <div className="text-[11px] text-[#5A5248] mt-0.5">
                  Official Uganda Wildlife Authority permits
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Entebbe Office Callout */}
        <section className="bg-white border border-[#E4DCCF] rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#226B3E]">
              <MapPin className="w-4 h-4 text-[#C85A28]" />
              <span>{HQ_ADDRESS} • {HQ_AIRPORT_NOTE}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612]">
              Meet Your Guide in Entebbe Over Ugandan Coffee
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5248] max-w-2xl">
              Because our head office in Bugonga is just 5 minutes from Entebbe International Airport, every safari begins with a personal welcome and briefing with your guide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Meet Our 8 Guides</span>
            </Link>
            <Link
              to="/trip-planner"
              className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-md transition-colors"
            >
              <span>Start Planning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
