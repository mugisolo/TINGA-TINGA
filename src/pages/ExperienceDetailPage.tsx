import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Utensils,
  BedDouble,
  Plane,
  FileText,
  Users,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  EXPERIENCES,
  GUIDES,
  SAMPLE_REVIEWS,
  SPECIALTY_LABELS,
  AVAILABILITY_PROMISE,
  HQ_ADDRESS,
} from '../data/seedData';
import { ComfortTier } from '../types';
import { formatPrice } from '../lib/currency';
import { useInquiry } from '../context/InquiryContext';
import { StickyBookBar } from '../components/StickyBookBar';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';

export const ExperienceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currency, openInquiryModal } = useInquiry();

  const experience = EXPERIENCES.find((e) => e.slug === slug);
  const [selectedTier, setSelectedTier] = useState<ComfortTier>(
    experience?.shumaGroupOffer ||
      (experience?.twoPaxSharingPriceUSD && experience?.packageCode !== 'VERGOUW-SOLO' && experience?.packageCode !== 'T5')
      ? 'mid-range'
      : 'luxury'
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!experience) {
    return <Navigate to="/experiences" replace />;
  }

  const activeBand =
    experience.priceBands.find((b) => b.tier === selectedTier) ||
    experience.priceBands[0];

  const recommendedGuides = GUIDES.filter((g) =>
    experience.recommendedGuides.includes(g.slug)
  );

  const experienceReviews = SAMPLE_REVIEWS.filter(
    (r) => r.experienceSlug === experience.slug
  );

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://wildlifesafaris.com';
  const canonicalUrl = `${origin}/experiences/${experience.slug}`;

  const lowestPriceUSD = Math.min(
    ...experience.priceBands.map((b) => b.perPersonUSD)
  );
  const highestPriceUSD = Math.max(
    ...experience.priceBands.map((b) => b.perPersonUSD)
  );

  const guideNames = recommendedGuides.map((g) => g.name).join(', ');
  const durationLabel = `${experience.durationDays}-${experience.durationDays === 1 ? 'Day' : 'Day'}`;

  const seoTitle = `${experience.title} (${durationLabel} Uganda Safari) | WildLife Safaris`;
  const ogSocialTitle = `${experience.title} — ${experience.durationDays} ${
    experience.durationDays === 1 ? 'Day' : 'Days'
  } in ${experience.region} | WildLife Safaris`;
  const seoDescription = `${experience.durationDays}-day private Uganda safari in ${experience.regions.join(
    ', '
  )} led by named WildLife guides (${guideNames}). Starting from $${lowestPriceUSD.toLocaleString()} per person. ${
    experience.subtitle
  }`;
  const ogSocialDescription = `${experience.subtitle} Travel in a private 4x4 Land Cruiser with ${guideNames} across ${experience.regions.join(
    ' & '
  )}. Best months: ${experience.bestMonths}. View full day-by-day itinerary & tier pricing from $${lowestPriceUSD.toLocaleString()} USD.`;

  const seoKeywords = [
    experience.title,
    ...experience.regions,
    ...experience.interests.map((interest) => SPECIALTY_LABELS[interest]),
    ...recommendedGuides.map((g) => `${g.name} Uganda Safari Guide`),
    'Uganda Safari',
    'WildLife Safaris',
  ];

  const structuredDataGraph: Record<string, any>[] = [
    {
      '@type': ['TouristTrip', 'Product'],
      '@id': `${canonicalUrl}#safari`,
      name: experience.title,
      alternateName: `${experience.title} (${experience.durationDays} Days)`,
      description: experience.summary,
      url: canonicalUrl,
      image: [experience.heroImage, ...experience.galleryImages],
      sku: `WILDLIFE-${experience.id.toUpperCase()}`,
      brand: {
        '@type': 'Brand',
        name: 'WildLife Safaris',
      },
      provider: {
        '@type': 'TravelAgency',
        '@id': `${origin}/#organization`,
        name: 'WildLife Safaris',
        url: origin,
        address: {
          '@type': 'PostalAddress',
          streetAddress: HQ_ADDRESS,
          addressLocality: 'Entebbe',
          addressCountry: 'UG',
        },
      },
      touristType: experience.interests.map(
        (interest) => SPECIALTY_LABELS[interest]
      ),
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: experience.dayByDay.length,
        itemListElement: experience.dayByDay.map((day) => ({
          '@type': 'ListItem',
          position: day.day,
          item: {
            '@type': 'TouristAttraction',
            name: `Day ${day.day}: ${day.title} (${day.location})`,
            description: `${day.summary} Key activities: ${day.activities.join(
              '; '
            )}. Meals: ${day.meals}.`,
            address: {
              '@type': 'PostalAddress',
              addressRegion: day.location,
              addressCountry: 'UG',
            },
          },
        })),
      },
      offers: {
        '@type': 'AggregateOffer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        lowPrice: lowestPriceUSD,
        highPrice: highestPriceUSD,
        offerCount: experience.priceBands.length,
        availability: 'https://schema.org/InStock',
        offers: experience.priceBands.map((band) => ({
          '@type': 'Offer',
          name: `${experience.title} — ${band.label}`,
          priceCurrency: 'USD',
          price: band.perPersonUSD,
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
          priceValidUntil: '2027-12-31',
          url: canonicalUrl,
          description: `${band.description} Representative lodges: ${band.lodgeExamples.join(
            ', '
          )}.`,
        })),
      },
      ...(recommendedGuides.length > 0
        ? {
            subjectOf: recommendedGuides.map((g) => ({
              '@type': 'Person',
              name: g.name,
              jobTitle: `Licensed Ugandan Safari Guide — ${g.homeRegion}`,
              description: g.tagline,
              url: `${origin}/guides/${g.slug}`,
              knowsLanguage: g.languages,
            })),
          }
        : {}),
      ...(experienceReviews.length > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: (
                experienceReviews.reduce((acc, r) => acc + r.rating, 0) /
                experienceReviews.length
              ).toFixed(1),
              reviewCount: experienceReviews.length,
              bestRating: '5',
              worstRating: '1',
            },
            review: experienceReviews.map((r) => ({
              '@type': 'Review',
              name: r.title,
              reviewBody: r.text,
              datePublished: r.date,
              author: {
                '@type': 'Person',
                name: r.guestName,
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: r.rating,
                bestRating: 5,
              },
            })),
          }
        : {}),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Uganda Safari Experiences',
          item: `${origin}/experiences`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: experience.title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  if (experience.faqs.length > 0) {
    structuredDataGraph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: experience.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const experienceJsonLd = {
    '@context': 'https://schema.org',
    '@graph': structuredDataGraph,
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-28">
      <SEO
        title={seoTitle}
        description={seoDescription}
        ogTitle={ogSocialTitle}
        ogDescription={ogSocialDescription}
        ogType="product"
        ogImage={experience.heroImage}
        ogImageAlt={`${experience.title} in ${experience.region}, Uganda — Led by ${guideNames}`}
        canonicalPath={`/experiences/${experience.slug}`}
        keywords={seoKeywords}
        priceAmount={lowestPriceUSD}
        priceCurrency="USD"
        jsonLd={experienceJsonLd}
      />

      {/* Hero Banner */}
      <section className="relative min-h-[55vh] flex items-end bg-[#226B3E] text-[#FAF7F2]">
        <div className="absolute inset-0">
          <SmartImage
            src={experience.heroImage}
            alt={experience.title}
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] via-[#1A1612]/55 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-4">
          <Link
            to="/experiences"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D99B26] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All East African Safari Packages</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {experience.adminRecommended && (
              <span className="bg-[#D99B26] text-[#1A1612] font-mono text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                <span>RECOMMENDED BY ADMINISTRATOR • ENGANDA {experience.packageCode}</span>
              </span>
            )}
            {experience.packageCode && !experience.adminRecommended && (
              <span className="bg-[#C85A28] text-white font-mono text-xs font-bold px-3 py-1 rounded-md">
                {experience.operatorName ? `${experience.operatorName} • ` : ''}Code {experience.packageCode}
              </span>
            )}
            <span className="bg-[#226B3E] text-[#FAF7F2] font-mono text-xs px-3 py-1 rounded-md border border-white/20 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{experience.durationDays} {experience.durationDays === 1 ? 'Day' : 'Days'}</span>
            </span>
            {experience.regions.map((reg) => (
              <span
                key={reg}
                className="bg-[#1A1612]/80 text-[#E4DCCF] text-xs px-3 py-1 rounded-md border border-white/15 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-[#C85A28]" />
                <span>{reg}</span>
              </span>
            ))}
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white max-w-4xl">
            {experience.title}
          </h1>
          <p className="text-base sm:text-lg text-[#E4DCCF] max-w-3xl">
            {experience.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-12">
          {/* Administrator Recommendation & Official 2026 PDF Dossier Card */}
          {(experience.adminRecommended || experience.pdfBrochureUrl || experience.twoPaxSharingPriceUSD) && (
            <section
              className={`rounded-xl overflow-hidden shadow-sm border-2 ${
                experience.adminRecommended
                  ? 'bg-[#144225] text-[#FAF7F2] border-[#D99B26]'
                  : 'bg-[#1A1612] text-[#FAF7F2] border-[#226B3E]'
              }`}
            >
              <div className="px-6 py-4 bg-[#1A1612]/90 border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-bold flex items-center gap-1.5">
                    {experience.adminRecommended ? (
                      <>
                        <Award className="w-4 h-4 text-[#D99B26]" />
                        <span>Enganda Verified • Enganda Safaris 2026 Specialist Expedition</span>
                      </>
                    ) : (
                      <span>
                        Official 2026 Verified Safari Dossier • {experience.operatorName || 'Enganda Member Collective'}
                      </span>
                    )}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {experience.packageCode ? `Package ${experience.packageCode}: ` : ''}
                    Official 2-Pax Sharing &amp; 1-Pax Solo Traveler Tariffs
                  </h2>
                </div>
                {experience.pdfBrochureUrl && (
                  <a
                    href={experience.pdfBrochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#D99B26] hover:bg-[#c5891d] text-[#1A1612] font-mono text-xs font-bold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Official PDF Portfolio</span>
                  </a>
                )}
              </div>

              <div className="p-6 space-y-4">
                {experience.adminRecommendationNote && (
                  <p className="text-xs sm:text-sm text-[#E4DCCF] leading-relaxed bg-[#1A1612]/60 border border-[#D99B26]/30 rounded-lg p-3.5">
                    {experience.adminRecommendationNote}
                  </p>
                )}

                {experience.twoPaxSharingPriceUSD && experience.soloTravelerPriceUSD && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#1A1612]/80 border border-white/15 rounded-lg p-4 space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] block">
                        2-Pax Sharing Tariff (Per Person)
                      </span>
                      <div className="font-mono text-2xl font-bold text-white">
                        {formatPrice(experience.twoPaxSharingPriceUSD, currency)}
                        <span className="text-xs font-normal text-[#E4DCCF]"> / person</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#E4DCCF] block">
                        ~{formatPrice(Math.round(experience.twoPaxSharingPriceUSD / experience.durationDays), currency)}/day • Shared Private 4x4 Land Cruiser &amp; Twin/Double Room
                      </span>
                    </div>

                    <div className="bg-[#1A1612]/80 border border-[#D99B26]/40 rounded-lg p-4 space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] block">
                        1-Pax Solo Traveler Private Tariff
                      </span>
                      <div className="font-mono text-2xl font-bold text-[#D99B26]">
                        {formatPrice(experience.soloTravelerPriceUSD, currency)}
                        <span className="text-xs font-normal text-[#E4DCCF]"> / solo total</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#E4DCCF] block">
                        ~{formatPrice(Math.round(experience.soloTravelerPriceUSD / experience.durationDays), currency)}/day • 100% Exclusive Private 4x4 Land Cruiser &amp; Single Room
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Overview */}
          <section className="bg-white border border-[#E4DCCF] rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
              Experience Overview
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
              {experience.summary}
            </p>
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-4 text-xs text-[#1A1612] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#226B3E] flex-shrink-0 mt-0.5" />
              <div>
                <strong>Best Seasons:</strong> {experience.bestMonths}. Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide.
              </div>
            </div>
          </section>

          {/* Official Shuma Africa Safaris Dossier Breakdown (Rendered when shumaGroupOffer is present) */}
          {experience.shumaGroupOffer && (
            <section className="bg-[#144225] text-[#FAF7F2] border-2 border-[#D99B26]/60 rounded-xl overflow-hidden shadow-md">
              <div className="px-6 py-4 bg-[#1A1612]/90 border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D99B26] font-bold block">
                    {experience.shumaGroupOffer.companyName} — “{experience.shumaGroupOffer.tagline}”
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    Official 2027 Group Package &amp; Complimentary Tour Leader Dossier
                  </h2>
                </div>
                <a
                  href={experience.shumaGroupOffer.pdfBrochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#D99B26] hover:bg-[#c5891d] text-[#1A1612] font-mono text-xs font-bold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Official 32-Day PDF Dossier</span>
                </a>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* 4-Country Sector Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {experience.shumaGroupOffer.countries.map((countryLabel, i) => (
                    <div
                      key={countryLabel}
                      className="bg-[#1B5632] border border-white/15 rounded-lg p-3"
                    >
                      <div className="font-mono text-[10px] text-[#D99B26] uppercase">
                        Sector 0{i + 1}
                      </div>
                      <div className="font-serif text-base font-bold text-white mt-0.5">
                        {countryLabel}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Package Cost Summary Table from PDF Page 8 */}
                <div className="bg-[#1A1612]/85 border border-white/15 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-[#1B5632]/60 border-b border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D99B26] font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Package Cost Summary (7 Paying Guests + 1 Complimentary Tour Leader)</span>
                    </span>
                    <span className="font-mono text-xs text-[#E4DCCF]">
                      {experience.shumaGroupOffer.seasonWindow}
                    </span>
                  </div>
                  <div className="divide-y divide-white/10 text-xs sm:text-sm font-mono">
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[#D6CEC2]">Total Group Package Cost (7 Paying Guests + 1 Free Tour Leader):</span>
                      <span className="text-white font-bold text-base">
                        {formatPrice(experience.shumaGroupOffer.totalGroupCostUSD, currency)} ($126,550 USD)
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-[#226B3E]/30">
                      <span className="text-[#FAF7F2] font-semibold">Exact Cost Per Paying Person (Based on 7 Guests):</span>
                      <span className="text-[#D99B26] font-bold text-base">
                        $18,078.57 USD / person
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[#D6CEC2]">Complimentary Tour Leader Allocation (8th Traveller):</span>
                      <span className="text-[#4CC37A] font-bold">
                        1 Tour Leader Included Free of Charge
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[#D6CEC2]">Rooming &amp; Accommodation Standard:</span>
                      <span className="text-white">
                        {experience.shumaGroupOffer.roomingPlan} • {experience.shumaGroupOffer.accommodationStyle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flights & Key Transport Arrangements from PDF Page 2 */}
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#D99B26]" />
                    <span>Included Regional, Bush &amp; Private Charter Flights</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.shumaGroupOffer.flightsAndTransport.map((item) => (
                      <div
                        key={item.sector}
                        className="bg-[#1B5632]/80 border border-white/15 rounded-lg p-3.5 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#D99B26]">
                            {item.sector}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#1A1612]/70 text-[10px] font-mono text-[#E4DCCF]">
                            {item.mode}
                          </span>
                        </div>
                        <p className="text-xs text-[#E4DCCF] leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Planning Notes from PDF Page 8 */}
                <div className="bg-[#1A1612]/75 border border-[#D99B26]/40 rounded-lg p-4 space-y-2">
                  <div className="font-mono text-xs uppercase tracking-wider text-[#D99B26] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Important Multi-Country Planning Notes</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E4DCCF]">
                    {experience.shumaGroupOffer.planningNotes.map((note) => (
                      <li key={note} className="flex items-start gap-2">
                        <span className="text-[#D99B26] font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Price Bands per Comfort Tier */}
          <section className="space-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Transparent Price Bands
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                Select Your Comfort Tier
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {experience.priceBands.map((band) => {
                const isSelected = band.tier === selectedTier;
                return (
                  <button
                    key={band.tier}
                    type="button"
                    onClick={() => setSelectedTier(band.tier)}
                    className={`text-left p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] shadow-md'
                        : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                    }`}
                  >
                    <div className="space-y-2">
                      <span
                        className={`font-mono text-xs uppercase tracking-wider font-semibold block ${
                          isSelected ? 'text-[#D99B26]' : 'text-[#C85A28]'
                        }`}
                      >
                        {band.tier} Tier
                      </span>
                      <div className="font-mono text-2xl font-bold">
                        {formatPrice(band.perPersonUSD, currency)}
                        <span className="text-xs font-normal opacity-80"> / person</span>
                      </div>
                      <div className="text-[11px] font-mono opacity-80">
                        (~{formatPrice(band.perPersonPerDayUSD, currency)} per person/day)
                      </div>
                      <p
                        className={`text-xs leading-relaxed pt-2 ${
                          isSelected ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                        }`}
                      >
                        {band.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-current/15 text-[11px]">
                      <span className="font-semibold block mb-1">Representative Lodges:</span>
                      <span className="opacity-90">{band.lodgeExamples.join(' • ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Day-by-Day Itinerary */}
          <section className="space-y-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Day-by-Day Field Plan
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                Detailed Itinerary
              </h2>
            </div>

            <div className="space-y-5">
              {experience.dayByDay.map((day) => (
                <article
                  key={day.day}
                  className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#226B3E] text-[#FAF7F2] font-mono text-xs font-bold px-3 py-1.5 rounded-md">
                        DAY {day.day}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                        {day.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#C85A28] font-medium">
                      {day.location}
                    </span>
                  </div>

                  <p className="text-sm text-[#5A5248] leading-relaxed">
                    {day.summary}
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#1A1612] font-semibold">
                      Key Activities & Highlights
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-[#5A5248]">
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#C85A28] font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E4DCCF] text-xs text-[#5A5248]">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-[#226B3E] flex-shrink-0" />
                      <span className="truncate">{day.accommodationTier}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#C85A28] flex-shrink-0" />
                      <span>Meals: {day.meals}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                      <span className="truncate">{day.driveTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Inclusions & Exclusions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1612] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]" />
                <span>What Is Included</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#1A1612]">
                {experience.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#1A1612] flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#B45309]" />
                <span>What Is Excluded</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#5A5248]">
                {experience.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQ Accordion */}
          {experience.faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {experience.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#1A1612] hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#C85A28] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#5A5248] flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-[#5A5248] leading-relaxed border-t border-[#E4DCCF] pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right 4 Columns: Recommended Guides & Quick Booking Box */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-5 sticky top-24">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Recommended WildLife Guides
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1612] mt-1">
                Specialists Who Lead This Route
              </h3>
              <p className="text-xs text-[#5A5248] mt-1">
                Choose your preferred Ugandan guide or let our Entebbe desk match you based on your dates.
              </p>
            </div>

            <div className="space-y-3">
              {recommendedGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5 space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <SmartImage
                      src={guide.photo}
                      alt={guide.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#C85A28]"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/guides/${guide.slug}`}
                        className="font-serif text-lg font-bold text-[#1A1612] hover:text-[#C85A28] block truncate"
                      >
                        {guide.name}
                      </Link>
                      <span className="text-[11px] font-mono text-[#5A5248] block">
                        {guide.homeRegion} • {guide.yearsExperience} yrs exp
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A5248] line-clamp-2">{guide.tagline}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/guides/${guide.slug}`}
                      className="text-xs font-semibold text-[#226B3E] hover:underline"
                    >
                      View Dossier
                    </Link>
                    <span className="text-[#E4DCCF]">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        openInquiryModal({
                          guideSlug: guide.slug,
                          experienceSlug: experience.slug,
                          defaultTier: selectedTier,
                        })
                      }
                      className="text-xs font-semibold text-[#C85A28] hover:underline cursor-pointer"
                    >
                      Book &amp; Pay with {guide.name.split(' ')[0]} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E4DCCF] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#5A5248] capitalize">
                  {selectedTier} Price Band:
                </span>
                <span className="font-mono text-xl font-bold text-[#1A1612]">
                  {formatPrice(activeBand.perPersonUSD, currency)} pp
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  openInquiryModal({
                    experienceSlug: experience.slug,
                    defaultTier: selectedTier,
                  })
                }
                className="w-full py-3 px-4 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Pay &amp; Book Package Directly
              </button>

              <Link
                to={`/trip-planner?experience=${experience.slug}`}
                className="w-full py-2.5 px-4 rounded-md border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-[#FAF7F2] text-xs font-semibold text-center block transition-colors"
              >
                Customize in Trip Planner
              </Link>

              <p className="text-[11px] text-[#5A5248] text-center">
                {AVAILABILITY_PROMISE}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <StickyBookBar
        title={experience.title}
        subtitle={`${experience.durationDays} Days • ${experience.region}`}
        pricePerPersonUSD={activeBand.perPersonUSD}
        selectedTier={selectedTier}
        experienceSlug={experience.slug}
        ctaLabel="Pay & Book This Package Directly"
      />
    </div>
  );
};
