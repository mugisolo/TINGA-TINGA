import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  FileCheck,
  Syringe,
  Briefcase,
  CreditCard,
  CheckSquare,
  Square,
  MessageSquare,
  ExternalLink,
  X,
} from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';

export type FAQCategory =
  | 'all'
  | 'visas'
  | 'vaccinations'
  | 'packing'
  | 'logistics';

export interface FAQItem {
  id: string;
  category: Exclude<FAQCategory, 'all'>;
  categoryLabel: string;
  question: string;
  summary: string;
  answer: string[];
  keyTakeaways: string[];
  officialNote?: {
    label: string;
    value: string;
    url?: string;
  };
}

export const SAFARI_FAQS: FAQItem[] = [
  {
    id: 'uganda-evisa-requirements',
    category: 'visas',
    categoryLabel: 'Visas & Entry',
    question: 'What are the visa requirements for entering Uganda at Entebbe International Airport?',
    summary:
      'All international visitors require an approved Uganda e-Visa ($50 USD) or East Africa Tourist Visa ($100 USD) applied for online prior to travel.',
    answer: [
      'Uganda operates a mandatory online Electronic Visa (e-Visa) system through the official Directorate of Citizenship and Immigration Control portal (visas.immigration.go.ug). Visa-on-arrival counters at Entebbe International Airport are no longer standard; airlines check for your printed e-Visa approval letter (Travel Authorization) before boarding.',
      'We recommend submitting your e-Visa application 2 to 4 weeks prior to departure. Approval typically takes 3 to 5 business days. Your passport must have at least 6 months of validity remaining beyond your planned departure date from Uganda and at least two blank visa pages.',
    ],
    keyTakeaways: [
      'Single-Entry Uganda Tourist e-Visa: $50 USD per person (valid for up to 90 days)',
      'Required uploads: Passport bio-data page, recent passport-size photo, Yellow Fever certificate, and return flight ticket',
      'Print a physical copy of your e-Visa barcode approval letter to present at Entebbe immigration',
    ],
    officialNote: {
      label: 'Official Uganda Immigration Portal',
      value: 'visas.immigration.go.ug',
      url: 'https://visas.immigration.go.ug',
    },
  },
  {
    id: 'east-africa-tourist-visa',
    category: 'visas',
    categoryLabel: 'Visas & Entry',
    question: 'Should I apply for the Single-Entry Uganda Visa or the East Africa Tourist Visa?',
    summary:
      'Choose the $50 Single-Entry Visa for Uganda-only itineraries, or the $100 East Africa Tourist Visa if combining Uganda with Rwanda or Kenya.',
    answer: [
      'If your safari begins and ends at Entebbe International Airport (EBB) and stays exclusively within Uganda, the $50 USD Single-Entry Tourist Visa is all you need.',
      'If you are flying into Kigali (Rwanda) and driving across the Cyanika or Katuna border into Bwindi Impenetrable Forest, or combining your Uganda primate trek with Kenya, apply for the $100 USD East Africa Tourist Visa. It grants multiple entries across Uganda, Rwanda, and Kenya for 90 days — you must apply through the portal of the country you enter first.',
    ],
    keyTakeaways: [
      'Uganda-Only Itinerary (Entebbe arrival & departure): $50 USD Single-Entry e-Visa',
      'Kigali-to-Bwindi or Multi-Country Itinerary: $100 USD East Africa Tourist Visa',
      'First port of entry determines which country issues your East Africa Tourist Visa',
    ],
  },
  {
    id: 'yellow-fever-and-vaccinations',
    category: 'vaccinations',
    categoryLabel: 'Vaccinations & Health',
    question: 'Which vaccinations are mandatory or recommended for a Uganda safari?',
    summary:
      'A Yellow Fever vaccination certificate is strictly mandatory for entry into Uganda; Malaria prophylaxis and routine travel immunizations are strongly advised.',
    answer: [
      'Port Health officials at Entebbe International Airport and all Ugandan land borders inspect your International Certificate of Vaccination or Prophylaxis (the "Yellow Card") before you reach immigration queues. The Yellow Fever vaccine must be administered at least 10 days before arrival, and a single dose provides lifelong protection under WHO regulations.',
      'For travelers aged 60+ or those with medical contraindications to the live Yellow Fever vaccine, an official signed and stamped medical waiver letter from your travel clinic or physician is accepted at Entebbe Port Health.',
    ],
    keyTakeaways: [
      'Mandatory: Yellow Fever Vaccination Certificate (or official stamped medical exemption letter)',
      'Recommended immunizations: Hepatitis A & B, Typhoid, Tetanus-Diphtheria booster, and Polio',
      'Schedule a travel medicine consultation 4 to 6 weeks prior to your flight',
    ],
  },
  {
    id: 'malaria-and-primate-health-protocols',
    category: 'vaccinations',
    categoryLabel: 'Vaccinations & Health',
    question: 'What Malaria precautions and primate health protocols apply in Bwindi and Kibale?',
    summary:
      'Prescription antimalarials are recommended year-round, and surgical/N95 masks are required within 10 meters of Mountain Gorillas and Chimpanzees.',
    answer: [
      'Uganda is a malaria-endemic country across savannah parks and lakeside towns, though high-altitude forests like Bwindi (1,160m–2,607m) have lower mosquito density. We strongly advise consulting your physician for prescription malaria prophylaxis such as Atovaquone-Proguanil (Malarone) or Doxycycline, alongside using DEET insect repellent at dusk and sleeping under lodge mosquito nets.',
      'Because Mountain Gorillas and Chimpanzees share over 98% of human DNA, they are highly susceptible to human respiratory viruses. Uganda Wildlife Authority (UWA) rangers enforce a strict bio-security rule: every trekker must wear a clean surgical or KN95 face mask during the 1-hour viewing period with gorillas or chimpanzees.',
    ],
    keyTakeaways: [
      'Ask your travel doctor for Atovaquone-Proguanil (Malarone) or Doxycycline antimalarial tablets',
      'Bring 2–3 surgical or KN95 face masks per trekker for gorilla and chimpanzee viewing hours',
      'If you develop a contagious flu or fever before trek day, UWA wardens can assist with medical assessment guidelines',
    ],
  },
  {
    id: 'gorilla-trekking-packing-tips',
    category: 'packing',
    categoryLabel: 'Packing Tips & Gear',
    question: 'What clothing and gear should I pack for gorilla trekking in Bwindi and chimpanzee tracking in Kibale?',
    summary:
      'Pack broken-in waterproof ankle boots, long breathable neutral trousers, gardening gloves for stinging nettles, knee gaiters, and a lightweight rain jacket.',
    answer: [
      'Bwindi Impenetrable National Park is a true montane rainforest: trails are steep, off-path sections cross thick vines and stinging nettles, and brief afternoon rain showers can occur even during the dry seasons (June–September and December–February).',
      'Dress in long-sleeved, breathable moisture-wicking layers in muted earth tones (olive green, khaki, tan, brown, or warm grey). Avoid bright white or neon clothing (which startles wildlife), military camouflage patterns (which are restricted for civilians in Uganda), and dark blue or black shirts on savannah drives (which attract tsetse flies).',
    ],
    keyTakeaways: [
      'Footwear: Waterproof hiking boots with firm ankle support (broken in before your trip) + knee-high trekking gaiters',
      'Hand & Rain Protection: Heavy-duty gardening or leather trail gloves (essential for gripping thorny vines) + packable rain poncho/jacket',
      'Trousers & Socks: Long ripstop trekking pants tucked into tall merino wool socks to prevent safari ants from climbing',
      'Optics & Power: 8x42 or 10x42 binoculars (vital for Kibale canopy primates & Mabamba Shoebills) + UK Type G 3-pin plug adapter',
    ],
  },
  {
    id: 'luggage-limits-and-laundry',
    category: 'packing',
    categoryLabel: 'Packing Tips & Gear',
    question: 'What kind of luggage bag should I bring, and are there weight limits?',
    summary:
      'Use a soft-sided duffel bag weighing 15 kg (33 lbs) or less so it fits cleanly in 4x4 Land Cruiser cargo bays and domestic bush aircraft.',
    answer: [
      'Hard-shell suitcases with rigid frames are difficult to pack securely into the rear cargo bays of custom 4x4 Safari Land Cruisers and are not permitted on domestic light aircraft (such as AeroLink flights between Entebbe, Kihihi/Bwindi, Kasese, and Kidepo Valley).',
      'Most mid-range and luxury safari lodges across Uganda offer same-day or next-morning laundry service (often complimentary at luxury camps or a few dollars per item at mid-range lodges), meaning you only need 4 to 5 days of field clothing even on a 12-day expedition.',
    ],
    keyTakeaways: [
      'Bag Type: Soft-sided, frameless canvas or waterproof duffel bag (no rigid hard-shell frames)',
      'Weight Limit: 15 kg (33 lbs) per traveler if your itinerary includes domestic bush flights; 20 kg for road-only 4x4 safaris',
      'Complimentary Luggage Storage: Our Bugonga, Entebbe head office stores extra city suitcases securely while you are on safari',
    ],
  },
  {
    id: 'currency-usd-bills-and-tipping',
    category: 'logistics',
    categoryLabel: 'Permits, Currency & Logistics',
    question: 'What currency is accepted in Uganda, and why does the print year of US Dollar bills matter?',
    summary:
      'US Dollars (strictly printed 2013 or newer, crisp and untorn) and Ugandan Shillings (UGX) are standard; credit cards work at lodges and in your Enganda Wallet.',
    answer: [
      'Banks, forex bureaus, national parks, and safari lodges in Uganda strictly reject US Dollar bills printed before 2013, as well as notes with even tiny edge tears, ink stamps, or heavy creases. Additionally, $50 and $100 bills receive a noticeably higher exchange rate to Ugandan Shillings (UGX) than $1, $5, $10, or $20 denominations.',
      'We recommend bringing crisp, uncreased US Dollar bills printed 2013 or later for lodge gratuities, Bwindi community porters ($20 USD per trekker), and UWA ranger tips, while exchanging $100–$200 into Ugandan Shillings (UGX) with your named guide in Entebbe for roadside craft markets and espresso stops.',
    ],
    keyTakeaways: [
      'US Dollar Rule: Bring only crisp, unmarked USD bills printed in series 2013 or newer',
      'Bwindi Trail Porter: Hiring a local community porter at the trailhead costs $20 USD (carries your daypack & assists on steep slopes)',
      'Card Payments: Visa and Mastercard are accepted at major lodges and directly in your Enganda Safari Wallet (3.5% local bank surcharge often applies at remote terminals)',
    ],
  },
  {
    id: 'booking-lead-time-and-escrow',
    category: 'logistics',
    categoryLabel: 'Permits, Currency & Logistics',
    question: 'How far in advance should I book my Uganda safari to secure gorilla and chimpanzee permits?',
    summary:
      'We recommend reserving 3 to 6 months ahead for peak dry seasons (June–September & December–February), as each gorilla family allows only 8 visitors per day.',
    answer: [
      'Because Mountain Gorilla groups in Bwindi (Buhoma, Ruhija, Rushaga, and Nkuringo sectors) and Mgahinga are strictly capped at 8 trekkers per family per day, permit allocations for June, July, August, September, December, and January frequently sell out months in advance.',
      'When you book with Enganda Safaris, your permit deposit goes directly into our Safari Wallet Permit Escrow. Our Entebbe operations desk secures your date-specific permits at Uganda Wildlife Authority headquarters in Kampala and uploads the official scanned receipt before your final safari balance is due.',
    ],
    keyTakeaways: [
      'Peak Dry Seasons (Jun–Sep & Dec–Feb): Book 4 to 6 months in advance for preferred Bwindi sectors',
      'Emerald Green Seasons (Mar–May & Oct–Nov): Lush photography conditions and quieter trails; book 6 to 10 weeks ahead',
      '12-Hour Live Verification: Our Entebbe desk confirms live UWA sector availability before collecting any deposit',
    ],
  },
];

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  detail: string;
}

