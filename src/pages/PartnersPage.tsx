import React from 'react';
import { GROUND_PARTNERS } from '../data/seedData';
import { ShieldCheck, MapPin, CheckCircle, Car, Heart, FileCheck, Phone, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PartnersPage: React.FC = () => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accredited Ground Partner Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Our Named Local Ground Partners
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            We reject the industry practice of hidden subcontracting. You are driven by vetted, highly accredited local operators with published license numbers, state-of-the-art safari vehicles, and top-tier ethical wage commitments.
          </p>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GROUND_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="bg-stone-900 rounded-2xl border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {partner.country} Operations
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{partner.partnerName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono bg-stone-950 text-emerald-400 border border-emerald-900/60 px-2 py-1 rounded font-semibold block">
                      {partner.accreditationBody} Vetted
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-1">Lic #{partner.licenseNumber}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {partner.notes}
                </p>

                {/* Specs List */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                    <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-200 block font-semibold">Fleet Specification:</strong>
                      <span className="text-stone-400">{partner.fleetSpecs}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                    <FileCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-200 block font-semibold">Guide Credentials:</strong>
                      <span className="text-stone-400">{partner.guideCredentials}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-200 block font-semibold">Emergency & Insurance Coverage:</strong>
                      <span className="text-stone-400">{partner.insuranceSpecs}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-4 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>HQ: {partner.headquarters}</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-medium">Fair Wages Audited</span>
              </div>
            </div>
          ))}
        </div>

        {/* Why this matters callout */}
        <div className="rounded-2xl bg-stone-900/60 p-8 border border-stone-800 text-center max-w-3xl mx-auto space-y-4">
          <Heart className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-white font-display">The Ethical Ground Difference</h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            When you book through Tinga Tinga Safari, 100% of the transport and field logistics funds flow directly to certified local African businesses in Tanzania, Uganda, and Kenya. We never siphon profits through European shell entities.
          </p>
          <div className="pt-2">
            <Link
              to="/trip-planner"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Design a Circuit with Vetted Local Partners</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
