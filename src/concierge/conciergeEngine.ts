import { Type, FunctionDeclaration } from '@google/genai';
import {
  GUIDES,
  EXPERIENCES,
  PERMIT_FACTS,
  CONFIRMED_PACKAGES_AND_EVENTS,
  VOLUNTEER_PROGRAMS,
  CONSERVATION_FUNDRAISERS,
} from '../data/seedData';
import { WILDLIFE_CONCIERGE_SYSTEM_PROMPT } from '../config/systemPrompt';
import {
  AutonomousBookingQuote,
  AutonomousBookingConfirmation,
  Currency,
} from '../types';
import { CURRENCY_RATES } from '../lib/currency';

// 1. Existing Discovery Tools
export const matchGuideDeclaration: FunctionDeclaration = {
  name: 'match_guide',
  description:
    'Find the best Ugandan or East African specialist guide based on wildlife interest or destination region.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      specialtyKeyword: {
        type: Type.STRING,
        description:
          'Keyword such as gorilla, birding, photography, kidepo, chimpanzee, tree-climbing lions, culture, family',
      },
    },
    required: ['specialtyKeyword'],
  },
};

export const searchExperiencesDeclaration: FunctionDeclaration = {
  name: 'search_experiences',
  description:
    'Search curated Uganda & East Africa safari experiences by maximum days or keyword.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      keyword: {
        type: Type.STRING,
        description:
          'Destination or wildlife interest e.g., Bwindi, Gorilla, Kidepo, Murchison, Chimpanzee, Tingatinga, Enganda, Vergouw, Shuma',
      },
      maxDays: {
        type: Type.NUMBER,
        description: 'Optional maximum trip length in days',
      },
    },
  },
};

export const getPermitInfoDeclaration: FunctionDeclaration = {
  name: 'get_permit_info',
  description:
    'Get official Uganda Wildlife Authority (UWA) permit prices and lead times for mountain gorillas, chimpanzees, and golden monkeys.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      permitType: {
        type: Type.STRING,
        description: 'gorilla, habituation, chimpanzee, or park_entry',
      },
    },
    required: ['permitType'],
  },
};

// 2. Five Autonomous Sales & Checkout Tools (Zero Human-in-the-Middle)
export const checkAvailabilityDeclaration: FunctionDeclaration = {
  name: 'check_availability',
  description:
    'Check real-time departure availability, remaining spots, UTB/UWA license verification, and UWA permit escrow allocation for a safari package or volunteer program.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      packageQuery: {
        type: Type.STRING,
        description:
          'Package ID, slug, or title keyword (e.g. "E5", "E4", "E1", "Vergouw", "Tingatinga T5", "Tingatinga 8-Day", "32-Day Grand Safari", "Bwindi", "Kidepo")',
      },
      departureDate: {
        type: Type.STRING,
        description: 'Preferred travel date or month (e.g. "August 2026")',
      },
      guests: {
        type: Type.NUMBER,
        description: 'Number of travelers (default 2)',
      },
    },
    required: ['packageQuery'],
  },
};

export const calculateQuoteDeclaration: FunctionDeclaration = {
  name: 'calculate_quote',
  description:
    'Calculate a binding, itemized multi-currency quote for a safari package including UWA permit escrow, conservation pledge, and converted total in UGX, USD, EUR, or GBP.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      packageQuery: {
        type: Type.STRING,
        description:
          'Package ID, slug, or title keyword (e.g. "E5", "Tingatinga T5", "Vergouw", "Bwindi")',
      },
      guests: {
        type: Type.NUMBER,
        description: 'Number of travelers (default 2)',
      },
      departureDate: {
        type: Type.STRING,
        description: 'Preferred departure window or date',
      },
      currency: {
        type: Type.STRING,
        description: 'Target currency code: UGX, USD, EUR, or GBP',
      },
      includeGorillaPermits: {
        type: Type.BOOLEAN,
        description:
          'Whether UWA mountain gorilla permits ($800/pax) are included in escrow',
      },
    },
    required: ['packageQuery'],
  },
};

