package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"enganda-safaris/backend/models"
)

type CMSERPService struct {
	mu               sync.RWMutex
	vendorSvc        *VendorService
	bookingSvc       *BookingService
	siteBlocks       []models.CMSSiteContentBlock
	footerLogos      []models.CMSFooterPartnerLogo
	journalArticles  []models.CMSJournalArticle
	guides           []models.ERPGuideRecord
	hotelRooms       []models.ERPPartnerHotelRoom
	driverFleet      []models.ERPDriverFleetVehicle
	crmLeads         []models.ERPCRMLead
	financeLedger    []models.ERPFinanceLedgerEntry
	uwaAllocations   []models.ERPUWAPermitAllocation
	portalDispatches []models.ERPPortalDispatch
}

func NewCMSERPService(vendorSvc *VendorService, bookingSvc *BookingService) *CMSERPService {
	svc := &CMSERPService{
		vendorSvc:  vendorSvc,
		bookingSvc: bookingSvc,
	}
	svc.seedInitialData()
	return svc
}

func (s *CMSERPService) seedInitialData() {
	nowISO := time.Now().UTC().Format(time.RFC3339)

	// 1. Seed CMS Site Content Blocks (including standalone landing frame & verification banners)
	s.siteBlocks = []models.CMSSiteContentBlock{
		{
			ID:          "cms-block-hero-standalone-frame",
			Key:         "landing_standalone_guide_frame",
			Section:     "Homepage Above Confirmed Packages & Events",
			Title:       "East Africa, shown to you by the people who call it home.",
			Body:        "At Enganda Safaris, the guide is the product. Instead of being assigned an anonymous driver on arrival, you choose and travel with a named, licensed East African specialist — from Bwindi’s gorilla ridges and Kibale’s chimpanzee canopy to the Serengeti migration plains, Maasai Mara, Volcanoes National Park, and Kidepo Valley, all operated by Enganda Members.",
			Placement:   "above_confirmed_packages_carousel",
			Active:      true,
			LastUpdated: nowISO,
		},
		{
			ID:          "cms-block-utb-uwa-compliance",
			Key:         "utb_uwa_marketplace_seal",
			Section:     "Service Providers Directory Header",
			Title:       "UTB & UWA Verified Multi-Vendor Tourism Marketplace",
			Body:        "Every safari operator, specialist guide, 4x4 fleet driver, and partner hotel is audited against Uganda Tourism Board (UTB) licensing and Uganda Wildlife Authority (UWA) permit escrow protocols.",
			Placement:   "service_providers_header",
			Active:      true,
			LastUpdated: nowISO,
		},
		{
			ID:          "cms-block-footer-powered-by",
			Key:         "footer_powered_by_text",
			Section:     "Global Footer Governance",
			Title:       "Official Institutional & Banking Partners",
			Body:        "Regulated by UTB & UWA • Escrow & Payment Rails Powered by ECO Bank, FINCA Uganda & Relworx Payment Gateway",
			Placement:   "global_footer",
			Active:      true,
			LastUpdated: nowISO,
		},
	}

	// 2. Seed CMS Official Partner Footer Logos (UWA, UTB, ECO Bank, FINCA, RELWORX — no PLU, no GCIC, no AUTO)
	s.footerLogos = []models.CMSFooterPartnerLogo{
		{
			ID:           "logo_uwa",
			Name:         "UWA",
			Subtitle:     "Uganda Wildlife Authority",
			LogoURL:      "/assets/aistudio/UWA_f423bf74.png",
			Category:     "Government & Conservation",
			WebsiteURL:   "https://ugandawildlife.org",
			Active:       true,
			DisplayOrder: 1,
			UpdatedAt:    nowISO,
		},
		{
			ID:           "logo_utb",
			Name:         "UTB",
			Subtitle:     "Uganda Tourism Board",
			LogoURL:      "/assets/aistudio/UTB_08177dce.png",
			Category:     "Government & Conservation",
			WebsiteURL:   "https://utb.go.ug",
			Active:       true,
			DisplayOrder: 2,
			UpdatedAt:    nowISO,
		},
		{
			ID:           "logo_ecobank",
			Name:         "ECO Bank",
			Subtitle:     "Ecobank Pan-African Banking & Escrow Partner",
			LogoURL:      "/assets/aistudio/ecobank.svg",
			Category:     "Banking & Fintech",
			WebsiteURL:   "https://ecobank.com/ug",
			Active:       true,
			DisplayOrder: 3,
			UpdatedAt:    nowISO,
		},
		{
			ID:           "logo_finca",
			Name:         "FINCA",
			Subtitle:     "FINCA Uganda Financial Partner",
			LogoURL:      "/assets/aistudio/finca_84848a21.png",
			Category:     "Banking & Fintech",
			WebsiteURL:   "https://finca.ug",
			Active:       true,
			DisplayOrder: 4,
			UpdatedAt:    nowISO,
		},
		{
			ID:           "logo_relworx",
			Name:         "RELWORX",
			Subtitle:     "Relworx Mobile Money & Card Payment Gateway",
			LogoURL:      "/assets/aistudio/relworx_9ec37c45.jfif",
			Category:     "Banking & Fintech",
			WebsiteURL:   "https://payments.relworx.com/docs/",
			Active:       true,
			DisplayOrder: 5,
			UpdatedAt:    nowISO,
		},
	}

	// 3. Seed CMS Journal Articles
	s.journalArticles = []models.CMSJournalArticle{
		{
			Slug:            "uwa-2026-gorilla-and-chimpanzee-permit-tariff-guide",
			Title:           "UWA 2026/2027 Gorilla & Chimpanzee Permit Escrow Guide",
			Subtitle:        "How direct Safari Wallet escrow locks official Uganda Wildlife Authority permits in Bwindi, Mgahinga, and Kibale.",
			Category:        "Permits & Planning",
			AuthorGuideSlug: "samuel-kato",
			PublishedDate:   "2026-11-10",
			ReadTimeMinutes: 6,
			HeroImage:       "/assets/aistudio/cow_b5a75acc.jpg",
			KeyTakeaways:    []string{"$800 Foreign Non-Resident Bwindi Permit", "$1,500 4-Hour Gorilla Habituation", "100% UWA Escrow Protection via Ecobank & Relworx"},
			Status:          "published",
		},
		{
			Slug:            "ankole-heritage-and-igongo-cultural-corridor",
			Title:           "The Ankole Long-Horned Cattle Corridor & Igongo Cultural Centre",
			Subtitle:        "Why Biharwe and Mbarara form the essential cultural gateway between Lake Mburo and Bwindi Impenetrable Forest.",
			Category:        "Cultural Stories",
			AuthorGuideSlug: "grace-namukasa",
			PublishedDate:   "2026-11-18",
			ReadTimeMinutes: 5,
			HeroImage:       "/assets/aistudio/cultural-village-e1720185580794_60f38fea.jpg",
			KeyTakeaways:    []string{"Eriijukiro Museum of South Western Uganda", "1520 AD Biharwe Eclipse Monument", "Direct Room Booking via Safari Wallet"},
			Status:          "published",
		},
	}

	// 4. Seed ERP Specialist Guides Roster
	s.guides = []models.ERPGuideRecord{
		{
			ID:                 "guide-1",
			Slug:               "samuel-kato",
			Name:               "Samuel Kato",
			HomeRegion:         "Bwindi & Kigezi Highlands",
			Tagline:            "Lead Mountain Gorilla & Albertine Rift Primate Specialist",
			UTBLicenseNumber:   "UTB-GD-2026-104",
			UWAAccreditationID: "UWA-PRIMATE-882",
			YearsExperience:    14,
			Languages:          []string{"English", "French", "Runyankole", "Luganda"},
			Specialties:        []string{"gorillas", "chimps", "photography"},
			Certifications:     []string{"USAGA Gold Guide", "UWA Primate Habituation Certified", "Wilderness First Responder"},
			Rating:             4.98,
			AssignmentStatus:   "Available",
		},
		{
			ID:                 "guide-2",
			Slug:               "grace-namukasa",
			Name:               "Grace Namukasa",
			HomeRegion:         "Mabamba, Entebbe & Kibale Forest",
			Tagline:            "Principal Ornithologist & Albertine Endemic Birding Specialist",
			UTBLicenseNumber:   "UTB-GD-2026-119",
			UWAAccreditationID: "UWA-ORNITH-410",
			YearsExperience:    11,
			Languages:          []string{"English", "German", "Luganda"},
			Specialties:        []string{"birding", "chimps", "culture"},
			Certifications:     []string{"Uganda Women Birders Lead", "USAGA Master Ornithologist"},
			Rating:             4.97,
			AssignmentStatus:   "Available",
		},
		{
			ID:                 "guide-3",
			Slug:               "david-ochieng",
			Name:               "David Ochieng",
			HomeRegion:         "Kidepo Valley & Murchison Falls",
			Tagline:            "Northern Savannah Big-Game, Predator & Karamoja Specialist",
			UTBLicenseNumber:   "UTB-GD-2026-205",
			UWAAccreditationID: "UWA-SAVANNAH-619",
			YearsExperience:    16,
			Languages:          []string{"English", "Swahili", "Acholi"},
			Specialties:        []string{"big-game", "culture", "photography"},
			Certifications:     []string{"USAGA Senior Savannah Specialist", "4x4 Off-Road Recovery Instructor"},
			Rating:             4.99,
			AssignmentStatus:   "On Expedition",
		},
	}

	// 5. Seed ERP Partner Hotel & Motel Rooms Inventory (including Igongo Country Hotel)
	s.hotelRooms = []models.ERPPartnerHotelRoom{
		{
			ID:                  "room_igongo_1",
			PartnerSlug:         "igongo-country-hotel-and-cultural-centre",
			PartnerName:         "Igongo Country Hotel & Cultural Centre",
			PartnerCategory:     "hotel",
			UTBLicenseNumber:    "UTB/HL/2026/0089",
			RoomName:            "Eriijukiro Executive Garden Suite",
			RoomType:            "Executive Suite",
			RatePerNightUSD:     165,
			BoardBasis:          "Bed & Breakfast",
			MaxOccupancy:        2,
			BedConfiguration:    "1 King Four-Poster Bed",
			TotalRoomsAvailable: 8,
			Amenities:           []string{"Complimentary Eriijukiro Museum Entry", "Private Garden Veranda", "High-Speed Wi-Fi", "Ankole Cultural Breakfast"},
			UploadedByOwnerName: "Igongo Reservations Desk",
			CreatedAt:           nowISO,
		},
		{
			ID:                  "room_igongo_2",
			PartnerSlug:         "igongo-country-hotel-and-cultural-centre",
			PartnerName:         "Igongo Country Hotel & Cultural Centre",
			PartnerCategory:     "hotel",
			UTBLicenseNumber:    "UTB/HL/2026/0089",
			RoomName:            "Biharwe Deluxe Twin / Double Cottage",
			RoomType:            "Deluxe Cottage",
			RatePerNightUSD:     135,
			BoardBasis:          "Half Board",
			MaxOccupancy:        3,
			BedConfiguration:    "1 Queen Bed + 1 Single Bed",
			TotalRoomsAvailable: 12,
			Amenities:           []string{"People's Restaurant Dinner Included", "En-Suite Rain Shower", "Cultural Village Walk"},
			UploadedByOwnerName: "Igongo Reservations Desk",
			CreatedAt:           nowISO,
		},
	}

	// 6. Seed ERP Known Drivers & 4x4 Fleet Vehicles
	s.driverFleet = []models.ERPDriverFleetVehicle{
		{
			ID:                    "fleet_seed_1",
			DriverName:            "Samuel Kato",
			DriverSlug:            "samuel-kato",
			DriverLicenseAndBadge: "UTB Licensed Driver-Guide • USAGA Gold #UG-4012",
			UTBLicenseNumber:      "UTB-FLT-2026-842",
			UWAAccreditationID:    "UWA-4X4-BWINDI-01",
			DriverPhone:           "+256 772 419 880",
			VehicleName:           "Toyota Land Cruiser 78-Series Extended 4x4",
			VehicleCategory:       "4x4 Extended Land Cruiser",
			RegistrationPlate:     "UBF 842Q",
			PassengerCapacity:     7,
			RatePerDayUSD:         240,
			RateIncludes:          "Licensed Driver-Guide, Pop-Up Roof, 40L Fridge & Comprehensive Insurance",
			HomeBaseRegion:        "Entebbe, Mbarara (Igongo Hub) & Bwindi Circuit",
			RegionsCovered:        []string{"Bwindi & Mgahinga", "Igongo & Lake Mburo", "Queen Elizabeth NP", "Kibale Forest"},
			Features:              []string{"Pop-Up Photography Roof", "40L Safari Fridge", "220V Inverter", "Dual Fuel Tanks"},
			AvailableStatus:       "Available Now",
			CreatedAt:             nowISO,
		},
		{
			ID:                    "fleet_seed_2",
			DriverName:            "David Ochieng",
			DriverSlug:            "david-ochieng",
			DriverLicenseAndBadge: "UTB Licensed Driver-Guide • USAGA Savannah Master #UG-2198",
			UTBLicenseNumber:      "UTB-FLT-2026-319",
			UWAAccreditationID:    "UWA-4X4-KIDEPO-02",
			DriverPhone:           "+256 752 903 114",
			VehicleName:           "Toyota Land Cruiser Prado TX 4x4 Safari Spec",
			VehicleCategory:       "4x4 Land Cruiser Prado",
			RegistrationPlate:     "UBG 319M",
			PassengerCapacity:     4,
			RatePerDayUSD:         185,
			RateIncludes:          "Licensed Driver-Guide, Pop-Up Roof & Comprehensive Park Insurance",
			HomeBaseRegion:        "Entebbe, Murchison Falls & Kidepo Valley",
			RegionsCovered:        []string{"Murchison Falls NP", "Kidepo Valley NP", "Ziwa Rhino Sanctuary"},
			Features:              []string{"Pop-Up Roof Hatch", "A/C Climate Control", "All-Terrain Tires"},
			AvailableStatus:       "Available Now",
			CreatedAt:             nowISO,
		},
	}

	// 7. Seed ERP CRM Leads Pipeline
	s.crmLeads = []models.ERPCRMLead{
		{
			ID:                 "eng_lead_seed_1",
			Name:               "Dr. Clara & Lukas Vandenberg",
			Email:              "c.vandenberg@uzleuven.be",
			WhatsApp:           "+32 478 21 90 44",
			PartySize:          2,
			TargetDates:        "2026-12-14 to 2026-12-21",
			BudgetTier:         "luxury",
			DurationDays:       8,
			PreferredGuideSlug: "samuel-kato",
			ExperienceSlug:     "8-day-tingatinga-safaris-signature-gorillas-chimps-lions",
			EstimatedValueUSD:  8240,
			Notes:              "Rushaga Gorilla permit locked in escrow + Igongo Country Hotel overnight stop.",
			Status:             "confirmed",
			CreatedAt:          nowISO,
		},
		{
			ID:                 "eng_lead_seed_2",
			Name:               "Marcus Sterling & Family",
			Email:              "msterling@sterlingcap.co.uk",
			WhatsApp:           "+44 7700 900412",
			PartySize:          4,
			TargetDates:        "2027-01-18 to 2027-01-27",
			BudgetTier:         "signature",
			DurationDays:       10,
			PreferredGuideSlug: "david-ochieng",
			ExperienceSlug:     "10-day-uganda-grand-circuit-kidepo",
			EstimatedValueUSD:  21800,
			Notes:              "4x4 Extended Land Cruiser UBF 842Q charter + 4 UWA Gorilla Permits.",
			Status:             "quote_sent",
			CreatedAt:          nowISO,
		},
	}

	// 8. Seed ERP Finance, Relworx & Ecobank/FINCA Escrow Ledger
	s.financeLedger = []models.ERPFinanceLedgerEntry{
		{
			ID:                 "erp_tx_1001",
			ReferenceCode:      "RWX-ESCROW-9941",
			Type:               "permit_escrow",
			Direction:          "escrow_lock",
			Title:              "UWA Bwindi Mountain Gorilla Permits (2 Pax • Rushaga Sector)",
			BeneficiaryOrPayer: "Uganda Wildlife Authority (UWA) via Ecobank Escrow Trust",
			PaymentRail:        "Ecobank Escrow Trust",
			AmountUSD:          1600,
			Currency:           models.CurrencyUSD,
			Status:             "escrow_held",
			UWAPermitRef:       "UWA-BWI-2026-88412",
			CreatedAt:          nowISO,
		},
		{
			ID:                 "erp_tx_1002",
			ReferenceCode:      "RWX-MOMO-7721",
			Type:               "partner_booking",
			Direction:          "credit",
			Title:              "Igongo Country Hotel — Eriijukiro Executive Garden Suite (2 Nights)",
			BeneficiaryOrPayer: "Igongo Country Hotel & Cultural Centre",
			PaymentRail:        "Relworx MTN MoMo",
			AmountUSD:          330,
			Currency:           models.CurrencyUSD,
			Status:             "completed",
			CreatedAt:          nowISO,
		},
		{
			ID:                 "erp_tx_1003",
			ReferenceCode:      "FIN-PAYOUT-4410",
			Type:               "vendor_payout",
			Direction:          "debit",
			Title:              "Tingatinga Safaris T5 Luxury Charter Advance Settlement",
			BeneficiaryOrPayer: "Tingatinga Safaris (UTB/TO/2026/0418)",
			PaymentRail:        "FINCA Uganda",
			AmountUSD:          3975,
			Currency:           models.CurrencyUSD,
			Status:             "settled",
			CreatedAt:          nowISO,
		},
	}

	// 9. Seed ERP UWA Permit Escrow Allocations
	s.uwaAllocations = []models.ERPUWAPermitAllocation{
		{
			ID:               "uwa_alloc_gorilla_std",
			PermitType:       "Mountain Gorilla Tracking Permit (Bwindi & Mgahinga)",
			ParkSector:       "Buhoma, Rushaga, Nkuringo, Ruhija & Ntebeko",
			Authority:        "UWA",
			UnitCostUSD:      800,
			TotalHeldInTrust: 28,
			EscrowValueUSD:   22400,
			EscrowBank:       "ECO Bank Uganda UWA Permit Escrow Account",
			NextAuditDate:    "2026-12-01",
		},
		{
			ID:               "uwa_alloc_gorilla_hab",
			PermitType:       "Mountain Gorilla Habituation Experience (4 Hours)",
			ParkSector:       "Rushaga & Nkuringo Southern Sectors",
			Authority:        "UWA",
			UnitCostUSD:      1500,
			TotalHeldInTrust: 6,
			EscrowValueUSD:   9000,
			EscrowBank:       "ECO Bank Uganda UWA Permit Escrow Account",
			NextAuditDate:    "2026-12-01",
		},
		{
			ID:               "uwa_alloc_chimp_kibale",
			PermitType:       "Kibale Chimpanzee Tracking Permit (Kanyanchu)",
			ParkSector:       "Kibale National Park",
			Authority:        "UWA",
			UnitCostUSD:      250,
			TotalHeldInTrust: 24,
			EscrowValueUSD:   6000,
			EscrowBank:       "FINCA Uganda & Ecobank Conservation Trust",
			NextAuditDate:    "2026-12-01",
		},
	}

	// 10. Seed ERP 5-Portal Operational Dispatches
	s.portalDispatches = []models.ERPPortalDispatch{
		{
			ID:            "disp_erp_1",
			ReferenceCode: "OPS-EBB-101",
			PortalRole:    "staff",
			AuthorName:    "Entebbe Operations Desk",
			Category:      "UWA Permit Escrow Verification",
			Title:         "Confirmed 8 Rushaga Gorilla Permits for Tingatinga Safaris December Departures",
			Region:        "Bwindi Impenetrable NP",
			Priority:      "high",
			Status:        "verified",
			Notes:         "Escrow receipt verified via Ecobank & UWA HQ Kampala.",
			CreatedAt:     nowISO,
		},
		{
			ID:            "disp_erp_2",
			ReferenceCode: "OPS-MBARARA-204",
			PortalRole:    "partner",
			AuthorName:    "Igongo Country Hotel Reservations",
			Category:      "Room Inventory & Tariff Sync",
			Title:         "Published 2026/2027 Eriijukiro Executive Suite & Biharwe Cottage Tariffs",
			Region:        "Mbarara, Igongo & Lake Mburo",
			Priority:      "normal",
			Status:        "verified",
			Notes:         "Direct Safari Wallet room vouchers active.",
			CreatedAt:     nowISO,
		},
	}
}

