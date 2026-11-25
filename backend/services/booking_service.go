package services

import (
	"fmt"
	"math"
	"strings"
	"sync"
	"time"

	"enganda-safaris/backend/models"
)

type BookingService struct {
	mu          sync.RWMutex
	vendorSvc   *VendorService
	fxRates     map[models.Currency]float64
	quotes      map[string]models.BookingQuote
	bookings    map[string]models.BookingConfirmation
}

func NewBookingService(vendorSvc *VendorService) *BookingService {
	return &BookingService{
		vendorSvc: vendorSvc,
		fxRates: map[models.Currency]float64{
			models.CurrencyUSD: 1.0,
			models.CurrencyUGX: 3750.0,
			models.CurrencyEUR: 0.92,
			models.CurrencyGBP: 0.79,
		},
		quotes:   make(map[string]models.BookingQuote),
		bookings: make(map[string]models.BookingConfirmation),
	}
}

func (b *BookingService) NormalizeCurrency(cur models.Currency) (models.Currency, float64) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	upper := models.Currency(strings.ToUpper(strings.TrimSpace(string(cur))))
	if rate, ok := b.fxRates[upper]; ok {
		return upper, rate
	}
	return models.CurrencyUSD, 1.0
}

func (b *BookingService) CheckAvailability(packageQuery string, departureDate string, guests int) models.AvailabilityResult {
	pkg := b.vendorSvc.FindPackageByQuery(packageQuery)
	if guests < 1 {
		guests = 2
	}
	if strings.TrimSpace(departureDate) == "" {
		departureDate = pkg.DateWindow
	}

	status := "AVAILABLE"
	if guests > pkg.SpotsRemaining {
		status = "LIMITED_SPOTS_PRIVATE_DEPARTURE_AVAILABLE"
	}

	return models.AvailabilityResult{
		Status:             status,
		PackageID:          pkg.ID,
		PackageTitle:       pkg.Title,
		OperatorName:       pkg.OperatorName,
		UTBLicenseNumber:   pkg.UTBLicenseNumber,
		UWAAccreditationID: pkg.UWAAccreditationID,
		DepartureDate:      departureDate,
		SpotsRemaining:     pkg.SpotsRemaining,
		RequestedGuests:    guests,
		UWAPermitsInEscrow: guests,
		LeadGuideSlug:      pkg.LeadGuideSlug,
		LeadGuideName:      pkg.LeadGuideName,
		PricePerPersonUSD:  pkg.PricePerPersonUSD,
		VerifiedAt:         time.Now().UTC().Format(time.RFC3339),
	}
}

func (b *BookingService) CalculateQuote(req models.QuoteRequest) models.BookingQuote {
	pkg := b.vendorSvc.FindPackageByQuery(req.PackageQuery)
	guests := req.Guests
	if guests < 1 {
		guests = 2
	}
	cur, rate := b.NormalizeCurrency(req.Currency)

	titleLower := strings.ToLower(pkg.Title)
	includeGorilla := strings.Contains(titleLower, "gorilla") || strings.Contains(titleLower, "bwindi")
	if req.IncludeGorillaPermit != nil {
		includeGorilla = *req.IncludeGorillaPermit
	}
	includeChimp := strings.Contains(titleLower, "chimp") || strings.Contains(titleLower, "kibale")

	uwaPermitsUSD := 0.0
	if includeGorilla {
		uwaPermitsUSD += 800.0 * float64(guests)
	}
	if includeChimp {
		uwaPermitsUSD += 250.0 * float64(guests)
	}

	totalUSD := pkg.PricePerPersonUSD * float64(guests)
	conservationLevyUSD := math.Round(totalUSD * 0.03)
	accommTransportUSD := math.Max(0, math.Round(totalUSD*0.97-uwaPermitsUSD))
	deposit30USD := math.Round(totalUSD * 0.30)
	convertedTotal := math.Round(totalUSD*rate*100) / 100

	departureDate := strings.TrimSpace(req.DepartureDate)
	if departureDate == "" {
		departureDate = pkg.DateWindow
	}

	now := time.Now().UTC()
	quote := models.BookingQuote{
		QuoteID:                      fmt.Sprintf("QT-ENG-%d", now.UnixNano()%1000000),
		PackageID:                    pkg.ID,
		PackageTitle:                 pkg.Title,
		OperatorName:                 pkg.OperatorName,
		UTBLicenseNumber:             pkg.UTBLicenseNumber,
		UWAAccreditationID:           pkg.UWAAccreditationID,
		LeadGuideName:                pkg.LeadGuideName,
		LeadGuideSlug:                pkg.LeadGuideSlug,
		Guests:                       guests,
		DurationLabel:                pkg.DurationLabel,
		DepartureDate:                departureDate,
		PricePerPersonUSD:            pkg.PricePerPersonUSD,
		UWAPermitsTotalUSD:           uwaPermitsUSD,
		AccommodationAndTransportUSD: accommTransportUSD,
		ConservationLevyUSD:          conservationLevyUSD,
		TotalUSD:                     totalUSD,
		Deposit30USD:                 deposit30USD,
		Currency:                     cur,
		ExchangeRate:                 rate,
		ConvertedTotal:               convertedTotal,
		IncludesGorillaPermit:        includeGorilla,
		IncludesChimpPermit:          includeChimp,
		ValidUntil:                   now.Add(48 * time.Hour).Format(time.RFC3339),
		CreatedAt:                    now.Format(time.RFC3339),
	}

	b.mu.Lock()
	b.quotes[quote.QuoteID] = quote
	b.mu.Unlock()

	return quote
}

