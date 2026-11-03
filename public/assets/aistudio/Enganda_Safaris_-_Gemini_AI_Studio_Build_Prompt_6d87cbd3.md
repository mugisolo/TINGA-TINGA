# Gemini AI Studio Prompt — Enganda Safaris Web Application

> **How to use:** Paste everything below the horizontal rule into Google AI Studio as your build prompt. It is self-contained: brand rules, site architecture, data models, AI concierge behavior, styling, and seed data are all specified.

---

## ROLE & MISSION

You are a senior full-stack engineer and UX designer. Build a complete, production-quality web application for **Enganda Safaris** — a Ugandan safari company unlike a conventional operator: Enganda is **a collective of professional local safari guides spread across Uganda**, coordinated from a head office in Entebbe. Guests don't book anonymous packages; they book a named, verified Ugandan guide who designs and leads their safari.

The application's core promise: **"The guide is the product."** Every screen must reinforce that guests are booking authentic, locally-led expertise — not a generic tour.

---

## BRAND FACTS (use exactly; never contradict)

- **Name:** Enganda Safaris
- **Tagline:** "Uganda, shown to you by the people who call it home."
- **Model:** A curated network of professional, licensed Ugandan safari guides covering every national park and region of Uganda. Uganda-only. Do NOT create content for Tanzania, Kenya, or Rwanda.
- **Head office:** Mugwanya Road, Bugonga, Entebbe, Uganda *(next to Rosemary Courts)* — "5 minutes from Entebbe International Airport." Show this on the Contact page with a map embed and in the footer.
- **Contact channels:** WhatsApp +256 700 000 000 (placeholder constant `WHATSAPP_NUMBER`, easy to change), inquiry form, email hello@engandasafaris.com (placeholder).
- **Currencies:** USD (primary), EUR, GBP, UGX. Never TZS or KES.

---

## ABSOLUTE CONTENT RULES (binding — the build is rejected if violated)

1. **Vehicles — total silence on ownership.** Never write "our fleet," "our vehicles," "we own," nor any statement that vehicles are hired, rented, outsourced, or third-party. Only describe the guest experience: *"Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide."* Vehicle specs may appear only as part of trip inclusions.
2. **Guides are the heroes.** Always "Enganda guides," "your guide," "our guide network across Uganda." Guides are named, photographed, and bylined on journal articles. There is no "partners" or "subcontractors" page — the guides ARE Enganda.
3. **Geography:** Uganda only. If an itinerary mentions a cross-border extension, exclude it — every route stays within Uganda.
4. **No fabricated trust signals:** no invented review counts, ratings, or "as seen in" badges. Seed review data must be clearly realistic sample content behind a single constant (e.g., `SAMPLE_REVIEWS`) so it can be swapped for real data.
5. **No availability hallucination:** neither the UI nor the AI concierge may claim live lodge or permit availability. The promise everywhere is: *"We confirm availability with lodges and Uganda Wildlife Authority within 12 hours of your inquiry."*
6. **Accreditations shown:** Uganda Tourism Board (UTB) registration, Association of Uganda Tour Operators (AUTO) membership, and "Official UWA permit receipts provided" — displayed in the footer and How We Work page. Do NOT show TATO, KATO, TANAPA, or RDB anywhere.

---

## TECH STACK

- **Frontend:** React 18 + TypeScript + Vite, React Router v6, Tailwind CSS, Lucide icons.
- **AI concierge:** `@google/genai` with model `gemini-2.5-flash` and function calling (tools specified below). If no API key is configured, a rule-based fallback concierge must handle queries gracefully without errors.
- **State:** React hooks + a lightweight context (`InquiryContext`) for the lead pipeline. Persist inquiries and guide data in localStorage-backed seed modules with clean TypeScript types, structured so a real backend can replace them later.
- **No backend required for v1** — but architect the data layer (`src/data/`, `src/types/`) as if it will become API-driven.

**Design language:** Dark safari aesthetic — `bg-stone-950` base, savanna amber/gold accents (`amber-500/600`), high-contrast typography, generous whitespace, full-bleed wildlife imagery with graceful image-fallback placeholders, responsive from 360px mobile to desktop. Sticky navbar, mobile drawer, footer with sitemap + accreditations + HQ address.

---

## DATA MODELS (`src/types/index.ts`)

