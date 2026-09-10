# Tinga Tinga Safari (TingaTinga Safari and Holiday)
> **Boutique East African Safari Operator & Primate Expeditions**  
> **Headquarters:** P.O. Box 2751, Goliondoi Road / Clock Tower Roundabout, Arusha, Tanzania  
> **Founder:** Akim Mmari | **WhatsApp 24/7:** +255 784 123 456 | **Email:** info@tingatingasafari.com

---

## 🌍 Executive Overview & Operating Charter
Tinga Tinga Safari is a boutique safari operator designing bespoke mid-range, luxury, and ultra-luxe expeditions across **Tanzania, Kenya, Rwanda, and Uganda**. Our core focus centers on the Great Migration, Bwindi/Volcanoes mountain gorilla trekking, chimpanzee habituation, and seamless cross-border multi-day circuits.

### The 4 Pillars of Transparency:
1. **No Hidden Subcontracting:** We own our fleet in Tanzania. In Uganda and Kenya, we partner openly with audited, named ground operators whose license numbers (AUTO-UG-2019-142, KATO-KE-2020-089) are published directly to travelers.
2. **One Accountable Human:** Founder Akim Mmari personally reviews every itinerary and remains reachable on WhatsApp 24/7.
3. **Official Permit Receipt Guarantee:** Uganda Wildlife Authority ($800) and Rwanda Development Board ($1,500) gorilla permits are purchased immediately upon receipt of the 30% deposit, with official scanned government receipts provided before final balance.
4. **Fair Living Wages & AMREF Insurance:** All staff, guides, and porters receive guaranteed daily living salaries. All guests are automatically covered under AMREF Flying Doctors 500km emergency air evacuation.

---

## 🛠️ Tech Stack & Architecture
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS (v4) + Lucide Icons + Motion animations.
- **Backend / API:** Full-stack Express.js server on port 3000 (`server.ts`).
- **AI Concierge:** Google Gen AI (`@google/genai` TypeScript SDK) running `gemini-2.5-flash` with 6 custom function calling tools (`search_itineraries`, `get_permit_info`, `build_custom_quote`, `create_lead`, `check_availability`, `handoff_to_human`).
- **Database:** Supabase PostgreSQL 15+ (`supabase/schema.sql`) with Row-Level Security (RLS).
- **Messaging:** Meta WhatsApp Business Cloud API (WABA) with 24-hour customer service window telemetry and pre-approved HSM templates.
- **Payment Gateways:** DPO Group (East Africa card & mobile money), Stripe, and PayPal for 30% trip deposits.
- **Deployment:** Containerized Docker multi-stage build for **Google Cloud Run** behind Firebase Hosting CDN.

---

## 🧭 Application Structure & Key Routes
- `/`: Cinematic Hero, 4-Pillars Transparency Strip, Curated Circuits, Partner Badges, and Verified Reviews.
- `/how-we-work`: Operating manifesto, booking-to-departure timeline, deposit rules, and cancellation policies.
- `/partners`: Directory of named ground partners in Uganda, Kenya, and Tanzania with licensing numbers and fleet specs.
- `/permits`: Comprehensive guide on Uganda ($800) vs. Rwanda ($1,500) gorilla permits, rules, and EATV visa.
- `/team`: Founder Akim Mmari's bio, naturalist staff credentials, and multi-lingual proficiencies (EN, FR, DE, ES, IT).
- `/reviews`: Filterable guest chronicles (destination, tier) with 4.96/5 score and review submission modal.
- `/journal`: Field dispatches on Mara River crossings, gorilla habituation, calving season, and camera gear.
- `/responsible-travel`: Living wages, AMREF Flying Doctors evacuation, plastic bans, and Karatu school partnerships.
- `/contact`: Arusha HQ coordinates, live East Africa Time (EAT) clock, and direct message form.
- `/safaris/:country`: Country spotlight pages (Tanzania, Uganda, Rwanda, Kenya).
- `/itineraries/:slug`: Detailed day-by-day expedition route, map, inclusions, lodge levels, and booking bar.
- `/trip-planner`: 5-step interactive safari designer calculating dynamic price bands and 30% deposit estimates.
- `/admin`: Operations portal (PIN: `tinga2025` or `akim`) with live leads pipeline, chat session inspector, itinerary editor, permit manager, and WABA status.

---

## 🚀 Local Development Setup

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure environment secrets
cp .env.example .env
# Fill in GEMINI_API_KEY and other credentials in .env

# 3. Start development server (boots backend and Vite on port 3000)
npm run dev

# 4. Run test suite
npm test

# 5. Build for production
npm run build
```

---

## 🚢 Production Deployment (Cloud Run & Firebase Hosting)

```bash
# 1. Build and push container to Google Cloud Build & Artifact Registry
gcloud builds submit --config=cloudbuild.yaml

# 2. Deploy CDN rewrites via Firebase Hosting
firebase deploy --only hosting
```
