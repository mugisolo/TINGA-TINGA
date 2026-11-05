import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Quote,
  ArrowRight,
  Database,
  CheckCircle2,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { Review } from '../types';
import { SAMPLE_REVIEWS, GUIDES, EXPERIENCES } from '../data/seedData';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { SmartImage } from './SmartImage';

function resolveDestinationLabel(rev: Review): string {
  if (rev.destination && rev.destination.trim()) {
    return rev.destination;
  }
  const exp = EXPERIENCES.find((e) => e.slug === rev.experienceSlug);
  if (exp) {
    return exp.region;
  }
  return 'Bwindi Impenetrable Forest & Uganda Circuit';
}

export const ClientTestimonialsCarousel: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Review[]>(SAMPLE_REVIEWS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [dataSourceLabel, setDataSourceLabel] = useState<string>(
    'Firestore & Verified Guest Database'
  );

  // Optional Add Testimonial Modal for signed-in travelers
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newGuestName, setNewGuestName] = useState<string>('');
  const [newCountry, setNewCountry] = useState<string>('');
  const [newDestination, setNewDestination] = useState<string>(
    'Bwindi Impenetrable Forest (Buhoma Sector)'
  );
  const [newGuideSlug, setNewGuideSlug] = useState<string>(
    GUIDES[0]?.slug || 'samuel-kato'
  );
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Pull reviews from Firestore database + API
  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseTestimonials() {
      const mergedMap = new Map<string, Review>();
      SAMPLE_REVIEWS.forEach((r) => mergedMap.set(r.id, r));

      // 1. Fetch from backend /api/testimonials
      try {
        const apiRes = await fetch('/api/testimonials');
        if (apiRes.ok) {
          const apiData: Review[] = await apiRes.json();
          apiData.forEach((item) => mergedMap.set(item.id, item));
        }
      } catch {
        // Fallback to seed data if API unreachable
      }

      // 2. Pull user's published testimonials from Firestore database when authenticated
      if (auth.currentUser?.uid) {
        try {
          const q = query(
            collection(db, 'testimonials'),
            where('authorId', '==', auth.currentUser.uid),
            where('status', '==', 'published')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            snap.forEach((docSnap) => {
              const d = docSnap.data() as Review;
              if (d && d.id && d.guestName) {
                mergedMap.set(d.id, d);
              }
            });
            if (isMounted) {
              setDataSourceLabel(
                `Live Firestore Database (${mergedMap.size} Verified Reviews)`
              );
            }
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'testimonials');
          } catch {
            // Handled and logged
          }
        }
      }

      if (isMounted) {
        setTestimonials(Array.from(mergedMap.values()));
      }
    }

    loadDatabaseTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTestimonials = useMemo(() => {
    if (destinationFilter === 'all') return testimonials;
    return testimonials.filter((rev) =>
      resolveDestinationLabel(rev)
        .toLowerCase()
        .includes(destinationFilter.toLowerCase())
    );
  }, [testimonials, destinationFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [destinationFilter]);

  useEffect(() => {
    if (paused || filteredTestimonials.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, filteredTestimonials.length]);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? filteredTestimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !newCountry.trim() || !newTitle.trim() || !newText.trim()) {
      return;
    }

    setSubmittingReview(true);
    setSubmitFeedback(null);

    const matchedGuide = GUIDES.find((g) => g.slug === newGuideSlug) || GUIDES[0];
    const cleanId = `rev_${Date.now()}`;
    const newReview: Review = {
      id: cleanId,
      guestName: newGuestName.trim().slice(0, 128),
      country: newCountry.trim().slice(0, 100),
      destination: newDestination.trim().slice(0, 160),
      experienceSlug: '3-day-bwindi-gorilla-trek',
      guideSlug: matchedGuide.slug,
      guideName: matchedGuide.name,
      rating: Math.max(1, Math.min(5, Number(newRating) || 5)),
      title: newTitle.trim().slice(0, 200),
      text: newText.trim().slice(0, 1500),
      date: 'November 2026',
      partyType: 'Verified Safari Guest',
      status: 'published',
      authorId: auth.currentUser?.uid || 'guest',
    };

    try {
      if (auth.currentUser) {
        const docPath = `testimonials/${cleanId}`;
        await setDoc(doc(db, 'testimonials', cleanId), {
          id: newReview.id,
          guestName: newReview.guestName,
          country: newReview.country,
          destination: newReview.destination,
          experienceSlug: newReview.experienceSlug,
          guideSlug: newReview.guideSlug,
          guideName: newReview.guideName,
          rating: newReview.rating,
          title: newReview.title,
          text: newReview.text,
          date: newReview.date,
          partyType: newReview.partyType,
          status: 'published',
          authorId: auth.currentUser.uid,
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        });
      }

      setTestimonials((prev) => [newReview, ...prev]);
      setActiveIndex(0);
      setSubmitFeedback('Your safari testimonial has been saved and published to the carousel.');
      setNewGuestName('');
      setNewCountry('');
      setNewTitle('');
      setNewText('');
      setTimeout(() => {
        setShowAddModal(false);
        setSubmitFeedback(null);
      }, 1400);
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentReview =
    filteredTestimonials[activeIndex] || filteredTestimonials[0] || SAMPLE_REVIEWS[0];
  const currentGuide = GUIDES.find((g) => g.slug === currentReview?.guideSlug);
  const currentExperience = EXPERIENCES.find(
    (e) => e.slug === currentReview?.experienceSlug
  );
  const currentDestination = resolveDestinationLabel(currentReview);

  // Secondary cards for desktop 3-up view alongside the spotlight card
  const visibleTriplet = useMemo(() => {
    if (filteredTestimonials.length === 0) return [];
    const list: Review[] = [];
    const count = Math.min(3, filteredTestimonials.length);
    for (let i = 0; i < count; i++) {
      const idx = (activeIndex + i) % filteredTestimonials.length;
      list.push(filteredTestimonials[idx]);
    }
    return list;
  }, [filteredTestimonials, activeIndex]);

  return (
    <section
      aria-label="Client Testimonials Carousel"
      className="bg-[#144225] text-[#FAF7F2] border-y border-[#2E8550] py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Database className="w-3.5 h-3.5" />
              <span>{dataSourceLabel}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Client Testimonials Across Uganda
            </h2>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Verified ratings, client names, and safari destinations from travelers who explored Uganda with our named naturalists.
            </p>
          </div>

          {/* Destination Quick Filter + Carousel Arrows */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1B5632] p-1.5 rounded-lg border border-white/10">
              {[
                { id: 'all', label: 'All Destinations' },
                { id: 'Bwindi', label: 'Bwindi' },
                { id: 'Kibale', label: 'Kibale' },
                { id: 'Murchison', label: 'Murchison' },
                { id: 'Kidepo', label: 'Kidepo' },
                { id: 'Mabamba', label: 'Mabamba' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDestinationFilter(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    destinationFilter === tab.id
                      ? 'bg-[#D99B26] text-[#1A1612] font-bold'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous client testimonial"
                className="p-2.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-white border border-white/15 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-[#D99B26] px-2 tabular-nums">
                0{activeIndex + 1} / 0{filteredTestimonials.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next client testimonial"
                className="p-2.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-white border border-white/15 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Spotlight Featured Carousel Slide (25% Taller Vertically) */}
        {currentReview && (
          <div className="bg-[#1B5632] border border-[#D99B26]/40 rounded-xl p-8 sm:p-12 shadow-xl min-h-[370px] lg:min-h-[430px] flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch w-full">
              {/* Left 8 Columns: Star Rating, Destination Badge, Quote, Client Name */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 text-[#D99B26]"
                      aria-label={`Rated ${currentReview.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < currentReview.rating
                              ? 'fill-[#D99B26] text-[#D99B26]'
                              : 'text-white/25'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#FAF7F2] bg-[#144225] px-2.5 py-0.5 rounded border border-[#D99B26]/30">
                      {currentReview.rating.toFixed(1)} / 5.0 Verified
                    </span>
                  </div>

                  {/* Safari Destination Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#C85A28] text-white text-xs font-mono font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Destination: {currentDestination}</span>
                  </div>
                </div>

                <div className="relative">
                  <Quote className="w-8 h-8 text-[#D99B26]/30 mb-2" />
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                    “{currentReview.title}”
                  </h3>
                  <p className="text-sm sm:text-base text-[#E4DCCF] leading-relaxed mt-3">
                    {currentReview.text}
                  </p>
                </div>

                {/* Client Name, Country & Travel Date */}
                <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-serif text-xl font-bold text-white">
                      {currentReview.guestName}
                    </div>
                    <div className="text-xs font-mono text-[#D99B26]">
                      {currentReview.country} • {currentReview.partyType} • Traveled{' '}
                      {currentReview.date}
                    </div>
                  </div>

                  {currentExperience && (
                    <Link
                      to={`/experiences/${currentExperience.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FAF7F2] hover:text-[#D99B26] bg-[#144225] px-3.5 py-2 rounded-md border border-white/15 transition-colors"
                    >
                      <span>Safari Route: {currentExperience.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Right 4 Columns: Named Ugandan Guide Card */}
              <div className="lg:col-span-4 bg-[#144225] border border-white/15 rounded-xl p-5 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#D99B26] font-semibold">
                  Led by Named Ugandan Specialist
                </div>

                {currentGuide ? (
                  <>
                    <div className="flex items-center gap-3.5">
                      <SmartImage
                        src={currentGuide.photo}
                        alt={currentGuide.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#D99B26]"
                      />
                      <div>
                        <h4 className="font-serif text-2xl font-bold text-white">
                          {currentGuide.name}
                        </h4>
                        <div className="text-xs font-mono text-[#D6CEC2]">
                          Home Region: {currentGuide.homeRegion}
                        </div>
                        <div className="text-xs font-mono text-[#D99B26] mt-0.5">
                          {currentGuide.yearsExperience} Years Guiding in Uganda
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#D6CEC2] leading-relaxed">
                      {currentGuide.tagline}
                    </p>

                    <Link
                      to={`/guides/${currentGuide.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#2E8550] text-white text-xs font-semibold px-4 py-2.5 rounded-md border border-white/15 transition-colors"
                    >
                      <span>Travel with {currentGuide.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <div className="text-xs text-[#D6CEC2]">
                    Guided by {currentReview.guideName || 'Enganda Specialist'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3-Card Carousel Strip Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleTriplet.map((rev) => {
            const dest = resolveDestinationLabel(rev);
            const isCurrent = rev.id === currentReview?.id;
            const idxInFiltered = filteredTestimonials.findIndex(
              (item) => item.id === rev.id
            );

            return (
              <button
                key={rev.id}
                type="button"
                onClick={() => {
                  if (idxInFiltered >= 0) setActiveIndex(idxInFiltered);
                }}
                className={`text-left p-6 sm:p-7 min-h-[220px] rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-5 ${
                  isCurrent
                    ? 'bg-[#FAF7F2] text-[#1A1612] border-[#D99B26] shadow-md'
                    : 'bg-[#1B5632]/70 text-[#FAF7F2] border-white/15 hover:bg-[#1B5632]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-[#D99B26]">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-[#D99B26]" />
                      ))}
                    </div>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded truncate max-w-[180px] ${
                        isCurrent
                          ? 'bg-[#226B3E]/10 text-[#226B3E] font-semibold'
                          : 'bg-[#144225] text-[#D99B26]'
                      }`}
                    >
                      {dest}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold line-clamp-1">
                    “{rev.title}”
                  </h4>

                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isCurrent ? 'text-[#5A5248]' : 'text-[#D6CEC2]'
                    }`}
                  >
                    {rev.text}
                  </p>
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    isCurrent
                      ? 'border-[#E4DCCF] text-[#1A1612]'
                      : 'border-white/10 text-white'
                  }`}
                >
                  <span className="font-semibold">
                    {rev.guestName}{' '}
                    <span className="font-normal opacity-75">({rev.country})</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#C85A28] font-semibold">
                    {rev.date}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Bar: Slide Dots + Add Review + Link to All Reviews */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            {filteredTestimonials.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View testimonial ${idx + 1} from ${item.guestName}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 bg-[#D99B26]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D99B26] hover:text-white cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Your Uganda Safari Story</span>
            </button>

            <Link
              to="/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#D99B26]"
            >
              <span>Browse All Guest Stories &amp; Guide Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Modal to Submit a New Client Testimonial to Database */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F2] text-[#1A1612] border border-[#E4DCCF] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-semibold">
                    Firestore Client Testimonials
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                    Share Your Uganda Safari Review
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-md text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTestimonial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="e.g. Sarah & James Miller"
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Uganda Safari Destination *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      placeholder="e.g. Bwindi & Queen Elizabeth NP"
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Your Ugandan Guide
                    </label>
                    <select
                      value={newGuideSlug}
                      onChange={(e) => setNewGuideSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                    >
                      {GUIDES.map((g) => (
                        <option key={g.slug} value={g.slug}>
                          {g.name} ({g.homeRegion})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Star Rating
                    </label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm font-mono"
                    >
                      <option value={5}>5 Stars (★★★★★)</option>
                      <option value={4}>4 Stars (★★★★☆)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Unforgettable gorilla trek in Bwindi"
                      className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Share how your Enganda guide shaped your experience in Uganda..."
                    className="w-full px-3 py-2 rounded border border-[#D6CEC2] bg-white text-sm"
                  />
                </div>

                {submitFeedback && (
                  <div className="p-3 rounded bg-[#226B3E]/10 border border-[#226B3E] text-xs text-[#144225] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#226B3E]" />
                    <span>{submitFeedback}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded border border-[#D6CEC2] text-xs font-semibold text-[#5A5248] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                  >
                    {submittingReview ? 'Saving...' : 'Publish Testimonial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
