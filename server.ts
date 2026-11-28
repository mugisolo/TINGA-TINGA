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

  // ============================================================================
  // CMS & ERP BACKEND FUNCTIONALITY (Mirroring /backend/services/cms_erp_service.go)
  // ============================================================================
  const cmsSiteContentBlocks = [
    {
      id: 'cms-block-hero-standalone',
      key: 'homepage_standalone_frame',
      section: 'Homepage Standalone Editorial Frame',
      title: 'East Africa, shown to you by the people who call it home.',
      subtitle: 'Uganda-First Specialist Marketplace · UTB & UWA Verified Multi-Vendor Platform',
      bodyText:
        'Connect directly with Uganda Tourism Board (UTB) and Uganda Wildlife Authority (UWA) licensed guides, safari operators, 4x4 fleet drivers, and heritage hotels—backed by Ecobank & FINCA permit escrow.',
      ctaLabel: 'Browse Verified Service Providers',
      ctaUrl: '/service-providers',
      active: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cms-block-utb-compliance',
      key: 'utb_uwa_regulatory_seal',
      section: 'Regulatory Compliance Banner',
      title: '100% UTB & UWA Verified Service Providers',
      subtitle: 'Strict Multi-Vendor Verification & Escrow Protection',
      bodyText:
        'Every Guide, Safari Operator, Driver Fleet, and Hotel on Enganda Safaris carries an active UTB license and UWA accreditation number.',
      ctaLabel: 'Verify Licenses',
      ctaUrl: '/service-providers',
      active: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cms-block-footer-attribution',
      key: 'footer_powered_by_text',
      section: 'Footer Attribution & Governance',
      title: 'Powered by WildLife, RONSOL, RELWORX, FINCA & ECO Bank, SPYDA MC',
      subtitle: 'Official Conservation, Banking & Fintech Infrastructure',
      bodyText:
        'Direct multi-currency wallet settlement (UGX, USD, EUR, GBP) via Relworx Mobile Money, Ecobank Pan-African Escrow, and FINCA Uganda.',
      active: true,
      updatedAt: new Date().toISOString(),
    },
  ];

  const cmsFooterPartnerLogos = [
    {
      id: 'logo-uwa',
      name: 'UWA',
      subtitle: 'Uganda Wildlife Authority',
      logoUrl: '/assets/aistudio/UWA_f423bf74.png',
      category: 'Government & Conservation',
      websiteUrl: 'https://ugandawildlife.org',
      active: true,
      displayOrder: 1,
    },
    {
      id: 'logo-utb',
      name: 'UTB',
      subtitle: 'Uganda Tourism Board',
      logoUrl: '/assets/aistudio/UTB_08177dce.png',
      category: 'Government & Conservation',
      websiteUrl: 'https://utb.go.ug',
      active: true,
      displayOrder: 2,
    },
    {
      id: 'logo-ecobank',
      name: 'ECO Bank',
      subtitle: 'Ecobank Pan-African Banking & Escrow Partner',
      logoUrl: '/assets/aistudio/ecobank.svg',
      category: 'Banking & Fintech',
      websiteUrl: 'https://ecobank.com',
      active: true,
      displayOrder: 3,
    },
    {
      id: 'logo-finca',
      name: 'FINCA',
      subtitle: 'FINCA Banking & Microfinance Partner',
      logoUrl: '/assets/aistudio/finca_84848a21.png',
      category: 'Banking & Fintech',
      websiteUrl: 'https://finca.ug',
      active: true,
      displayOrder: 4,
    },
    {
      id: 'logo-relworx',
      name: 'RELWORX',
      subtitle: 'Digital Payments & Escrow Infrastructure',
      logoUrl: '/assets/aistudio/relworx_9ec37c45.jfif',
      category: 'Banking & Fintech',
      websiteUrl: 'https://relworx.com',
      active: true,
      displayOrder: 5,
    },
  ];

  const cmsJournalArticles = [
    {
      id: 'jour-bwindi-permit-escrow',
      slug: 'how-uwa-gorilla-permit-escrow-works',
      title: 'How UWA Mountain Gorilla Permit Escrow Protects Travelers & Guides',
      category: 'Conservation & Regulation',
      authorName: 'Sam M. (UWA-G-1084)',
      readTime: '6 min read',
      summary:
        'An inside look at how Uganda Wildlife Authority quota allocations and Ecobank/FINCA escrow accounts guarantee permit availability across Bwindi sectors.',
      heroImage: '/assets/aistudio/UWA_f423bf74.png',
      published: true,
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'jour-kidepo-northern-circuit',
      slug: 'kidepo-valley-karamoja-expedition-dispatch',
      title: 'Kidepo Valley & Narus Savanna: Field Notes from the Northern Frontier',
      category: 'Field Dispatch',
      authorName: 'Grace A. (UWA-G-3319)',
      readTime: '8 min read',
      summary:
        'Tracking Rothschild giraffes, cheetahs, and large buffalo herds across Kidepo Valley National Park with UTB-verified 4x4 fleet support.',
      heroImage: '/assets/aistudio/tinga_logo_2_10ada7c3.png',
      published: true,
      publishedAt: new Date().toISOString(),
    },
  ];

  const cmsCarouselActiveSlots = [
    { slotNumber: 1, menuLabel: '01. ★ Enganda Verified • E5', title: '5-Day Bwindi Gorillas & Queen Elizabeth Lions (E5)', vendorName: 'Enganda Safaris', utbLicenseNumber: 'UTB/TO/2026/0102', priceUSD: 2490, status: 'ACTIVE_PAID' },
    { slotNumber: 2, menuLabel: '02. ★ Enganda Verified • E4', title: '4-Day Murchison Falls & Ziwa Rhino Sanctuary (E4)', vendorName: 'Enganda Safaris', utbLicenseNumber: 'UTB/TO/2026/0102', priceUSD: 1780, status: 'ACTIVE_PAID' },
    { slotNumber: 3, menuLabel: '03. ★ Enganda Verified • E1', title: '1-Day Mabamba Shoebill & Entebbe Botanical Express (E1)', vendorName: 'Enganda Safaris', utbLicenseNumber: 'UTB/TO/2026/0102', priceUSD: 295, status: 'ACTIVE_PAID' },
    { slotNumber: 4, menuLabel: '04. Vergouw 10-Day Solo', title: '10-Day Vergouw Private Solo Primate & Savanna Odyssey', vendorName: 'Enganda Safaris', utbLicenseNumber: 'UTB/TO/2026/0102', priceUSD: 4890, status: 'ACTIVE_PAID' },
    { slotNumber: 5, menuLabel: '05. Tingatinga T5 Luxury', title: '5-Day Tingatinga T5 Luxury Fly-In Gorilla & Crater Lodge', vendorName: 'Tingatinga Safaris', utbLicenseNumber: 'UTB/TO/2026/0418', priceUSD: 4650, status: 'ACTIVE_PAID' },
    { slotNumber: 6, menuLabel: '06. Tingatinga 8-Day', title: '8-Day Tingatinga Safaris Signature (Gorillas, Chimps & Lions)', vendorName: 'Tingatinga Safaris', utbLicenseNumber: 'UTB/TO/2026/0418', priceUSD: 3980, status: 'ACTIVE_PAID' },
    { slotNumber: 7, menuLabel: '07. 32-Day Grand Safari', title: '32-Day Great East African Primate, Savanna & Nile Expedition', vendorName: 'Shuma Africa Safaris', utbLicenseNumber: 'UTB/TO/2026/0794', priceUSD: 15800, status: 'ACTIVE_PAID' },
    { slotNumber: 8, menuLabel: '08. Nyege Nyege & Nile', title: '7-Day Nyege Nyege Festival, Jinja Source of the Nile & Rafting', vendorName: 'Enganda Safaris', utbLicenseNumber: 'UTB/TO/2026/0102', priceUSD: 1950, status: 'ACTIVE_PAID' },
    { slotNumber: 9, menuLabel: '09. Bwindi Gorillas', title: '3-Day Bwindi Impenetrable Gorilla Habituation Express', vendorName: 'Tingatinga Safaris', utbLicenseNumber: 'UTB/TO/2026/0418', priceUSD: 1890, status: 'ACTIVE_PAID' },
    { slotNumber: 10, menuLabel: '010. Kidepo Big Game', title: '6-Day Kidepo Valley Wilderness & Karamoja Cultural Safari', vendorName: 'Shuma Africa Safaris', utbLicenseNumber: 'UTB/TO/2026/0794', priceUSD: 3420, status: 'ACTIVE_PAID' },
  ];

  const cmsCarouselStandbySlots = [
    { slotNumber: 11, menuLabel: '011. Shoebill & Chimps', title: '4-Day Mabamba Shoebill Stork & Kibale Chimpanzee Tracking', vendorName: 'Tingatinga Safaris', utbLicenseNumber: 'UTB/TO/2026/0418', priceUSD: 1640, status: 'STANDBY_ROTATION' },
  ];

  const erpGuides = [
    {
      id: 'guide-sam-m',
      slug: 'samuel-kato',
      name: 'Sam M. (Samuel Kato)',
      utbLicenseNumber: 'UTB/SG/2026/1084',
      uwaAccreditationId: 'UWA-G-1084',
      usagaTier: 'USAGA Gold Master Primate & Birding Guide',
      homeRegion: 'Bwindi & Southwestern Circuit',
      specialties: ['Mountain Gorilla Habituation', 'Albertine Rift Endemic Birding', 'Tree-Climbing Lions'],
      languages: ['English', 'Luganda', 'Runyankole', 'French'],
      dailyRateUSD: 140,
      status: 'AVAILABLE',
      verified: true,
    },
    {
      id: 'guide-david-o',
      slug: 'david-okello',
      name: 'David O. (David Okello)',
      utbLicenseNumber: 'UTB/SG/2026/2049',
      uwaAccreditationId: 'UWA-G-2049',
      usagaTier: 'USAGA Senior Savanna & Nile Guide',
      homeRegion: 'Murchison Falls & Northern Circuit',
      specialties: ['Big Five Photographic Tracking', 'Ziwa Rhino Foot Safari', 'Victoria Nile Delta Launches'],
      languages: ['English', 'Acholi', 'Swahili', 'German'],
      dailyRateUSD: 135,
      status: 'ON_SAFARI',
      verified: true,
    },
    {
      id: 'guide-grace-a',
      slug: 'grace-akello',
      name: 'Grace A. (Grace Akello)',
      utbLicenseNumber: 'UTB/SG/2026/3319',
      uwaAccreditationId: 'UWA-G-3319',
      usagaTier: 'USAGA Gold Kidepo & Cultural Specialist',
      homeRegion: 'Kidepo Valley & Karamoja',
      specialties: ['Kidepo Predator Tracking', 'Karamoja Cultural Immersion', 'Mabamba Shoebill Marsh'],
      languages: ['English', 'Swahili', 'Ateso'],
      dailyRateUSD: 145,
      status: 'AVAILABLE',
      verified: true,
    },
  ];

  const erpDriverFleet = [
    {
      id: 'fleet-landcruiser-v8-01',
      title: '4x4 Extended Safari Land Cruiser V8 (Pop-Up Roof & Fridge)',
      driverName: 'Moses K. — Senior 4x4 Fleet Captain',
      utbDriverPermit: 'UTB/DRV/2026/4401',
      uwaParkVehiclePass: 'UWA-FLT-9012-UG',
      registrationPlate: 'UBF 418T',
      vehicleCategory: 'Extended 4x4 Land Cruiser',
      passengerCapacity: 7,
      dailyRateUSD: 195,
      baseLocation: 'Entebbe International Airport & Kampala Depot',
      availabilityStatus: 'AVAILABLE',
      verified: true,
    },
    {
      id: 'fleet-landcruiser-hardtop-02',
      title: '4x4 Toyota Land Cruiser Hardtop 78-Series (Dual Spare & Winch)',
      driverName: 'Patrick B. — Kidepo & Bwindi Terrain Specialist',
      utbDriverPermit: 'UTB/DRV/2026/4489',
      uwaParkVehiclePass: 'UWA-FLT-9045-UG',
      registrationPlate: 'UBG 882M',
      vehicleCategory: 'Expedition 4x4 Land Cruiser',
      passengerCapacity: 5,
      dailyRateUSD: 185,
      baseLocation: 'Entebbe & Mbarara Western Hub',
      availabilityStatus: 'AVAILABLE',
      verified: true,
    },
    {
      id: 'fleet-safari-van-03',
      title: '4x4 Custom Safari Drone HiAce Van (Pop-Up Photographic Roof)',
      driverName: 'Isaac N. — Family & Midrange Circuit Driver',
      utbDriverPermit: 'UTB/DRV/2026/4512',
      uwaParkVehiclePass: 'UWA-FLT-9108-UG',
      registrationPlate: 'UBE 319K',
      vehicleCategory: '4x4 Safari Minibus',
      passengerCapacity: 8,
      dailyRateUSD: 135,
      baseLocation: 'Kampala & Entebbe Hub',
      availabilityStatus: 'DISPATCHED',
      verified: true,
    },
  ];

  const erpHotelRooms = [
    {
      id: 'room-igongo-executive-cottage',
      hotelId: 'partner-igongo-cultural-hotel',
      hotelName: 'Igongo Country Hotel & Cultural Centre',
      roomTitle: 'Nkwanzi Executive Cultural Suite (Full Board)',
      category: 'Hotel',
      region: 'Biharwe, Mbarara — Western Safari Circuit',
      utbLicenseNumber: 'UTB/HL/2026/0089',
      pricePerNightUSD: 155,
      capacityGuests: 2,
      boardBasis: 'Full Board + Eriijukiro Museum Entry',
      availableUnits: 8,
      verified: true,
    },
    {
      id: 'room-bwindi-mist-chalet',
      hotelId: 'partner-buhoma-canopy-lodge',
      hotelName: 'Buhoma Forest Canopy Eco-Lodge',
      roomTitle: 'Gorilla View Luxury Forest Chalet',
      category: 'Hotel',
      region: 'Buhoma Sector, Bwindi Impenetrable NP',
      utbLicenseNumber: 'UTB/HL/2026/0214',
      pricePerNightUSD: 340,
      capacityGuests: 2,
      boardBasis: 'Full Board + Packed Trekking Lunch',
      availableUnits: 5,
      verified: true,
    },
    {
      id: 'room-ishasha-river-campsite',
      hotelId: 'partner-ishasha-wilderness-camp',
      hotelName: 'Ishasha River Tented Camp & Motel',
      roomTitle: 'Savanna En-Suite Safari Tent & Campsite Pitch',
      category: 'Campsite',
      region: 'Ishasha Sector, Queen Elizabeth NP',
      utbLicenseNumber: 'UTB/HL/2026/0342',
      pricePerNightUSD: 120,
      capacityGuests: 2,
      boardBasis: 'Half Board / Bush Breakfast Ready',
      availableUnits: 12,
      verified: true,
    },
  ];

  const erpCRMLeads = [
    {
      id: 'LEAD-UTB-901',
      clientName: 'Dr. Elena Rostova',
      clientEmail: 'elena.rostova@zurich-med.ch',
      requestedPackage: '8-Day Tingatinga Safaris Signature (Gorillas, Chimps & Lions)',
      assignedOperator: 'Tingatinga Safaris (UTB/TO/2026/0418)',
      assignedGuide: 'Sam M. (UWA-G-1084)',
      guests: 2,
      estimatedValueUSD: 7960,
      pipelineStage: 'ESCROW_FUNDED',
      sourceChannel: 'Autonomous GenAI Safari Planner',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: 'LEAD-UTB-902',
      clientName: 'Marcus & Hannah Vance',
      clientEmail: 'mvance@london-capital.co.uk',
      requestedPackage: '5-Day Bwindi Gorillas & Queen Elizabeth Lions (E5)',
      assignedOperator: 'Enganda Safaris (UTB/TO/2026/0102)',
      assignedGuide: 'David O. (UWA-G-2049)',
      guests: 4,
      estimatedValueUSD: 9960,
      pipelineStage: 'PERMIT_ALLOCATED',
      sourceChannel: 'Paid-Tier Featured Carousel Slot 01',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  const erpUWAPermitAllocations = [
    {
      permitId: 'UWA-PRM-2026-8841',
      bookingReference: 'ENG-782410',
      parkSector: 'Buhoma Sector — Bwindi Impenetrable NP',
      permitType: 'Mountain Gorilla Normal Trekking ($800)',
      guests: 2,
      unitFeeUSD: 800,
      totalEscrowUSD: 1600,
      escrowBank: 'Ecobank Uganda & FINCA Uganda UWA Permit Escrow Trust',
      uwaStatus: 'QUOTA_LOCKED_IN_ESCROW',
      trekDate: '2026-07-17',
    },
    {
      permitId: 'UWA-PRM-2026-8842',
      bookingReference: 'ENG-782410',
      parkSector: 'Kanyanchu — Kibale Forest NP',
      permitType: 'Chimpanzee Tracking Permit ($250)',
      guests: 2,
      unitFeeUSD: 250,
      totalEscrowUSD: 500,
      escrowBank: 'Ecobank Uganda & FINCA Uganda UWA Permit Escrow Trust',
      uwaStatus: 'QUOTA_LOCKED_IN_ESCROW',
      trekDate: '2026-07-15',
    },
  ];

  const erpFinanceLedger = [
    {
      transactionId: 'TXN-RELWORX-991042',
      reference: 'ENG-782410',
      entryType: 'ESCROW_DEPOSIT',
      settlementChannel: 'Relworx Mobile Money & Card Gateway -> Ecobank Escrow',
      currency: 'USD',
      amountUSD: 7960,
      convertedAmount: 7960,
      beneficiaryVendor: 'Tingatinga Safaris (UTB/TO/2026/0418)',
      status: 'SETTLED_IN_ESCROW',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      transactionId: 'TXN-UWA-884100',
      reference: 'UWA-PRM-2026-8841',
      entryType: 'UWA_PERMIT_SETTLEMENT',
      settlementChannel: 'FINCA & Ecobank UWA Permit Trust Settlement',
      currency: 'USD',
      amountUSD: 2100,
      convertedAmount: 2100,
      beneficiaryVendor: 'Uganda Wildlife Authority (UWA Headquarters)',
      status: 'PERMIT_PAID_CONFIRMED',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
  ];

  const erpPortalDispatches = [
    {
      id: 'DISP-2026-101',
      targetPortal: 'specialist',
      priority: 'HIGH',
      title: 'Buhoma Gorilla Permit Briefing & 4x4 Vehicle Inspection (UBF 418T)',
      instruction:
        'Verify original passports at UWA Buhoma gate by 07:15 EAT and confirm cooler box & wet-weather gaiters in Land Cruiser UBF 418T.',
      assignedTo: 'Sam M. (UWA-G-1084) & Moses K. (UTB/DRV/2026/4401)',
      status: 'ACKNOWLEDGED',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'DISP-2026-102',
      targetPortal: 'partner',
      priority: 'NORMAL',
      title: 'Igongo Country Hotel Full-Board Stopover & Museum Tour Voucher',
      instruction:
        'Prepare 2 Nkwanzi Executive Suites and Ankole heritage lunch stopover for Tingatinga Safaris guests under voucher ENG-782410.',
      assignedTo: 'Igongo Country Hotel & Cultural Centre (UTB/HL/2026/0089)',
      status: 'CONFIRMED',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ];

  // --- CMS Endpoints (/api/cms/*) ---
  app.get('/api/cms/overview', (_req, res) => {
    res.json({
      systemName: 'Enganda & Tingatinga Safaris Multi-Vendor CMS Engine',
      architecture: 'Go (Golang) Chi Router + Express Runtime Mirror',
      maxPaidCarouselSlots: MAX_ACTIVE_PAID_CAROUSEL_SLOTS,
      activeCarouselCount: cmsCarouselActiveSlots.length,
      standbyCarouselCount: cmsCarouselStandbySlots.length,
      activeCarouselSlots: cmsCarouselActiveSlots,
      standbyCarouselSlots: cmsCarouselStandbySlots,
      siteContentBlocks: cmsSiteContentBlocks,
      footerPartnerLogos: cmsFooterPartnerLogos,
      journalArticles: cmsJournalArticles,
      lastSynchronizedAt: new Date().toISOString(),
    });
  });

  app.post('/api/cms/site-blocks', (req, res) => {
    const { id, key, section, title, subtitle, bodyText, ctaLabel, ctaUrl, active = true } = req.body || {};
    if (!key || !title || String(key).trim().length === 0 || String(title).trim().length === 0) {
      return res.status(400).json({ error: 'key and title are required for CMS site content blocks' });
    }
    const cleanKey = String(key).trim().slice(0, 120);
    const cleanTitle = String(title).trim().slice(0, 300);
    const existingIdx = cmsSiteContentBlocks.findIndex(
      (b) => (id && b.id === id) || b.key === cleanKey
    );
    const updatedBlock = {
      id: id || `cms-block-${Date.now().toString().slice(-5)}`,
      key: cleanKey,
      section: String(section || 'Custom CMS Section').trim().slice(0, 120),
      title: cleanTitle,
      subtitle: String(subtitle || '').trim().slice(0, 300),
      bodyText: String(bodyText || '').trim().slice(0, 2000),
      ctaLabel: String(ctaLabel || 'Explore').trim().slice(0, 80),
      ctaUrl: String(ctaUrl || '/').trim().slice(0, 200),
      active: Boolean(active),
      updatedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      cmsSiteContentBlocks[existingIdx] = updatedBlock;
    } else {
      cmsSiteContentBlocks.push(updatedBlock);
    }
    return res.json({ status: 'CMS_SITE_BLOCK_SAVED', block: updatedBlock });
  });

  app.post('/api/cms/footer-logos', (req, res) => {
    const { id, name, subtitle, logoUrl, category, websiteUrl, active = true, displayOrder } = req.body || {};
    if (!name || !logoUrl || String(name).trim().length === 0 || String(logoUrl).trim().length === 0) {
      return res.status(400).json({ error: 'name and logoUrl are required for CMS footer partner logos' });
    }
    const upper = String(name).toUpperCase();
    if (upper.includes('GCIC') || upper.includes('AUTO') || upper.includes('PLU')) {
      return res.status(400).json({ error: 'Restricted partner identifier (GCIC/AUTO/PLU are excluded from official partner registry)' });
    }
    const existingIdx = cmsFooterPartnerLogos.findIndex(
      (l) => (id && l.id === id) || l.name.toLowerCase() === String(name).trim().toLowerCase()
    );
    const savedLogo = {
      id: id || `logo-${Date.now().toString().slice(-5)}`,
      name: String(name).trim().slice(0, 80),
      subtitle: String(subtitle || 'Official Partner').trim().slice(0, 160),
      logoUrl: String(logoUrl).trim().slice(0, 500),
      category: String(category || 'Strategic Partner').trim().slice(0, 80),
      websiteUrl: websiteUrl ? String(websiteUrl).trim().slice(0, 300) : '',
      active: Boolean(active),
      displayOrder: Math.max(1, Number(displayOrder) || cmsFooterPartnerLogos.length + 1),
    };
    if (existingIdx >= 0) {
      cmsFooterPartnerLogos[existingIdx] = savedLogo;
    } else {
      cmsFooterPartnerLogos.push(savedLogo);
    }
    return res.json({ status: 'CMS_FOOTER_LOGO_SAVED', logo: savedLogo });
  });

  // --- ERP Endpoints (/api/erp/*) ---
  app.get('/api/erp/overview', (_req, res) => {
    const grossEscrowUSD = erpFinanceLedger.reduce(
      (acc, entry) => (entry.entryType === 'ESCROW_DEPOSIT' ? acc + entry.amountUSD : acc),
      0
    );
    const uwaPermitTrustUSD = erpUWAPermitAllocations.reduce(
      (acc, p) => acc + p.totalEscrowUSD,
      0
    );
    res.json({
      systemName: 'Enganda & Tingatinga Safaris Multi-Vendor ERP Engine',
      regulatoryAuthority: 'Uganda Tourism Board (UTB) & Uganda Wildlife Authority (UWA)',
      bankingPartners: ['ECO Bank (Ecobank Uganda)', 'FINCA Uganda', 'RELWORX Payment Gateway'],
      serviceProviderTiers: {
        guides: erpGuides.length,
        safariOperators: verifiedVendors.filter((v) => v.vendorType === 'tour_operator').length,
        driversAndFleet: erpDriverFleet.length,
        hotelsAndCampsites: erpHotelRooms.length,
      },
      guides: erpGuides,
      safariOperators: verifiedVendors,
      driverFleetVehicles: erpDriverFleet,
      partnerHotelRooms: erpHotelRooms,
      crmLeads: erpCRMLeads,
      activeBookings,
      uwaPermitAllocations: erpUWAPermitAllocations,
      financeLedger: erpFinanceLedger,
      portalDispatches: erpPortalDispatches,
      exchangeRates,
      treasuryMetrics: {
        grossEscrowVolumeUSD: grossEscrowUSD,
        uwaPermitTrustBalanceUSD: uwaPermitTrustUSD,
        netVendorPayableUSD: Math.max(0, grossEscrowUSD - uwaPermitTrustUSD),
        totalBookingsCount: activeBookings.length + 2,
      },
      lastSynchronizedAt: new Date().toISOString(),
    });
  });

  app.post('/api/erp/hotel-rooms', (req, res) => {
    const {
      id,
      hotelId,
      hotelName,
      roomTitle,
      category = 'Hotel',
      region = 'Western Safari Circuit, Uganda',
      utbLicenseNumber = 'UTB/HL/2026/0089',
      pricePerNightUSD,
      capacityGuests = 2,
      boardBasis = 'Full Board',
      availableUnits = 4,
    } = req.body || {};

    const cleanHotel = String(hotelName || '').trim();
    const cleanRoom = String(roomTitle || '').trim();
    const numericPrice = Number(pricePerNightUSD);

    if (!cleanHotel || !cleanRoom || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        error: 'hotelName, roomTitle, and a positive pricePerNightUSD are required',
      });
    }

    const savedRoom = {
      id: id || `room-${Date.now().toString().slice(-5)}`,
      hotelId: String(hotelId || `hotel-${Date.now().toString().slice(-4)}`).trim(),
      hotelName: cleanHotel.slice(0, 140),
      roomTitle: cleanRoom.slice(0, 160),
      category: String(category).trim().slice(0, 40),
      region: String(region).trim().slice(0, 120),
      utbLicenseNumber: String(utbLicenseNumber).trim().slice(0, 60),
      pricePerNightUSD: Math.round(numericPrice * 100) / 100,
      capacityGuests: Math.max(1, Math.min(20, Number(capacityGuests) || 2)),
      boardBasis: String(boardBasis).trim().slice(0, 100),
      availableUnits: Math.max(1, Math.min(100, Number(availableUnits) || 4)),
      verified: true,
    };

    const existingIdx = erpHotelRooms.findIndex((r) => r.id === savedRoom.id);
    if (existingIdx >= 0) {
      erpHotelRooms[existingIdx] = savedRoom;
    } else {
      erpHotelRooms.unshift(savedRoom);
    }

    return res.status(201).json({ status: 'ERP_HOTEL_ROOM_SAVED', room: savedRoom });
  });

  app.post('/api/erp/driver-fleet', (req, res) => {
    const {
      id,
      title,
      driverName,
      utbDriverPermit = 'UTB/DRV/2026/4590',
      uwaParkVehiclePass = 'UWA-FLT-9200-UG',
      registrationPlate,
      vehicleCategory = 'Extended 4x4 Land Cruiser',
      passengerCapacity = 7,
      dailyRateUSD,
      baseLocation = 'Entebbe & Kampala Depot',
      availabilityStatus = 'AVAILABLE',
    } = req.body || {};

    const cleanTitle = String(title || '').trim();
    const cleanDriver = String(driverName || '').trim();
    const numericRate = Number(dailyRateUSD);

    if (!cleanTitle || !cleanDriver || !Number.isFinite(numericRate) || numericRate <= 0) {
      return res.status(400).json({
        error: 'title, driverName, and a positive dailyRateUSD are required',
      });
    }

    const savedVehicle = {
      id: id || `fleet-${Date.now().toString().slice(-5)}`,
      title: cleanTitle.slice(0, 160),
      driverName: cleanDriver.slice(0, 120),
      utbDriverPermit: String(utbDriverPermit).trim().slice(0, 60),
      uwaParkVehiclePass: String(uwaParkVehiclePass).trim().slice(0, 60),
      registrationPlate: String(registrationPlate || 'UBH 501T').trim().slice(0, 30),
      vehicleCategory: String(vehicleCategory).trim().slice(0, 80),
      passengerCapacity: Math.max(1, Math.min(30, Number(passengerCapacity) || 7)),
      dailyRateUSD: Math.round(numericRate * 100) / 100,
      baseLocation: String(baseLocation).trim().slice(0, 120),
      availabilityStatus: String(availabilityStatus).trim().slice(0, 40),
      verified: true,
    };

    const existingIdx = erpDriverFleet.findIndex((v) => v.id === savedVehicle.id);
    if (existingIdx >= 0) {
      erpDriverFleet[existingIdx] = savedVehicle;
    } else {
      erpDriverFleet.unshift(savedVehicle);
    }

    return res.status(201).json({ status: 'ERP_DRIVER_VEHICLE_SAVED', vehicle: savedVehicle });
  });

  app.post('/api/erp/finance/transactions', (req, res) => {
    const {
      reference,
      entryType = 'ESCROW_DEPOSIT',
      settlementChannel = 'Relworx Mobile Money -> Ecobank Escrow',
      currency = 'USD',
      amountUSD,
      beneficiaryVendor,
    } = req.body || {};

    const numericAmount = Number(amountUSD);
    const cleanBeneficiary = String(beneficiaryVendor || '').trim();
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !cleanBeneficiary) {
      return res.status(400).json({
        error: 'A positive amountUSD and beneficiaryVendor are required',
      });
    }

    const curr = String(currency || 'USD').toUpperCase();
    const rate = exchangeRates[curr] || 1;
    const entry = {
      transactionId: `TXN-ERP-${Date.now().toString().slice(-6)}`,
      reference: String(reference || `ENG-${Date.now().toString().slice(-5)}`).trim().slice(0, 60),
      entryType: String(entryType).trim().slice(0, 60),
      settlementChannel: String(settlementChannel).trim().slice(0, 140),
      currency: curr,
      amountUSD: Math.round(numericAmount * 100) / 100,
      convertedAmount: Math.round(numericAmount * rate * 100) / 100,
      beneficiaryVendor: cleanBeneficiary.slice(0, 140),
      status: 'SETTLED_IN_ESCROW',
      timestamp: new Date().toISOString(),
    };

    erpFinanceLedger.unshift(entry);
    return res.status(201).json({ status: 'ERP_LEDGER_RECORDED', entry });
  });

  app.post('/api/erp/dispatches', (req, res) => {
    const {
      targetPortal = 'specialist',
      priority = 'NORMAL',
      title,
      instruction,
      assignedTo = 'Entebbe Operations Desk',
    } = req.body || {};

    const cleanTitle = String(title || '').trim();
    const cleanInstruction = String(instruction || '').trim();
    if (!cleanTitle || !cleanInstruction) {
      return res.status(400).json({ error: 'title and instruction are required for ERP dispatches' });
    }

    const dispatch = {
      id: `DISP-${Date.now().toString().slice(-6)}`,
      targetPortal: String(targetPortal).trim().slice(0, 40),
      priority: String(priority).trim().slice(0, 20),
      title: cleanTitle.slice(0, 180),
      instruction: cleanInstruction.slice(0, 1000),
      assignedTo: String(assignedTo).trim().slice(0, 140),
      status: 'DISPATCHED',
      createdAt: new Date().toISOString(),
    };

    erpPortalDispatches.unshift(dispatch);
    return res.status(201).json({ status: 'ERP_DISPATCH_CREATED', dispatch });
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
