import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Compass,
  ArrowUpRight,
  Wallet,
  Globe,
  MapPin,
  Check,
  Navigation,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Currency, PortalRole } from '../types';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';
import {
  formatPrice,
  CURRENCY_RATES,
  formatExchangeRateSummary,
} from '../lib/currency';
import { SocialStrip } from './SocialLinks';
import { GeoLanguageBanner } from './GeoLanguageBanner';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'UGX'];

const PORTAL_MENU_ITEMS: {
  role: PortalRole;
  slug: string;
  label: string;
  shortLabel: string;
  desc: string;
  ruleRequirement: string;
}[] = [
  {
    role: 'client',
    slug: 'client',
    label: 'Client Portal',
    shortLabel: 'Client',
    desc: 'Itineraries, UWA Permit Escrow & Lodge Vouchers',
    ruleRequirement: 'request.auth.uid == userId',
  },
  {
    role: 'specialist',
    slug: 'specialists',
    label: 'Specialists Portal',
    shortLabel: 'Specialists',
    desc: 'Lead Guides, Field Dispatches & 4x4 Readiness',
    ruleRequirement: 'role == "specialist" | isStaffOrAdmin()',
  },
  {
    role: 'partner',
    slug: 'partner',
    label: 'Partner Portal',
    shortLabel: 'Partner',
    desc: 'Lodges, Tented Camps, Room Blocks & Tariffs',
    ruleRequirement: 'role == "partner" | isStaffOrAdmin()',
  },
  {
    role: 'staff',
    slug: 'staff',
    label: 'Staff Operations Portal',
    shortLabel: 'Staff',
    desc: 'Entebbe Desk, UWA Queue & EBB Airport Fleet',
    ruleRequirement: 'isStaffOrAdmin()',
  },
  {
    role: 'admin',
    slug: 'admin',
    label: 'Admin Governance Portal',
    shortLabel: 'Admin',
    desc: 'Executive Treasury, RBAC & Escrow Audit',
    ruleRequirement: 'isAdmin() Verified Only',
  },
];

