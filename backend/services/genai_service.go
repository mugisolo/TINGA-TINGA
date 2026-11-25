package services

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"enganda-safaris/backend/models"
	"google.golang.org/genai"
)

type GenAIService struct {
	vendorSvc  *VendorService
	bookingSvc *BookingService
}

func NewGenAIService(vendorSvc *VendorService, bookingSvc *BookingService) *GenAIService {
	return &GenAIService{
		vendorSvc:  vendorSvc,
		bookingSvc: bookingSvc,
	}
}

func (g *GenAIService) BuildSystemInstruction() string {
	activeCarousel, _ := g.vendorSvc.GetPaidTierCarousel()
	var slotsSummary strings.Builder
	for i, slot := range activeCarousel {
		slotsSummary.WriteString(fmt.Sprintf(
			"- Slot 0%d: %s — %s (ID: %s, Operator: %s, UTB: %s, UWA: %s, $%.0f USD pp, %s)\n",
			i+1, slot.ShortTabLabel, slot.Title, slot.ID, slot.OperatorName,
			slot.UTBLicenseNumber, slot.UWAAccreditationID, slot.PricePerPersonUSD, slot.DurationLabel,
		))
	}

	return fmt.Sprintf(`You are the Autonomous Agentic Safari Planner & Sales Specialist for Enganda Safaris — Uganda & East Africa's verified multi-vendor tourism marketplace connecting travelers exclusively with operators licensed by the Uganda Tourism Board (UTB) and accredited by the Uganda Wildlife Authority (UWA).

Active 10-Slot Paid-Tier Featured Packages:
%s
Use your structured tools (check_availability, calculate_quote, apply_wallet_currency, create_booking, process_payment_checkout) to autonomously verify availability, lock in pricing across UGX, USD, EUR, or GBP, generate UWA permit escrow invoices, and complete payment checkout with zero human-in-the-middle.`, slotsSummary.String())
}

func (g *GenAIService) BuildAutonomousTools() []*genai.Tool {
	return []*genai.Tool{
		{
			FunctionDeclarations: []*genai.FunctionDeclaration{
				{
					Name:        "check_availability",
					Description: "Verify real-time departure availability, UTB/UWA license credentials, and UWA gorilla/chimpanzee permits in escrow.",
					Parameters: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"packageQuery": {
								Type:        genai.TypeString,
								Description: "Package ID, slug, or title keyword (e.g., E5, E4, E1, Vergouw, Tingatinga T5, Bwindi, Kidepo)",
							},
							"departureDate": {
								Type:        genai.TypeString,
								Description: "Preferred departure date or month",
							},
							"guests": {
								Type:        genai.TypeNumber,
								Description: "Number of travelers",
							},
						},
						Required: []string{"packageQuery"},
					},
				},
				{
					Name:        "calculate_quote",
					Description: "Calculate an itemized multi-currency safari quote including UWA permit escrow and conservation pledge in UGX, USD, EUR, or GBP.",
					Parameters: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"packageQuery": {
								Type:        genai.TypeString,
								Description: "Package ID, slug, or title keyword",
							},
							"guests": {
								Type:        genai.TypeNumber,
								Description: "Number of travelers",
							},
							"departureDate": {
								Type:        genai.TypeString,
								Description: "Preferred departure window",
							},
							"currency": {
								Type:        genai.TypeString,
								Description: "Currency code: UGX, USD, EUR, or GBP",
							},
						},
						Required: []string{"packageQuery"},
					},
				},
				{
					Name:        "apply_wallet_currency",
					Description: "Convert and apply the user's preferred Safari Wallet currency (UGX, USD, EUR, GBP) to the active quote.",
					Parameters: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"currency": {
								Type:        genai.TypeString,
								Description: "Target currency code: UGX, USD, EUR, or GBP",
							},
							"amountUSD": {
								Type:        genai.TypeNumber,
								Description: "Optional USD amount to convert",
							},
						},
						Required: []string{"currency"},
					},
				},
				{
					Name:        "create_booking",
					Description: "Autonomously create a confirmed safari booking reservation and generate an official UTB/UWA permit escrow invoice.",
					Parameters: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"packageQuery": {
								Type:        genai.TypeString,
								Description: "Package ID, slug, or title keyword",
							},
							"guests": {
								Type:        genai.TypeNumber,
								Description: "Number of travelers",
							},
							"clientName": {
								Type:        genai.TypeString,
								Description: "Full name of lead traveler",
							},
							"clientEmail": {
								Type:        genai.TypeString,
								Description: "Email address for UWA escrow invoice",
							},
							"currency": {
								Type:        genai.TypeString,
								Description: "Settlement currency: UGX, USD, EUR, or GBP",
							},
						},
						Required: []string{"packageQuery"},
					},
				},
				{
					Name:        "process_payment_checkout",
					Description: "Execute autonomous end-to-end payment checkout via Enganda Safari Wallet, Relworx Mobile Money (MTN/Airtel), or Visa/Mastercard.",
					Parameters: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"packageQuery": {
								Type:        genai.TypeString,
								Description: "Package ID, slug, or title keyword",
							},
							"guests": {
								Type:        genai.TypeNumber,
								Description: "Number of travelers",
							},
							"paymentMethod": {
								Type:        genai.TypeString,
								Description: "Payment channel: wallet_balance, mtn_momo, airtel_money, visa_mastercard, or bank_transfer",
							},
							"currency": {
								Type:        genai.TypeString,
								Description: "Settlement currency: UGX, USD, EUR, or GBP",
							},
							"bookingId": {
								Type:        genai.TypeString,
								Description: "Optional existing booking ID to settle",
							},
						},
						Required: []string{"packageQuery"},
					},
				},
			},
		},
	}
}