// ============================================================================
// CMS Operations
// ============================================================================

func (s *CMSERPService) GetCMSOverview() models.CMSOverviewSnapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	activeCarousel, standby := s.vendorSvc.GetActivePaidCarousel()
	volunteers := s.vendorSvc.ListVolunteerPrograms()
	fundraisers := s.vendorSvc.ListFundraisers()

	activeLogos := 0
	for _, lg := range s.footerLogos {
		if lg.Active {
			activeLogos++
		}
	}

	standbyCount := 0
	if standby != nil {
		standbyCount = 1
	}

	return models.CMSOverviewSnapshot{
		ActiveCarouselSlots:    len(activeCarousel),
		MaxPaidCarouselSlots:   models.MaxActivePaidCarouselSlots,
		StandbyCarouselSlots:   standbyCount,
		TotalConfirmedEvents:   len(activeCarousel) + standbyCount,
		TotalEditorialBlocks:   len(s.siteBlocks),
		TotalJournalArticles:   len(s.journalArticles),
		ActiveFooterLogosCount: activeLogos,
		VolunteerProgramsCount: len(volunteers),
		FundraisersCount:       len(fundraisers),
		SiteBlocks:             append([]models.CMSSiteContentBlock(nil), s.siteBlocks...),
		FooterLogos:            append([]models.CMSFooterPartnerLogo(nil), s.footerLogos...),
		JournalArticles:        append([]models.CMSJournalArticle(nil), s.journalArticles...),
		CarouselItems:          activeCarousel,
		LastPublishedAt:        time.Now().UTC().Format(time.RFC3339),
	}
}

