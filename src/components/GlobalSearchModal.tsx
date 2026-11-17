import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Compass,
  UserCheck,
  MapPin,
  Calendar,
  ArrowUpRight,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  EXPERIENCES,
  GUIDES,
  DESTINATIONS,
  SPECIALTY_LABELS,
} from '../data/seedData';
import { useInquiry } from '../context/InquiryContext';
import { formatPrice } from '../lib/currency';
import { Specialty } from '../types';

export type SearchFilterTab =
  | 'all'
  | 'experiences'
  | 'guides'
  | 'events'
  | 'destinations';

interface SearchResultItem {
  id: string;
  type: 'experience' | 'guide' | 'event' | 'destination';
  title: string;
  subtitle: string;
  badge: string;
  meta: string;
  priceLabel?: string;
  ratingLabel?: string;
  image: string;
  path: string;
  keywords: string[];
  onSelectCustom?: () => void;
}

const POPULAR_SEARCH_KEYWORDS = [
  'Mountain Gorillas',
  'Bwindi',
  'Kibale Chimps',
  'Shoebill Birding',
  'Kidepo Valley',
  'Murchison Falls',
  'Tree-Climbing Lions',
  'French Guide',
  'German Guide',
  'Photography',
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const navigate = useNavigate();
  const { currency, safariEvents, openInquiryModal } = useInquiry();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchFilterTab>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Build unified index of Experiences, Guides, Scheduled Events, and Destinations
  const allSearchItems: SearchResultItem[] = useMemo(() => {
    const experienceItems: SearchResultItem[] = EXPERIENCES.map((exp) => {
      const lowestBand = exp.priceBands.reduce(
        (min, b) => (b.perPersonUSD < min ? b.perPersonUSD : min),
        exp.priceBands[0]?.perPersonUSD || 1500
      );
      const specialtyWords = exp.interests.map(
        (s) => SPECIALTY_LABELS[s as Specialty] || s
      );
      const dayHighlights = exp.dayByDay.flatMap((d) => [
        d.title,
        d.location,
        ...d.wildlifeHighlights,
      ]);

      return {
        id: `exp_${exp.id}`,
        type: 'experience',
        title: exp.title,
        subtitle: exp.subtitle,
        badge: `${exp.durationDays}-Day Safari Experience`,
        meta: exp.regions.join(' • '),
        priceLabel: `From ${formatPrice(lowestBand, currency)} / person`,
        image: exp.heroImage,
        path: `/experiences/${exp.slug}`,
        keywords: [
          exp.title,
          exp.subtitle,
          exp.summary,
          exp.region,
          ...exp.regions,
          ...exp.interests,
          ...specialtyWords,
          ...dayHighlights,
          `${exp.durationDays} days`,
        ],
      };
    });

    const guideItems: SearchResultItem[] = GUIDES.map((guide) => {
      const specialtyWords = guide.specialties.map(
        (s) => SPECIALTY_LABELS[s as Specialty] || s
      );
      return {
        id: `guide_${guide.id}`,
        type: 'guide',
        title: guide.name,
        subtitle: guide.tagline,
        badge: `UTB Specialist Guide • ${guide.yearsExperience} Yrs Exp`,
        meta: `${guide.homeRegion} • Speaks ${guide.languages.join(', ')}`,
        ratingLabel: `${guide.rating.toFixed(1)} (${guide.reviewCount} reviews)`,
        image: guide.photo,
        path: `/guides/${guide.slug}`,
        keywords: [
          guide.name,
          guide.homeRegion,
          guide.tagline,
          guide.bio,
          guide.fieldStory,
          ...guide.languages,
          ...guide.specialties,
          ...specialtyWords,
          ...guide.regionsCovered,
          ...guide.certifications,
          'guide',
          'specialist',
        ],
      };
    });

    const eventItems: SearchResultItem[] = safariEvents.map((ev) => ({
      id: `evt_${ev.id}`,
      type: 'event',
      title: ev.title,
      subtitle: ev.subtitle,
      badge: `${ev.category} • ${ev.dateWindow}`,
      meta: `${ev.location} • ${ev.durationLabel}`,
      priceLabel: `${formatPrice(ev.pricePerPersonUSD, currency)} • ${ev.spotsRemaining} spots left`,
      image: ev.heroImage,
      path: ev.experienceSlug ? `/experiences/${ev.experienceSlug}` : '/',
      keywords: [
        ev.title,
        ev.shortTabLabel || '',
        ev.subtitle,
        ev.location,
        ev.category,
        ev.dateWindow,
        ev.eventTag,
        ...ev.highlights,
        'event',
        'upcoming',
        'departure',
      ],
      onSelectCustom: () => {
        onClose();
        openInquiryModal({
          guideSlug: ev.leadGuideSlug,
          experienceSlug: ev.experienceSlug,
          defaultDates: ev.dateWindow,
          defaultNotes: `Inquiry via Global Search for ${ev.title} (${ev.dateWindow})`,
        });
      },
    }));

    const destinationItems: SearchResultItem[] = DESTINATIONS.map((dest) => ({
      id: `dest_${dest.slug}`,
      type: 'destination',
      title: dest.name,
      subtitle: dest.tagline,
      badge: 'Uganda Safari Region',
      meta: `Key Wildlife: ${dest.keyWildlife.slice(0, 3).join(', ')}`,
      image: dest.heroImage,
      path: `/destinations#${dest.slug}`,
      keywords: [
        dest.name,
        dest.tagline,
        dest.summary,
        ...dest.keyWildlife,
        ...dest.highlights,
        'destination',
        'national park',
      ],
    }));

    return [
      ...experienceItems,
      ...guideItems,
      ...eventItems,
      ...destinationItems,
    ];
  }, [currency, safariEvents, onClose, openInquiryModal]);

  // Filter items by query tokens & active tab
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const tokens = cleanQuery
      ? cleanQuery.split(/\s+/).filter(Boolean)
      : [];

    return allSearchItems.filter((item) => {
      if (activeTab === 'experiences' && item.type !== 'experience') return false;
      if (activeTab === 'guides' && item.type !== 'guide') return false;
      if (activeTab === 'events' && item.type !== 'event') return false;
      if (activeTab === 'destinations' && item.type !== 'destination')
        return false;

      if (tokens.length === 0) return true;

      const haystack = [
        item.title,
        item.subtitle,
        item.badge,
        item.meta,
        ...item.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => haystack.includes(token));
    });
  }, [allSearchItems, query, activeTab]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab]);

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.onSelectCustom) {
      item.onSelectCustom();
      return;
    }
    onClose();
    navigate(item.path);
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredResults.length > 0
            ? (prev - 1 + filteredResults.length) % filteredResults.length
            : 0
        );
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(filteredResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  const experienceCount = filteredResults.filter(
    (r) => r.type === 'experience'
  ).length;
  const guideCount = filteredResults.filter((r) => r.type === 'guide').length;
  const eventCount = filteredResults.filter((r) => r.type === 'event').length;
  const destinationCount = filteredResults.filter(
    (r) => r.type === 'destination'
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1612]/65 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Global Safari Experiences and Guide Profiles Search"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in duration-150">
        {/* Top Search Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-[#E4DCCF] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#226B3E] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search safari experiences, Ugandan guides (e.g., Samuel, Grace), gorillas, birding, Kidepo..."
            className="w-full bg-transparent text-sm sm:text-base text-[#1A1612] placeholder-[#9E9385] focus:outline-none"
            aria-label="Search safari experiences or guide profiles by keywords"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-2 py-1 rounded text-xs font-mono text-[#5A5248] hover:text-[#1A1612] bg-[#F3ECE1] cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-[#E4DCCF] text-[#5A5248] hover:text-[#1A1612] hover:bg-[#F3ECE1] transition-colors cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs & Popular Keyword Chips */}
        <div className="px-4 py-2.5 bg-[#F3ECE1]/70 border-b border-[#E4DCCF] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist">
              {[
                {
                  id: 'all' as SearchFilterTab,
                  label: `All (${filteredResults.length})`,
                },
                {
                  id: 'experiences' as SearchFilterTab,
                  label: `Safari Experiences (${experienceCount})`,
                },
                {
                  id: 'guides' as SearchFilterTab,
                  label: `Guide Profiles (${guideCount})`,
                },
                {
                  id: 'events' as SearchFilterTab,
                  label: `Scheduled Trips (${eventCount})`,
                },
                {
                  id: 'destinations' as SearchFilterTab,
                  label: `Parks (${destinationCount})`,
                },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#226B3E] text-white'
                        : 'bg-white text-[#5A5248] border border-[#E4DCCF] hover:text-[#1A1612]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline font-mono text-[10px] text-[#5A5248]">
              ↑↓ Navigate · Enter Select · Esc Close
            </span>
          </div>

          {/* Quick Keyword Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-bold shrink-0">
              <Sparkles className="w-3 h-3" />
              Keywords:
            </span>
            {POPULAR_SEARCH_KEYWORDS.map((kw) => {
              const isSelected = query.toLowerCase() === kw.toLowerCase();
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(isSelected ? '' : kw)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#C85A28] text-white border-[#C85A28]'
                      : 'bg-white text-[#5A5248] border-[#E4DCCF] hover:border-[#226B3E] hover:text-[#1A1612]'
                  }`}
                >
                  {kw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Viewport */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#E4DCCF] bg-[#FAF7F2]">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="font-serif text-lg font-bold text-[#1A1612]">
                No safari experiences or guides matched &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[#5A5248] max-w-md mx-auto">
                Try searching for keywords like <strong>Gorillas</strong>,{' '}
                <strong>Bwindi</strong>, <strong>Kibale</strong>,{' '}
                <strong>Shoebill</strong>, <strong>Kidepo</strong>, or a guide
                language like <strong>French</strong> or <strong>German</strong>.
              </p>
              <div className="pt-1 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveTab('all');
                  }}
                  className="px-3.5 py-1.5 rounded bg-[#226B3E] text-white text-xs font-semibold cursor-pointer"
                >
                  Show All Experiences &amp; Guides
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/trip-planner');
                  }}
                  className="px-3.5 py-1.5 rounded bg-[#C85A28] text-white text-xs font-semibold cursor-pointer"
                >
                  Build a Custom Safari Instead
                </button>
              </div>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isHighlighted = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelectResult(item)}
                  className={`w-full p-3.5 sm:px-4 text-left flex items-center gap-3.5 transition-colors cursor-pointer ${
                    isHighlighted ? 'bg-[#F3ECE1]' : 'bg-white hover:bg-[#FAF7F2]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-[#E4DCCF] bg-[#E4DCCF]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${
                          item.type === 'experience'
                            ? 'bg-[#226B3E]/15 text-[#226B3E]'
                            : item.type === 'guide'
                            ? 'bg-[#C85A28]/15 text-[#C85A28]'
                            : item.type === 'event'
                            ? 'bg-[#D99B26]/20 text-[#9A6B12]'
                            : 'bg-[#1A1612]/10 text-[#1A1612]'
                        }`}
                      >
                        {item.type === 'experience' && (
                          <Compass className="w-3 h-3" />
                        )}
                        {item.type === 'guide' && (
                          <UserCheck className="w-3 h-3" />
                        )}
                        {item.type === 'event' && (
                          <Calendar className="w-3 h-3" />
                        )}
                        {item.type === 'destination' && (
                          <MapPin className="w-3 h-3" />
                        )}
                        <span>{item.badge}</span>
                      </span>

                      {item.priceLabel && (
                        <span className="font-mono text-[11px] font-bold text-[#226B3E] tabular-nums">
                          {item.priceLabel}
                        </span>
                      )}

                      {item.ratingLabel && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#D99B26]">
                          <Star className="w-3 h-3 fill-[#D99B26]" />
                          <span>{item.ratingLabel}</span>
                        </span>
                      )}
                    </div>

                    <div className="font-serif text-base font-bold text-[#1A1612] truncate">
                      {item.title}
                    </div>

                    <div className="text-xs text-[#5A5248] line-clamp-1">
                      {item.subtitle}
                    </div>

                    <div className="font-mono text-[10px] text-[#5A5248] flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3 text-[#226B3E] shrink-0" />
                      <span className="truncate">{item.meta}</span>
                    </div>
                  </div>

                  {/* Action Indicator */}
                  <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-semibold text-[#226B3E]">
                    <span className="hidden sm:inline">
                      {item.type === 'guide'
                        ? 'View Profile'
                        : item.type === 'experience'
                        ? 'View Safari'
                        : item.type === 'event'
                        ? 'Reserve'
                        : 'Explore'}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Quick Links */}
        <div className="px-4 py-2.5 bg-white border-t border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5248]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/experiences');
              }}
              className="hover:text-[#226B3E] font-medium cursor-pointer"
            >
              All {EXPERIENCES.length} Safari Experiences →
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/guides');
              }}
              className="hover:text-[#226B3E] font-medium cursor-pointer"
            >
              All {GUIDES.length} Ugandan Specialist Guides →
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/trip-planner');
            }}
            className="font-mono text-[11px] font-semibold text-[#C85A28] hover:underline cursor-pointer"
          >
            Need a custom route? Launch Safari Planner
          </button>
        </div>
      </div>
    </div>
  );
};