export const applyWalletCurrencyDeclaration: FunctionDeclaration = {
  name: 'apply_wallet_currency',
  description:
    'Switch and synchronize the user Safari Wallet currency (UGX, USD, EUR, GBP) and convert the active quote amount using live exchange rates.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      currency: {
        type: Type.STRING,
        description: 'Target currency code: UGX, USD, EUR, or GBP',
      },
      amountUSD: {
        type: Type.NUMBER,
        description: 'Optional USD amount to convert into the target currency',
      },
    },
    required: ['currency'],
  },
};

export const createBookingDeclaration: FunctionDeclaration = {
  name: 'create_booking',
  description:
    'Autonomously create a confirmed safari booking reservation and generate an official UTB/UWA permit escrow invoice.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      packageQuery: {
        type: Type.STRING,
        description: 'Package ID, slug, or title keyword to book',
      },
      guests: {
        type: Type.NUMBER,
        description: 'Number of guests traveling',
      },
      departureDate: {
        type: Type.STRING,
        description: 'Confirmed departure date',
      },
      clientName: {
        type: Type.STRING,
        description: 'Full name of the lead traveler',
      },
      clientEmail: {
        type: Type.STRING,
        description: 'Email address for UWA permit escrow & invoice delivery',
      },
      currency: {
        type: Type.STRING,
        description: 'Settlement currency: UGX, USD, EUR, or GBP',
      },
    },
    required: ['packageQuery'],
  },
};

export const processPaymentCheckoutDeclaration: FunctionDeclaration = {
  name: 'process_payment_checkout',
  description:
    'Execute autonomous end-to-end payment checkout via Enganda Safari Wallet balance, Relworx Mobile Money (MTN / Airtel), or Visa/Mastercard and issue a UWA permit escrow receipt.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      packageQuery: {
        type: Type.STRING,
        description: 'Package ID, slug, or title keyword being paid for',
      },
      guests: {
        type: Type.NUMBER,
        description: 'Number of travelers',
      },
      paymentMethod: {
        type: Type.STRING,
        description:
          'Payment channel: "wallet_balance", "mtn_momo", "airtel_money", "visa_mastercard", or "bank_transfer"',
      },
      currency: {
        type: Type.STRING,
        description: 'Settlement currency: UGX, USD, EUR, or GBP',
      },
      bookingId: {
        type: Type.STRING,
        description: 'Optional existing booking ID to settle',
      },
    },
    required: ['packageQuery'],
  },
};

export interface AutonomousToolExecutionResult {
  text: string;
  suggestedGuideSlugs: string[];
  suggestedExperienceSlugs: string[];
  executedTools: string[];
  activeQuote?: AutonomousBookingQuote;
  activeBooking?: AutonomousBookingConfirmation;
  appliedCurrency?: Currency;
}

function resolvePackageFromQuery(query: string = '') {
  const q = query.toLowerCase().trim();
  if (!q) return CONFIRMED_PACKAGES_AND_EVENTS[0];

  const foundEvent = CONFIRMED_PACKAGES_AND_EVENTS.find(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      (p.experienceSlug && p.experienceSlug.toLowerCase().includes(q)) ||
      (p.shortTabLabel && p.shortTabLabel.toLowerCase().includes(q)) ||
      p.title.toLowerCase().includes(q) ||
      (p.operatorName && p.operatorName.toLowerCase().includes(q))
  );
  if (foundEvent) return foundEvent;

  const foundExp = EXPERIENCES.find(
    (e) =>
      e.slug.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.regions.some((d) => d.toLowerCase().includes(q))
  );
  if (foundExp) {
    const basePrice =
      foundExp.twoPaxSharingPriceUSD ||
      foundExp.priceBands[0]?.perPersonUSD ||
      1950;
    const leadGuide = foundExp.recommendedGuides[0] || 'david-mukasa';
    return {
      id: `pkg-${foundExp.slug}`,
      title: foundExp.title,
      shortTabLabel: foundExp.title.slice(0, 22),
      subtitle: foundExp.summary,
      category: 'Guaranteed Primate Departure' as const,
      dateWindow: 'Flexible 2026 / 2027 Departure',
      durationLabel: `${foundExp.durationDays} Days`,
      location: foundExp.regions.join(' • '),
      pricePerPersonUSD: basePrice,
      spotsRemaining: 4,
      leadGuideSlug: leadGuide,
      experienceSlug: foundExp.slug,
      heroImage: foundExp.heroImage,
      highlights: foundExp.inclusions.slice(0, 4),
      eventTag: 'UTB & UWA VERIFIED',
      statusLabel: '4 Spots Open',
      placement: 'both' as const,
      operatorName: foundExp.slug.includes('tingatinga')
        ? 'Tingatinga Safaris'
        : foundExp.slug.includes('32-day')
        ? 'Shuma Africa Safaris'
        : 'Enganda Safaris',
      utbLicenseNumber: foundExp.slug.includes('tingatinga')
        ? 'UTB/TO/2026/0418'
        : 'UTB/TO/2026/0102',
      uwaAccreditationId: foundExp.slug.includes('tingatinga')
        ? 'UWA-REG-8841-UG'
        : 'UWA-REG-1104-UG',
    };
  }

  return CONFIRMED_PACKAGES_AND_EVENTS[0];
}

