# Enganda Safaris — Uganda Guide Collective Platform

> **Tagline:** *"Uganda, shown to you by the people who call it home."*  
> **Core Promise:** *"The guide is the product."*  
> **Head Office:** Mugwanya Road, Bugonga, Entebbe, Uganda *(next to Rosemary Courts — 5 minutes from Entebbe International Airport)*  
> **WhatsApp:** `+256 700 000 000` | **Email:** `hello@engandasafaris.com`

---

## 1. Overview

**Enganda Safaris** is a web application for a curated collective of 8 licensed local Ugandan safari guides coordinated from Entebbe, Uganda. Rather than booking an anonymous package, travelers browse and request a named Ugandan guide who designs and leads their private Uganda safari.

### Key Architectural & Content Guarantees
- **Uganda Exclusive:** All 6 experiences and 9 destination regions are strictly within Uganda.
- **Guides First:** 8 verified Ugandan guides with regional specialties, spoken languages, certifications, and first-person field stories.
- **Verified UWA Permit Schedule:** Accurate Uganda Wildlife Authority (UWA) tariffs (verified November 2026) including US$600 low-season permits (April, May, November) and 1 January 2027 tariff adjustments.
- **Accreditations:** Uganda Tourism Board (UTB) registration, Association of Uganda Tour Operators (AUTO) membership, and official UWA permit receipts provided before balance collection.

---

## 2. Quick Setup & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Express API + Vite SPA on port 3000)
npm run dev

# 3. Build for production
npm run build
```

---

## 3. Configuring `GEMINI_API_KEY` (AI Concierge)

The **Enganda Guide Matcher** AI Concierge uses the `@google/genai` SDK (`gemini-2.5-flash`) on the server (`server.ts` -> `POST /api/chat`) with 7 function-calling tools:
- `match_guide`
- `search_experiences`
- `get_permit_info`
- `build_custom_quote`
- `create_lead`
- `check_availability`
- `handoff_to_human`

To enable live Gemini responses:
1. Set `GEMINI_API_KEY=your_api_key_here` in your `.env` file or environment variables.
2. If `GEMINI_API_KEY` is not set or unreachable, the app automatically falls back to the deterministic rule-based concierge in `src/concierge/conciergeEngine.ts` with zero crashes.

---

## 4. Customizing Contact Constants & Sample Data

All brand constants, guides, experiences, UWA permit tariffs, and sample reviews live in **`src/data/seedData.ts`**:

- **Change WhatsApp Number & Email:**
  Update `WHATSAPP_NUMBER`, `WHATSAPP_CLEAN`, `CONTACT_EMAIL`, and `HQ_ADDRESS` at the top of `src/data/seedData.ts`.
- **Replace Sample Reviews with Real Guest Data:**
  Locate the `SAMPLE_REVIEWS` constant in `src/data/seedData.ts` and replace the array items with your verified guest reviews (each review links `guideSlug` and `experienceSlug`).
