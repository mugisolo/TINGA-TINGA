import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Currency, DestinationCountry, BudgetTier, Lead } from '../types';
import { ITINERARIES } from '../data/seedData';
import { formatPrice } from '../lib/currency';
import { trackEvent } from '../lib/analytics';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  MessageCircle, 
  DollarSign,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportSafariDocumentToDrive } from '../services/googleDrive';

interface TripPlannerPageProps {
  currency: Currency;
}

export const TripPlannerPage: React.FC<TripPlannerPageProps> = ({ currency }) => {
  const { user, accessToken, signInWithGoogle } = useAuth();
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const preselectedItinerarySlug = searchParams.get('itinerary');
  const preselectedTier = searchParams.get('tier') as BudgetTier | null;

  // Multi-step State (1: Countries, 2: Style & Tier, 3: Group & Season, 4: Interests, 5: Review & Lead)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCountries, setSelectedCountries] = useState<DestinationCountry[]>(['Tanzania']);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(preselectedTier || 'Luxury');
  const [daysCount, setDaysCount] = useState<number>(8);
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [season, setSeason] = useState<string>('Great Migration River Crossings (Jul - Oct)');
  const [interests, setInterests] = useState<string[]>([
    'Big Cat Tracking',
    'Private 4x4 Pop-Top Land Cruiser',
  ]);
  const [gorillaTracking, setGorillaTracking] = useState<boolean>(false);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Lead contact fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('planner_start');
    if (preselectedItinerarySlug) {
      const match = ITINERARIES.find((it) => it.slug === preselectedItinerarySlug);
      if (match) {
        setSelectedCountries(match.countries);
        setDaysCount(match.durationDays);
        if (match.gorillaPermitRequired) setGorillaTracking(true);
      }
    }
  }, [preselectedItinerarySlug]);

  const toggleCountry = (country: DestinationCountry) => {
    if (selectedCountries.includes(country)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter((c) => c !== country));
      }
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  // Dynamic price estimator calculation
  const getEstimatedPricePerPersonUSD = () => {
    let dailyBase = 580; // Mid-range
    if (budgetTier === 'Luxury') dailyBase = 890;
    if (budgetTier === 'Signature / Ultra-Luxe') dailyBase = 1450;

    // Cross-border or internal logistics multiplier
    if (selectedCountries.length > 1) dailyBase += 80;

    let total = dailyBase * daysCount;

    // Gorilla permit add-on
    if (gorillaTracking || selectedCountries.includes('Uganda')) {
      total += 800; // Uganda permit
    } else if (selectedCountries.includes('Rwanda')) {
      total += 1500; // Rwanda permit
    }

    return Math.round(total);
  };

  const estimatedTotalUSD = getEstimatedPricePerPersonUSD() * travelersCount;
  const depositRequiredUSD = Math.round(estimatedTotalUSD * 0.30);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    trackEvent('planner_complete', {
      countries: selectedCountries,
      tier: budgetTier,
      travelersCount,
      estimatedTotalUSD,
    });

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          status: 'new',
          source: 'trip_planner',
          travelersCount,
          budgetBand: budgetTier,
          countries: selectedCountries,
          interests: [
            ...interests,
            gorillaTracking ? 'Gorilla Trekking' : '',
            season,
          ].filter(Boolean),
          notes: `Safari Plan: ${daysCount} Days, Season: ${season}. Est total: $${estimatedTotalUSD} USD. Special notes: ${specialRequests}`,
          depositAmountUSD: depositRequiredUSD,
        }),
      });

      const data = await response.json();
      setSubmittedLeadId(data.id || 'lead_' + Date.now());
      setIsSubmitted(true);
    } catch (err) {
      // Graceful fallback
      setSubmittedLeadId('lead_' + Date.now());
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp deep link with detailed trip breakdown
  const getWhatsAppLeadLink = () => {
    const summary = `Jambo Akim! I just designed a safari on your website:
- Destination: ${selectedCountries.join(', ')}
- Duration: ${daysCount} days (${travelersCount} travelers)
- Tier: ${budgetTier}
- Season: ${season}
- Gorilla Trekking: ${gorillaTracking ? 'Yes (Include Permits)' : 'No'}
- Estimated Deposit: $${depositRequiredUSD} USD
My name is ${name || 'Guest'}. Can we discuss custom dates?`;

    return `https://wa.me/255784123456?text=${encodeURIComponent(summary)}`;
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Tailor-Made Safari Architect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Design Your Private East African Circuit
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Build your personalized route in 4 quick steps. Akim reviews every design and provides a formal itinerary with live lodge availability within 12 hours.
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 text-xs font-semibold">
          {[
            { num: 1, label: 'Destinations' },
            { num: 2, label: 'Style & Days' },
            { num: 3, label: 'Timing & Guests' },
            { num: 4, label: 'Interests' },
            { num: 5, label: 'Estimate & Book' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-colors ${
                  currentStep === s.num
                    ? 'bg-amber-600 text-stone-950 shadow-lg shadow-amber-900/50 ring-2 ring-amber-400'
                    : currentStep > s.num
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-900 text-stone-500 border border-stone-800'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden sm:inline ${currentStep === s.num ? 'text-amber-400' : 'text-stone-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body with Live Price Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Step Content (8 cols) */}
          <div className="lg:col-span-8 bg-stone-900/90 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-2xl">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Safari Architecture Received!
                </h3>
                <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                  Asante sana, <strong className="text-amber-400">{name}</strong>! Akim has received your route specifications for {selectedCountries.join(' & ')}.
                </p>

                <div className="bg-stone-950 p-5 rounded-xl border border-stone-800 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Duration:</span>
                    <span className="text-white font-medium">{daysCount} Days ({travelersCount} guests)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Accommodation Style:</span>
                    <span className="text-white font-medium">{budgetTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Estimated Total Band:</span>
                    <span className="text-amber-400 font-bold">{formatPrice(estimatedTotalUSD, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">30% Trip Deposit:</span>
                    <span className="text-emerald-400 font-bold">{formatPrice(depositRequiredUSD, currency)}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Akim will personally assemble your detailed day-by-day outline, route map, and lodge availability within 12 hours.
                </p>

                {driveSaveSuccess && (
                  <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-2.5 rounded-xl text-xs max-w-md mx-auto flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{driveSaveSuccess}</span>
                    <Link to="/drive" className="underline font-bold text-amber-400 ml-1">
                      View in Drive Vault
                    </Link>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={getWhatsAppLeadLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Akim immediately on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!accessToken) {
                        try {
                          await signInWithGoogle();
                        } catch (e) {
                          return;
                        }
                      }
                      setIsSavingToDrive(true);
                      try {
                        const docTitle = `Ganda_Safaris_${name.replace(/\s+/g, '_') || 'Guest'}_${daysCount}D`;
                        const docBody = `GANDA SAFARIS - CUSTOM EXPEDITION SPECIFICATION
Client: ${name || 'Prospective Traveler'} (${email})
Phone: ${phone || 'N/A'}
Contact Preference: ${preferredContact}
Headquarters: Arusha, Tanzania (P.O. Box 2751)

EXPEDITION DETAILS:
Selected Countries: ${selectedCountries.join(', ')}
Total Days: ${daysCount} Days
Number of Guests: ${travelersCount}
Tier / Style: ${budgetTier}
Travel Window: ${season}
Mountain Gorilla Tracking: ${gorillaTracking ? 'Yes (UWA/RDB Statutory Permits Required)' : 'No'}
Selected Interests: ${interests.join(', ')}
Special Notes: ${specialRequests || 'Standard Safari Architecture'}

ESTIMATED BUDGET:
Estimated Total: ${formatPrice(estimatedTotalUSD, currency)} (${currency})
Deposit Required (30%): ${formatPrice(depositRequiredUSD, currency)} (${currency})

Status: Lead generated via Ganda Safaris Platform.`;

                        await exportSafariDocumentToDrive(accessToken || '', docTitle, docBody);
                        setDriveSaveSuccess('Plan successfully archived to your Google Drive!');
                      } catch (err: any) {
                        alert(err.message || 'Failed to export to Google Drive');
                      } finally {
                        setIsSavingToDrive(false);
                      }
                    }}
                    disabled={isSavingToDrive}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-colors"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>{isSavingToDrive ? 'Saving to Drive...' : 'Save to Google Drive'}</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs text-center"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* STEP 1: Destinations */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        1. Select Countries & Focus
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Select one or combine multiple countries for a seamless cross-border circuit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(['Tanzania', 'Uganda', 'Rwanda', 'Kenya'] as DestinationCountry[]).map((c) => {
                        const isSelected = selectedCountries.includes(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => toggleCountry(c)}
                            className={`p-5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-amber-600/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-white">{c}</span>
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected ? 'bg-amber-600 text-stone-950' : 'border border-stone-700'
                                }`}
                              >
                                {isSelected ? '✓' : ''}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 leading-relaxed">
                              {c === 'Tanzania' && 'Serengeti Migration, Ngorongoro Crater, Tarangire Elephants, & Zanzibar beaches.'}
                              {c === 'Uganda' && 'Bwindi Mountain Gorillas ($800 permit), Kibale Chimps, Queen Elizabeth tree lions.'}
                              {c === 'Rwanda' && 'Volcanoes NP Gorillas ($1,500 permit), Golden Monkeys, Kigali Memorial & scenery.'}
                              {c === 'Kenya' && 'Maasai Mara big cats, Amboseli Kilimanjaro vistas, Samburu special five.'}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2"
                      >
                        <span>Continue to Style</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Style & Duration */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        2. Accommodation Style & Duration
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        We work with boutique eco-lodges and luxury tented camps.
                      </p>
                    </div>

                    {/* Tier selector */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                        Accommodation Category
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['Mid-Range', 'Luxury', 'Signature / Ultra-Luxe'] as BudgetTier[]).map((tier) => (
                          <button
                            type="button"
                            key={tier}
                            onClick={() => setBudgetTier(tier)}
                            className={`p-4 rounded-xl text-left border transition-all ${
                              budgetTier === tier
                                ? 'bg-amber-600/15 border-amber-500 ring-1 ring-amber-500'
                                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            <div className="text-xs font-bold text-white">{tier}</div>
                            <div className="text-[11px] text-amber-400 font-semibold mt-1">
                              {tier === 'Mid-Range' && '~$450 - $650 pp/day'}
                              {tier === 'Luxury' && '~$750 - $1,100 pp/day'}
                              {tier === 'Signature / Ultra-Luxe' && '~$1,300+ pp/day'}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-2">
                              {tier === 'Mid-Range' && 'High-comfort tented lodges, ensuite hot showers, authentic bush atmosphere.'}
                              {tier === 'Luxury' && 'Private plunge pools, gourmet bush dining, premium private concession locations.'}
                              {tier === 'Signature / Ultra-Luxe' && 'Singita, One&Only, bespoke charter flights, elite private butler service.'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Days count slider */}
                    <div className="space-y-3 pt-4 border-t border-stone-800">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          Total Safari Days
                        </label>
                        <span className="text-sm font-bold text-amber-400">{daysCount} Days ({daysCount - 1} Nights)</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="21"
                        value={daysCount}
                        onChange={(e) => setDaysCount(Number(e.target.value))}
                        className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span>3 Days (Short Tanzanian Fly-in)</span>
                        <span>8-10 Days (Classic Circuit)</span>
                        <span>21 Days (Grand Expedition)</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-5 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2"
                      >
                        <span>Next: Timing</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Timing & Guests */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        3. Travel Timing & Party Size
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Wildlife movements change dramatically across seasons.
                      </p>
                    </div>

                    {/* Party Size */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                        Number of Travelers
                      </label>
                      <div className="flex items-center space-x-3">
                        {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setTravelersCount(num)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-colors ${
                              travelersCount === num
                                ? 'bg-amber-600 text-stone-950 border-amber-500'
                                : 'bg-stone-950 text-stone-300 border-stone-800 hover:bg-stone-800'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">
                        (Our custom 4x4 Land Cruisers seat max 6 guests with guaranteed window seats and 360° pop-top roof hatches).
                      </p>
                    </div>

                    {/* Season Focus */}
                    <div className="space-y-2 pt-4 border-t border-stone-800">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                        Preferred Travel Season
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'Great Migration River Crossings (Jul - Oct)',
                          'Southern Serengeti Calving Season (Jan - Mar)',
                          'Primate & Green Emerald Season (Apr - May / Nov)',
                          'Festive Holiday Departures (Dec - Jan)',
                        ].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setSeason(s)}
                            className={`p-3.5 rounded-xl text-left border text-xs font-medium transition-all ${
                              season === s
                                ? 'bg-amber-600/15 border-amber-500 text-white font-bold'
                                : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-5 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2"
                      >
                        <span>Next: Interests</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Interests */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        4. Safari Interests & Specifics
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Select any signature activities you would love integrated.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        'Big Cat Tracking',
                        'Gorilla Trekking',
                        'Chimpanzee Habituation',
                        'Wildlife Photography',
                        'Birding Specialists',
                        'Zanzibar Beach Extension',
                        'Hadza Bushmen Cultural Walk',
                        'Hot Air Balloon Safari',
                        'Private Bush Flights',
                      ].map((item) => {
                        const isSelected = interests.includes(item) || (item === 'Gorilla Trekking' && gorillaTracking);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => {
                              if (item === 'Gorilla Trekking') setGorillaTracking(!gorillaTracking);
                              toggleInterest(item);
                            }}
                            className={`p-3.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-amber-600/15 border-amber-500 text-amber-400'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                            }`}
                          >
                            <span className="mr-1.5">{isSelected ? '✓' : '+'}</span>
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-stone-800">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                        Special Requests or Preferences (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Dietary requirements, anniversary celebration, preferred vehicle, or flight connections..."
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      ></textarea>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2"
                      >
                        <span>Review & Estimate</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Review & Lead Capture */}
                {currentStep === 5 && (
                  <form onSubmit={handleSubmitLead} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        5. Finalize Your Safari Design
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Where should Akim send your customized day-by-day plan and lodge availability report?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="eleanor@example.com"
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            WhatsApp / Mobile Phone (with Country Code)
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 019-2834"
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-stone-300">
                          Preferred Contact Channel
                        </label>
                        <div className="flex space-x-4 text-xs">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="contactChannel"
                              checked={preferredContact === 'whatsapp'}
                              onChange={() => setPreferredContact('whatsapp')}
                              className="accent-amber-500"
                            />
                            <span>WhatsApp (Faster response directly from Akim)</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="contactChannel"
                              checked={preferredContact === 'email'}
                              onChange={() => setPreferredContact('email')}
                              className="accent-amber-500"
                            />
                            <span>Formal Email PDF</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-400 space-y-1">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>The Ganda Safaris Promise</span>
                      </div>
                      <p>
                        No spam. No middleman broker markups. Direct contact with our Arusha headquarters and official permit reservation guarantees.
                      </p>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="px-5 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !name || !email}
                        className="px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xl"
                      >
                        {isSubmitting ? (
                          <span>Dispatching to Akim's Desk...</span>
                        ) : (
                          <>
                            <span>Submit Safari Plan</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live Price Band & Deposit Estimator Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 shadow-2xl sticky top-28 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <span className="text-xs uppercase tracking-wider text-amber-500 font-bold">
                  Estimated Trip Budget
                </span>
                <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                  {currency}
                </span>
              </div>

              {/* Price Band Display */}
              <div>
                <div className="text-xs text-stone-400">Estimated Total ({travelersCount} guests, {daysCount} days):</div>
                <div className="text-3xl font-black text-white font-display mt-1">
                  {formatPrice(estimatedTotalUSD, currency)}
                </div>
                <div className="text-xs text-amber-400 font-medium mt-1">
                  (~{formatPrice(getEstimatedPricePerPersonUSD(), currency)} per person)
                </div>
              </div>

              {/* Deposit Line Item */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-300">
                  <span>30% Deposit to Secure:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatPrice(depositRequiredUSD, currency)}
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 leading-tight">
                  Secures official UWA/RDB gorilla permits & private 4x4 Land Cruiser. Scanned government receipt provided before final balance.
                </div>
              </div>

              {/* Live Config Summary */}
              <div className="space-y-2 text-xs text-stone-400 border-t border-stone-800 pt-4">
                <div className="flex justify-between">
                  <span>Countries:</span>
                  <span className="text-stone-200 font-medium">{selectedCountries.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accommodation:</span>
                  <span className="text-stone-200 font-medium">{budgetTier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Season:</span>
                  <span className="text-stone-200 font-medium text-right line-clamp-1 max-w-[170px]">{season}</span>
                </div>
                {gorillaTracking && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Gorilla Permits:</span>
                    <span>Included</span>
                  </div>
                )}
              </div>

              {/* Direct WhatsApp Action */}
              <div className="pt-2">
                <a
                  href={getWhatsAppLeadLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-600/40 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss This Route on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
