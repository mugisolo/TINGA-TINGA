package services

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"enganda-safaris/backend/models"
)

type VendorService struct {
	mu            sync.RWMutex
	vendors       []models.VerifiedVendor
	carouselSlots []models.CarouselSlotItem
	volunteers    []models.VolunteerProgram
	fundraisers   []models.ConservationFundraiser
}

func NewVendorService() *VendorService {
	now := time.Now().UTC()
	return &VendorService{
		vendors: []models.VerifiedVendor{
			{
				ID:                 "op-enganda-wildlife-safaris",
				Slug:               "enganda-safaris",
				Name:               "Enganda Safaris",
				VendorType:         models.VendorTypeTourOperator,
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				Headquarters:       "Plot 23A, Manyago, Entebbe, Uganda",
				LogoURL:            "/assets/aistudio/enganda-logo-header.png",
				VerifiedStatus:     "UTB & UWA Gold Verified",
				Rating:             4.98,
				Specialties:        []string{"Named Ugandan Specialist Guides", "UWA Permit Escrow", "Enganda Verified E1-E5"},
				BaseTariffUSD:      1890,
				CreatedAt:          now,
			},
			{
				ID:                 "op-tingatinga-safaris",
				Slug:               "tingatinga-safaris",
				Name:               "Tingatinga Safaris",
				VendorType:         models.VendorTypeTourOperator,
				UTBLicenseNumber:   "UTB/TO/2026/0418",
				UWAAccreditationID: "UWA-REG-8841-UG",
				Headquarters:       "Airport Road, Entebbe & Kampala, Uganda",
				LogoURL:            "/assets/aistudio/tinga_logo_2_10ada7c3.png",
				VerifiedStatus:     "UTB & UWA Gold Verified",
				Rating:             4.96,
				Specialties:        []string{"Tingatinga T1-T5 Portfolio", "8-Day Signature Primate & Lions", "10% UWA Conservation Pledge"},
				BaseTariffUSD:      1450,
				CreatedAt:          now,
			},
			{
				ID:                 "op-shuma-africa-safaris",
				Slug:               "shuma-africa-safaris",
				Name:               "Shuma Africa Safaris",
				VendorType:         models.VendorTypeTourOperator,
				UTBLicenseNumber:   "UTB/TO/2026/0794",
				UWAAccreditationID: "UWA-REG-5520-EA",
				Headquarters:       "Entebbe & Arusha Multi-Country Desk",
				VerifiedStatus:     "UTB & UWA Cross-Border Verified",
				Rating:             4.95,
				Specialties:        []string{"32-Day East African Grand Safari", "Kidepo-Murchison Private Charter"},
				BaseTariffUSD:      18079,
				CreatedAt:          now,
			},
			{
				ID:                 "partner-igongo-cultural-hotel",
				Slug:               "igongo-country-hotel-and-cultural-centre",
				Name:               "Igongo Country Hotel & Cultural Centre",
				VendorType:         models.VendorTypeHotelLodge,
				UTBLicenseNumber:   "UTB/HL/2026/0089",
				UWAAccreditationID: "UWA-HOSP-3310-MB",
				Headquarters:       "Biharwe, Mbarara — Western Safari Circuit",
				LogoURL:            "/assets/aistudio/logo_igongo_8f5928e8.png",
				VerifiedStatus:     "UTB 5-Star Cultural Heritage Partner",
				Rating:             4.94,
				Specialties:        []string{"Eriijukiro Museum", "Itaramiro Cultural Village", "Ankole Long-Horned Cattle Heritage"},
				BaseTariffUSD:      140,
				CreatedAt:          now,
			},
			{
				ID:                 "fleet-cruiser-samuel-kato",
				Slug:               "samuel-kato-4x4-fleet",
				Name:               "Samuel Kato — Toyota Land Cruiser 78 Extended (UBF 842Q)",
				VendorType:         models.VendorTypeDriverFleet,
				UTBLicenseNumber:   "UTB/FL/2026/4019",
				UWAAccreditationID: "UWA-VEH-8842-UG",
				Headquarters:       "Entebbe, Bwindi & Western Ankole Circuit",
				VerifiedStatus:     "UTB & UWA Commercial Safari Fleet Verified",
				Rating:             4.99,
				Specialties:        []string{"7-Window Pop-Up Roof", "40L Safari Fridge", "Primate & Savanna Spec"},
				BaseTariffUSD:      240,
				CreatedAt:          now,
			},
		},
		carouselSlots: []models.CarouselSlotItem{
			{
				ID:                 "pkg-enganda-e5-ankole-cattle-mburo-bwindi",
				SlotNumber:         1,
				ShortTabLabel:      "★ Enganda Verified • E5",
				Title:              "9-Day Enganda E5: Ankole Long-Horned Cattle, Lake Mburo Walking & Bwindi Gorillas",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  4850,
				DurationLabel:      "9 Days / 8 Nights",
				DateWindow:         "Year-Round 2026 / 2027",
				SpotsRemaining:     4,
				ExperienceSlug:     "9-day-enganda-e5-ankole-cattle-mburo-walking-bwindi",
				LeadGuideSlug:      "grace-akello",
				LeadGuideName:      "Grace Akello",
				Active:             true,
			},
			{
				ID:                 "pkg-enganda-e4-batwa-mutanda-ishasha-lions",
				SlotNumber:         2,
				ShortTabLabel:      "★ Enganda Verified • E4",
				Title:              "8-Day Enganda E4: Batwa Forest Heritage, Lake Mutanda Canoeing & Ishasha Tree Lions",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  4190,
				DurationLabel:      "8 Days / 7 Nights",
				DateWindow:         "Year-Round 2026 / 2027",
				SpotsRemaining:     4,
				ExperienceSlug:     "8-day-enganda-e4-batwa-heritage-lake-mutanda-ishasha-lions",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-enganda-e1-mabamba-shoebill-budongo-birding",
				SlotNumber:         3,
				ShortTabLabel:      "★ Enganda Verified • E1",
				Title:              "4-Day Enganda E1: Mabamba Shoebill Stork, Royal Mile Budongo & Murchison Birding",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  1890,
				DurationLabel:      "4 Days / 3 Nights",
				DateWindow:         "Weekly 2026 / 2027",
				SpotsRemaining:     6,
				ExperienceSlug:     "4-day-enganda-e1-mabamba-shoebill-budongo-birding",
				LeadGuideSlug:      "grace-akello",
				LeadGuideName:      "Grace Akello",
				Active:             true,
			},
			{
				ID:                 "pkg-vergouw-10-day-solo-wild-expedition",
				SlotNumber:         4,
				ShortTabLabel:      "Vergouw 10-Day Solo",
				Title:              "The Vergouw Solo Wild Package — 10-Day Custom Uganda Expedition (1 Pax All-Inclusive)",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  6912,
				DurationLabel:      "10 Days / 9 Nights",
				DateWindow:         "Custom Solo 2026 / 2027",
				SpotsRemaining:     2,
				ExperienceSlug:     "10-day-vergouw-solo-wild-package-uganda-expedition",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-tingatinga-t5-12-day-ultimate-luxury",
				SlotNumber:         5,
				ShortTabLabel:      "Tingatinga T5 Luxury",
				Title:              "12-Day Tingatinga T5 Ultimate Luxury: Gorillas, Chimps, Nile Charter & Kidepo Fly-In",
				OperatorName:       "Tingatinga Safaris",
				OperatorLogoURL:    "/assets/aistudio/tinga_logo_2_10ada7c3.png",
				UTBLicenseNumber:   "UTB/TO/2026/0418",
				UWAAccreditationID: "UWA-REG-8841-UG",
				PricePerPersonUSD:  9500,
				DurationLabel:      "12 Days / 11 Nights",
				DateWindow:         "2026 Luxury Portfolio",
				SpotsRemaining:     4,
				ExperienceSlug:     "12-day-tingatinga-t5-ultimate-luxury-gorillas-nile-kidepo",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-tingatinga-8-day-signature",
				SlotNumber:         6,
				ShortTabLabel:      "Tingatinga 8-Day",
				Title:              "8-Day Tingatinga Safaris Signature: Bwindi Gorillas, Kibale Chimps, Ishasha Lions & Murchison",
				OperatorName:       "Tingatinga Safaris",
				OperatorLogoURL:    "/assets/aistudio/tinga_logo_2_10ada7c3.png",
				UTBLicenseNumber:   "UTB/TO/2026/0418",
				UWAAccreditationID: "UWA-REG-8841-UG",
				PricePerPersonUSD:  4680,
				DurationLabel:      "8 Days / 7 Nights",
				DateWindow:         "Monthly 2026 / 2027",
				SpotsRemaining:     6,
				ExperienceSlug:     "8-day-tingatinga-signature-primate-lions-nile",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-shuma-32-day-grand-safari-2027",
				SlotNumber:         7,
				ShortTabLabel:      "32-Day Grand Safari",
				Title:              "32-Day East African Grand Safari 2027 — Tanzania, Kenya, Uganda & Rwanda",
				OperatorName:       "Shuma Africa Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0794",
				UWAAccreditationID: "UWA-REG-5520-EA",
				PricePerPersonUSD:  18079,
				DurationLabel:      "32 Days / 31 Nights",
				DateWindow:         "Jun – Sep 2027",
				SpotsRemaining:     7,
				ExperienceSlug:     "32-day-east-african-grand-safari-2027",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-nyege-nyege-2026",
				SlotNumber:         8,
				ShortTabLabel:      "Nyege Nyege & Nile",
				Title:              "Nyege Nyege Festival & Source of the Nile 5-Day Cultural & Adventure Package",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  1580,
				DurationLabel:      "5 Days / 4 Nights",
				DateWindow:         "Nov 12 – 16, 2026",
				SpotsRemaining:     6,
				ExperienceSlug:     "7-day-best-of-uganda",
				LeadGuideSlug:      "sarah-namukasa",
				LeadGuideName:      "Sarah Namukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-bwindi-gorilla-habituation-aug",
				SlotNumber:         9,
				ShortTabLabel:      "Bwindi Gorillas",
				Title:              "3-Day Bwindi Mountain Gorilla Trek & Batwa Forest Immersion",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  1650,
				DurationLabel:      "3 Days / 2 Nights",
				DateWindow:         "Aug 14 – 16, 2026",
				SpotsRemaining:     4,
				ExperienceSlug:     "3-day-bwindi-gorilla-trek",
				LeadGuideSlug:      "david-mukasa",
				LeadGuideName:      "David Mukasa",
				Active:             true,
			},
			{
				ID:                 "pkg-kidepo-karamoja-expedition",
				SlotNumber:         10,
				ShortTabLabel:      "Kidepo Big Game",
				Title:              "10-Day Grand Circuit & Kidepo Valley Big-Game & Karamojong Cultural Safari",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  4850,
				DurationLabel:      "10 Days / 9 Nights",
				DateWindow:         "Sep 04 – 13, 2026",
				SpotsRemaining:     3,
				ExperienceSlug:     "10-day-grand-circuit-kidepo",
				LeadGuideSlug:      "samuel-okello",
				LeadGuideName:      "Samuel Okello",
				Active:             true,
			},
			{
				ID:                 "pkg-mabamba-shoebill-kibale-primates",
				SlotNumber:         11,
				ShortTabLabel:      "Shoebill & Chimps",
				Title:              "7-Day Mabamba Shoebill Stork, Kibale Chimpanzee & Queen Elizabeth Boat Safari",
				OperatorName:       "Enganda Safaris",
				UTBLicenseNumber:   "UTB/TO/2026/0102",
				UWAAccreditationID: "UWA-REG-1104-UG",
				PricePerPersonUSD:  3250,
				DurationLabel:      "7 Days / 6 Nights",
				DateWindow:         "Oct 08 – 14, 2026",
				SpotsRemaining:     5,
				ExperienceSlug:     "7-day-best-of-uganda",
				LeadGuideSlug:      "grace-akello",
				LeadGuideName:      "Grace Akello",
				IsStandbySlot:      true,
				Active:             false,
			},
		},
		volunteers: []models.VolunteerProgram{
			{
				ID:                 "vol-bwindi-gorilla-conservation-health",
				Slug:               "bwindi-conservation-and-community-health-fellowship",
				Title:              "Bwindi One-Health Gorilla & Buffer-Zone Community Fellowship",
				Organization:       "Conservation Through Public Health (CTPH) & Enganda Foundation",
				UTBLicenseNumber:   "UTB/VOL/2026/0091",
				UWAAccreditationID: "UWA-RES-3109-BW",
				Region:             "Bwindi Impenetrable National Park (Buhoma Sector)",
				DurationWeeks:      "2 to 4 Weeks",
				ProgramFeeUSD:      1450,
				Category:           "Wildlife Conservation",
				SpotsAvailable:     8,
				ImpactHighlights: []string{
					"Direct field collaboration with UWA Gorilla Research & Monitoring Rangers",
					"Supports 14 frontline Buhoma & Mukono parish conservation schools",
					"Includes 1 discounted UWA Community Conservation Gorilla Trek",
				},
			},
			{
				ID:                 "vol-kibale-reforestation-chimpanzee-corridor",
				Slug:               "kibale-bigodi-chimpanzee-corridor-reforestation",
				Title:              "Kibale & Bigodi Chimpanzee Forest Corridor Reforestation Initiative",
				Organization:       "KAFRED Bigodi Wetland Sanctuary & Tingatinga Conservation Desk",
				UTBLicenseNumber:   "UTB/VOL/2026/0114",
				UWAAccreditationID: "UWA-CON-2084-KB",
				Region:             "Kibale Forest & Bigodi Wetland (Fort Portal)",
				DurationWeeks:      "1 to 3 Weeks",
				ProgramFeeUSD:      980,
				Category:           "Reforestation & Agroforestry",
				SpotsAvailable:     12,
				ImpactHighlights: []string{
					"Plant and geotag 250+ indigenous primate food trees per cohort",
					"Monitor 8 species of diurnal primates along the Bigodi buffer zone",
					"Partnered with Tingatinga Safaris Sustainable Tourism Fund",
				},
			},
			{
				ID:                 "vol-ankole-igongo-cultural-heritage-archiving",
				Slug:               "ankole-igongo-cultural-heritage-and-museum-fellowship",
				Title:              "Ankole Oral History, Eriijukiro Museum & Bahima Pastoral Heritage Program",
				Organization:       "Igongo Cultural Centre & Museum of South Western Uganda",
				UTBLicenseNumber:   "UTB/HER/2026/0042",
				UWAAccreditationID: "UWA-CUL-1920-MB",
				Region:             "Biharwe, Mbarara & Lake Mburo Corridor",
				DurationWeeks:      "1 to 4 Weeks",
				ProgramFeeUSD:      1120,
				Category:           "Cultural Heritage",
				SpotsAvailable:     6,
				ImpactHighlights: []string{
					"Hosted on-site at Igongo Country Hotel & Cultural Centre (igongo.co.ug)",
					"Field excursions to Bahima Ankole cattle kraals and 1520 AD Biharwe Eclipse Monument",
					"Includes weekend guided walking safari in Lake Mburo National Park",
				},
			},
		},
		fundraisers: []models.ConservationFundraiser{
			{
				ID:                      "fund-bwindi-ranger-solar-outposts",
				Slug:                    "bwindi-anti-poaching-ranger-solar-and-patrol-gear",
				Title:                   "Bwindi & Mgahinga Frontline UWA Ranger Solar Outposts & GPS Patrol Kit Fund",
				BeneficiaryOrganization: "Uganda Wildlife Authority (UWA) Bwindi Conservation Area Trust",
				UTBUWAVerificationCode:  "UWA-FUND-2026-BW01",
				Region:                  "Bwindi Impenetrable & Mgahinga Gorilla National Parks",
				Category:                "Ranger Welfare & Anti-Poaching",
				TargetAmountUSD:         45000,
				RaisedAmountUSD:         34250,
				BackersCount:            184,
				Milestones: []string{
					"$15,000 — Buhoma & Ruhija Ranger Outpost Solar Micro-Grids (Completed)",
					"$30,000 — 45 Waterproof Alpine Patrol Kits & Night-Vision Monoculars (Completed)",
					"$45,000 — Rushaga & Nkuringo Satellite Telemetry Base Station (Active Goal)",
				},
			},
			{
				ID:                      "fund-batwa-forest-stewards-homestead",
				Slug:                    "batwa-indigenous-forest-stewards-land-and-apiary-fund",
				Title:                   "Batwa Indigenous Forest Stewards Apiary, Clean Water & Homestead Fund",
				BeneficiaryOrganization: "Batwa Development Organization & Enganda Impact Collective",
				UTBUWAVerificationCode:  "UTB-IMPACT-2026-BT04",
				Region:                  "Kisoro, Lake Mutanda & Southern Bwindi Buffer Zone",
				Category:                "Batwa & Host Community Livelihoods",
				TargetAmountUSD:         28000,
				RaisedAmountUSD:         21900,
				BackersCount:            142,
				Milestones: []string{
					"$10,000 — 120 Modern Top-Bar Beehives & Honey Processing Centre (Completed)",
					"$20,000 — Gravity-Fed Clean Water System for 3 Batwa Villages (Completed)",
					"$28,000 — Youth Vocational Guiding & Craft Workshop at Lake Mutanda (Active Goal)",
				},
			},
			{
				ID:                      "fund-mabamba-shoebill-papyrus-guardians",
				Slug:                    "mabamba-wetland-shoebill-nest-guardians-boat-fund",
				Title:                   "Mabamba Bay Ramsar Wetland Shoebill Nest Guardians & Solar Canoe Motors",
				BeneficiaryOrganization: "Mabamba Wetland Eco-Tourism Association (MWETA)",
				UTBUWAVerificationCode:  "UWA-RAMSAR-2026-MB09",
				Region:                  "Mabamba Bay Wetland, Lake Victoria (Entebbe Peninsula)",
				Category:                "Primate Habitat Corridor",
				TargetAmountUSD:         18500,
				RaisedAmountUSD:         14800,
				BackersCount:            97,
				Milestones: []string{
					"$8,000 — Annual Stipends for 14 Mabamba Shoebill Nest Spotters (Completed)",
					"$18,500 — 6 Quiet Eco-Outboard Engines for Community Guide Canoes (Active Goal)",
				},
			},
		},
	}
}

