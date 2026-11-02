import React from 'react';
import { ShieldCheck, Lock, AlertCircle, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WalletTermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/wallet" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:text-amber-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Safari Wallet
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Ganda Safari Wallet & Escrow Terms
              </h1>
              <p className="text-stone-700 text-sm">
                Official Transparency Manifesto • Ganda Safaris and Holiday (Arusha, Tanzania)
              </p>
            </div>
          </div>

          <div className="space-y-8 text-stone-700 leading-relaxed">
            {/* 1. Travel Credits Declaration */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-800" />
                1. Dedicated Safari Travel Credits (Non-Banking Declaration)
              </h2>
              <div className="bg-amber-50/80 border-l-4 border-amber-800 p-4 rounded-r-lg text-sm text-amber-950 mb-3">
                <strong>Important Notice:</strong> Ganda Safaris is an independent, licensed boutique tour operator in Arusha, Tanzania (License #TTBL-TZ-2018-842), not a commercial banking or deposit-taking institution.
              </div>
              <p className="text-sm">
                All balances stored in your Ganda Safari Wallet represent prepaid travel credits denominated in United States Dollars (USD). These credits are exclusively redeemable toward wilderness safaris, primate trekking expeditions, mountain climbing circuits, and associated logistics operated by Ganda Safaris across Tanzania, Uganda, Rwanda, and Kenya.
              </p>
            </section>

            {/* 2. Escrow Protection Mechanism */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-emerald-800" />
                2. How the Escrow Mechanism Protects You
              </h2>
              <p className="text-sm mb-3">
                When you authorize a 30% trip deposit from your wallet, funds are placed into an <strong>Escrow Hold</strong>:
              </p>
              <ul className="space-y-2 text-sm text-stone-800 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span><strong>Funds Held Safely:</strong> The deposit is held in escrow until founder Akim Mmari personally confirms your private 4x4 pop-top Land Cruiser and secures official statutory gorilla permits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span><strong>12-Hour Confirmation Window:</strong> Akim’s team checks live lodge inventory and confirms reservation details within 12 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <span><strong>Immediate Release if Unavailable:</strong> If your requested dates or preferred luxury lodges cannot be accommodated, the escrow hold is released immediately back to your available balance at zero cost.</span>
                </li>
              </ul>
            </section>

            {/* 3. Statutory Primate Permits */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-rose-800" />
                3. Statutory Gorilla & Chimpanzee Permits Policy
              </h2>
              <p className="text-sm mb-2">
                Mountain gorilla permits are issued directly by the sovereign wildlife authorities of Uganda (UWA: $800 USD) and Rwanda (RDB: $1,500 USD).
              </p>
              <p className="text-sm">
                Under Ugandan and Rwandan statutory regulations, government primate permits are strictly non-refundable and tied to specific traveler passport numbers. Once Akim captures your escrow deposit and purchases your government permits, permit costs cannot be refunded by Ganda Safaris unless officially sanctioned and refunded by UWA or RDB. Scanned government permit cards are delivered to your Google Drive permit vault.
              </p>
            </section>

            {/* 4. Refunds & Reversals */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-amber-800" />
                4. Transparent Refund Procedures
              </h2>
              <p className="text-sm mb-3">
                In the event of an approved circuit cancellation outside the statutory permit exclusion:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Instant Wallet Credit</h4>
                  <p className="text-xs text-stone-600">
                    Refunds credited to your Ganda Safari Wallet are available instantly (0% processing fee) and never expire. They can be applied to any rescheduled circuit or transferred to a family member.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Original Payment Method</h4>
                  <p className="text-xs text-stone-600">
                    If requested, credit card refunds via DPO Group or Stripe are processed within 5 to 7 banking business days, subject to card issuer network reversal times.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Currency & Rates */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 mb-2">
                5. Currency & Exchange Rates
              </h2>
              <p className="text-sm">
                The base ledger currency for Ganda Safaris is the United States Dollar (USD). All display conversions into Tanzanian Shillings (TZS), Ugandan Shillings (UGX), Kenyan Shillings (KES), Euros (EUR), and British Pounds (GBP) use fixed reference rates published by our Arusha financial office. We do not make live FX market guarantees; billing settles in USD.
              </p>
            </section>

            {/* Contact */}
            <div className="pt-6 border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                Ganda Safaris and Holiday Ltd • Clock Tower Roundabout, Arusha, Tanzania
              </div>
              <div className="text-amber-900 font-medium">
                Questions? WhatsApp Akim: +255 784 123 456
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
