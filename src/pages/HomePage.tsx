import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  GUIDES,
  EXPERIENCES,
  HQ_ADDRESS,
  AVAILABILITY_PROMISE,
  CONFIRMED_PACKAGES_AND_EVENTS,
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
  const { currency, openInquiryModal } = useInquiry();
  const { t } = useLanguage();
  const featuredGuides = GUIDES.slice(0, 4);
  const featuredExperiences = EXPERIENCES.slice(0, 6);

  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CONFIRMED_PACKAGES_AND_EVENTS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [carouselPaused]);

  const currentPackage = CONFIRMED_PACKAGES_AND_EVENTS[activeSlide];
  const currentPackageGuide = GUIDES.find(
    (g) => g.slug === currentPackage.leadGuideSlug
  );

  const handlePrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? CONFIRMED_PACKAGES_AND_EVENTS.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CONFIRMED_PACKAGES_AND_EVENTS.length);
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1612]">
      <SEO
        title="Enganda Safaris | Uganda Safaris Led by Local Ugandan Guides"
        description="Uganda, shown to you by the people who call it home. Book a named, licensed Ugandan safari guide for Bwindi gorilla trekking, Nyege Nyege Festival & Nile safaris, Kibale chimpanzees, and Kidepo Valley."
      />

      {/* 1. Full-Viewport Wildlife Hero + Confirmed Packages & Events Carousel (25% Wider & 25% Taller) */}
      <section className="relative min-h-[90vh] flex items-center bg-[#226B3E] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=85"
            alt="Mountain Gorilla in Bwindi Impenetrable Forest, Uganda"
            className="w-full h-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#144225]/95 via-[#226B3E]/85 to-[#144225]/80" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14 w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left 5 Columns: Editorial Headline, Manifesto, CTAs & Social Connections aligned vertically */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#144225]/60 backdrop-blur-xs border border-white/15 rounded-xl p-5 sm:p-7 shadow-xl min-w-0">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold">
                  <Compass className="w-4 h-4 text-[#D99B26] shrink-0" />
                  <span className="truncate">{t.home.heroBadge}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl xl:text-[46px] font-bold leading-[1.1] tracking-tight text-white">
                  {t.home.heroTitle}
                </h1>

                <p className="text-sm sm:text-base text-[#E4DCCF] leading-relaxed">
                  {t.home.heroParagraph}
                </p>

                {/* Primary Conversion CTAs — Sized to fit strictly inside column boundary */}
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
              <div className="space-y-4 pt-5 border-t border-white/15">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 text-xs text-[#D6CEC2]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                    <span>{t.home.trustUtb}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                    <span>{t.home.trustUwa}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                    <span>{t.home.trustHq}</span>
                  </div>
                </div>

                {/* Direct Social Media Connections (X, Instagram, LinkedIn) */}
                <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-semibold shrink-0">
                    {t.home.followDispatches}
                  </span>
                  <SocialStrip variant="hero-dark" showLabels={true} />
                </div>
              </div>
            </div>

            {/* Right 7 Columns (Wider by 25% & Vertically Taller by 25%): Confirmed Packages & Events Carousel */}
            <div
              className="lg:col-span-7 w-full min-w-0 flex flex-col"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <div className="bg-[#144225]/95 backdrop-blur-md border border-[#D99B26]/40 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between min-h-[440px] sm:min-h-[500px] lg:min-h-[560px]">
                {/* Carousel Top Header Bar */}
                <div className="px-5 sm:px-6 py-4 bg-[#1A1612]/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-wider text-[#FAF7F2] font-semibold">
                      {t.home.confirmedPackagesHeader}
                    </span>
                  </div>

                  {/* Quick Event Selector Tabs inline */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar order-3 sm:order-2 w-full sm:w-auto pt-1 sm:pt-0">
                    {CONFIRMED_PACKAGES_AND_EVENTS.map((pkg, idx) => {
                      const shortLabels = [
                        'Nyege Nyege Festival',
                        'Bwindi Gorilla Trek',
                        'Kidepo Expedition',
                        'Mabamba & Chimps',
                      ];
                      const isCurrent = idx === activeSlide;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          className={`px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isCurrent
                              ? 'bg-[#C85A28] text-white font-semibold shadow-xs'
                              : 'bg-[#226B3E]/80 text-[#D6CEC2] hover:text-white hover:bg-[#287A47]'
                          }`}
                        >
                          {shortLabels[idx] || pkg.category}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 order-2 sm:order-3">
                    <span className="font-mono text-xs text-[#D99B26] tabular-nums">
                      0{activeSlide + 1} / 0{CONFIRMED_PACKAGES_AND_EVENTS.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        aria-label="Previous confirmed package or event"
                        className="p-2 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-white/15 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        aria-label="Next confirmed package or event"
                        className="p-2 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-white/15 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wide & 25% Taller Split Slide Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[360px] sm:min-h-[430px] lg:min-h-[490px]">
                  {/* Active Slide Media Banner (7 cols on md+, 25% taller vertically) */}
                  <div className="relative md:col-span-7 min-h-[330px] sm:min-h-[400px] md:min-h-full overflow-hidden flex flex-col justify-between p-5 sm:p-6">
                    <SmartImage
                      src={currentPackage.heroImage}
                      alt={currentPackage.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#144225] via-[#144225]/45 to-[#1A1612]/40" />

                    {/* Top Status Row */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded bg-[#C85A28] text-white font-mono text-[11px] uppercase tracking-wider font-semibold shadow">
                        {currentPackage.eventTag}
                      </span>
                      <span className="px-3 py-1 rounded bg-[#1A1612]/90 border border-[#D99B26]/50 text-[#D99B26] font-mono text-xs font-medium tabular-nums">
                        {currentPackage.statusLabel}
                      </span>
                    </div>

                    {/* Bottom Media Overlay: Title, Date Window & Thumbnail Preview Strip */}
                    <div className="relative z-10 space-y-4 pt-12">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#E4DCCF] mb-2">
                          <span className="inline-flex items-center gap-1.5 text-[#D99B26] font-semibold tabular-nums">
                            <Calendar className="w-4 h-4" />
                            {currentPackage.dateWindow}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{currentPackage.durationLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#FAF7F2] font-semibold">
                            {currentPackage.spotsRemaining} {t.home.left}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl xl:text-4xl font-bold text-white leading-tight">
                          {currentPackage.title}
                        </h2>
                      </div>

                      {/* Interactive 4-Slide Visual Preview Strip inside Media Panel */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
                        {CONFIRMED_PACKAGES_AND_EVENTS.map((pkg, idx) => {
                          const active = idx === activeSlide;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setActiveSlide(idx)}
                              className={`group text-left rounded-md overflow-hidden border transition-all cursor-pointer p-1.5 ${
                                active
                                  ? 'bg-[#1A1612]/90 border-[#D99B26] shadow-md'
                                  : 'bg-[#1A1612]/50 border-white/15 hover:border-white/40 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className="font-mono text-[10px] text-[#D99B26] truncate">
                                0{idx + 1} · {pkg.durationLabel}
                              </div>
                              <div className="text-[11px] font-semibold text-white truncate">
                                {pkg.title}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Active Slide Body (5 cols on md+, vertically spacious) */}
                  <div className="md:col-span-5 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#144225]/95 border-t md:border-t-0 md:border-l border-white/10">
                    <div className="space-y-5">
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-semibold">
                          Confirmed Expedition Overview
                        </span>
                        <p className="text-sm text-[#E4DCCF] leading-relaxed mt-1.5">
                          {currentPackage.subtitle}
                        </p>
                      </div>

                      {/* Highlights List */}
                      <div className="space-y-2.5 pt-2 border-t border-white/10">
                        <div className="font-mono text-[11px] uppercase tracking-wider text-[#D6CEC2]">
                          Included Permits & Logistics
                        </div>
                        <ul className="space-y-2.5">
                          {currentPackage.highlights.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-[#FAF7F2]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#D99B26] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/15">
                      {/* Lead Guide + Price Row */}
                      <div className="flex items-center justify-between gap-3 bg-[#1B5632]/70 p-3.5 rounded-lg border border-white/10">
                        {currentPackageGuide ? (
                          <Link
                            to={`/guides/${currentPackageGuide.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            <SmartImage
                              src={currentPackageGuide.photo}
                              alt={currentPackageGuide.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-[#D99B26]"
                            />
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[#D99B26]">
                                {t.home.ledBySpecialist}
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#D99B26] transition-colors">
                                {currentPackageGuide.name}
                              </div>
                            </div>
                          </Link>
                        ) : null}

                        <div className="text-right">
                          <div className="text-[10px] font-mono uppercase text-[#D6CEC2]">
                            {t.home.confirmedFrom}
                          </div>
                          <div className="font-mono text-xl font-bold text-[#D99B26] tabular-nums">
                            {formatPrice(currentPackage.pricePerPersonUSD, currency)}
                            <span className="text-[11px] font-normal text-[#D6CEC2]">
                              {' '}
                              {t.home.perPerson}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            openInquiryModal({
                              experienceSlug: currentPackage.experienceSlug,
                              guideSlug: currentPackage.leadGuideSlug,
                              defaultNotes: `Requesting confirmed package/event: ${currentPackage.title} (${currentPackage.dateWindow}) led by ${currentPackageGuide?.name || 'Enganda Specialist'}.`,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold px-4 py-3.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                        >
                          <span>
                            {t.home.reserveSpot} ({currentPackage.spotsRemaining}{' '}
                            {t.home.left})
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {currentPackage.experienceSlug && (
                          <Link
                            to={`/experiences/${currentPackage.experienceSlug}`}
                            className="inline-flex items-center justify-center px-4 py-3.5 rounded-md bg-[#226B3E] hover:bg-[#287A47] text-[#FAF7F2] border border-white/15 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                          >
                            {t.home.itineraryBtn}
                          </Link>
                        )}
                      </div>

                      {/* Slide Progress Indicators */}
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        {CONFIRMED_PACKAGES_AND_EVENTS.map((pkg, idx) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setActiveSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}: ${pkg.title}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              idx === activeSlide
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
          </div>

          {/* Attention-Grabbing Quick Discovery Bar Beneath Hero Grid */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="#uganda-parks-map"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  01 · Interactive Route Map
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors">
                  Explore 6 National Parks & Circuits
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#safari-itinerary-generator"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  02 · Custom Route Builder
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors">
                  Build & Save Your Safari Itinerary
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              to="/guides"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  03 · UWA Licensed Specialists
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors">
                  Choose Your Named Ugandan Guide
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/portals"
              className="group bg-[#144225]/85 hover:bg-[#1A1612]/85 border border-white/15 hover:border-[#D99B26]/60 rounded-lg p-4 flex items-center justify-between gap-3 transition-all"
            >
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26]">
                  04 · Client & Operations Hub
                </div>
                <div className="font-serif text-lg font-bold text-white group-hover:text-[#D99B26] transition-colors">
                  Permits, Escrow Wallet & Portals
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D99B26] shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 3-Step "How It Works" Strip (Aligned to max-w-[1600px]) */}
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

      {/* 3. Featured Guides Showcase FIRST (Aligned to max-w-[1600px]) */}
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

      {/* 4. Featured Uganda Experiences (Aligned to max-w-[1600px]) */}
      <section className="py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 border-t border-[#E4DCCF]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              {t.home.experiencesSectionTag}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612] mt-1">
              {t.home.experiencesSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] mt-2 max-w-2xl">
              {t.home.experiencesSectionDesc}
            </p>
          </div>
          <Link
            to="/experiences"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            <span>{t.home.filterAllExperiences}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
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

      {/* 7. Bottom Conversion / Entebbe Office Dual CTA (Aligned to max-w-[1600px]) */}
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