func (s *VendorService) ListVendors(vendorType string) []models.VerifiedVendor {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if vendorType == "" {
		out := make([]models.VerifiedVendor, len(s.vendors))
		copy(out, s.vendors)
		return out
	}

	var filtered []models.VerifiedVendor
	for _, v := range s.vendors {
		if strings.EqualFold(string(v.VendorType), vendorType) {
			filtered = append(filtered, v)
		}
	}
	return filtered
}

func (s *VendorService) GetVendorByIDOrSlug(idOrSlug string) (*models.VerifiedVendor, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(strings.TrimSpace(idOrSlug))
	for _, v := range s.vendors {
		if strings.ToLower(v.ID) == q || strings.ToLower(v.Slug) == q {
			cp := v
			return &cp, true
		}
	}
	return nil, false
}

func (s *VendorService) OnboardVerifiedVendor(req models.VendorOnboardingRequest) (*models.VerifiedVendor, error) {
	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("vendor name is required")
	}
	if !strings.HasPrefix(strings.ToUpper(req.UTBLicenseNumber), "UTB/") {
		return nil, errors.New("valid Uganda Tourism Board license number (prefix UTB/) is required")
	}
	if !strings.HasPrefix(strings.ToUpper(req.UWAAccreditationID), "UWA-") {
		return nil, errors.New("valid Uganda Wildlife Authority accreditation ID (prefix UWA-) is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	slug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "-"))
	vendor := models.VerifiedVendor{
		ID:                 fmt.Sprintf("vnd-%d", time.Now().Unix()%1000000),
		Slug:               slug,
		Name:               req.Name,
		VendorType:         req.VendorType,
		UTBLicenseNumber:   strings.ToUpper(req.UTBLicenseNumber),
		UWAAccreditationID: strings.ToUpper(req.UWAAccreditationID),
		Headquarters:       req.Headquarters,
		LogoURL:            req.LogoURL,
		VerifiedStatus:     "UTB & UWA Verified Marketplace Partner",
		Rating:             4.90,
		Specialties:        req.Specialties,
		BaseTariffUSD:      req.BaseTariffUSD,
		CreatedAt:          time.Now().UTC(),
	}

	s.vendors = append(s.vendors, vendor)
	return &vendor, nil
}

func (s *VendorService) GetPaidTierCarousel() ([]models.CarouselSlotItem, []models.CarouselSlotItem) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var active []models.CarouselSlotItem
	var standby []models.CarouselSlotItem

	for _, item := range s.carouselSlots {
		if item.IsStandbySlot || !item.Active {
			standby = append(standby, item)
		} else {
			active = append(active, item)
		}
	}

	sort.Slice(active, func(i, j int) bool {
		return active[i].SlotNumber < active[j].SlotNumber
	})

	// Automatically rotate in standby slot 011 (Shoebill & Chimps) if active paid slots < 10
	for len(active) < models.MaxActivePaidCarouselSlots && len(standby) > 0 {
		next := standby[0]
		standby = standby[1:]
		next.Active = true
		next.IsStandbySlot = false
		active = append(active, next)
	}

	if len(active) > models.MaxActivePaidCarouselSlots {
		active = active[:models.MaxActivePaidCarouselSlots]
	}

	return active, standby
}

