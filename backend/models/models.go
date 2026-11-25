package models

import "time"

const MaxActivePaidCarouselSlots = 10

type Currency string

const (
	CurrencyUSD Currency = "USD"
	CurrencyUGX Currency = "UGX"
	CurrencyEUR Currency = "EUR"
	CurrencyGBP Currency = "GBP"
)

type VendorType string

const (
	VendorTypeTourOperator    VendorType = "tour_operator"
	VendorTypeHotelLodge      VendorType = "hotel_lodge"
	VendorTypeDriverFleet     VendorType = "driver_fleet"
	VendorTypeSpecialistGuide VendorType = "specialist_guide"
)

type VerifiedVendor struct {
	ID                 string     `json:"id"`
	Slug               string     `json:"slug"`
	Name               string     `json:"name"`
	VendorType         VendorType `json:"vendorType"`
	UTBLicenseNumber   string     `json:"utbLicenseNumber"`
	UWAAccreditationID string     `json:"uwaAccreditationId"`
	Headquarters       string     `json:"headquarters"`
	LogoURL            string     `json:"logoUrl,omitempty"`
	VerifiedStatus     string     `json:"verifiedStatus"`
	Rating             float64    `json:"rating"`
	Specialties        []string   `json:"specialties"`
	BaseTariffUSD      float64    `json:"baseTariffUSD,omitempty"`
	CreatedAt          time.Time  `json:"createdAt"`
}

type VendorOnboardingRequest struct {
	Name               string     `json:"name"`
	VendorType         VendorType `json:"vendorType"`
	UTBLicenseNumber   string     `json:"utbLicenseNumber"`
	UWAAccreditationID string     `json:"uwaAccreditationId"`
	Headquarters       string     `json:"headquarters"`
	LogoURL            string     `json:"logoUrl,omitempty"`
	Specialties        []string   `json:"specialties"`
	BaseTariffUSD      float64    `json:"baseTariffUSD"`
}

type CarouselSlotItem struct {
	ID                 string  `json:"id"`
	SlotNumber         int     `json:"carouselSlotNumber"`
	ShortTabLabel      string  `json:"shortTabLabel"`
	Title              string  `json:"title"`
	OperatorName       string  `json:"operatorName"`
	OperatorLogoURL    string  `json:"operatorLogoUrl,omitempty"`
	UTBLicenseNumber   string  `json:"utbLicenseNumber"`
	UWAAccreditationID string  `json:"uwaAccreditationId"`
	PricePerPersonUSD  float64 `json:"pricePerPersonUSD"`
	DurationLabel      string  `json:"durationLabel"`
	DateWindow         string  `json:"dateWindow"`
	SpotsRemaining     int     `json:"spotsRemaining"`
	ExperienceSlug     string  `json:"experienceSlug"`
	LeadGuideSlug      string  `json:"leadGuideSlug"`
	LeadGuideName      string  `json:"leadGuideName"`
	IsStandbySlot      bool    `json:"isStandbySlot"`
	Active             bool    `json:"active"`
}

type VolunteerProgram struct {
	ID                 string   `json:"id"`
	Slug               string   `json:"slug"`
	Title              string   `json:"title"`
	Organization       string   `json:"organization"`
	UTBLicenseNumber   string   `json:"utbLicenseNumber"`
	UWAAccreditationID string   `json:"uwaAccreditationId"`
	Region             string   `json:"region"`
	DurationWeeks      string   `json:"durationWeeks"`
	ProgramFeeUSD      float64  `json:"programFeeUSD"`
	Category           string   `json:"category"`
	SpotsAvailable     int      `json:"spotsAvailable"`
	ImpactHighlights   []string `json:"impactHighlights"`
}

type ConservationFundraiser struct {
	ID                      string   `json:"id"`
	Slug                    string   `json:"slug"`
	Title                   string   `json:"title"`
	BeneficiaryOrganization string   `json:"beneficiaryOrganization"`
	UTBUWAVerificationCode  string   `json:"utbUwaVerificationCode"`
	Region                  string   `json:"region"`
	Category                string   `json:"category"`
	TargetAmountUSD         float64  `json:"targetAmountUSD"`
	RaisedAmountUSD         float64  `json:"raisedAmountUSD"`
	BackersCount            int      `json:"backersCount"`
	Milestones              []string `json:"milestones"`
}

type AvailabilityResult struct {
	Status             string  `json:"status"`
	PackageID          string  `json:"packageId"`
	PackageTitle       string  `json:"packageTitle"`
	OperatorName       string  `json:"operatorName"`
	UTBLicenseNumber   string  `json:"utbLicenseNumber"`
	UWAAccreditationID string  `json:"uwaAccreditationId"`
	DepartureDate      string  `json:"departureDate"`
	SpotsRemaining     int     `json:"spotsRemaining"`
	RequestedGuests    int     `json:"requestedGuests"`
	UWAPermitsInEscrow int     `json:"uwaPermitsInEscrow"`
	LeadGuideSlug      string  `json:"leadGuideSlug"`
	LeadGuideName      string  `json:"leadGuideName"`
	PricePerPersonUSD  float64 `json:"pricePerPersonUSD"`
	VerifiedAt         string  `json:"verifiedAt"`
}

