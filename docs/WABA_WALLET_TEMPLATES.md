# Tinga Tinga Safari - WhatsApp Business Cloud API (WABA) Wallet Templates
> **Official Meta Graph API v18+ Approved Utility & Transactional Templates**  
> **Operator:** TingaTinga Safari and Holiday (P.O. Box 2751, Arusha, Tanzania)  
> **Target Verified Line:** +255 784 123 456 | **Account:** Tinga Tinga Concierge

---

## Overview
All wallet transactions trigger automated WhatsApp notifications to the traveler's verified WhatsApp number (`wa_id`). If the customer is outside the standard 24-hour service window, Meta strictly requires pre-approved High-Structured Message (HSM) templates. Below are the 5 official registered templates.

---

### 1. Template: `topup_success`
- **Category:** `UTILITY`
- **Language:** English (`en_US`), French (`fr`), German (`de`), Spanish (`es`)
- **Header:** `Tinga Tinga Safari Wallet Credited`
- **Body:**
  > Jambo {{1}}! Your Tinga Safari Wallet has been credited with **${{2}} USD** via {{3}}.  
  > **New Available Balance:** ${{4}} USD  
  > **Ledger Reference:** `{{5}}`  
  > Your funds are ready to apply toward gorilla permits and private Land Cruiser bookings.
- **Footer:** `Tinga Tinga Safari • Arusha HQ`
- **Buttons:**
  1. **URL:** `https://tingatingasafari.com/wallet` (`View Wallet & Ledger`)
  2. **QUICK_REPLY:** `Plan Safari Now`

---

### 2. Template: `payment_held`
- **Category:** `UTILITY`
- **Language:** English (`en_US`)
- **Header:** `Safari Deposit Placed in Escrow`
- **Body:**
  > Jambo {{1}}! A 30% safari deposit of **${{2}} USD** has been placed into escrow hold from your wallet for booking **#{{3}}** ({{4}}).  
  > **Transparency Notice:** Your funds remain securely in escrow until founder Akim confirms your lodge reservations and statutory gorilla permits.
- **Footer:** `Escrow Protected • Tinga Tinga Safari`
- **Buttons:**
  1. **URL:** `https://tingatingasafari.com/wallet` (`Track Booking Escrow`)
  2. **QUICK_REPLY:** `Message Akim on WhatsApp`

---

### 3. Template: `payment_captured`
- **Category:** `UTILITY`
- **Language:** English (`en_US`)
- **Header:** `Safari Confirmed & Escrow Released`
- **Body:**
  > Habari {{1}}! Great news: founder Akim Mmari has verified your circuit and secured official permits for **{{2}}**.  
  > Your escrow deposit of **${{3}} USD** has now been captured. Scanned government permit cards will be delivered directly to your Google Drive vault.
- **Footer:** `Tinga Tinga Safari • Arusha HQ`
- **Buttons:**
  1. **URL:** `https://tingatingasafari.com/drive` (`View Permit Scans in Drive`)
  2. **URL:** `https://tingatingasafari.com/wallet` (`Download Statement`)

---

### 4. Template: `refund_received`
- **Category:** `UTILITY`
- **Language:** English (`en_US`)
- **Header:** `Safari Refund Credited to Wallet`
- **Body:**
  > Jambo {{1}}! A refund of **${{2}} USD** has been credited to your Tinga Safari Wallet for booking **#{{3}}**.  
  > **Reason Code:** {{4}}  
  > **New Available Balance:** ${{5}} USD  
  > Credits are immediately available for future bookings or can be wired upon request.
- **Footer:** `Tinga Tinga Safari • Arusha HQ`
- **Buttons:**
  1. **URL:** `https://tingatingasafari.com/wallet` (`View Wallet History`)

---

### 5. Template: `referral_credit_received`
- **Category:** `MARKETING`
- **Language:** English (`en_US`)
- **Header:** `Safari Friend Referral Reward!`
- **Body:**
  > Asante sana {{1}}! Your friend **{{2}}** just reserved their East African safari with Tinga Tinga Safari using your referral code **{{3}}**.  
  > We have credited your wallet with a **${{4}} USD** safari travel credit!
- **Footer:** `Tinga Tinga Safari Referral Club`
- **Buttons:**
  1. **URL:** `https://tingatingasafari.com/wallet` (`View Balance & Share Code`)
  2. **QUICK_REPLY:** `Browse 2026 Circuits`

---

## Dispatch Payload Example (Meta Cloud API)
```json
{
  "messaging_product": "whatsapp",
  "to": "255784123456",
  "type": "template",
  "template": {
    "name": "topup_success",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Charlotte Dubois" },
          { "type": "text", "text": "1,500.00" },
          { "type": "text", "text": "DPO Group" },
          { "type": "text", "text": "5,500.00" },
          { "type": "text", "text": "TOP-2026-0910-482" }
        ]
      }
    ]
  }
}
```
