import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { ITINERARIES, PERMITS_DATA, GROUND_PARTNERS, REVIEWS, TEAM_MEMBERS } from './src/data/seedData';
import { TINGA_ASSISTANT_SYSTEM_PROMPT } from './src/config/systemPrompt';
import { Lead, ChatSession, ChatMessage } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent stores for leads and chat sessions
let inMemoryLeads: Lead[] = [
  {
    id: 'lead_001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'new',
    source: 'trip_planner',
    name: 'Charlotte Dubois',
    email: 'charlotte.dubois@paris-travel.fr',
    phone: '+33 6 12 34 56 78',
    countries: ['Tanzania', 'Uganda'],
    budgetBand: 'Luxury',
    travelersCount: 2,
    targetDates: 'August 2025',
    notes: 'Honeymoon safari: Great Migration in Serengeti + 2 Uganda Gorilla Permits in Bwindi.',
    depositAmountUSD: 4980,
  },
  {
    id: 'lead_002',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'deposit_paid',
    source: 'web_chat',
    name: 'Dr. Marcus Becker',
    email: 'm.becker@berlin-wildlife.de',
    phone: '+49 171 9876543',
    countries: ['Tanzania'],
    budgetBand: 'Signature / Ultra-Luxe',
    travelersCount: 4,
    targetDates: 'October 2025',
    notes: '30% Deposit Paid ($7,800 USD) via DPO Group. Needs 2 custom Land Cruisers with camera beanbags.',
    depositAmountUSD: 7800,
  },
  {
    id: 'lead_003',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'quote_sent',
    source: 'contact_page',
    name: 'Sarah & Liam Jenkins',
    email: 'sarah.j@melbourne-law.com.au',
    phone: '+61 412 345 678',
    countries: ['Rwanda', 'Uganda'],
    budgetBand: 'Luxury',
    travelersCount: 2,
    targetDates: 'January 2026',
    notes: 'Primate focus: Volcanoes NP gorilla trek + Kibale chimps. Quote sent by Akim.',
  },
];

let inMemorySessions: Record<string, ChatSession> = {};

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    operator: 'Tinga Tinga Safari (Arusha, Tanzania)',
    timeEAT: new Date().toISOString(),
  });
});

// Itineraries
app.get('/api/itineraries', (req, res) => {
  res.json(ITINERARIES);
});

