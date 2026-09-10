# WhatsApp Business Cloud API (WABA) Setup Guide
**Operator:** Tinga Tinga Safari & Holiday (Arusha, Tanzania)  
**Target WhatsApp Line:** +255 784 123 456  
**Webhook Path:** `https://your-domain.com/api/waba/webhook`

---

## 1. Meta Developer App Creation & Business Verification

1. Navigate to **[Meta for Developers](https://developers.facebook.com/)** and log in with your primary Facebook Business Administrator account.
2. Click **Create App** > Select **Other** > Choose **Business** as the app type.
3. Name your app `Tinga Tinga Safari Concierge` and associate it with your official **Meta Business Account** (TingaTinga Safari and Holiday, Arusha).
4. In your Meta Business Settings (`business.facebook.com`), complete **Business Verification**:
   - Upload Tanzania BRELA Certificate of Incorporation (`TZ-ARU-2018-842`).
   - Provide Tanzania Tourism Business License (TTBL) documentation.
   - Verify official business phone number (`+255 784 123 456`).

---

## 2. WhatsApp Product Setup

1. In the Meta App Dashboard, click **Set Up** on the **WhatsApp** card.
2. In the WhatsApp left sidebar, navigate to **API Setup**.
3. Under **Phone Numbers**, add and verify `+255 784 123 456` via SMS/Voice OTP.
4. Record your **Phone Number ID** (`WABA_PHONE_ID`) and **WhatsApp Business Account ID (WABA ID)**.

---

## 3. Generate Permanent System User Access Token

*Note: Temporary tokens expire in 24 hours. Production requires a permanent System User token.*

1. In **Business Settings** > **Users** > **System Users**, click **Add**.
2. Name: `tinga-waba-service`, Role: **Admin**.
3. Click **Add Assets** > Assign your WhatsApp Account with **Full Control**.
4. Click **Generate New Token**:
   - Token Expiration: **Never**
   - Required Scopes:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
5. Copy the generated token into your production environment:
   ```env
   WABA_ACCESS_TOKEN=EAAG...
   ```

---

## 4. Webhook Configuration

1. In your Meta App Dashboard > **WhatsApp** > **Configuration**:
2. Click **Edit** next to **Webhook**:
   - **Callback URL:** `https://your-app-domain.com/api/waba/webhook`
   - **Verify Token:** Set to match `WABA_VERIFY_TOKEN` in your `.env` (e.g., `tinga_tinga_waba_secret_token_2025`).
3. Click **Verify and Save**. (Our server answers GET challenges with HTTP 200).
4. Under **Webhook Fields**, click **Manage** and subscribe to:
   - `messages` (Incoming guest inquiries and replies)
   - `message_template_status_update` (Template approvals)

---

## 5. Approved High-Structured Message (HSM) Templates

Outside the free 24-hour service window, Meta mandates pre-approved templates:

### Template 1: Initial Inquiry Follow-up (`tinga_safari_greeting_v1`)
- **Category:** Marketing
- **Languages:** English (en), French (fr), German (de), Spanish (es), Italian (it)
- **Body:**
  > Jambo {{1}}! This is Akim Mmari from Tinga Tinga Safari in Arusha. I received your request for the {{2}}-day {{3}} circuit. Would you like to review our custom itinerary outline and discuss vehicle availability?
- **Buttons:** Quick Reply: *"Yes, show itinerary"* / *"Call Akim now"*

### Template 2: Official Permit Receipt Notice (`tinga_permit_receipt_confirmation_v2`)
- **Category:** Utility
- **Body:**
  > Jambo {{1}}, your official {{2}} gorilla trekking permit(s) for {{3}} have been successfully registered with the {{4}} Wildlife Authority. We have sent the scanned government cards to {{5}}. 
- **Buttons:** URL: `https://tingatingasafari.com/admin` (Track Status)

### Template 3: 30% Deposit Invoice Reminder (`tinga_deposit_invoice_reminder_v1`)
- **Category:** Utility
- **Body:**
  > Jambo {{1}}, to guarantee your private 4x4 pop-top Land Cruiser and lock in lodge reservations for {{2}}, your 30% trip deposit ($ {{3}} USD) is ready for payment via secure DPO Group or Stripe.

---

## 6. Operating Rules & 24-Hour Session Window
- When a traveler sends a WhatsApp message to `+255 784 123 456`, a **24-hour free-form customer service window** opens.
- Within this window, the Gemini Tinga Assistant or Akim can reply with custom text, PDFs, and route links at zero per-message template charges.
- Any tool call with `handoff_to_human` triggers an SMS/WhatsApp notification directly to Akim's personal device.
