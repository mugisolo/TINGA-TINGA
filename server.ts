import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  GUIDES,
  EXPERIENCES,
  PERMIT_FACTS,
  DESTINATIONS,
  SAMPLE_REVIEWS,
  JOURNAL_ARTICLES,
  HQ_ADDRESS,
} from './src/data/seedData';
import { ENGANDA_CONCIERGE_SYSTEM_PROMPT } from './src/config/systemPrompt';
import {
  executeConciergeTool,
  generateRuleBasedConciergeReply,
} from './src/concierge/conciergeEngine';
import { Lead, ChatSession } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory store for submitted leads and chat sessions
const inMemoryLeads: Lead[] = [
  {
    id: 'eng_lead_seed_1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.co.uk',
    whatsapp: '+44 7700 900123',
    partySize: 2,
    targetDates: 'November 2026',
    budgetTier: 'luxury',
    interests: ['gorillas', 'chimps'],
    regions: ['Bwindi & Mgahinga', 'Kibale Forest'],
    durationDays: 5,
    preferredGuideSlug: 'samuel-kato',
    experienceSlug: '5-day-gorillas-and-kibale-chimps',
    notes: 'Interested in US$600 low-season November Bwindi gorilla permits with Samuel Kato.',
    status: 'quote_sent',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const inMemorySessions: Record<string, ChatSession> = {};

// ================= REST API ENDPOINTS =================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    operator: 'Enganda Safaris',
    headOffice: HQ_ADDRESS,
    timeEAT: new Date().toISOString(),
  });
});

app.get('/api/guides', (_req, res) => {
  res.json(GUIDES);
});