type QuoteRequest struct {
	PackageQuery         string   `json:"packageQuery"`
	Guests               int      `json:"guests"`
	DepartureDate        string   `json:"departureDate,omitempty"`
	Currency             Currency `json:"currency,omitempty"`
	IncludeGorillaPermit *bool    `json:"includeGorillaPermit,omitempty"`
}

type BookingQuote struct {
	QuoteID                      string   `json:"quoteId"`
	PackageID                    string   `json:"packageId"`
	PackageTitle                 string   `json:"packageTitle"`
	OperatorName                 string   `json:"operatorName"`
	UTBLicenseNumber             string   `json:"utbLicenseNumber"`
	UWAAccreditationID           string   `json:"uwaAccreditationId"`
	LeadGuideName                string   `json:"leadGuideName"`
	LeadGuideSlug                string   `json:"leadGuideSlug"`
	Guests                       int      `json:"guests"`
	DurationLabel                string   `json:"durationLabel"`
	DepartureDate                string   `json:"departureDate"`
	PricePerPersonUSD            float64  `json:"pricePerPersonUSD"`
	UWAPermitsTotalUSD           float64  `json:"uwaPermitsTotalUSD"`
	AccommodationAndTransportUSD float64  `json:"accommodationAndTransportUSD"`
	ConservationLevyUSD          float64  `json:"conservationLevyUSD"`
	TotalUSD                     float64  `json:"totalUSD"`
	Deposit30USD                 float64  `json:"deposit30USD"`
	Currency                     Currency `json:"currency"`
	ExchangeRate                 float64  `json:"exchangeRate"`
	ConvertedTotal               float64  `json:"convertedTotal"`
	IncludesGorillaPermit        bool     `json:"includesGorillaPermit"`
	IncludesChimpPermit          bool     `json:"includesChimpPermit"`
	ValidUntil                   string   `json:"validUntil"`
	CreatedAt                    string   `json:"createdAt"`
}

type WalletCurrencyConversion struct {
	Currency        Currency `json:"currency"`
	ExchangeRate    float64  `json:"exchangeRate"`
	AmountUSD       float64  `json:"amountUSD"`
	ConvertedAmount float64  `json:"convertedAmount"`
	Formatted       string   `json:"formatted"`
	WalletSynced    bool     `json:"walletSynced"`
}

type CreateBookingRequest struct {
	PackageQuery  string   `json:"packageQuery"`
	QuoteID       string   `json:"quoteId,omitempty"`
	Guests        int      `json:"guests"`
	DepartureDate string   `json:"departureDate,omitempty"`
	ClientName    string   `json:"clientName"`
	ClientEmail   string   `json:"clientEmail"`
	Currency      Currency `json:"currency,omitempty"`
}

type BookingConfirmation struct {
	BookingID          string       `json:"bookingId"`
	InvoiceNumber      string       `json:"invoiceNumber"`
	Quote              BookingQuote `json:"quote"`
	ClientName         string       `json:"clientName"`
	ClientEmail        string       `json:"clientEmail"`
	PaymentMethod      string       `json:"paymentMethod"`
	Status             string       `json:"status"` // "pending_payment" | "confirmed_paid"
	ReceiptID          string       `json:"receiptId"`
	UWAEscrowReference string       `json:"uwaEscrowReference"`
	CreatedAt          string       `json:"createdAt"`
	SettledAt          string       `json:"settledAt,omitempty"`
}

type PaymentCheckoutRequest struct {
	BookingID     string   `json:"bookingId,omitempty"`
	PackageQuery  string   `json:"packageQuery"`
	Guests        int      `json:"guests"`
	AmountUSD     float64  `json:"amountUSD,omitempty"`
	Currency      Currency `json:"currency,omitempty"`
	PaymentMethod string   `json:"paymentMethod"` // "wallet_balance" | "mtn_momo" | "airtel_money" | "visa_mastercard" | "bank_transfer"
	ClientName    string   `json:"clientName,omitempty"`
	ClientEmail   string   `json:"clientEmail,omitempty"`
}

type ToolExecutionCall struct {
	ToolName string         `json:"toolName"`
	Args     map[string]any `json:"args"`
	Result   any            `json:"result,omitempty"`
}

type AgentChatMessage struct {
	Role string `json:"role"`
	Text string `json:"text"`
}

type AgentChatRequest struct {
	Prompt            string             `json:"prompt"`
	History           []AgentChatMessage `json:"history,omitempty"`
	SystemInstruction string             `json:"systemInstruction,omitempty"`
	WalletCurrency    Currency           `json:"walletCurrency,omitempty"`
}

type AgentChatResponse struct {
	Text              string               `json:"text"`
	ExecutedTools     []ToolExecutionCall  `json:"executedTools"`
	ActiveQuote       *BookingQuote        `json:"activeQuote,omitempty"`
	ActiveBooking     *BookingConfirmation `json:"activeBooking,omitempty"`
	AppliedCurrency   Currency             `json:"appliedCurrency,omitempty"`
	Fallback          bool                 `json:"fallback"`
	FallbackReason    string               `json:"fallbackReason,omitempty"`
}