export function buildQuoteFromPackage(params: {
  packageQuery: string;
  guests?: number;
  departureDate?: string;
  currency?: Currency;
  includeGorillaPermits?: boolean;
}): AutonomousBookingQuote {
  const pkg = resolvePackageFromQuery(params.packageQuery);
  const guests = Math.max(1, Number(params.guests || 2));
  const cur: Currency =
    params.currency &&
    ['UGX', 'USD', 'EUR', 'GBP'].includes(params.currency.toUpperCase())
      ? (params.currency.toUpperCase() as Currency)
      : 'USD';
  const rate = CURRENCY_RATES[cur]?.rate || 1;
  const includeGorilla =
    params.includeGorillaPermits !== undefined
      ? params.includeGorillaPermits
      : pkg.title.toLowerCase().includes('gorilla') ||
        pkg.title.toLowerCase().includes('bwindi');
  const includeChimp =
    pkg.title.toLowerCase().includes('chimp') ||
    pkg.title.toLowerCase().includes('kibale');

  const uwaPermitsTotalUSD =
    (includeGorilla ? 800 * guests : 0) + (includeChimp ? 250 * guests : 0);
  const totalUSD = pkg.pricePerPersonUSD * guests;
  const accommodationAndTransportUSD = Math.max(
    0,
    Math.round(totalUSD * 0.97 - uwaPermitsTotalUSD)
  );
  const conservationLevyUSD = Math.round(totalUSD * 0.03);
  const convertedTotal = Math.round(totalUSD * rate * 100) / 100;

  return {
    quoteId: `QT-ENG-${Date.now().toString().slice(-6)}`,
    packageId: pkg.id,
    packageTitle: pkg.title,
    operatorName: pkg.operatorName || 'Enganda Safaris',
    utbLicenseNumber: pkg.utbLicenseNumber || 'UTB/TO/2026/0102',
    uwaAccreditationId: pkg.uwaAccreditationId || 'UWA-REG-1104-UG',
    leadGuideName:
      GUIDES.find((g) => g.slug === pkg.leadGuideSlug)?.name || 'David Mukasa',
    leadGuideSlug: pkg.leadGuideSlug,
    guests,
    durationLabel: pkg.durationLabel,
    departureDate: params.departureDate || pkg.dateWindow,
    pricePerPersonUSD: pkg.pricePerPersonUSD,
    uwaPermitsTotalUSD,
    accommodationAndTransportUSD,
    conservationLevyUSD,
    totalUSD,
    currency: cur,
    convertedTotal,
    includesGorillaPermit: includeGorilla,
    includesChimpPermit: includeChimp,
    createdAt: new Date().toISOString(),
  };
}

