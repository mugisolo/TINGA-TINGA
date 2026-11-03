import React from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  MapPin,
  Clock,
  Compass,
  RotateCcw,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { ComfortTier, Specialty } from '../types';
import { DESTINATIONS, EXPERIENCES, SPECIALTY_LABELS } from '../data/seedData';

export type ActivityCategory = 'all' | 'trekking' | 'wildlife' | 'cultural';
export type DurationBracket = 'all' | 'short' | 'classic' | 'extended';
export type ExperienceSortOption =
  | 'featured'
  | 'duration-asc'
  | 'duration-desc'
  | 'region-asc'
  | 'activity'
  | 'price-asc'
  | 'price-desc';

export interface ExperienceFilterState {
  region: string;
  activityCategory: ActivityCategory;
  specialty: Specialty | 'all';
  durationBracket: DurationBracket;
  maxDays: number;
  tier: ComfortTier | 'all';
  sortBy: ExperienceSortOption;
}

export const ACTIVITY_CATEGORY_CONFIG: Record<
  ActivityCategory,
  {
    label: string;
    shortLabel: string;
    subtitle: string;
    specialties: Specialty[];
  }
> = {
  all: {
    label: 'All Activity Types',
    shortLabel: 'All Activities',
    subtitle: 'Full Uganda expedition portfolio',
    specialties: ['gorillas', 'chimps', 'birding', 'big-game', 'culture', 'hiking', 'photography'],
  },
  trekking: {
    label: 'Trekking (Gorillas, Chimps & Peaks)',
    shortLabel: 'Trekking',
    subtitle: 'Bwindi, Mgahinga, Kibale & Rwenzori',
    specialties: ['gorillas', 'chimps', 'hiking'],
  },
  wildlife: {
    label: 'Wildlife & Birding (Savanna & Boat)',
    shortLabel: 'Wildlife',
    subtitle: 'Big game drives, Kazinga & Shoebill marshes',
    specialties: ['big-game', 'birding', 'photography'],
  },
  cultural: {
    label: 'Cultural & Community Encounters',
    shortLabel: 'Cultural',
    subtitle: 'Batwa heritage, Karamojong & local homesteads',
    specialties: ['culture'],
  },
};

export const DURATION_BRACKET_CONFIG: Record<
  DurationBracket,
  { label: string; rangeText: string; min: number; max: number }
> = {
  all: { label: 'All Durations', rangeText: '1–10 Days', min: 1, max: 10 },
  short: { label: 'Short Excursions', rangeText: '1–3 Days', min: 1, max: 3 },
  classic: { label: 'Classic Safaris', rangeText: '4–6 Days', min: 4, max: 6 },
  extended: { label: 'Grand Expeditions', rangeText: '7–10 Days', min: 7, max: 10 },
};

export const SORT_OPTION_LABELS: Record<ExperienceSortOption, string> = {
  featured: 'Curated Order (Featured)',
  'duration-asc': 'Duration: Shortest to Longest',
  'duration-desc': 'Duration: Longest to Shortest',
  'region-asc': 'Region: A to Z',
  activity: 'Activity Type (Trekking → Wildlife → Cultural)',
  'price-asc': 'Starting Rate: Low to High',
  'price-desc': 'Starting Rate: High to Low',
};

