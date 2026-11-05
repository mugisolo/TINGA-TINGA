import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
  Users,
  Calendar,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Star,
} from 'lucide-react';
import {
  GUIDES,
  DESTINATIONS,
  EXPERIENCES,
  SPECIALTY_LABELS,
  AVAILABILITY_PROMISE,
  PERMIT_RECEIPT_GUARANTEE,
  getWhatsAppUrl,
} from '../data/seedData';
import { Specialty, ComfortTier } from '../types';
import { formatPrice } from '../lib/currency';
import { useInquiry } from '../context/InquiryContext';
import { SmartImage } from '../components/SmartImage';
import { SEO } from '../components/SEO';
import { SafariItineraryGenerator } from '../components/SafariItineraryGenerator';

const ALL_SPECIALTIES = Object.keys(SPECIALTY_LABELS) as Specialty[];

export const TripPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currency, submitLead } = useInquiry();

  const preselectedGuide = searchParams.get('guide') || '';
  const preselectedExperience = searchParams.get('experience') || '';

  const [step, setStep] = useState<number>(1);
  const [interests, setInterests] = useState<Specialty[]>(['gorillas', 'chimps']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    'Bwindi & Mgahinga',
    'Kibale Forest',
  ]);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [partySize, setPartySize] = useState<number>(2);
  const [targetDates, setTargetDates] = useState<string>('');
  const [budgetTier, setBudgetTier] = useState<ComfortTier>('luxury');
  const [preferredGuideSlug, setPreferredGuideSlug] = useState<string>(preselectedGuide);
  const [experienceSlug, setExperienceSlug] = useState<string>(preselectedExperience);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedGuide) {
      setPreferredGuideSlug(preselectedGuide);
    }
    if (preselectedExperience) {
      setExperienceSlug(preselectedExperience);
      const found = EXPERIENCES.find((e) => e.slug === preselectedExperience);
      if (found) {
        setDurationDays(found.durationDays);
        setSelectedRegions(found.regions);
        setInterests(found.interests);
      }
    }
  }, [preselectedGuide, preselectedExperience]);

  const toggleInterest = (spec: Specialty) => {
    setInterests((prev) =>
      prev.includes(spec) ? prev.filter((item) => item !== spec) : [...prev, spec]
    );
  };

  const toggleRegion = (regName: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regName)
        ? prev.filter((item) => item !== regName)
        : [...prev, regName]
    );
  };

  // Indicative price band calculation
  const dailyRateUSD =
    budgetTier === 'mid-range' ? 390 : budgetTier === 'signature' ? 890 : 590;
  const permitEstimateUSD =
    (interests.includes('gorillas') || selectedRegions.includes('Bwindi & Mgahinga')
      ? 800
      : 0) +
    (interests.includes('chimps') || selectedRegions.includes('Kibale Forest')
      ? 250
      : 0);
  const lowEstimateUSD = durationDays * dailyRateUSD + permitEstimateUSD;
  const highEstimateUSD = Math.round(lowEstimateUSD * 1.18);

  const selectedGuideObj = GUIDES.find((g) => g.slug === preferredGuideSlug);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const created = await submitLead({
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || 'Not provided',
        partySize,
        targetDates: targetDates.trim() || 'Flexible 2026/2027',
        budgetTier,
        interests,
        regions: selectedRegions,
        durationDays,
        preferredGuideSlug: preferredGuideSlug || undefined,
        experienceSlug: experienceSlug || undefined,
        notes: notes.trim(),
      });
      setSubmittedLeadId(created.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Interactive Uganda Safari Trip Planner & Guide Matcher | Enganda Safaris"
        description="Design your custom Uganda safari step-by-step: choose your wildlife interests, Uganda regions, duration, comfort tier, and optional preferred Ugandan guide."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-6 sm:p-10 border border-[#2E8550]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D99B26] uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Enganda Custom Safari Designer • Entebbe Coordination</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-1">
                Design Your Uganda Safari & Choose Your Guide
              </h1>
            </div>
            <div className="bg-[#1B5632] border border-[#34945A] rounded-md px-4 py-3 text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D99B26] block">
                Indicative Price Band ({budgetTier})
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-white">
                {formatPrice(lowEstimateUSD, currency)} – {formatPrice(highEstimateUSD, currency)}
              </span>
              <span className="text-[11px] text-[#D6CEC2] block">per person ({durationDays} days)</span>
            </div>
          </div>
        </div>

        {submittedLeadId ? (
          <div className="bg-white border-2 border-[#2D6A4F] rounded-lg p-8 sm:p-12 text-center space-y-6">
            <div className="w-14 h-14 rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="font-mono text-xs uppercase tracking-wider text-[#2D6A4F] font-semibold">
                Inquiry Reference: {submittedLeadId}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612]">
                A Real Enganda Coordinator Replies Within 12 Hours
              </h2>
              <p className="text-sm text-[#5A5248] leading-relaxed">
                Thank you, <strong className="text-[#1A1612]">{name}</strong>. Your custom {durationDays}-day Uganda safari brief has been logged with our head office in Bugonga, Entebbe. {AVAILABILITY_PROMISE}
              </p>
            </div>

            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-5 max-w-lg mx-auto text-left text-xs space-y-2">
              <div className="font-mono uppercase text-[#C85A28] font-semibold">
                Your Safari Brief Summary
              </div>
              <div>
                <strong>Duration & Party:</strong> {durationDays} Days • {partySize} Guests • Target Dates: {targetDates || 'Flexible'}
              </div>
              <div>
                <strong>Uganda Regions:</strong> {selectedRegions.join(', ') || 'Custom Uganda route'}
              </div>
              <div>
                <strong>Comfort Tier:</strong> <span className="capitalize">{budgetTier}</span> ({formatPrice(lowEstimateUSD, currency)} – {formatPrice(highEstimateUSD, currency)} pp)
              </div>
              <div>
                <strong>Preferred Ugandan Guide:</strong>{' '}
                {selectedGuideObj
                  ? `${selectedGuideObj.name} (${selectedGuideObj.homeRegion})`
                  : 'Match me with the best available specialist'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={getWhatsAppUrl(
                  `Oli otya Enganda team! I just completed the Trip Planner (Ref ${submittedLeadId}: ${durationDays} days, ${partySize} guests, ${budgetTier} tier${
                    selectedGuideObj ? `, preferred guide: ${selectedGuideObj.name}` : ''
                  }).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-sm font-semibold px-6 py-3.5 rounded-md transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#D99B26]" />
                <span>Chat With Entebbe Coordinator on WhatsApp</span>
              </a>

              <Link
                to="/guides"
                className="inline-flex items-center gap-2 border border-[#226B3E] text-[#226B3E] hover:bg-[#F3ECE1] text-sm font-semibold px-6 py-3.5 rounded-md transition-colors"
              >
                <span>Explore Guide Profiles</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 sm:p-8 space-y-8">
            {/* Step Progress Indicator */}
            <div className="grid grid-cols-6 gap-2 border-b border-[#E4DCCF] pb-5">
              {[
                { num: 1, label: 'Interests' },
                { num: 2, label: 'Regions' },
                { num: 3, label: 'Duration' },
                { num: 4, label: 'Comfort' },
                { num: 5, label: 'Guide' },
                { num: 6, label: 'Confirm' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`text-left p-2 rounded-md border transition-colors cursor-pointer ${
                    step === s.num
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                      : step > s.num
                      ? 'bg-[#F3ECE1] text-[#226B3E] border-[#E4DCCF]'
                      : 'bg-[#FAF7F2] text-[#5A5248] border-[#E4DCCF]'
                  }`}
                >
                  <span className="font-mono text-[10px] block opacity-80">0{s.num}</span>
                  <span className="text-xs font-semibold truncate block">{s.label}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: Interests */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                    Step 01 of 06
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                    What Wildlife & Experiences Call to You?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                    Select one or more specialties so we can match the right Ugandan naturalist.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {ALL_SPECIALTIES.map((spec) => {
                    const active = interests.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleInterest(spec)}
                        className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                            : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div className="font-serif text-xl font-bold">
                          {SPECIALTY_LABELS[spec]}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            active ? 'text-[#D6CEC2]' : 'text-[#5A5248]'
                          }`}
                        >
                          {active ? 'Selected for your safari' : 'Click to include'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Uganda Regions */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                    Step 02 of 06
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                    Which Uganda Regions Would You Like to Visit?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                    Every Enganda itinerary stays strictly within Uganda. Select the parks and regions you want in your route.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {DESTINATIONS.map((dest) => {
                    const active = selectedRegions.includes(dest.name);
                    return (
                      <button
                        key={dest.slug}
                        type="button"
                        onClick={() => toggleRegion(dest.name)}
                        className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                            : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-lg font-bold">{dest.name}</span>
                          <MapPin
                            className={`w-4 h-4 ${
                              active ? 'text-[#D99B26]' : 'text-[#C85A28]'
                            }`}
                          />
                        </div>
                        <p
                          className={`text-xs mt-1 line-clamp-2 ${
                            active ? 'text-[#D6CEC2]' : 'text-[#5A5248]'
                          }`}
                        >
                          {dest.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Duration & Party Size */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                    Step 03 of 06
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                    Safari Duration, Group Size & Target Dates
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-5 space-y-3">
                    <label className="block text-xs font-mono uppercase text-[#1A1612] font-semibold">
                      Duration: <span className="text-[#C85A28] text-base">{durationDays} Days</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={14}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full accent-[#226B3E] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#5A5248]">
                      <span>1 Day (Mabamba)</span>
                      <span>7 Days</span>
                      <span>14 Days</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-5 space-y-3">
                    <label className="block text-xs font-mono uppercase text-[#1A1612] font-semibold">
                      <Users className="w-3.5 h-3.5 inline mr-1 text-[#C85A28]" />
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={partySize}
                      onChange={(e) =>
                        setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-base font-mono text-[#1A1612]"
                    />
                    <p className="text-[11px] text-[#5A5248]">
                      Private 4x4 Land Cruiser with pop-up roof accommodates up to 6 window-seat guests per vehicle.
                    </p>
                  </div>

                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-5 space-y-3">
                    <label className="block text-xs font-mono uppercase text-[#1A1612] font-semibold">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#C85A28]" />
                      Target Travel Window
                    </label>
                    <input
                      type="text"
                      value={targetDates}
                      onChange={(e) => setTargetDates(e.target.value)}
                      placeholder="e.g. November 2026 or July 2027"
                      className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612]"
                    />
                    <p className="text-[11px] text-[#2D6A4F]">
                      Tip: April, May & November offer US$600 low-season UWA gorilla permits.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Comfort Tier */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                    Step 04 of 06
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                    Select Your Lodge Comfort Tier
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(
                    [
                      {
                        tier: 'mid-range' as ComfortTier,
                        title: 'Mid-Range Eco-Lodges',
                        desc: 'Handpicked forest-edge and riverfront cottages with en-suite hot showers, private verandas, and warm Ugandan hospitality.',
                        examples: 'Ichumbi Gorilla Lodge, Turaco Treetops, Pakuba Safari Lodge',
                      },
                      {
                        tier: 'luxury' as ComfortTier,
                        title: 'Luxury Wilderness Sanctuaries',
                        desc: 'Intimate luxury lodges set inside or bordering the parks with panoramic decks, fine dining, and fireplace lounges.',
                        examples: 'Buhoma Lodge, Mahogany Springs, Primate Lodge, Paraa Safari Lodge',
                      },
                      {
                        tier: 'signature' as ComfortTier,
                        title: 'Signature Premier Camps',
                        desc: 'Uganda’s flagship architectural lodges and private sanctuaries with butler service and optional domestic bush flights.',
                        examples: 'Sanctuary Gorilla Forest Camp, Clouds Mountain Gorilla Lodge, Nile Safari Lodge',
                      },
                    ]
                  ).map((item) => {
                    const active = budgetTier === item.tier;
                    return (
                      <button
                        key={item.tier}
                        type="button"
                        onClick={() => setBudgetTier(item.tier)}
                        className={`p-6 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          active
                            ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                            : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div className="space-y-2">
                          <span
                            className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                              active ? 'text-[#D99B26]' : 'text-[#C85A28]'
                            }`}
                          >
                            {item.tier}
                          </span>
                          <h3 className="font-serif text-2xl font-bold">{item.title}</h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-current/15 text-[11px] opacity-85">
                          <strong>Examples:</strong> {item.examples}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Optional Preferred Guide */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                      Step 05 of 06 • The Guide Is The Product
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                      Select an Optional Preferred Ugandan Guide
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                      Choose the specific guide you want to lead your safari, or leave it open for our Entebbe desk to match you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferredGuideSlug('')}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold border cursor-pointer ${
                      preferredGuideSlug === ''
                        ? 'bg-[#C85A28] text-white border-[#C85A28]'
                        : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF]'
                    }`}
                  >
                    Let Entebbe Desk Match Best Guide
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {GUIDES.map((g) => {
                    const active = preferredGuideSlug === g.slug;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPreferredGuideSlug(g.slug)}
                        className={`p-4 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] shadow-md'
                            : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2.5">
                            <SmartImage
                              src={g.photo}
                              alt={g.name}
                              className="w-11 h-11 rounded-full object-cover border border-[#C85A28]"
                            />
                            <div className="min-w-0">
                              <div className="font-serif text-lg font-bold truncate">
                                {g.name}
                              </div>
                              <div
                                className={`text-[11px] font-mono truncate ${
                                  active ? 'text-[#D99B26]' : 'text-[#5A5248]'
                                }`}
                              >
                                {g.homeRegion}
                              </div>
                            </div>
                          </div>
                          <p
                            className={`text-xs line-clamp-2 ${
                              active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                            }`}
                          >
                            {g.tagline}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-current/15 flex items-center justify-between text-[11px] font-mono">
                          <span>{g.yearsExperience} yrs exp</span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#D99B26] fill-[#D99B26]" />
                            {g.rating.toFixed(1)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: Contact Details & Final Submission */}
            {step === 6 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                    Step 06 of 06 • Entebbe Coordination Desk
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                    Where Should We Send Your Custom Safari Proposal?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                    {AVAILABILITY_PROMISE}
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-mono uppercase text-[#5A5248] block">
                      Route & Duration
                    </span>
                    <strong className="text-[#1A1612] text-sm">
                      {durationDays} Days • {partySize} Travelers
                    </strong>
                    <div className="text-[#5A5248] mt-0.5">
                      {selectedRegions.join(', ')}
                    </div>
                  </div>

                  <div>
                    <span className="font-mono uppercase text-[#5A5248] block">
                      Preferred Guide
                    </span>
                    <strong className="text-[#1A1612] text-sm">
                      {selectedGuideObj
                        ? `${selectedGuideObj.name} (${selectedGuideObj.homeRegion})`
                        : 'Best Matched Enganda Specialist'}
                    </strong>
                  </div>

                  <div>
                    <span className="font-mono uppercase text-[#5A5248] block">
                      Indicative Price Band ({budgetTier})
                    </span>
                    <strong className="text-[#226B3E] font-mono text-sm">
                      {formatPrice(lowEstimateUSD, currency)} – {formatPrice(highEstimateUSD, currency)} pp
                    </strong>
                    <div className="text-[11px] text-[#5A5248]">
                      Includes private 4x4 & UWA permits
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Eleanor Vance"
                      className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+44 7700 900000"
                      className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                    Additional Notes (Gorilla Habituation, Birding Targets, Dietary Needs)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share any special requests for your guide and our Entebbe team..."
                    className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                  />
                </div>

                <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3.5 flex items-center gap-2 text-xs text-[#5A5248]">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
                  <span>
                    {PERMIT_RECEIPT_GUARANTEE} A real Enganda coordinator replies within 12 hours.
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-8 py-3.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>{submitting ? 'Sending Brief...' : 'Submit My Uganda Safari Brief'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Navigation Footer Controls */}
            <div className="pt-4 border-t border-[#E4DCCF] flex items-center justify-between">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E4DCCF] text-xs font-semibold text-[#1A1612] disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>

              {step < 6 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(6, s + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bespoke Custom Safari Itinerary Generator (Save to Wallet) */}
      <div className="mt-16">
        <SafariItineraryGenerator />
      </div>
    </div>
  );
};