app.get('/api/itineraries/:slug', (req, res) => {
  const item = ITINERARIES.find((it) => it.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Itinerary not found' });
  res.json(item);
});

// Permits
app.get('/api/permits', (req, res) => {
  res.json(PERMITS_DATA);
});

// Ground Partners
app.get('/api/partners', (req, res) => {
  res.json(GROUND_PARTNERS);
});

// Reviews
app.get('/api/reviews', (req, res) => {
  res.json(REVIEWS);
});

// Leads
app.get('/api/leads', (req, res) => {
  res.json(inMemoryLeads);
});

app.post('/api/leads', (req, res) => {
  const newLead: Lead = {
    id: 'lead_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: req.body.status || 'new',
    source: req.body.source || 'trip_planner',
    name: req.body.name || 'Anonymous Traveler',
    email: req.body.email || '',
    phone: req.body.phone,
    countries: req.body.countries,
    budgetBand: req.body.budgetBand,
    travelersCount: req.body.travelersCount,
    targetDates: req.body.targetDates,
    notes: req.body.notes,
    depositAmountUSD: req.body.depositAmountUSD,
  };

  inMemoryLeads.unshift(newLead);
  res.status(201).json(newLead);
});

app.patch('/api/leads/:id/status', (req, res) => {
  const lead = inMemoryLeads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  lead.status = req.body.status;
  lead.updatedAt = new Date().toISOString();
  res.json(lead);
});

// Chat Sessions for Admin Inspector
app.get('/api/chat/sessions', (req, res) => {
  res.json(Object.values(inMemorySessions));
});

// Analytics Event Telemetry
app.post('/api/analytics/event', (req, res) => {
  console.log(`[Analytics Event] ${req.body.event}:`, req.body.payload || {});
  res.json({ tracked: true });
});

// WhatsApp Cloud API Webhook verification & incoming
app.get('/api/waba/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.WABA_VERIFY_TOKEN || 'tinga_safari_secret')) {
    console.log('[WABA] Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/waba/webhook', (req, res) => {
  console.log('[WABA] Incoming event payload:', JSON.stringify(req.body).substring(0, 200));
  res.status(200).send('EVENT_RECEIVED');
});

// ================= GEMINI AGENTIC CHAT ENGINE =================

// Tool declarations for Gemini Function Calling
const safariTools: FunctionDeclaration[] = [
  {
    name: 'search_itineraries',
    description: 'Search official Tinga Tinga safari circuits across Tanzania, Uganda, Rwanda, Kenya, or Cross-Border.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        country: { type: Type.STRING, description: 'Tanzania, Uganda, Rwanda, or Kenya' },
        maxDays: { type: Type.NUMBER, description: 'Maximum days' },
        interests: { type: Type.STRING, description: 'Keywords like migration, gorillas, cats, photography' },
      },
    },
  },
  {
    name: 'get_permit_info',
    description: 'Fetch statutory gorilla, chimpanzee, and park permit tariffs for UWA, RDB, and TANAPA.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        park: { type: Type.STRING, description: 'Park name e.g. Bwindi, Volcanoes, Kibale, Serengeti' },
      },
      required: ['park'],
    },
  },
  {
    name: 'build_custom_quote',
    description: 'Draft a customized day-by-day outline and price band. Note: Always quotes in price bands; enforced rule: QUOTES_NEED_APPROVAL=true.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        countries: { type: Type.ARRAY, items: { type: Type.STRING } },
        days: { type: Type.NUMBER },
        travelers: { type: Type.NUMBER },
        budgetTier: { type: Type.STRING },
      },
      required: ['countries', 'days'],
    },
  },
  {
    name: 'create_lead',
    description: 'Create a safari lead for founder Akim in our Arusha office.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        notes: { type: Type.STRING },
      },
      required: ['name'],
    },
  },
  {
    name: 'check_availability',
    description: 'Check dates. Never fabricates live lodge inventory; always responds that Akim confirms within 12 hours.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dates: { type: Type.STRING },
        circuitName: { type: Type.STRING },
      },
      required: ['dates'],
    },
  },
  {
    name: 'handoff_to_human',
    description: 'Flag conversation for Akim on WhatsApp due to special requests or traveler booking intent.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING },
      },
      required: ['reason'],
    },
  },
];

