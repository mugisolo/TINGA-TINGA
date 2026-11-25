package handlers

import (
	"encoding/json"
	"net/http"

	"enganda-safaris/backend/models"
	"enganda-safaris/backend/services"

	"github.com/go-chi/chi/v5"
)

// MarketplaceHandler handles HTTP endpoints for Vendor Management and Booking Orchestration
// mounted on a go-chi/chi/v5 router.
type MarketplaceHandler struct {
	vendorSvc  *services.VendorService
	bookingSvc *services.BookingService
}

// NewMarketplaceHandler creates a new handler wired to VendorService and BookingService.
func NewMarketplaceHandler(vendorSvc *services.VendorService, bookingSvc *services.BookingService) *MarketplaceHandler {
	return &MarketplaceHandler{
		vendorSvc:  vendorSvc,
		bookingSvc: bookingSvc,
	}
}

// writeJSON encodes a JSON response with status code.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

// HandleHealth returns the health status of the Go Chi marketplace & GenAI orchestration engine.
func (h *MarketplaceHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	vendors := h.vendorSvc.ListVendors("")
	carousel := h.vendorSvc.GetPaidTierCarousel()
	writeJSON(w, http.StatusOK, map[string]any{
		"status":                "healthy",
		"service":               "Enganda & Tingatinga Safaris Go (Chi Router) Multi-Vendor Marketplace & GenAI Engine",
		"router":                "github.com/go-chi/chi/v5",
		"genaiSdk":              "google.golang.org/genai",
		"verifiedAuthorities":   []string{"Uganda Tourism Board (UTB)", "Uganda Wildlife Authority (UWA)"},
		"verifiedVendorCount":   len(vendors),
		"activeCarouselSlots":   carousel.TotalActiveSlots,
		"maxPaidCarouselSlots":  services.MaxPaidTierCarouselSlots,
		"supportedCurrencies":   []string{"UGX", "USD", "EUR", "GBP"},
		"autonomousToolsActive": []string{"check_availability", "calculate_quote", "apply_wallet_currency", "create_booking", "process_payment_checkout"},
	})
}

// HandleListVendors returns all UTB/UWA verified marketplace vendors, optionally filtered by ?type=.
func (h *MarketplaceHandler) HandleListVendors(w http.ResponseWriter, r *http.Request) {
	vendorType := r.URL.Query().Get("type")
	vendors := h.vendorSvc.ListVendors(vendorType)
	writeJSON(w, http.StatusOK, map[string]any{
		"authority":    "Uganda Tourism Board (UTB) & Uganda Wildlife Authority (UWA)",
		"filterType":   vendorType,
		"totalVendors": len(vendors),
		"vendors":      vendors,
	})
}

// HandleGetVendor returns a single UTB/UWA verified vendor by ID or slug using chi.URLParam.
func (h *MarketplaceHandler) HandleGetVendor(w http.ResponseWriter, r *http.Request) {
	idOrSlug := chi.URLParam(r, "idOrSlug")
	vendor, err := h.vendorSvc.GetVendorByIDOrSlug(idOrSlug)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error": err.Error(),
		})
		return
	}
	writeJSON(w, http.StatusOK, vendor)
}

// HandleOnboardVendor validates UTB/UWA credentials and registers a new verified marketplace vendor.
func (h *MarketplaceHandler) HandleOnboardVendor(w http.ResponseWriter, r *http.Request) {
	var req models.VendorOnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": "invalid vendor onboarding request payload",
		})
		return
	}

	vendor, err := h.vendorSvc.OnboardVerifiedVendor(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"status":  "VERIFIED_ONBOARDED",
		"message": "Vendor successfully verified against UTB/UWA compliance standards.",
		"vendor":  vendor,
	})
}

// HandlePaidTierCarousel returns the strict 10-slot Paid-Tier Featured Carousel and standby queue.
func (h *MarketplaceHandler) HandlePaidTierCarousel(w http.ResponseWriter, r *http.Request) {
	resp := h.vendorSvc.GetPaidTierCarousel()
	writeJSON(w, http.StatusOK, resp)
}

