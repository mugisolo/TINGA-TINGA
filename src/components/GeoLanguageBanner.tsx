import React from 'react';
import { Globe, MapPin, Check, X, Navigation, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  SupportedLanguage,
} from '../lib/i18n';

export const GeoLanguageBanner: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    geoDetection,
    showGeoBanner,
    acceptProposedLanguage,
    dismissGeoBanner,
    detectUserLocation,
  } = useLanguage();

  if (!showGeoBanner) return null;

  const proposedMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === geoDetection.proposedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const proposedTranslations =
    TRANSLATIONS[geoDetection.proposedLanguage] || TRANSLATIONS.en;

  const isDifferentFromActive = geoDetection.proposedLanguage !== language;
  const locationDisplay = geoDetection.city
    ? `${geoDetection.city}, ${geoDetection.countryName}`
    : geoDetection.countryName;

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    dismissGeoBanner();
  };

  return (
    <div
      role="region"
      aria-label="Geolocation language suggestion"
      className="bg-[#144225] text-[#FAF7F2] border-b border-[#D99B26]/40 px-3 sm:px-6 lg:px-8 py-1.5 text-xs relative z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Detected Geolocation + Proposed Language Prompt */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#226B3E] border border-[#D99B26]/40 text-[#D99B26] font-mono text-[10px] font-semibold shrink-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>
              {geoDetection.status === 'detecting'
                ? t.geoBanner.locating
                : `${locationDisplay} (${geoDetection.countryCode})`}
            </span>
          </span>

          {isDifferentFromActive ? (
            <span className="text-[#FAF7F2] font-medium text-[11px] sm:text-xs truncate">
              {proposedTranslations.geoBanner.detectedFrom}{' '}
              <strong className="text-[#D99B26]">{locationDisplay}</strong> —{' '}
              {proposedTranslations.geoBanner.proposeSwitch}{' '}
              <strong className="text-white underline decoration-[#D99B26]">
                {proposedMeta.nativeName}
              </strong>
              ?
            </span>
          ) : (
            <span className="text-[#E4DCCF] text-[11px] sm:text-xs truncate">
              {t.geoBanner.detectedFrom}{' '}
              <strong className="text-white">{locationDisplay}</strong>.{' '}
              <span className="hidden sm:inline">{t.geoBanner.selectLanguagePrompt}</span>
            </span>
          )}
        </div>

        {/* Right: Quick Action Buttons & Language Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {isDifferentFromActive && (
            <button
              type="button"
              onClick={acceptProposedLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#D99B26] hover:bg-[#c5891d] text-[#1A1612] font-bold text-[11px] transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Globe className="w-3 h-3" />
              <span>
                {proposedTranslations.geoBanner.switchButton} ({proposedMeta.nativeName})
              </span>
            </button>
          )}

          {/* Direct Language Pills for FR, AR, ZH, NL, DE, EN */}
          <div className="flex flex-wrap items-center gap-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = language === lang.code;
              const isProposed =
                geoDetection.proposedLanguage === lang.code && !isActive;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1 border ${
                    isActive
                      ? 'bg-[#C85A28] text-white border-[#C85A28] font-bold'
                      : isProposed
                      ? 'bg-[#226B3E] text-[#D99B26] border-[#D99B26]'
                      : 'bg-[#1B5632] text-[#E4DCCF] border-white/15 hover:text-white hover:border-white/40'
                  }`}
                  title={`${lang.name} (${lang.nativeName})`}
                >
                  {isActive && <Check className="w-2.5 h-2.5" />}
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>

          {/* GPS Locate Button */}
          <button
            type="button"
            onClick={() => detectUserLocation(true)}
            disabled={geoDetection.status === 'detecting'}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1B5632] hover:bg-[#226B3E] text-[#D6CEC2] hover:text-white border border-white/15 text-[10px] font-mono transition-colors cursor-pointer"
            title={t.geoBanner.locateMe}
          >
            {geoDetection.status === 'detecting' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-[#D99B26]" />
            ) : (
              <Navigation className="w-3 h-3 text-[#D99B26]" />
            )}
            <span className="hidden md:inline">{t.geoBanner.locateMe}</span>
          </button>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={dismissGeoBanner}
            aria-label={t.geoBanner.keepCurrent}
            className="p-0.5 rounded text-[#D6CEC2] hover:text-white hover:bg-[#1B5632] transition-colors cursor-pointer"
            title={t.geoBanner.keepCurrent}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
