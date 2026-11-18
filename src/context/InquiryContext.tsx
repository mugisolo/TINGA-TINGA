import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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

export interface FirestoreSyncSummary {
  lastSyncedAt: string | null;
  eventsSynced: number;
  logosSynced: number;
  leadsSynced: number;
  isSyncing: boolean;
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
  deleteLead: (leadId: string) => Promise<void>;
  safariEvents: ConfirmedPackageEvent[];
  carouselEvents: ConfirmedPackageEvent[];
  upcomingEvents: ConfirmedPackageEvent[];
  addSafariEvent: (eventInput: Omit<ConfirmedPackageEvent, 'id'>) => Promise<ConfirmedPackageEvent>;
  updateSafariEvent: (id: string, updates: Partial<ConfirmedPackageEvent>) => Promise<void>;
  updateSafariEventPlacement: (id: string, placement: EventDisplayPlacement) => Promise<void>;
  deleteSafariEvent: (id: string) => Promise<void>;
  resetSafariEventsToDefault: () => Promise<void>;
  footerLogos: FooterPartnerLogo[];
  activeFooterLogos: FooterPartnerLogo[];
  poweredByText: string;
  setPoweredByText: (text: string) => void;
  addFooterLogo: (logoInput: Omit<FooterPartnerLogo, 'id'>) => Promise<FooterPartnerLogo>;
  updateFooterLogo: (id: string, updates: Partial<FooterPartnerLogo>) => Promise<void>;
  deleteFooterLogo: (id: string) => Promise<void>;
  resetFooterLogosToDefault: () => Promise<void>;
  firestoreSyncStatus: FirestoreSyncSummary;
  syncAllSystemDataToFirestore: () => Promise<{ ok: boolean; message: string }>;
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
const DELETED_EVENTS_KEY = 'enganda_deleted_event_ids_v1';
const DELETED_LOGOS_KEY = 'enganda_deleted_logo_ids_v1';
const DELETED_LEADS_KEY = 'enganda_deleted_lead_ids_v1';

function readStringSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
    }
  } catch {
    // ignore
  }
  return new Set<string>();
}

