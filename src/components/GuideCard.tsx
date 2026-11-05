import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Languages, Award, ArrowRight } from 'lucide-react';
import { Guide } from '../types';
import { SPECIALTY_LABELS } from '../data/seedData';
import { SmartImage } from './SmartImage';
import { useLanguage } from '../context/LanguageContext';

interface GuideCardProps {
  guide: Guide;
  onRequestGuide?: (guide: Guide) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onRequestGuide }) => {
  const { t } = useLanguage();

  return (
    <article className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:border-[#C85A28]/60 shadow-xs">
      <div>
        {/* Portrait Header */}
        <div className="relative h-72 overflow-hidden bg-[#226B3E]">
          <SmartImage
            src={guide.photo}
            alt={`${guide.name} — Ugandan Safari Guide (${guide.homeRegion})`}
            fallbackLabel={guide.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 via-transparent to-transparent" />

          {/* Top Home Region Tag */}
          <div className="absolute top-3 left-3 bg-[#1A1612]/85 backdrop-blur-xs text-[#FAF7F2] px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border border-white/15">
            <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>{guide.homeRegion}</span>
          </div>

          {/* Experience & Rating */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-[#FAF7F2]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#D99B26] block">
                {guide.yearsExperience} {t.common.yearsExperience}
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight text-white">
                {guide.name}
              </h3>
            </div>
            <div className="bg-[#1A1612]/80 px-2 py-1 rounded-md border border-white/15 flex items-center gap-1 text-xs font-mono">
              <Star className="w-3.5 h-3.5 text-[#D99B26] fill-[#D99B26]" />
              <span>{guide.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm font-medium text-[#1A1612] leading-snug">
            {guide.tagline}
          </p>

          <p className="text-xs text-[#5A5248] leading-relaxed line-clamp-3">
            “{guide.bio}”
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5">
            {guide.specialties.map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 text-[11px] font-medium bg-[#F3ECE1] text-[#226B3E] border border-[#E4DCCF] rounded-md"
              >
                {SPECIALTY_LABELS[spec] || spec}
              </span>
            ))}
          </div>

          {/* Languages & Credentials */}
          <div className="pt-2 border-t border-[#E4DCCF] space-y-1.5 text-xs text-[#5A5248]">
            <div className="flex items-center gap-2">
              <Languages className="w-3.5 h-3.5 text-[#C85A28] flex-shrink-0" />
              <span className="truncate">{guide.languages.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#226B3E] flex-shrink-0" />
              <span className="truncate">{guide.certifications[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-2">
        <Link
          to={`/guides/${guide.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-[#FAF7F2] text-xs font-semibold transition-colors"
        >
          <span>{t.generator.viewProfile}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {onRequestGuide ? (
          <button
            type="button"
            onClick={() => onRequestGuide(guide)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.common.requestGuide}
          </button>
        ) : (
          <Link
            to={`/trip-planner?guide=${guide.slug}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors"
          >
            {t.common.requestGuide}
          </Link>
        )}
      </div>
    </article>
  );
};
