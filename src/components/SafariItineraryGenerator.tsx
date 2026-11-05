import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Loader2,
  BookmarkCheck,
  Utensils,
  Car,
  Star,
} from 'lucide-react';
import { ComfortTier, GeneratedSafariItinerary } from '../types';
import { DESTINATIONS, GUIDES } from '../data/seedData';
import { useWallet } from '../context/WalletContext';
import { useInquiry } from '../context/InquiryContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../lib/currency';
import { SmartImage } from './SmartImage';

const REGION_OPTIONS = [
  'Bwindi & Mgahinga + Lake Bunyonyi',
  'Kibale Forest & Queen Elizabeth NP',
  'Murchison Falls NP & Ziwa Rhino Sanctuary',
  'Kidepo Valley NP & Northern Karamoja',
  'Bwindi, Kibale & Queen Elizabeth Primate Circuit',
  'Entebbe, Mabamba Swamp & Jinja Source of the Nile',
  'Rwenzori Foothills & Semuliki Valley',
  ...DESTINATIONS.map((d) => d.name),
];

const ACTIVITY_OPTIONS = [
  { id: 'Mountain Gorilla Trekking', label: 'Mountain Gorilla Trekking', category: 'Trekking' },
  { id: 'Chimpanzee Tracking & Habituation', label: 'Chimpanzee Tracking', category: 'Trekking' },
  { id: 'Big Game Savanna & Kazinga/Nile Boat', label: 'Big Game & Boat Safaris', category: 'Wildlife' },
  { id: 'Shoebill & Albertine Rift Birding', label: 'Shoebill & Birding', category: 'Wildlife' },
  { id: 'Batwa & Karamojong Cultural Encounters', label: 'Cultural Encounters', category: 'Cultural' },
  { id: 'Volcano, Crater & Rwenzori Hiking', label: 'Crater & Peak Hiking', category: 'Trekking' },
  { id: 'Golden-Hour Wildlife Photography', label: 'Wildlife Photography', category: 'Wildlife' },
];

const BUDGET_TIERS: {
  id: ComfortTier;
  label: string;
  rateHint: string;
  lodgeStyle: string;
}[] = [
  {
    id: 'mid-range',
    label: 'Mid-Range Eco-Lodges',
    rateHint: '~$390/day + UWA permits',
    lodgeStyle: 'Handpicked forest cottages & riverfront eco-camps',
  },
  {
    id: 'luxury',
    label: 'Luxury Sanctuaries',
    rateHint: '~$590/day + UWA permits',
    lodgeStyle: 'Intimate park-edge luxury lodges & private decks',
  },
  {
    id: 'signature',
    label: 'Signature Premier Camps',
    rateHint: '~$890/day + UWA permits',
    lodgeStyle: 'Flagship architectural sanctuaries & private charters',
  },
];