function saveStringSet(key: string, setObj: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
  } catch {
    // ignore
  }
}

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
    const deleted = readStringSet(DELETED_LEADS_KEY);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((l: Lead) => !deleted.has(l.id));
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_SEED_LEADS.filter((l) => !deleted.has(l.id));
  });

  const [safariEvents, setSafariEvents] = useState<ConfirmedPackageEvent[]>(() => {
    const deleted = readStringSet(DELETED_EVENTS_KEY);
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((ev: ConfirmedPackageEvent) => !deleted.has(ev.id));
        }
      }
    } catch {
      // ignore
    }
    return CONFIRMED_PACKAGES_AND_EVENTS.filter((ev) => !deleted.has(ev.id));
  });

  const [footerLogos, setFooterLogos] = useState<FooterPartnerLogo[]>(() => {
    const deleted = readStringSet(DELETED_LOGOS_KEY);
    try {
      const saved = localStorage.getItem(FOOTER_LOGOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((lg: FooterPartnerLogo) => !deleted.has(lg.id));
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_FOOTER_LOGOS.filter((lg) => !deleted.has(lg.id));
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

  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<FirestoreSyncSummary>({
    lastSyncedAt: null,
    eventsSynced: CONFIRMED_PACKAGES_AND_EVENTS.length,
    logosSynced: INITIAL_FOOTER_LOGOS.length,
    leadsSynced: INITIAL_SEED_LEADS.length,
    isSyncing: false,
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

  const syncSafariEventToFirestore = useCallback(
    async (eventObj: ConfirmedPackageEvent, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = eventObj.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `safari_events/${cleanId}`;
      try {
        await setDoc(doc(db, 'safari_events', cleanId), {
          id: cleanId,
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
          createdAt: new Date().toISOString().slice(0, 64),
        });
      } catch (err) {
        try {
          handleFirestoreError(err, op, docPath);
        } catch {
          // Handled
        }
      }
    },
    []
  );

  const syncFooterLogoToFirestore = useCallback(
    async (logoObj: FooterPartnerLogo, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = logoObj.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `footer_logos/${cleanId}`;
      try {
        const payload: Record<string, unknown> = {
          id: cleanId,
          userId: auth.currentUser.uid.slice(0, 128),
          name: logoObj.name.slice(0, 128),
          subtitle: (logoObj.subtitle || '').slice(0, 256),
          logoUrl: logoObj.logoUrl.slice(0, 200000),
          category: logoObj.category,
          active: Boolean(logoObj.active),
          displayOrder: Math.max(0, Math.min(100, Number(logoObj.displayOrder) || 1)),
          updatedAt: new Date().toISOString().slice(0, 64),
        };
        if (logoObj.websiteUrl) {
          payload.websiteUrl = logoObj.websiteUrl.slice(0, 512);
        }
        await setDoc(doc(db, 'footer_logos', cleanId), payload);
      } catch (err) {
        try {
          handleFirestoreError(err, op, docPath);
        } catch {
          // Handled
        }
      }
    },
    []
  );

  const syncLeadToFirestore = useCallback(
    async (leadObj: Lead, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = leadObj.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `safari_leads/${cleanId}`;
      try {
        const payload: Record<string, unknown> = {
          id: cleanId,
          userId: auth.currentUser.uid.slice(0, 128),
          name: (leadObj.name || 'Safari Guest').slice(0, 128),
          email: (leadObj.email || 'guest@engandasafaris.com').slice(0, 256),
          partySize: Math.max(1, Math.min(50, Number(leadObj.partySize) || 2)),
          targetDates: (leadObj.targetDates || 'Flexible 2026/2027').slice(0, 128),
          budgetTier:
            leadObj.budgetTier === 'luxury' || leadObj.budgetTier === 'signature'
              ? leadObj.budgetTier
              : 'mid-range',
          durationDays: Math.max(1, Math.min(60, Number(leadObj.durationDays) || 7)),
          status: leadObj.status || 'new',
          createdAt: (leadObj.createdAt || new Date().toISOString()).slice(0, 64),
        };
        if (leadObj.whatsapp) payload.whatsapp = leadObj.whatsapp.slice(0, 64);
        if (leadObj.preferredGuideSlug) {
          payload.preferredGuideSlug = leadObj.preferredGuideSlug.slice(0, 128);
        }
        if (leadObj.experienceSlug) {
          payload.experienceSlug = leadObj.experienceSlug.slice(0, 128);
        }
        if (leadObj.notes) payload.notes = leadObj.notes.slice(0, 2000);

        await setDoc(doc(db, 'safari_leads', cleanId), payload);
      } catch (err) {
        try {
          handleFirestoreError(err, op, docPath);
        } catch {
          // Handled
        }
      }
    },
    []
  );

  // Sync safari_events, footer_logos, and safari_leads with Firestore across public & authenticated sessions
  useEffect(() => {
    let isMounted = true;

    const loadAndSeedFirestoreData = async (uid?: string | null) => {
      const deletedEvents = readStringSet(DELETED_EVENTS_KEY);
      const deletedLogos = readStringSet(DELETED_LOGOS_KEY);
      const deletedLeads = readStringSet(DELETED_LEADS_KEY);

      // 1. Load safari_events (publicly readable for active placements)
      try {
        const snap = await getDocs(collection(db, 'safari_events'));
        const remoteList: ConfirmedPackageEvent[] = [];
        const existingRemoteIds = new Set<string>();

        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.title) {
            const docId = String(d.id);
            existingRemoteIds.add(docId);
            if (!deletedEvents.has(docId)) {
              remoteList.push({
                id: docId,
                title: String(d.title),
                shortTabLabel: d.shortTabLabel ? String(d.shortTabLabel) : undefined,
                subtitle: String(d.subtitle || ''),
                eventTag: String(d.eventTag || 'CONFIRMED DEPARTURE'),
                category:
                  (d.category as ConfirmedPackageEvent['category']) ||
                  'Guaranteed Primate Departure',
                dateWindow: String(d.dateWindow || 'Upcoming 2026/2027'),
                durationLabel: String(d.durationLabel || '4 Days / 3 Nights'),
                location: String(d.location || 'Uganda'),
                spotsRemaining: Number(d.spotsRemaining) || 4,
                pricePerPersonUSD: Number(d.pricePerPersonUSD) || 1950,
                leadGuideSlug: String(d.leadGuideSlug || 'samuel-kato'),
                experienceSlug: d.experienceSlug ? String(d.experienceSlug) : undefined,
                heroImage: String(
                  d.heroImage || drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE')
                ),
                highlights: Array.isArray(d.highlights) ? d.highlights.map(String) : [],
                statusLabel: String(d.statusLabel || 'Confirmed Departure'),
                placement: (d.placement as EventDisplayPlacement) || 'both',
              });
            }
          }
        });

        if (remoteList.length > 0 && isMounted) {
          setSafariEvents((prev) => {
            const map = new Map<string, ConfirmedPackageEvent>();
            prev
              .filter((item) => !deletedEvents.has(item.id))
              .forEach((item) => map.set(item.id, item));
            remoteList.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }

        // Auto-seed any non-deleted system events into Firestore when signed in so all packages stay in the database until replaced by Admin
        if (uid) {
          for (const seedEvent of CONFIRMED_PACKAGES_AND_EVENTS) {
            const cleanSeedId = seedEvent.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (
              !deletedEvents.has(cleanSeedId) &&
              !deletedEvents.has(seedEvent.id) &&
              !existingRemoteIds.has(cleanSeedId) &&
              !existingRemoteIds.has(seedEvent.id)
            ) {
              await syncSafariEventToFirestore(seedEvent, OperationType.CREATE);
            }
          }
        }
      } catch (err) {
        if (uid) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'safari_events');
          } catch {
            // Handled
          }
        }
      }

      // 2. Load footer_logos (publicly readable)
      try {
        const logoSnap = await getDocs(collection(db, 'footer_logos'));
        const remoteLogos: FooterPartnerLogo[] = [];
        const existingLogoIds = new Set<string>();

        logoSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.name && d.logoUrl) {
            const docId = String(d.id);
            existingLogoIds.add(docId);
            if (!deletedLogos.has(docId)) {
              remoteLogos.push({
                id: docId,
                name: String(d.name),
                subtitle: String(d.subtitle || ''),
                logoUrl: String(d.logoUrl),
                category:
                  (d.category as FooterPartnerLogo['category']) || 'Strategic Partner',
                websiteUrl: d.websiteUrl ? String(d.websiteUrl) : undefined,
                active: Boolean(d.active),
                displayOrder: Number(d.displayOrder) || 1,
              });
            }
          }
        });

        if (remoteLogos.length > 0 && isMounted) {
          setFooterLogos((prev) => {
            const map = new Map<string, FooterPartnerLogo>();
            prev
              .filter((item) => !deletedLogos.has(item.id))
              .forEach((item) => map.set(item.id, item));
            remoteLogos.forEach((item) => map.set(item.id, item));
            return Array.from(map.values()).sort(
              (a, b) => a.displayOrder - b.displayOrder
            );
          });
        }

        // Auto-seed any non-deleted footer logos into Firestore when signed in
        if (uid) {
          for (const seedLogo of INITIAL_FOOTER_LOGOS) {
            const cleanLogoId = seedLogo.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (
              !deletedLogos.has(cleanLogoId) &&
              !deletedLogos.has(seedLogo.id) &&
              !existingLogoIds.has(cleanLogoId) &&
              !existingLogoIds.has(seedLogo.id)
            ) {
              await syncFooterLogoToFirestore(seedLogo, OperationType.CREATE);
            }
          }
        }
      } catch (err) {
        if (uid) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'footer_logos');
          } catch {
            // Handled
          }
        }
      }

      // 3. Load and seed safari_leads when signed in
      if (uid) {
        try {
          const leadQuery = query(
            collection(db, 'safari_leads'),
            where('userId', '==', uid)
          );
          const leadSnap = await getDocs(leadQuery);
          const remoteLeads: Lead[] = [];
          const existingLeadIds = new Set<string>();

          leadSnap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.name) {
              const docId = String(d.id);
              existingLeadIds.add(docId);
              if (!deletedLeads.has(docId)) {
                remoteLeads.push({
                  id: docId,
                  name: String(d.name),
                  email: String(d.email || ''),
                  whatsapp: String(d.whatsapp || ''),
                  partySize: Number(d.partySize) || 2,
                  targetDates: String(d.targetDates || 'Flexible 2026/2027'),
                  budgetTier:
                    d.budgetTier === 'luxury' || d.budgetTier === 'signature'
                      ? d.budgetTier
                      : 'mid-range',
                  interests: ['gorillas', 'chimps', 'big-game'],
                  regions: ['Bwindi & Mgahinga', 'Queen Elizabeth NP'],
                  durationDays: Number(d.durationDays) || 7,
                  preferredGuideSlug: d.preferredGuideSlug
                    ? String(d.preferredGuideSlug)
                    : undefined,
                  experienceSlug: d.experienceSlug
                    ? String(d.experienceSlug)
                    : undefined,
                  notes: String(d.notes || ''),
                  status: (d.status as Lead['status']) || 'new',
                  createdAt: String(d.createdAt || new Date().toISOString()),
                });
              }
            }
          });

          if (remoteLeads.length > 0 && isMounted) {
            setLeads((prev) => {
              const map = new Map<string, Lead>();
              prev
                .filter((item) => !deletedLeads.has(item.id))
                .forEach((item) => map.set(item.id, item));
              remoteLeads.forEach((item) => map.set(item.id, item));
              return Array.from(map.values());
            });
          }

          for (const seedLead of INITIAL_SEED_LEADS) {
            const cleanLeadId = seedLead.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (
              !deletedLeads.has(cleanLeadId) &&
              !deletedLeads.has(seedLead.id) &&
              !existingLeadIds.has(cleanLeadId) &&
              !existingLeadIds.has(seedLead.id)
            ) {
              await syncLeadToFirestore(seedLead, OperationType.CREATE);
            }
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'safari_leads');
          } catch {
            // Handled
          }
        }
      }

      if (isMounted) {
        setFirestoreSyncStatus((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toISOString(),
          isSyncing: false,
        }));
      }
    };

    // Initial public load
    loadAndSeedFirestoreData(auth.currentUser?.uid);

    // Re-run and auto-seed whenever Firebase Auth resolves a signed-in user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.uid) {
        loadAndSeedFirestoreData(currentUser.uid);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncSafariEventToFirestore, syncFooterLogoToFirestore, syncLeadToFirestore]);

  const syncAllSystemDataToFirestore = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    if (!auth.currentUser?.uid) {
      return {
        ok: false,
        message: 'Please sign in with Google first to write system records to Firestore.',
      };
    }

    setFirestoreSyncStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      for (const ev of safariEvents) {
        await syncSafariEventToFirestore(ev, OperationType.UPDATE);
      }
      for (const logo of footerLogos) {
        await syncFooterLogoToFirestore(logo, OperationType.UPDATE);
      }
      for (const lead of leads) {
        await syncLeadToFirestore(lead, OperationType.UPDATE);
      }
      const nowIso = new Date().toISOString();
      setFirestoreSyncStatus({
        lastSyncedAt: nowIso,
        eventsSynced: safariEvents.length,
        logosSynced: footerLogos.length,
        leadsSynced: leads.length,
        isSyncing: false,
      });
      return {
        ok: true,
        message: `Synced ${safariEvents.length} Safari Events/Trips, ${footerLogos.length} Footer Partner Logos, and ${leads.length} Safari Leads to Firestore database.`,
      };
    } catch (err) {
      setFirestoreSyncStatus((prev) => ({ ...prev, isSyncing: false }));
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Failed to sync data to Firestore.',
      };
    }
  }, [
    safariEvents,
    footerLogos,
    leads,
    syncSafariEventToFirestore,
    syncFooterLogoToFirestore,
    syncLeadToFirestore,
  ]);

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

  const updateSafariEvent = async (
    id: string,
    updates: Partial<ConfirmedPackageEvent>
  ): Promise<void> => {
    let updatedItem: ConfirmedPackageEvent | null = null;
    setSafariEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          updatedItem = { ...ev, ...updates, id: ev.id };
          return updatedItem;
        }
        return ev;
      })
    );

    if (updatedItem) {
      await syncSafariEventToFirestore(updatedItem, OperationType.UPDATE);
    }
  };

  const updateSafariEventPlacement = async (
    id: string,
    placement: EventDisplayPlacement
  ): Promise<void> => {
    await updateSafariEvent(id, { placement });
  };

  const deleteSafariEvent = async (id: string): Promise<void> => {
    const deleted = readStringSet(DELETED_EVENTS_KEY);
    deleted.add(id);
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    deleted.add(cleanId);
    saveStringSet(DELETED_EVENTS_KEY, deleted);

    setSafariEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `safari_events/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'safari_events', cleanId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const resetSafariEventsToDefault = async (): Promise<void> => {
    saveStringSet(DELETED_EVENTS_KEY, new Set());
    setSafariEvents(CONFIRMED_PACKAGES_AND_EVENTS);
    for (const ev of CONFIRMED_PACKAGES_AND_EVENTS) {
      await syncSafariEventToFirestore(ev, OperationType.UPDATE);
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
    const deleted = readStringSet(DELETED_LOGOS_KEY);
    deleted.add(id);
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    deleted.add(cleanId);
    saveStringSet(DELETED_LOGOS_KEY, deleted);

    setFooterLogos((prev) => prev.filter((item) => item.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `footer_logos/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'footer_logos', cleanId));
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
    saveStringSet(DELETED_LOGOS_KEY, new Set());
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

    // Persist to Firestore if authenticated
    await syncLeadToFirestore(newLead, OperationType.CREATE);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
    } catch {
      // Stored in Firestore & localStorage
    }

    return newLead;
  };

  const updateLeadStatus = (
    leadId: string,
    status: Lead['status'],
    preferredGuideSlug?: string
  ) => {
    let updatedLead: Lead | null = null;
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          updatedLead = {
            ...lead,
            status,
            preferredGuideSlug: preferredGuideSlug ?? lead.preferredGuideSlug,
          };
          return updatedLead;
        }
        return lead;
      })
    );

    if (updatedLead) {
      syncLeadToFirestore(updatedLead, OperationType.UPDATE);
    }
  };

  const deleteLead = async (leadId: string): Promise<void> => {
    const deleted = readStringSet(DELETED_LEADS_KEY);
    deleted.add(leadId);
    const cleanId = leadId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    deleted.add(cleanId);
    saveStringSet(DELETED_LEADS_KEY, deleted);

    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    if (auth.currentUser?.uid) {
      const docPath = `safari_leads/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'safari_leads', cleanId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
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
        deleteLead,
        safariEvents,
        carouselEvents,
        upcomingEvents,
        addSafariEvent,
        updateSafariEvent,
        updateSafariEventPlacement,
        deleteSafariEvent,
        resetSafariEventsToDefault,
        footerLogos,
        activeFooterLogos,
        poweredByText,
        setPoweredByText,
        addFooterLogo,
        updateFooterLogo,
        deleteFooterLogo,
        resetFooterLogosToDefault,
        firestoreSyncStatus,
        syncAllSystemDataToFirestore,
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
