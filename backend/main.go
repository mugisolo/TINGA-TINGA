package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"enganda-safaris/backend/handlers"
	"enganda-safaris/backend/services"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// 1. Initialize Modular Service Layers
	vendorSvc := services.NewVendorService()
	bookingSvc := services.NewBookingService(vendorSvc)
	genaiSvc := services.NewGenAIService(vendorSvc, bookingSvc)
	cmsErpSvc := services.NewCMSERPService(vendorSvc, bookingSvc)

	// 2. Initialize HTTP Handlers
	marketplaceHandler := handlers.NewMarketplaceHandler(vendorSvc, bookingSvc)
	agentHandler := handlers.NewAgentHandler(genaiSvc)
	cmsErpHandler := handlers.NewCMSERPHandler(cmsErpSvc)

	// 3. Configure Idiomatic Chi Router & Middleware Stack
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*.run.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// 4. Mount API Routes on Chi Router
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", marketplaceHandler.HandleHealth)

		// Vendor Management Service Layer Routes (UTB & UWA Verified Multi-Vendor Registry)
		api.Route("/vendors", func(v chi.Router) {
			v.Get("/", marketplaceHandler.HandleListVendors)
			v.Post("/onboard", marketplaceHandler.HandleOnboardVendor)
			v.Get("/{idOrSlug}", marketplaceHandler.HandleGetVendor)
		})

		// Marketplace & Paid-Tier Featured Carousel (Strict 10-Slot Cap + Slot 011 Standby Rotation)
		api.Route("/marketplace", func(m chi.Router) {
			m.Get("/vendors", marketplaceHandler.HandleListVendors)
			m.Get("/carousel", marketplaceHandler.HandlePaidTierCarousel)
			m.Post("/carousel/validate", marketplaceHandler.HandleExpireCarouselSlot)
			m.Post("/carousel/{slotId}/expire", marketplaceHandler.HandleExpireCarouselSlot)
			m.Get("/volunteers", marketplaceHandler.HandleListVolunteers)
			m.Get("/fundraisers", marketplaceHandler.HandleListFundraisers)
		})

		// Booking Orchestration Service Layer Routes (Availability, Quotes, Wallet FX, Booking & Relworx Checkout)
		api.Route("/bookings", func(b chi.Router) {
			b.Get("/", marketplaceHandler.HandleListBookings)
			b.Post("/", marketplaceHandler.HandleCreateBooking)
			b.Post("/availability", marketplaceHandler.HandleCheckAvailability)
			b.Post("/quote", marketplaceHandler.HandleCalculateQuote)
			b.Post("/currency", marketplaceHandler.HandleApplyWalletCurrency)
			b.Post("/checkout", marketplaceHandler.HandleProcessPaymentCheckout)
		})

		// CMS (Content Management System) Service Layer Routes
		api.Route("/cms", func(cms chi.Router) {
			cms.Get("/overview", cmsErpHandler.HandleGetCMSOverview)
			cms.Post("/site-blocks", cmsErpHandler.HandleUpsertCMSSiteBlock)
			cms.Post("/footer-logos", cmsErpHandler.HandleUpsertCMSFooterLogo)
		})

		// ERP (Enterprise Resource Planning) Service Layer Routes
		api.Route("/erp", func(erp chi.Router) {
			erp.Get("/overview", cmsErpHandler.HandleGetERPOverview)
			erp.Post("/hotel-rooms", cmsErpHandler.HandleUpsertERPHotelRoom)
			erp.Post("/driver-fleet", cmsErpHandler.HandleUpsertERPDriverVehicle)
			erp.Post("/finance/transactions", cmsErpHandler.HandleRecordERPFinanceTransaction)
			erp.Post("/dispatches", cmsErpHandler.HandleCreateERPDispatch)
		})

		// Google GenAI Autonomous Safari Planning Service Layer Routes
		api.Post("/chat", agentHandler.HandleAgentChat)
		api.Route("/agent", func(a chi.Router) {
			a.Post("/chat", agentHandler.HandleAgentChat)
			a.Post("/execute-tool", agentHandler.HandleExecuteTool)
		})
	})

	port := os.Getenv("GO_BACKEND_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("[Enganda & Tingatinga Safaris Go Chi Server] Listening on :%s (UTB/UWA Vendor Management, CMS, ERP, Booking Orchestration & Google GenAI SDK active)", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
