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
  PartnerHotelRoom,
  DriverFleetVehicle,
  ShortlistedProviderItem,
  ShortlistProviderType,
} from '../types';
import { CURRENCY_RATES, fetchLiveCurrencyRates, formatPrice as formatCurrencyPrice } from '../lib/currency';
import {
  CONFIRMED_PACKAGES_AND_EVENTS,
  INITIAL_FOOTER_LOGOS,
  DEFAULT_POWERED_BY_TEXT,
  INITIAL_PARTNER_HOTEL_ROOMS,
  INITIAL_DRIVER_FLEET_VEHICLES,
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
  packageEvents: ConfirmedPackageEvent[];
  carouselEvents: ConfirmedPackageEvent[];
  upcomingEvents: ConfirmedPackageEvent[];
  addSafariEvent: (eventInput: Omit<ConfirmedPackageEvent, 'id'>) => Promise<ConfirmedPackageEvent>;
  addPackageEvent: (eventInput: Omit<ConfirmedPackageEvent, 'id'> | ConfirmedPackageEvent) => Promise<ConfirmedPackageEvent>;
  formatPrice: (amountUSD: number) => string;
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
  partnerHotelRooms: PartnerHotelRoom[];
  addPartnerHotelRoom: (roomInput: Omit<PartnerHotelRoom, 'id' | 'createdAt'>) => Promise<PartnerHotelRoom>;
  deletePartnerHotelRoom: (id: string) => Promise<void>;
  driverFleetVehicles: DriverFleetVehicle[];
  addDriverFleetVehicle: (vehicleInput: Omit<DriverFleetVehicle, 'id' | 'createdAt'>) => Promise<DriverFleetVehicle>;
  deleteDriverFleetVehicle: (id: string) => Promise<void>;
  shortlistedProviders: ShortlistedProviderItem[];
  isProviderShortlisted: (providerType: ShortlistProviderType, providerIdOrSlug: string) => boolean;
  toggleShortlistProvider: (
    item: Omit<ShortlistedProviderItem, 'id' | 'createdAt'>
  ) => Promise<boolean>;
  removeShortlistProvider: (id: string) => Promise<void>;
  clearShortlist: () => Promise<void>;
  firestoreSyncStatus: FirestoreSyncSummary;
  syncAllSystemDataToFirestore: () => Promise<{ ok: boolean; message: string }>;
  isInquiryModalOpen: boolean;
  modalOptions: InquiryModalOptions;
  openInquiryModal: (options?: InquiryModalOptions) => void;
  closeInquiryModal: () => void;
}

