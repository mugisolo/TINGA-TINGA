import React, { useState, useMemo } from 'react';
import { Compass } from 'lucide-react';
import { EXPERIENCES } from '../data/seedData';
import { ExperienceCard } from '../components/ExperienceCard';
import { SEO } from '../components/SEO';
import {
  ExperienceFilterBar,
  ExperienceFilterState,
  ACTIVITY_CATEGORY_CONFIG,
  DURATION_BRACKET_CONFIG,
} from '../components/ExperienceFilterBar';

const INITIAL_FILTERS: ExperienceFilterState = {
  region: 'all',
  activityCategory: 'all',
  specialty: 'all',
  durationBracket: 'all',
  maxDays: 10,
  tier: 'all',
  sortBy: 'featured',
};

export const ExperiencesPage: React.FC = () => {
  const [filters, setFilters] = useState<ExperienceFilterState>(INITIAL_FILTERS);

  const handleFilterChange = (updated: Partial<ExperienceFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredAndSortedExperiences = useMemo(() => {
    const filtered = EXPERIENCES.filter((exp) => {
      // 1. Duration filter (bracket + maxDays ceiling)
      const bracketCfg = DURATION_BRACKET_CONFIG[filters.durationBracket];
      const matchesBracket =
        filters.durationBracket === 'all' ||
        (exp.durationDays >= bracketCfg.min && exp.durationDays <= bracketCfg.max);
      const matchesMaxDays = exp.durationDays <= filters.maxDays;

      // 2. Region filter
      const matchesRegion =
        filters.region === 'all' ||
        exp.region === filters.region ||
        exp.regions.includes(filters.region);

      // 3. Activity Category filter (trekking, wildlife, cultural)
      const matchesActivityCategory =
        filters.activityCategory === 'all' ||
        exp.interests.some((i) =>
          ACTIVITY_CATEGORY_CONFIG[filters.activityCategory].specialties.includes(i)
        );

      // 4. Granular Specialty filter
      const matchesSpecialty =
        filters.specialty === 'all' || exp.interests.includes(filters.specialty);

      // 5. Comfort Tier filter
      const matchesTier =
        filters.tier === 'all' || exp.comfortTiers.includes(filters.tier);

      return (
        matchesBracket &&
        matchesMaxDays &&
        matchesRegion &&
        matchesActivityCategory &&
        matchesSpecialty &&
        matchesTier
      );
    });

    const getStartingPrice = (exp: (typeof EXPERIENCES)[number]) =>
      Math.min(...exp.priceBands.map((b) => b.perPersonUSD));

    const getActivityRank = (exp: (typeof EXPERIENCES)[number]) => {
      if (exp.interests.some((i) => ['gorillas', 'chimps', 'hiking'].includes(i))) {
        return 1; // Trekking
      }
      if (exp.interests.some((i) => ['big-game', 'birding', 'photography'].includes(i))) {
        return 2; // Wildlife
      }
      return 3; // Cultural
    };

    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'duration-asc':
          return a.durationDays - b.durationDays;
        case 'duration-desc':
          return b.durationDays - a.durationDays;
        case 'region-asc':
          return a.region.localeCompare(b.region);
        case 'activity':
          return getActivityRank(a) - getActivityRank(b) || a.durationDays - b.durationDays;
        case 'price-asc':
          return getStartingPrice(a) - getStartingPrice(b);
        case 'price-desc':
          return getStartingPrice(b) - getStartingPrice(a);
        case 'featured':
        default:
          return 0;
      }
    });
  }, [filters]);

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://engandasafaris.com';

  const experiencesCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${origin}/experiences#collection`,
    name: 'Uganda Safari Experiences & Gorilla Trekking Itineraries | Enganda Safaris',
    description:
      'Explore 6 private Uganda safari itineraries led by named, licensed Ugandan guides — including Bwindi gorilla trekking, Kibale chimpanzees, Murchison Falls, and Kidepo Valley.',
    url: `${origin}/experiences`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: EXPERIENCES.length,
      itemListElement: EXPERIENCES.map((exp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}/experiences/${exp.slug}`,
        item: {
          '@type': ['TouristTrip', 'Product'],
          name: exp.title,
          description: exp.summary,
          image: exp.heroImage,
          url: `${origin}/experiences/${exp.slug}`,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: Math.min(...exp.priceBands.map((b) => b.perPersonUSD)),
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    },
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Uganda Safari Experiences & Gorilla Trekking Itineraries | Enganda Safaris"
        description="Explore our 6 signature Uganda safari experiences — from a 1-day Mabamba Shoebill excursion and 3-day Bwindi gorilla trek to a 10-day Uganda Grand Circuit including Kidepo Valley."
        ogTitle="6 Private Uganda Safari Experiences Led by Named Ugandan Guides | Enganda Safaris"
        ogDescription="Compare duration, regions, and comfort tier pricing across all 6 signature Uganda safari itineraries — Bwindi gorillas, Kibale chimps, Queen Elizabeth, Murchison Falls, and Kidepo Valley."
        ogType="website"
        ogImage={EXPERIENCES[0]?.heroImage}
        ogImageAlt="Mountain Gorilla Trekking & Private Uganda Safari Experiences — Enganda Safaris"
        canonicalPath="/experiences"
        keywords={[
          'Uganda Safari Experiences',
          'Bwindi Gorilla Trekking Itinerary',
          'Kibale Chimpanzee Safari',
          'Murchison Falls Safari',
          'Kidepo Valley Expedition',
          'Enganda Safaris Uganda',
        ]}
        jsonLd={experiencesCatalogJsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Compass className="w-3.5 h-3.5" />
              <span>Strictly Within Uganda • Private 4x4 &amp; Named Ugandan Guide</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Uganda Safari Experiences Led by Our Guide Collective
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Every itinerary below is private and customizable. Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional Enganda guide, full-board lodges, and official UWA permits.
            </p>
          </div>
        </div>

        {/* Dedicated Filter & Sort Component */}
        <ExperienceFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          totalCount={EXPERIENCES.length}
          filteredCount={filteredAndSortedExperiences.length}
        />

        {/* Grid */}
        {filteredAndSortedExperiences.length === 0 ? (
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-12 text-center space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
              No experiences match those exact filter criteria
            </h3>
            <p className="text-sm text-[#595045] max-w-md mx-auto">
              Try broadening your activity type, extending the maximum duration ceiling, or clearing the regional filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-md bg-[#226B3E] text-[#FAF7F2] text-xs font-semibold hover:bg-[#1B5632] transition-colors cursor-pointer"
            >
              Show All {EXPERIENCES.length} Uganda Experiences
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

