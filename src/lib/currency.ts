import { Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
};

export function formatPrice(amountUSD: number, currency: Currency = 'USD'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(amountUSD * info.rate);
  return `${info.symbol}${converted.toLocaleString()}`;
}

export function convertFromUSD(amountUSD: number, currency: Currency = 'USD'): number {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  return Math.round(amountUSD * info.rate);
}

export const convertPrice = convertFromUSD;
