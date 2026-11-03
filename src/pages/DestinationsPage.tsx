import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Compass, ArrowRight, Mountain, Clock } from 'lucide-react';
import { DESTINATIONS, GUIDES, EXPERIENCES } from '../data/seedData';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { UgandaParksMap } from '../components/UgandaParksMap';
import { useInquiry } from '../context/InquiryContext';

export const DestinationsPage: React.FC = () => {
  const { openInquiryModal } = useInquiry();
  const [selectedSlug, setSelectedSlug] = useState<string>('all');

  const visibleDestinations =
    selectedSlug === 'all'
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.slug === selectedSlug);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Uganda Safari Destinations & Regions | Enganda Safaris"
        description="Explore all 9 Ugandan safari regions — Bwindi & Mgahinga, Kibale Forest, Queen Elizabeth NP, Murchison Falls NP, Kidepo Valley NP, Rwenzori Mountains, Jinja, Lake Bunyonyi, and Entebbe & Mabamba Swamp."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Compass className="w-3.5 h-3.5" />
              <span>9 Iconic Ugandan Regions • Matched With Local Guides</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Where Our Guides Call Home Across Uganda
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              From the glacial peaks of the Rwenzori Mountains and the montane rainforest of Bwindi to the papyrus channels of Mabamba Swamp on Lake Victoria, explore Uganda’s nine core safari regions and see which Enganda guides specialize in each landscape.
            </p>
          </div>
        </div>

        {/* Interactive D3 Map of Major Uganda National Parks */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <UgandaParksMap
            compactHeader
            onSelectDestinationSlug={(slug) => setSelectedSlug(slug)}
          />
        </div>

        {/* Region Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedSlug('all')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              selectedSlug === 'all'
                ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:bg-[#F3ECE1]'
            }`}
          >
            All 9 Uganda Regions
          </button>
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.slug}
              type="button"
              onClick={() => setSelectedSlug(dest.slug)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                selectedSlug === dest.slug
                  ? 'bg-[#C85A28] text-white border-[#C85A28]'
                  : 'bg-white text-[#5A5248] border-[#E4DCCF] hover:text-[#1A1612] hover:bg-[#F3ECE1]'
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>

        {/* Destination Cards */}
        <div className="space-y-10">
          {visibleDestinations.map((dest) => {
            const regionalGuides = GUIDES.filter(
              (g) =>
                g.homeRegion === dest.name || g.regionsCovered.includes(dest.name)
            );
            const regionalExperiences = EXPERIENCES.filter(
              (e) => e.region === dest.name || e.regions.includes(dest.name)
            );

            return (
              <article
                key={dest.slug}
                className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                <div className="lg:col-span-5 relative min-h-[300px] bg-[#226B3E]">
                  <SmartImage
                    src={dest.heroImage}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    {dest.parkElevation && (
                      <div className="text-xs font-mono text-[#D99B26] flex items-center gap-1">
                        <Mountain className="w-3.5 h-3.5" />
                        <span>Elevation: {dest.parkElevation}</span>
                      </div>
                    )}
                    <h2 className="font-serif text-3xl font-bold">{dest.name}</h2>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="font-serif italic text-xl text-[#226B3E]">
                      {dest.tagline}
                    </p>
                    <p className="text-sm text-[#5A5248] leading-relaxed">
                      {dest.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-[#C85A28] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#1A1612] block">Best Seasons</span>
                          <span className="text-[#5A5248]">{dest.bestSeasons}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-[#226B3E] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#1A1612] block">Access from Entebbe HQ</span>
                          <span className="text-[#5A5248]">{dest.driveFromEntebbe}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Wildlife & Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#1A1612] font-semibold mb-2">
                          Key Wildlife
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {dest.keyWildlife.map((w) => (
                            <span
                              key={w}
                              className="px-2 py-0.5 text-[11px] bg-[#F3ECE1] text-[#226B3E] border border-[#E4DCCF] rounded-md"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#1A1612] font-semibold mb-2">
                          Regional Highlights
                        </h3>
                        <ul className="space-y-1 text-xs text-[#5A5248]">
                          {dest.highlights.map((h, i) => (
                            <li key={i}>• {h}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Enganda Guides Covering This Region */}
                  <div className="pt-4 border-t border-[#E4DCCF] space-y-3">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                      Enganda Guides Covering {dest.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {regionalGuides.map((guide) => (
                        <Link
                          key={guide.id}
                          to={`/guides/${guide.slug}`}
                          className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-[#E4DCCF] rounded-md px-3 py-1.5 transition-colors"
                        >
                          <SmartImage
                            src={guide.photo}
                            alt={guide.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#C85A28]"
                          />
                          <div className="text-left">
                            <span className="text-xs font-semibold text-[#1A1612] block leading-none">
                              {guide.name}
                            </span>
                            <span className="text-[10px] text-[#5A5248]">
                              {guide.homeRegion === dest.name ? 'Home Base' : 'Covers Region'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-[#5A5248]">
                        {regionalExperiences.length > 0 && (
                          <span>
                            Featured in:{' '}
                            {regionalExperiences.map((exp, idx) => (
                              <React.Fragment key={exp.id}>
                                {idx > 0 && ', '}
                                <Link
                                  to={`/experiences/${exp.slug}`}
                                  className="text-[#226B3E] font-semibold hover:underline"
                                >
                                  {exp.title}
                                </Link>
                              </React.Fragment>
                            ))}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openInquiryModal({
                            defaultNotes: `Interested in visiting ${dest.name} with an Enganda guide.`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>Plan a Trip to {dest.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