```ts
Guide {
  id, slug, name, photo, homeRegion, tagline, bio,
  languages: string[],            // e.g. English, Luganda, Swahili, French, German
  specialties: ('gorillas'|'chimps'|'birding'|'big-game'|'culture'|'hiking'|'photography')[],
  regionsCovered: string[],       // e.g. 'Bwindi', 'Kibale', 'Murchison Falls', 'Kidepo'
  yearsExperience: number,
  certifications: string[],       // e.g. 'UWA certified site guide', 'Wilderness First Aid'
  rating: number, reviewCount: number
}

Experience (itinerary) {
  slug, title, region, durationDays, summary,
  dayByDay: DayPlan[],            // day, location, activities, accommodation tier, meals, drive time, wildlife highlights
  comfortTiers: ('mid-range'|'luxury'|'signature')[],
  priceBands: { tier, perPersonUSD, perPersonPerDayUSD }[],
  inclusions: string[],           // MUST include: 'Private 4x4 Land Cruiser with pop-up roof', 'Professional Enganda guide-driver', 'All park entrance fees', 'Gorilla/chimp permits as specified', 'Full-board meals', 'Airport meet & greet in Entebbe'
  exclusions: string[],
  recommendedGuides: string[],    // guide slugs
  permitsRequired: string[]       // PermitFact ids
}

PermitFact {
  id, name, authority: 'UWA', costUSD, validity, dailyQuota?, minAge?, notes
}

Lead {
  id, name, email, whatsapp, partySize, targetDates, budgetTier,
  interests: string[], preferredGuideSlug?, status: 'new'|'quote_sent'|'confirmed', createdAt
}

Review { id, guestName, country, experienceSlug, guideSlug, rating, text, date }
```

### Seed data requirements
- **8 guides** spanning Uganda's regions with distinct specialties (at least: 2 primate specialists for Bwindi/Kibale, 1 birding specialist covering Mabamba Swamp, 1 Kidepo/northern Uganda specialist, 1 Rwenzori hiking specialist, 1 culture & community specialist). Realistic Ugandan names, warm first-person bios, honest ratings (4.7–5.0 range).
- **6 experiences**, all within Uganda, e.g.: 3-Day Bwindi Gorilla Trek; 5-Day Gorillas & Kibale Chimps; 7-Day Best of Uganda (Murchison–Kibale–Queen Elizabeth–Bwindi); 10-Day Uganda Grand Circuit incl. Kidepo; 2-Day Jinja & Source of the Nile; 1-Day Mabamba Shoebill & Entebbe.
- **Permit facts** using these verified UWA tariffs (foreign non-resident, label the page "Tariffs verified November 2026 — confirm at booking"):
  - Gorilla trekking (Bwindi & Mgahinga): **US$800**; low-season (April, May, November) **US$600**, date-fixed and non-reschedulable.
  - Gorilla habituation (Rushaga): **US$1,500**, rising to **US$1,800 from 1 January 2027**.
  - Chimp tracking, Kibale: **US$250**, rising to **US$300 from 1 January 2027**; US$200 low season Apr/May/Nov 2026.
  - Chimp habituation, Kibale: **US$300**, rising to **US$400 from 1 January 2027**.
  - Chimp tracking, Kyambura Gorge: **US$100**, rising to **US$200 from 1 January 2027**.

---

## PAGES & ROUTES (`src/pages/`)

