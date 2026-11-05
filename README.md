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

---

## 5. Production Deployment Guide (Firebase & Google Cloud Run)

### 5.1 Required Environment Variables
Copy `.env.example` to `.env` for local development or configure the following variables in Google Cloud Run:

| Variable | Description |
| :--- | :--- |
| `API_KEY` / `GEMINI_API_KEY` | Server-side Gemini API key initialized via `new GoogleGenAI({ apiKey: process.env.API_KEY })` in `server.ts` |
| `PORT` | HTTP server port (defaults to `3000`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web App API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (`gen-lang-client-0760457427.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | GCP / Firebase Project ID (`gen-lang-client-0760457427`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket (`gen-lang-client-0760457427.firebasestorage.app`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Named Firestore database ID (`ai-studio-tingatingasafari-977ea282-9f6e-4517-99b9-1d8a012db444`) |

### 5.2 Enabling Firestore & Authentication in the Firebase Console
1. Open the [Firebase Console](https://console.firebase.google.com/) and select project **`gen-lang-client-0760457427`**.
2. **Authentication**: Navigate to **Build → Authentication → Sign-in method** and enable the **Google** provider. Under **Authentication → Settings → Authorized domains**, add your Cloud Run service domain (`*.run.app`) and custom production domain.
3. **Firestore Database**: Navigate to **Build → Firestore Database** and ensure the database instance (`ai-studio-tingatingasafari-977ea282-9f6e-4517-99b9-1d8a012db444`) is provisioned in Standard mode.

### 5.3 Deploying Firestore Security Rules & Composite Indexes
Deploy `firestore.rules` and `firestore.indexes.json` using the Firebase CLI:

```bash
# Authenticate and select project alias defined in .firebaserc
firebase login
firebase use default

# Deploy production security rules and composite indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 5.4 Deploying to Google Cloud Run
This repository includes a multi-stage `Dockerfile` that builds the Vite SPA (`dist/`) and bundles `server.ts` (`dist/server.cjs`) to serve both the API and static frontend on port `3000`:

```bash
# Build and deploy directly from source to Google Cloud Run
gcloud run deploy tingatingasafari \
  --source . \
  --project gen-lang-client-0760457427 \
  --region europe-west2 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production,VITE_FIREBASE_PROJECT_ID=gen-lang-client-0760457427,VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-tingatingasafari-977ea282-9f6e-4517-99b9-1d8a012db444" \
  --set-secrets="API_KEY=GEMINI_API_KEY:latest"
```

