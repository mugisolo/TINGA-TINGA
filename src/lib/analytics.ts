export type AnalyticsEvent = 
  | 'planner_start'
  | 'planner_complete'
  | 'lead_created'
  | 'waba_conversation_started'
  | 'quote_requested'
  | 'deposit_modal_opened'
  | 'itinerary_viewed'
  | 'wallet_topup_started'
  | 'wallet_topup_completed'
  | 'wallet_payment_held'
  | 'wallet_payment_captured'
  | 'wallet_refund_issued'
  | 'referral_credit_issued'
  | 'wallet_suspended';

export async function trackEvent(eventName: AnalyticsEvent, payload: Record<string, any> = {}) {
  // 1. Client-side GA4 / dataLayer push
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Server-side event forwarding (GA4 Measurement Protocol / Meta CAPI fallback)
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        payload,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('Analytics server event dispatched:', eventName);
  }
}