// Execute tool logic
function executeSafariTool(name: string, args: Record<string, any>) {
  switch (name) {
    case 'search_itineraries': {
      const country = args.country?.toLowerCase();
      const results = ITINERARIES.filter((it) => {
        if (!country) return true;
        return it.countries.some((c) => c.toLowerCase().includes(country));
      }).map((it) => ({
        title: it.title,
        slug: it.slug,
        countries: it.countries,
        days: it.durationDays,
        startingPricePerDayUSD: it.startingPricePerDayUSD,
        gorillaPermits: it.gorillaPermitRequired,
      }));
      return { count: results.length, itineraries: results.slice(0, 3) };
    }
    case 'get_permit_info': {
      const park = args.park?.toLowerCase() || '';
      const facts = PERMITS_DATA.filter((p) =>
        p.parkName.toLowerCase().includes(park) || p.country.toLowerCase().includes(park)
      );
      return {
        permits: facts.length > 0 ? facts : PERMITS_DATA,
        guarantee: 'Official scanned government receipts delivered before final trip payment.',
      };
    }
    case 'build_custom_quote': {
      const days = args.days || 8;
      const tier = args.budgetTier || 'Luxury';
      const perDay = tier === 'Mid-Range' ? 550 : tier === 'Signature' ? 1400 : 850;
      return {
        estimatedPriceBand: `$${perDay * days} - $${(perDay + 250) * days} USD per person`,
        depositRequired: '30%',
        disclaimer: 'Draft price band only. All final quotes require human sign-off by founder Akim (QUOTES_NEED_APPROVAL=true).',
      };
    }
    case 'create_lead': {
      const lead: Lead = {
        id: 'lead_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new',
        source: 'assistant_tool',
        name: args.name || 'Anonymous Traveler',
        email: args.email || 'pending@tingatinga.com',
        phone: args.phone,
        notes: args.notes || 'Created via Tinga Assistant',
      };
      inMemoryLeads.unshift(lead);
      return { success: true, leadId: lead.id, message: 'Dispatched to Akim in Arusha' };
    }
    case 'check_availability': {
      return {
        status: 'pending_human_verification',
        message: 'Lodge inventory and UWA/RDB permit quotas must be checked live. Akim’s team confirms within 12 hours.',
      };
    }
    case 'handoff_to_human': {
      return {
        handoff: true,
        contact: 'Akim Mmari (WhatsApp +255 784 123 456)',
        reason: args.reason,
      };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

// Chat API Route
app.post('/api/chat', async (req, res) => {
  const { sessionId, message, language = 'en', history = [] } = req.body;

  // Initialize or retrieve session
  const currentSessionId = sessionId || 'sess_' + Date.now();
  if (!inMemorySessions[currentSessionId]) {
    inMemorySessions[currentSessionId] = {
      id: currentSessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: 'web_widget',
      language: language as any,
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
      const ai = new GoogleGenAI({ apiKey });

      // Convert history
      const contents = history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: TINGA_ASSISTANT_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: safariTools }],
        },
      });

      let replyText = response.text || '';
      const executedToolCalls: any[] = [];

      // Check if function calls exist
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const toolResult = executeSafariTool(call.name, call.args as any);
          executedToolCalls.push({ name: call.name, arguments: call.args, result: toolResult });
        }

        // Secondary resolution with tool result
        const toolResolution = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            ...contents,
            {
              role: 'model',
              parts: [{ text: replyText || 'Calling tools for accurate facts...' }],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `Tool results: ${JSON.stringify(executedToolCalls)}. Now synthesize a concise, warm, transparent answer for the guest adhering to price bands, official permit facts, and offering WhatsApp handoff.`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: TINGA_ASSISTANT_SYSTEM_PROMPT,
          },
        });

        if (toolResolution.text) {
          replyText = toolResolution.text;
        }
      }

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
    } catch (err: any) {
      console.error('[Gemini Error]', err?.message || err);
      // Fall through to concierge rule engine
    }
  }

  // Graceful rule-based fallback concierge if GEMINI_API_KEY is not configured or fails
  let reply = 'Jambo! I am Tinga Assistant, Akim’s safari concierge in Arusha. ';
  const lower = (message || '').toLowerCase();
  const toolCalls: any[] = [];

  if (lower.includes('permit') || lower.includes('gorilla')) {
    const permitData = executeSafariTool('get_permit_info', { park: 'Bwindi' });
    toolCalls.push({ name: 'get_permit_info', arguments: { park: 'Bwindi' }, result: permitData });
    reply += 'Official mountain gorilla permits are $800 USD in Uganda (Bwindi / Mgahinga) and $1,500 USD in Rwanda (Volcanoes NP). Tinga Tinga Safari secures official permits immediately upon receipt of your 30% trip deposit, providing official government receipts before your final balance is due. Would you like to check permit availability with Akim on WhatsApp (+255 784 123 456)?';
  } else if (lower.includes('partner') || lower.includes('who drives') || lower.includes('subcontract')) {
    reply += 'We openly name our local ground partners! In Tanzania, we operate our own direct fleet from Arusha. In Uganda, our vetted partner is Gorilla Highlands Expeditions (AUTO Lic #AUTO-UG-2019-142), and in Kenya, Savannah Trackers Kenya (KATO Bonded #KATO-KE-2020-089). We never hide subcontracting, and our guides receive fair living daily salaries.';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
    const quote = executeSafariTool('build_custom_quote', { countries: ['Tanzania'], days: 8, budgetTier: 'Luxury' });
    toolCalls.push({ name: 'build_custom_quote', arguments: { days: 8 }, result: quote });
    reply += 'We quote in transparent price bands: Mid-Range (~$450–$650 pp/day), Luxury (~$750–$1,100 pp/day), and Ultra-Luxe (~$1,300+ pp/day). A 30% deposit secures private vehicles and permits. All formal quotes require human review by founder Akim (QUOTES_NEED_APPROVAL=true). Shall I connect you with Akim on WhatsApp?';
  } else {
    const itineraries = executeSafariTool('search_itineraries', {});
    toolCalls.push({ name: 'search_itineraries', arguments: {}, result: itineraries });
    reply += 'We craft tailor-made circuits across Tanzania, Kenya, Rwanda, and Uganda—from the Serengeti Great Migration to Bwindi mountain gorillas. We customize every departure around your dates. You can also message founder Akim directly on WhatsApp at +255 784 123 456 anytime!';
  }

  session.messages.push({
    id: 'msg_asst_' + Date.now(),
    role: 'assistant',
    content: reply,
    toolCalls,
    timestamp: new Date().toISOString(),
  });

  res.json({ reply, toolCalls });
});

// ================= VITE MIDDLEWARE OR STATIC SERVING =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tinga Tinga Safari] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