| Route | Component | Requirements |
|---|---|---|
| `/` | `HomePage` | Full-viewport wildlife hero with headline "Uganda, shown to you by the people who call it home"; 3-step "How it works" strip (Tell us → We match your guide → Your guide leads your safari); **featured guides carousel** (above itineraries — guides come first); featured experiences; UWA gorilla permit price anchor card ("Gorilla permits from US$600 low season"); reviews strip; dual CTA (Plan My Safari / WhatsApp us) |
| `/guides` | `GuidesPage` | **Flagship page.** Filterable directory of all guides: filter by specialty, region, language. Cards show photo, name, home region, specialties, languages, rating, years of experience |
| `/guides/:slug` | `GuideProfilePage` | Full guide dossier: bio, regions, specialties, languages, certifications, the experiences they lead (linked), reviews mentioning them, personal field-story section, prominent **"Request [Name] for your safari"** CTA prefilling the trip planner |
| `/experiences` | `ExperiencesPage` | Filterable catalogue (duration, region, interest, comfort tier). Cards show duration, price-from per person, permit tags, and the recommended guide's face + name |
| `/experiences/:slug` | `ExperienceDetailPage` | Day-by-day itinerary, inclusions/exclusions (vehicle wording per Content Rule 1), price bands per comfort tier, permit requirements with live tariff link, recommended guides sidebar, FAQ accordion, sticky bottom booking bar with inquiry modal |
| `/destinations` | `DestinationsPage` | Uganda regions only: Bwindi & Mgahinga, Kibale, Queen Elizabeth, Murchison Falls, Kidepo Valley, Rwenzori, Jinja & the Nile, Lake Bunyonyi, Entebbe & Mabamba. Each: seasons, wildlife, and *which Enganda guides are based there* |
| `/permits` | `PermitsPage` | UWA tariff table (seed data above), low-season calendar callout, daily quotas, minimum ages (15 for gorillas), 2027 price-change warnings, and the guarantee: "Official UWA receipts shared with you before we collect your balance." |
| `/how-we-work` | `HowWeWorkPage` | The guide-network model explained in 4 steps; deposit protection message ("Your deposit is protected and only released once permits and lodges are confirmed"); transparency commitments; fair guide wages statement |
| `/trip-planner` | `TripPlannerPage` | Multi-step designer: interests → region/destinations → duration slider → party size → comfort tier → **optional preferred guide** (browsable) → contact details → summary with indicative price band → creates a `Lead`. Ends with: "A real Enganda coordinator replies within 12 hours." |
| `/reviews` | `ReviewsPage` | Filterable by experience, guide, and rating. Each review names the guide. |
| `/journal` | `JournalPage` | Guide-bylined articles (seed 4: low-season gorilla trekking guide, Mabamba shoebill field notes, Bwindi packing list, 2027 UWA permit changes explained) |
| `/responsible-travel` | `ResponsibleTravelPage` | Fair wages for guides & porters, community revenue sharing around parks, no single-use plastics on safari, conservation contribution per booking |
| `/about` | `AboutPage` | Story of the collective, values, Entebbe HQ with map |
| `/contact` | `ContactPage` | HQ address (Mugwanya Road, Bugonga, Entebbe — next to Rosemary Courts), map embed, WhatsApp deep link, inquiry form, "airport pickup available" note |

**Global components:** `Navbar` (sticky, currency selector USD/EUR/GBP/UGX, mobile drawer), `Footer` (sitemap, UTB/AUTO badges, HQ address, WhatsApp), `GuideCard`, `ExperienceCard`, `StickyBookBar`, `InquiryModal`, `ConciergeWidget` (floating chat), `ScrollToTop`, `WhatsAppFloatButton`.

---

## AI CONCIERGE — "Guide Matcher" (floating widget)

Gemini 2.5 Flash with function calling. System persona: a warm, knowledgeable Ugandan safari coordinator based in Entebbe. It must obey the Absolute Content Rules (never discuss vehicle ownership; Uganda only; never claim live availability — always promise 12-hour human confirmation).

**Tools to implement:**
1. `match_guide(interests, language?, region?)` → returns best-fit Enganda guides with reasons.
2. `search_experiences(duration?, region?, interest?)` → queries the experiences catalogue.
3. `get_permit_info(permitName)` → returns the UWA tariff facts, always adding "official receipts provided."
4. `build_custom_quote(partySize, durationDays, comfortTier, interests)` → returns a price *band* only, and always states quotes need human confirmation.
5. `create_lead(...)` → saves a `Lead` and confirms the 12-hour response promise.
6. `check_availability(...)` → must NEVER fabricate availability; responds that a coordinator verifies with lodges/UWA within 12 hours.
7. `handoff_to_human()` → opens WhatsApp deep link to `WHATSAPP_NUMBER` with a prefilled message summarizing the conversation.

Quick-prompt chips: "Match me with a guide", "Gorilla permit prices", "Plan a 7-day safari", "Talk to a human on WhatsApp".

---

## SEO & META

Per-route `<title>`/meta via a small SEO component. Target phrases: "Uganda safari", "hire a local guide Uganda", "Bwindi gorilla trekking", "gorilla permit Uganda price", "safari company near Entebbe airport". Guide profile pages get person-schema JSON-LD; experiences get product/tour JSON-LD with price bands.

---

## DELIVERABLE & QUALITY BAR

- Complete, runnable Vite + React + TS project, `npm install && npm run dev` works out of the box.
- Fully responsive; no dead buttons or placeholder links — every CTA either navigates, opens the inquiry modal, or opens WhatsApp.
- Accessible: semantic HTML, alt text, focus states, keyboard-navigable modals.
- Clean separation: `src/types/`, `src/data/` (seed), `src/components/`, `src/pages/`, `src/concierge/` (AI + tools + fallback).
- README with: setup, where to set the Gemini API key, how to change `WHATSAPP_NUMBER`/contact constants, and how to replace sample reviews with real data.

Build the whole app now, file by file, production-quality.
