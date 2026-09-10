import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Compass, MessageCircle, CheckCircle2, Clock, FileText, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

export const HowWeWorkPage: React.FC = () => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The Transparency Manifesto</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            How We Work & Operating Charter
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Most international agencies operate as booking desks that hide their subcontracted local providers behind vague labels. Here is our unvarnished, boutique operating standard.
          </p>
        </div>

        {/* The 4 Principles of Tinga Tinga Safari */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="text-amber-500 font-bold text-lg font-display">1. No Hidden Subcontracting</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              We own and operate our direct safari fleet in Tanzania. In Uganda and Kenya, we openly partner with named, audited, AUTO and KATO-accredited ground operators whose license numbers we publish openly. You always know exactly who is driving you.
            </p>
          </div>

          <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="text-amber-500 font-bold text-lg font-display">2. One Accountable Human</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Founder Akim Mmari personally reviews every itinerary and is accessible on WhatsApp 24/7 throughout your safari. You are never handed off to an anonymous overseas ticketing support department.
            </p>
          </div>

          <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="text-amber-500 font-bold text-lg font-display">3. Official Permit Receipt Guarantee</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              When you pay your 30% trip deposit, we immediately secure your official Uganda Wildlife Authority (UWA) or Rwanda Development Board (RDB) gorilla permits. We scan and deliver the official government receipt before your final balance is due.
            </p>
          </div>

          <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-3">
            <div className="text-amber-500 font-bold text-lg font-display">4. Fair Living Wages for Staff</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Our guides, trackers, and camp porters receive top-tier daily salaries, comprehensive medical insurance, and AMREF Flying Doctors evacuation coverage. We never exploit local community personnel to discount prices.
            </p>
          </div>
        </div>

        {/* Step-by-Step Booking to Departure Timeline */}
        <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 space-y-8">
          <h2 className="text-2xl font-bold text-white font-display text-center">
            Booking-to-Departure Timeline
          </h2>

          <div className="space-y-6 relative border-l-2 border-amber-600/40 ml-4 sm:ml-8 pl-6 sm:pl-8">
            <div className="relative">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-amber-600 text-stone-950 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-white">Stage 1: Custom Route Architecture (Days 1–3)</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                You submit your dates and preferred circuit via our Trip Planner or WhatsApp. Akim checks migration movements, park tracks, and flight connections, delivering a custom day-by-day outline within 12 hours.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-stone-800 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/40">
                2
              </span>
              <h3 className="text-base font-bold text-white">Stage 2: 30% Trip Deposit & Permit Securing</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                You accept the proposal and pay the 30% trip deposit via DPO Group, Stripe, or PayPal. We immediately reserve your private 4x4 pop-top Land Cruiser and purchase official government gorilla and chimp permits.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-stone-800 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/40">
                3
              </span>
              <h3 className="text-base font-bold text-white">Stage 3: Verified Government Receipts & Lodge Vouchers</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Within 5 business days of deposit confirmation, we send scanned copies of your official UWA/RDB permit cards with assigned tracking sectors (Buhoma, Ruhija, Rushaga, or Nkuringo).
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-stone-800 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/40">
                4
              </span>
              <h3 className="text-base font-bold text-white">Stage 4: 70% Final Balance (60 Days Prior to Safari)</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                The final 70% trip balance is due 60 days before departure. You receive your comprehensive Safari Briefing Pack, guide profile, vehicle registration details, and packing checklist.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                5
              </span>
              <h3 className="text-base font-bold text-white">Stage 5: Touchdown in East Africa & 24/7 Lifeline</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Your dedicated guide welcomes you at the arrivals terminal (JRO, EBB, KGL, or NBO). Akim stays in continuous touch with your guide throughout your expedition.
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation & Booking Policy */}
        <div className="bg-stone-900/60 p-6 sm:p-8 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Cancellation Policy & Force Majeure</span>
          </div>
          <h3 className="text-lg font-bold text-white">Cancellation Terms</h3>
          <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
            <p>
              • <strong>Gorilla & Primate Permits ($800 / $1,500):</strong> Under Uganda Wildlife Authority and Rwanda Development Board statutory regulations, gorilla permits are 100% non-refundable once purchased. In case of certified medical incapacitation, government authorities permit date re-scheduling within 12 months.
            </p>
            <p>
              • <strong>Safari Package (Excluding Permits):</strong> Cancellations made more than 61 days prior to departure forfeit the initial deposit or can be rolled over to future dates without administrative penalty. Cancellations 30–60 days prior incur a 50% charge; cancellations within 29 days incur 100% lodge forfeiture.
            </p>
            <p>
              • <strong>AMREF Flying Doctors Coverage:</strong> Included for all guests at zero additional charge for 500km emergency medical evacuation.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            to="/trip-planner"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
          >
            <span>Start Your Tailor-Made Safari Design</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
