import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import {
  Currency,
  Lead,
  ComfortTier,
  ConfirmedPackageEvent,
  EventDisplayPlacement,
  FooterPartnerLogo,
} from '../types';
import { CURRENCY_RATES, fetchLiveCurrencyRates } from '../lib/currency';
import {
  CONFIRMED_PACKAGES_AND_EVENTS,
  INITIAL_FOOTER_LOGOS,
  DEFAULT_POWERED_BY_TEXT,
  drivePhotoUrl,
} from '../data/seedData';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

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
  safariEvents: ConfirmedPackageEvent[];
  carouselEvents: ConfirmedPackageEvent[];
  upcomingEvents: ConfirmedPackageEvent[];
  addSafariEvent: (eventInput: Omit<ConfirmedPackageEvent, 'id'>) => Promise<ConfirmedPackageEvent>;
  updateSafariEventPlacement: (id: string, placement: EventDisplayPlacement) => Promise<void>;
  deleteSafariEvent: (id: string) => Promise<void>;
  footerLogos: FooterPartnerLogo[];
  activeFooterLogos: FooterPartnerLogo[];
  poweredByText: string;
  setPoweredByText: (text: string) => void;
  addFooterLogo: (logoInput: Omit<FooterPartnerLogo, 'id'>) => Promise<FooterPartnerLogo>;
  updateFooterLogo: (id: string, updates: Partial<FooterPartnerLogo>) => Promise<void>;
  deleteFooterLogo: (id: string) => Promise<void>;
  resetFooterLogosToDefault: () => Promise<void>;
  isInquiryModalOpen: boolean;
  modalOptions: InquiryModalOptions;
  openInquiryModal: (options?: InquiryModalOptions) => void;
  closeInquiryModal: () => void;
}

