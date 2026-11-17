import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  FileCheck,
  MessageCircle,
  MapPin,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Plus,
  Plane,
  FileText,
  Globe,
} from 'lucide-react';
import {
  GUIDES,
  EXPERIENCES,
  HQ_ADDRESS,
  AVAILABILITY_PROMISE,
  SHUMA_COMPANY_INFO,
  TOUR_OPERATORS,
  SHARED_DRIVE_MEDIA_VAULT,
  SHARED_GOOGLE_DRIVE_FOLDER_URL,
  drivePhotoUrl,
  getWhatsAppUrl,
} from '../data/seedData';
import { GuideCard } from '../components/GuideCard';
import { ExperienceCard } from '../components/ExperienceCard';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { SocialStrip } from '../components/SocialLinks';
import { Journal } from '../components/Journal';
import { UgandaParksMap } from '../components/UgandaParksMap';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { SafariItineraryGenerator } from '../components/SafariItineraryGenerator';
import { ClientTestimonialsCarousel } from '../components/ClientTestimonialsCarousel';
import { useInquiry } from '../context/InquiryContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../lib/currency';

export const HomePage: React.FC = () => {
  const {
    currency,
    openInquiryModal,
    carouselEvents,
    upcomingEvents,
  } = useInquiry();
  const { t } = useLanguage();
  const featuredGuides = GUIDES.slice(0, 4);
  const featuredExperiences = useMemo(() => {
    const prioritySlugs = [
      '8-day-tingatinga-signature-primate-lions-nile',
      '32-day-east-african-grand-safari-2027',
      '15-day-shuma-uganda-grand-sector',
      '7-day-shuma-uganda-rwanda-primate-akagera',
    ];
    const priorityPackages = EXPERIENCES.filter((e) =>
      prioritySlugs.includes(e.slug)
    );
    const classicPackages = EXPERIENCES.filter(
      (e) => !prioritySlugs.includes(e.slug)
    ).slice(0, 2);
    return [...priorityPackages, ...classicPackages];
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [upcomingCategoryFilter, setUpcomingCategoryFilter] = useState<string>('all');

  const safeSlideIndex =
    carouselEvents.length > 0 ? activeSlide % carouselEvents.length : 0;

  useEffect(() => {
    if (carouselPaused || carouselEvents.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselEvents.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [carouselPaused, carouselEvents.length]);

  const currentPackage = carouselEvents[safeSlideIndex] || carouselEvents[0];
  const currentPackageGuide = currentPackage
    ? GUIDES.find((g) => g.slug === currentPackage.leadGuideSlug)
    : undefined;

  const handlePrevSlide = () => {
    if (carouselEvents.length === 0) return;
    setActiveSlide((prev) =>
      prev === 0 ? carouselEvents.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    if (carouselEvents.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % carouselEvents.length);
  };

  const filteredUpcomingPrograms = useMemo(() => {
    if (upcomingCategoryFilter === 'all') return upcomingEvents;
    return upcomingEvents.filter((item) => item.category === upcomingCategoryFilter);
  }, [upcomingEvents, upcomingCategoryFilter]);

  return (
    <div className="bg-[#FAF7F2] text-[#1A1612]">
      <SEO
        title="Enganda Safaris | Uganda Safaris Led by Local Ugandan Guides"
        description="Uganda, shown to you by the people who call it home. Book a named, licensed Ugandan safari guide for Bwindi gorilla trekking, Nyege Nyege Festival & Nile safaris, Kibale chimpanzees, and Kidepo Valley."
      />

      {/* 1. Full-Viewport Wildlife Hero + Confirmed Packages & Events Carousel */}
      <section className="relative min-h-[88vh] flex items-center bg-[#226B3E] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src={drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE', 2000)}
            alt="Mountain Gorilla in Bwindi Impenetrable Forest, Uganda"
            className="w-full h-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#144225]/95 via-[#226B3E]/85 to-[#144225]/80" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14 w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left 5 Columns: Editorial Headline, Manifesto, CTAs & Social Connections */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#144225]/60 backdrop-blur-xs border border-white/15 rounded-xl p-5 sm:p-7 shadow-xl min-w-0">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold max-w-full">
                  <Compass className="w-4 h-4 text-[#D99B26] shrink-0" />
                  <span className="break-words">{t.home.heroBadge}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl xl:text-[44px] font-bold leading-[1.1] tracking-tight text-white break-words">
                  {t.home.heroTitle}
                </h1>

                <p className="text-sm sm:text-base text-[#E4DCCF] leading-relaxed break-words">
                  {t.home.heroParagraph}
                </p>

                {/* Primary Conversion CTAs — Strictly bounded inside column */}
                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    to="/guides"
                    className="inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-md transition-colors shadow-md text-center"
                  >
                    <span>{t.home.ctaMeetGuides}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>

                  <Link
                    to="/trip-planner"
                    className="inline-flex items-center justify-center gap-2 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#226B3E] font-semibold text-xs sm:text-sm px-4 py-3 rounded-md transition-colors text-center"
                  >
                    <span>{t.home.ctaPlanSafari}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>

                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-[#1A1612]/80 hover:bg-[#1A1612] text-[#FAF7F2] border border-white/25 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-md transition-colors text-center"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span>{t.home.ctaWhatsappDesk}</span>
                  </a>
                </div>
              </div>

              {/* Bottom Aligned Trust Credentials & Social Connections */}
              <div className="space-y-4 pt-4 border-t border-white/15">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 text-xs text-[#D6CEC2]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="break-words">{t.home.trustUtb}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="break-words">{t.home.trustUwa}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="break-words">{t.home.trustHq}</span>
                  </div>
                </div>

                {/* Direct Social Media Connections */}
                <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-semibold">
                    {t.home.followDispatches}
                  </span>
                  <SocialStrip variant="hero-dark" showLabels={true} />
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Confirmed Packages & Events Carousel (Refined so all tabs & words fit strictly inside boundaries) */}
            {currentPackage && (
              <div
                className="lg:col-span-7 w-full min-w-0 flex flex-col"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                <div className="bg-[#144225]/95 backdrop-blur-md border border-[#D99B26]/40 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between min-h-[450px] sm:min-h-[500px] lg:min-h-[550px] min-w-0">
                  {/* 1. Carousel Top Header Bar */}
                  <div className="px-4 sm:px-5 py-3 bg-[#1A1612]/85 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-[#D99B26] shrink-0" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#FAF7F2] font-semibold truncate">
                        {t.home.confirmedPackagesHeader}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/portals/admin?section=events-manager"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#226B3E] hover:bg-[#2E8550] text-[#D99B26] border border-[#D99B26]/40 font-mono text-[10px] font-semibold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Admin: Load Event</span>
                      </Link>

                      <span className="font-mono text-xs text-[#D99B26] tabular-nums">
                        0{safeSlideIndex + 1} / 0{carouselEvents.length}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          aria-label="Previous confirmed package or event"
                          className="p-1.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-white/15 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          aria-label="Next confirmed package or event"
                          className="p-1.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-white/15 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Dedicated Wrapping Event Selector Tab Bar (Fits cleanly without overflowing) */}
                  <div
                    role="tablist"
                    aria-label="Confirmed safari packages and events"
                    className="px-4 sm:px-5 py-2.5 bg-[#1B5632] border-b border-white/10 flex flex-wrap items-center gap-1.5 min-w-0"
                  >
                    {carouselEvents.map((pkg, idx) => {
                      const isCurrent = idx === safeSlideIndex;
                      const label =
                        pkg.shortTabLabel ||
                        (pkg.title.length > 24
                          ? `${pkg.title.slice(0, 22)}…`
                          : pkg.title);
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          onClick={() => setActiveSlide(idx)}
                          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer max-w-full truncate ${
                            isCurrent
                              ? 'bg-[#C85A28] text-white font-semibold shadow-xs'
                              : 'bg-[#144225]/80 text-[#D6CEC2] hover:text-white hover:bg-[#226B3E]'
                          }`}
                        >
                          0{idx + 1}. {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 3. Balanced 6/6 Split Slide Content (All text wraps strictly inside bounds) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[360px] sm:min-h-[410px] min-w-0">
                    {/* Active Slide Media Banner (6 cols on md+) */}
                    <div className="relative md:col-span-6 min-h-[280px] sm:min-h-[340px] md:min-h-full overflow-hidden flex flex-col justify-between p-4 sm:p-5 min-w-0">
                      <SmartImage
                        src={currentPackage.heroImage}
                        alt={currentPackage.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#144225] via-[#144225]/50 to-[#1A1612]/45" />

                      {/* Top Status Row */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[10px] uppercase tracking-wider font-semibold shadow break-words max-w-full">
                          {currentPackage.eventTag}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-[#1A1612]/90 border border-[#D99B26]/50 text-[#D99B26] font-mono text-[11px] font-medium tabular-nums">
                          {currentPackage.statusLabel}
                        </span>
                      </div>

                      {/* Bottom Media Overlay: Date, Title & 2x2 Compact Slide Switcher */}
                      <div className="relative z-10 space-y-3 pt-8 min-w-0">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[#E4DCCF] mb-1.5">
                            <span className="inline-flex items-center gap-1 text-[#D99B26] font-semibold tabular-nums">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>{currentPackage.dateWindow}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{currentPackage.durationLabel}</span>
                          </div>
                          <h2 className="font-serif text-xl sm:text-2xl xl:text-3xl font-bold text-white leading-snug break-words">
                            {currentPackage.title}
                          </h2>
                          <div className="text-xs font-mono text-[#D6CEC2] mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                            <span className="break-words">{currentPackage.location}</span>
                          </div>
                        </div>

                        {/* 2-Column Preview Grid (Never clips text) */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/15">
                          {carouselEvents.slice(0, 4).map((pkg, idx) => {
                            const active = idx === safeSlideIndex;
                            return (
                              <button
                                key={pkg.id}
                                type="button"
                                onClick={() => setActiveSlide(idx)}
                                className={`text-left rounded-md border transition-all cursor-pointer px-2.5 py-1.5 min-w-0 ${
                                  active
                                    ? 'bg-[#1A1612]/90 border-[#D99B26] shadow-xs'
                                    : 'bg-[#1A1612]/55 border-white/15 hover:border-white/40 opacity-85 hover:opacity-100'
                                }`}
                              >
                                <div className="font-mono text-[10px] text-[#D99B26] truncate">
                                  0{idx + 1} · {pkg.dateWindow}
                                </div>
                                <div className="text-[11px] font-semibold text-white truncate">
                                  {pkg.shortTabLabel || pkg.title}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Active Slide Body (6 cols on md+, all words wrapped inside bounds) */}
                    <div className="md:col-span-6 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-[#144225]/95 border-t md:border-t-0 md:border-l border-white/10 min-w-0">
                      <div className="space-y-4 min-w-0">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] font-semibold">
                            {currentPackage.category}
                          </span>
                          <p className="text-xs sm:text-sm text-[#E4DCCF] leading-relaxed mt-1 break-words">
                            {currentPackage.subtitle}
                          </p>
                        </div>

                        {/* Highlights List */}
                        <div className="space-y-2 pt-2 border-t border-white/10 min-w-0">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#D6CEC2]">
                            Included Permits &amp; Expedition Highlights
                          </div>
                          <ul className="space-y-2">
                            {currentPackage.highlights.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-xs text-[#FAF7F2] leading-relaxed min-w-0"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#D99B26] shrink-0 mt-0.5" />
                                <span className="break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-3 border-t border-white/15 min-w-0">
                        {/* Lead Guide + Price Row (Wraps cleanly so price never collides) */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#1B5632]/70 p-3 rounded-lg border border-white/10 min-w-0">
                          {currentPackageGuide ? (
                            <Link
                              to={`/guides/${currentPackageGuide.slug}`}
                              className="flex items-center gap-2.5 group min-w-0"
                            >
                              <SmartImage
                                src={currentPackageGuide.photo}
                                alt={currentPackageGuide.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#D99B26] shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-[10px] font-mono uppercase text-[#D99B26]">
                                  {t.home.ledBySpecialist}
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#D99B26] transition-colors break-words">
                                  {currentPackageGuide.name}
                                </div>
                              </div>
                            </Link>
                          ) : null}

                          <div className="text-left sm:text-right">
                            <div className="text-[10px] font-mono uppercase text-[#D6CEC2]">
                              {t.home.confirmedFrom}
                            </div>
                            <div className="font-mono text-lg font-bold text-[#D99B26] tabular-nums">
                              {formatPrice(currentPackage.pricePerPersonUSD, currency)}{' '}
                              <span className="text-[11px] font-normal text-[#D6CEC2]">
                                {t.home.perPerson}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons (Responsive grid so words never go out of bounds) */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openInquiryModal({
                                experienceSlug: currentPackage.experienceSlug,
                                guideSlug: currentPackage.leadGuideSlug,
                                defaultNotes: `Requesting confirmed package/event: ${currentPackage.title} (${currentPackage.dateWindow}) led by ${currentPackageGuide?.name || 'Enganda Specialist'}.`,
                              })
                            }
                            className={`${
                              currentPackage.experienceSlug ? 'sm:col-span-8' : 'sm:col-span-12'
                            } inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold px-3.5 py-3 rounded-md transition-colors cursor-pointer shadow-md text-center`}
                          >
                            <span>
                              {t.home.reserveSpot} ({currentPackage.spotsRemaining}{' '}
                              {t.home.left})
                            </span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>

                          {currentPackage.experienceSlug && (
                            <Link
                              to={`/experiences/${currentPackage.experienceSlug}`}
                              className="sm:col-span-4 inline-flex items-center justify-center px-3 py-3 rounded-md bg-[#226B3E] hover:bg-[#287A47] text-[#FAF7F2] border border-white/15 text-xs font-medium transition-colors text-center"
                            >
                              {t.home.itineraryBtn}
                            </Link>
                          )}
                        </div>

                        {/* Slide Progress Indicators */}
                        <div className="flex items-center justify-center gap-1.5 pt-0.5">
                          {carouselEvents.map((pkg, idx) => (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setActiveSlide(idx)}
                              aria-label={`Go to slide ${idx + 1}: ${pkg.title}`}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                idx === safeSlideIndex
                                  ? 'w-7 bg-[#D99B26]'
                                  : 'w-2 bg-white/25 hover:bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Safari Discovery Bar Beneath Hero Grid */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="#upcoming-safari-programs"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  01 · Scheduled Departures
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors truncate">
                  Upcoming Programs ({upcomingEvents.length})
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#uganda-parks-map"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  02 · Interactive Route Map
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors truncate">
                  Explore National Parks &amp; Circuits
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#safari-itinerary-generator"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  03 · Custom Route Builder
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors truncate">
                  Build &amp; Save Your Safari Itinerary
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              to="/portals/admin?section=events-manager"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  04 · Admin &amp; Role Portals
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors truncate">
                  Load Events, Permits &amp; Portals
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 1B. Upcoming Safari Programs & Scheduled Expeditions (Managed via Admin Portal) */}
      <section
        id="upcoming-safari-programs"
        className="py-16 bg-[#FAF7F2] border-b border-[#E4DCCF]"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                <Calendar className="w-4 h-4 text-[#226B3E]" />
                <span>Scheduled Departures &amp; Seasonal Expeditions · 2026 / 2027</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612]">
                Upcoming Safari Programs &amp; Trips
              </h2>
              <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
                Small-group and private scheduled departures across Queen Elizabeth, Murchison Falls, Rwenzori Mountains, Lake Mburo, and Kidepo Valley — led by our named Ugandan specialists.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/portals/admin?section=events-manager"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D99B26]" />
                <span>Admin: Load New Event / Trip</span>
              </Link>
              <Link
                to="/trip-planner"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Request Custom Date</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Category Filter Bar for Upcoming Programs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg w-fit">
            {[
              { id: 'all', label: `All Upcoming (${upcomingEvents.length})` },
              { id: 'Seasonal Migration & Savanna', label: 'Savanna & Big Game' },
              { id: 'Cultural & Music Event', label: 'Cultural, Highlands & Events' },
              { id: 'Guaranteed Primate Departure', label: 'Primate Departures' },
              { id: 'Ornithology Special', label: 'Ornithology & Birding' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setUpcomingCategoryFilter(tab.id)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  upcomingCategoryFilter === tab.id
                    ? 'bg-[#226B3E] text-white shadow-xs'
                    : 'text-[#5A5248] hover:text-[#1A1612] hover:bg-[#FAF7F2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upcoming Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcomingPrograms.map((prog) => {
              const progGuide = GUIDES.find((g) => g.slug === prog.leadGuideSlug);
              return (
                <article
                  key={prog.id}
                  className="bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-xs"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden bg-[#144225]">
                      <SmartImage
                        src={prog.heroImage}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 via-[#1A1612]/20 to-transparent" />

                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5">
                        <span className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-[10px] uppercase tracking-wider font-semibold">
                          {prog.eventTag}
                        </span>
                        {prog.placement === 'both' && (
                          <span className="px-2 py-0.5 rounded bg-[#C85A28] text-white font-mono text-[10px] font-semibold">
                            Featured on Carousel
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="font-mono text-xs text-[#D99B26] font-semibold">
                          {prog.dateWindow} · {prog.durationLabel}
                        </div>
                        <div className="text-xs text-[#E4DCCF] truncate mt-0.5">
                          {prog.location}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#5A5248]">
                        <span className="text-[#226B3E] font-semibold">{prog.category}</span>
                        <span className="text-[#C85A28] font-semibold tabular-nums">
                          {prog.spotsRemaining} spots open
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-[#1A1612] leading-snug break-words">
                        {prog.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed break-words">
                        {prog.subtitle}
                      </p>

                      <ul className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                        {prog.highlights.slice(0, 3).map((hl) => (
                          <li
                            key={hl}
                            className="flex items-start gap-2 text-xs text-[#1A1612]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0 mt-0.5" />
                            <span className="break-words">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-4 bg-[#FAF7F2] border-t border-[#E4DCCF] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {progGuide ? (
                        <Link
                          to={`/guides/${progGuide.slug}`}
                          className="flex items-center gap-2 group min-w-0"
                        >
                          <SmartImage
                            src={progGuide.photo}
                            alt={progGuide.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#226B3E] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase text-[#5A5248]">
                              Lead Guide
                            </div>
                            <div className="text-xs font-semibold text-[#1A1612] group-hover:text-[#226B3E] truncate">
                              {progGuide.name}
                            </div>
                          </div>
                        </Link>
                      ) : null}

                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase text-[#5A5248]">
                          Program Tariff
                        </div>
                        <div className="font-mono text-base font-bold text-[#226B3E] tabular-nums">
                          {formatPrice(prog.pricePerPersonUSD, currency)}{' '}
                          <span className="text-[10px] font-normal text-[#5A5248]">pp</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openInquiryModal({
                          experienceSlug: prog.experienceSlug,
                          guideSlug: prog.leadGuideSlug,
                          defaultNotes: `Booking upcoming safari program: ${prog.title} (${prog.dateWindow})`,
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
                    >
                      <span>Reserve Program Spot ({prog.spotsRemaining} Open)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. 3-Step "How It Works" Strip */}
      <section className="bg-[#F3ECE1] border-b border-[#E4DCCF] py-14">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                {t.home.howItWorksTag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] mt-1">
                {t.home.howItWorksTitle}
              </h2>
            </div>
            <Link
              to="/how-we-work"
              className="text-xs sm:text-sm font-semibold text-[#226B3E] hover:text-[#C85A28] inline-flex items-center gap-1"
            >
              <span>{t.home.howItWorksLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  {t.home.step1Tag}
                </span>
                <Calendar className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                {t.home.step1Title}
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                {t.home.step1Desc}
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  {t.home.step2Tag}
                </span>
                <Users className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                {t.home.step2Title}
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                {t.home.step2Desc}
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  {t.home.step3Tag}
                </span>
                <Compass className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                {t.home.step3Title}
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                {t.home.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Guides Showcase FIRST */}
      <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              {t.home.guidesSectionTag}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612] mt-1">
              {t.home.guidesSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] mt-2 max-w-2xl">
              {t.home.guidesSectionDesc}
            </p>
          </div>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            <span>{t.home.ctaMeetGuides}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onRequestGuide={(g) => openInquiryModal({ guideSlug: g.slug })}
            />
          ))}
        </div>
      </section>

      {/* 4. Featured Uganda & Shuma East African Grand Safari Experiences */}
      <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 border-t border-[#E4DCCF] space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              {t.home.experiencesSectionTag} • Featuring {SHUMA_COMPANY_INFO.name}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612] mt-1">
              {t.home.experiencesSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] mt-2 max-w-2xl">
              {t.home.experiencesSectionDesc} Explore both our classic Uganda circuits and the flagship <strong>32-Day East African Grand Safari 2027</strong> by <strong>{SHUMA_COMPANY_INFO.name}</strong> (<em>“{SHUMA_COMPANY_INFO.tagline}”</em>).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={SHUMA_COMPANY_INFO.pdfBrochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#144225] hover:bg-[#1B5632] text-[#D99B26] border border-[#D99B26]/40 text-xs sm:text-sm font-mono font-semibold transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>32-Day Shuma PDF Dossier</span>
            </a>
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
            >
              <span>{t.home.filterAllExperiences} ({EXPERIENCES.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Flagship Shuma Africa Safaris 2027 Multi-Country Banner */}
        <div className="bg-[#144225] text-[#FAF7F2] rounded-xl border border-[#D99B26]/50 p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-bold uppercase">
                {SHUMA_COMPANY_INFO.name} • “{SHUMA_COMPANY_INFO.tagline}”
              </span>
              <span className="px-2.5 py-1 rounded bg-[#1B5632] text-[#D99B26] border border-white/15 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Tanzania • Kenya • Uganda • Rwanda</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#1B5632] text-[#E4DCCF] border border-white/15 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Includes Kidepo–Murchison Private Charter</span>
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              The 32-Day East African Grand Safari 2027 (7 Paying Guests + 1 Complimentary Tour Leader)
            </h3>

            <p className="text-xs sm:text-sm text-[#E4DCCF] leading-relaxed">
              June–September 2027 • 32 Days / 31 Nights across 4 countries in 4-Star Safari Lodges (4 Twin + 1 Single Room). Includes Tarangire, Ngorongoro Crater, Central Serengeti bush flight, Maasai Mara, Lake Nakuru, Kisumu–Entebbe flight, Mabamba Shoebill, Source of the Nile, Sipi Falls, Pian Upe, Karamoja, Kidepo Valley with private charter flight to Murchison Falls, Kibale Chimps, Queen Elizabeth, Bwindi Gorillas, Volcanoes Golden Monkeys, Lake Kivu, Nyungwe Canopy &amp; Akagera NP.
            </p>
          </div>

          <div className="lg:col-span-4 bg-[#1A1612]/90 border border-[#D99B26]/40 rounded-lg p-5 space-y-3">
            <div className="flex items-baseline justify-between border-b border-white/15 pb-2">
              <span className="font-mono text-xs text-[#D6CEC2]">Per Person (7 Guests):</span>
              <span className="font-mono text-xl font-bold text-[#D99B26]">$18,078.57 USD</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-[#D6CEC2]">Total Group (7 + 1 Free Leader):</span>
              <span className="text-white font-bold">
                {formatPrice(SHUMA_COMPANY_INFO.totalGroupCostUSD, currency)} ($126,550)
              </span>
            </div>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                to="/experiences/32-day-east-african-grand-safari-2027"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors text-center"
              >
                <span>View 32-Day Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={SHUMA_COMPANY_INFO.pdfBrochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-white/20 text-xs font-semibold transition-colors text-center"
              >
                <FileText className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>

        {/* Official Accredited Tour Operators Collective (Tingatinga Safaris, Enganda / WildLife Safaris, Shuma Africa Safaris) */}
        <div className="pt-8 border-t border-[#E4DCCF] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Official Tour Operator Collective • UTB &amp; AUTO Accredited
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1">
                Operated by Tingatinga Safaris, Enganda / WildLife Safaris &amp; Shuma Africa Safaris
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] mt-1 max-w-3xl">
                Every expedition on our platform is operated by our licensed East African tour operator collective — combining <strong>Tingatinga Safaris</strong>, <strong>Enganda / WildLife Safaris</strong>, and <strong>Shuma Africa Safaris</strong> with unified UWA permit escrow and Safari Wallet settlement.
              </p>
            </div>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-mono font-semibold transition-colors shrink-0"
            >
              <span>Open Universal Safari Wallet</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TOUR_OPERATORS.map((operator) => (
              <div
                key={operator.id}
                className="bg-white border border-[#E4DCCF] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#226B3E] transition-colors"
              >
                <div>
                  <div className="relative h-44 bg-[#144225] overflow-hidden">
                    <SmartImage
                      src={operator.heroImage}
                      alt={operator.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/90 via-[#1A1612]/30 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#C85A28] text-white font-mono text-[10px] font-bold uppercase">
                        {operator.roleLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#144225]/90 text-[#D99B26] font-mono text-[10px] border border-[#D99B26]/30">
                        {operator.accreditations[0] || 'UTB Licensed'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-serif text-xl font-bold leading-tight">
                        {operator.name}
                      </h4>
                      <p className="text-[11px] text-[#E4DCCF] italic">
                        “{operator.tagline}”
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="text-[11px] font-mono text-[#226B3E] font-semibold">
                      HQ: {operator.headquarters}
                    </div>
                    <p className="text-xs text-[#5A5248] leading-relaxed">
                      {operator.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {operator.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E4DCCF] font-mono text-[10px] text-[#1A1612]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-3 bg-[#FAF7F2] border-t border-[#E4DCCF] flex items-center justify-between gap-2">
                  <Link
                    to={
                      operator.id === 'op-tingatinga-safaris'
                        ? '/experiences/8-day-tingatinga-signature-primate-lions-nile'
                        : operator.id === 'op-shuma-africa-safaris'
                        ? '/experiences/32-day-east-african-grand-safari-2027'
                        : '/experiences/7-day-best-of-uganda'
                    }
                    className="text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] inline-flex items-center gap-1"
                  >
                    <span>View Signature Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      openInquiryModal({
                        experienceSlug:
                          operator.id === 'op-tingatinga-safaris'
                            ? '8-day-tingatinga-signature-primate-lions-nile'
                            : operator.id === 'op-shuma-africa-safaris'
                            ? '32-day-east-african-grand-safari-2027'
                            : '7-day-best-of-uganda',
                        defaultNotes: `Requesting custom itinerary with ${operator.name}.`,
                      })
                    }
                    className="px-3 py-1.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Inquire Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Shared Google Drive Photography Vault Showcase */}
        <div className="pt-8 border-t border-[#E4DCCF] space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#226B3E] font-semibold">
                Verified Uganda Field Photography • Shared Google Drive Archive
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1">
                Authentic National Park, Primate &amp; Cultural Dispatches
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5248] mt-1 max-w-3xl">
                All photography across our safari experiences, national park guides, lodges, and journals is curated directly from our official Uganda field repository.
              </p>
            </div>
            <a
              href={SHARED_GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#144225] border border-[#226B3E]/40 font-mono text-xs font-semibold transition-colors shrink-0"
            >
              <span>Browse Official Google Drive Folder</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C85A28]" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SHARED_DRIVE_MEDIA_VAULT.slice(0, 12).map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-lg overflow-hidden border border-[#E4DCCF] bg-[#144225] h-40 shadow-xs"
              >
                <SmartImage
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/90 via-[#1A1612]/20 to-transparent" />
                <div className="absolute top-2 left-2 right-2">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-[#144225]/90 text-[#D99B26] font-mono text-[9px] truncate max-w-full">
                    {photo.folderCategory}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <div className="font-serif text-xs font-bold leading-snug line-clamp-1">
                    {photo.title}
                  </div>
                  <div className="text-[10px] text-[#E4DCCF] line-clamp-1">
                    {photo.region}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4B. Bespoke Safari Itinerary Generator (Save to User Wallet) */}
      <SafariItineraryGenerator />

      {/* 4C. Interactive D3 National Parks Map (Bwindi, Kibale, Murchison, Kidepo) */}
      <UgandaParksMap />

      {/* 5. Horizontal Scrollable Field Journal (Travel Updates, Safari Tips & Cultural Stories) */}
      <Journal />

      {/* 5B. 'Join the Expedition' Newsletter Signup & Safari Wallet Credit */}
      <NewsletterSignup />

      {/* 6. Client Testimonials Carousel (Pulling from Database with Star Rating, Client Name & Destination) */}
      <ClientTestimonialsCarousel />

      {/* 7. Bottom Conversion / Entebbe Office Dual CTA */}
      <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-[#FAF7F2] border-2 border-[#226B3E] rounded-xl p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              {t.home.bottomCtaTag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
              {t.home.bottomCtaTitle}
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              {t.home.bottomCtaDesc} (<strong className="text-[#1A1612]">{HQ_ADDRESS}</strong> — {AVAILABILITY_PROMISE})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <Link
              to="/trip-planner"
              className="inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors"
            >
              <span>{t.home.ctaPlanSafari}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] font-semibold text-sm px-6 py-3.5 rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#D99B26]" />
              <span>{t.home.whatsappUs}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