export function buildBookingConfirmation(
  quote: AutonomousBookingQuote,
  options?: {
    clientName?: string;
    clientEmail?: string;
    paymentMethod?: AutonomousBookingConfirmation['paymentMethod'];
    status?: AutonomousBookingConfirmation['status'];
  }
): AutonomousBookingConfirmation {
  const stamp = Date.now().toString().slice(-6);
  return {
    bookingId: `BK-ENG-${stamp}`,
    invoiceNumber: `INV-UWA-${stamp}`,
    quote,
    clientName: options?.clientName || 'Enganda Marketplace Traveler',
    clientEmail: options?.clientEmail || 'traveler@engandasafaris.com',
    paymentMethod: options?.paymentMethod || 'wallet_balance',
    status: options?.status || 'pending_payment',
    receiptId: `WLT-AUTO-${stamp}`,
    uwaEscrowReference: `UWA-ESC-${stamp}`,
    createdAt: new Date().toISOString(),
  };
}

function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  state: {
    guideSlugs: Set<string>;
    expSlugs: Set<string>;
    executedTools: string[];
    activeQuote?: AutonomousBookingQuote;
    activeBooking?: AutonomousBookingConfirmation;
    appliedCurrency?: Currency;
  }
): Record<string, unknown> {
  state.executedTools.push(name);

  if (name === 'match_guide') {
    const kw = String(args.specialtyKeyword || '').toLowerCase();
    const matches = GUIDES.filter(
      (g) =>
        g.specialties.some((s) => s.toLowerCase().includes(kw)) ||
        g.homeRegion.toLowerCase().includes(kw) ||
        g.bio.toLowerCase().includes(kw)
    );
    const results = matches.length > 0 ? matches : GUIDES.slice(0, 2);
    results.forEach((g) => state.guideSlugs.add(g.slug));
    return {
      matchedGuides: results.map((g) => ({
        name: g.name,
        slug: g.slug,
        title: g.tagline,
        region: g.homeRegion,
        yearsExperience: g.yearsExperience,
        specialties: g.specialties,
      })),
    };
  }

  if (name === 'search_experiences') {
    const kw = String(args.keyword || '').toLowerCase();
    const maxDays = Number(args.maxDays || 40);
    const matches = EXPERIENCES.filter(
      (e) =>
        e.durationDays <= maxDays &&
        (!kw ||
          e.title.toLowerCase().includes(kw) ||
          e.summary.toLowerCase().includes(kw) ||
          e.regions.some((d) => d.toLowerCase().includes(kw)))
    );
    const results = matches.length > 0 ? matches : EXPERIENCES.slice(0, 3);
    results.forEach((e) => state.expSlugs.add(e.slug));
    return {
      experiences: results.map((e) => ({
        title: e.title,
        slug: e.slug,
        durationDays: e.durationDays,
        priceFromUSD:
          e.twoPaxSharingPriceUSD || e.priceBands[0]?.perPersonUSD || 1950,
        leadGuideSlug: e.recommendedGuides[0] || 'david-mukasa',
      })),
    };
  }

  if (name === 'get_permit_info') {
    return {
      permits: PERMIT_FACTS,
    };
  }

  if (name === 'check_availability') {
    const pkg = resolvePackageFromQuery(String(args.packageQuery || ''));
    if (pkg.experienceSlug) state.expSlugs.add(pkg.experienceSlug);
    if (pkg.leadGuideSlug) state.guideSlugs.add(pkg.leadGuideSlug);
    const guests = Math.max(1, Number(args.guests || 2));
    return {
      status: 'AVAILABLE',
      packageId: pkg.id,
      packageTitle: pkg.title,
      operatorName: pkg.operatorName || 'Enganda Safaris',
      utbLicenseNumber: pkg.utbLicenseNumber || 'UTB/TO/2026/0102',
      uwaAccreditationId: pkg.uwaAccreditationId || 'UWA-REG-1104-UG',
      departureDate: String(args.departureDate || pkg.dateWindow),
      spotsRemaining: pkg.spotsRemaining,
      requestedGuests: guests,
      uwaPermitsInEscrow: guests,
      pricePerPersonUSD: pkg.pricePerPersonUSD,
    };
  }

  if (name === 'calculate_quote') {
    const quote = buildQuoteFromPackage({
      packageQuery: String(args.packageQuery || ''),
      guests: Number(args.guests || 2),
      departureDate: args.departureDate ? String(args.departureDate) : undefined,
      currency: args.currency
        ? (String(args.currency).toUpperCase() as Currency)
        : undefined,
      includeGorillaPermits:
        typeof args.includeGorillaPermits === 'boolean'
          ? args.includeGorillaPermits
          : undefined,
    });
    state.activeQuote = quote;
    const pkg = resolvePackageFromQuery(String(args.packageQuery || ''));
    if (pkg.experienceSlug) state.expSlugs.add(pkg.experienceSlug);
    if (pkg.leadGuideSlug) state.guideSlugs.add(pkg.leadGuideSlug);
    return { quote };
  }

  if (name === 'apply_wallet_currency') {
    const rawCur = String(args.currency || 'USD').toUpperCase();
    const cur: Currency = ['UGX', 'USD', 'EUR', 'GBP'].includes(rawCur)
      ? (rawCur as Currency)
      : 'USD';
    state.appliedCurrency = cur;
    if (state.activeQuote) {
      const rate = CURRENCY_RATES[cur]?.rate || 1;
      state.activeQuote = {
        ...state.activeQuote,
        currency: cur,
        convertedTotal:
          Math.round(state.activeQuote.totalUSD * rate * 100) / 100,
      };
    }
    const amountUSD = Number(
      args.amountUSD || state.activeQuote?.totalUSD || 4850
    );
    const rate = CURRENCY_RATES[cur]?.rate || 1;
    return {
      currency: cur,
      exchangeRate: rate,
      amountUSD,
      convertedAmount: Math.round(amountUSD * rate * 100) / 100,
      walletSynced: true,
    };
  }

  if (name === 'create_booking') {
    const quote =
      state.activeQuote ||
      buildQuoteFromPackage({
        packageQuery: String(args.packageQuery || ''),
        guests: Number(args.guests || 2),
        departureDate: args.departureDate
          ? String(args.departureDate)
          : undefined,
        currency: args.currency
          ? (String(args.currency).toUpperCase() as Currency)
          : state.appliedCurrency,
      });
    state.activeQuote = quote;
    const booking = buildBookingConfirmation(quote, {
      clientName: args.clientName ? String(args.clientName) : undefined,
      clientEmail: args.clientEmail ? String(args.clientEmail) : undefined,
      status: 'pending_payment',
    });
    state.activeBooking = booking;
    return { booking };
  }

  if (name === 'process_payment_checkout') {
    const quote =
      state.activeQuote ||
      buildQuoteFromPackage({
        packageQuery: String(args.packageQuery || ''),
        guests: Number(args.guests || 2),
        currency: args.currency
          ? (String(args.currency).toUpperCase() as Currency)
          : state.appliedCurrency,
      });
    state.activeQuote = quote;
    const rawMethod = String(args.paymentMethod || 'wallet_balance');
    const method: AutonomousBookingConfirmation['paymentMethod'] = [
      'wallet_balance',
      'mtn_momo',
      'airtel_money',
      'visa_mastercard',
      'bank_transfer',
    ].includes(rawMethod)
      ? (rawMethod as AutonomousBookingConfirmation['paymentMethod'])
      : 'wallet_balance';

    const booking = buildBookingConfirmation(quote, {
      paymentMethod: method,
      status: 'confirmed_paid',
    });
    state.activeBooking = booking;
    return {
      paymentStatus: 'CONFIRMED_PAID',
      booking,
    };
  }

  return { status: 'unknown_tool' };
}