export const SafariItineraryGenerator: React.FC = () => {
  const { currency, openInquiryModal } = useInquiry();
  const { language, t } = useLanguage();
  const {
    availableBalanceUSD,
    savedItineraries,
    saveCustomItineraryToWallet,
    paySavedItineraryDeposit,
  } = useWallet();

  const [region, setRegion] = useState<string>(REGION_OPTIONS[0]);
  const [budgetTier, setBudgetTier] = useState<ComfortTier>('luxury');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Mountain Gorilla Trekking',
    'Big Game Savanna & Kazinga/Nile Boat',
  ]);
  const [durationDays, setDurationDays] = useState<number>(5);
  const [partySize, setPartySize] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] =
    useState<GeneratedSafariItinerary | null>(null);
  const [walletStatusBanner, setWalletStatusBanner] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.length > 1 ? prev.filter((a) => a !== activityId) : prev;
      }
      return [...prev, activityId];
    });
  };

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setWalletStatusBanner(null);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          budgetTier,
          activities: selectedActivities,
          durationDays,
          partySize,
          specialRequests: specialRequests.trim(),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate custom Uganda safari itinerary.');
      }

      const data: GeneratedSafariItinerary = await response.json();
      setGeneratedPlan(data);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Unable to reach the Entebbe Expedition Architect right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isSavedInWallet = generatedPlan
    ? savedItineraries.some(
        (item) =>
          item.id === generatedPlan.id ||
          item.referenceCode === generatedPlan.referenceCode
      )
    : false;

  const savedWalletItem = generatedPlan
    ? savedItineraries.find(
        (item) =>
          item.id === generatedPlan.id ||
          item.referenceCode === generatedPlan.referenceCode
      )
    : undefined;

  const handleSaveToWallet = () => {
    if (!generatedPlan) return;
    const res = saveCustomItineraryToWallet(generatedPlan);
    setWalletStatusBanner({
      type: res.alreadySaved ? 'info' : 'success',
      text: res.message,
    });
  };

  const handlePayDepositFromWallet = () => {
    if (!generatedPlan) return;
    // Ensure saved first
    const savedRes = saveCustomItineraryToWallet(generatedPlan);
    const payRes = paySavedItineraryDeposit(savedRes.savedItinerary.id);
    setWalletStatusBanner({
      type: payRes.ok ? 'success' : 'error',
      text: payRes.message,
    });
  };

  const matchedGuideProfile = generatedPlan
    ? GUIDES.find((g) => g.slug === generatedPlan.matchedGuideSlug) || GUIDES[0]
    : null;

  return (
    <section
      id="safari-itinerary-generator"
      aria-label={t.generator.title}
      className="py-16 bg-[#F3ECE1] border-y border-[#E4DCCF]"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#226B3E] text-[#FAF7F2] text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{t.generator.badge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1612]">
              {t.generator.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
              {t.generator.subtitle}{' '}
              <Link
                to="/wallet"
                className="text-[#226B3E] font-semibold underline hover:text-[#C85A28]"
              >
                Enganda {t.nav.safariWallet}
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg px-4 py-3 shrink-0">
            <Wallet className="w-5 h-5 text-[#226B3E]" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248]">
                {t.generator.walletBalanceLabel}
              </div>
              <div className="font-mono text-sm font-bold text-[#1A1612] tabular-nums">
                {formatPrice(availableBalanceUSD, currency)}{' '}
                <span className="text-xs font-normal text-[#5A5248]">
                  ({savedItineraries.length} {t.generator.savedPlansCount})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Form Card */}
        <form
          onSubmit={handleGenerateItinerary}
          className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Uganda Region */}
            <div className="lg:col-span-5 space-y-2">
              <label
                htmlFor="custom-gen-region"
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#1A1612] font-semibold"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C85A28]" />
                {t.generator.step1Region}
              </label>
              <select
                id="custom-gen-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white border border-[#D6CEC2] rounded-md px-3.5 py-2.5 text-sm text-[#1A1612] font-medium focus:outline-none focus:border-[#226B3E]"
              >
                {Array.from(new Set(REGION_OPTIONS)).map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#5A5248]">
                {t.generator.step1Hint}
              </p>
            </div>

            {/* 2. Duration & Travelers */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="custom-gen-days"
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#1A1612] font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#226B3E]" />
                  {t.generator.step2Duration}{' '}
                  <span className="text-[#C85A28]">
                    {durationDays} {t.generator.daysUnit}
                  </span>
                </label>
                <span className="font-mono text-xs text-[#5A5248]">
                  2–10 {t.generator.daysUnit}
                </span>
              </div>
              <input
                id="custom-gen-days"
                type="range"
                min={2}
                max={10}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-[#226B3E] cursor-pointer mt-1"
              />
              <div className="flex items-center gap-2 pt-1">
                {[3, 5, 7, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                      durationDays === d
                        ? 'bg-[#226B3E] text-white border-[#226B3E]'
                        : 'bg-[#F3ECE1] text-[#1A1612] border-[#E4DCCF]'
                    }`}
                  >
                    {d} {t.generator.daysUnit}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Party Size */}
            <div className="lg:col-span-3 space-y-2">
              <label
                htmlFor="custom-gen-party"
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#1A1612] font-semibold"
              >
                <Users className="w-3.5 h-3.5 text-[#226B3E]" />
                {t.generator.step3Travelers}
              </label>
              <input
                id="custom-gen-party"
                type="number"
                min={1}
                max={12}
                value={partySize}
                onChange={(e) =>
                  setPartySize(Math.max(1, Math.min(12, Number(e.target.value) || 1)))
                }
                className="w-full bg-white border border-[#D6CEC2] rounded-md px-3.5 py-2.5 font-mono text-sm font-bold text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
              />
              <p className="text-[11px] text-[#5A5248]">
                {t.generator.step3Hint}
              </p>
            </div>
          </div>

          {/* 4. Budget / Comfort Tier Selector */}
          <div className="space-y-2.5 pt-2 border-t border-[#E4DCCF]">
            <label className="block font-mono text-xs uppercase tracking-wider text-[#1A1612] font-semibold">
              {t.generator.step4Budget}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {BUDGET_TIERS.map((tierOption) => {
                const active = budgetTier === tierOption.id;
                return (
                  <button
                    key={tierOption.id}
                    type="button"
                    onClick={() => setBudgetTier(tierOption.id)}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] shadow-sm'
                        : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-lg font-bold">
                        {tierOption.label}
                      </span>
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                          active
                            ? 'bg-[#FAF7F2]/20 text-[#D99B26]'
                            : 'bg-[#F3ECE1] text-[#C85A28]'
                        }`}
                      >
                        {tierOption.rateHint}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                      }`}
                    >
                      {tierOption.lodgeStyle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Activity Preferences */}
          <div className="space-y-2.5 pt-2 border-t border-[#E4DCCF]">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-wider text-[#1A1612] font-semibold">
                {t.generator.step5Activities}
              </label>
              <span className="font-mono text-[11px] text-[#5A5248]">
                {selectedActivities.length} {t.generator.selectedCount}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((act) => {
                const active = selectedActivities.includes(act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => toggleActivity(act.id)}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#1A1612] text-[#FAF7F2] border-[#1A1612]'
                        : 'bg-white text-[#1A1612] border-[#D6CEC2] hover:border-[#226B3E]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
                        active
                          ? 'bg-[#C85A28] text-white'
                          : 'bg-[#F3ECE1] text-[#5A5248]'
                      }`}
                    >
                      {act.category}
                    </span>
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Special Requests + Generate CTA */}
          <div className="pt-2 border-t border-[#E4DCCF] flex flex-col md:flex-row items-stretch md:items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="custom-gen-notes"
                className="block font-mono text-xs uppercase tracking-wider text-[#5A5248] mb-1.5"
              >
                {t.generator.step6Notes}
              </label>
              <input
                id="custom-gen-notes"
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={t.generator.notesPlaceholder}
                className="w-full bg-white border border-[#D6CEC2] rounded-md px-3.5 py-2.5 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] disabled:opacity-60 text-white font-semibold text-sm px-7 py-3 rounded-md transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.generator.generatingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
                  <span>{t.generator.generateBtn}</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-md bg-[#C85A28]/10 border border-[#C85A28] text-xs text-[#9E3F16] font-medium">
              {errorMessage}
            </div>
          )}
        </form>

        {/* Generated Itinerary Output */}
        {generatedPlan && (
          <div className="bg-white border-2 border-[#226B3E] rounded-xl overflow-hidden shadow-md space-y-0">
            {/* Top Result Header */}
            <div className="bg-[#144225] text-[#FAF7F2] p-6 sm:p-8 border-b border-[#2E8550]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#D99B26] text-[#1A1612] font-mono text-xs font-bold">
                      {generatedPlan.referenceCode}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#226B3E] text-[#FAF7F2] font-mono text-xs uppercase">
                      {generatedPlan.durationDays} {t.generator.daysUnit} •{' '}
                      {generatedPlan.budgetTier}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/10 text-[#E4DCCF] font-mono text-xs">
                      {generatedPlan.partySize}{' '}
                      {generatedPlan.partySize === 1 ? 'Traveler' : 'Travelers'}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                    {generatedPlan.title}
                  </h3>
                  <p className="text-sm text-[#D6CEC2] leading-relaxed">
                    {generatedPlan.subtitle}
                  </p>
                </div>

                {/* Pricing & Save to Wallet Box */}
                <div className="bg-[#1B5632] border border-[#D99B26]/40 rounded-xl p-5 min-w-[280px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase text-[#D6CEC2]">
                      Estimated Rate / Person
                    </span>
                    <span className="font-mono text-xl font-bold text-[#D99B26] tabular-nums">
                      {formatPrice(generatedPlan.estimatedPerPersonUSD, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2">
                    <span className="text-[#E4DCCF]">
                      30% Wallet Deposit ({generatedPlan.partySize}):
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatPrice(generatedPlan.depositAmountUSD, currency)}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveToWallet}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        isSavedInWallet
                          ? 'bg-[#D99B26] text-[#1A1612]'
                          : 'bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#144225]'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      <span>
                        {isSavedInWallet
                          ? t.generator.savedInWalletBtn
                          : t.generator.saveToWalletBtn}
                      </span>
                    </button>

                    {!savedWalletItem?.depositPaid ? (
                      <button
                        type="button"
                        onClick={handlePayDepositFromWallet}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>
                          {t.generator.payDepositBtn} (
                          {formatPrice(generatedPlan.depositAmountUSD, currency)})
                        </span>
                      </button>
                    ) : (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#226B3E] text-white text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
                        <span>{t.generator.depositPaidBadge}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {walletStatusBanner && (
                <div
                  className={`mt-5 p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs ${
                    walletStatusBanner.type === 'error'
                      ? 'bg-[#C85A28]/20 border-[#C85A28] text-white'
                      : 'bg-[#226B3E] border-[#D99B26]/50 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span>{walletStatusBanner.text}</span>
                  </div>
                  <Link
                    to="/wallet"
                    className="inline-flex items-center gap-1 font-mono uppercase tracking-wider text-[#D99B26] underline font-semibold"
                  >
                    <span>{t.nav.safariWallet}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Matched Guide + Permit & Partner Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 bg-[#FAF7F2] border-b border-[#E4DCCF]">
              {/* Matched Ugandan Guide Card */}
              <div className="lg:col-span-5 bg-white border border-[#E4DCCF] rounded-lg p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  {matchedGuideProfile && (
                    <SmartImage
                      src={matchedGuideProfile.photo}
                      alt={generatedPlan.matchedGuideName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#226B3E] shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-semibold">
                      {t.generator.matchedSpecialistTag}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#1A1612]">
                      {generatedPlan.matchedGuideName}
                    </h4>
                    {matchedGuideProfile && (
                      <div className="flex items-center gap-2 text-xs font-mono text-[#5A5248]">
                        <span>{matchedGuideProfile.homeRegion}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[#1A1612]">
                          <Star className="w-3.5 h-3.5 text-[#D99B26] fill-[#D99B26]" />
                          {matchedGuideProfile.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#5A5248] leading-relaxed">
                  {generatedPlan.matchedGuideReason}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E4DCCF]">
                  <Link
                    to={`/guides/${generatedPlan.matchedGuideSlug}`}
                    className="text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] inline-flex items-center gap-1"
                  >
                    <span>
                      {t.generator.viewProfile} ({generatedPlan.matchedGuideName})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      openInquiryModal({
                        guideSlug: generatedPlan.matchedGuideSlug,
                        defaultNotes: `Custom Safari Plan ${generatedPlan.referenceCode}: ${generatedPlan.title} (${generatedPlan.durationDays} days, ${generatedPlan.budgetTier} tier).`,
                      })
                    }
                    className="text-xs font-semibold text-[#C85A28] hover:underline cursor-pointer"
                  >
                    {t.generator.sendToEntebbe}
                  </button>
                </div>
              </div>

              {/* Permits & Partner Stays */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E4DCCF] rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#C85A28]" />
                    <span>{t.generator.includedPermitsTitle}</span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {generatedPlan.permitBreakdown.map((perm, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2 pb-2 border-b border-[#F3ECE1] last:border-none"
                      >
                        <span className="text-[#1A1612]">{perm.permitName}</span>
                        <span className="font-mono font-bold text-[#226B3E] shrink-0">
                          {formatPrice(perm.costUSD, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#E4DCCF] rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                    <Compass className="w-4 h-4 text-[#C85A28]" />
                    <span>{t.generator.recommendedPartnersTitle}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#1A1612]">
                    {generatedPlan.recommendedPartnerStays.map((lodge, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
                        <span>{lodge}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-[#5A5248] pt-1 border-t border-[#F3ECE1]">
                    {generatedPlan.conservationNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Day-by-Day Schedule */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-2xl font-bold text-[#1A1612]">
                  {t.generator.dayByDayTitle}
                </h4>
                <span className="font-mono text-xs text-[#5A5248]">
                  {t.generator.vehicleBadge}
                </span>
              </div>

              <div className="space-y-4">
                {generatedPlan.days.map((d) => (
                  <div
                    key={d.day}
                    className="border border-[#E4DCCF] rounded-lg p-5 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-xs font-bold">
                          DAY 0{d.day}
                        </span>
                        <div>
                          <h5 className="font-serif text-xl font-bold text-[#1A1612]">
                            {d.title}
                          </h5>
                          <span className="text-xs font-mono text-[#C85A28]">
                            {d.destination}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#5A5248]">
                        <span className="inline-flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-[#226B3E]" />
                          {d.driveTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-[#C85A28]" />
                          {d.meals}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                      <div className="bg-white p-3.5 rounded border border-[#E4DCCF]">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold block mb-1">
                          {t.generator.morningProgram}
                        </span>
                        <p className="text-[#1A1612]">{d.morningActivity}</p>
                      </div>
                      <div className="bg-white p-3.5 rounded border border-[#E4DCCF]">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-bold block mb-1">
                          {t.generator.afternoonProgram}
                        </span>
                        <p className="text-[#1A1612]">{d.afternoonActivity}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <span className="text-[#5A5248]">
                        <strong className="text-[#1A1612]">
                          {t.generator.overnightStay}
                        </strong>{' '}
                        {d.accommodation}
                      </span>
                      <span className="font-mono text-[11px] text-[#226B3E] bg-[#226B3E]/10 px-2.5 py-0.5 rounded">
                        {t.generator.keyWildlife} {d.wildlifeHighlight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