func (s *CMSERPService) UpsertSiteBlock(block models.CMSSiteContentBlock) models.CMSSiteContentBlock {
	s.mu.Lock()
	defer s.mu.Unlock()

	block.LastUpdated = time.Now().UTC().Format(time.RFC3339)
	if strings.TrimSpace(block.ID) == "" {
		block.ID = fmt.Sprintf("cms-block-%d", time.Now().UnixMilli()%100000)
	}
	for i, existing := range s.siteBlocks {
		if existing.ID == block.ID || (block.Key != "" && existing.Key == block.Key) {
			s.siteBlocks[i] = block
			return block
		}
	}
	s.siteBlocks = append([]models.CMSSiteContentBlock{block}, s.siteBlocks...)
	return block
}

func (s *CMSERPService) UpsertFooterLogo(logo models.CMSFooterPartnerLogo) models.CMSFooterPartnerLogo {
	s.mu.Lock()
	defer s.mu.Unlock()

	logo.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	if strings.TrimSpace(logo.ID) == "" {
		logo.ID = fmt.Sprintf("logo_cms_%d", time.Now().UnixMilli()%100000)
	}
	for i, existing := range s.footerLogos {
		if existing.ID == logo.ID {
			s.footerLogos[i] = logo
			return logo
		}
	}
	s.footerLogos = append(s.footerLogos, logo)
	return logo
}