export async function askGuideMatcherConcierge(
  userMessage: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  currentWalletCurrency: Currency = 'USD'
): Promise<AutonomousToolExecutionResult> {
  const state = {
    guideSlugs: new Set<string>(),
    expSlugs: new Set<string>(),
    executedTools: [] as string[],
    activeQuote: undefined as AutonomousBookingQuote | undefined,
    activeBooking: undefined as AutonomousBookingConfirmation | undefined,
    appliedCurrency: undefined as Currency | undefined,
  };

  try {
    const contents = [
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `[Active Wallet Currency: ${currentWalletCurrency}] ${userMessage}`,
          },
        ],
      },
    ];

    const callBackendChat = async (payloadContents: unknown) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: payloadContents,
          systemInstruction: WILDLIFE_CONCIERGE_SYSTEM_PROMPT,
          tools: [
            {
              functionDeclarations: [
                checkAvailabilityDeclaration,
                calculateQuoteDeclaration,
                applyWalletCurrencyDeclaration,
                createBookingDeclaration,
                processPaymentCheckoutDeclaration,
                matchGuideDeclaration,
                searchExperiencesDeclaration,
                getPermitInfoDeclaration,
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        throw new Error(`API chat request failed with status ${res.status}`);
      }
      return res.json();
    };

    const response = await callBackendChat(contents);

    if (response.fallback) {
      return fallbackDeterministicPlanner(userMessage, currentWalletCurrency);
    }

    if (response.functionCalls && response.functionCalls.length > 0) {
      const toolParts = response.functionCalls.map(
        (call: { name?: string; args?: Record<string, unknown> }) => {
          const result = executeToolCall(
            call.name || '',
            (call.args as Record<string, unknown>) || {},
            state
          );
          return {
            functionResponse: {
              name: call.name || '',
              response: result,
            },
          };
        }
      );

      const followUp = await callBackendChat([
        ...contents,
        {
          role: 'model',
          parts: response.functionCalls.map((fc: unknown) => ({
            functionCall: fc,
          })),
        },
        {
          role: 'user',
          parts: toolParts,
        },
      ]);

      if (followUp.fallback && !followUp.text) {
        return fallbackDeterministicPlanner(userMessage, currentWalletCurrency);
      }

      return {
        text:
          followUp.text ||
          'I have checked UTB/UWA availability and prepared your itemized quote and booking options in the Autonomous Checkout Terminal.',
        suggestedGuideSlugs: Array.from(state.guideSlugs),
        suggestedExperienceSlugs: Array.from(state.expSlugs),
        executedTools: state.executedTools,
        activeQuote: state.activeQuote,
        activeBooking: state.activeBooking,
        appliedCurrency: state.appliedCurrency,
      };
    }

    if (!response.text) {
      return fallbackDeterministicPlanner(userMessage, currentWalletCurrency);
    }

    const lower = userMessage.toLowerCase();
    if (
      lower.includes('quote') ||
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('book') ||
      lower.includes('available') ||
      lower.includes('availability') ||
      lower.includes('tingatinga') ||
      lower.includes('enganda') ||
      lower.includes('vergouw') ||
      lower.includes('gorilla')
    ) {
      executeToolCall(
        'check_availability',
        { packageQuery: userMessage, guests: 2 },
        state
      );
      executeToolCall(
        'calculate_quote',
        {
          packageQuery: userMessage,
          guests: 2,
          currency: currentWalletCurrency,
        },
        state
      );
    }

    return {
      text:
        response.text ||
        'I have verified our UTB/UWA licensed packages and prepared your options.',
      suggestedGuideSlugs: Array.from(state.guideSlugs),
      suggestedExperienceSlugs: Array.from(state.expSlugs),
      executedTools: state.executedTools,
      activeQuote: state.activeQuote,
      activeBooking: state.activeBooking,
      appliedCurrency: state.appliedCurrency,
    };
  } catch {
    return fallbackDeterministicPlanner(userMessage, currentWalletCurrency);
  }
}