export const Navbar: React.FC = () => {
  const {
    currency,
    setCurrency,
    exchangeRates,
    ratesUpdatedAt,
    ratesSource,
    isRefreshingRates,
    refreshExchangeRates,
  } = useInquiry();
  const { availableBalanceUSD } = useWallet();
  const {
    user,
    activePortalRole,
    canSwitchToRole,
    currentRoleRights,
    setActivePortalRole,
  } = useAuth();
  const {
    language,
    setLanguage,
    t,
    currentLanguageMeta,
    geoDetection,
    detectUserLocation,
    simulateGeoLocation,
  } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: t.nav.ourGuides, shortLabel: 'Guides', path: '/guides' },
    { label: t.nav.experiences, shortLabel: 'Experiences', path: '/experiences' },
    { label: t.nav.destinations, shortLabel: 'Destinations', path: '/destinations' },
    { label: 'Safari Essentials', shortLabel: 'Essentials', path: '/safari-essentials' },
    { label: t.nav.journal, shortLabel: 'Journal', path: '/journal' },
    { label: t.nav.about, shortLabel: 'About', path: '/about' },
    { label: t.nav.contact, shortLabel: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setLangMenuOpen(false);
    setCurrencyMenuOpen(false);
    setPortalMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setLangMenuOpen(false);
        setCurrencyMenuOpen(false);
        setPortalMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setLangMenuOpen(false);
      }
      if (
        currencyMenuRef.current &&
        !currencyMenuRef.current.contains(e.target as Node)
      ) {
        setCurrencyMenuOpen(false);
      }
      if (
        portalMenuRef.current &&
        !portalMenuRef.current.contains(e.target as Node)
      ) {
        setPortalMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E4DCCF] print:hidden">
      {/* Automatic Geolocation & Language Proposal Strip */}
      <GeoLanguageBanner />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0">
        {/* Clean Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 text-[#1A1612] hover:opacity-90 transition-opacity shrink-0"
        >
          <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#226B3E] shrink-0" />
          <span className="font-serif text-lg sm:text-xl xl:text-2xl font-bold tracking-tight text-[#1A1612] whitespace-nowrap">
            Enganda Safaris
          </span>
        </Link>

        {/* Primary Desktop Navigation (Fits cleanly within lg+ viewport boundary) */}
        <nav
          className="hidden lg:flex items-center gap-2 xl:gap-4 min-w-0"
          aria-label="Primary Navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs xl:text-sm font-medium transition-colors py-1 border-b-2 whitespace-nowrap ${
                isActive(link.path)
                  ? 'text-[#226B3E] border-[#C85A28] font-semibold'
                  : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
              }`}
            >
              <span className="hidden 2xl:inline">{link.label}</span>
              <span className="2xl:hidden">{link.shortLabel}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop Right Controls (lg+ only: never collides with mobile menu button) */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* 5-Role Portals Popover Menu (Aligned with Firestore RBAC Rules) */}
          <div className="relative" ref={portalMenuRef}>
            <button
              type="button"
              onClick={() => setPortalMenuOpen((prev) => !prev)}
              aria-expanded={portalMenuOpen}
              className={`inline-flex items-center gap-1 border text-xs font-mono font-semibold rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isActive('/portals') || isActive('/portal')
                  ? 'bg-[#226B3E] text-white border-[#226B3E]'
                  : 'bg-[#F3ECE1] hover:bg-[#E4DCCF] border-[#E4DCCF] text-[#1A1612]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
              <span>Portals</span>
              <span className="hidden xl:inline text-[10px] uppercase opacity-80">
                · {activePortalRole}
              </span>
              <ChevronDown className="w-3 h-3 opacity-75 shrink-0" />
            </button>

            {portalMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg shadow-xl p-3.5 space-y-2.5 z-50">
                <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-2">
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                      Firestore RBAC Role Portals
                    </span>
                    <span className="text-[11px] text-[#5A5248]">
                      {user
                        ? `Authenticated: ${user.email}`
                        : 'Guest Session · Sign in to persist cloud role'}
                    </span>
                  </div>
                  <Link
                    to="/portals"
                    onClick={() => setPortalMenuOpen(false)}
                    className="font-mono text-[10px] text-[#C85A28] font-semibold hover:underline shrink-0"
                  >
                    Open Hub
                  </Link>
                </div>

                {/* Active Role Security Scope */}
                <div className="px-2.5 py-1.5 rounded bg-[#F3ECE1] border border-[#E4DCCF] text-[10px] font-mono text-[#5A5248]">
                  <strong className="text-[#226B3E]">Active Rights:</strong>{' '}
                  {currentRoleRights.firestoreScope}
                </div>

                <div className="space-y-1.5">
                  {PORTAL_MENU_ITEMS.map((item) => {
                    const active =
                      activePortalRole === item.role &&
                      isActive(`/portals/${item.slug}`);
                    const allowed = canSwitchToRole(item.role);
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={async () => {
                          if (allowed) {
                            await setActivePortalRole(item.role);
                          }
                          setPortalMenuOpen(false);
                          navigate(`/portals/${item.slug}`);
                        }}
                        className={`w-full p-2 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-[#226B3E] text-white border-[#226B3E]'
                            : allowed
                            ? 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                            : 'bg-[#F3ECE1]/60 text-[#5A5248] border-[#E4DCCF]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{item.label}</span>
                            {!allowed && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase text-[#C85A28]">
                                <Lock className="w-2.5 h-2.5" />
                                Restricted
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                            }`}
                          >
                            {item.desc}
                          </div>
                          <div
                            className={`text-[9px] font-mono mt-0.5 ${
                              active ? 'text-[#D99B26]' : 'text-[#226B3E]'
                            }`}
                          >
                            Rule: {item.ruleRequirement}
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Language & Geolocation Selector Popover */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              aria-expanded={langMenuOpen}
              aria-label={t.nav.languageLabel}
              className="inline-flex items-center gap-1 bg-[#F3ECE1] hover:bg-[#E4DCCF] border border-[#E4DCCF] text-[#1A1612] text-xs font-mono font-semibold rounded-md px-2 py-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
              <span>{currentLanguageMeta.shortLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#5A5248] shrink-0" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg shadow-xl p-3 space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold">
                    {t.geoBanner.selectLanguagePrompt}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#226B3E] bg-[#226B3E]/10 px-1.5 py-0.5 rounded">
                    <MapPin className="w-3 h-3 text-[#C85A28]" />
                    {geoDetection.countryCode}
                  </span>
                </div>

                {/* 6 Supported Languages Grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const active = language === lang.code;
                    const isGeoSuggested =
                      geoDetection.proposedLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`p-2 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-[#226B3E] text-white border-[#226B3E]'
                            : isGeoSuggested
                            ? 'bg-white text-[#1A1612] border-[#D99B26]'
                            : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold leading-tight">
                            {lang.nativeName}
                          </div>
                          <div
                            className={`text-[10px] font-mono ${
                              active ? 'text-[#D6CEC2]' : 'text-[#5A5248]'
                            }`}
                          >
                            {lang.name} ({lang.shortLabel})
                          </div>
                        </div>
                        {active ? (
                          <Check className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                        ) : isGeoSuggested ? (
                          <span className="font-mono text-[9px] uppercase px-1 py-0.5 rounded bg-[#D99B26]/20 text-[#C85A28]">
                            Geo
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Geolocation Controls */}
                <div className="pt-2 border-t border-[#E4DCCF] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#5A5248]">
                    <span>
                      {t.geoBanner.detectedFrom}:{' '}
                      <strong className="text-[#1A1612]">
                        {geoDetection.city
                          ? `${geoDetection.city}, ${geoDetection.countryName}`
                          : geoDetection.countryName}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      detectUserLocation(true);
                      setLangMenuOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#226B3E]" />
                    <span>{t.geoBanner.locateMe}</span>
                  </button>

                  {/* Region Proposal Preview Chips */}
                  <div className="space-y-1 pt-1">
                    <span className="block font-mono text-[10px] uppercase text-[#5A5248]">
                      {t.geoBanner.testGeoLabel}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en').map(
                        (l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              simulateGeoLocation(l.code);
                              setLangMenuOpen(false);
                            }}
                            className="px-2 py-0.5 rounded bg-white hover:bg-[#226B3E] hover:text-white text-[#5A5248] border border-[#E4DCCF] font-mono text-[10px] transition-colors cursor-pointer"
                            title={`Propose ${l.nativeName} (${l.sampleCity}, ${l.sampleCountry})`}
                          >
                            {l.sampleCity} ({l.shortLabel})
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Currency Switcher Popover (USD, EUR, GBP, UGX) */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              type="button"
              onClick={() => setCurrencyMenuOpen((prev) => !prev)}
              aria-expanded={currencyMenuOpen}
              aria-label={t.nav.currencyLabel}
              title={`Active Currency: ${currency} (${formatExchangeRateSummary(currency)})`}
              className="inline-flex items-center gap-1 bg-[#F3ECE1] hover:bg-[#E4DCCF] border border-[#E4DCCF] text-[#1A1612] text-xs font-mono font-semibold rounded-md px-2 py-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-[#5A5248] shrink-0" />
            </button>

            {currencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg shadow-xl p-3.5 space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-2">
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                      Live Currency Switcher
                    </span>
                    <span className="text-[11px] text-[#5A5248]">
                      Updates all safari & permit tariffs
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshExchangeRates()}
                    disabled={isRefreshingRates}
                    title="Refresh live exchange rates"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] font-mono text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3 h-3 text-[#226B3E] ${
                        isRefreshingRates ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{isRefreshingRates ? 'Syncing' : 'Live'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {CURRENCIES.map((cur) => {
                    const active = currency === cur;
                    const info = CURRENCY_RATES[cur];
                    const liveRate = exchangeRates[cur] ?? info.rate;
                    return (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => {
                          setCurrency(cur);
                          setCurrencyMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-[#226B3E] text-white border-[#226B3E]'
                            : 'bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{cur}</span>
                            <span
                              className={`font-normal text-[11px] ${
                                active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                              }`}
                            >
                              • {info.name}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                              active ? 'text-[#D99B26]' : 'text-[#5A5248]'
                            }`}
                          >
                            {cur === 'USD'
                              ? 'Base Tariff (1 USD = US$1.00)'
                              : cur === 'UGX'
                              ? `1 USD = UGX ${Math.round(liveRate).toLocaleString()}`
                              : `1 USD = ${info.symbol}${liveRate.toFixed(4)}`}
                          </div>
                        </div>
                        {active && (
                          <Check className="w-4 h-4 text-[#D99B26] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E4DCCF] flex items-center justify-between text-[10px] font-mono text-[#5A5248]">
                  <span>
                    Feed:{' '}
                    <strong className="text-[#226B3E]">
                      {ratesSource === 'live_api'
                        ? 'Live FX Market'
                        : 'Entebbe Desk'}
                    </strong>
                  </span>
                  <span className="tabular-nums">
                    {new Date(ratesUpdatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/wallet"
            title={t.nav.safariWallet}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
              isActive('/wallet')
                ? 'bg-[#144225] text-white border-[#144225]'
                : 'bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border-[#E4DCCF]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
            <span className="tabular-nums">{formatPrice(availableBalanceUSD, currency)}</span>
          </Link>

          <Link
            to="/trip-planner"
            className="inline-flex items-center gap-1.5 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <span>{t.nav.planMySafari}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Mobile & Tablet Bar (< lg): Fits strictly inside screen boundaries */}
        <div className="flex items-center gap-1.5 lg:hidden shrink-0">
          <Link
            to="/portals"
            className="inline-flex items-center gap-1 bg-[#226B3E] text-white text-xs font-mono font-semibold rounded-md px-2.5 py-1.5 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
            <span>Portals</span>
          </Link>

          <Link
            to="/trip-planner"
            className="hidden sm:inline-flex items-center gap-1 bg-[#C85A28] text-white text-xs font-semibold rounded-md px-2.5 py-1.5 whitespace-nowrap"
          >
            <span>{t.nav.planMySafari}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-md border border-[#E4DCCF] text-[#1A1612] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E4DCCF] bg-[#FAF7F2] px-4 pt-4 pb-6 space-y-4 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile 5-Portal Quick Strip with RBAC Status */}
          <div className="pb-3 border-b border-[#E4DCCF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                Firestore Role Portals
              </span>
              <span className="font-mono text-[10px] text-[#5A5248]">
                Active: <strong className="text-[#1A1612] uppercase">{activePortalRole}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {PORTAL_MENU_ITEMS.map((item) => {
                const allowed = canSwitchToRole(item.role);
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={async () => {
                      if (allowed) {
                        await setActivePortalRole(item.role);
                      }
                      setMobileOpen(false);
                      navigate(`/portals/${item.slug}`);
                    }}
                    className={`px-2.5 py-2 rounded text-xs font-semibold border text-left flex items-center justify-between ${
                      activePortalRole === item.role
                        ? 'bg-[#226B3E] text-white border-[#226B3E]'
                        : 'bg-white border-[#E4DCCF] hover:border-[#226B3E] text-[#1A1612]'
                    }`}
                  >
                    <span>{item.shortLabel}</span>
                    {allowed ? (
                      <ArrowUpRight className="w-3 h-3 text-[#D99B26]" />
                    ) : (
                      <Lock className="w-3 h-3 text-[#C85A28]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Language & Live Currency Strip */}
          <div className="space-y-3 pb-3 border-t-0 border-b border-[#E4DCCF]">
            <div className="flex items-center justify-between text-xs font-mono text-[#5A5248]">
              <span>{t.geoBanner.selectLanguagePrompt}</span>
              <button
                type="button"
                onClick={() => detectUserLocation(true)}
                className="inline-flex items-center gap-1 text-[#226B3E] font-semibold"
              >
                <Navigation className="w-3 h-3" />
                <span>{t.geoBanner.locateMe}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold border text-center ${
                    language === lang.code
                      ? 'bg-[#226B3E] text-white border-[#226B3E]'
                      : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>

            {/* Mobile Live Currency Switcher */}
            <div className="pt-2 border-t border-[#E4DCCF]/60">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5A5248] mb-1.5">
                <span>Live Currency ({formatExchangeRateSummary(currency)})</span>
                <button
                  type="button"
                  onClick={() => refreshExchangeRates()}
                  className="inline-flex items-center gap-1 text-[#226B3E] font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingRates ? 'animate-spin' : ''}`} />
                  <span>Refresh Rates</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`py-1.5 rounded text-xs font-mono font-bold border ${
                      currency === cur
                        ? 'bg-[#226B3E] text-white border-[#226B3E]'
                        : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2.5 rounded-md text-sm font-medium border ${
                  isActive(link.path)
                    ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                    : 'bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF] hover:bg-[#F3ECE1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/wallet"
              className={`px-3 py-2.5 rounded-md text-sm font-medium border flex items-center justify-between ${
                isActive('/wallet')
                  ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                  : 'bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF]'
              }`}
            >
              <span>{t.nav.safariWallet}</span>
              <span className="font-mono text-xs font-bold tabular-nums">
                {formatPrice(availableBalanceUSD, currency)}
              </span>
            </Link>
            <Link
              to="/how-we-work"
              className="px-3 py-2.5 rounded-md text-sm font-medium border bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF]"
            >
              {t.nav.howWeWork}
            </Link>
            <Link
              to="/reviews"
              className="px-3 py-2.5 rounded-md text-sm font-medium border bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF]"
            >
              {t.nav.reviews}
            </Link>
          </nav>

          <div className="pt-2 border-t border-[#E4DCCF] space-y-3">
            <Link
              to="/trip-planner"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-sm font-semibold px-4 py-3 rounded-md transition-colors"
            >
              <span>{t.nav.planMySafari}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="pt-1">
              <SocialStrip variant="light" showLabels={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