const PRE_DEPARTURE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-evisa',
    category: 'Visas',
    label: 'Uganda e-Visa ($50) or East Africa Visa ($100) approved & printed',
    detail: 'Apply at visas.immigration.go.ug 2–4 weeks before departure',
  },
  {
    id: 'chk-yellow-fever',
    category: 'Health',
    label: 'Physical Yellow Fever Vaccination Card packed in carry-on',
    detail: 'Checked by Port Health at Entebbe International Airport before immigration',
  },
  {
    id: 'chk-malaria-masks',
    category: 'Health',
    label: 'Malaria prophylaxis & 3 surgical/KN95 masks for primate treks',
    detail: 'Masks are mandatory within 10m of gorillas and chimpanzees',
  },
  {
    id: 'chk-boots-gloves',
    category: 'Packing',
    label: 'Broken-in waterproof boots, knee gaiters & gardening gloves',
    detail: 'Protects ankles and hands from Bwindi stinging nettles and muddy slopes',
  },
  {
    id: 'chk-duffel-usd',
    category: 'Logistics',
    label: 'Soft duffel bag (≤15 kg) & crisp post-2013 US Dollar notes',
    detail: 'Include $20 USD cash per trek for hiring a local Bwindi trail porter',
  },
];

const CATEGORY_TABS: { id: FAQCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Questions', icon: FileCheck },
  { id: 'visas', label: 'Visas & Entry', icon: FileCheck },
  { id: 'vaccinations', label: 'Vaccinations & Health', icon: Syringe },
  { id: 'packing', label: 'Packing Tips & Gear', icon: Briefcase },
  { id: 'logistics', label: 'Permits, Currency & Logistics', icon: CreditCard },
];

