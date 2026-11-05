import { Currency, LiveCurrencyRatesPayload } from '../types';

export const CURRENCY_RATES: Record<
  Currency,
  { symbol: string; rate: number; label: string; name: string }
> = {
  USD: { symbol: 'US$', rate: 1.0, label: 'USD ($)', name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', name: 'British Pound' },
  UGX: { symbol: 'UGX ', rate: 3720.0, label: 'UGX (USh)', name: 'Ugandan Shilling' },
};

const RATES_STORAGE_KEY = 'enganda_live_currency_rates_v2';

// Hydrate cached live rates immediately if present
try {
  if (typeof window !== 'undefined') {
    const cachedRaw = localStorage.getItem(RATES_STORAGE_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw);
      if (parsed && parsed.rates) {
        if (Number(parsed.rates.EUR) > 0) CURRENCY_RATES.EUR.rate = Number(parsed.rates.EUR);
        if (Number(parsed.rates.GBP) > 0) CURRENCY_RATES.GBP.rate = Number(parsed.rates.GBP);
        if (Number(parsed.rates.UGX) > 0) CURRENCY_RATES.UGX.rate = Number(parsed.rates.UGX);
      }
    }
  }
} catch {
  // Ignore localStorage access errors
}

export function updateLiveCurrencyRates(
  rates: Partial<Record<Currency, number>>
): Record<Currency, number> {
  CURRENCY_RATES.USD.rate = 1.0;
  if (typeof rates.EUR === 'number' && rates.EUR > 0) {
    CURRENCY_RATES.EUR.rate = Number(rates.EUR.toFixed(4));
  }
  if (typeof rates.GBP === 'number' && rates.GBP > 0) {
    CURRENCY_RATES.GBP.rate = Number(rates.GBP.toFixed(4));
  }
  if (typeof rates.UGX === 'number' && rates.UGX > 0) {
    CURRENCY_RATES.UGX.rate = Math.round(rates.UGX);
  }
  return {
    USD: CURRENCY_RATES.USD.rate,
    EUR: CURRENCY_RATES.EUR.rate,
    GBP: CURRENCY_RATES.GBP.rate,
    UGX: CURRENCY_RATES.UGX.rate,
  };
}

export async function fetchLiveCurrencyRates(
  forceRefresh = false
): Promise<LiveCurrencyRatesPayload> {
  try {
    const res = await fetch(
      `/api/currency-rates${forceRefresh ? '?refresh=1' : ''}`
    );
    if (res.ok) {
      const payload = (await res.json()) as LiveCurrencyRatesPayload;
      if (payload && payload.rates) {
        const updated = updateLiveCurrencyRates(payload.rates);
        const normalizedPayload: LiveCurrencyRatesPayload = {
          base: 'USD',
          rates: updated,
          updatedAt: payload.updatedAt || new Date().toISOString(),
          source: payload.source || 'live_api',
        };
        try {
          localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(normalizedPayload));
        } catch {
          // ignore
        }
        return normalizedPayload;
      }
    }
  } catch {
    // Fallback to direct rate check if backend route is unreachable
  }

  try {
    const directRes = await fetch('https://open.er-api.com/v6/latest/USD');
    if (directRes.ok) {
      const directData = await directRes.json();
      if (directData && directData.rates) {
        const updated = updateLiveCurrencyRates({
          USD: 1.0,
          EUR: Number(directData.rates.EUR) || 0.92,
          GBP: Number(directData.rates.GBP) || 0.79,
          UGX: Number(directData.rates.UGX) || 3720,
        });
        const payload: LiveCurrencyRatesPayload = {
          base: 'USD',
          rates: updated,
          updatedAt: directData.time_last_update_utc
            ? new Date(directData.time_last_update_utc).toISOString()
            : new Date().toISOString(),
          source: 'live_api',
        };
        try {
          localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(payload));
        } catch {
          // ignore
        }
        return payload;
      }
    }
  } catch {
    // Keep reference rates
  }

  return {
    base: 'USD',
    rates: {
      USD: CURRENCY_RATES.USD.rate,
      EUR: CURRENCY_RATES.EUR.rate,
      GBP: CURRENCY_RATES.GBP.rate,
      UGX: CURRENCY_RATES.UGX.rate,
    },
    updatedAt: new Date().toISOString(),
    source: 'entebbe_desk_reference',
  };
}

export function formatExchangeRateSummary(currency: Currency): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  if (currency === 'USD') {
    return '1 USD = US$1.00';
  }
  if (currency === 'UGX') {
    return `1 USD = UGX ${Math.round(info.rate).toLocaleString()}`;
  }
  return `1 USD = ${info.symbol}${info.rate.toFixed(2)}`;
}

export function formatPrice(amountUSD: number, currency: Currency = 'USD'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(amountUSD * info.rate);
  if (currency === 'UGX') {
    return `UGX ${converted.toLocaleString()}`;
  }
  return `${info.symbol}${converted.toLocaleString()}`;
}

export function convertFromUSD(amountUSD: number, currency: Currency = 'USD'): number {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  return Math.round(amountUSD * info.rate);
}

export const convertPrice = convertFromUSD;