const STORAGE_KEY = 'enganda_safaris_leads_v1';
const CURRENCY_STORAGE_KEY = 'enganda_safaris_currency_v1';
const EVENTS_STORAGE_KEY = 'enganda_safaris_events_v4';
const FOOTER_LOGOS_STORAGE_KEY = 'enganda_safaris_footer_logos_v2';
const POWERED_BY_STORAGE_KEY = 'enganda_safaris_powered_by_v2';

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

  const [safariEvents, setSafariEvents] = useState<ConfirmedPackageEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return CONFIRMED_PACKAGES_AND_EVENTS;
  });

  const [footerLogos, setFooterLogos] = useState<FooterPartnerLogo[]>(() => {
    try {
      const saved = localStorage.getItem(FOOTER_LOGOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_FOOTER_LOGOS;
  });

  const [poweredByText, setPoweredByTextState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(POWERED_BY_STORAGE_KEY);
      if (saved && saved.trim().length > 0) {
        return saved;
      }
    } catch {
      // ignore
    }
    return DEFAULT_POWERED_BY_TEXT;
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

  const setPoweredByText = (text: string) => {
    const clean = text.trim() || DEFAULT_POWERED_BY_TEXT;
    setPoweredByTextState(clean);
    try {
      localStorage.setItem(POWERED_BY_STORAGE_KEY, clean);
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

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(safariEvents));
    } catch {
      // ignore
    }
  }, [safariEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(FOOTER_LOGOS_STORAGE_KEY, JSON.stringify(footerLogos));
    } catch {
      // ignore
    }
  }, [footerLogos]);

  // Sync any cloud-saved safari_events and footer_logos when authenticated
  useEffect(() => {
    let isMounted = true;
    const loadRemoteData = async () => {
      if (!auth.currentUser?.uid) return;
      try {
        const snap = await getDocs(collection(db, 'safari_events'));
        if (!snap.empty && isMounted) {
          const remoteList: ConfirmedPackageEvent[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.title) {
              remoteList.push({
                id: String(d.id),
                title: String(d.title),
                shortTabLabel: d.shortTabLabel ? String(d.shortTabLabel) : undefined,
                subtitle: String(d.subtitle || ''),
                eventTag: String(d.eventTag || 'CONFIRMED DEPARTURE'),
                category: (d.category as ConfirmedPackageEvent['category']) || 'Guaranteed Primate Departure',
                dateWindow: String(d.dateWindow || 'Upcoming 2026/2027'),
                durationLabel: String(d.durationLabel || '4 Days / 3 Nights'),
                location: String(d.location || 'Uganda'),
                spotsRemaining: Number(d.spotsRemaining) || 4,
                pricePerPersonUSD: Number(d.pricePerPersonUSD) || 1950,
                leadGuideSlug: String(d.leadGuideSlug || 'samuel-kato'),
                experienceSlug: d.experienceSlug ? String(d.experienceSlug) : undefined,
                heroImage: String(d.heroImage || drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE')),
                highlights: Array.isArray(d.highlights) ? d.highlights.map(String) : [],
                statusLabel: String(d.statusLabel || 'Confirmed Departure'),
                placement: (d.placement as EventDisplayPlacement) || 'both',
              });
            }
          });
          if (remoteList.length > 0) {
            setSafariEvents((prev) => {
              const map = new Map<string, ConfirmedPackageEvent>();
              prev.forEach((item) => map.set(item.id, item));
              remoteList.forEach((item) => map.set(item.id, item));
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'safari_events');
        } catch {
          // Handled
        }
      }

      try {
        const logoSnap = await getDocs(collection(db, 'footer_logos'));
        if (!logoSnap.empty && isMounted) {
          const remoteLogos: FooterPartnerLogo[] = [];
          logoSnap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.name && d.logoUrl) {
              remoteLogos.push({
                id: String(d.id),
                name: String(d.name),
                subtitle: String(d.subtitle || ''),
                logoUrl: String(d.logoUrl),
                category:
                  (d.category as FooterPartnerLogo['category']) ||
                  'Strategic Partner',
                websiteUrl: d.websiteUrl ? String(d.websiteUrl) : undefined,
                active: Boolean(d.active),
                displayOrder: Number(d.displayOrder) || 1,
              });
            }
          });
          if (remoteLogos.length > 0) {
            setFooterLogos((prev) => {
              const map = new Map<string, FooterPartnerLogo>();
              prev.forEach((item) => map.set(item.id, item));
              remoteLogos.forEach((item) => map.set(item.id, item));
              return Array.from(map.values()).sort(
                (a, b) => a.displayOrder - b.displayOrder
              );
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'footer_logos');
        } catch {
          // Handled
        }
      }
    };
    loadRemoteData();
    return () => {
      isMounted = false;
    };
  }, []);

  const carouselEvents = useMemo(() => {
    const filtered = safariEvents.filter(
      (ev) => !ev.placement || ev.placement === 'carousel' || ev.placement === 'both'
    );
    return filtered.length > 0 ? filtered : safariEvents.slice(0, 4);
  }, [safariEvents]);

  const upcomingEvents = useMemo(() => {
    const filtered = safariEvents.filter(
      (ev) => ev.placement === 'upcoming' || ev.placement === 'both'
    );
    return filtered.length > 0 ? filtered : safariEvents;
  }, [safariEvents]);

  const activeFooterLogos = useMemo(() => {
    return [...footerLogos]
      .filter((logo) => logo.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [footerLogos]);

  const syncSafariEventToFirestore = async (
    eventObj: ConfirmedPackageEvent,
    op: OperationType
  ) => {
    if (!auth.currentUser?.uid) return;
    const docPath = `safari_events/${eventObj.id}`;
    try {
      await setDoc(doc(db, 'safari_events', eventObj.id), {
        id: eventObj.id.slice(0, 128),
        userId: auth.currentUser.uid.slice(0, 128),
        title: eventObj.title.slice(0, 200),
        shortTabLabel: (eventObj.shortTabLabel || eventObj.title.slice(0, 24)).slice(0, 64),
        subtitle: (eventObj.subtitle || '').slice(0, 400),
        eventTag: (eventObj.eventTag || 'CONFIRMED EXPEDITION').slice(0, 64),
        category: eventObj.category,
        dateWindow: eventObj.dateWindow.slice(0, 128),
        durationLabel: eventObj.durationLabel.slice(0, 128),
        location: eventObj.location.slice(0, 256),
        spotsRemaining: Math.max(0, Math.min(200, Number(eventObj.spotsRemaining) || 4)),
        pricePerPersonUSD: Math.max(0, Number(eventObj.pricePerPersonUSD) || 1950),
        leadGuideSlug: eventObj.leadGuideSlug.slice(0, 128),
        experienceSlug: (eventObj.experienceSlug || '7-day-best-of-uganda').slice(0, 128),
        heroImage: eventObj.heroImage.slice(0, 1024),
        highlights: (eventObj.highlights || []).slice(0, 10).map((h) => String(h).slice(0, 300)),
        statusLabel: (eventObj.statusLabel || 'Confirmed Departure').slice(0, 128),
        placement: eventObj.placement || 'both',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, op, docPath);
      } catch {
        // Handled
      }
    }
  };

  const addSafariEvent = async (
    eventInput: Omit<ConfirmedPackageEvent, 'id'>
  ): Promise<ConfirmedPackageEvent> => {
    const newId = `pkg_custom_${Date.now()}`;
    const created: ConfirmedPackageEvent = {
      ...eventInput,
      id: newId,
      placement: eventInput.placement || 'both',
    };

    setSafariEvents((prev) => [created, ...prev]);
    await syncSafariEventToFirestore(created, OperationType.CREATE);
    return created;
  };

  const updateSafariEventPlacement = async (
    id: string,
    placement: EventDisplayPlacement
  ): Promise<void> => {
    let updatedItem: ConfirmedPackageEvent | null = null;
    setSafariEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          updatedItem = { ...ev, placement };
          return updatedItem;
        }
        return ev;
      })
    );

    if (updatedItem) {
      await syncSafariEventToFirestore(updatedItem, OperationType.UPDATE);
    }
  };

  const deleteSafariEvent = async (id: string): Promise<void> => {
    setSafariEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `safari_events/${id}`;
      try {
        await deleteDoc(doc(db, 'safari_events', id));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const syncFooterLogoToFirestore = async (
    logoObj: FooterPartnerLogo,
    op: OperationType
  ) => {
    if (!auth.currentUser?.uid) return;
    const docPath = `footer_logos/${logoObj.id}`;
    try {
      const payload: Record<string, unknown> = {
        id: logoObj.id.slice(0, 128),
        userId: auth.currentUser.uid.slice(0, 128),
        name: logoObj.name.slice(0, 128),
        subtitle: (logoObj.subtitle || '').slice(0, 256),
        logoUrl: logoObj.logoUrl.slice(0, 200000),
        category: logoObj.category,
        active: Boolean(logoObj.active),
        displayOrder: Math.max(0, Math.min(100, Number(logoObj.displayOrder) || 1)),
        updatedAt: new Date().toISOString(),
      };
      if (logoObj.websiteUrl) {
        payload.websiteUrl = logoObj.websiteUrl.slice(0, 512);
      }
      await setDoc(doc(db, 'footer_logos', logoObj.id), payload);
    } catch (err) {
      try {
        handleFirestoreError(err, op, docPath);
      } catch {
        // Handled
      }
    }
  };

  const addFooterLogo = async (
    logoInput: Omit<FooterPartnerLogo, 'id'>
  ): Promise<FooterPartnerLogo> => {
    const newId = `logo_custom_${Date.now()}`;
    const created: FooterPartnerLogo = {
      ...logoInput,
      id: newId,
    };
    setFooterLogos((prev) =>
      [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder)
    );
    await syncFooterLogoToFirestore(created, OperationType.CREATE);
    return created;
  };

  const updateFooterLogo = async (
    id: string,
    updates: Partial<FooterPartnerLogo>
  ): Promise<void> => {
    let updatedLogo: FooterPartnerLogo | null = null;
    setFooterLogos((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            updatedLogo = { ...item, ...updates };
            return updatedLogo;
          }
          return item;
        })
        .sort((a, b) => a.displayOrder - b.displayOrder)
    );
    if (updatedLogo) {
      await syncFooterLogoToFirestore(updatedLogo, OperationType.UPDATE);
    }
  };

  const deleteFooterLogo = async (id: string): Promise<void> => {
    setFooterLogos((prev) => prev.filter((item) => item.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `footer_logos/${id}`;
      try {
        await deleteDoc(doc(db, 'footer_logos', id));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const resetFooterLogosToDefault = async (): Promise<void> => {
    setFooterLogos(INITIAL_FOOTER_LOGOS);
    setPoweredByText(DEFAULT_POWERED_BY_TEXT);
    for (const logo of INITIAL_FOOTER_LOGOS) {
      await syncFooterLogoToFirestore(logo, OperationType.UPDATE);
    }
  };

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
        safariEvents,
        carouselEvents,
        upcomingEvents,
        addSafariEvent,
        updateSafariEventPlacement,
        deleteSafariEvent,
        footerLogos,
        activeFooterLogos,
        poweredByText,
        setPoweredByText,
        addFooterLogo,
        updateFooterLogo,
        deleteFooterLogo,
        resetFooterLogosToDefault,
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