// ============================================================================
// ERP Operations
// ============================================================================

func (s *CMSERPService) GetERPOverview() models.ERPOverviewSnapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var grossVolume, escrowTotal, payoutsTotal float64
	for _, entry := range s.financeLedger {
		switch entry.Type {
		case "permit_escrow":
			escrowTotal += entry.AmountUSD
			grossVolume += entry.AmountUSD
		case "vendor_payout":
			payoutsTotal += entry.AmountUSD
		default:
			grossVolume += entry.AmountUSD
		}
	}
	for _, alloc := range s.uwaAllocations {
		escrowTotal += alloc.EscrowValueUSD
	}

	operators := s.vendorSvc.ListVendors("")

	return models.ERPOverviewSnapshot{
		TotalGrossBookingVolumeUSD: grossVolume + 48500,
		UWAEscrowTrustBalanceUSD:   escrowTotal,
		VendorPayoutsSettledUSD:    payoutsTotal + 18400,
		AvailableTreasuryFloatUSD:  34250,
		VerifiedGuidesCount:        len(s.guides),
		VerifiedOperatorsCount:     len(operators),
		ActiveFleetVehiclesCount:   len(s.driverFleet),
		PartnerHotelRoomsCount:     len(s.hotelRooms),
		OpenCRMLeadsCount:          len(s.crmLeads),
		ActiveDispatchesCount:      len(s.portalDispatches),
		ExchangeRates: map[models.Currency]float64{
			models.CurrencyUSD: 1.0,
			models.CurrencyUGX: 3750.0,
			models.CurrencyEUR: 0.92,
			models.CurrencyGBP: 0.79,
		},
		Guides:               append([]models.ERPGuideRecord(nil), s.guides...),
		Operators:            operators,
		HotelRooms:           append([]models.ERPPartnerHotelRoom(nil), s.hotelRooms...),
		DriverFleet:          append([]models.ERPDriverFleetVehicle(nil), s.driverFleet...),
		CRMLeads:             append([]models.ERPCRMLead(nil), s.crmLeads...),
		FinanceLedger:        append([]models.ERPFinanceLedgerEntry(nil), s.financeLedger...),
		UWAPermitAllocations: append([]models.ERPUWAPermitAllocation(nil), s.uwaAllocations...),
		PortalDispatches:     append([]models.ERPPortalDispatch(nil), s.portalDispatches...),
		GeneratedAt:          time.Now().UTC().Format(time.RFC3339),
	}
}

