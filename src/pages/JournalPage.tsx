import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { JOURNAL_ARTICLES, GUIDES } from '../data/seedData';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';

export const JournalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('article') || JOURNAL_ARTICLES[0].slug;
  const [selectedSlug, setSelectedSlug] = useState<string>(activeSlug);

  useEffect(() => {
    if (activeSlug) {
      setSelectedSlug(activeSlug);
    }
  }, [activeSlug]);

  const activeArticle =
    JOURNAL_ARTICLES.find((a) => a.slug === selectedSlug) || JOURNAL_ARTICLES[0];
  const authorGuide = GUIDES.find((g) => g.slug === activeArticle.authorGuideSlug);

  const handleSelectArticle = (slug: string) => {
    setSelectedSlug(slug);
    setSearchParams({ article: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title={`${activeArticle.title} | Enganda Safaris Field Notes Journal`}
        description={activeArticle.excerpt}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Written & Bylined by Our Ugandan Safari Guides</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Enganda Field Notes & Uganda Safari Dispatches
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Practical advice on UWA gorilla and chimpanzee permits, seasonal trail conditions in Bwindi, and birding strategies — written directly by the Ugandan guides who lead your trip.
            </p>
          </div>
        </div>

        {/* Featured / Selected Article Reader */}
        <article className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
          <div className="relative h-72 sm:h-96 bg-[#226B3E]">
            <SmartImage
              src={activeArticle.heroImage}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] via-[#1A1612]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#D99B26]">
                <span>{activeArticle.category}</span>
                <span>•</span>
                <span>{activeArticle.publishedDate}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeArticle.readTimeMinutes} min read
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                {activeArticle.title}
              </h2>
              <p className="text-sm sm:text-base text-[#E4DCCF]">
                {activeArticle.subtitle}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Article Body */}
            <div className="lg:col-span-8 space-y-6">
              {/* Key Takeaways Box */}
              <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-5 space-y-2.5">
                <div className="text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                  Key Field Takeaways
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#1A1612]">
                  {activeArticle.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {activeArticle.sections.map((sec, i) => (
                <div key={i} className="space-y-2.5">
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                    {sec.heading}
                  </h3>
                  <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Author Guide Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {authorGuide && (
                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-6 space-y-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold block">
                    About the Author Guide
                  </span>
                  <div className="flex items-center gap-3.5">
                    <SmartImage
                      src={authorGuide.photo}
                      alt={authorGuide.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#C85A28]"
                    />
                    <div>
                      <h4 className="font-serif text-2xl font-bold text-[#1A1612]">
                        {authorGuide.name}
                      </h4>
                      <span className="text-xs font-mono text-[#5A5248] block">
                        {authorGuide.homeRegion} • {authorGuide.yearsExperience} yrs guiding
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A5248] leading-relaxed">
                    {authorGuide.tagline}
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to={`/guides/${authorGuide.slug}`}
                      className="w-full py-2.5 px-4 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold text-center transition-colors"
                    >
                      View {authorGuide.name.split(' ')[0]}’s Full Dossier
                    </Link>
                    <Link
                      to={`/trip-planner?guide=${authorGuide.slug}`}
                      className="w-full py-2.5 px-4 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold text-center transition-colors"
                    >
                      Request {authorGuide.name.split(' ')[0]} for Your Safari
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>

        {/* All 4 Guide-Bylined Articles Grid */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
            All Guide-Bylined Field Notes ({JOURNAL_ARTICLES.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {JOURNAL_ARTICLES.map((art) => {
              const guide = GUIDES.find((g) => g.slug === art.authorGuideSlug);
              const isCurrent = art.slug === activeArticle.slug;
              return (
                <div
                  key={art.slug}
                  className={`bg-white border rounded-lg p-6 flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent
                      ? 'border-[#C85A28] ring-1 ring-[#C85A28]'
                      : 'border-[#E4DCCF] hover:border-[#226B3E]'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#C85A28]">
                      <span>{art.category}</span>
                      <span>{art.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                      {art.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E4DCCF] flex items-center justify-between gap-3">
                    {guide && (
                      <Link
                        to={`/guides/${guide.slug}`}
                        className="flex items-center gap-2 text-xs font-semibold text-[#1A1612] hover:text-[#C85A28]"
                      >
                        <SmartImage
                          src={guide.photo}
                          alt={guide.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#C85A28]"
                        />
                        <span>By {guide.name}</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectArticle(art.slug)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] cursor-pointer"
                    >
                      <span>{isCurrent ? 'Currently Reading' : 'Read Field Note'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
