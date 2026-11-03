import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  FileCheck,
  MessageCircle,
  Star,
  MapPin,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  BRAND_TAGLINE,
  GUIDES,
  EXPERIENCES,
  SAMPLE_REVIEWS,
  HQ_ADDRESS,
  HQ_AIRPORT_NOTE,
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
import { formatPrice } from '../lib/currency';

export const HomePage: React.FC = () => {
  const { currency, openInquiryModal } = useInquiry();
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

      {/* 1. Full-Viewport Wildlife Hero + Confirmed Packages & Events Carousel */}
      <section className="relative min-h-[86vh] flex items-center bg-[#226B3E] text-[#FAF7F2] overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=85"
            alt="Mountain Gorilla in Bwindi Impenetrable Forest, Uganda"
            className="w-full h-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#144225]/95 via-[#226B3E]/85 to-[#144225]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left 7 Columns: Editorial Headline, Manifesto, CTAs & Social Connections */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1A1612]/70 border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
                <Compass className="w-3.5 h-3.5" />
                <span>Curated Ugandan Guide Collective • Coordinated from Entebbe</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl xl:text-[60px] font-bold leading-[1.08] tracking-tight text-white">
                {BRAND_TAGLINE}
              </h1>

              <p className="text-base sm:text-lg text-[#E4DCCF] leading-relaxed max-w-2xl">
                At Enganda Safaris, <strong className="text-white">the guide is the product</strong>. Instead of being assigned an anonymous driver on arrival, you choose and travel with a named, licensed Ugandan specialist — from Bwindi’s gorilla ridges and Kibale’s chimpanzee canopy to the Shoebill channels of Mabamba and the plains of Kidepo Valley.
              </p>

              {/* Primary Dual CTAs */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  to="/guides"
                  className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-md transition-colors shadow-lg whitespace-nowrap shrink-0"
                >
                  <span>Meet Our Guides and Partners</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/trip-planner"
                  className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#226B3E] font-semibold text-sm sm:text-base px-6 py-3.5 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Plan My Safari</span>
                </Link>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1A1612]/80 hover:bg-[#1A1612] text-[#FAF7F2] border border-white/25 font-medium text-sm px-5 py-3.5 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#D99B26]" />
                  <span>WhatsApp Entebbe Desk</span>
                </a>
              </div>

              {/* Trust Footnote */}
              <div className="pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-[#D6CEC2]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                  <span>UTB Licensed & AUTO Member</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                  <span>Official UWA Permit Receipts Provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                  <span>Entebbe HQ — {HQ_AIRPORT_NOTE}</span>
                </div>
              </div>

              {/* Direct Social Media Connections (X, Instagram, LinkedIn) */}
              <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-semibold shrink-0">
                  Follow Field Dispatches:
                </span>
                <SocialStrip variant="hero-dark" showLabels={true} />
              </div>
            </div>

            {/* Right 5 Columns: Confirmed Packages & Events Carousel (Nyege Nyege & Guaranteed Departures) */}
            <div
              className="lg:col-span-5"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <div className="bg-[#144225]/95 backdrop-blur-md border border-[#D99B26]/40 rounded-lg overflow-hidden shadow-2xl">
                {/* Carousel Top Header Bar */}
                <div className="px-4 sm:px-5 py-3.5 bg-[#1A1612]/70 border-b border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-wider text-[#FAF7F2] font-semibold">
                      Confirmed Packages & Events
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D99B26] tabular-nums">
                      0{activeSlide + 1} / 0{CONFIRMED_PACKAGES_AND_EVENTS.length}
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

                {/* Quick Event Selector Tabs */}
                <div className="px-4 sm:px-5 py-2.5 bg-[#1B5632] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#C85A28] text-white font-semibold'
                            : 'bg-[#226B3E]/80 text-[#D6CEC2] hover:text-white hover:bg-[#287A47]'
                        }`}
                      >
                        {shortLabels[idx] || pkg.category}
                      </button>
                    );
                  })}
                </div>

                {/* Active Slide Media Banner */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <SmartImage
                    src={currentPackage.heroImage}
                    alt={currentPackage.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#144225] via-[#144225]/35 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#C85A28] text-white font-mono text-[10px] uppercase tracking-wider font-semibold shadow">
                      {currentPackage.eventTag}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#1A1612]/85 border border-[#D99B26]/50 text-[#D99B26] font-mono text-[11px] font-medium tabular-nums">
                      {currentPackage.statusLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#E4DCCF] mb-1">
                      <span className="inline-flex items-center gap-1 text-[#D99B26] font-semibold tabular-nums">
                        <Calendar className="w-3.5 h-3.5" />
                        {currentPackage.dateWindow}
                      </span>
                      <span>•</span>
                      <span>{currentPackage.durationLabel}</span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                      {currentPackage.title}
                    </h2>
                  </div>
                </div>

                {/* Active Slide Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  <p className="text-xs sm:text-sm text-[#D6CEC2] leading-relaxed">
                    {currentPackage.subtitle}
                  </p>

                  {/* Highlights List */}
                  <ul className="space-y-1.5">
                    {currentPackage.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-[#E4DCCF]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D99B26] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Lead Guide + Price Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    {currentPackageGuide ? (
                      <Link
                        to={`/guides/${currentPackageGuide.slug}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <SmartImage
                          src={currentPackageGuide.photo}
                          alt={currentPackageGuide.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#D99B26]"
                        />
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#D99B26]">
                            Led by Ugandan Specialist
                          </div>
                          <div className="text-xs font-semibold text-white group-hover:text-[#D99B26] transition-colors">
                            {currentPackageGuide.name}
                          </div>
                        </div>
                      </Link>
                    ) : null}

                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-[#D6CEC2]">
                        Confirmed Package From
                      </div>
                      <div className="font-mono text-lg font-bold text-[#D99B26] tabular-nums">
                        {formatPrice(currentPackage.pricePerPersonUSD, currency)}
                        <span className="text-[11px] font-normal text-[#D6CEC2]">
                          {' '}
                          / person
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        openInquiryModal({
                          experienceSlug: currentPackage.experienceSlug,
                          guideSlug: currentPackage.leadGuideSlug,
                          defaultNotes: `Requesting confirmed package/event: ${currentPackage.title} (${currentPackage.dateWindow}) led by ${currentPackageGuide?.name || 'Enganda Specialist'}.`,
                        })
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Reserve Spot ({currentPackage.spotsRemaining} Left)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {currentPackage.experienceSlug && (
                      <Link
                        to={`/experiences/${currentPackage.experienceSlug}`}
                        className="inline-flex items-center justify-center px-3.5 py-3 rounded-md bg-[#226B3E] hover:bg-[#287A47] text-[#FAF7F2] border border-white/15 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                      >
                        Itinerary
                      </Link>
                    )}
                  </div>

                  {/* Slide Progress Indicators */}
                  <div className="pt-1 flex items-center justify-center gap-1.5">
                    {CONFIRMED_PACKAGES_AND_EVENTS.map((pkg, idx) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}: ${pkg.title}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === activeSlide
                            ? 'w-6 bg-[#D99B26]'
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
      </section>

      {/* 2. 3-Step "How It Works" Strip */}
      <section className="bg-[#F3ECE1] border-b border-[#E4DCCF] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                How Enganda Works
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] mt-1">
                From Your First Message to the Forest Trailhead
              </h2>
            </div>
            <Link
              to="/how-we-work"
              className="text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] inline-flex items-center gap-1"
            >
              <span>Read our full guide-network model & deposit protection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  01. Tell Us Your Interests
                </span>
                <Calendar className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                Share What You Want to Experience in Uganda
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                Tell us your travel dates, comfort tier, and wildlife priorities — whether it is Bwindi mountain gorillas, Kibale chimpanzees, Shoebill storks at Mabamba, or remote Kidepo lions.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  02. We Match Your Guide
                </span>
                <Users className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                Meet Your Named Ugandan Specialist Before You Book
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                Within 12 hours, our Entebbe coordination desk confirms UWA permit and lodge availability and pairs you with the specific Enganda guide whose home region, languages, and specialty fit your trip.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#C85A28] uppercase tracking-wider">
                  03. Your Guide Leads Your Safari
                </span>
                <Compass className="w-5 h-5 text-[#226B3E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                One Accountable Host from Entebbe to Every Park
              </h3>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide from airport welcome in Entebbe to your final farewell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Guides Showcase FIRST (Above Experiences per Spec) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              The Guide Is The Product
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612] mt-1">
              Meet Our Guides and Partners
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] mt-2 max-w-2xl">
              Every Enganda safari is designed and led by a licensed Ugandan naturalist and paired with our verified partner lodges, hotels, motels, and camp sites across Uganda.
            </p>
          </div>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            <span>Meet Our Guides and Partners</span>
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

      {/* 4. Featured Uganda Experiences */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              100% Uganda • Private Departures
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612] mt-1">
              Signature Uganda Safari Experiences
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] mt-2 max-w-2xl">
              Every route stays strictly within Uganda and can be customized around your pace, comfort tier, and preferred Enganda guide.
            </p>
          </div>
          <Link
            to="/experiences"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors flex-shrink-0"
          >
            <span>Filter All 6 Experiences</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </section>

      {/* 4B. AI-Powered Safari Itinerary Generator (Gemini + Save to User Wallet) */}
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
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border-2 border-[#226B3E] rounded-lg p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              5 Minutes from Entebbe International Airport
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
              Ready to Match With Your Ugandan Guide?
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed">
              Our coordination team at <strong className="text-[#1A1612]">{HQ_ADDRESS}</strong> works directly with our 8 guides and the Uganda Wildlife Authority. {AVAILABILITY_PROMISE}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <Link
              to="/trip-planner"
              className="inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors"
            >
              <span>Plan My Safari</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] font-semibold text-sm px-6 py-3.5 rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#D99B26]" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