app.get('/api/guides/:slug', (req, res) => {
  const guide = GUIDES.find((g) => g.slug === req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  res.json(guide);
});

app.get('/api/experiences', (_req, res) => {
  res.json(EXPERIENCES);
});

app.get('/api/experiences/:slug', (req, res) => {
  const exp = EXPERIENCES.find((e) => e.slug === req.params.slug);
  if (!exp) return res.status(404).json({ error: 'Experience not found' });
  res.json(exp);
});

app.get('/api/destinations', (_req, res) => {
  res.json(DESTINATIONS);
});

app.get('/api/permits', (_req, res) => {
  res.json(PERMIT_FACTS);
});

app.get('/api/reviews', (_req, res) => {
  res.json(SAMPLE_REVIEWS);
});

app.get('/api/testimonials', (_req, res) => {
  res.json(SAMPLE_REVIEWS);
});

app.get('/api/journal', (_req, res) => {
  res.json(JOURNAL_ARTICLES);
});

app.get('/api/leads', (_req, res) => {
  res.json(inMemoryLeads);
});

app.post('/api/leads', (req, res) => {
  const newLead: Lead = {
    id: req.body.id || 'eng_lead_' + Date.now(),
    name: req.body.name || 'Safari Guest',
    email: req.body.email || '',
    whatsapp: req.body.whatsapp || '',
    partySize: Number(req.body.partySize) || 2,
    targetDates: req.body.targetDates || 'Flexible 2026/2027',
    budgetTier: req.body.budgetTier || 'luxury',
    interests: Array.isArray(req.body.interests) ? req.body.interests : ['gorillas'],
    regions: req.body.regions,
    durationDays: req.body.durationDays,
    preferredGuideSlug: req.body.preferredGuideSlug,
    experienceSlug: req.body.experienceSlug,
    notes: req.body.notes,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  inMemoryLeads.unshift(newLead);
  res.status(201).json(newLead);
});

// ================= AI SAFARI ITINERARY GENERATOR (GEMINI 3.8 FLASH) =================

function buildDeterministicUgandaItinerary(params: {
  region: string;
  budgetTier: 'mid-range' | 'luxury' | 'signature';
  activities: string[];
  durationDays: number;
  partySize: number;
  specialRequests?: string;
}) {
  const { region, budgetTier, activities, durationDays, partySize } = params;
  const cleanDays = Math.max(2, Math.min(12, Number(durationDays) || 5));
  const cleanParty = Math.max(1, Math.min(12, Number(partySize) || 2));

  // Match guide based on region & activity
  const matchedGuide =
    GUIDES.find((g) =>
      g.regionsCovered.some((r) =>
        region.toLowerCase().includes(r.toLowerCase().split(' ')[0])
      )
    ) ||
    GUIDES.find((g) =>
      activities.some((act) =>
        g.specialties.some((s) => act.toLowerCase().includes(s))
      )
    ) ||
    GUIDES[0];

  const includeGorillas =
    activities.some((a) => a.toLowerCase().includes('gorilla') || a.toLowerCase().includes('trek')) ||
    region.toLowerCase().includes('bwindi') ||
    region.toLowerCase().includes('mgahinga') ||
    region.toLowerCase().includes('grand');

  const includeChimps =
    activities.some((a) => a.toLowerCase().includes('chimp') || a.toLowerCase().includes('primate')) ||
    region.toLowerCase().includes('kibale') ||
    region.toLowerCase().includes('queen');

  const dailyBase =
    budgetTier === 'signature' ? 890 : budgetTier === 'luxury' ? 590 : 390;

  const permitBreakdown: { permitName: string; costUSD: number }[] = [];
  if (includeGorillas) {
    permitBreakdown.push({
      permitName: 'UWA Mountain Gorilla Trekking Permit (Bwindi/Mgahinga)',
      costUSD: 800,
    });
  }
  if (includeChimps) {
    permitBreakdown.push({
      permitName: 'UWA Kibale Chimpanzee Tracking Permit',
      costUSD: 250,
    });
  }
  if (permitBreakdown.length === 0) {
    permitBreakdown.push({
      permitName: 'Uganda Wildlife Authority National Park Entry & Ranger Fees',
      costUSD: 160,
    });
  }

  const permitTotal = permitBreakdown.reduce((sum, p) => sum + p.costUSD, 0);
  const estimatedPerPersonUSD = cleanDays * dailyBase + permitTotal;
  const totalPackageUSD = estimatedPerPersonUSD * cleanParty;
  const depositAmountUSD = Math.round(totalPackageUSD * 0.3);

  const lodgePool =
    budgetTier === 'signature'
      ? ['Sanctuary Gorilla Forest Camp', 'Nile Safari Lodge', 'Apoka Safari Lodge', 'Hotel No.5 Entebbe']
      : budgetTier === 'luxury'
      ? ['Buhoma Lodge Bwindi', 'Primate Lodge Kibale', 'Paraa Safari Lodge', 'Kyambura Gorge Lodge']
      : ['Ichumbi Gorilla Lodge', 'Turaco Treetops Kibale', 'Pakuba Safari Lodge', 'Mabamba Papyrus Eco-Camp'];

  const days = Array.from({ length: cleanDays }, (_, i) => {
    const dayNum = i + 1;
    if (dayNum === 1) {
      return {
        day: 1,
        title: `Entebbe Welcome Briefing & Overland Transfer to ${region}`,
        destination: `Entebbe to ${region}`,
        morningActivity: `Meet your named Enganda specialist ${matchedGuide.name} at our Bugonga Head Office (5 mins from Entebbe Airport) for Ugandan coffee, route map review, and official UWA permit inspection.`,
        afternoonActivity: `Scenic drive in your private 4x4 Land Cruiser with pop-up roof toward ${region}, stopping at the Equator crossing or Mabamba/Ziwa conservation corridor en route.`,
        accommodation: lodgePool[0],
        meals: 'Breakfast, Lunch, Dinner',
        driveTime: '4.5–6 hours via scenic highway',
        wildlifeHighlight: 'Grey Crowned Crane, Rothschild Giraffe or Papyrus Endemics',
      };
    }
    if (dayNum === cleanDays) {
      return {
        day: dayNum,
        title: `Sunrise Nature Walk in ${region} & Return to Entebbe`,
        destination: `${region} to Entebbe Peninsula`,
        morningActivity: `Final dawn birding or crater rim walk led by ${matchedGuide.name}, capturing golden-hour photography before breakfast.`,
        afternoonActivity: `Return journey to Entebbe with an artisanal lunch stop and evening drop-off at Entebbe International Airport or your lakeside partner hotel.`,
        accommodation: 'Entebbe Departure / Optional Hotel No.5 Day Room',
        meals: 'Breakfast, Lunch',
        driveTime: '5 hours return to Entebbe',
        wildlifeHighlight: 'Great Blue Turaco, Black-and-White Colobus, Ankole Long-Horned Cattle',
      };
    }
    if (dayNum === 2 && includeGorillas) {
      return {
        day: 2,
        title: 'Bwindi Impenetrable Forest Mountain Gorilla Trekking',
        destination: 'Bwindi Impenetrable National Park',
        morningActivity: `7:30 AM UWA ranger briefing at the trailhead followed by a guided montane rainforest trek to spend one full, unhurried hour observing a habituated mountain gorilla family.`,
        afternoonActivity: `Receive your official UWA Gorilla Trekking Certificate and enjoy an optional Batwa forest heritage walk or quiet forest-edge recovery at the lodge.`,
        accommodation: lodgePool[0],
        meals: 'Breakfast, Packed Trail Lunch, Dinner',
        driveTime: '30 mins to trailhead',
        wildlifeHighlight: 'Mountain Gorilla Silverback & Infant Family, L’Hoest’s Monkey',
      };
    }
    if (dayNum === 3 && includeChimps) {
      return {
        day: 3,
        title: 'Kibale Forest Chimpanzee Tracking & Bigodi Wetland Walk',
        destination: 'Kibale Forest & Bigodi Sanctuary',
        morningActivity: `Dawn trek from Kanyanchu Visitor Centre under towering fig trees to track wild Eastern chimpanzees and 12 other primate species with ${matchedGuide.name}.`,
        afternoonActivity: `Guided boardwalk excursion through the community-run Bigodi Wetland Sanctuary and visit to the Bigodi Women’s Basketry Cooperative.`,
        accommodation: lodgePool[1 % lodgePool.length],
        meals: 'Breakfast, Lunch, Dinner',
        driveTime: '2–3 hours between sectors',
        wildlifeHighlight: 'Eastern Chimpanzee, Uganda Red Colobus, Great Blue Turaco',
      };
    }
    return {
      day: dayNum,
      title: `${region} Savanna Game Drive, Boat Launch & Cultural Encounter`,
      destination: region,
      morningActivity: `Sunrise off-track wildlife and photography circuit with ${matchedGuide.name} in the private 4x4 Land Cruiser, scanning for lions, elephants, and endemic birds.`,
      afternoonActivity: `Private boat launch along the Kazinga Channel / Victoria Nile or a respectful visit to a local Ugandan community homestead and coffee farm.`,
      accommodation: lodgePool[dayNum % lodgePool.length],
      meals: 'Breakfast, Lunch, Dinner',
      driveTime: 'Game viewing & short park transfers',
      wildlifeHighlight: 'Tree-Climbing Lions, African Bush Elephant, Hippo Pods, Fish Eagle',
    };
  });

  const randCode = Math.floor(100000 + Math.random() * 900000);
  return {
    id: `itin_${Date.now()}`,
    referenceCode: `ENG-AI-${randCode}`,
    title: `${cleanDays}-Day Custom ${region} & ${activities[0] || 'Uganda'} Expedition`,
    subtitle: `Private ${budgetTier} Uganda safari tailored for ${cleanParty} ${
      cleanParty === 1 ? 'traveler' : 'travelers'
    }, led from Entebbe by ${matchedGuide.name}.`,
    region,
    budgetTier,
    activityFocus: activities.join(', ') || 'Wildlife, Primate Trekking & Culture',
    durationDays: cleanDays,
    partySize: cleanParty,
    estimatedPerPersonUSD,
    totalPackageUSD,
    depositAmountUSD,
    matchedGuideSlug: matchedGuide.slug,
    matchedGuideName: matchedGuide.name,
    matchedGuideReason: `${matchedGuide.name} is a UTB-licensed specialist from ${matchedGuide.homeRegion} with ${matchedGuide.yearsExperience} years of field experience leading ${activities.join(' and ') || 'custom Uganda'} safaris.`,
    permitBreakdown,
    recommendedPartnerStays: lodgePool.slice(0, 3),
    days,
    conservationNote:
      'Every Enganda itinerary stays 100% within Uganda, includes official UWA conservation permits, and contributes US$25 per booking to our Porter Welfare & Community Water Fund.',
    createdAt: new Date().toISOString(),
  };
}

app.post('/api/itinerary/generate', async (req, res) => {
  const {
    region = 'Bwindi & Mgahinga + Queen Elizabeth NP',
    budgetTier = 'luxury',
    activities = ['Mountain Gorilla Trekking', 'Savanna Wildlife & Boat Cruise'],
    durationDays = 5,
    partySize = 2,
    specialRequests = '',
  } = req.body || {};

  const cleanDays = Math.max(2, Math.min(12, Number(durationDays) || 5));
  const cleanParty = Math.max(1, Math.min(12, Number(partySize) || 2));
  const cleanTier = (['mid-range', 'luxury', 'signature'].includes(budgetTier)
    ? budgetTier
    : 'luxury') as 'mid-range' | 'luxury' | 'signature';
  const activityList: string[] = Array.isArray(activities)
    ? activities
    : [String(activities || 'Gorilla Trekking & Wildlife')];

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const guideRosterSummary = GUIDES.map(
        (g) =>
          `${g.name} (slug: "${g.slug}", homeRegion: "${g.homeRegion}", specialties: [${g.specialties.join(
            ', '
          )}], yearsExperience: ${g.yearsExperience})`
      ).join('\n');

      const prompt = `Design a custom ${cleanDays}-day private Uganda safari itinerary for ${cleanParty} guests.
User Preferences:
- Target Uganda Region(s): ${region}
- Comfort / Budget Tier: ${cleanTier} (mid-range ~$390/day + permits, luxury ~$590/day + permits, signature ~$890/day + permits)
- Preferred Activities: ${activityList.join(', ')}
- Additional Notes: ${specialRequests || 'Include authentic Ugandan cultural touchpoints and unhurried wildlife viewing'}

Strict Enganda Safaris Rules:
1. All destinations MUST be 100% inside Uganda (e.g., Entebbe, Mabamba Swamp, Bwindi Impenetrable NP, Mgahinga, Kibale Forest, Queen Elizabeth NP, Murchison Falls NP, Ziwa Rhino Sanctuary, Kidepo Valley NP, Rwenzori Mountains, Lake Bunyonyi, Jinja).
2. Match the itinerary to the best guide from this exact Enganda roster:
${guideRosterSummary}
3. Use accurate UWA permit tariffs (Mountain Gorilla Trekking Permit = US$800, Gorilla Habituation = US$1500, Kibale Chimpanzee Permit = US$250, Kyambura Gorge Chimp Permit = US$100).
4. Provide exactly ${cleanDays} day objects in the "days" array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the Chief Expedition Architect at Enganda Safaris in Entebbe, Uganda. Build accurate, inspiring, logistically realistic multi-day Uganda safari itineraries led by a named Ugandan guide from our collective. Always return valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Compelling editorial title for the custom Uganda safari.',
              },
              subtitle: {
                type: Type.STRING,
                description: '1-2 sentence summary highlighting the route, pace, and named guide.',
              },
              matchedGuideSlug: {
                type: Type.STRING,
                description: 'Exact slug of the matched guide from the Enganda roster.',
              },
              matchedGuideName: {
                type: Type.STRING,
                description: 'Full name of the matched Ugandan guide.',
              },
              matchedGuideReason: {
                type: Type.STRING,
                description: 'Why this specific guide is the ideal match for the region and activities.',
              },
              estimatedPerPersonUSD: {
                type: Type.INTEGER,
                description: 'Realistic per-person total price in USD including vehicle, full-board lodges, and UWA permits.',
              },
              permitBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    permitName: { type: Type.STRING },
                    costUSD: { type: Type.INTEGER },
                  },
                  required: ['permitName', 'costUSD'],
                },
              },
              recommendedPartnerStays: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 recommended Ugandan partner lodges, hotels, or camp sites.',
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    morningActivity: { type: Type.STRING },
                    afternoonActivity: { type: Type.STRING },
                    accommodation: { type: Type.STRING },
                    meals: { type: Type.STRING },
                    driveTime: { type: Type.STRING },
                    wildlifeHighlight: { type: Type.STRING },
                  },
                  required: [
                    'day',
                    'title',
                    'destination',
                    'morningActivity',
                    'afternoonActivity',
                    'accommodation',
                    'meals',
                    'driveTime',
                    'wildlifeHighlight',
                  ],
                },
              },
              conservationNote: {
                type: Type.STRING,
                description: 'How this itinerary supports UWA conservation and Ugandan local communities.',
              },
            },
            required: [
              'title',
              'subtitle',
              'matchedGuideSlug',
              'matchedGuideName',
              'matchedGuideReason',
              'estimatedPerPersonUSD',
              'permitBreakdown',
              'recommendedPartnerStays',
              'days',
              'conservationNote',
            ],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        const validGuide =
          GUIDES.find((g) => g.slug === parsed.matchedGuideSlug) || GUIDES[0];
        const perPersonUSD = Number(parsed.estimatedPerPersonUSD) || cleanDays * 590 + 800;
        const totalPackageUSD = perPersonUSD * cleanParty;
        const depositAmountUSD = Math.round(totalPackageUSD * 0.3);
        const randCode = Math.floor(100000 + Math.random() * 900000);

        return res.json({
          id: `itin_${Date.now()}`,
          referenceCode: `ENG-AI-${randCode}`,
          title: parsed.title,
          subtitle: parsed.subtitle,
          region,
          budgetTier: cleanTier,
          activityFocus: activityList.join(', '),
          durationDays: cleanDays,
          partySize: cleanParty,
          estimatedPerPersonUSD: perPersonUSD,
          totalPackageUSD,
          depositAmountUSD,
          matchedGuideSlug: validGuide.slug,
          matchedGuideName: validGuide.name,
          matchedGuideReason: parsed.matchedGuideReason,
          permitBreakdown: Array.isArray(parsed.permitBreakdown)
            ? parsed.permitBreakdown
            : [],
          recommendedPartnerStays: Array.isArray(parsed.recommendedPartnerStays)
            ? parsed.recommendedPartnerStays
            : [],
          days: Array.isArray(parsed.days) ? parsed.days : [],
          conservationNote: parsed.conservationNote,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('[Gemini Itinerary Generator Error]:', err?.message || err);
    }
  }

  // Fallback itinerary if GEMINI_API_KEY is not present or call fails
  const fallbackItinerary = buildDeterministicUgandaItinerary({
    region,
    budgetTier: cleanTier,
    activities: activityList,
    durationDays: cleanDays,
    partySize: cleanParty,
    specialRequests,
  });

  return res.json(fallbackItinerary);
});

// ================= GEMINI AI CONCIERGE ("GUIDE MATCHER") =================

const conciergeToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'match_guide',
    description:
      'Match the guest with 1 to 3 named Ugandan safari guides from the Enganda collective based on wildlife specialty, Uganda region, or spoken language.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        interest: {
          type: Type.STRING,
          description: 'Specialty e.g. gorillas, chimps, birding, big-game, culture, hiking, photography',
        },
        region: {
          type: Type.STRING,
          description: 'Uganda region e.g. Bwindi, Kibale, Queen Elizabeth, Murchison Falls, Kidepo, Rwenzori, Mabamba',
        },
        language: {
          type: Type.STRING,
          description: 'Preferred language e.g. English, French, German, Luganda, Runyankole, Swahili',
        },
      },
    },
  },
  {
    name: 'search_experiences',
    description: 'Search Enganda Safaris signature Uganda itineraries by duration, region, or wildlife interest.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        maxDays: { type: Type.NUMBER, description: 'Maximum duration in days (1 to 10)' },
        interest: { type: Type.STRING, description: 'Wildlife or activity interest' },
        region: { type: Type.STRING, description: 'Uganda park or region' },
      },
    },
  },
  {
    name: 'get_permit_info',
    description:
      'Fetch official Uganda Wildlife Authority (UWA) gorilla and chimpanzee permit tariffs, low-season discounts (April, May, November), and 1 January 2027 tariff updates.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        parkOrSpecies: {
          type: Type.STRING,
          description: 'Optional filter such as gorilla, chimp, habituation, Bwindi, Kibale, or Kyambura',
        },
      },
    },
  },
  {
    name: 'build_custom_quote',
    description:
      'Calculate an indicative per-person price band in USD for a custom Uganda safari based on duration, comfort tier, and primate permits.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: { type: Type.NUMBER, description: 'Number of safari days in Uganda' },
        partySize: { type: Type.NUMBER, description: 'Number of travelers' },
        comfortTier: { type: Type.STRING, description: 'mid-range, luxury, or signature' },
        includeGorillas: { type: Type.BOOLEAN, description: 'Include US$800 Bwindi gorilla permit' },
        includeChimps: { type: Type.BOOLEAN, description: 'Include US$250 Kibale chimpanzee permit' },
      },
      required: ['days'],
    },
  },
  {
    name: 'create_lead',
    description: 'Save a safari inquiry lead for the Entebbe coordination desk.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        whatsapp: { type: Type.STRING },
        partySize: { type: Type.NUMBER },
        targetDates: { type: Type.STRING },
        budgetTier: { type: Type.STRING },
        preferredGuideSlug: { type: Type.STRING },
        notes: { type: Type.STRING },
      },
      required: ['name'],
    },
  },
  {
    name: 'check_availability',
    description:
      'Record requested dates and return the 12-hour human verification promise with UWA and lodges (never claim live availability).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dates: { type: Type.STRING, description: 'Target travel dates or month' },
      },
      required: ['dates'],
    },
  },
  {
    name: 'handoff_to_human',
    description: 'Provide direct WhatsApp and Entebbe head office contact details for human coordinator follow-up.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING, description: 'Reason for human coordinator handoff' },
      },
      required: ['reason'],
    },
  },
];

app.post('/api/chat', async (req, res) => {
  const { sessionId, message = '', history = [] } = req.body;
  const currentSessionId = sessionId || 'eng_sess_' + Date.now();

  if (!inMemorySessions[currentSessionId]) {
    inMemorySessions[currentSessionId] = {
      id: currentSessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  const session = inMemorySessions[currentSessionId];
  session.messages.push({
    id: 'msg_user_' + Date.now(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  });

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const contents = history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: ENGANDA_CONCIERGE_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: conciergeToolDeclarations }],
        },
      });

      let replyText = response.text || '';
      const executedToolCalls: {
        name: string;
        arguments: Record<string, any>;
        result: any;
      }[] = [];

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const toolName = call.name || 'match_guide';
          const toolArgs = (call.args as Record<string, any>) || {};
          const toolResult = executeConciergeTool(toolName, toolArgs, (lead) =>
            inMemoryLeads.unshift(lead)
          );
          executedToolCalls.push({
            name: toolName,
            arguments: toolArgs,
            result: toolResult,
          });
        }

        const followUp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...contents,
            {
              role: 'model',
              parts: [{ text: replyText || 'Checking Enganda guide profiles and UWA tariffs...' }],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `Tool results: ${JSON.stringify(
                    executedToolCalls
                  )}. Synthesize a warm, concise response naming the matched Ugandan guides, quoting verified UWA permit tariffs, stating that availability is confirmed within 12 hours, and never mentioning vehicle ownership.`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: ENGANDA_CONCIERGE_SYSTEM_PROMPT,
          },
        });

        if (followUp.text) {
          replyText = followUp.text;
        }
      }

      if (replyText) {
        session.messages.push({
          id: 'msg_asst_' + Date.now(),
          role: 'assistant',
          content: replyText,
          toolCalls: executedToolCalls,
          timestamp: new Date().toISOString(),
        });

        return res.json({
          reply: replyText,
          toolCalls: executedToolCalls,
        });
      }
    } catch (err: any) {
      console.error('[Enganda Concierge Gemini Fallback]:', err?.message || err);
    }
  }

  // Deterministic rule-based fallback if GEMINI_API_KEY is unset or fails
  const fallback = generateRuleBasedConciergeReply(message, (lead) =>
    inMemoryLeads.unshift(lead)
  );

  session.messages.push({
    id: 'msg_asst_' + Date.now(),
    role: 'assistant',
    content: fallback.reply,
    toolCalls: fallback.toolCalls,
    timestamp: new Date().toISOString(),
  });

  return res.json(fallback);
});

// ================= VITE DEV SERVER OR PRODUCTION STATIC SERVING =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'))
      ? path.resolve(process.cwd(), 'dist')
      : fs.existsSync(path.resolve(process.cwd(), 'index.html'))
      ? process.cwd()
      : path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enganda Safaris] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
