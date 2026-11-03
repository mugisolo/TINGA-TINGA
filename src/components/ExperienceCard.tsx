import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Experience } from '../types';
import { GUIDES, SPECIALTY_LABELS } from '../data/seedData';
import { formatPrice } from '../lib/currency';
import { useInquiry } from '../context/InquiryContext';
import { SmartImage } from './SmartImage';

interface ExperienceCardProps {
  experience: Experience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const { currency } = useInquiry();
  const leadGuide = GUIDES.find((g) => g.slug === experience.recommendedGuides[0]) || GUIDES[0];
  const startingBand = experience.priceBands[0];

  return (
    <article className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:border-[#226B3E]/60 shadow-xs">
      <div>
        {/* Image Header */}
        <div className="relative h-60 overflow-hidden bg-[#226B3E]">
          <SmartImage
            src={experience.heroImage}
            alt={experience.title}
            fallbackLabel={experience.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 via-transparent to-transparent" />

          {/* Duration & Region */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-[#1A1612]/85 text-[#FAF7F2] font-mono text-xs px-2.5 py-1 rounded-md border border-white/15 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{experience.durationDays} {experience.durationDays === 1 ? 'Day' : 'Days'}</span>
            </span>
            <span className="bg-[#226B3E]/90 text-[#FAF7F2] text-xs px-2.5 py-1 rounded-md border border-white/15 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{experience.region}</span>
            </span>
          </div>

          {/* Price Band Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#D99B26] block">
                From ({startingBand.tier})
              </span>
              <span className="font-mono text-xl font-bold">
                {formatPrice(startingBand.perPersonUSD, currency)}
              </span>
              <span className="text-xs text-[#E4DCCF] ml-1">/ person</span>
            </div>
            {experience.permitsRequired.length > 0 && (
              <span className="bg-[#2D6A4F] text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>UWA Permits Included</span>
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          <h3 className="font-serif text-2xl font-bold text-[#1A1612] leading-snug">
            <Link to={`/experiences/${experience.slug}`} className="hover:text-[#C85A28] transition-colors">
              {experience.title}
            </Link>
          </h3>

          <p className="text-xs text-[#5A5248] leading-relaxed line-clamp-3">
            {experience.summary}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {experience.interests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 text-[11px] bg-[#F3ECE1] text-[#1A1612] border border-[#E4DCCF] rounded-md"
              >
                {SPECIALTY_LABELS[interest] || interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Ugandan Guide Strip + CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-[#E4DCCF] bg-[#F3ECE1]/40 flex items-center justify-between gap-3">
        <Link
          to={`/guides/${leadGuide.slug}`}
          className="flex items-center gap-2.5 group min-w-0"
          title={`View lead guide ${leadGuide.name}`}
        >
          <SmartImage
            src={leadGuide.photo}
            alt={leadGuide.name}
            className="w-9 h-9 rounded-full object-cover border border-[#C85A28] flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5248] block">
              Led by Enganda Guide
            </span>
            <span className="text-xs font-semibold text-[#1A1612] group-hover:text-[#C85A28] truncate block">
              {leadGuide.name}
            </span>
          </div>
        </Link>

        <Link
          to={`/experiences/${experience.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold transition-colors flex-shrink-0"
        >
          <span>Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
