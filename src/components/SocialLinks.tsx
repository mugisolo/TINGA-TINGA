import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/seedData';
import { SocialLink } from '../types';

export const SocialIcon: React.FC<{
  platform: SocialLink['platform'];
  className?: string;
}> = ({ platform, className = 'w-4 h-4' }) => {
  if (platform === 'x') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (platform === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
};

export interface SocialLinksProps {
  variant?: 'hero-dark' | 'footer-dark' | 'light' | 'cards' | 'icon-only';
  showLabels?: boolean;
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  variant = 'hero-dark',
  showLabels = true,
  className = '',
}) => {
  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`.trim()}>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.platform}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Connect with Enganda Safaris on ${item.label} (${item.handle})`}
            title={`${item.label} • ${item.handle}`}
            className="text-[#D6CEC2] hover:text-[#D99B26] transition-colors p-1 rounded"
          >
            <SocialIcon platform={item.platform} className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`.trim()}>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.platform}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Connect with Enganda Safaris on ${item.label} (${item.handle})`}
            className="group bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-lg p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#226B3E] text-[#D99B26] flex items-center justify-center shrink-0 group-hover:bg-[#C85A28] group-hover:text-white transition-colors">
                  <SocialIcon platform={item.platform} className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#5A5248] group-hover:text-[#C85A28] transition-colors">
                  Follow
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1A1612] mb-0.5">
                {item.label}
              </h3>
              <p className="font-mono text-xs text-[#C85A28] font-medium mb-2.5">
                {item.handle}
              </p>
              <p className="text-xs text-[#5A5248] leading-relaxed">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    );
  }

  const baseItemStyle =
    variant === 'hero-dark'
      ? 'bg-[#1B5632]/85 hover:bg-[#226B3E] text-[#FAF7F2] border-[#D99B26]/35 hover:border-[#D99B26]'
      : variant === 'footer-dark'
      ? 'bg-[#1B5632] hover:bg-[#287A47] text-[#FAF7F2] border-[#34945A] hover:border-[#D99B26]'
      : 'bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]';

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`.trim()}>
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.platform}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Connect with Enganda Safaris on ${item.label} (${item.handle})`}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${baseItemStyle}`}
        >
          <SocialIcon
            platform={item.platform}
            className="w-3.5 h-3.5 text-[#D99B26] shrink-0"
          />
          {showLabels && (
            <>
              <span className="font-semibold">{item.label}</span>
              <span className="font-mono text-[11px] opacity-80 hidden sm:inline">
                {item.handle}
              </span>
              <ArrowUpRight className="w-3 h-3 opacity-75 shrink-0" />
            </>
          )}
        </a>
      ))}
    </div>
  );
};

export const SocialStrip = SocialLinks;

export default SocialLinks;