func (g *GenAIService) ExecuteTool(toolName string, args map[string]any) (any, *models.BookingQuote, *models.BookingConfirmation, models.Currency) {
	pkgQuery, _ := args["packageQuery"].(string)
	if pkgQuery == "" {
		pkgQuery, _ = args["packageId"].(string)
	}
	guests := 2
	if gf, ok := args["guests"].(float64); ok && gf >= 1 {
		guests = int(gf)
	}
	departureDate, _ := args["departureDate"].(string)
	rawCur, _ := args["currency"].(string)
	cur := models.Currency(strings.ToUpper(strings.TrimSpace(rawCur)))
	if cur == "" {
		cur = models.CurrencyUSD
	}

	switch toolName {
	case "check_availability":
		res := g.bookingSvc.CheckAvailability(pkgQuery, departureDate, guests)
		return res, nil, nil, ""

	case "calculate_quote":
		quote := g.bookingSvc.CalculateQuote(models.QuoteRequest{
			PackageQuery:  pkgQuery,
			Guests:        guests,
			DepartureDate: departureDate,
			Currency:      cur,
		})
		return quote, &quote, nil, quote.Currency

	case "apply_wallet_currency":
		amountUSD, _ := args["amountUSD"].(float64)
		conv := g.bookingSvc.ApplyWalletCurrency(cur, amountUSD, pkgQuery, guests)
		return conv, nil, nil, conv.Currency

	case "create_booking":
		clientName, _ := args["clientName"].(string)
		clientEmail, _ := args["clientEmail"].(string)
		bk := g.bookingSvc.CreateBooking(models.CreateBookingRequest{
			PackageQuery:  pkgQuery,
			Guests:        guests,
			DepartureDate: departureDate,
			ClientName:    clientName,
			ClientEmail:   clientEmail,
			Currency:      cur,
		})
		return bk, &bk.Quote, &bk, bk.Quote.Currency

	case "process_payment_checkout":
		paymentMethod, _ := args["paymentMethod"].(string)
		bookingID, _ := args["bookingId"].(string)
		clientName, _ := args["clientName"].(string)
		clientEmail, _ := args["clientEmail"].(string)
		bk := g.bookingSvc.ProcessPaymentCheckout(models.PaymentCheckoutRequest{
			BookingID:     bookingID,
			PackageQuery:  pkgQuery,
			Guests:        guests,
			Currency:      cur,
			PaymentMethod: paymentMethod,
			ClientName:    clientName,
			ClientEmail:   clientEmail,
		})
		return bk, &bk.Quote, &bk, bk.Quote.Currency
	}

	return map[string]any{"error": "unknown tool: " + toolName}, nil, nil, ""
}

