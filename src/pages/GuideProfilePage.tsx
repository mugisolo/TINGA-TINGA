import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Award,
  Languages,
  ArrowLeft,
  CalendarCheck,
  Quote,
  Compass,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  GUIDES,
  EXPERIENCES,
  SAMPLE_REVIEWS,
  JOURNAL_ARTICLES,
  SPECIALTY_LABELS,
} from '../data/seedData';
import { ExperienceCard } from '../components/ExperienceCard';
import { StickyBookBar } from '../components/StickyBookBar';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { useInquiry } from '../context/InquiryContext';

export const GuideProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiryModal } = useInquiry();

  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const ledExperiences = EXPERIENCES.filter((exp) =>
    exp.recommendedGuides.includes(guide.slug)
  );
  const guideReviews = SAMPLE_REVIEWS.filter((r) => r.guideSlug === guide.slug);
  const guideArticles = JOURNAL_ARTICLES.filter((a) => a.authorGuideSlug === guide.slug);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: guide.name,
    jobTitle: 'Licensed Ugandan Safari Guide',
    description: guide.tagline,
    worksFor: {
      '@type': 'TravelAgency',
      name: 'Enganda Safaris',
    },
    homeLocation: {
      '@type': 'Place',
      name: `${guide.homeRegion}, Uganda`,
    },
    knowsLanguage: guide.languages,
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-28">
      <SEO
        title={`${guide.name} — ${guide.homeRegion} Safari Guide | Enganda Safaris`}
        description={`${guide.name}: ${guide.tagline} (${guide.yearsExperience} years guiding in Uganda). Request ${guide.name} for your private Uganda safari.`}
        jsonLd={personJsonLd}
      />

      {/* Top Breadcrumb */}
      <div className="bg-[#F3ECE1] border-b border-[#E4DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-[#226B3E] hover:text-[#C85A28] font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All 8 Enganda Guides</span>
          </Link>
          <span className="font-mono text-[#5A5248]">
            Home Region: <strong className="text-[#1A1612]">{guide.homeRegion}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Hero Dossier Block */}
        <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[380px] bg-[#226B3E]">
            <SmartImage
              src={guide.photo}
              alt={guide.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3ECE1] border border-[#E4DCCF] text-xs font-medium text-[#226B3E]">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A28]" />
                  <span>Based in {guide.homeRegion}, Uganda</span>
                </span>

                <div className="flex items-center gap-2 font-mono text-xs bg-[#FAF7F2] px-3 py-1 rounded-md border border-[#E4DCCF]">
                  <Star className="w-4 h-4 text-[#D99B26] fill-[#D99B26]" />
                  <span className="font-bold text-[#1A1612]">{guide.rating.toFixed(1)}</span>
                  <span className="text-[#5A5248]">• {guide.yearsExperience} Years Guiding</span>
                </div>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1612]">
                {guide.name}
              </h1>

              <p className="text-base sm:text-lg font-medium text-[#226B3E]">
                {guide.tagline}
              </p>

              <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
                {guide.bio}
              </p>

              {/* Specialties & Regions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E4DCCF]">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#5A5248] mb-2">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F3ECE1] text-[#1A1612] border border-[#E4DCCF]"
                      >
                        {SPECIALTY_LABELS[spec]}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#5A5248] mb-2">
                    Uganda Regions Covered
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.regionsCovered.map((reg) => (
                      <span
                        key={reg}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#FAF7F2] text-[#226B3E] border border-[#E4DCCF]"
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E4DCCF] text-xs text-[#5A5248]">
                <div>
                  <div className="font-mono uppercase text-[#1A1612] font-semibold mb-1 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-[#C85A28]" />
                    <span>Languages Spoken</span>
                  </div>
                  <p>{guide.languages.join(' • ')}</p>
                </div>

                <div>
                  <div className="font-mono uppercase text-[#1A1612] font-semibold mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#226B3E]" />
                    <span>Licenses & Accreditations</span>
                  </div>
                  <ul className="space-y-0.5">
                    {guide.certifications.map((cert) => (
                      <li key={cert}>• {cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="pt-4 border-t border-[#E4DCCF] flex flex-wrap items-center gap-3">
              <Link
                to={`/trip-planner?guide=${guide.slug}`}
                className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3 rounded-md transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Request {guide.name} in Trip Planner</span>
              </Link>

              <button
                type="button"
                onClick={() => openInquiryModal({ guideSlug: guide.slug })}
                className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] font-semibold text-sm px-5 py-3 rounded-md transition-colors cursor-pointer"
              >
                <span>Quick Availability Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Personal Field Story */}
        <section className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-10 border border-[#2E8550]">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26]">
              <Quote className="w-4 h-4" />
              <span>Personal Field Story • In {guide.name.split(' ')[0]}’s Own Words</span>
            </div>
            <p className="font-serif italic text-2xl sm:text-3xl text-white leading-relaxed">
              “{guide.fieldStory}”
            </p>
            <p className="text-xs text-[#D6CEC2] pt-2">
              Your safari with {guide.name} includes a private 4x4 Land Cruiser with pop-up roof, driven by {guide.name.split(' ')[0]} from Entebbe meet-and-greet through every national park.
            </p>
          </div>
        </section>

        {/* Experiences Led by This Guide */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Curated Uganda Routes
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                Safari Experiences Led by {guide.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ledExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>

        {/* Field Notes Written by This Guide (if any) */}
        {guideArticles.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1A1612] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C85A28]" />
              <span>Journal Field Notes by {guide.name}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guideArticles.map((art) => (
                <Link
                  key={art.slug}
                  to={`/journal?article=${art.slug}`}
                  className="bg-white border border-[#E4DCCF] hover:border-[#C85A28] rounded-lg p-6 block transition-colors"
                >
                  <span className="text-xs font-mono text-[#C85A28] uppercase">
                    {art.category} • {art.readTimeMinutes} min read
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612] mt-1">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#5A5248] mt-2">{art.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Guest Reviews Mentioning This Guide */}
        <section className="space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
              Sample Guest Feedback
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
              What Guests Say About Traveling with {guide.name.split(' ')[0]}
            </h2>
          </div>

          {guideReviews.length === 0 ? (
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-6 text-sm text-[#5A5248]">
              Ask our Entebbe coordination desk for recent guest references for {guide.name}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guideReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#D99B26]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D99B26]" />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-[#5A5248]">{rev.date}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1612]">
                    “{rev.title}”
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                    {rev.text}
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#1A1612]">
                    {rev.guestName} ({rev.country}) — {rev.partyType}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <StickyBookBar
        title={`Safari Led by ${guide.name}`}
        subtitle={`${guide.homeRegion} • ${guide.yearsExperience} Years Guiding`}
        guideSlug={guide.slug}
        ctaLabel={`Request ${guide.name.split(' ')[0]} for Your Safari`}
      />
    </div>
  );
};