func (s *VendorService) ExpireCarouselSlot(slotID string) ([]models.CarouselSlotItem, []models.CarouselSlotItem, error) {
	s.mu.Lock()
	found := false
	for i := range s.carouselSlots {
		if s.carouselSlots[i].ID == slotID {
			s.carouselSlots[i].Active = false
			s.carouselSlots[i].IsStandbySlot = true
			found = true
		} else if s.carouselSlots[i].IsStandbySlot && !s.carouselSlots[i].Active {
			// Promote standby slot 011 (Shoebill & Chimps) into active paid-tier rotation
			s.carouselSlots[i].Active = true
			s.carouselSlots[i].IsStandbySlot = false
		}
	}
	s.mu.Unlock()

	if !found {
		return nil, nil, fmt.Errorf("carousel slot %s not found", slotID)
	}
	active, standby := s.GetPaidTierCarousel()
	return active, standby, nil
}

func (s *VendorService) FindPackageByQuery(query string) models.CarouselSlotItem {
	s.mu.RLock()
	defer s.mu.RUnlock()

	q := strings.ToLower(strings.TrimSpace(query))
	if q == "" && len(s.carouselSlots) > 0 {
		return s.carouselSlots[0]
	}

	for _, pkg := range s.carouselSlots {
		if strings.Contains(strings.ToLower(pkg.ID), q) ||
			strings.Contains(strings.ToLower(pkg.ExperienceSlug), q) ||
			strings.Contains(strings.ToLower(pkg.ShortTabLabel), q) ||
			strings.Contains(strings.ToLower(pkg.Title), q) ||
			strings.Contains(strings.ToLower(pkg.OperatorName), q) {
			return pkg
		}
	}
	return s.carouselSlots[0]
}

func (s *VendorService) ListVolunteerPrograms() []models.VolunteerProgram {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.VolunteerProgram, len(s.volunteers))
	copy(out, s.volunteers)
	return out
}

func (s *VendorService) ListFundraisers() []models.ConservationFundraiser {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.ConservationFundraiser, len(s.fundraisers))
	copy(out, s.fundraisers)
	return out
}
