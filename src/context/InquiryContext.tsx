import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Currency, Lead, ComfortTier } from '../types';
import { CURRENCY_RATES, fetchLiveCurrencyRates } from '../lib/currency';

interface InquiryModalOptions {
  guideSlug?: string;
  experienceSlug?: string;
  defaultDates?: string;
  defaultTier?: ComfortTier;
  defaultNotes?: string;
}

interface InquiryContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<Currency, number>;
  ratesUpdatedAt: string;
  ratesSource: 'live_api' | 'entebbe_desk_reference';
  isRefreshingRates: boolean;
  refreshExchangeRates: () => Promise<void>;
  leads: Lead[];
  submitLead: (leadInput: Omit<Lead, 'id' | 'status' | 'createdAt'>) => Promise<Lead>;
  updateLeadStatus: (leadId: string, status: Lead['status'], preferredGuideSlug?: string) => void;
  isInquiryModalOpen: boolean;
  modalOptions: InquiryModalOptions;
  openInquiryModal: (options?: InquiryModalOptions) => void;
  closeInquiryModal: () => void;
}

const STORAGE_KEY = 'enganda_safaris_leads_v1';
const CURRENCY_STORAGE_KEY = 'enganda_safaris_currency_v1';

const INITIAL_SEED_LEADS: Lead[] = [
  {
    id: 'eng_lead_seed_1',
    name: 'Dr. Clara & Lukas Vandenberg',
    email: 'c.vandenberg@uzleuven.be',
    whatsapp: '+32 478 21 90 44',
    partySize: 2,
    targetDates: '2026-12-14 to 2026-12-21',
    budgetTier: 'luxury',
    interests: ['gorillas', 'chimps', 'photography'],
    regions: ['Bwindi & Mgahinga', 'Kibale Forest', 'Queen Elizabeth NP'],
    durationDays: 7,
    preferredGuideSlug: 'samuel-kato',
    experienceSlug: '7-day-best-of-uganda',
    notes: 'Requesting Rushaga or Nkuringo sector habituation permit + Crater Lodge honeymoon suite.',
    status: 'confirmed',
    createdAt: '2026-10-29T10:15:00.000Z',
  },
  {
    id: 'eng_lead_seed_2',
    name: 'Marcus Sterling & Family',
    email: 'msterling@sterlingcap.co.uk',
    whatsapp: '+44 7700 900412',
    partySize: 4,
    targetDates: '2027-01-18 to 2027-01-27',
    budgetTier: 'signature',
    interests: ['big-game', 'gorillas', 'culture'],
    regions: ['Kidepo Valley NP', 'Murchison Falls NP', 'Bwindi & Mgahinga'],
    durationDays: 10,
    preferredGuideSlug: 'david-ochieng',
    experienceSlug: '10-day-uganda-grand-circuit-kidepo',
    notes: 'Private charter option between Kidepo and Kajjansi; 4x4 Land Cruiser with child booster seats.',
    status: 'quote_sent',
    createdAt: '2026-11-01T14:40:00.000Z',
  },
  {
    id: 'eng_lead_seed_3',
    name: 'Hélène & Antoine Moreau',
    email: 'antoine.moreau@lyon-arch.fr',
    whatsapp: '+33 6 14 88 29 10',
    partySize: 2,
    targetDates: '2027-02-06 to 2027-02-11',
    budgetTier: 'mid-range',
    interests: ['birding', 'chimps'],
    regions: ['Mabamba Swamp', 'Kibale Forest', 'Bigodi Wetland'],
    durationDays: 5,
    preferredGuideSlug: 'grace-namukasa',
    experienceSlug: '5-day-gorillas-and-kibale-chimps',
    notes: 'French-speaking ornithology specialist requested; high priority on Shoebill & Green-breasted Pitta.',
    status: 'new',
    createdAt: '2026-11-02T16:20:00.000Z',
  },
];

const InquiryContext = createContext<InquiryContextValue | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
      if (saved && ['USD', 'EUR', 'GBP', 'UGX'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({
    USD: CURRENCY_RATES.USD.rate,
    EUR: CURRENCY_RATES.EUR.rate,
    GBP: CURRENCY_RATES.GBP.rate,
    UGX: CURRENCY_RATES.UGX.rate,
  });
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string>(
    new Date().toISOString()
  );
  const [ratesSource, setRatesSource] = useState<
    'live_api' | 'entebbe_desk_reference'
  >('live_api');
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_SEED_LEADS;
  });

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<InquiryModalOptions>({});

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const refreshExchangeRates = useCallback(async (force = true) => {
    setIsRefreshingRates(true);
    try {
      const payload = await fetchLiveCurrencyRates(force);
      setExchangeRates({ ...payload.rates });
      setRatesUpdatedAt(payload.updatedAt);
      setRatesSource(payload.source);
    } finally {
      setIsRefreshingRates(false);
    }
  }, []);

  useEffect(() => {
    refreshExchangeRates(false);
  }, [refreshExchangeRates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }, [leads]);

  const openInquiryModal = (options: InquiryModalOptions = {}) => {
    setModalOptions(options);
    setIsInquiryModalOpen(true);
  };

  const closeInquiryModal = () => {
    setIsInquiryModalOpen(false);
  };

  const submitLead = async (
    leadInput: Omit<Lead, 'id' | 'status' | 'createdAt'>
  ): Promise<Lead> => {
    const newLead: Lead = {
      ...leadInput,
      id: 'eng_lead_' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
    } catch {
      // Stored locally in localStorage even if offline
    }

    return newLead;
  };

  const updateLeadStatus = (
    leadId: string,
    status: Lead['status'],
    preferredGuideSlug?: string
  ) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              preferredGuideSlug: preferredGuideSlug ?? lead.preferredGuideSlug,
            }
          : lead
      )
    );
  };

  return (
    <InquiryContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates,
        ratesUpdatedAt,
        ratesSource,
        isRefreshingRates,
        refreshExchangeRates: () => refreshExchangeRates(true),
        leads,
        submitLead,
        updateLeadStatus,
        isInquiryModalOpen,
        modalOptions,
        openInquiryModal,
        closeInquiryModal,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
};

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return ctx;
}