func (g *GenAIService) HandleAutonomousPlanningChat(ctx context.Context, req models.AgentChatRequest) models.AgentChatResponse {
	walletCur := req.WalletCurrency
	if walletCur == "" {
		walletCur = models.CurrencyUSD
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return g.runDeterministicPlanningPipeline(req.Prompt, walletCur, "missing_api_key")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
		HTTPOptions: genai.HTTPOptions{
			Headers: http.Header{
				"User-Agent": []string{"aistudio-build"},
			},
		},
	})
	if err != nil {
		return g.runDeterministicPlanningPipeline(req.Prompt, walletCur, "client_init_fallback")
	}

	sysInstruction := req.SystemInstruction
	if sysInstruction == "" {
		sysInstruction = g.BuildSystemInstruction()
	}

	cfg := &genai.GenerateContentConfig{
		Tools:             g.BuildAutonomousTools(),
		SystemInstruction: genai.NewContentFromText(sysInstruction, genai.RoleUser),
	}

	promptText := fmt.Sprintf("[Active Wallet Currency: %s] %s", walletCur, req.Prompt)
	resp, err := client.Models.GenerateContent(ctx, "gemini-4-hydrogen", genai.Text(promptText), cfg)
	if err != nil {
		return g.runDeterministicPlanningPipeline(req.Prompt, walletCur, "upstream_api_unavailable")
	}

	var executedTools []models.ToolExecutionCall
	var activeQuote *models.BookingQuote
	var activeBooking *models.BookingConfirmation
	var appliedCurrency models.Currency

	for _, call := range resp.FunctionCalls() {
		res, q, bk, cur := g.ExecuteTool(call.Name, call.Args)
		executedTools = append(executedTools, models.ToolExecutionCall{
			ToolName: call.Name,
			Args:     call.Args,
			Result:   res,
		})
		if q != nil {
			activeQuote = q
		}
		if bk != nil {
			activeBooking = bk
		}
		if cur != "" {
			appliedCurrency = cur
		}
	}

	replyText := resp.Text()
	if replyText == "" && activeQuote != nil {
		replyText = fmt.Sprintf(
			"Verified availability and generated Quote #%s for %s (%s • UTB: %s • UWA: %s): %s %.2f for %d guests.",
			activeQuote.QuoteID, activeQuote.PackageTitle, activeQuote.OperatorName,
			activeQuote.UTBLicenseNumber, activeQuote.UWAAccreditationID,
			activeQuote.Currency, activeQuote.ConvertedTotal, activeQuote.Guests,
		)
	}

	return models.AgentChatResponse{
		Text:            replyText,
		ExecutedTools:   executedTools,
		ActiveQuote:     activeQuote,
		ActiveBooking:   activeBooking,
		AppliedCurrency: appliedCurrency,
		Fallback:        false,
	}
}

func (g *GenAIService) runDeterministicPlanningPipeline(prompt string, walletCur models.Currency, reason string) models.AgentChatResponse {
	lower := strings.ToLower(prompt)
	targetCur := walletCur
	if strings.Contains(lower, "ugx") || strings.Contains(lower, "shilling") {
		targetCur = models.CurrencyUGX
	} else if strings.Contains(lower, "eur") || strings.Contains(lower, "euro") {
		targetCur = models.CurrencyEUR
	} else if strings.Contains(lower, "gbp") || strings.Contains(lower, "pound") {
		targetCur = models.CurrencyGBP
	}

	var executed []models.ToolExecutionCall
	availRes, _, _, _ := g.ExecuteTool("check_availability", map[string]any{
		"packageQuery": prompt,
		"guests":       float64(2),
	})
	executed = append(executed, models.ToolExecutionCall{
		ToolName: "check_availability",
		Args:     map[string]any{"packageQuery": prompt, "guests": 2},
		Result:   availRes,
	})

	quoteRes, quote, _, _ := g.ExecuteTool("calculate_quote", map[string]any{
		"packageQuery": prompt,
		"guests":       float64(2),
		"currency":     string(targetCur),
	})
	executed = append(executed, models.ToolExecutionCall{
		ToolName: "calculate_quote",
		Args:     map[string]any{"packageQuery": prompt, "guests": 2, "currency": targetCur},
		Result:   quoteRes,
	})

	var activeBooking *models.BookingConfirmation
	if strings.Contains(lower, "pay") || strings.Contains(lower, "checkout") {
		payRes, _, bk, _ := g.ExecuteTool("process_payment_checkout", map[string]any{
			"packageQuery":  prompt,
			"guests":        float64(2),
			"currency":      string(targetCur),
			"paymentMethod": "wallet_balance",
		})
		activeBooking = bk
		executed = append(executed, models.ToolExecutionCall{
			ToolName: "process_payment_checkout",
			Args:     map[string]any{"packageQuery": prompt, "paymentMethod": "wallet_balance"},
			Result:   payRes,
		})
	} else if strings.Contains(lower, "book") || strings.Contains(lower, "reserve") || strings.Contains(lower, "invoice") {
		bkRes, _, bk, _ := g.ExecuteTool("create_booking", map[string]any{
			"packageQuery": prompt,
			"guests":       float64(2),
			"currency":     string(targetCur),
		})
		activeBooking = bk
		executed = append(executed, models.ToolExecutionCall{
			ToolName: "create_booking",
			Args:     map[string]any{"packageQuery": prompt, "guests": 2},
			Result:   bkRes,
		})
	}

	return models.AgentChatResponse{
		Text: fmt.Sprintf(
			"Executed check_availability and calculate_quote for %s (%s • UTB: %s • UWA: %s). Total for %d guests: $%.0f USD (%s %.2f).",
			quote.PackageTitle, quote.OperatorName, quote.UTBLicenseNumber,
			quote.UWAAccreditationID, quote.Guests, quote.TotalUSD,
			quote.Currency, quote.ConvertedTotal,
		),
		ExecutedTools:   executed,
		ActiveQuote:     quote,
		ActiveBooking:   activeBooking,
		AppliedCurrency: targetCur,
		Fallback:        true,
		FallbackReason:  reason,
	}
}