// HandleExpireCarouselSlot expires an active slot and promotes standby slot 011 ("Shoebill & Chimps").
func (h *MarketplaceHandler) HandleExpireCarouselSlot(w http.ResponseWriter, r *http.Request) {
	slotID := chi.URLParam(r, "slotId")
	if slotID == "" {
		var body struct {
			SlotID string `json:"slotId"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		slotID = body.SlotID
	}

	resp, err := h.vendorSvc.ExpireCarouselSlot(slotID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"error": err.Error(),
		})
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

// HandleListVolunteers returns UTB/UWA verified volunteer conservation programs.
func (h *MarketplaceHandler) HandleListVolunteers(w http.ResponseWriter, r *http.Request) {
	programs := h.vendorSvc.ListVolunteerPrograms()
	writeJSON(w, http.StatusOK, map[string]any{
		"programs": programs,
		"count":    len(programs),
	})
}

// HandleListFundraisers returns UWA-endorsed conservation and community fundraisers.
func (h *MarketplaceHandler) HandleListFundraisers(w http.ResponseWriter, r *http.Request) {
	campaigns := h.vendorSvc.ListFundraisers()
	writeJSON(w, http.StatusOK, map[string]any{
		"campaigns": campaigns,
		"count":     len(campaigns),
	})
}

// HandleCheckAvailability verifies real-time UWA permit and vendor departure availability.
func (h *MarketplaceHandler) HandleCheckAvailability(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PackageIDOrName string `json:"packageIdOrName"`
		TravelDate      string `json:"travelDate"`
		Guests          int    `json:"guests"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid availability request"})
		return
	}
	result := h.bookingSvc.CheckAvailability(req.PackageIDOrName, req.TravelDate, req.Guests)
	writeJSON(w, http.StatusOK, result)
}

// HandleCalculateQuote computes an itemized multi-currency safari & UWA permit quote.
func (h *MarketplaceHandler) HandleCalculateQuote(w http.ResponseWriter, r *http.Request) {
	var req models.QuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid quote calculation request"})
		return
	}
	quote := h.bookingSvc.CalculateQuote(req)
	writeJSON(w, http.StatusOK, quote)
}

// HandleApplyWalletCurrency converts USD amounts across UGX, USD, EUR, and GBP.
func (h *MarketplaceHandler) HandleApplyWalletCurrency(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Currency  string  `json:"currency"`
		AmountUSD float64 `json:"amountUSD"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid currency conversion request"})
		return
	}
	conversion := h.bookingSvc.ApplyWalletCurrency(req.Currency, req.AmountUSD)
	writeJSON(w, http.StatusOK, conversion)
}

// HandleCreateBooking creates an atomic multi-vendor safari reservation & UWA permit lock.
func (h *MarketplaceHandler) HandleCreateBooking(w http.ResponseWriter, r *http.Request) {
	var req models.CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid booking payload"})
		return
	}
	confirmation := h.bookingSvc.CreateBooking(req)
	writeJSON(w, http.StatusCreated, confirmation)
}

// HandleListBookings lists all active bookings orchestrated by the BookingService.
func (h *MarketplaceHandler) HandleListBookings(w http.ResponseWriter, r *http.Request) {
	bookings := h.bookingSvc.ListBookings()
	writeJSON(w, http.StatusOK, map[string]any{
		"bookings": bookings,
		"count":    len(bookings),
	})
}

// HandleProcessPaymentCheckout processes payment via Safari Wallet, Relworx Mobile Money, Card, or Bank Wire.
func (h *MarketplaceHandler) HandleProcessPaymentCheckout(w http.ResponseWriter, r *http.Request) {
	var req models.PaymentCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid payment checkout request"})
		return
	}
	receipt := h.bookingSvc.ProcessPaymentCheckout(req)
	writeJSON(w, http.StatusOK, receipt)
}