func (b *BookingService) ApplyWalletCurrency(currency models.Currency, amountUSD float64, packageQuery string, guests int) models.WalletCurrencyConversion {
	cur, rate := b.NormalizeCurrency(currency)
	if amountUSD <= 0 {
		pkg := b.vendorSvc.FindPackageByQuery(packageQuery)
		if guests < 1 {
			guests = 2
		}
		amountUSD = pkg.PricePerPersonUSD * float64(guests)
	}
	converted := math.Round(amountUSD*rate*100) / 100
	return models.WalletCurrencyConversion{
		Currency:        cur,
		ExchangeRate:    rate,
		AmountUSD:       amountUSD,
		ConvertedAmount: converted,
		Formatted:       fmt.Sprintf("%s %.2f", cur, converted),
		WalletSynced:    true,
	}
}

func (b *BookingService) CreateBooking(req models.CreateBookingRequest) models.BookingConfirmation {
	var quote models.BookingQuote
	foundQuote := false

	if req.QuoteID != "" {
		b.mu.RLock()
		q, ok := b.quotes[req.QuoteID]
		b.mu.RUnlock()
		if ok {
			quote = q
			foundQuote = true
		}
	}

	if !foundQuote {
		quote = b.CalculateQuote(models.QuoteRequest{
			PackageQuery:  req.PackageQuery,
			Guests:        req.Guests,
			DepartureDate: req.DepartureDate,
			Currency:      req.Currency,
		})
	}

	clientName := strings.TrimSpace(req.ClientName)
	if clientName == "" {
		clientName = "Enganda Marketplace Traveler"
	}
	clientEmail := strings.TrimSpace(req.ClientEmail)
	if clientEmail == "" {
		clientEmail = "traveler@engandasafaris.com"
	}

	now := time.Now().UTC()
	stamp := now.UnixNano() % 1000000
	booking := models.BookingConfirmation{
		BookingID:          fmt.Sprintf("BK-ENG-%06d", stamp),
		InvoiceNumber:      fmt.Sprintf("INV-UWA-%06d", stamp),
		Quote:              quote,
		ClientName:         clientName,
		ClientEmail:        clientEmail,
		PaymentMethod:      "wallet_balance",
		Status:             "pending_payment",
		ReceiptID:          fmt.Sprintf("WLT-PEND-%06d", stamp),
		UWAEscrowReference: fmt.Sprintf("UWA-ESC-%06d", stamp),
		CreatedAt:          now.Format(time.RFC3339),
	}

	b.mu.Lock()
	b.bookings[booking.BookingID] = booking
	b.mu.Unlock()

	return booking
}

func (b *BookingService) ProcessPaymentCheckout(req models.PaymentCheckoutRequest) models.BookingConfirmation {
	var booking models.BookingConfirmation
	foundBooking := false

	if req.BookingID != "" {
		b.mu.RLock()
		existing, ok := b.bookings[req.BookingID]
		b.mu.RUnlock()
		if ok {
			booking = existing
			foundBooking = true
		}
	}

	if !foundBooking {
		booking = b.CreateBooking(models.CreateBookingRequest{
			PackageQuery: req.PackageQuery,
			Guests:       req.Guests,
			ClientName:   req.ClientName,
			ClientEmail:  req.ClientEmail,
			Currency:     req.Currency,
		})
	}

	paymentMethod := strings.TrimSpace(req.PaymentMethod)
	if paymentMethod == "" {
		paymentMethod = "wallet_balance"
	}

	now := time.Now().UTC()
	stamp := now.UnixNano() % 1000000
	booking.PaymentMethod = paymentMethod
	booking.Status = "confirmed_paid"
	booking.ReceiptID = fmt.Sprintf("WLT-AUTO-%06d", stamp)
	booking.UWAEscrowReference = fmt.Sprintf("UWA-ESC-%06d", stamp)
	booking.SettledAt = now.Format(time.RFC3339)

	b.mu.Lock()
	b.bookings[booking.BookingID] = booking
	b.mu.Unlock()

	return booking
}

func (b *BookingService) ListBookings() []models.BookingConfirmation {
	b.mu.RLock()
	defer b.mu.RUnlock()

	out := make([]models.BookingConfirmation, 0, len(b.bookings))
	for _, bk := range b.bookings {
		out = append(out, bk)
	}
	return out
}
