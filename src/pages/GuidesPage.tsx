import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  RotateCcw,
  Users,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Wallet,
  Sparkles,
  Tent,
  BedDouble,
  Home,
  Compass,
  X,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import {
  GUIDES,
  SPECIALTY_LABELS,
  PARTNER_ACCOMMODATIONS,
  DESTINATIONS,
} from '../data/seedData';
import {
  Specialty,
  PartnerCategory,
  AccommodationPartner,
  UgandaRegion,
} from '../types';
import { GuideCard } from '../components/GuideCard';
import { SmartImage } from '../components/SmartImage';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../lib/currency';
import { SEO } from '../components/SEO';

const ALL_SPECIALTIES: Specialty[] = [
  'gorillas',
  'chimps',
  'birding',
  'big-game',
  'culture',
  'hiking',
  'photography',
];

const ALL_LANGUAGES = Array.from(
  new Set(GUIDES.flatMap((g) => g.languages))
).sort();

const PARTNER_CATEGORIES: {
  id: 'all' | PartnerCategory;
  label: string;
  count: number;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'all',
    label: 'All Partners',
    count: PARTNER_ACCOMMODATIONS.length,
    icon: Building2,
  },
  {
    id: 'lodge',
    label: 'Safari Lodges',
    count: PARTNER_ACCOMMODATIONS.filter((p) => p.category === 'lodge').length,
    icon: Compass,
  },
  {
    id: 'hotel',
    label: 'Hotels',
    count: PARTNER_ACCOMMODATIONS.filter((p) => p.category === 'hotel').length,
    icon: Building2,
  },
  {
    id: 'motel',
    label: 'Motels',
    count: PARTNER_ACCOMMODATIONS.filter((p) => p.category === 'motel').length,
    icon: BedDouble,
  },
  {
    id: 'campsite',
    label: 'Camp Sites',
    count: PARTNER_ACCOMMODATIONS.filter((p) => p.category === 'campsite').length,
    icon: Tent,
  },
];

