import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, ShieldAlert, UserCheck, ArrowRight } from 'lucide-react';
import { LanguageCode } from '../types';
import { getTranslation } from '../lib/i18n';

interface HowWeWorkStripProps {
  currentLanguage: LanguageCode;
}

export const HowWeWorkStrip: React.FC<HowWeWorkStripProps> = ({ currentLanguage }) => {
  const t = (key: string) => getTranslation(currentLanguage, key);

  const steps = [
    {
      number: '01',
      icon: Palette,
      title: t('hww_step1_title'),
      desc: t('hww_step1_desc'),
      detail: 'Every itinerary is built from a blank slate with founder Akim. We match private 4x4 vehicles, wildlife migration phases, and preferred lodge character without rigid cookie-cutter packages.',
      link: '/trip-planner',
      linkText: 'Start Custom Design',
    },
    {
      number: '02',
      icon: ShieldAlert,
      title: t('hww_step2_title'),
      desc: t('hww_step2_desc'),
      detail: 'Unlike booking agencies that hide who actually drives you, we proudly publish our named ground partners in Uganda and Kenya. AUTO & KATO-accredited with published license numbers.',
      link: '/partners',
      linkText: 'View Partner Directory',
    },
    {
      number: '03',
      icon: UserCheck,
      title: t('hww_step3_title'),
      desc: t('hww_step3_desc'),
      detail: 'Founder Akim is your dedicated safari architect and remains on WhatsApp 24/7. If a flight delays or an elephant blocks a track, you have one accountable human solving it.',
      link: '/how-we-work',
      linkText: 'Read Our Accountability Charter',
    },
  ];

  return (
    <section className="bg-stone-900 text-stone-100 py-16 border-y border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-2">
            The Tinga Tinga Operating Standard
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
            How We Work: Radical Transparency in East African Safaris
          </h2>
          <p className="mt-3 text-sm text-stone-300">
            Most international agencies operate as middleman brokerages, hiding subcontracting and inflating permit fees. Here is how our boutique model protects you:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-stone-950/80 rounded-2xl p-8 border border-stone-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-stone-950 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-stone-800 font-display group-hover:text-stone-700 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-500/90 mb-3">
                    {step.desc}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-800/80">
                  <Link
                    to={step.link}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors"
                  >
                    <span>{step.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
