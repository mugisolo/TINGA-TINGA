import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Heart,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  FileText,
  Building2,
  Car,
  Compass,
} from 'lucide-react';
import {
  VOLUNTEER_PROGRAMS,
  CONSERVATION_FUNDRAISERS,
  TOUR_OPERATORS,
  CONFIRMED_PACKAGES_AND_EVENTS,
  OFFICIAL_PORTFOLIO_PDFS,
  PARTNER_ACCOMMODATIONS,
  INITIAL_DRIVER_FLEET_VEHICLES,
} from '../data/seedData';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../lib/currency';

type ImpactTab = 'tingatinga' | 'volunteers' | 'fundraisers' | 'verification';

export const ExploreImpactPage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currency, openInquiryModal } = useInquiry();
  const { payPackageDirect, availableBalanceUSD } = useWallet();

  const resolveInitialTab = (): ImpactTab => {
    const qTab = searchParams.get('tab');
    if (
      qTab === 'tingatinga' ||
      qTab === 'volunteers' ||
      qTab === 'fundraisers' ||
      qTab === 'verification'
    ) {
      return qTab;
    }
    if (location.pathname.includes('tingatinga')) return 'tingatinga';
    if (location.pathname.includes('volunteer')) return 'volunteers';
    if (location.pathname.includes('fundraiser')) return 'fundraisers';
    if (location.pathname.includes('verification')) return 'verification';
    return 'tingatinga';
  };

  const [activeTab, setActiveTab] = useState<ImpactTab>(resolveInitialTab);
  const [pledgeSuccessBanner, setPledgeSuccessBanner] = useState<string | null>(
    null
  );
  const [customDonationAmounts, setCustomDonationAmounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setActiveTab(resolveInitialTab());
  }, [location.pathname, searchParams]);

  const handleSelectTab = (tab: ImpactTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tingatingaOperator = TOUR_OPERATORS.find(
    (op) => op.id === 'op-tingatinga-safaris'
  );

  const tingatingaConfirmedEvents = CONFIRMED_PACKAGES_AND_EVENTS.filter(
    (ev) =>
      ev.operatorName?.toLowerCase().includes('tingatinga') ||
      ev.title.toLowerCase().includes('tingatinga')
  );

  const handleDirectContribution = (
    itemId: string,
    title: string,
    amountUSD: number,
    categoryLabel: string
  ) => {
    if (availableBalanceUSD >= amountUSD) {
      const result = payPackageDirect({
        packageIdOrSlug: itemId,
        packageTitle: `${categoryLabel}: ${title}`,
        perPersonUSD: amountUSD,
        guests: 1,
        paymentType: 'full_100',
        departureDate: 'Immediate 2026 Placement / Escrow',
        autoTopUpIfShort: true,
      });
      if (result.ok) {
        setPledgeSuccessBanner(
          `Confirmed ${formatPrice(amountUSD, currency)} contribution to "${title}" via your Enganda Safari Wallet (Receipt #${result.transaction?.referenceCode || 'WLT-CONFIRMED'}).`
        );
        return;
      }
    }
    openInquiryModal({
      defaultNotes: `Direct ${categoryLabel} Payment: ${title} (${formatPrice(
        amountUSD,
        currency
      )} / $${amountUSD} USD). Verified by UTB & UWA.`,
    });
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1612] min-h-screen">
      <SEO
        title="Explore & Impact | Tingatinga Safaris, UTB/UWA Verification, Volunteer Programs & Fundraisers"
        description="Explore Tingatinga Safaris' 2026 Uganda Portfolio, UTB and UWA verified volunteer conservation programs, wildlife fundraisers, and multi-vendor marketplace verification."
      />

      {/* Hero Header */}
      <section className="bg-[#144225] text-[#FAF7F2] border-b border-white/15 py-12 lg:py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1A1612] text-[#D99B26] border border-[#D99B26]/50 font-mono text-xs uppercase tracking-wider font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>UTB &amp; UWA Verified Multi-Vendor Tourism Marketplace</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#226B3E] text-white font-mono text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>100% Direct Escrow &amp; Verified Service Providers</span>
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Tingatinga Safaris Showcase, Volunteer Programs, Fundraisers &amp; UTB/UWA Registry
              </h1>

              <p className="text-sm sm:text-base text-[#E4DCCF] max-w-3xl leading-relaxed">
                Modeled as East Africa’s verified multi-vendor safari marketplace, Enganda connects travelers directly with operators licensed by the{' '}
                <strong className="text-white">Uganda Tourism Board (UTB)</strong> and accredited by the{' '}
                <strong className="text-white">Uganda Wildlife Authority (UWA)</strong> — including our flagship partner{' '}
                <strong className="text-[#D99B26]">Tingatinga Safaris</strong>, field volunteer deployments, and direct conservation fundraisers.
              </p>
            </div>

            {/* Official Tingatinga Safaris Brand Card in Hero */}
            <div className="lg:col-span-4 bg-[#1A1612] border-2 border-[#D99B26]/70 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#1A1612] border border-white/15 rounded-xl p-2.5 shrink-0">
                  <img
                    src="/assets/aistudio/tinga_logo_2_10ada7c3.png"
                    alt="Tingatinga Safaris — Explore • Discover • Experience"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] font-bold">
                    Co-Flagship Operator
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                    Tingatinga Safaris
                  </h2>
                  <p className="text-xs text-[#E4DCCF] italic">
                    “Explore • Discover • Experience”
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 font-mono text-[11px]">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-[9px] uppercase text-[#D6CEC2]">
                    UTB Operator License
                  </div>
                  <div className="text-[#D99B26] font-bold mt-0.5">
                    UTB/TO/2026/0418
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-[9px] uppercase text-[#D6CEC2]">
                    UWA Permit Account
                  </div>
                  <div className="font-bold mt-0.5 text-emerald-400">
                    UWA-REG-8841-UG
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTab('tingatinga')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Explore Tingatinga T1–T5</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={OFFICIAL_PORTFOLIO_PDFS.tingatingaPortfolio2026}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-mono font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>2026 PDF</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-2">
            {[
              {
                id: 'tingatinga' as ImpactTab,
                label: 'Tingatinga Safaris (T1–T5 & Signature)',
                badge: 'UTB/TO/2026/0418',
              },
              {
                id: 'volunteers' as ImpactTab,
                label: `Volunteer Programs (${VOLUNTEER_PROGRAMS.length})`,
                badge: 'UWA Accredited',
              },
              {
                id: 'fundraisers' as ImpactTab,
                label: `Conservation Fundraisers (${CONSERVATION_FUNDRAISERS.length})`,
                badge: 'Direct Escrow',
              },
              {
                id: 'verification' as ImpactTab,
                label: 'UTB & UWA Verification Registry & Onboarding',
                badge: 'Multi-Vendor Standards',
              },
            ].map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                    isCurrent
                      ? 'bg-white text-[#1A1612] border-white shadow-md font-bold'
                      : 'bg-[#1B5632]/80 text-[#FAF7F2] border-white/15 hover:bg-[#226B3E]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      isCurrent
                        ? 'bg-[#1A1612] text-[#D99B26]'
                        : 'bg-[#144225] text-[#D99B26]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {pledgeSuccessBanner && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
          <div className="bg-[#226B3E] text-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-[#D99B26] shrink-0" />
              <span>{pledgeSuccessBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setPledgeSuccessBanner(null)}
              className="text-xs font-mono underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-14">
        {/* TAB 1: TINGATINGA SAFARIS SHOWCASE */}
        {activeTab === 'tingatinga' && (
          <div className="space-y-12">
            {/* Brand Banner with Attached Tingatinga Logo */}
            <div className="bg-white border-2 border-[#E4DCCF] rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 bg-[#1A1612] rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-[#D99B26]/50">
                <img
                  src="/assets/aistudio/tinga_logo_2_10ada7c3.png"
                  alt="Tingatinga Safaris Official Logo"
                  className="h-36 sm:h-44 w-auto object-contain"
                />
                <div className="space-y-1">
                  <div className="font-mono text-xs text-[#D99B26] font-bold uppercase tracking-wider">
                    Explore • Discover • Experience
                  </div>
                  <p className="text-xs text-[#E4DCCF]">
                    Airport Road, Entebbe &amp; Kampala, Uganda
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-white/15 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-[10px] font-bold">
                    UTB/TO/2026/0418
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[10px] font-bold">
                    UWA-REG-8841-UG
                  </span>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#FAF7F2] border border-[#226B3E]/30 text-[#226B3E] font-mono text-xs font-bold">
                    2026 Uganda Safari Portfolio (T1–T5 &amp; 8-Day Signature)
                  </span>
                  <span className="px-3 py-1 rounded-md bg-[#FAF7F2] border border-[#C85A28]/30 text-[#C85A28] font-mono text-xs font-bold">
                    10% UWA Conservation &amp; Tree-Planting Pledge
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
                  Tingatinga Safaris — Authentic Primate, Savanna &amp; Luxury Charter Expeditions
                </h2>

                <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
                  {tingatingaOperator?.description ||
                    'Tingatinga Safaris is our co-flagship Ugandan tour operator specializing in bespoke mountain gorilla and chimpanzee expeditions, tree-climbing lion tracking in Ishasha, Murchison Falls boat charters, and luxury fly-in circuits.'}{' '}
                  Every Tingatinga expedition includes guaranteed UWA primate permits held in escrow, private 4x4 pop-up roof Land Cruisers, and direct settlement through the universal Enganda Safari Wallet.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Portfolio Range
                    </div>
                    <div className="font-serif text-xl font-bold text-[#1A1612] mt-0.5">
                      3 to 12 Days (T1–T5)
                    </div>
                    <div className="text-xs text-[#226B3E] font-mono mt-0.5">
                      From $1,450 to $9,500 pp
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Lead Field Specialists
                    </div>
                    <div className="font-serif text-xl font-bold text-[#1A1612] mt-0.5">
                      David Mukasa &amp; Team
                    </div>
                    <div className="text-xs text-[#226B3E] font-mono mt-0.5">
                      UTB Gold Primate Guides
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Official Brochure
                    </div>
                    <a
                      href={OFFICIAL_PORTFOLIO_PDFS.tingatingaPortfolio2026}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-serif text-lg font-bold text-[#C85A28] hover:text-[#226B3E] mt-0.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download 2026 PDF</span>
                    </a>
                    <div className="text-xs text-[#5A5248] font-mono mt-0.5">
                      Verified Tariff Sheet
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tingatinga Confirmed Departures & Packages */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-bold">
                    Tingatinga Safaris • Verified 2026 Departures
                  </span>
                  <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1612] mt-1">
                    Confirmed Tingatinga Packages (T1–T5 &amp; 8-Day Signature)
                  </h3>
                </div>
                <Link
                  to="/trip-planner"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold transition-colors"
                >
                  <span>Customize Tingatinga Route</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tingatingaConfirmedEvents.map((pkg) => (
                  <article
                    key={pkg.id}
                    className="bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="bg-[#1A1612] px-4 py-2 flex items-center justify-between gap-2 border-b border-[#D99B26]/40">
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/aistudio/tinga_logo_2_10ada7c3.png"
                            alt="Tingatinga Safaris"
                            className="h-5 w-auto object-contain"
                          />
                          <span className="font-mono text-[10px] font-bold text-[#D99B26] uppercase">
                            Tingatinga Safaris
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-white/80">
                          {pkg.utbLicenseNumber || 'UTB/TO/2026/0418'}
                        </span>
                      </div>

                      <div className="relative h-52 bg-[#144225] overflow-hidden">
                        <SmartImage
                          src={pkg.heroImage}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/85 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[10px] font-bold uppercase">
                            {pkg.eventTag}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white text-[#1A1612] font-mono text-[10px] font-bold">
                            {pkg.durationLabel}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="font-mono text-xs text-[#D99B26] font-semibold">
                            {pkg.dateWindow}
                          </div>
                          <div className="text-xs text-[#E4DCCF] truncate">
                            {pkg.location}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h4 className="font-serif text-xl font-bold text-[#1A1612] leading-snug">
                          {pkg.title}
                        </h4>
                        <p className="text-xs text-[#5A5248] leading-relaxed">
                          {pkg.subtitle}
                        </p>
                        <ul className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                          {pkg.highlights.map((hl) => (
                            <li
                              key={hl}
                              className="flex items-start gap-2 text-xs text-[#1A1612]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-5 pt-3 bg-[#FAF7F2] border-t border-[#E4DCCF] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                            All-Inclusive Tariff
                          </div>
                          <div className="font-mono text-lg font-bold text-[#226B3E]">
                            {formatPrice(pkg.pricePerPersonUSD, currency)}{' '}
                            <span className="text-[10px] font-normal text-[#5A5248]">
                              pp
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#C85A28] font-bold">
                          {pkg.spotsRemaining} spots left
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openInquiryModal({
                              experienceSlug: pkg.experienceSlug,
                              guideSlug: pkg.leadGuideSlug,
                              defaultNotes: `Direct Booking for Tingatinga Safaris package: ${pkg.title}`,
                            })
                          }
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>Book Package</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {pkg.experienceSlug && (
                          <Link
                            to={`/experiences/${pkg.experienceSlug}`}
                            className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-[#1A1612] hover:bg-[#226B3E] text-white text-xs font-semibold transition-colors text-center"
                          >
                            Day-by-Day Route
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOLUNTEER PROGRAMS */}
        {activeTab === 'volunteers' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <span className="font-mono text-xs uppercase tracking-wider text-[#226B3E] font-bold">
                  UTB &amp; UWA Accredited Field Placements • 2026 / 2027
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
                  Conservation &amp; Community Volunteer Programs
                </h2>
                <p className="text-sm sm:text-base text-[#5A5248]">
                  Work alongside Uganda Wildlife Authority veterinarians, Bwindi community health officers, and Kibale reforestation teams. 100% of host placement contributions settle through UWA/UTB verified escrow accounts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {VOLUNTEER_PROGRAMS.map((prog) => (
                <article
                  key={prog.id}
                  className="bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="relative h-52 bg-[#144225] overflow-hidden">
                      <SmartImage
                        src={prog.heroImage}
                        alt={prog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/90 via-[#1A1612]/25 to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5">
                        <span className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-[10px] font-bold uppercase">
                          {prog.category}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white text-[#1A1612] font-mono text-[10px] font-bold">
                          {prog.durationWeeks}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="font-mono text-xs text-[#D99B26] font-semibold">
                          {prog.organization}
                        </div>
                        <div className="text-xs text-[#E4DCCF] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                          <span className="truncate">{prog.region}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#226B3E]/30 font-mono text-[10px] font-bold text-[#226B3E]">
                          {prog.utbLicenseNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#C85A28]/30 font-mono text-[10px] font-bold text-[#C85A28]">
                          {prog.uwaAccreditationId}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-[#1A1612] leading-snug">
                        {prog.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                        {prog.summary}
                      </p>

                      <ul className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                        {prog.impactHighlights.map((metric) => (
                          <li
                            key={metric}
                            className="flex items-start gap-2 text-xs text-[#1A1612]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0 mt-0.5" />
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-4 bg-[#FAF7F2] border-t border-[#E4DCCF] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                          Placement &amp; Host Contribution
                        </div>
                        <div className="font-mono text-lg font-bold text-[#1A1612]">
                          {formatPrice(prog.programFeeUSD, currency)}
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#C85A28] font-bold">
                        {prog.spotsAvailable} positions open
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDirectContribution(
                          prog.id,
                          prog.title,
                          prog.programFeeUSD,
                          'Volunteer Placement'
                        )
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#D99B26]" />
                      <span>Apply &amp; Reserve Placement via Safari Wallet</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONSERVATION FUNDRAISERS */}
        {activeTab === 'fundraisers' && (
          <div className="space-y-8">
            <div className="space-y-2 max-w-3xl">
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-bold">
                100% Direct Escrow Disbursement • UWA &amp; UTB Audited
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
                Verified Wildlife &amp; Community Fundraisers
              </h2>
              <p className="text-sm sm:text-base text-[#5A5248]">
                Support frontline ranger solar outposts, Batwa apiary homesteads, and Mabamba Shoebill nest guardians. Every donation generates an instant UWA/UTB audit receipt in your Safari Wallet.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CONSERVATION_FUNDRAISERS.map((fund) => {
                const progressPct = Math.min(
                  100,
                  Math.round(
                    (fund.raisedAmountUSD / fund.targetAmountUSD) * 100
                  )
                );
                const selectedAmount = customDonationAmounts[fund.id] || 100;

                return (
                  <article
                    key={fund.id}
                    className="bg-white border border-[#E4DCCF] hover:border-[#C85A28] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="relative h-52 bg-[#144225] overflow-hidden">
                        <SmartImage
                          src={fund.heroImage}
                          alt={fund.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/90 via-[#1A1612]/25 to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[10px] font-bold uppercase">
                            {fund.category}
                          </span>
                          <span className="px-2.5 py-1 rounded bg-white text-[#1A1612] font-mono text-[10px] font-bold">
                            {fund.backersCount} Supporters
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <div className="font-mono text-xs text-[#D99B26] font-semibold">
                            {fund.beneficiaryOrganization}
                          </div>
                          <div className="text-xs text-[#E4DCCF] truncate mt-0.5">
                            {fund.region}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#226B3E]/30 font-mono text-[10px] font-bold text-[#226B3E]">
                            {fund.utbUwaVerificationCode}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-[#1A1612] leading-snug">
                          {fund.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                          {fund.summary}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                          <div className="flex items-baseline justify-between font-mono text-xs">
                            <span className="font-bold text-[#226B3E]">
                              {formatPrice(fund.raisedAmountUSD, currency)} raised
                            </span>
                            <span className="text-[#5A5248]">
                              Goal: {formatPrice(fund.targetAmountUSD, currency)} (
                              {progressPct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E4DCCF]">
                            <div
                              className="h-full bg-[#226B3E] rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-4 bg-[#FAF7F2] border-t border-[#E4DCCF] space-y-3">
                      <div className="flex items-center gap-1.5">
                        {[50, 100, 250, 500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() =>
                              setCustomDonationAmounts((prev) => ({
                                ...prev,
                                [fund.id]: amt,
                              }))
                            }
                            className={`flex-1 py-1.5 rounded-md font-mono text-xs font-bold border transition-colors cursor-pointer ${
                              selectedAmount === amt
                                ? 'bg-[#1A1612] text-[#D99B26] border-[#1A1612]'
                                : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDirectContribution(
                            fund.id,
                            fund.title,
                            selectedAmount,
                            'Conservation Fundraiser Pledge'
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4" />
                        <span>
                          Contribute {formatPrice(selectedAmount, currency)}{' '}
                          Directly
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: UTB & UWA MULTI-VENDOR VERIFICATION REGISTRY & ONBOARDING */}
        {activeTab === 'verification' && (
          <div className="space-y-10">
            <div className="bg-white border border-[#E4DCCF] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4DCCF] pb-6">
                <div className="space-y-2 max-w-3xl">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#226B3E] font-bold">
                    Multi-Vendor Marketplace Architecture • Uber / Jumia Model for East African Tourism
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
                    UTB &amp; UWA Verified Service Provider Registry
                  </h2>
                  <p className="text-sm text-[#5A5248] leading-relaxed">
                    Every tour operator, specialist field guide, hotel/lodge partner, and 4x4 fleet owner on Enganda is cryptographically and regulatorily verified against active{' '}
                    <strong>Uganda Tourism Board (UTB)</strong> operating licenses and{' '}
                    <strong>Uganda Wildlife Authority (UWA)</strong> permit escrow registrations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    to="/guides?section=partners"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-bold transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-[#D99B26]" />
                    <span>Onboard Hotel / Lodge Rooms</span>
                  </Link>
                  <Link
                    to="/guides?section=drivers-cars"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-bold transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    <span>Onboard 4x4 Driver &amp; Fleet</span>
                  </Link>
                </div>
              </div>

              {/* Verified Vendors Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-[#226B3E]">
                      01 · Licensed Tour Operators
                    </span>
                    <Compass className="w-5 h-5 text-[#226B3E]" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                    {TOUR_OPERATORS.length} Flagship Operators
                  </h3>
                  <ul className="space-y-2 text-xs text-[#1A1612]">
                    {TOUR_OPERATORS.map((op) => (
                      <li
                        key={op.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E4DCCF] flex items-center justify-between gap-2"
                      >
                        <span className="font-semibold">{op.name}</span>
                        <span className="font-mono text-[10px] text-[#226B3E] font-bold">
                          {op.utbLicenseNumber || 'UTB/TO/2026/0102'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-[#C85A28]">
                      02 · Verified Hotels &amp; Lodges
                    </span>
                    <Building2 className="w-5 h-5 text-[#C85A28]" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                    {PARTNER_ACCOMMODATIONS.length} Accredited Properties
                  </h3>
                  <ul className="space-y-2 text-xs text-[#1A1612]">
                    {PARTNER_ACCOMMODATIONS.slice(0, 4).map((hotel) => (
                      <li
                        key={hotel.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E4DCCF] flex items-center justify-between gap-2"
                      >
                        <span className="font-semibold truncate">
                          {hotel.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#226B3E] font-bold shrink-0">
                          {hotel.utbLicenseNumber || 'UTB/HL/2026/104'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-[#1A1612]">
                      03 · UWA 4x4 Driver Fleet
                    </span>
                    <Car className="w-5 h-5 text-[#226B3E]" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                    {INITIAL_DRIVER_FLEET_VEHICLES.length} Inspected Safari Vehicles
                  </h3>
                  <ul className="space-y-2 text-xs text-[#1A1612]">
                    {INITIAL_DRIVER_FLEET_VEHICLES.slice(0, 4).map((veh) => (
                      <li
                        key={veh.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E4DCCF] flex items-center justify-between gap-2"
                      >
                        <span className="font-semibold truncate">
                          {veh.driverName}
                        </span>
                        <span className="font-mono text-[10px] text-[#C85A28] font-bold shrink-0">
                          {veh.registrationPlate}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
