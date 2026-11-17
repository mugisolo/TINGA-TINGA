import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  FileText,
  Plane,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { EXPERIENCES, SHUMA_COMPANY_INFO } from '../data/seedData';
import { ExperienceCard } from '../components/ExperienceCard';
import { SEO } from '../components/SEO';
import {
  ExperienceFilterBar,
  ExperienceFilterState,
  ACTIVITY_CATEGORY_CONFIG,
  DURATION_BRACKET_CONFIG,
} from '../components/ExperienceFilterBar';
import { useInquiry } from '../context/InquiryContext';
import { formatPrice } from '../lib/currency';

const INITIAL_FILTERS: ExperienceFilterState = {
  region: 'all',
  activityCategory: 'all',
  specialty: 'all',
  durationBracket: 'all',
  maxDays: 35,
  tier: 'all',
  sortBy: 'featured',
};

export const ExperiencesPage: React.FC = () => {
  const [filters, setFilters] = useState<ExperienceFilterState>(INITIAL_FILTERS);
  const { currency, openInquiryModal } = useInquiry();

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
      : 'https://wildlifesafaris.com';

  const experiencesCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${origin}/experiences#collection`,
    name: 'Uganda & East African Safari Experiences | WildLife & Shuma Africa Safaris',
    description:
      'Explore private Uganda safari itineraries and the flagship 32-Day East African Grand Safari 2027 by Shuma Africa Safaris across Tanzania, Kenya, Uganda, and Rwanda.',
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
        title="Uganda & East African Grand Safari Experiences | WildLife & Shuma Africa Safaris"
        description="Explore our signature Uganda safari experiences and the 32-Day East African Grand Safari 2027 by Shuma Africa Safaris (Tanzania, Kenya, Uganda & Rwanda — 7 Guests + 1 Complimentary Tour Leader)."
        ogTitle="Uganda & East African Safari Experiences | WildLife & Shuma Africa Safaris"
        ogDescription="Compare duration, regions, and comfort tier pricing across all Uganda itineraries plus the 32-Day East African Grand Safari 2027 ($18,078.57 pp / $126,550 group of 7 + 1 Free Tour Leader)."
        ogType="website"
        ogImage={EXPERIENCES[0]?.heroImage}
        ogImageAlt="Mountain Gorilla Trekking & East African Grand Safari — WildLife & Shuma Africa Safaris"
        canonicalPath="/experiences"
        keywords={[
          'Uganda Safari Experiences',
          'Shuma Africa Safaris',
          '32 Day East African Grand Safari 2027',
          'Bwindi Gorilla Trekking Itinerary',
          'Kibale Chimpanzee Safari',
          'Kidepo Valley Charter Safari',
          'WildLife Safaris Uganda',
        ]}
        jsonLd={experiencesCatalogJsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Compass className="w-3.5 h-3.5" />
              <span>Uganda &amp; East African Multi-Country Expeditions • Private 4x4 &amp; Named Guides</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Uganda &amp; East African Safari Experiences
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Every itinerary below is private and customizable — from 1-to-10-day Uganda primate and savanna circuits to our flagship <strong>32-Day East African Grand Safari 2027</strong> curated with <strong>{SHUMA_COMPANY_INFO.name}</strong> (<em>“{SHUMA_COMPANY_INFO.tagline}”</em>).
            </p>
          </div>
        </div>

        {/* Shuma Africa Safaris — 2027 Grand Safari Partner Spotlight */}
        <section
          aria-label="Shuma Africa Safaris 32-Day East African Grand Safari 2027 Spotlight"
          className="bg-[#144225] text-[#FAF7F2] rounded-xl border-2 border-[#D99B26]/60 shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-[#1A1612]/90 border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D99B26] shrink-0" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#D99B26] font-bold">
                {SHUMA_COMPANY_INFO.name} — “{SHUMA_COMPANY_INFO.tagline}”
              </span>
              <span className="hidden sm:inline-block text-white/30">•</span>
              <span className="font-mono text-xs text-[#E4DCCF] hidden sm:inline">
                Official 2027 Multi-Country Dossier Integrated
              </span>
            </div>
            <a
              href={SHUMA_COMPANY_INFO.pdfBrochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D99B26] hover:bg-[#c3871c] text-[#1A1612] font-mono text-xs font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Official 32-Day PDF Brochure</span>
            </a>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[11px] font-semibold uppercase">
                  32 Days / 31 Nights • June–Sept 2027
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1B5632] border border-white/20 text-[#E4DCCF] font-mono text-[11px] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>Tanzania • Kenya • Uganda • Rwanda</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1B5632] border border-white/20 text-[#D99B26] font-mono text-[11px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>7 Guests + 1 Free Tour Leader</span>
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                The 32-Day East African Grand Safari 2027
              </h2>

              <p className="text-xs sm:text-sm text-[#E4DCCF] leading-relaxed">
                Experience East Africa’s most complete four-country wildlife and primate expedition: Tarangire, Ngorongoro Crater &amp; Central Serengeti (Days 1–7) • Maasai Mara, Lake Nakuru &amp; Kisumu (Days 8–12) • Mabamba Shoebill, Jinja Nile, Sipi Falls, Pian Upe, Moroto Karamoja, Kidepo Valley with <strong>private group charter flight to Murchison Falls</strong>, Kibale Chimps, Queen Elizabeth Ishasha &amp; Bwindi Gorillas (Days 13–26) • Volcanoes Golden Monkeys, Lake Kivu, Nyungwe Canopy &amp; Akagera Big-Five (Days 27–32).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <Link
                  to="/experiences/32-day-east-african-grand-safari-2027"
                  className="bg-[#1B5632] hover:bg-[#226B3E] border border-[#D99B26]/50 rounded-lg p-3 transition-colors block"
                >
                  <div className="font-mono text-[10px] uppercase text-[#D99B26] font-semibold">
                    Full 4-Country Dossier
                  </div>
                  <div className="font-serif text-base font-bold text-white mt-0.5">
                    32-Day Grand Safari →
                  </div>
                  <div className="text-[11px] text-[#D6CEC2] mt-0.5">
                    TZ • KE • UG • RW ($18,078.57 pp)
                  </div>
                </Link>

                <Link
                  to="/experiences/15-day-shuma-uganda-grand-sector"
                  className="bg-[#1B5632] hover:bg-[#226B3E] border border-white/15 rounded-lg p-3 transition-colors block"
                >
                  <div className="font-mono text-[10px] uppercase text-[#D99B26] font-semibold">
                    Modular Uganda Sector
                  </div>
                  <div className="font-serif text-base font-bold text-white mt-0.5">
                    15-Day Uganda + Charter →
                  </div>
                  <div className="text-[11px] text-[#D6CEC2] mt-0.5">
                    Days 12–26 • Kidepo–Murchison Flight
                  </div>
                </Link>

                <Link
                  to="/experiences/7-day-shuma-uganda-rwanda-primate-akagera"
                  className="bg-[#1B5632] hover:bg-[#226B3E] border border-white/15 rounded-lg p-3 transition-colors block"
                >
                  <div className="font-mono text-[10px] uppercase text-[#D99B26] font-semibold">
                    Cross-Border Finale
                  </div>
                  <div className="font-serif text-base font-bold text-white mt-0.5">
                    7-Day Uganda &amp; Rwanda →
                  </div>
                  <div className="text-[11px] text-[#D6CEC2] mt-0.5">
                    Bwindi • Volcanoes • Nyungwe • Akagera
                  </div>
                </Link>
              </div>
            </div>

            {/* Right 5 Cols: Official Group & Complimentary Tour Leader Pricing Box */}
            <div className="lg:col-span-5 bg-[#1A1612]/90 border border-[#D99B26]/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26]">
                    Official 2027 Group Tariff
                  </div>
                  <div className="font-serif text-lg font-bold text-white">
                    7 Guests + 1 Complimentary Tour Leader
                  </div>
                </div>
                <Plane className="w-5 h-5 text-[#D99B26] shrink-0" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#D6CEC2]">Total Group Package (7 Paying + 1 Free):</span>
                  <span className="text-white font-bold text-sm">
                    {formatPrice(SHUMA_COMPANY_INFO.totalGroupCostUSD, currency)} ($126,550 USD)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#D6CEC2]">Cost Per Paying Guest (7 Guests):</span>
                  <span className="text-[#D99B26] font-bold text-sm">
                    $18,078.57 USD
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-[#D6CEC2]">Tour Leader Place (8th Traveller):</span>
                  <span className="text-[#4CC37A] font-bold">
                    COMPLIMENTARY (FREE)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#D6CEC2]">Rooming Configuration:</span>
                  <span className="text-white">4 Twin + 1 Single (4-Star)</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap gap-2">
                <Link
                  to="/experiences/32-day-east-african-grand-safari-2027"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors text-center"
                >
                  <span>View 32-Day Day-by-Day Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openInquiryModal({
                      experienceSlug: '32-day-east-african-grand-safari-2027',
                      defaultTier: 'mid-range',
                      defaultNotes:
                        'Inquiring about Shuma Africa Safaris 32-Day East African Grand Safari 2027 (7 Paying Guests + 1 Complimentary Tour Leader @ $126,550 USD total / $18,078.57 pp).',
                    })
                  }
                  className="px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reserve 2027 Group
                </button>
              </div>
            </div>
          </div>
        </section>

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
              Show All {EXPERIENCES.length} Safari Experiences
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