interface ExperienceFilterBarProps {
  filters: ExperienceFilterState;
  onChange: (updated: Partial<ExperienceFilterState>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export const ExperienceFilterBar: React.FC<ExperienceFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const allSpecialties: Specialty[] = [
    'gorillas',
    'chimps',
    'birding',
    'big-game',
    'culture',
    'hiking',
    'photography',
  ];

  // Count how many experiences match each activity category
  const getCategoryCount = (cat: ActivityCategory): number => {
    if (cat === 'all') return EXPERIENCES.length;
    const targetSpecs = ACTIVITY_CATEGORY_CONFIG[cat].specialties;
    return EXPERIENCES.filter((exp) =>
      exp.interests.some((i) => targetSpecs.includes(i))
    ).length;
  };

  // Count how many experiences touch each region
  const getRegionCount = (regionName: string): number => {
    return EXPERIENCES.filter(
      (exp) => exp.region === regionName || exp.regions.includes(regionName)
    ).length;
  };

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.activityCategory !== 'all' ||
    filters.specialty !== 'all' ||
    filters.durationBracket !== 'all' ||
    filters.maxDays < 10 ||
    filters.tier !== 'all' ||
    filters.sortBy !== 'featured';

  const handleDurationBracketSelect = (bracket: DurationBracket) => {
    const maxForBracket = DURATION_BRACKET_CONFIG[bracket].max;
    onChange({
      durationBracket: bracket,
      maxDays: bracket === 'all' ? 10 : maxForBracket,
    });
  };

  const handleActivityCategorySelect = (cat: ActivityCategory) => {
    // If current specialty isn't part of the newly chosen category, reset specialty to 'all'
    const allowedSpecs = ACTIVITY_CATEGORY_CONFIG[cat].specialties;
    const nextSpecialty =
      filters.specialty !== 'all' && !allowedSpecs.includes(filters.specialty)
        ? 'all'
        : filters.specialty;

    onChange({
      activityCategory: cat,
      specialty: nextSpecialty,
    });
  };

  return (
    <section
      aria-label="Filter and sort Uganda safari packages"
      className="bg-[#FAF7F2] rounded-xl border border-[#E4D9C8] shadow-sm overflow-hidden mb-10"
    >
      {/* Top Bar: Header & Sort Selector */}
      <div className="bg-[#F3ECE1]/80 border-b border-[#E4D9C8] px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#226B3E] text-[#FAF7F2] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-[#1A1612]">
                Safari Expedition Filter &amp; Sort
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E] font-semibold">
                {filteredCount} of {totalCount} Circuits
              </span>
            </div>
            <p className="text-xs text-[#595045]">
              Filter Uganda packages by activity type (trekking, wildlife, cultural), region, or duration
            </p>
          </div>
        </div>

        {/* Sort By Dropdown + Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E4D9C8] rounded-md px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-[#C85A28] shrink-0" />
            <label
              htmlFor="safari-sort-select"
              className="font-mono text-[11px] uppercase tracking-wider text-[#595045] whitespace-nowrap"
            >
              Sort By:
            </label>
            <select
              id="safari-sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ sortBy: e.target.value as ExperienceSortOption })
              }
              className="bg-transparent text-xs font-semibold text-[#1A1612] focus:outline-none cursor-pointer pr-2"
            >
              {(Object.keys(SORT_OPTION_LABELS) as ExperienceSortOption[]).map(
                (opt) => (
                  <option key={opt} value={opt}>
                    {SORT_OPTION_LABELS[opt]}
                  </option>
                )
              )}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A28] hover:text-[#1A1612] bg-[#FAF7F2] hover:bg-[#E4D9C8]/50 border border-[#C85A28]/30 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Body */}
      <div className="p-6 space-y-6">
        {/* 1. Primary Activity Type Tabs (Trekking, Wildlife, Cultural) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#595045]">
              <Compass className="w-3.5 h-3.5 text-[#226B3E]" />
              1. Activity Type
            </label>
            <span className="font-mono text-[11px] text-[#595045]">
              Select primary expedition focus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              Object.keys(ACTIVITY_CATEGORY_CONFIG) as ActivityCategory[]
            ).map((cat) => {
              const cfg = ACTIVITY_CATEGORY_CONFIG[cat];
              const isSelected = filters.activityCategory === cat;
              const count = getCategoryCount(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleActivityCategorySelect(cat)}
                  className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] shadow-sm'
                      : 'bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4D9C8] hover:border-[#226B3E]/50 hover:bg-[#F3ECE1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-serif font-bold text-base leading-tight">
                      {cfg.shortLabel}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                        isSelected
                          ? 'bg-[#FAF7F2]/20 text-[#FAF7F2]'
                          : 'bg-[#FAF7F2] text-[#595045] border border-[#E4D9C8]'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-snug ${
                      isSelected ? 'text-[#FAF7F2]/85' : 'text-[#595045]'
                    }`}
                  >
                    {cfg.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Second Row: Region, Duration Bracket + Slider, Specific Specialty, Comfort Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 pt-4 border-t border-[#E4D9C8]">
          {/* Region Selector (4 cols) */}
          <div className="lg:col-span-4">
            <label
              htmlFor="filter-region-select"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#595045] mb-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C85A28]" />
              2. Uganda Region / National Park
            </label>
            <select
              id="filter-region-select"
              value={filters.region}
              onChange={(e) => onChange({ region: e.target.value })}
              className="w-full bg-[#F3ECE1] border border-[#E4D9C8] rounded-md px-3.5 py-2.5 text-sm text-[#1A1612] font-medium focus:outline-none focus:border-[#226B3E]"
            >
              <option value="all">
                All 9 Uganda Regions ({EXPERIENCES.length} Circuits)
              </option>
              {DESTINATIONS.map((d) => {
                const count = getRegionCount(d.name);
                return (
                  <option key={d.slug} value={d.name}>
                    {d.name} ({count} {count === 1 ? 'circuit' : 'circuits'})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-[#595045] mt-1.5">
              Matches both single-park hubs and multi-park overland circuits.
            </p>
          </div>

          {/* Duration Bracket & Max Days Slider (5 cols) */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#595045]">
                <Clock className="w-3.5 h-3.5 text-[#226B3E]" />
                3. Safari Duration
              </label>
              <span className="font-mono text-xs font-bold text-[#226B3E]">
                {filters.durationBracket !== 'all'
                  ? `${DURATION_BRACKET_CONFIG[filters.durationBracket].label} (${DURATION_BRACKET_CONFIG[filters.durationBracket].rangeText})`
                  : `Up to ${filters.maxDays} ${filters.maxDays === 1 ? 'Day' : 'Days'}`}
              </span>
            </div>

            {/* Preset Duration Brackets */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {(Object.keys(DURATION_BRACKET_CONFIG) as DurationBracket[]).map(
                (bracket) => {
                  const cfg = DURATION_BRACKET_CONFIG[bracket];
                  const active = filters.durationBracket === bracket;
                  return (
                    <button
                      key={bracket}
                      type="button"
                      onClick={() => handleDurationBracketSelect(bracket)}
                      className={`px-2 py-1.5 rounded border text-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1A1612] text-[#FAF7F2] border-[#1A1612]'
                          : 'bg-[#F3ECE1] text-[#1A1612] border-[#E4D9C8] hover:border-[#1A1612]/40'
                      }`}
                    >
                      <div className="font-mono text-[11px] font-bold leading-tight">
                        {cfg.rangeText}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          active ? 'text-[#FAF7F2]/75' : 'text-[#595045]'
                        }`}
                      >
                        {bracket === 'all' ? 'Any' : cfg.label.split(' ')[0]}
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* Fine-Grained Max Days Slider */}
            <div className="flex items-center gap-3 bg-[#F3ECE1] px-3 py-1.5 rounded border border-[#E4D9C8]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#595045] whitespace-nowrap">
                Max Ceiling:
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={filters.maxDays}
                onChange={(e) =>
                  onChange({
                    maxDays: Number(e.target.value),
                    durationBracket: 'all',
                  })
                }
                aria-label="Maximum safari duration in days"
                className="w-full accent-[#226B3E] cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-[#1A1612] whitespace-nowrap">
                ≤ {filters.maxDays}d
              </span>
            </div>
          </div>

          {/* Comfort Tier & Granular Specialty (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div>
              <label
                htmlFor="filter-specialty-select"
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#595045] mb-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                Specific Focus Tag
              </label>
              <select
                id="filter-specialty-select"
                value={filters.specialty}
                onChange={(e) =>
                  onChange({
                    specialty: e.target.value as Specialty | 'all',
                  })
                }
                className="w-full bg-[#F3ECE1] border border-[#E4D9C8] rounded-md px-3 py-2 text-xs text-[#1A1612] font-medium focus:outline-none focus:border-[#226B3E]"
              >
                <option value="all">All Specialist Tags</option>
                {allSpecialties.map((s) => (
                  <option key={s} value={s}>
                    {SPECIALTY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-tier-select"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#595045] mb-1"
              >
                Accommodation Tier
              </label>
              <select
                id="filter-tier-select"
                value={filters.tier}
                onChange={(e) =>
                  onChange({
                    tier: e.target.value as ComfortTier | 'all',
                  })
                }
                className="w-full bg-[#F3ECE1] border border-[#E4D9C8] rounded-md px-3 py-2 text-xs text-[#1A1612] font-medium focus:outline-none focus:border-[#226B3E]"
              >
                <option value="all">All Comfort Tiers</option>
                <option value="mid-range">Mid-Range</option>
                <option value="luxury">Luxury</option>
                <option value="signature">Signature</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Summary Bar */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-[#E4D9C8] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#595045] mr-1">
                Active Filters:
              </span>

              {filters.activityCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#226B3E]/10 text-[#226B3E] border border-[#226B3E]/30 px-2.5 py-1 rounded text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Activity: {ACTIVITY_CATEGORY_CONFIG[filters.activityCategory].shortLabel}
                  <button
                    type="button"
                    onClick={() => onChange({ activityCategory: 'all' })}
                    aria-label="Remove activity category filter"
                    className="hover:text-[#1A1612] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.region !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#C85A28]/10 text-[#C85A28] border border-[#C85A28]/30 px-2.5 py-1 rounded text-xs font-medium">
                  Region: {filters.region}
                  <button
                    type="button"
                    onClick={() => onChange({ region: 'all' })}
                    aria-label="Remove region filter"
                    className="hover:text-[#1A1612] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.durationBracket !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#1A1612]/10 text-[#1A1612] border border-[#1A1612]/20 px-2.5 py-1 rounded text-xs font-medium">
                  Duration: {DURATION_BRACKET_CONFIG[filters.durationBracket].rangeText}
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ durationBracket: 'all', maxDays: 10 })
                    }
                    aria-label="Remove duration bracket filter"
                    className="hover:text-[#C85A28] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.durationBracket === 'all' && filters.maxDays < 10 && (
                <span className="inline-flex items-center gap-1.5 bg-[#1A1612]/10 text-[#1A1612] border border-[#1A1612]/20 px-2.5 py-1 rounded text-xs font-medium">
                  Max Duration: ≤ {filters.maxDays} Days
                  <button
                    type="button"
                    onClick={() => onChange({ maxDays: 10 })}
                    aria-label="Remove max days filter"
                    className="hover:text-[#C85A28] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.specialty !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#D99B26]/15 text-[#1A1612] border border-[#D99B26]/40 px-2.5 py-1 rounded text-xs font-medium">
                  Tag: {SPECIALTY_LABELS[filters.specialty]}
                  <button
                    type="button"
                    onClick={() => onChange({ specialty: 'all' })}
                    aria-label="Remove specialty filter"
                    className="hover:text-[#C85A28] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.tier !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3ECE1] text-[#1A1612] border border-[#E4D9C8] px-2.5 py-1 rounded text-xs font-medium capitalize">
                  Tier: {filters.tier}
                  <button
                    type="button"
                    onClick={() => onChange({ tier: 'all' })}
                    aria-label="Remove comfort tier filter"
                    className="hover:text-[#C85A28] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.sortBy !== 'featured' && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3ECE1] text-[#595045] border border-[#E4D9C8] px-2.5 py-1 rounded text-xs font-mono">
                  Sorted: {SORT_OPTION_LABELS[filters.sortBy]}
                  <button
                    type="button"
                    onClick={() => onChange({ sortBy: 'featured' })}
                    aria-label="Reset sort order"
                    className="hover:text-[#1A1612] ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
