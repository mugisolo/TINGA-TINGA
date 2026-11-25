import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  COUNTRY_TO_LANGUAGE_MAP,
  TRANSLATIONS,
  TranslationDictionary,
  LanguageMetadata,
  inferLanguageFromTimezoneOrBrowser,
} from '../lib/i18n';

export interface GeoDetectionResult {
  status: 'idle' | 'detecting' | 'detected' | 'error';
  countryName: string;
  countryCode: string;
  city?: string;
  proposedLanguage: SupportedLanguage;
  source: 'ip' | 'gps' | 'timezone' | 'simulated';
}

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  translateText: (englishText: string) => string;
  currentLanguageMeta: LanguageMetadata;
  dir: 'ltr' | 'rtl';
  geoDetection: GeoDetectionResult;
  showGeoBanner: boolean;
  setShowGeoBanner: (show: boolean) => void;
  acceptProposedLanguage: () => void;
  dismissGeoBanner: () => void;
  detectUserLocation: (useBrowserGps?: boolean) => Promise<void>;
  simulateGeoLocation: (targetLang: SupportedLanguage) => void;
}

const LANGUAGE_STORAGE_KEY = 'enganda_language_v1';
const LEGACY_LANGUAGE_STORAGE_KEY = 'wildlife_language_v1';
const GEO_DISMISSED_KEY = 'wildlife_geo_banner_dismissed_v1';