func (s *CMSERPService) AddHotelRoom(room models.ERPPartnerHotelRoom) models.ERPPartnerHotelRoom {
	s.mu.Lock()
	defer s.mu.Unlock()

	if strings.TrimSpace(room.ID) == "" {
		room.ID = fmt.Sprintf("room_erp_%d", time.Now().UnixMilli()%100000)
	}
	if strings.TrimSpace(room.CreatedAt) == "" {
		room.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	s.hotelRooms = append([]models.ERPPartnerHotelRoom{room}, s.hotelRooms...)
	return room
}

func (s *CMSERPService) AddDriverFleetVehicle(vehicle models.ERPDriverFleetVehicle) models.ERPDriverFleetVehicle {
	s.mu.Lock()
	defer s.mu.Unlock()

	if strings.TrimSpace(vehicle.ID) == "" {
		vehicle.ID = fmt.Sprintf("fleet_erp_%d", time.Now().UnixMilli()%100000)
	}
	if strings.TrimSpace(vehicle.CreatedAt) == "" {
		vehicle.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	s.driverFleet = append([]models.ERPDriverFleetVehicle{vehicle}, s.driverFleet...)
	return vehicle
}

func (s *CMSERPService) RecordFinanceTransaction(tx models.ERPFinanceLedgerEntry) models.ERPFinanceLedgerEntry {
	s.mu.Lock()
	defer s.mu.Unlock()

	if strings.TrimSpace(tx.ID) == "" {
		tx.ID = fmt.Sprintf("erp_tx_%d", time.Now().UnixMilli()%100000)
	}
	if strings.TrimSpace(tx.ReferenceCode) == "" {
		tx.ReferenceCode = fmt.Sprintf("ERP-REF-%d", time.Now().UnixMilli()%100000)
	}
	if strings.TrimSpace(tx.CreatedAt) == "" {
		tx.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	s.financeLedger = append([]models.ERPFinanceLedgerEntry{tx}, s.financeLedger...)
	return tx
}

func (s *CMSERPService) CreatePortalDispatch(d models.ERPPortalDispatch) models.ERPPortalDispatch {
	s.mu.Lock()
	defer s.mu.Unlock()

	if strings.TrimSpace(d.ID) == "" {
		d.ID = fmt.Sprintf("disp_erp_%d", time.Now().UnixMilli()%100000)
	}
	if strings.TrimSpace(d.ReferenceCode) == "" {
		d.ReferenceCode = fmt.Sprintf("OPS-EBB-%d", time.Now().UnixMilli()%10000)
	}
	if strings.TrimSpace(d.CreatedAt) == "" {
		d.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	s.portalDispatches = append([]models.ERPPortalDispatch{d}, s.portalDispatches...)
	return d
}
