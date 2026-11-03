import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, Lead, ComfortTier } from '../types';

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
  leads: Lead[];
  submitLead: (leadInput: Omit<Lead, 'id' | 'status' | 'createdAt'>) => Promise<Lead>;
  isInquiryModalOpen: boolean;
  modalOptions: InquiryModalOptions;
  openInquiryModal: (options?: InquiryModalOptions) => void;
  closeInquiryModal: () => void;
}

const STORAGE_KEY = 'enganda_safaris_leads_v1';
const CURRENCY_STORAGE_KEY = 'enganda_safaris_currency_v1';

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

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return [];
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

  return (
    <InquiryContext.Provider
      value={{
        currency,
        setCurrency,
        leads,
        submitLead,
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