const DYNAMIC_PHRASE_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  fr: {
    'Operated by Enganda Members': 'Opéré par les Membres Enganda',
    'Guaranteed Primate Departure': 'Départ Primates Garanti',
    'Seasonal Migration & Savanna': 'Migration Saisonnière & Savane',
    'Cultural & Music Event': 'Événement Culturel & Musical',
    'Ornithology Special': 'Spécial Ornithologie',
    'Mountain Gorillas': 'Gorilles des Montagnes',
    'Chimpanzee Tracking': 'Pistage des Chimpanzés',
    'Specialist Birding': 'Ornithologie Spécialisée',
    'Savanna Big Game': 'Grand Gibier de Savane',
    'Community & Culture': 'Communauté & Culture',
    'Alpine & Volcano Hiking': 'Randonnée Alpine & Volcans',
    'Wildlife Photography': 'Photographie Animalière',
    'Pay & Book Directly': 'Payer & Réserver en Direct',
    'Pay 30% Deposit Directly': 'Régler 30% d’Acompte en Direct',
    'Pay Full Package Directly': 'Régler 100% du Forfait en Direct',
  },
  es: {
    'Operated by Enganda Members': 'Operado por Miembros de Enganda',
    'Guaranteed Primate Departure': 'Salida Garantizada de Primates',
    'Seasonal Migration & Savanna': 'Migración Estacional y Sabana',
    'Cultural & Music Event': 'Evento Cultural y Musical',
    'Ornithology Special': 'Especial de Ornitología',
    'Mountain Gorillas': 'Gorilas de Montaña',
    'Chimpanzee Tracking': 'Rastreo de Chimpancés',
    'Specialist Birding': 'Observación de Aves',
    'Savanna Big Game': 'Gran Fauna de Sabana',
    'Community & Culture': 'Comunidad y Cultura',
    'Alpine & Volcano Hiking': 'Senderismo Alpino y Volcanes',
    'Wildlife Photography': 'Fotografía de Naturaleza',
    'Pay & Book Directly': 'Pagar y Reservar Directo',
    'Pay 30% Deposit Directly': 'Pagar 30% de Depósito Directo',
    'Pay Full Package Directly': 'Pagar 100% del Paquete Directo',
  },
  de: {
    'Operated by Enganda Members': 'Durchgeführt von Enganda-Mitgliedern',
    'Guaranteed Primate Departure': 'Garantierte Primaten-Abreise',
    'Seasonal Migration & Savanna': 'Saisonale Migration & Savanne',
    'Cultural & Music Event': 'Kultur- & Musik-Event',
    'Ornithology Special': 'Ornithologie-Spezial',
    'Mountain Gorillas': 'Berggorillas',
    'Chimpanzee Tracking': 'Schimpansen-Tracking',
    'Specialist Birding': 'Vogelbeobachtung',
    'Savanna Big Game': 'Großwild-Savanne',
    'Community & Culture': 'Gemeinschaft & Kultur',
    'Alpine & Volcano Hiking': 'Alpin- & Vulkanwandern',
    'Wildlife Photography': 'Tierfotografie',
    'Pay & Book Directly': 'Direkt buchen & bezahlen',
    'Pay 30% Deposit Directly': '30% Anzahlung direkt zahlen',
    'Pay Full Package Directly': 'Gesamtpaket direkt zahlen',
  },
  ar: {
    'Operated by Enganda Members': 'بإدارة أعضاء إنغاندا المعتمدين',
    'Guaranteed Primate Departure': 'رحلة رئيسيات مؤكدة',
    'Seasonal Migration & Savanna': 'الهجرة الموسمية والسافانا',
    'Cultural & Music Event': 'فعالية ثقافية وموسيقية',
    'Ornithology Special': 'رحلة خاصة لمراقبة الطيور',
    'Mountain Gorillas': 'غوريلا الجبال',
    'Chimpanzee Tracking': 'تتبع الشمبانزي',
    'Specialist Birding': 'مراقبة الطيور المتخصصة',
    'Savanna Big Game': 'الحياة البرية الكبرى في السافانا',
    'Community & Culture': 'المجتمع والثقافة',
    'Alpine & Volcano Hiking': 'تسلق الجبال والبراكين',
    'Wildlife Photography': 'تصوير الحياة البرية',
    'Pay & Book Directly': 'احجز وادفع مباشرة',
    'Pay 30% Deposit Directly': 'ادفع عربون 30% مباشرة',
    'Pay Full Package Directly': 'ادفع كامل الباقة مباشرة',
  },
  zh: {
    'Operated by Enganda Members': '由 Enganda 认证成员机构运营',
    'Guaranteed Primate Departure': '灵长类追踪保证发团',
    'Seasonal Migration & Savanna': '大迁徙与草原猎游',
    'Cultural & Music Event': '文化与音乐盛典',
    'Ornithology Special': '专业观鸟专线',
    'Mountain Gorillas': '山地大猩猩',
    'Chimpanzee Tracking': '黑猩猩追踪',
    'Specialist Birding': '专业观鸟',
    'Savanna Big Game': '草原大型野生动物',
    'Community & Culture': '社区与文化体验',
    'Alpine & Volcano Hiking': '高山与火山徒步',
    'Wildlife Photography': '野生动物摄影',
    'Pay & Book Directly': '直接预订并支付',
    'Pay 30% Deposit Directly': '直接支付 30% 定金',
    'Pay Full Package Directly': '直接全额支付套餐',
  },
  nl: {
    'Operated by Enganda Members': 'Uitgevoerd door Enganda-leden',
    'Guaranteed Primate Departure': 'Gegarandeerd Primatenvertrek',
    'Seasonal Migration & Savanna': 'Seizoensmigratie & Savanne',
    'Cultural & Music Event': 'Cultureel & Muziekevenement',
    'Ornithology Special': 'Vogelspecial',
    'Mountain Gorillas': 'Berggorilla’s',
    'Chimpanzee Tracking': 'Chimpansee-tracking',
    'Specialist Birding': 'Specialistische Vogelreizen',
    'Savanna Big Game': 'Groot Wild op de Savanne',
    'Community & Culture': 'Gemeenschap & Cultuur',
    'Alpine & Volcano Hiking': 'Berg- & Vulkaanwandelingen',
    'Wildlife Photography': 'Natuurfotografie',
    'Pay & Book Directly': 'Direct Boeken & Betalen',
    'Pay 30% Deposit Directly': 'Betaal Direct 30% Aanbetaling',
    'Pay Full Package Directly': 'Betaal Direct Volledig Pakket',
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved =
        (localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null) ||
        (localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY) as SupportedLanguage | null);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'en';
  });

  const [showGeoBanner, setShowGeoBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GEO_DISMISSED_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [geoDetection, setGeoDetection] = useState<GeoDetectionResult>(() => {
    const inferred = inferLanguageFromTimezoneOrBrowser();
    return {
      status: 'idle',
      countryName: inferred.countryName,
      countryCode: inferred.countryCode,
      city: inferred.city,
      proposedLanguage: inferred.lang,
      source: 'timezone',
    };
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  // Cross-tab storage listener so language changes in one tab update all open tabs immediately
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === LANGUAGE_STORAGE_KEY || e.key === LEGACY_LANGUAGE_STORAGE_KEY) &&
        e.newValue &&
        SUPPORTED_LANGUAGES.some((l) => l.code === e.newValue)
      ) {
        setLanguageState(e.newValue as SupportedLanguage);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLanguageMeta.dir;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const translateText = useCallback(
    (englishText: string): string => {
      if (!englishText || language === 'en') return englishText;
      const dict = DYNAMIC_PHRASE_TRANSLATIONS[language];
      return (dict && dict[englishText]) || englishText;
    },
    [language]
  );

  // Sync <html lang="..." dir="..."> whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  const resolveLanguageForCountry = (
    countryCodeRaw: string,
    fallbackLang?: SupportedLanguage
  ): SupportedLanguage => {
    const code = (countryCodeRaw || '').toUpperCase().trim();
    if (code && COUNTRY_TO_LANGUAGE_MAP[code]) {
      if (code === 'BE') {
        const nav = (navigator.language || '').toLowerCase();
        return nav.startsWith('fr') ? 'fr' : 'nl';
      }
      if (code === 'CH') {
        const nav = (navigator.language || '').toLowerCase();
        return nav.startsWith('fr') ? 'fr' : 'de';
      }
      if (code === 'CA') {
        const nav = (navigator.language || '').toLowerCase();
        return nav.startsWith('fr') ? 'fr' : 'en';
      }
      return COUNTRY_TO_LANGUAGE_MAP[code];
    }
    return fallbackLang || 'en';
  };

  const detectUserLocation = useCallback(async (useBrowserGps = false) => {
    setGeoDetection((prev) => ({ ...prev, status: 'detecting' }));

    // 1. Optional HTML5 Browser Geolocation (when user clicks "Detect My Location")
    if (useBrowserGps && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 6000,
            maximumAge: 60000,
          });
        });

        const { latitude, longitude } = pos.coords;
        const revRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (revRes.ok) {
          const data = await revRes.json();
          const cCode = (data.countryCode || 'UG').toUpperCase();
          const cName = data.countryName || 'Detected Location';
          const city = data.city || data.locality || undefined;
          const inferred = inferLanguageFromTimezoneOrBrowser();
          const mappedLang = resolveLanguageForCountry(cCode, inferred.lang);

          setGeoDetection({
            status: 'detected',
            countryName: cName,
            countryCode: cCode,
            city,
            proposedLanguage: mappedLang,
            source: 'gps',
          });
          setShowGeoBanner(true);
          try {
            localStorage.removeItem(GEO_DISMISSED_KEY);
          } catch {
            // ignore
          }
          return;
        }
      } catch {
        // Fall through to IP geolocation if GPS permission denied or timed out
      }
    }

    // 2. IP-based Geolocation Lookup (ipwho.is -> bigdatacloud fallback -> timezone fallback)
    try {
      const response = await fetch('https://ipwho.is/', {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success !== false && data.country_code) {
          const cCode = String(data.country_code).toUpperCase();
          const cName = String(data.country || 'International');
          const city = data.city ? String(data.city) : undefined;
          const inferred = inferLanguageFromTimezoneOrBrowser();
          const mappedLang = resolveLanguageForCountry(cCode, inferred.lang);

          setGeoDetection({
            status: 'detected',
            countryName: cName,
            countryCode: cCode,
            city,
            proposedLanguage: mappedLang,
            source: 'ip',
          });
          if (useBrowserGps) {
            setShowGeoBanner(true);
          }
          return;
        }
      }
    } catch {
      // Try secondary IP geolocation provider
    }

    try {
      const fallbackRes = await fetch(
        'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en'
      );
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data && data.countryCode) {
          const cCode = String(data.countryCode).toUpperCase();
          const cName = String(data.countryName || 'International');
          const city = data.city || data.locality || undefined;
          const inferred = inferLanguageFromTimezoneOrBrowser();
          const mappedLang = resolveLanguageForCountry(cCode, inferred.lang);

          setGeoDetection({
            status: 'detected',
            countryName: cName,
            countryCode: cCode,
            city,
            proposedLanguage: mappedLang,
            source: 'ip',
          });
          if (useBrowserGps) {
            setShowGeoBanner(true);
          }
          return;
        }
      }
    } catch {
      // Fall back to timezone/browser locale inference
    }

    const inferred = inferLanguageFromTimezoneOrBrowser();
    setGeoDetection({
      status: 'detected',
      countryName: inferred.countryName,
      countryCode: inferred.countryCode,
      city: inferred.city,
      proposedLanguage: inferred.lang,
      source: 'timezone',
    });
    if (useBrowserGps) {
      setShowGeoBanner(true);
    }
  }, []);

  useEffect(() => {
    detectUserLocation(false);
  }, [detectUserLocation]);

  const simulateGeoLocation = useCallback((targetLang: SupportedLanguage) => {
    const meta =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[0];
    setGeoDetection({
      status: 'detected',
      countryName: meta.sampleCountry,
      countryCode: meta.countryCode,
      city: meta.sampleCity,
      proposedLanguage: meta.code,
      source: 'simulated',
    });
    setShowGeoBanner(true);
    try {
      localStorage.removeItem(GEO_DISMISSED_KEY);
    } catch {
      // ignore
    }
  }, []);

  const acceptProposedLanguage = useCallback(() => {
    setLanguage(geoDetection.proposedLanguage);
    setShowGeoBanner(false);
    try {
      localStorage.setItem(GEO_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  }, [geoDetection.proposedLanguage, setLanguage]);

  const dismissGeoBanner = useCallback(() => {
    setShowGeoBanner(false);
    try {
      localStorage.setItem(GEO_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateText,
        currentLanguageMeta,
        dir,
        geoDetection,
        showGeoBanner,
        setShowGeoBanner,
        acceptProposedLanguage,
        dismissGeoBanner,
        detectUserLocation,
        simulateGeoLocation,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
