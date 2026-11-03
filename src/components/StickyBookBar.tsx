import React from 'react';
import { MessageCircle, CalendarCheck, ShieldCheck } from 'lucide-react';
import { ComfortTier } from '../types';
import { formatPrice } from '../lib/currency';
import { useInquiry } from '../context/InquiryContext';
import { getWhatsAppUrl, AVAILABILITY_PROMISE } from '../data/seedData';

interface StickyBookBarProps {
  title: string;
  subtitle: string;
  pricePerPersonUSD?: number;
  selectedTier?: ComfortTier;
  guideSlug?: string;
  experienceSlug?: string;
  ctaLabel?: string;
}

export const StickyBookBar: React.FC<StickyBookBarProps> = ({
  title,
  subtitle,
  pricePerPersonUSD,
  selectedTier = 'luxury' as ComfortTier,
  guideSlug,
  experienceSlug,
  ctaLabel = 'Request This Safari',
}) => {
  const { currency, openInquiryModal } = useInquiry();

  const whatsappText = `Oli otya! I am interested in "${title}"${
    guideSlug ? ` with guide ${guideSlug}` : ''
  }. Could you confirm availability with UWA and lodges?`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1A1612]/95 backdrop-blur-md border-t border-[#383028] text-[#FAF7F2] px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#D99B26] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{subtitle}</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-lg sm:text-xl font-bold text-white truncate">
                {title}
              </span>
              {pricePerPersonUSD !== undefined && (
                <span className="font-mono text-sm sm:text-base font-bold text-[#D99B26]">
                  From {formatPrice(pricePerPersonUSD, currency)} pp ({selectedTier})
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#D6CEC2] hidden md:block">
              {AVAILABILITY_PROMISE}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <a
            href={getWhatsAppUrl(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#287A47] text-[#FAF7F2] border border-[#34945A] text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#D99B26]" />
            <span>WhatsApp Entebbe Desk</span>
          </a>

          <button
            type="button"
            onClick={() =>
              openInquiryModal({
                guideSlug,
                experienceSlug,
                defaultTier: selectedTier,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{ctaLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
