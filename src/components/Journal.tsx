import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { JOURNAL_ARTICLES, GUIDES } from '../data/seedData';
import { JournalArticle } from '../types';
import { SmartImage } from './SmartImage';

const CATEGORIES = [
  'All Dispatches',
  'Travel Updates',
  'Safari Tips',
  'Cultural Stories',
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

export const Journal: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>('All Dispatches');
  const [selectedArticle, setSelectedArticle] =
    useState<JournalArticle | null>(null);

  const filteredArticles =
    activeCategory === 'All Dispatches'
      ? JOURNAL_ARTICLES
      : JOURNAL_ARTICLES.filter((article) => article.category === activeCategory);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 520;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="journal-feed"
      className="py-20 bg-[#FAF7F2] border-t border-[#E4DCCF]"
      aria-labelledby="home-journal-heading"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-[#C85A28]" />
              <span>Enganda Field Journal · Written by Our Ugandan Guides</span>
            </div>
            <h2
              id="home-journal-heading"
              className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612]"
            >
              Travel Updates, Safari Tips & Cultural Stories
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
              Dispatches straight from our regional guides across Bwindi, Mabamba Bay, Kidepo Valley, and Ankole — covering live trail conditions, packing wisdom, and Ugandan heritage.
            </p>
          </div>

          {/* Scroll Controls & Full Journal Link */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll journal feed left"
                className="p-2.5 rounded-md border border-[#E4DCCF] bg-white hover:bg-[#226B3E] hover:text-white hover:border-[#226B3E] text-[#1A1612] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll journal feed right"
                className="p-2.5 rounded-md border border-[#E4DCCF] bg-white hover:bg-[#226B3E] hover:text-white hover:border-[#226B3E] text-[#1A1612] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <span>Explore Full Journal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Interactive Category Segmented Filter Bar */}
        <div
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg w-fit mb-8"
          role="tablist"
          aria-label="Filter journal stories by category"
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#226B3E] text-[#FAF7F2] shadow-xs'
                    : 'text-[#5A5248] hover:text-[#1A1612] hover:bg-[#FAF7F2]/60'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Horizontal Scrollable Feed */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
        >
          {filteredArticles.map((article) => {
            const authorGuide = GUIDES.find(
              (g) => g.slug === article.authorGuideSlug
            );

            return (
              <article
                key={article.slug}
                className="min-w-[360px] sm:min-w-[460px] max-w-[490px] min-h-[490px] flex-shrink-0 snap-start bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-lg overflow-hidden flex flex-col justify-between transition-all shadow-xs"
              >
                <div>
                  {/* Article Thumbnail (25% Taller Vertically) */}
                  <div className="relative h-64 overflow-hidden bg-[#226B3E]">
                    <SmartImage
                      src={article.heroImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/70 via-transparent to-transparent" />
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {/* Unboxed Clean Inline Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#5A5248]">
                      <span className="text-[#226B3E] font-semibold">
                        {article.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{article.publishedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTimeMinutes} min read
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-[#1A1612] leading-snug line-clamp-2">
                      <Link
                        to={`/journal?article=${article.slug}`}
                        className="hover:text-[#226B3E] transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Highlighted Field Tip */}
                    {article.keyTakeaways[0] && (
                      <div className="pt-2 border-t border-[#E4DCCF]/80 flex items-start gap-2 text-xs text-[#1A1612]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-[#5A5248]">
                          {article.keyTakeaways[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Author Guide + Actions */}
                <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E4DCCF] flex items-center justify-between gap-3">
                  {authorGuide ? (
                    <Link
                      to={`/guides/${authorGuide.slug}`}
                      className="flex items-center gap-2.5 group min-w-0"
                    >
                      <SmartImage
                        src={authorGuide.photo}
                        alt={authorGuide.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#226B3E] shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#1A1612] group-hover:text-[#226B3E] transition-colors truncate">
                          {authorGuide.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#5A5248] truncate">
                          {authorGuide.homeRegion}
                        </div>
                      </div>
                    </Link>
                  ) : null}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(article)}
                      className="px-3 py-1.5 rounded-md border border-[#E4DCCF] bg-white hover:border-[#226B3E] text-[#1A1612] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Quick Read
                    </button>
                    <Link
                      to={`/journal?article=${article.slug}`}
                      aria-label={`Read full article: ${article.title}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] transition-colors"
                    >
                      <span>Full Note</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Quick Read Modal for Instant Home Page Reading */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1612]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-read-modal-title"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 bg-[#226B3E]">
              <SmartImage
                src={selectedArticle.heroImage}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] via-[#1A1612]/40 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article reader"
                className="absolute top-4 right-4 p-2 rounded-md bg-[#1A1612]/80 text-white hover:bg-[#C85A28] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#D99B26]">
                  <span>{selectedArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.publishedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.readTimeMinutes} min read</span>
                </div>
                <h3
                  id="quick-read-modal-title"
                  className="font-serif text-2xl sm:text-3xl font-bold leading-snug"
                >
                  {selectedArticle.title}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm font-medium text-[#1A1612] leading-relaxed">
                {selectedArticle.subtitle}
              </p>

              <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                  Key Field Takeaways
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#1A1612]">
                  {selectedArticle.keyTakeaways.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#226B3E] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedArticle.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="font-serif text-xl font-bold text-[#1A1612]">
                    {sec.heading}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              ))}

              <div className="pt-4 border-t border-[#E4DCCF] flex flex-wrap items-center justify-between gap-3">
                <Link
                  to={`/journal?article=${selectedArticle.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold transition-colors"
                >
                  <span>Open in Full Journal Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2.5 rounded-md border border-[#E4DCCF] bg-white hover:bg-[#F3ECE1] text-xs font-semibold text-[#1A1612] cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Journal;
