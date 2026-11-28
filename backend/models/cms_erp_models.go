package models

// ============================================================================
// CMS (Content Management System) Domain Models
// ============================================================================

type CMSSiteContentBlock struct {
	ID          string `json:"id"`
	Key         string `json:"key"`
	Section     string `json:"section"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	Placement   string `json:"placement"`
	Active      bool   `json:"active"`
	LastUpdated string `json:"lastUpdated"`
}

type CMSFooterPartnerLogo struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Subtitle     string `json:"subtitle"`
	LogoURL      string `json:"logoUrl"`
	Category     string `json:"category"` // "Government & Conservation" | "Banking & Fintech" | "Strategic Partner"
	WebsiteURL   string `json:"websiteUrl,omitempty"`
	Active       bool   `json:"active"`
	DisplayOrder int    `json:"displayOrder"`
	UpdatedAt    string `json:"updatedAt"`
}

type CMSJournalArticle struct {
	Slug            string   `json:"slug"`
	Title           string   `json:"title"`
	Subtitle        string   `json:"subtitle"`
	Category        string   `json:"category"`
	AuthorGuideSlug string   `json:"authorGuideSlug"`
	PublishedDate   string   `json:"publishedDate"`
	ReadTimeMinutes int      `json:"readTimeMinutes"`
	HeroImage       string   `json:"heroImage"`
	KeyTakeaways    []string `json:"keyTakeaways"`
	Status          string   `json:"status"` // "published" | "draft"
}

type CMSOverviewSnapshot struct {
	ActiveCarouselSlots    int                    `json:"activeCarouselSlots"`
	MaxPaidCarouselSlots   int                    `json:"maxPaidCarouselSlots"`
	StandbyCarouselSlots   int                    `json:"standbyCarouselSlots"`
	TotalConfirmedEvents   int                    `json:"totalConfirmedEvents"`
	TotalEditorialBlocks   int                    `json:"totalEditorialBlocks"`
	TotalJournalArticles   int                    `json:"totalJournalArticles"`
	ActiveFooterLogosCount int                    `json:"activeFooterLogosCount"`
	VolunteerProgramsCount int                    `json:"volunteerProgramsCount"`
	FundraisersCount       int                    `json:"fundraisersCount"`
	SiteBlocks             []CMSSiteContentBlock  `json:"siteBlocks"`
	FooterLogos            []CMSFooterPartnerLogo `json:"footerLogos"`
	JournalArticles        []CMSJournalArticle    `json:"journalArticles"`
	CarouselItems          []CarouselSlotItem     `json:"carouselItems"`
	LastPublishedAt        string                 `json:"lastPublishedAt"`
}

// ============================================================================
// ERP (Enterprise Resource Planning) Domain Models
// ============================================================================

type ERPGuideRecord struct {
	ID                 string   `json:"id"`
	Slug               string   `json:"slug"`
	Name               string   `json:"name"`
	HomeRegion         string   `json:"homeRegion"`
	Tagline            string   `json:"tagline"`
	UTBLicenseNumber   string   `json:"utbLicenseNumber"`
	UWAAccreditationID string   `json:"uwaAccreditationId"`
	YearsExperience    int      `json:"yearsExperience"`
	Languages          []string `json:"languages"`
	Specialties        []string `json:"specialties"`
	Certifications     []string `json:"certifications"`
	Rating             float64  `json:"rating"`
	AssignmentStatus   string   `json:"assignmentStatus"` // "Available" | "On Expedition" | "Standby"
}

type ERPPartnerHotelRoom struct {
	ID                  string   `json:"id"`
	PartnerSlug         string   `json:"partnerSlug"`
	PartnerName         string   `json:"partnerName"`
	PartnerCategory     string   `json:"partnerCategory"` // "hotel" | "motel" | "lodge" | "campsite"
	UTBLicenseNumber    string   `json:"utbLicenseNumber"`
	RoomName            string   `json:"roomName"`
	RoomType            string   `json:"roomType"`
	RatePerNightUSD     float64  `json:"ratePerNightUSD"`
	BoardBasis          string   `json:"boardBasis"`
	MaxOccupancy        int      `json:"maxOccupancy"`
	BedConfiguration    string   `json:"bedConfiguration"`
	TotalRoomsAvailable int      `json:"totalRoomsAvailable"`
	Amenities           []string `json:"amenities"`
	UploadedByOwnerName string   `json:"uploadedByOwnerName"`
	CreatedAt           string   `json:"createdAt"`
}

type ERPDriverFleetVehicle struct {
	ID                    string   `json:"id"`
	DriverName            string   `json:"driverName"`
	DriverSlug            string   `json:"driverSlug,omitempty"`
	DriverLicenseAndBadge string   `json:"driverLicenseAndBadge"`
	UTBLicenseNumber      string   `json:"utbLicenseNumber"`
	UWAAccreditationID    string   `json:"uwaAccreditationId"`
	DriverPhone           string   `json:"driverPhone"`
	VehicleName           string   `json:"vehicleName"`
	VehicleCategory       string   `json:"vehicleCategory"`
	RegistrationPlate     string   `json:"registrationPlate"`
	PassengerCapacity     int      `json:"passengerCapacity"`
	RatePerDayUSD         float64  `json:"ratePerDayUSD"`
	RateIncludes          string   `json:"rateIncludes"`
	HomeBaseRegion        string   `json:"homeBaseRegion"`
	RegionsCovered        []string `json:"regionsCovered"`
	Features              []string `json:"features"`
	AvailableStatus       string   `json:"availableStatus"` // "Available Now" | "On Charter" | "Advance Booking"
	CreatedAt             string   `json:"createdAt"`
}

type ERPCRMLead struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Email              string   `json:"email"`
	WhatsApp           string   `json:"whatsapp"`
	PartySize          int      `json:"partySize"`
	TargetDates        string   `json:"targetDates"`
	BudgetTier         string   `json:"budgetTier"`
	DurationDays       int      `json:"durationDays"`
	PreferredGuideSlug string   `json:"preferredGuideSlug,omitempty"`
	ExperienceSlug     string   `json:"experienceSlug,omitempty"`
	EstimatedValueUSD  float64  `json:"estimatedValueUSD"`
	Notes              string   `json:"notes,omitempty"`
	Status             string   `json:"status"` // "new" | "contacted" | "quote_sent" | "confirmed"
	CreatedAt          string   `json:"createdAt"`
}

type ERPFinanceLedgerEntry struct {
	ID                 string   `json:"id"`
	ReferenceCode      string   `json:"referenceCode"`
	Type               string   `json:"type"`      // "deposit" | "permit_escrow" | "partner_booking" | "driver_charter" | "vendor_payout" | "withdrawal"
	Direction          string   `json:"direction"` // "credit" | "debit" | "escrow_lock" | "escrow_unlock"
	Title              string   `json:"title"`
	BeneficiaryOrPayer string   `json:"beneficiaryOrPayer"`
	PaymentRail        string   `json:"paymentRail"` // "Relworx MTN MoMo" | "Relworx Airtel Money" | "Ecobank Escrow Trust" | "FINCA Uganda" | "Visa / Mastercard"
	AmountUSD          float64  `json:"amountUSD"`
	Currency           Currency `json:"currency"`
	Status             string   `json:"status"` // "completed" | "escrow_held" | "settled"
	UWAPermitRef       string   `json:"uwaPermitRef,omitempty"`
	CreatedAt          string   `json:"createdAt"`
}

type ERPUWAPermitAllocation struct {
	ID               string  `json:"id"`
	PermitType       string  `json:"permitType"` // "Mountain Gorilla Permit" | "Gorilla Habituation" | "Chimpanzee Tracking"
	ParkSector       string  `json:"parkSector"`
	Authority        string  `json:"authority"` // "UWA"
	UnitCostUSD      float64 `json:"unitCostUSD"`
	TotalHeldInTrust int     `json:"totalHeldInTrust"`
	EscrowValueUSD   float64 `json:"escrowValueUSD"`
	EscrowBank       string  `json:"escrowBank"`
	NextAuditDate    string  `json:"nextAuditDate"`
}

type ERPPortalDispatch struct {
	ID            string `json:"id"`
	ReferenceCode string `json:"referenceCode"`
	PortalRole    string `json:"portalRole"` // "client" | "specialist" | "partner" | "staff" | "admin"
	AuthorName    string `json:"authorName"`
	Category      string `json:"category"`
	Title         string `json:"title"`
	Region        string `json:"region"`
	Priority      string `json:"priority"` // "normal" | "high" | "urgent"
	Status        string `json:"status"`   // "open" | "in_progress" | "verified" | "resolved"
	Notes         string `json:"notes,omitempty"`
	CreatedAt     string `json:"createdAt"`
}

type ERPOverviewSnapshot struct {
	TotalGrossBookingVolumeUSD float64                  `json:"totalGrossBookingVolumeUSD"`
	UWAEscrowTrustBalanceUSD   float64                  `json:"uwaEscrowTrustBalanceUSD"`
	VendorPayoutsSettledUSD    float64                  `json:"vendorPayoutsSettledUSD"`
	AvailableTreasuryFloatUSD  float64                  `json:"availableTreasuryFloatUSD"`
	VerifiedGuidesCount        int                      `json:"verifiedGuidesCount"`
	VerifiedOperatorsCount     int                      `json:"verifiedOperatorsCount"`
	ActiveFleetVehiclesCount   int                      `json:"activeFleetVehiclesCount"`
	PartnerHotelRoomsCount     int                      `json:"partnerHotelRoomsCount"`
	OpenCRMLeadsCount          int                      `json:"openCrmLeadsCount"`
	ActiveDispatchesCount      int                      `json:"activeDispatchesCount"`
	ExchangeRates              map[Currency]float64     `json:"exchangeRates"`
	Guides                     []ERPGuideRecord         `json:"guides"`
	Operators                  []VerifiedVendor         `json:"operators"`
	HotelRooms                 []ERPPartnerHotelRoom    `json:"hotelRooms"`
	DriverFleet                []ERPDriverFleetVehicle  `json:"driverFleet"`
	CRMLeads                   []ERPCRMLead             `json:"crmLeads"`
	FinanceLedger              []ERPFinanceLedgerEntry  `json:"financeLedger"`
	UWAPermitAllocations       []ERPUWAPermitAllocation `json:"uwaPermitAllocations"`
	PortalDispatches           []ERPPortalDispatch      `json:"portalDispatches"`
	GeneratedAt                string                   `json:"generatedAt"`
}
