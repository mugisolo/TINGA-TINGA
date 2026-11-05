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
const GEO_DISMISSED_KEY = 'enganda_geo_banner_dismissed_v1';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
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
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLanguageMeta.dir;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

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