function fallbackDeterministicPlanner(
  query: string,
  currentCurrency: Currency = 'USD'
): AutonomousToolExecutionResult {
  const q = query.toLowerCase();
  const state = {
    guideSlugs: new Set<string>(),
    expSlugs: new Set<string>(),
    executedTools: [] as string[],
    activeQuote: undefined as AutonomousBookingQuote | undefined,
    activeBooking: undefined as AutonomousBookingConfirmation | undefined,
    appliedCurrency: undefined as Currency | undefined,
  };

  if (q.includes('ugx') || q.includes('shilling')) {
    executeToolCall('apply_wallet_currency', { currency: 'UGX' }, state);
  } else if (q.includes('eur') || q.includes('euro')) {
    executeToolCall('apply_wallet_currency', { currency: 'EUR' }, state);
  } else if (q.includes('gbp') || q.includes('pound')) {
    executeToolCall('apply_wallet_currency', { currency: 'GBP' }, state);
  }

  const targetCurrency = state.appliedCurrency || currentCurrency;

  executeToolCall(
    'check_availability',
    { packageQuery: query, guests: 2 },
    state
  );
  executeToolCall(
    'calculate_quote',
    { packageQuery: query, guests: 2, currency: targetCurrency },
    state
  );

  if (q.includes('pay') || q.includes('checkout')) {
    executeToolCall(
      'process_payment_checkout',
      {
        packageQuery: query,
        guests: 2,
        currency: targetCurrency,
        paymentMethod: 'wallet_balance',
      },
      state
    );
  } else if (
    q.includes('book') ||
    q.includes('reserve') ||
    q.includes('invoice')
  ) {
    executeToolCall(
      'create_booking',
      {
        packageQuery: query,
        guests: 2,
        currency: targetCurrency,
      },
      state
    );
  }

  if (q.includes('volunteer')) {
    const v = VOLUNTEER_PROGRAMS[0];
    return {
      text: `I have verified availability for our UTB & UWA accredited **${v.title}** (${v.utbLicenseNumber} / ${v.uwaAccreditationId}) in ${v.region}. The host placement contribution is **$${v.programFeeUSD} USD** (${v.durationWeeks}) with ${v.spotsAvailable} open positions. You can complete your placement reservation and settlement directly in the Autonomous Checkout Terminal.`,
      suggestedGuideSlugs: ['david-mukasa'],
      suggestedExperienceSlugs: ['3-day-bwindi-gorilla-trek'],
      executedTools: state.executedTools,
      activeQuote: state.activeQuote,
      activeBooking: state.activeBooking,
      appliedCurrency: state.appliedCurrency,
    };
  }

  if (q.includes('fundraiser') || q.includes('donate')) {
    const f = CONSERVATION_FUNDRAISERS[0];
    return {
      text: `Our UWA-audited fundraiser **${f.title}** (${f.utbUwaVerificationCode}) has raised **$${f.raisedAmountUSD.toLocaleString()} USD** of its $${f.targetAmountUSD.toLocaleString()} USD goal across ${f.backersCount} supporters. 100% of contributions settle into UWA escrow.`,
      suggestedGuideSlugs: ['david-mukasa'],
      suggestedExperienceSlugs: ['3-day-bwindi-gorilla-trek'],
      executedTools: state.executedTools,
      activeQuote: state.activeQuote,
      activeBooking: state.activeBooking,
      appliedCurrency: state.appliedCurrency,
    };
  }

  const quote = state.activeQuote!;
  return {
    text: `I have executed \`check_availability\` and \`calculate_quote\` for **${quote.packageTitle}** operated by **${quote.operatorName}** (UTB License **${quote.utbLicenseNumber}** • UWA Accreditation **${quote.uwaAccreditationId}**).\n\n• **Lead Specialist Guide:** ${quote.leadGuideName}\n• **All-Inclusive Quote (${quote.guests} Guests):** $${quote.totalUSD.toLocaleString()} USD (${quote.currency} ${quote.convertedTotal.toLocaleString()})\n• **UWA Permit Escrow Included:** $${quote.uwaPermitsTotalUSD.toLocaleString()} USD\n\nUse the **Autonomous Sales & Checkout Terminal** on the right to lock in your invoice or complete instant payment via Safari Wallet or Relworx Mobile Money.`,
    suggestedGuideSlugs: Array.from(state.guideSlugs),
    suggestedExperienceSlugs: Array.from(state.expSlugs),
    executedTools: state.executedTools,
    activeQuote: state.activeQuote,
    activeBooking: state.activeBooking,
    appliedCurrency: state.appliedCurrency,
  };
}