const STORAGE_KEY = 'enganda_safaris_leads_v1';
const CURRENCY_STORAGE_KEY = 'enganda_safaris_currency_v1';
const EVENTS_STORAGE_KEY = 'enganda_safaris_events_v7';
const FOOTER_LOGOS_STORAGE_KEY = 'enganda_safaris_footer_logos_v6';
const POWERED_BY_STORAGE_KEY = 'enganda_safaris_powered_by_v4';
const PARTNER_ROOMS_STORAGE_KEY = 'enganda_safaris_partner_rooms_v1';
const DRIVER_FLEET_STORAGE_KEY = 'enganda_safaris_driver_fleet_v1';
const DELETED_EVENTS_KEY = 'enganda_deleted_event_ids_v1';
const DELETED_LOGOS_KEY = 'enganda_deleted_logo_ids_v1';
const DELETED_LEADS_KEY = 'enganda_deleted_lead_ids_v1';
const DELETED_ROOMS_KEY = 'enganda_deleted_room_ids_v1';
const DELETED_FLEET_KEY = 'enganda_deleted_fleet_ids_v1';
const SHORTLIST_STORAGE_KEY = 'enganda_shortlisted_providers_v1';
const DELETED_SHORTLIST_KEY = 'enganda_deleted_shortlist_ids_v1';

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
          const map = new Map<string, ConfirmedPackageEvent>();
          CONFIRMED_PACKAGES_AND_EVENTS.filter((ev) => !deleted.has(ev.id)).forEach((ev) =>
            map.set(ev.id, ev)
          );
          parsed
            .filter((ev: ConfirmedPackageEvent) => !deleted.has(ev.id))
            .forEach((ev: ConfirmedPackageEvent) => map.set(ev.id, { ...map.get(ev.id), ...ev }));
          return Array.from(map.values());
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
          return parsed.filter(
            (lg: FooterPartnerLogo) =>
              !deleted.has(lg.id) &&
              lg.id !== 'logo_gcic' &&
              !String(lg.name || '').toUpperCase().includes('GCIC')
          );
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_FOOTER_LOGOS.filter(
      (lg) =>
        !deleted.has(lg.id) &&
        lg.id !== 'logo_gcic' &&
        !String(lg.name || '').toUpperCase().includes('GCIC')
    );
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

  const [partnerHotelRooms, setPartnerHotelRooms] = useState<PartnerHotelRoom[]>(() => {
    const deleted = readStringSet(DELETED_ROOMS_KEY);
    try {
      const saved = localStorage.getItem(PARTNER_ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, PartnerHotelRoom>();
          INITIAL_PARTNER_HOTEL_ROOMS.filter((rm) => !deleted.has(rm.id)).forEach((rm) =>
            map.set(rm.id, rm)
          );
          parsed
            .filter((rm: PartnerHotelRoom) => !deleted.has(rm.id))
            .forEach((rm: PartnerHotelRoom) => map.set(rm.id, { ...map.get(rm.id), ...rm }));
          return Array.from(map.values());
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PARTNER_HOTEL_ROOMS.filter((rm) => !deleted.has(rm.id));
  });

  const [driverFleetVehicles, setDriverFleetVehicles] = useState<DriverFleetVehicle[]>(() => {
    const deleted = readStringSet(DELETED_FLEET_KEY);
    try {
      const saved = localStorage.getItem(DRIVER_FLEET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, DriverFleetVehicle>();
          INITIAL_DRIVER_FLEET_VEHICLES.filter((v) => !deleted.has(v.id)).forEach((v) =>
            map.set(v.id, v)
          );
          parsed
            .filter((v: DriverFleetVehicle) => !deleted.has(v.id))
            .forEach((v: DriverFleetVehicle) => map.set(v.id, { ...map.get(v.id), ...v }));
          return Array.from(map.values());
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DRIVER_FLEET_VEHICLES.filter((v) => !deleted.has(v.id));
  });

  const [shortlistedProviders, setShortlistedProviders] = useState<ShortlistedProviderItem[]>(
    () => {
      try {
        const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
      return [];
    }
  );

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

  useEffect(() => {
    try {
      localStorage.setItem(PARTNER_ROOMS_STORAGE_KEY, JSON.stringify(partnerHotelRooms));
    } catch {
      // ignore
    }
  }, [partnerHotelRooms]);

  useEffect(() => {
    try {
      localStorage.setItem(DRIVER_FLEET_STORAGE_KEY, JSON.stringify(driverFleetVehicles));
    } catch {
      // ignore
    }
  }, [driverFleetVehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedProviders));
    } catch {
      // ignore
    }
  }, [shortlistedProviders]);

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

  const syncPartnerRoomToFirestore = useCallback(
    async (roomObj: PartnerHotelRoom, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = roomObj.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `partner_hotel_rooms/${cleanId}`;
      try {
        await setDoc(doc(db, 'partner_hotel_rooms', cleanId), {
          id: cleanId,
          userId: auth.currentUser.uid.slice(0, 128),
          partnerSlug: (roomObj.partnerSlug || 'igongo-country-hotel-and-cultural-centre').slice(0, 128),
          partnerName: (roomObj.partnerName || 'Igongo Country Hotel & Cultural Centre').slice(0, 200),
          partnerCategory: roomObj.partnerCategory || 'hotel',
          roomName: (roomObj.roomName || 'Deluxe Room').slice(0, 200),
          roomType: (roomObj.roomType || 'Deluxe Double').slice(0, 128),
          ratePerNightUSD: Math.max(0, Math.min(50000, Number(roomObj.ratePerNightUSD) || 140)),
          boardBasis: roomObj.boardBasis || 'Bed & Breakfast',
          maxOccupancy: Math.max(1, Math.min(30, Number(roomObj.maxOccupancy) || 2)),
          bedConfiguration: (roomObj.bedConfiguration || '1 King or 2 Twin Beds').slice(0, 128),
          totalRoomsAvailable: Math.max(1, Math.min(500, Number(roomObj.totalRoomsAvailable) || 5)),
          imageUrl: (roomObj.imageUrl || '/assets/aistudio/cow_b5a75acc.jpg').slice(0, 350000),
          amenities: (roomObj.amenities || []).slice(0, 20).map((a) => String(a).slice(0, 300)),
          uploadedByOwnerName: (roomObj.uploadedByOwnerName || 'Hotel Partner Owner').slice(0, 128),
          createdAt: (roomObj.createdAt || new Date().toISOString()).slice(0, 64),
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

  const syncDriverFleetToFirestore = useCallback(
    async (vehicleObj: DriverFleetVehicle, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = vehicleObj.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `driver_fleet_vehicles/${cleanId}`;
      try {
        const payload: Record<string, unknown> = {
          id: cleanId,
          userId: auth.currentUser.uid.slice(0, 128),
          driverName: (vehicleObj.driverName || 'Enganda Driver-Guide').slice(0, 128),
          driverLicenseAndBadge: (vehicleObj.driverLicenseAndBadge || 'UTB Licensed Driver-Guide').slice(0, 200),
          driverPhone: (vehicleObj.driverPhone || '+256 700 000 000').slice(0, 64),
          driverPhotoUrl: (vehicleObj.driverPhotoUrl || '/assets/aistudio/cow_b5a75acc.jpg').slice(0, 350000),
          vehicleName: (vehicleObj.vehicleName || '4x4 Safari Land Cruiser').slice(0, 200),
          vehicleCategory: vehicleObj.vehicleCategory || '4x4 Extended Land Cruiser',
          registrationPlate: (vehicleObj.registrationPlate || 'UBF 842Q').slice(0, 64),
          passengerCapacity: Math.max(1, Math.min(60, Number(vehicleObj.passengerCapacity) || 7)),
          ratePerDayUSD: Math.max(0, Math.min(25000, Number(vehicleObj.ratePerDayUSD) || 220)),
          rateIncludes: (vehicleObj.rateIncludes || 'Driver-Guide, Pop-Up Roof & Insurance').slice(0, 400),
          homeBaseRegion: (vehicleObj.homeBaseRegion || 'Entebbe & Western Circuit').slice(0, 200),
          regionsCovered: (vehicleObj.regionsCovered || []).slice(0, 20).map((r) => String(r).slice(0, 200)),
          vehicleImageUrl: (vehicleObj.vehicleImageUrl || '/assets/aistudio/cow_b5a75acc.jpg').slice(0, 350000),
          features: (vehicleObj.features || []).slice(0, 20).map((f) => String(f).slice(0, 300)),
          availableStatus: vehicleObj.availableStatus || 'Available Now',
          createdAt: (vehicleObj.createdAt || new Date().toISOString()).slice(0, 64),
        };
        if (vehicleObj.driverSlug) {
          payload.driverSlug = vehicleObj.driverSlug.slice(0, 128);
        }
        await setDoc(doc(db, 'driver_fleet_vehicles', cleanId), payload);
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

  const syncShortlistedProviderToFirestore = useCallback(
    async (item: ShortlistedProviderItem, op: OperationType) => {
      if (!auth.currentUser?.uid) return;
      const cleanId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const docPath = `shortlisted_providers/${cleanId}`;
      try {
        const payload: Record<string, unknown> = {
          id: cleanId,
          userId: auth.currentUser.uid.slice(0, 128),
          providerId: (item.providerId || item.providerSlug).slice(0, 128),
          providerSlug: (item.providerSlug || item.providerId).slice(0, 128),
          providerType: item.providerType,
          providerName: item.providerName.slice(0, 200),
          region: (item.region || 'East Africa').slice(0, 200),
          subtitle: (item.subtitle || 'Verified Service Provider').slice(0, 300),
          imageUrl: (item.imageUrl || '/assets/aistudio/cow_b5a75acc.jpg').slice(0, 350000),
          licenseBadge: (item.licenseBadge || 'UTB & UWA Verified').slice(0, 160),
          createdAt: (item.createdAt || new Date().toISOString()).slice(0, 64),
        };
        if (item.rateLabel) {
          payload.rateLabel = item.rateLabel.slice(0, 128);
        }
        await setDoc(doc(db, 'shortlisted_providers', cleanId), payload);
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
              const matchingSeed = CONFIRMED_PACKAGES_AND_EVENTS.find(
                (s) => s.id === docId || s.id.replace(/[^a-zA-Z0-9_-]/g, '_') === docId
              );
              const rawSubtitle = String(d.subtitle || matchingSeed?.subtitle || '')
                .replace(/Recommended by Administrator/gi, 'Enganda Verified')
                .replace(/Admin Recommended/gi, 'Enganda Verified');
              const rawEventTag = String(d.eventTag || matchingSeed?.eventTag || 'CONFIRMED DEPARTURE')
                .replace(/ADMIN RECOMMENDED/gi, 'ENGANDA VERIFIED')
                .replace(/RECOMMENDED BY ADMINISTRATOR/gi, 'ENGANDA VERIFIED');
              const rawStatusLabel = String(d.statusLabel || matchingSeed?.statusLabel || 'Confirmed Departure')
                .replace(/Admin Recommended/gi, 'Enganda Verified')
                .replace(/Recommended by Administrator/gi, 'Enganda Verified');
              const rawHighlights = (
                Array.isArray(d.highlights) ? d.highlights.map(String) : matchingSeed?.highlights || []
              ).map((h) =>
                h
                  .replace(/Recommended by Administrator/gi, 'Enganda Verified')
                  .replace(/Admin Recommended/gi, 'Enganda Verified')
              );

              remoteList.push({
                ...matchingSeed,
                id: matchingSeed?.id || docId,
                title: String(d.title),
                shortTabLabel: d.shortTabLabel ? String(d.shortTabLabel) : matchingSeed?.shortTabLabel,
                subtitle: rawSubtitle,
                eventTag: rawEventTag,
                category:
                  (d.category as ConfirmedPackageEvent['category']) ||
                  matchingSeed?.category ||
                  'Guaranteed Primate Departure',
                dateWindow: String(d.dateWindow || matchingSeed?.dateWindow || 'Upcoming 2026/2027'),
                durationLabel: String(d.durationLabel || matchingSeed?.durationLabel || '4 Days / 3 Nights'),
                location: String(d.location || matchingSeed?.location || 'Uganda'),
                spotsRemaining: Number(d.spotsRemaining) || 4,
                pricePerPersonUSD: Number(d.pricePerPersonUSD) || 1950,
                leadGuideSlug: String(d.leadGuideSlug || 'samuel-kato'),
                experienceSlug: d.experienceSlug ? String(d.experienceSlug) : matchingSeed?.experienceSlug,
                heroImage: String(
                  d.heroImage || matchingSeed?.heroImage || drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE')
                ),
                highlights: rawHighlights,
                statusLabel: rawStatusLabel,
                placement:
                  docId === 'pkg-mabamba-shoebill-kibale-primates' ||
                  docId === 'pkg_mabamba_shoebill_kibale_primates'
                    ? 'upcoming'
                    : (d.placement as EventDisplayPlacement) || matchingSeed?.placement || 'both',
                carouselSlotNumber: matchingSeed?.carouselSlotNumber,
                isStandbySlot: matchingSeed?.isStandbySlot,
                operatorLogoUrl: matchingSeed?.operatorLogoUrl,
                utbLicenseNumber: matchingSeed?.utbLicenseNumber,
                uwaAccreditationId: matchingSeed?.uwaAccreditationId,
                adminRecommended:
                  matchingSeed?.adminRecommended ||
                  rawEventTag.toUpperCase().includes('ENGANDA VERIFIED') ||
                  String(d.eventTag || '').toUpperCase().includes('ADMIN RECOMMENDED'),
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

        // Auto-seed any non-deleted system events into Firestore when signed in so all packages stay in the database
        if (uid) {
          for (const seedEvent of CONFIRMED_PACKAGES_AND_EVENTS) {
            const cleanSeedId = seedEvent.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (!deletedEvents.has(cleanSeedId) && !deletedEvents.has(seedEvent.id)) {
              const isExisting =
                existingRemoteIds.has(cleanSeedId) || existingRemoteIds.has(seedEvent.id);
              await syncSafariEventToFirestore(
                seedEvent,
                isExisting ? OperationType.UPDATE : OperationType.CREATE
              );
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
        let hasDeprecatedPluInFirestore = false;
        let hasDeprecatedGcicInFirestore = false;

        logoSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.name && d.logoUrl) {
            const docId = String(d.id);
            const upperName = String(d.name).trim().toUpperCase();
            if (docId === 'logo_plu' || upperName === 'PLU') {
              hasDeprecatedPluInFirestore = true;
              return;
            }
            if (docId === 'logo_gcic' || upperName.includes('GCIC')) {
              hasDeprecatedGcicInFirestore = true;
              return;
            }
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
              .filter(
                (item) =>
                  !deletedLogos.has(item.id) &&
                  item.id !== 'logo_plu' &&
                  item.id !== 'logo_gcic' &&
                  item.name.trim().toUpperCase() !== 'PLU' &&
                  !item.name.trim().toUpperCase().includes('GCIC')
              )
              .forEach((item) => map.set(item.id, item));
            remoteLogos.forEach((item) => map.set(item.id, item));
            return Array.from(map.values()).sort(
              (a, b) => a.displayOrder - b.displayOrder
            );
          });
        }

        // Auto-remove deprecated logo_plu & logo_gcic and seed any non-deleted footer logos into Firestore when signed in
        if (uid) {
          if (hasDeprecatedPluInFirestore) {
            try {
              await deleteDoc(doc(db, 'footer_logos', 'logo_plu'));
            } catch {
              // ignore if already removed
            }
          }
          if (hasDeprecatedGcicInFirestore) {
            try {
              await deleteDoc(doc(db, 'footer_logos', 'logo_gcic'));
            } catch {
              // ignore if already removed
            }
          }
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

      // 4. Load partner_hotel_rooms (publicly readable)
      const deletedRooms = readStringSet(DELETED_ROOMS_KEY);
      try {
        const roomSnap = await getDocs(collection(db, 'partner_hotel_rooms'));
        const remoteRooms: PartnerHotelRoom[] = [];
        const existingRoomIds = new Set<string>();

        roomSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.roomName && d.partnerName) {
            const docId = String(d.id);
            existingRoomIds.add(docId);
            if (!deletedRooms.has(docId)) {
              remoteRooms.push({
                id: docId,
                partnerSlug: String(d.partnerSlug || 'igongo-country-hotel-and-cultural-centre'),
                partnerName: String(d.partnerName),
                partnerCategory: (d.partnerCategory as PartnerHotelRoom['partnerCategory']) || 'hotel',
                roomName: String(d.roomName),
                roomType: String(d.roomType || 'Deluxe Room'),
                ratePerNightUSD: Number(d.ratePerNightUSD) || 140,
                boardBasis: (d.boardBasis as PartnerHotelRoom['boardBasis']) || 'Bed & Breakfast',
                maxOccupancy: Number(d.maxOccupancy) || 2,
                bedConfiguration: String(d.bedConfiguration || '1 King or 2 Twin Beds'),
                totalRoomsAvailable: Number(d.totalRoomsAvailable) || 5,
                imageUrl: String(d.imageUrl || '/assets/aistudio/cow_b5a75acc.jpg'),
                amenities: Array.isArray(d.amenities) ? d.amenities.map(String) : [],
                uploadedByOwnerName: String(d.uploadedByOwnerName || 'Partner Owner'),
                createdAt: String(d.createdAt || new Date().toISOString()),
              });
            }
          }
        });

        if (remoteRooms.length > 0 && isMounted) {
          setPartnerHotelRooms((prev) => {
            const map = new Map<string, PartnerHotelRoom>();
            prev.filter((r) => !deletedRooms.has(r.id)).forEach((r) => map.set(r.id, r));
            remoteRooms.forEach((r) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }

        if (uid) {
          for (const seedRoom of INITIAL_PARTNER_HOTEL_ROOMS) {
            const cleanRoomId = seedRoom.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (
              !deletedRooms.has(cleanRoomId) &&
              !deletedRooms.has(seedRoom.id) &&
              !existingRoomIds.has(cleanRoomId) &&
              !existingRoomIds.has(seedRoom.id)
            ) {
              await syncPartnerRoomToFirestore(seedRoom, OperationType.CREATE);
            }
          }
        }
      } catch (err) {
        if (uid) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'partner_hotel_rooms');
          } catch {
            // Handled
          }
        }
      }

      // 5. Load driver_fleet_vehicles (publicly readable)
      const deletedFleet = readStringSet(DELETED_FLEET_KEY);
      try {
        const fleetSnap = await getDocs(collection(db, 'driver_fleet_vehicles'));
        const remoteFleet: DriverFleetVehicle[] = [];
        const existingFleetIds = new Set<string>();

        fleetSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.driverName && d.vehicleName) {
            const docId = String(d.id);
            existingFleetIds.add(docId);
            if (!deletedFleet.has(docId)) {
              remoteFleet.push({
                id: docId,
                driverName: String(d.driverName),
                driverSlug: d.driverSlug ? String(d.driverSlug) : undefined,
                driverLicenseAndBadge: String(d.driverLicenseAndBadge || 'UTB Licensed Driver-Guide'),
                driverPhone: String(d.driverPhone || '+256 700 000 000'),
                driverPhotoUrl: String(d.driverPhotoUrl || '/assets/aistudio/cow_b5a75acc.jpg'),
                vehicleName: String(d.vehicleName),
                vehicleCategory: (d.vehicleCategory as DriverFleetVehicle['vehicleCategory']) || '4x4 Extended Land Cruiser',
                registrationPlate: String(d.registrationPlate || 'UBF 842Q'),
                passengerCapacity: Number(d.passengerCapacity) || 7,
                ratePerDayUSD: Number(d.ratePerDayUSD) || 220,
                rateIncludes: String(d.rateIncludes || 'Driver-Guide, Pop-Up Roof & Insurance'),
                homeBaseRegion: String(d.homeBaseRegion || 'Entebbe & Western Circuit'),
                regionsCovered: Array.isArray(d.regionsCovered) ? d.regionsCovered.map(String) : [],
                vehicleImageUrl: String(d.vehicleImageUrl || '/assets/aistudio/cow_b5a75acc.jpg'),
                features: Array.isArray(d.features) ? d.features.map(String) : [],
                availableStatus: (d.availableStatus as DriverFleetVehicle['availableStatus']) || 'Available Now',
                createdAt: String(d.createdAt || new Date().toISOString()),
              });
            }
          }
        });

        if (remoteFleet.length > 0 && isMounted) {
          setDriverFleetVehicles((prev) => {
            const map = new Map<string, DriverFleetVehicle>();
            prev.filter((v) => !deletedFleet.has(v.id)).forEach((v) => map.set(v.id, v));
            remoteFleet.forEach((v) => map.set(v.id, v));
            return Array.from(map.values());
          });
        }

        if (uid) {
          for (const seedVehicle of INITIAL_DRIVER_FLEET_VEHICLES) {
            const cleanVehicleId = seedVehicle.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (
              !deletedFleet.has(cleanVehicleId) &&
              !deletedFleet.has(seedVehicle.id) &&
              !existingFleetIds.has(cleanVehicleId) &&
              !existingFleetIds.has(seedVehicle.id)
            ) {
              await syncDriverFleetToFirestore(seedVehicle, OperationType.CREATE);
            }
          }
        }
      } catch (err) {
        if (uid) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'driver_fleet_vehicles');
          } catch {
            // Handled
          }
        }
      }

      // 6. Load & sync shortlisted_providers ('My Shortlist') for signed-in user
      if (uid) {
        const deletedShortlist = readStringSet(DELETED_SHORTLIST_KEY);
        try {
          const shortlistQuery = query(
            collection(db, 'shortlisted_providers'),
            where('userId', '==', uid)
          );
          const shortlistSnap = await getDocs(shortlistQuery);
          const remoteShortlist: ShortlistedProviderItem[] = [];
          const existingShortlistIds = new Set<string>();

          shortlistSnap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.providerName && d.providerType) {
              const docId = String(d.id);
              existingShortlistIds.add(docId);
              if (!deletedShortlist.has(docId)) {
                remoteShortlist.push({
                  id: docId,
                  userId: String(d.userId || uid),
                  providerId: String(d.providerId || d.providerSlug || docId),
                  providerSlug: String(d.providerSlug || d.providerId || docId),
                  providerType: d.providerType as ShortlistProviderType,
                  providerName: String(d.providerName),
                  region: String(d.region || 'East Africa'),
                  subtitle: String(d.subtitle || 'Verified Service Provider'),
                  imageUrl: String(d.imageUrl || '/assets/aistudio/cow_b5a75acc.jpg'),
                  licenseBadge: String(d.licenseBadge || 'UTB & UWA Verified'),
                  rateLabel: d.rateLabel ? String(d.rateLabel) : undefined,
                  createdAt: String(d.createdAt || new Date().toISOString()),
                });
              }
            }
          });

          if (remoteShortlist.length > 0 && isMounted) {
            setShortlistedProviders((prev) => {
              const map = new Map<string, ShortlistedProviderItem>();
              prev.filter((s) => !deletedShortlist.has(s.id)).forEach((s) => map.set(s.id, s));
              remoteShortlist.forEach((s) => map.set(s.id, s));
              return Array.from(map.values());
            });
          }

          // Push any locally saved shortlist items to Firestore when user signs in
          const currentLocal = (() => {
            try {
              const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY);
              return raw ? (JSON.parse(raw) as ShortlistedProviderItem[]) : [];
            } catch {
              return [];
            }
          })();

          for (const localItem of currentLocal) {
            const cleanLocalId = localItem.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
            if (!existingShortlistIds.has(cleanLocalId) && !deletedShortlist.has(cleanLocalId)) {
              await syncShortlistedProviderToFirestore(
                { ...localItem, id: cleanLocalId, userId: uid },
                OperationType.CREATE
              );
            }
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'shortlisted_providers');
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
  }, [
    syncSafariEventToFirestore,
    syncFooterLogoToFirestore,
    syncLeadToFirestore,
    syncPartnerRoomToFirestore,
    syncDriverFleetToFirestore,
    syncShortlistedProviderToFirestore,
  ]);

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
      for (const rm of partnerHotelRooms) {
        await syncPartnerRoomToFirestore(rm, OperationType.UPDATE);
      }
      for (const fl of driverFleetVehicles) {
        await syncDriverFleetToFirestore(fl, OperationType.UPDATE);
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
        message: `Synced ${safariEvents.length} Safari Events/Trips, ${footerLogos.length} Footer Partner Logos, ${partnerHotelRooms.length} Hotel Rooms, ${driverFleetVehicles.length} Fleet Vehicles, and ${leads.length} Safari Leads to Firestore database.`,
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
    partnerHotelRooms,
    driverFleetVehicles,
    syncSafariEventToFirestore,
    syncFooterLogoToFirestore,
    syncLeadToFirestore,
    syncPartnerRoomToFirestore,
    syncDriverFleetToFirestore,
  ]);

  const carouselEvents = useMemo(() => {
    const activeCarouselItems = safariEvents
      .filter(
        (ev) =>
          !ev.isStandbySlot &&
          (!ev.placement || ev.placement === 'carousel' || ev.placement === 'both')
      )
      .sort((a, b) => (a.carouselSlotNumber ?? 99) - (b.carouselSlotNumber ?? 99));

    // If fewer than 10 active paid slots exist, rotate in standby slot 011 (Shoebill & Chimps)
    if (activeCarouselItems.length < 10) {
      const standbyItems = safariEvents.filter((ev) => ev.isStandbySlot);
      const combined = [...activeCarouselItems, ...standbyItems];
      return combined.slice(0, 10);
    }

    // Strict 10-Slot Paid-Tier Cap
    return activeCarouselItems.slice(0, 10);
  }, [safariEvents]);

  const upcomingEvents = useMemo(() => {
    const filtered = safariEvents.filter(
      (ev) => ev.placement === 'upcoming' || ev.placement === 'both' || ev.isStandbySlot
    );
    return filtered.length > 0 ? filtered : safariEvents;
  }, [safariEvents]);

  const activeFooterLogos = useMemo(() => {
    return [...footerLogos]
      .filter(
        (logo) =>
          logo.active &&
          logo.id !== 'logo_gcic' &&
          !logo.name.toUpperCase().includes('GCIC')
      )
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

  const addPartnerHotelRoom = async (
    roomInput: Omit<PartnerHotelRoom, 'id' | 'createdAt'>
  ): Promise<PartnerHotelRoom> => {
    const newId = `room_custom_${Date.now()}`;
    const created: PartnerHotelRoom = {
      ...roomInput,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setPartnerHotelRooms((prev) => [created, ...prev]);
    await syncPartnerRoomToFirestore(created, OperationType.CREATE);
    return created;
  };

  const deletePartnerHotelRoom = async (id: string): Promise<void> => {
    const deleted = readStringSet(DELETED_ROOMS_KEY);
    deleted.add(id);
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    deleted.add(cleanId);
    saveStringSet(DELETED_ROOMS_KEY, deleted);

    setPartnerHotelRooms((prev) => prev.filter((item) => item.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `partner_hotel_rooms/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'partner_hotel_rooms', cleanId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const addDriverFleetVehicle = async (
    vehicleInput: Omit<DriverFleetVehicle, 'id' | 'createdAt'>
  ): Promise<DriverFleetVehicle> => {
    const newId = `fleet_custom_${Date.now()}`;
    const created: DriverFleetVehicle = {
      ...vehicleInput,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setDriverFleetVehicles((prev) => [created, ...prev]);
    await syncDriverFleetToFirestore(created, OperationType.CREATE);
    return created;
  };

  const deleteDriverFleetVehicle = async (id: string): Promise<void> => {
    const deleted = readStringSet(DELETED_FLEET_KEY);
    deleted.add(id);
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    deleted.add(cleanId);
    saveStringSet(DELETED_FLEET_KEY, deleted);

    setDriverFleetVehicles((prev) => prev.filter((item) => item.id !== id));
    if (auth.currentUser?.uid) {
      const docPath = `driver_fleet_vehicles/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'driver_fleet_vehicles', cleanId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const isProviderShortlisted = useCallback(
    (providerType: ShortlistProviderType, providerIdOrSlug: string): boolean => {
      return shortlistedProviders.some(
        (item) =>
          item.providerType === providerType &&
          (item.providerId === providerIdOrSlug || item.providerSlug === providerIdOrSlug)
      );
    },
    [shortlistedProviders]
  );

  const removeShortlistProvider = useCallback(async (id: string): Promise<void> => {
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    const deleted = readStringSet(DELETED_SHORTLIST_KEY);
    deleted.add(id);
    deleted.add(cleanId);
    saveStringSet(DELETED_SHORTLIST_KEY, deleted);

    setShortlistedProviders((prev) =>
      prev.filter((item) => item.id !== id && item.id !== cleanId)
    );

    if (auth.currentUser?.uid) {
      const docPath = `shortlisted_providers/${cleanId}`;
      try {
        await deleteDoc(doc(db, 'shortlisted_providers', cleanId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  }, []);

  const toggleShortlistProvider = useCallback(
    async (
      itemInput: Omit<ShortlistedProviderItem, 'id' | 'createdAt'>
    ): Promise<boolean> => {
      const existingMatch = shortlistedProviders.find(
        (s) =>
          s.providerType === itemInput.providerType &&
          (s.providerId === itemInput.providerId || s.providerSlug === itemInput.providerSlug)
      );

      if (existingMatch) {
        await removeShortlistProvider(existingMatch.id);
        return false;
      }

      const rawId = `shortlist_${itemInput.providerType}_${itemInput.providerSlug || itemInput.providerId}`
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 128);

      const deleted = readStringSet(DELETED_SHORTLIST_KEY);
      deleted.delete(rawId);
      saveStringSet(DELETED_SHORTLIST_KEY, deleted);

      const created: ShortlistedProviderItem = {
        ...itemInput,
        id: rawId,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
      };

      setShortlistedProviders((prev) => [created, ...prev.filter((p) => p.id !== rawId)]);
      await syncShortlistedProviderToFirestore(created, OperationType.CREATE);
      return true;
    },
    [shortlistedProviders, removeShortlistProvider, syncShortlistedProviderToFirestore]
  );

  const clearShortlist = useCallback(async (): Promise<void> => {
    const currentItems = [...shortlistedProviders];
    setShortlistedProviders([]);
    try {
      localStorage.removeItem(SHORTLIST_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (auth.currentUser?.uid) {
      for (const item of currentItems) {
        const cleanId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
        try {
          await deleteDoc(doc(db, 'shortlisted_providers', cleanId));
        } catch (err) {
          try {
            handleFirestoreError(
              err,
              OperationType.DELETE,
              `shortlisted_providers/${cleanId}`
            );
          } catch {
            // Handled
          }
        }
      }
    }
  }, [shortlistedProviders]);

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
        packageEvents: safariEvents,
        carouselEvents,
        upcomingEvents,
        addSafariEvent,
        addPackageEvent: (input) => addSafariEvent(input),
        formatPrice: (amountUSD: number) => formatCurrencyPrice(amountUSD, currency),
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
        partnerHotelRooms,
        addPartnerHotelRoom,
        deletePartnerHotelRoom,
        driverFleetVehicles,
        addDriverFleetVehicle,
        deleteDriverFleetVehicle,
        shortlistedProviders,
        isProviderShortlisted,
        toggleShortlistProvider,
        removeShortlistProvider,
        clearShortlist,
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
