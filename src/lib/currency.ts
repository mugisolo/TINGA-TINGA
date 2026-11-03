import { Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string; name: string }> = {
  USD: { symbol: 'US$', rate: 1.0, label: 'USD ($)', name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', name: 'British Pound' },
  UGX: { symbol: 'UGX ', rate: 3720.0, label: 'UGX (USh)', name: 'Ugandan Shilling' },
};

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