export const FrequentlyAskedQuestions: React.FC = () => {
  const { openInquiryModal } = useInquiry();
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([
    'uganda-evisa-requirements',
    'yellow-fever-and-vaccinations',
    'gorilla-trekking-packing-tips',
  ]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-evisa': true,
    'chk-yellow-fever': true,
  });

  const filteredFaqs = useMemo(() => {
    return SAFARI_FAQS.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      const inQuestion = item.question.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      const inAnswer = item.answer.some((p) => p.toLowerCase().includes(q));
      const inTakeaways = item.keyTakeaways.some((t) =>
        t.toLowerCase().includes(q)
      );
      return (
        matchesCategory && (inQuestion || inSummary || inAnswer || inTakeaways)
      );
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAllVisible = () => {
    setOpenIds(filteredFaqs.map((item) => item.id));
  };

  const collapseAllVisible = () => {
    setOpenIds([]);
  };

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section
      id="safari-faq"
      aria-labelledby="safari-faq-heading"
      className="bg-white border border-[#E4DCCF] rounded-lg p-6 sm:p-10 space-y-8"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E4DCCF] pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
            04. Pre-Departure Briefing • Entebbe Operations Desk
          </div>
          <h2
            id="safari-faq-heading"
            className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1612] tracking-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#5A5248] leading-relaxed">
            Practical, field-verified guidance from our licensed Ugandan guides on entry visas, mandatory Yellow Fever rules, Bwindi rainforest packing lists, and US Dollar cash requirements.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80">
          <label htmlFor="faq-search" className="sr-only">
            Search safari planning questions
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#5A5248] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="faq-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visas, yellow fever, boots, USD..."
              className="w-full bg-[#FAF7F2] border border-[#E4DCCF] focus:border-[#226B3E] focus:outline-none rounded-md pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1A1612] placeholder:text-[#8C8275]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A5248] hover:text-[#1A1612] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Bar & Expand/Collapse Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter Frequently Asked Questions by topic"
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            const count =
              tab.id === 'all'
                ? SAFARI_FAQS.length
                : SAFARI_FAQS.filter((f) => f.category === tab.id).length;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  isActive
                    ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                    : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-[11px] ${
                    isActive ? 'text-[#D99B26]' : 'text-[#5A5248]'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={expandAllVisible}
            className="text-xs font-mono font-semibold text-[#226B3E] hover:text-[#C85A28] transition-colors"
          >
            Expand All
          </button>
          <span className="text-[#E4DCCF]">•</span>
          <button
            type="button"
            onClick={collapseAllVisible}
            className="text-xs font-mono font-semibold text-[#5A5248] hover:text-[#1A1612] transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Main Asymmetric Grid: 8-Col Accordion + 4-Col Interactive Readiness Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Accordion Column */}
        <div className="lg:col-span-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-8 text-center space-y-3">
              <p className="font-serif text-xl font-bold text-[#1A1612]">
                No matching questions found for “{searchQuery}”
              </p>
              <p className="text-xs sm:text-sm text-[#5A5248]">
                Try clearing your filter or ask our Entebbe coordination desk directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="inline-flex items-center gap-2 bg-[#226B3E] text-[#FAF7F2] text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B5632] transition-colors"
              >
                Reset FAQ Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);
              const numberPrefix = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={faq.id}
                  className={`border rounded-lg transition-colors ${
                    isOpen
                      ? 'bg-[#FAF7F2] border-[#226B3E]'
                      : 'bg-white border-[#E4DCCF] hover:border-[#C85A28]/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                        <span>{numberPrefix}.</span>
                        <span>{faq.categoryLabel}</span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1612] leading-snug">
                        {faq.question}
                      </h3>
                      {!isOpen && (
                        <p className="text-xs sm:text-sm text-[#5A5248] line-clamp-2">
                          {faq.summary}
                        </p>
                      )}
                    </div>
                    <span
                      className={`mt-1 p-1.5 rounded-md border transition-transform shrink-0 ${
                        isOpen
                          ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E] rotate-180'
                          : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-[#E4DCCF] space-y-4">
                      <div className="space-y-3">
                        {faq.answer.map((paragraph, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-xs sm:text-sm text-[#1A1612] leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Key Field Takeaways */}
                      <div className="bg-white border border-[#E4DCCF] rounded-md p-4 space-y-2">
                        <div className="font-mono text-[11px] uppercase tracking-wider text-[#226B3E] font-semibold">
                          Field Guide Checklist & Specifics
                        </div>
                        <ul className="space-y-1.5">
                          {faq.keyTakeaways.map((point, kIdx) => (
                            <li
                              key={kIdx}
                              className="flex items-start gap-2 text-xs text-[#5A5248]"
                            >
                              <span className="font-mono text-[#C85A28] font-bold">
                                •
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {faq.officialNote && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          <span className="font-mono text-[#5A5248]">
                            {faq.officialNote.label}:{' '}
                            <strong className="text-[#1A1612]">
                              {faq.officialNote.value}
                            </strong>
                          </span>
                          {faq.officialNote.url && (
                            <a
                              href={faq.officialNote.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-[#226B3E] hover:text-[#C85A28]"
                            >
                              <span>Visit Official Portal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Pre-Departure Readiness Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#E4DCCF] pb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#C85A28] font-semibold">
                  Interactive Tool
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1612] mt-0.5">
                  Entebbe Arrival Readiness
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-[#226B3E]">
                  {completedCount}/{PRE_DEPARTURE_CHECKLIST.length}
                </div>
                <div className="text-[10px] uppercase text-[#5A5248]">
                  Verified
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5A5248] leading-relaxed">
              Check off your essential Uganda entry and trekking items as you prepare for arrival at Entebbe International Airport (EBB).
            </p>

            <div className="space-y-2.5">
              {PRE_DEPARTURE_CHECKLIST.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors flex items-start gap-3 ${
                      isChecked
                        ? 'bg-white border-[#226B3E]'
                        : 'bg-[#FAF7F2] border-[#E4DCCF] hover:border-[#5A5248]'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#226B3E] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8C8275] shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div
                        className={`text-xs font-semibold leading-snug ${
                          isChecked
                            ? 'text-[#1A1612] line-through decoration-[#226B3E]/50'
                            : 'text-[#1A1612]'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#5A5248]">
                        {item.detail}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Reference Spec Sheet */}
            <div className="bg-white border border-[#E4DCCF] rounded-md p-4 space-y-2 text-xs">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#1A1612] font-semibold">
                Uganda Quick Field Specs
              </div>
              <div className="flex justify-between py-1 border-b border-[#E4DCCF]">
                <span className="text-[#5A5248]">Time Zone:</span>
                <span className="font-mono font-semibold text-[#1A1612]">
                  EAT (UTC +3)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E4DCCF]">
                <span className="text-[#5A5248]">Power Sockets:</span>
                <span className="font-mono font-semibold text-[#1A1612]">
                  240V UK Type G (3-Pin)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E4DCCF]">
                <span className="text-[#5A5248]">USD Cash Series:</span>
                <span className="font-mono font-semibold text-[#226B3E]">
                  2013 or Newer Only
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#5A5248]">Bwindi Altitude:</span>
                <span className="font-mono font-semibold text-[#1A1612]">
                  1,160m – 2,607m
                </span>
              </div>
            </div>

            {/* Direct CTA to Ask a Named Guide */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => openInquiryModal()}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#1B5632] text-[#FAF7F2] text-xs font-semibold px-4 py-3 rounded-md transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Our Entebbe Desk a Question</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
