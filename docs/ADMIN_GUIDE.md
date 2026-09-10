# Tinga Tinga Safari - Arusha HQ Operations Manual
**Headquarters:** Goliondoi Road / Clock Tower Roundabout, P.O. Box 2751, Arusha, Tanzania  
**Primary Administrator:** Akim Mmari (Founder & Lead Safari Architect)

---

## 1. Accessing the Staff Portal
1. Navigate to `/admin` in your web browser.
2. Enter the Staff Access PIN: `tinga2025` (or `akim`).
3. You will enter the central **Operations & Concierge Cockpit**.

---

## 2. Managing Safari Leads (Pipeline)
The Leads Pipeline aggregates inquiries from three channels:
1. **Interactive Trip Planner** (`/trip-planner`)
2. **Direct Contact Inquiries** (`/contact`)
3. **AI Concierge Conversational Lead Captures** (Floating Widget)

### Lead Status Lifecycle:
- **`new`**: Fresh traveler inquiry. Review traveler notes, destination countries, dates, and party size.
- **`qualified`**: Dates and budget tier verified. Confirm that the travel season matches wildlife movements (e.g. Serengeti river crossings vs Ndutu calving).
- **`quote_sent`**: Formal custom itinerary and price band dispatched to the traveler via WhatsApp or email.
- **`deposit_paid`**: 30% trip deposit confirmed through DPO Group, Stripe, or bank transfer. Vehicle and guides reserved.
- **`closed_won`**: Official UWA/RDB permits issued, final balance collected 60 days before departure.

---

## 3. The 30% Deposit & Permit Acquisition Workflow
1. **Never buy permits on speculation:** Uganda Wildlife Authority (UWA) permits ($800) and Rwanda Development Board (RDB) permits ($1,500) are statutory, non-refundable government documents tied to guest passport numbers.
2. **Deposit Gateways:**
   - **DPO Group:** Primary East African card gateway (accepts Visa, Mastercard, Amex, M-Pesa).
   - **Stripe:** For North American & European credit card settlements.
   - **PayPal:** International wire alternative.
3. **Permit Issuance:**
   - Upon deposit receipt, submit traveler passport copies to the UWA or RDB portal immediately.
   - Scan the physical plastic cards or digital QR cards showing the assigned sector (e.g., Buhoma, Rushaga, Nkuringo).
   - Email the government scan to the guest as proof of purchase before requesting the final 70% balance.

---

## 4. Monitoring the AI Assistant & Human Handoffs
- In the **Agent Sessions** tab at `/admin`, staff can inspect all live conversations handled by Tinga Assistant.
- Every tool call executed (`search_itineraries`, `get_permit_info`, `build_custom_quote`, `create_lead`) is logged with its exact JSON parameters.
- **When to intervene:** If a traveler asks for custom vehicle configurations (e.g. disabled access, professional photography beanbags, chartered Cessna Caravans), the assistant triggers `handoff_to_human`. Reach out immediately to the traveler on WhatsApp.

---

## 5. Ground Partner Standards & Fleets
- **Tanzania:** Own fleet of extended Toyota Land Cruisers with pop-top observation hatches, dual 220V inverter sockets, onboard fridge, and 20L water dispensers.
- **Uganda:** Gorilla Highlands Expeditions (AUTO / UWA Lic #AUTO-UG-2019-142).
- **Kenya:** Savannah Trackers Kenya (KATO Bonded #KATO-KE-2020-089).
- All guides must hold national certifications, advanced first-aid credentials, and active AMREF Flying Doctors coverage.
