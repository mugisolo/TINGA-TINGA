import { Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string; name: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', name: 'US Dollar' },
  TZS: { symbol: 'TSh', rate: 2650.0, label: 'TZS (TSh)', name: 'Tanzanian Shilling' },
  UGX: { symbol: 'USh', rate: 3750.0, label: 'UGX (USh)', name: 'Ugandan Shilling' },
  KES: { symbol: 'KSh', rate: 130.0, label: 'KES (KSh)', name: 'Kenyan Shilling' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', name: 'Euro' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', name: 'British Pound' },
};

export function formatPrice(amountUSD: number, currency: Currency = 'USD'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(amountUSD * info.rate);
  const isShilling = ['TZS', 'UGX', 'KES'].includes(currency);
  const prefix = isShilling ? `${info.symbol} ` : info.symbol;
  return `${prefix}${converted.toLocaleString()}`;
}

export function convertFromUSD(amountUSD: number, currency: Currency = 'USD'): number {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  return Math.round(amountUSD * info.rate);
}

export const convertPrice = convertFromUSD;
