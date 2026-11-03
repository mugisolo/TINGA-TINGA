import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, RotateCcw, Info, ArrowRight } from 'lucide-react';
import { SAMPLE_REVIEWS, GUIDES, EXPERIENCES } from '../data/seedData';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';

export const ReviewsPage: React.FC = () => {
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string>('all');
  const [selectedExpSlug, setSelectedExpSlug] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  const filteredReviews = useMemo(() => {
    return SAMPLE_REVIEWS.filter((r) => {
      const matchGuide =
        selectedGuideSlug === 'all' || r.guideSlug === selectedGuideSlug;
      const matchExp =
        selectedExpSlug === 'all' || r.experienceSlug === selectedExpSlug;
      const matchRating = r.rating >= minRating;
      return matchGuide && matchExp && matchRating;
    });
  }, [selectedGuideSlug, selectedExpSlug, minRating]);

  const resetFilters = () => {
    setSelectedGuideSlug('all');
    setSelectedExpSlug('all');
    setMinRating(0);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Guest Stories & Guide Reviews | Enganda Safaris"
        description="Read guest stories from Uganda safaris led by our named Ugandan guides across Bwindi Impenetrable Forest, Kibale, Mabamba Swamp, Murchison Falls, and Kidepo Valley."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Guest Stories & Guide Reviews
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Every review below links directly to the Ugandan guide who led the safari and the Uganda itinerary the guests traveled on.
            </p>
          </div>
        </div>

        {/* Sample Reviews Transparency Notice (Content Rule 4) */}
        <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-4 flex items-start gap-3 text-xs text-[#5A5248]">
          <Info className="w-4 h-4 text-[#C85A28] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#1A1612]">Transparency Note:</strong> These representative sample guest reviews (<code className="font-mono">SAMPLE_REVIEWS</code>) illustrate how guest feedback links directly to each named Enganda guide and Uganda experience. Ask our Entebbe desk for direct references for your chosen guide.
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E4DCCF] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
              <Filter className="w-4 h-4 text-[#C85A28]" />
              <span>Filter by Enganda Guide, Experience, or Rating</span>
            </div>
            {(selectedGuideSlug !== 'all' || selectedExpSlug !== 'all' || minRating > 0) && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85A28] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Filter by Guide
              </label>
              <select
                value={selectedGuideSlug}
                onChange={(e) => setSelectedGuideSlug(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612]"
              >
                <option value="all">All 8 Enganda Guides</option>
                {GUIDES.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name} ({g.homeRegion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Filter by Uganda Experience
              </label>
              <select
                value={selectedExpSlug}
                onChange={(e) => setSelectedExpSlug(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612]"
              >
                <option value="all">All 6 Experiences</option>
                {EXPERIENCES.map((exp) => (
                  <option key={exp.slug} value={exp.slug}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612]"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars Only</option>
                <option value={4}>4+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => {
            const guide = GUIDES.find((g) => g.slug === rev.guideSlug);
            const exp = EXPERIENCES.find((e) => e.slug === rev.experienceSlug);

            return (
              <article
                key={rev.id}
                className="bg-white border border-[#E4DCCF] rounded-lg p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#D99B26]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-[#D99B26]" />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-[#5A5248]">{rev.date}</span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
                    “{rev.title}”
                  </h2>

                  <p className="text-sm text-[#5A5248] leading-relaxed">
                    {rev.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#1A1612]">
                      {rev.guestName} • {rev.country}
                    </div>
                    {exp && (
                      <Link
                        to={`/experiences/${exp.slug}`}
                        className="text-xs text-[#226B3E] hover:underline block mt-0.5"
                      >
                        Experience: {exp.title}
                      </Link>
                    )}
                  </div>

                  {guide && (
                    <Link
                      to={`/guides/${guide.slug}`}
                      className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-[#E4DCCF] rounded-md px-3 py-1.5 transition-colors"
                    >
                      <SmartImage
                        src={guide.photo}
                        alt={guide.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#C85A28]"
                      />
                      <div className="text-left">
                        <span className="text-[10px] font-mono uppercase text-[#5A5248] block">
                          Guided by
                        </span>
                        <span className="text-xs font-semibold text-[#C85A28] flex items-center gap-1">
                          {guide.name}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
