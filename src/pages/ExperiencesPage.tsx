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
  Award,
} from 'lucide-react';
import { EXPERIENCES, SHUMA_COMPANY_INFO, OFFICIAL_PORTFOLIO_PDFS } from '../data/seedData';
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

type PortfolioFilterTab = 'all' | 'admin-enganda' | 'tingatinga-2026' | 'vergouw-solo' | 'shuma-grand';

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
  const [portfolioTab, setPortfolioTab] = useState<PortfolioFilterTab>('all');
  const { currency, openInquiryModal } = useInquiry();

  const handleFilterChange = (updated: Partial<ExperienceFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPortfolioTab('all');
  };

  const adminRecommendedPackages = useMemo(
    () => EXPERIENCES.filter((e) => e.adminRecommended),
    []
  );

  const filteredAndSortedExperiences = useMemo(() => {
    const filtered = EXPERIENCES.filter((exp) => {
      // 0. Portfolio Tab Filter
      if (portfolioTab === 'admin-enganda' && !exp.adminRecommended) return false;
      if (
        portfolioTab === 'tingatinga-2026' &&
        !['T1', 'T2', 'T3', 'T4', 'T5'].includes(exp.packageCode || '') &&
        exp.slug !== '8-day-tingatinga-signature-primate-lions-nile'
      ) {
        return false;
      }
      if (portfolioTab === 'vergouw-solo' && exp.packageCode !== 'VERGOUW-SOLO') return false;
      if (
        portfolioTab === 'shuma-grand' &&
        !exp.slug.includes('shuma') &&
        !exp.shumaGroupOffer
      ) {
        return false;
      }

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
          // Prioritize Enganda Verified (Enganda Safaris E1-E5) at the top
          if (a.adminRecommended && !b.adminRecommended) return -1;
          if (!a.adminRecommended && b.adminRecommended) return 1;
          return 0;
      }
    });
  }, [filters, portfolioTab]);

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://wildlifesafaris.com';

  const experiencesCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${origin}/experiences#collection`,
    name: 'Uganda & East African Safari Experiences | Enganda, Tingatinga & Shuma Safaris',
    description:
      'Explore Enganda Verified 2026 Specialist Expeditions (E1–E5), Tingatinga Safaris 2026 Private Portfolio (T1–T5), the 10-Day Vergouw Solo Wild Package, and the 32-Day East African Grand Safari.',
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
        title="Uganda & East African Grand Safari Experiences | Enganda, Tingatinga & Shuma Safaris"
        description="Explore Enganda Verified 2026 Specialist Uganda Expeditions (E1–E5), Tingatinga Safaris 2026 Portfolio (T1–T5), the Vergouw 10-Day Solo Wild Package, and the 32-Day East African Grand Safari 2027."
        ogTitle="Uganda & East African Safari Experiences | Enganda, Tingatinga & Shuma Safaris"
        ogDescription="Compare duration, 2-Pax Sharing & 1-Pax Solo Traveler tariffs across all Enganda Specialist (E1–E5), Tingatinga (T1–T5), Vergouw Solo Wild, and Shuma 4-Country itineraries."
        ogType="website"
        ogImage={EXPERIENCES[0]?.heroImage}
        ogImageAlt="Mountain Gorilla Trekking & East African Grand Safari — Enganda & Tingatinga Safaris"
        canonicalPath="/experiences"
        keywords={[
          'Enganda Safaris 2026 Specialist Expeditions',
          'Tingatinga Safaris 2026 Portfolio',
          'Vergouw Solo Wild Package Uganda',
          'Shuma Africa Safaris',
          'Bwindi Gorilla Trekking Itinerary',
        ]}
        jsonLd={experiencesCatalogJsonLd}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550] space-y-5">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Compass className="w-3.5 h-3.5" />
              <span>Uganda &amp; East African Multi-Country Expeditions • Private 4x4 &amp; Named Guides</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Uganda &amp; East African Safari Experiences
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Explore our <strong>Enganda Verified 2026 Specialist Expeditions (E1–E5)</strong>, the <strong>Tingatinga Safaris 2026 Private Portfolio (T1–T5)</strong>, <strong>The Vergouw 10-Day Solo Wild Package</strong>, and our <strong>32-Day East African Grand Safari 2027</strong>. Every package features transparent 2-Pax Sharing and 1-Pax Solo Traveler tariffs with instant direct checkout.
            </p>
          </div>

          {/* Official PDF Portfolio Dossier Links Bar */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-bold">
              Official PDF Portfolios:
            </span>
            <a
              href={OFFICIAL_PORTFOLIO_PDFS.engandaSpecialist2026}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D99B26] hover:bg-[#c5891d] text-[#1A1612] font-mono text-xs font-bold transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>★ Enganda E1–E5 Specialist PDF (Enganda Verified)</span>
            </a>
            <a
              href={OFFICIAL_PORTFOLIO_PDFS.tingatingaPortfolio2026}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B5632] hover:bg-[#144225] text-white border border-white/25 font-mono text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>Tingatinga T1–T5 2026 Portfolio PDF</span>
            </a>
            <a
              href={OFFICIAL_PORTFOLIO_PDFS.vergouwSoloWild10Day}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1B5632] hover:bg-[#144225] text-white border border-white/25 font-mono text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>Vergouw 10-Day Solo Wild PDF ($6,912)</span>
            </a>
          </div>
        </div>

        {/* ★ ENGANDA VERIFIED: Enganda Safaris 2026 Specialist Uganda Expeditions (E1–E5) */}
        <section
          aria-label="Enganda Verified Enganda Safaris 2026 Specialist Uganda Expeditions"
          className="bg-gradient-to-br from-[#1A1612] via-[#144225] to-[#1A1612] text-[#FAF7F2] rounded-xl border-2 border-[#D99B26] shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-[#1A1612]/90 border-b border-[#D99B26]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#D99B26] text-[#1A1612] font-mono text-xs font-bold uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>Enganda Verified</span>
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-white">
                Enganda Safaris • 2026 Specialist Uganda Expeditions (E1–E5)
              </span>
            </div>
            <a
              href={OFFICIAL_PORTFOLIO_PDFS.engandaSpecialist2026}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#D99B26] border border-[#D99B26]/40 font-mono text-xs font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Enganda E1–E5 PDF Portfolio</span>
            </a>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-xs sm:text-sm text-[#E4DCCF] max-w-4xl leading-relaxed">
              Hand-selected and <strong>Enganda Verified</strong>, these five specialist expeditions combine Uganda’s deepest cultural kingdoms, Ramsar birding wetlands, off-trail savannas, and primate habitats with transparent <strong>2-Pax Sharing</strong> and <strong>1-Pax Solo Traveler</strong> private 4x4 Land Cruiser tariffs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {adminRecommendedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-[#1A1612]/80 border border-[#D99B26]/40 hover:border-[#D99B26] rounded-lg p-3.5 flex flex-col justify-between gap-3 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#D99B26] text-[#1A1612] font-mono text-[10px] font-bold">
                        CODE {pkg.packageCode}
                      </span>
                      <span className="font-mono text-[10px] text-[#E4DCCF]">
                        {pkg.durationDays} Days / {pkg.durationDays - 1}N
                      </span>
                    </div>
                    <Link
                      to={`/experiences/${pkg.slug}`}
                      className="font-serif text-sm font-bold text-white hover:text-[#D99B26] line-clamp-2 block"
                    >
                      {pkg.title.replace(/^.*?\(E\d\):\s*/, '')}
                    </Link>
                    <div className="pt-1 space-y-0.5 font-mono text-[11px]">
                      <div className="text-[#D99B26] font-bold">
                        2-Pax: {formatPrice(pkg.twoPaxSharingPriceUSD || pkg.priceBands[0].perPersonUSD, currency)} pp
                      </div>
                      {pkg.soloTravelerPriceUSD && (
                        <div className="text-[#E4DCCF] text-[10px]">
                          1-Pax Solo: {formatPrice(pkg.soloTravelerPriceUSD, currency)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                    <Link
                      to={`/experiences/${pkg.slug}`}
                      className="flex-1 text-center py-1.5 px-2 rounded bg-[#226B3E] hover:bg-[#2E8550] text-white font-mono text-[10px] font-semibold transition-colors"
                    >
                      Itinerary
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        openInquiryModal({
                          experienceSlug: pkg.slug,
                          defaultTier: 'mid-range',
                        })
                      }
                      className="flex-1 text-center py-1.5 px-2 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Pay Direct
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Collection Quick-Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All Packages (${EXPERIENCES.length})` },
            { id: 'admin-enganda', label: '★ Enganda Verified: Enganda E1–E5 (5)' },
            { id: 'tingatinga-2026', label: 'Tingatinga 2026 Portfolio T1–T5 (6)' },
            { id: 'vergouw-solo', label: 'Vergouw 10-Day Solo Wild ($6,912)' },
            { id: 'shuma-grand', label: 'Shuma 4-Country Grand Safaris (3)' },
          ].map((tab) => {
            const active = portfolioTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPortfolioTab(tab.id as PortfolioFilterTab)}
                className={`px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1A1612] text-[#D99B26] border-2 border-[#D99B26] shadow-xs'
                    : 'bg-white text-[#1A1612] border border-[#E4DCCF] hover:border-[#226B3E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
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