export const GuidesPage: React.FC = () => {
  const { openInquiryModal, currency } = useInquiry();
  const { availableBalanceUSD, bookPartnerStay } = useWallet();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top-level directory view: 'all' | 'guides' | 'partners'
  const initialView = searchParams.get('view');
  const [directoryView, setDirectoryView] = useState<'all' | 'guides' | 'partners'>(
    initialView === 'partners' || initialView === 'guides' ? initialView : 'all'
  );

  // Guide filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Partner filters
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<
    'all' | PartnerCategory
  >('all');
  const [selectedPartnerRegion, setSelectedPartnerRegion] = useState<
    'all' | UgandaRegion
  >('all');

  // Direct Wallet Booking Modal State for a Partner Accommodation
  const [bookingPartner, setBookingPartner] =
    useState<AccommodationPartner | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>('2026-12-16');
  const [nights, setNights] = useState<number>(2);
  const [guests, setGuests] = useState<number>(2);
  const [bookingFeedback, setBookingFeedback] = useState<{
    ok: boolean;
    message: string;
    voucherCode?: string;
  } | null>(null);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'partners' || viewParam === 'guides' || viewParam === 'all') {
      setDirectoryView(viewParam);
    }
    const catParam = searchParams.get('category') as PartnerCategory | null;
    if (
      catParam &&
      ['hotel', 'motel', 'campsite', 'lodge'].includes(catParam)
    ) {
      setSelectedPartnerCategory(catParam);
    }
  }, [searchParams]);

  const handleViewChange = (nextView: 'all' | 'guides' | 'partners') => {
    setDirectoryView(nextView);
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === 'all') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', nextView);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const filteredGuides = useMemo(() => {
    return GUIDES.filter((guide) => {
      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        guide.specialties.includes(selectedSpecialty);
      const matchesLanguage =
        selectedLanguage === 'all' ||
        guide.languages.some(
          (l) => l.toLowerCase() === selectedLanguage.toLowerCase()
        );
      return matchesSpecialty && matchesLanguage;
    });
  }, [selectedSpecialty, selectedLanguage]);

  const filteredPartners = useMemo(() => {
    return PARTNER_ACCOMMODATIONS.filter((partner) => {
      const matchesCategory =
        selectedPartnerCategory === 'all' ||
        partner.category === selectedPartnerCategory;
      const matchesRegion =
        selectedPartnerRegion === 'all' ||
        partner.region === selectedPartnerRegion;
      return matchesCategory && matchesRegion;
    });
  }, [selectedPartnerCategory, selectedPartnerRegion]);

  const resetGuideFilters = () => {
    setSelectedSpecialty('all');
    setSelectedLanguage('all');
  };

  const resetPartnerFilters = () => {
    setSelectedPartnerCategory('all');
    setSelectedPartnerRegion('all');
  };

  const openWalletBookingModal = (partner: AccommodationPartner) => {
    setBookingPartner(partner);
    setBookingFeedback(null);
  };

  const handleConfirmWalletBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPartner) return;
    const res = bookPartnerStay(
      bookingPartner.slug,
      checkInDate,
      nights,
      guests
    );
    setBookingFeedback({
      ok: res.ok,
      message: res.message,
      voucherCode: res.booking?.voucherCode,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1612] pb-20">
      <SEO
        title="Meet Our Guides and Partners — Ugandan Specialists, Hotels, Motels, Camp Sites & Lodges"
        description="Meet our licensed local Ugandan safari guides and explore our verified accommodation partners across Uganda — including safari lodges, boutique hotels, transit motels, and wilderness camp sites."
        canonicalPath="/guides"
      />

      {/* Page Header */}
      <section className="bg-[#144225] text-[#FAF7F2] py-16 border-b border-[#2E8550]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D99B26] font-semibold">
                The Guide Is The Product • Verified Uganda Partner Network
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                Meet Our Guides and Partners
              </h1>
              <p className="text-base text-[#E4DCCF] leading-relaxed">
                Every Enganda safari pairs you with a named, licensed Ugandan specialist and our hand-vetted network of partner <strong className="text-white">Hotels</strong>, <strong className="text-white">Motels</strong>, <strong className="text-white">Camp Sites</strong>, and <strong className="text-white">Safari Lodges</strong> across all nine regions of Uganda.
              </p>
            </div>

            {/* Wallet Balance Quick Pill */}
            <div className="bg-[#1B5632] border border-white/15 rounded-xl p-4 flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#D99B26]">
                  Your Safari Wallet Balance
                </div>
                <div className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
                  {formatPrice(availableBalanceUSD, currency)}
                </div>
              </div>
              <Link
                to="/wallet"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Manage Wallet</span>
              </Link>
            </div>
          </div>

          {/* Top-Level Section Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 mt-10 pt-6 border-t border-white/15">
            <button
              type="button"
              onClick={() => handleViewChange('all')}
              className={`px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                directoryView === 'all'
                  ? 'bg-[#D99B26] text-[#1A1612]'
                  : 'bg-[#1B5632] text-[#E4DCCF] hover:bg-[#226B3E]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>All: Guides & Partners</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewChange('guides')}
              className={`px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                directoryView === 'guides'
                  ? 'bg-[#D99B26] text-[#1A1612]'
                  : 'bg-[#1B5632] text-[#E4DCCF] hover:bg-[#226B3E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Ugandan Safari Guides ({GUIDES.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewChange('partners')}
              className={`px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                directoryView === 'partners'
                  ? 'bg-[#D99B26] text-[#1A1612]'
                  : 'bg-[#1B5632] text-[#E4DCCF] hover:bg-[#226B3E]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>
                Partners: Hotels, Motels, Camp Sites & Lodges ({PARTNER_ACCOMMODATIONS.length})
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: UGANDAN SAFARI GUIDES */}
      {(directoryView === 'all' || directoryView === 'guides') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                USAGA & UWA Certified Naturalists
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] mt-1">
                Our Licensed Ugandan Safari Guides
              </h2>
              <p className="text-sm text-[#5A5248] mt-1 max-w-2xl">
                Filter our guides by wildlife specialty or spoken language and request your preferred host directly.
              </p>
            </div>
          </div>

          {/* Guide Filter Controls */}
          <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-5 mb-8 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5A5248]">
                  <Filter className="w-3.5 h-3.5 text-[#C85A28]" />
                  <span>Filter Guides by Specialty</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedSpecialty === 'all'
                        ? 'bg-[#226B3E] text-[#FAF7F2]'
                        : 'bg-[#FAF7F2] text-[#5A5248] border border-[#E4DCCF] hover:border-[#226B3E]'
                    }`}
                  >
                    All Specialties ({GUIDES.length})
                  </button>
                  {ALL_SPECIALTIES.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        selectedSpecialty === spec
                          ? 'bg-[#226B3E] text-[#FAF7F2]'
                          : 'bg-[#FAF7F2] text-[#5A5248] border border-[#E4DCCF] hover:border-[#226B3E]'
                      }`}
                    >
                      {SPECIALTY_LABELS[spec]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Dropdown */}
              <div className="w-full lg:w-64 space-y-2">
                <label
                  htmlFor="guide-language-filter"
                  className="block text-xs font-mono uppercase tracking-wider text-[#5A5248]"
                >
                  Spoken Language
                </label>
                <select
                  id="guide-language-filter"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="all">All Languages (English + Local/EU)</option>
                  {ALL_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DCCF] flex items-center justify-between text-xs text-[#5A5248]">
              <span>
                Showing{' '}
                <strong className="font-mono text-[#1A1612]">
                  {filteredGuides.length}
                </strong>{' '}
                of {GUIDES.length} Ugandan guides
              </span>
              {(selectedSpecialty !== 'all' || selectedLanguage !== 'all') && (
                <button
                  type="button"
                  onClick={resetGuideFilters}
                  className="inline-flex items-center gap-1.5 text-[#C85A28] font-medium hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset guide filters</span>
                </button>
              )}
            </div>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-12 text-center space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                No guides match that exact filter combination
              </h3>
              <p className="text-sm text-[#5A5248] max-w-md mx-auto">
                Try clearing one of the filters or tell our Entebbe team what language and specialty you need.
              </p>
              <button
                type="button"
                onClick={resetGuideFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Guides</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onRequestGuide={(g) => openInquiryModal({ guideSlug: g.slug })}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: ACCOMMODATION PARTNERS (HOTELS, MOTELS, CAMP SITES & LODGES) */}
      {(directoryView === 'all' || directoryView === 'partners') && (
        <section
          id="partners-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 border-t border-[#E4DCCF]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Verified Ugandan Hospitality Network
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] mt-1">
                Our Partners: Hotels, Motels, Camp Sites & Safari Lodges
              </h2>
              <p className="text-sm text-[#5A5248] mt-1 max-w-3xl">
                We inspect every partner property personally from our Entebbe office — from forest-edge <strong className="text-[#1A1612]">Safari Lodges</strong> in Bwindi and Kidepo to lakeside <strong className="text-[#1A1612]">Hotels</strong>, highway transit <strong className="text-[#1A1612]">Motels</strong> with shaded 4x4 bays, and ranger-guarded wilderness <strong className="text-[#1A1612]">Camp Sites</strong>.
              </p>
            </div>
          </div>

          {/* Partner Filter Bar */}
          <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-5 mb-8 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Category Tabs: All, Lodges, Hotels, Motels, Camp Sites */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5A5248]">
                  <Home className="w-3.5 h-3.5 text-[#C85A28]" />
                  <span>Filter Partners by Accommodation Type</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PARTNER_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = selectedPartnerCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedPartnerCategory(cat.id)}
                        className={`px-3.5 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#226B3E] text-[#FAF7F2]'
                            : 'bg-[#FAF7F2] text-[#1A1612] border border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>
                          {cat.label} ({cat.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region Filter */}
              <div className="w-full lg:w-72 space-y-2">
                <label
                  htmlFor="partner-region-filter"
                  className="block text-xs font-mono uppercase tracking-wider text-[#5A5248]"
                >
                  Uganda Safari Region
                </label>
                <select
                  id="partner-region-filter"
                  value={selectedPartnerRegion}
                  onChange={(e) =>
                    setSelectedPartnerRegion(
                      e.target.value as 'all' | UgandaRegion
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="all">All 9 Uganda Regions</option>
                  {DESTINATIONS.map((dest) => (
                    <option key={dest.slug} value={dest.name}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DCCF] flex items-center justify-between text-xs text-[#5A5248]">
              <span>
                Showing{' '}
                <strong className="font-mono text-[#1A1612]">
                  {filteredPartners.length}
                </strong>{' '}
                of {PARTNER_ACCOMMODATIONS.length} verified Uganda accommodation partners
              </span>
              {(selectedPartnerCategory !== 'all' ||
                selectedPartnerRegion !== 'all') && (
                <button
                  type="button"
                  onClick={resetPartnerFilters}
                  className="inline-flex items-center gap-1.5 text-[#C85A28] font-medium hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset partner filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Partner Cards Grid */}
          {filteredPartners.length === 0 ? (
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-12 text-center space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                No partner properties match that region and category filter
              </h3>
              <button
                type="button"
                onClick={resetPartnerFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Partners</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => {
                const recommendedGuides = GUIDES.filter((g) =>
                  partner.recommendedGuideSlugs.includes(g.slug)
                );

                return (
                  <article
                    key={partner.id}
                    className="bg-white border border-[#E4DCCF] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#226B3E] transition-colors"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-52 overflow-hidden">
                        <SmartImage
                          src={partner.heroImage}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 via-transparent to-black/30" />

                        {/* Category & Verification Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-[11px] uppercase tracking-wider font-semibold">
                            {partner.categoryLabel}
                          </span>
                          <span className="px-2.5 py-1 rounded bg-[#1A1612]/80 text-[#D99B26] font-mono text-[10px] uppercase tracking-wider">
                            {partner.verifiedPartnerBadge}
                          </span>
                        </div>

                        {/* Bottom Image Overlay: Region & Rating */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                            <span>{partner.region}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-mono bg-black/55 px-2 py-0.5 rounded">
                            <Star className="w-3.5 h-3.5 text-[#D99B26] fill-[#D99B26]" />
                            <span>{partner.rating.toFixed(1)}</span>
                            <span className="text-[#D6CEC2]">
                              ({partner.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        <div>
                          <div className="text-[11px] font-mono text-[#5A5248]">
                            {partner.locationDetails}
                          </div>
                          <h3 className="font-serif text-2xl font-bold text-[#1A1612] mt-0.5">
                            {partner.name}
                          </h3>
                        </div>

                        <p className="text-xs text-[#5A5248] leading-relaxed">
                          {partner.summary}
                        </p>

                        {/* Amenities List */}
                        <ul className="grid grid-cols-1 gap-1.5 pt-1">
                          {partner.amenities.map((amenity) => (
                            <li
                              key={amenity}
                              className="flex items-center gap-2 text-xs text-[#1A1612]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
                              <span>{amenity}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Community & Sustainability Note */}
                        <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] text-[11px] text-[#5A5248] leading-relaxed">
                          <strong className="text-[#226B3E] font-semibold">
                            Community Impact:{' '}
                          </strong>
                          {partner.sustainabilityNote}
                        </div>

                        {/* Recommended Guides for this Partner */}
                        {recommendedGuides.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#5A5248]">
                              Paired Enganda Regional Guides
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recommendedGuides.map((g) => (
                                <Link
                                  key={g.id}
                                  to={`/guides/${g.slug}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3ECE1] hover:bg-[#E4DCCF] text-xs font-medium text-[#1A1612] transition-colors"
                                >
                                  <SmartImage
                                    src={g.photo}
                                    alt={g.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                  <span>{g.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Rate + Wallet Booking & Inquiry CTAs */}
                    <div className="p-5 pt-4 border-t border-[#E4DCCF] bg-[#FAF7F2] space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-mono uppercase text-[#5A5248]">
                          Partner Rate / Night
                        </span>
                        <div className="font-mono text-xl font-bold text-[#226B3E] tabular-nums">
                          {formatPrice(partner.pricePerNightUSD, currency)}
                          <span className="text-xs font-normal text-[#5A5248]">
                            {' '}
                            / night
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openWalletBookingModal(partner)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5 text-[#D99B26]" />
                          <span>Book with Wallet</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openInquiryModal({
                              guideSlug: partner.recommendedGuideSlugs[0],
                              defaultTier: partner.comfortTier,
                              defaultNotes: `Requesting custom safari itinerary including a stay at partner ${partner.categoryLabel}: ${partner.name} (${partner.region}).`,
                            })
                          }
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span>Add to Safari</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* DIRECT WALLET PARTNER BOOKING MODAL */}
      {bookingPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#226B3E] font-semibold">
                  Instant Safari Wallet Settlement • {bookingPartner.categoryLabel}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1612] mt-0.5">
                  Book {bookingPartner.name}
                </h3>
                <p className="text-xs text-[#5A5248] mt-0.5">
                  {bookingPartner.region} — {bookingPartner.locationDetails}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingPartner(null)}
                className="p-1.5 rounded-md text-[#5A5248] hover:text-[#1A1612] hover:bg-[#E4DCCF]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingFeedback ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    bookingFeedback.ok
                      ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#144225]'
                      : 'bg-[#C85A28]/10 border-[#C85A28] text-[#9E3F16]'
                  }`}
                >
                  {bookingFeedback.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-[#226B3E] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#C85A28] shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-sm">
                      {bookingFeedback.ok
                        ? 'Partner Accommodation Confirmed!'
                        : 'Unable to Complete Wallet Booking'}
                    </div>
                    <p>{bookingFeedback.message}</p>
                    {bookingFeedback.voucherCode && (
                      <div className="pt-1 font-mono font-bold text-[#226B3E]">
                        Official Voucher Code: {bookingFeedback.voucherCode}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Link
                    to="/wallet"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#226B3E] text-white text-xs font-semibold"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>View Voucher in Safari Wallet</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingPartner(null)}
                    className="px-4 py-2.5 rounded-md border border-[#D6CEC2] text-xs font-semibold text-[#1A1612] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmWalletBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-white border border-[#D6CEC2] font-mono text-xs text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      Nights
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-md bg-white border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-md bg-white border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#F3ECE1] border border-[#E4DCCF] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5A5248]">
                    <span>
                      {nights} {nights === 1 ? 'night' : 'nights'} ×{' '}
                      {Math.ceil(guests / 2)}{' '}
                      {Math.ceil(guests / 2) === 1 ? 'room/pitch' : 'rooms/pitches'}
                    </span>
                    <span className="font-mono font-bold text-base text-[#1A1612] tabular-nums">
                      Total:{' '}
                      {formatPrice(
                        bookingPartner.pricePerNightUSD *
                          nights *
                          Math.ceil(guests / 2),
                        currency
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E4DCCF]">
                    <span className="text-[#5A5248]">
                      Your Available Safari Wallet Balance:
                    </span>
                    <span className="font-mono font-bold text-[#226B3E] tabular-nums">
                      {formatPrice(availableBalanceUSD, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingPartner(null)}
                    className="px-4 py-2.5 rounded-md border border-[#D6CEC2] text-xs font-semibold text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>Confirm & Pay from Safari Wallet</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
