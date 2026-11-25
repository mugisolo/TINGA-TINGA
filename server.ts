import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const MAX_ACTIVE_PAID_CAROUSEL_SLOTS = 10;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Health & Go Architecture Metadata
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      architecture: 'Go (Golang) Multi-Vendor UTB/UWA Marketplace & GenAI Agent (/backend)',
      maxActiveCarouselSlots: MAX_ACTIVE_PAID_CAROUSEL_SLOTS,
      timestamp: new Date().toISOString(),
    });
  });

  // In-memory state mirroring Go VendorService and BookingService
  const verifiedVendors = [
    {
      id: 'op-enganda-wildlife-safaris',
      slug: 'enganda-safaris',
      name: 'Enganda Safaris',
      vendorType: 'tour_operator',
      utbLicenseNumber: 'UTB/TO/2026/0102',
      uwaAccreditationId: 'UWA-REG-1104-UG',
      headquarters: 'Plot 23A, Manyago, Entebbe, Uganda',
      logoUrl: '/assets/aistudio/enganda-logo-header.png',
      verifiedStatus: 'UTB & UWA Gold Verified',
      rating: 4.98,
    },
    {
      id: 'op-tingatinga-safaris',
      slug: 'tingatinga-safaris',
      name: 'Tingatinga Safaris',
      vendorType: 'tour_operator',
      utbLicenseNumber: 'UTB/TO/2026/0418',
      uwaAccreditationId: 'UWA-REG-8841-UG',
      headquarters: 'Airport Road, Entebbe & Kampala, Uganda',
      logoUrl: '/assets/aistudio/tinga_logo_2_10ada7c3.png',
      verifiedStatus: 'UTB & UWA Gold Verified',
      rating: 4.97,
    },
    {
      id: 'op-shuma-africa-safaris',
      slug: 'shuma-africa-safaris',
      name: 'Shuma Africa Safaris',
      vendorType: 'tour_operator',
      utbLicenseNumber: 'UTB/TO/2026/0794',
      uwaAccreditationId: 'UWA-REG-5520-EA',
      headquarters: 'Entebbe & Arusha Multi-Country Desk',
      verifiedStatus: 'UTB & UWA Cross-Border Verified',
      rating: 4.95,
    },
    {
      id: 'partner-igongo-cultural-hotel',
      slug: 'igongo-country-hotel',
      name: 'Igongo Country Hotel & Cultural Centre',
      vendorType: 'hotel_lodge',
      utbLicenseNumber: 'UTB/HL/2026/0089',
      uwaAccreditationId: 'UWA-HOSP-3310-MB',
      headquarters: 'Biharwe, Mbarara — Western Safari Circuit',
      logoUrl: '/assets/aistudio/logo_igongo_8f5928e8.png',
      verifiedStatus: 'UTB 5-Star Cultural Heritage Partner',
      rating: 4.94,
    },
  ];

  const activeBookings: Record<string, unknown>[] = [];
  const exchangeRates: Record<string, number> = {
    USD: 1,
    UGX: 3750,
    EUR: 0.92,
    GBP: 0.79,
  };

  // Multi-Vendor Marketplace & UTB/UWA Verification Endpoints (Mirroring /backend/handlers/marketplace.go & VendorService)
  const listVendorsHandler = (req: express.Request, res: express.Response) => {
    const filterType = String(req.query.type || '').trim().toLowerCase();
    const filtered = filterType
      ? verifiedVendors.filter((v) => v.vendorType.toLowerCase() === filterType)
      : verifiedVendors;
    res.json({
      authority: 'Uganda Tourism Board (UTB) & Uganda Wildlife Authority (UWA)',
      regulatoryBodies: ['Uganda Tourism Board (UTB)', 'Uganda Wildlife Authority (UWA)'],
      filterType,
      totalVendors: filtered.length,
      vendors: filtered,
    });
  };

  app.get('/api/marketplace/vendors', listVendorsHandler);
  app.get('/api/vendors', listVendorsHandler);

  app.get('/api/vendors/:idOrSlug', (req, res) => {
    const key = req.params.idOrSlug.toLowerCase();
    const found = verifiedVendors.find(
      (v) => v.id.toLowerCase() === key || v.slug.toLowerCase() === key
    );
    if (!found) {
      return res.status(404).json({ error: `vendor '${req.params.idOrSlug}' not found in UTB/UWA registry` });
    }
    return res.json(found);
  });

  app.post('/api/vendors/onboard', (req, res) => {
    const { name, vendorType, utbLicenseNumber, uwaAccreditationId, headquarters, logoUrl } = req.body || {};
    if (!name || !utbLicenseNumber || !uwaAccreditationId) {
      return res.status(400).json({
        error: 'Name, UTB License Number (UTB/...), and UWA Accreditation ID (UWA-...) are required.',
      });
    }
    const newVendor = {
      id: `vendor-utb-${Date.now().toString().slice(-5)}`,
      slug: String(name).toLowerCase().replace(/\s+/g, '-'),
      name,
      vendorType: vendorType || 'tour_operator',
      utbLicenseNumber,
      uwaAccreditationId,
      headquarters: headquarters || 'Kampala / Entebbe, Uganda',
      logoUrl: logoUrl || '/assets/aistudio/enganda-logo-header.png',
      verifiedStatus: 'UTB & UWA Newly Verified Partner',
      rating: 4.9,
    };
    verifiedVendors.push(newVendor);
    return res.status(201).json({
      status: 'VERIFIED_ONBOARDED',
      message: 'Vendor successfully verified against UTB/UWA compliance standards.',
      vendor: newVendor,
    });
  });

  app.post('/api/marketplace/carousel/validate', (req, res) => {
    const currentActiveCount = Number(req.body?.activeCount ?? 10);
    if (currentActiveCount >= MAX_ACTIVE_PAID_CAROUSEL_SLOTS) {
      return res.json({
        allowed: false,
        maxPaidSlots: MAX_ACTIVE_PAID_CAROUSEL_SLOTS,
        activeCount: currentActiveCount,
        message:
          'Paid-tier featured carousel is at its strict 10-slot cap. Additional items are queued in Standby Rotation (Slot 011: Shoebill & Chimps).',
      });
    }
    return res.json({
      allowed: true,
      maxPaidSlots: MAX_ACTIVE_PAID_CAROUSEL_SLOTS,
      activeCount: currentActiveCount,
    });
  });

  // Booking Orchestration Service Layer Endpoints (Mirroring /backend/services/booking_service.go)
  app.post('/api/bookings/availability', (req, res) => {
    const { packageIdOrName = '8-Day Tingatinga Safaris Signature (Gorillas, Chimps & Lions)', travelDate = '2026-07-15', guests = 2 } = req.body || {};
    res.json({
      available: true,
      packageId: 'pkg-tingatinga-8d-primates',
      packageTitle: packageIdOrName,
      travelDate,
      guests: Number(guests) || 2,
      permitQuotaLeft: 6,
      uwaGateStatus: 'UWA Buhoma & Kanyanchu Quotas Confirmed',
      assignedGuide: 'Sam M. — Lead Primate & Savannah Specialist (UWA-G-1084)',
      vendorName: 'Tingatinga Safaris',
      utbLicenseNumber: 'UTB/TO/2026/0418',
      uwaAccreditationId: 'UWA-REG-8841-UG',
    });
  });

  app.post('/api/bookings/quote', (req, res) => {
    const {
      packageIdOrName = '8-Day Tingatinga Safaris Signature (Gorillas, Chimps & Lions)',
      guests = 2,
      tier = 'midrange',
      currency = 'USD',
      includeHotelAddon = true,
      includeVehicle4x4 = true,
    } = req.body || {};
    const numGuests = Math.max(1, Number(guests) || 2);
    const curr = String(currency || 'USD').toUpperCase();
    const rate = exchangeRates[curr] || 1;
    const basePerPerson = tier === 'luxury' ? 5450 : tier === 'budget' ? 3290 : 3980;
    const subtotalUSD = basePerPerson * numGuests;
    const permitsTotalUSD = 1050 * numGuests;
    const hotelAddonUSD = includeHotelAddon ? 155 * numGuests : 0;
    const vehicleAddonUSD = includeVehicle4x4 ? 195 * 4 : 0;
    const grandTotalUSD = subtotalUSD + hotelAddonUSD + vehicleAddonUSD;

    res.json({
      quoteReference: `QT-UTB-${Date.now().toString().slice(-5)}`,
      packageId: 'pkg-tingatinga-8d-primates',
      packageTitle: packageIdOrName,
      vendorName: 'Tingatinga Safaris',
      utbLicenseNumber: 'UTB/TO/2026/0418',
      tier,
      guests: numGuests,
      basePricePerPersonUSD: basePerPerson,
      subtotalUSD,
      uwaPermitsTotalUSD: permitsTotalUSD,
      hotelAddonUSD,
      vehicleAddonUSD,
      grandTotalUSD,
      currency: curr,
      exchangeRateFromUSD: rate,
      convertedGrandTotal: Math.round(grandTotalUSD * rate * 100) / 100,
    });
  });

  app.post('/api/bookings/currency', (req, res) => {
    const curr = String(req.body?.currency || 'USD').toUpperCase();
    const amountUSD = Number(req.body?.amountUSD || 0);
    const rate = exchangeRates[curr] || 1;
    res.json({
      previousCurrency: 'USD',
      activeCurrency: curr,
      rateFromUSD: rate,
      amountUSD,
      convertedAmount: Math.round(amountUSD * rate * 100) / 100,
      status: 'WALLET_CURRENCY_SYNCHRONIZED',
    });
  });

  app.get('/api/bookings', (_req, res) => {
    res.json({ bookings: activeBookings, count: activeBookings.length });
  });

  app.post('/api/bookings', (req, res) => {
    const {
      packageTitle = '8-Day Tingatinga Safaris Signature (Gorillas, Chimps & Lions)',
      guestName = 'Enganda VIP Guest',
      guestEmail = 'guest@engandasafaris.com',
      guests = 2,
      travelDate = '2026-07-15',
      tier = 'midrange',
      totalUSD = 7960,
      currency = 'USD',
    } = req.body || {};
    const curr = String(currency).toUpperCase();
    const rate = exchangeRates[curr] || 1;
    const stamp = Date.now().toString().slice(-6);
    const booking = {
      bookingReference: `ENG-${stamp}`,
      invoiceNumber: `INV-UWA-${stamp}`,
      packageTitle,
      guestName,
      guestEmail,
      guests: Number(guests) || 2,
      travelDate,
      tier,
      totalUSD: Number(totalUSD) || 7960,
      currency: curr,
      convertedTotal: Math.round((Number(totalUSD) || 7960) * rate * 100) / 100,
      escrowAccount: 'Ecobank Uganda & FINCA Uganda UWA Permit Escrow Trust',
      utbVerificationBadge: 'UTB/TO/2026/0418 • UWA-REG-8841-UG',
      status: 'CONFIRMED_PENDING_SETTLEMENT',
      createdAt: new Date().toISOString(),
    };
    activeBookings.push(booking);
    res.status(201).json(booking);
  });

  app.post('/api/bookings/checkout', (req, res) => {
    const {
      bookingReference = `ENG-${Date.now().toString().slice(-6)}`,
      paymentMethod = 'safari_wallet',
      currency = 'USD',
      amountUSD = 7960,
    } = req.body || {};
    const curr = String(currency).toUpperCase();
    const rate = exchangeRates[curr] || 1;
    res.json({
      transactionId: `TXN-RELWORX-${Date.now().toString().slice(-6)}`,
      bookingReference,
      paymentMethod,
      providerChannel: 'Relworx Mobile Money & Ecobank Escrow Settlement',
      currency: curr,
      amountUSD: Number(amountUSD) || 7960,
      settledAmount: Math.round((Number(amountUSD) || 7960) * rate * 100) / 100,
      paymentStatus: 'ESCROW_SETTLED_UWA_PERMIT_LOCKED',
      timestamp: new Date().toISOString(),
    });
  });

  // Autonomous Agent Tool Execution Endpoint (Mirroring /backend/handlers/agent.go)
  app.post('/api/agent/execute-tool', (req, res) => {
    const { toolName, args = {} } = req.body || {};
    const stamp = Date.now().toString().slice(-6);
    res.json({
      tool: toolName,
      executedAt: new Date().toISOString(),
      referenceId: `ENG-${stamp}`,
      args,
    });
  });

  // Server-side Gemini API route for AI Guide Matcher & Autonomous Agentic Safari Planner
  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          text: '',
          functionCalls: [],
          fallback: true,
          fallbackReason: 'missing_api_key',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const { contents, systemInstruction, tools, config } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          ...config,
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(tools ? { tools } : {}),
        },
      });

      return res.json({
        text: response.text || '',
        functionCalls: response.functionCalls || [],
        fallback: false,
      });
    } catch (_error) {
      // Gracefully fall back to the deterministic UTB/UWA Autonomous Planner engine when upstream billing/quota is unavailable
      return res.status(200).json({
        text: '',
        functionCalls: [],
        fallback: true,
        fallbackReason: 'upstream_api_unavailable',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enganda Safaris server running on http://localhost:${PORT}`);
  });
}

startServer();
