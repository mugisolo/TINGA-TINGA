import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
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
  Search,
  Heart,
  Users,
  Award,
  Building2,
  BookOpen,
  CreditCard,
  Smartphone,
  Landmark,
  History,
  ArrowRight,
  Car,
  Compass,
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
import { GlobalSearchModal } from './GlobalSearchModal';

const CURRENCIES: Currency[] = ['UGX', 'USD', 'EUR', 'GBP'];

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
  const {
    availableBalanceUSD,
    escrowBalanceUSD,
    rewardCreditsUSD,
    transactions,
  } = useWallet();
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
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [providersMenuOpen, setProvidersMenuOpen] = useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [walletDrawerOpen, setWalletDrawerOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);

  const providersMenuRef = useRef<HTMLDivElement>(null);
  const exploreMenuRef = useRef<HTMLDivElement>(null);
  const walletDrawerRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sub-Menu under "Service Providers"
  const serviceProviderItems = [
    {
      label: 'Guides',
      path: '/service-providers?type=guides',
      typeKey: 'guides',
      icon: Users,
    },
    {
      label: 'Safari Operators',
      path: '/service-providers?type=operators',
      typeKey: 'operators',
      icon: Compass,
    },
    {
      label: 'Drivers',
      path: '/service-providers?type=drivers',
      typeKey: 'drivers',
      icon: Car,
    },
    {
      label: 'Hotels',
      path: '/service-providers?type=hotels',
      typeKey: 'hotels',
      icon: Building2,
    },
  ];

  // Primary Single-Row Top Navigation Links (Concise so all items fit on 1 row without wrapping)
  const primaryNavLinks = [
    { label: t.nav.experiences, shortLabel: 'Safaris', path: '/experiences' },
    { label: t.nav.destinations, shortLabel: 'Destinations', path: '/destinations' },
    { label: t.nav.tripPlanner, shortLabel: 'Planner', path: '/trip-planner' },
  ];

  // Grouped Secondary Links under "Explore & Impact" Dropdown
  const exploreImpactItems = [
    {
      label: 'Tingatinga Safaris Showcase',
      desc: '2026 Portfolio (T1–T5 & 8-Day Signature) • UTB/TO/2026/0418',
      path: '/tingatinga-safaris',
      badge: 'Flagship Partner',
      icon: Award,
    },
    {
      label: 'Volunteer Programs',
      desc: 'UWA Wildlife Veterinary, Bwindi Community & Kibale Reforestation',
      path: '/volunteer-programs',
      badge: 'UWA Accredited',
      icon: Users,
    },
    {
      label: 'Conservation Fundraisers',
      desc: 'Gorilla Snare Removal, Batwa Homesteads & Nile Source Mangroves',
      path: '/fundraisers',
      badge: '100% Escrow',
      icon: Heart,
    },
    {
      label: 'UTB & UWA Verification Info',
      desc: 'Multi-Vendor Marketplace Licensing & Regulatory Audit Registry',
      path: '/utb-uwa-verification',
      badge: 'Verified Registry',
      icon: ShieldCheck,
    },
    {
      label: 'Vendor Onboarding (Hotels & Fleet)',
      desc: 'Upload Partner Hotel Rooms, Rates & 4x4 Safari Driver Fleet',
      path: '/service-providers?type=hotels',
      badge: 'Join Marketplace',
      icon: Building2,
    },
    {
      label: t.nav.journal,
      desc: 'Field Dispatches, UWA Permit Advisories & Cultural Stories',
      path: '/journal',
      badge: 'Dispatches',
      icon: BookOpen,
    },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setProvidersMenuOpen(false);
    setExploreMenuOpen(false);
    setWalletDrawerOpen(false);
    setLangMenuOpen(false);
    setPortalMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setMobileOpen(false);
        setProvidersMenuOpen(false);
        setExploreMenuOpen(false);
        setWalletDrawerOpen(false);
        setLangMenuOpen(false);
        setPortalMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        providersMenuRef.current &&
        !providersMenuRef.current.contains(e.target as Node)
      ) {
        setProvidersMenuOpen(false);
      }
      if (
        exploreMenuRef.current &&
        !exploreMenuRef.current.contains(e.target as Node)
      ) {
        setExploreMenuOpen(false);
      }
      if (
        walletDrawerRef.current &&
        !walletDrawerRef.current.contains(e.target as Node)
      ) {
        setWalletDrawerOpen(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setLangMenuOpen(false);
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

  const isExploreImpactActive =
    isActive('/explore-impact') ||
    isActive('/tingatinga-safaris') ||
    isActive('/volunteer-programs') ||
    isActive('/fundraisers') ||
    isActive('/utb-uwa-verification') ||
    isActive('/journal') ||
    isActive('/about') ||
    isActive('/contact');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E4DCCF] print:hidden">
      {/* Automatic Geolocation & Language Proposal Strip */}
      <GeoLanguageBanner />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 h-16 sm:h-[70px] flex items-center justify-between gap-2 xl:gap-4 min-w-0 flex-nowrap">
        {/* Official Enganda Safaris Logo Lockup */}
        <Link
          to="/"
          aria-label="Enganda Safaris — Your Gateway to the Wild (Home)"
          className="flex items-center gap-2 hover:opacity-95 transition-opacity shrink-0 group"
        >
          <div className="bg-[#1B191A] px-2.5 py-1 rounded-lg border border-[#D99B26]/50 group-hover:border-[#D99B26] shadow-xs flex items-center justify-center transition-colors">
            <img
              src="/assets/aistudio/enganda-logo-header.png"
              alt="Enganda Safaris — Your Gateway to the Wild"
              className="h-9 sm:h-10 xl:h-11 w-auto object-contain select-none"
            />
          </div>
        </Link>

        {/* Single-Row Primary Desktop Navigation + "Service Providers" Submenu & "Explore & Impact" Dropdown */}
        <nav
          className="hidden lg:flex items-center gap-2.5 xl:gap-5 min-w-0 flex-nowrap shrink-0"
          aria-label="Primary Navigation"
        >
          {/* "Service Providers" Dropdown Sub-Menu */}
          <div className="relative shrink-0" ref={providersMenuRef}>
            <button
              type="button"
              onClick={() => setProvidersMenuOpen((prev) => !prev)}
              aria-expanded={providersMenuOpen}
              className={`inline-flex items-center gap-1 text-xs xl:text-sm font-medium transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
                isActive('/service-providers') || isActive('/guides') || providersMenuOpen
                  ? 'text-[#226B3E] border-[#C85A28] font-semibold'
                  : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
              }`}
            >
              <span>Service Providers</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  providersMenuOpen ? 'rotate-180 text-[#C85A28]' : ''
                }`}
              />
            </button>

            {providersMenuOpen && (
              <div className="absolute left-0 mt-2.5 w-60 bg-white border border-[#E4DCCF] rounded-xl shadow-2xl p-2 space-y-1 z-50">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E4DCCF] mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                    Service Providers
                  </span>
                  <Link
                    to="/service-providers?type=all"
                    onClick={() => setProvidersMenuOpen(false)}
                    className="font-mono text-[10px] font-bold text-[#C85A28] hover:underline"
                  >
                    Search All →
                  </Link>
                </div>
                {serviceProviderItems.map((item) => {
                  const IconComp = item.icon;
                  const activeItem =
                    (location.pathname === '/service-providers' ||
                      location.pathname === '/guides') &&
                    (location.search.includes(`type=${item.typeKey}`) ||
                      location.search.includes(`section=${item.typeKey}`));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setProvidersMenuOpen(false)}
                      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeItem
                          ? 'bg-[#226B3E] text-white'
                          : 'text-[#1A1612] hover:bg-[#FAF7F2] hover:text-[#226B3E]'
                      }`}
                    >
                      <IconComp
                        className={`w-4 h-4 shrink-0 ${
                          activeItem
                            ? 'text-[#D99B26]'
                            : 'text-[#226B3E] group-hover:text-[#C85A28]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {primaryNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs xl:text-sm font-medium transition-colors py-1 border-b-2 whitespace-nowrap shrink-0 ${
                isActive(link.path)
                  ? 'text-[#226B3E] border-[#C85A28] font-semibold'
                  : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
              }`}
            >
              {link.shortLabel}
            </Link>
          ))}

          {/* "Explore & Impact" Dropdown Menu (Houses Volunteers, Fundraisers, UTB/UWA Verification, Vendor Onboarding, Tingatinga, Journal, About, Contact) */}
          <div className="relative shrink-0" ref={exploreMenuRef}>
            <button
              type="button"
              onClick={() => setExploreMenuOpen((prev) => !prev)}
              aria-expanded={exploreMenuOpen}
              className={`inline-flex items-center gap-1 text-xs xl:text-sm font-medium transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
                isExploreImpactActive || exploreMenuOpen
                  ? 'text-[#226B3E] border-[#C85A28] font-semibold'
                  : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
              }`}
            >
              <span>Explore &amp; Impact</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  exploreMenuOpen ? 'rotate-180 text-[#C85A28]' : ''
                }`}
              />
            </button>

            {exploreMenuOpen && (
              <div className="absolute left-0 mt-2.5 w-[390px] max-w-[calc(100vw-2rem)] bg-white border border-[#E4DCCF] rounded-xl shadow-2xl p-4 space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-2.5">
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                      UTB &amp; UWA Verified Ecosystem
                    </span>
                    <span className="text-xs text-[#5A5248]">
                      Marketplace Impact, Verification &amp; Onboarding
                    </span>
                  </div>
                  <Link
                    to="/explore-impact"
                    onClick={() => setExploreMenuOpen(false)}
                    className="font-mono text-[10px] font-bold text-[#C85A28] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {exploreImpactItems.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setExploreMenuOpen(false)}
                        className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAF7F2] border border-transparent hover:border-[#E4DCCF] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] group-hover:bg-[#226B3E] text-[#226B3E] group-hover:text-white border border-[#E4DCCF] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#1A1612] group-hover:text-[#226B3E] truncate">
                              {item.label}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E4DCCF] font-mono text-[9px] font-bold text-[#C85A28] shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A5248] leading-snug mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Secondary Footer Links inside Explore & Impact */}
                <div className="pt-2.5 border-t border-[#E4DCCF] flex items-center justify-between gap-2 text-xs font-semibold">
                  <Link
                    to="/how-we-work"
                    onClick={() => setExploreMenuOpen(false)}
                    className="text-[#5A5248] hover:text-[#226B3E]"
                  >
                    {t.nav.howWeWork}
                  </Link>
                  <span className="text-[#E4DCCF]">•</span>
                  <Link
                    to="/about"
                    onClick={() => setExploreMenuOpen(false)}
                    className="text-[#5A5248] hover:text-[#226B3E]"
                  >
                    {t.nav.about}
                  </Link>
                  <span className="text-[#E4DCCF]">•</span>
                  <Link
                    to="/contact"
                    onClick={() => setExploreMenuOpen(false)}
                    className="text-[#5A5248] hover:text-[#226B3E]"
                  >
                    {t.nav.contact}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Right Controls (Single Row, Clean, Currency Nested Under Wallet Drawer) */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0 flex-nowrap">
          {/* Global Search Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search safari experiences and guide profiles"
            title="Search Safari Experiences & Guide Profiles (Ctrl+K)"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F3ECE1] border border-[#E4DCCF] hover:border-[#226B3E] text-[#1A1612] text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
            <span className="text-[#5A5248]">Search</span>
            <kbd className="hidden 2xl:inline-block font-mono text-[10px] px-1 py-0.5 rounded bg-[#F3ECE1] text-[#5A5248] border border-[#E4DCCF]">
              ⌘K
            </kbd>
          </button>

          {/* 5-Role Portals Popover Menu */}
          <div className="relative shrink-0" ref={portalMenuRef}>
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
              <span className="hidden 2xl:inline text-[10px] uppercase opacity-80">
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
          <div className="relative shrink-0" ref={langMenuRef}>
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
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E4DCCF] space-y-2">
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
                        >
                          {l.sampleCity} ({l.shortLabel})
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Unified Wallet Dropdown / Drawer (Nests Currency Selector UGX, USD, EUR, GBP + Balance + Payment Methods + Transaction History) */}
          <div className="relative shrink-0" ref={walletDrawerRef}>
            <button
              type="button"
              onClick={() => setWalletDrawerOpen((prev) => !prev)}
              aria-expanded={walletDrawerOpen}
              title="Open Safari Wallet, Currency Switcher (UGX/USD/EUR/GBP), Payment Methods & Transactions"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive('/wallet') || walletDrawerOpen
                  ? 'bg-[#144225] text-white border-[#144225]'
                  : 'bg-white hover:bg-[#F3ECE1] text-[#1A1612] border-[#E4DCCF]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
              <span className="tabular-nums font-bold">
                {formatPrice(availableBalanceUSD, currency)}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#226B3E]/15 text-[#226B3E] text-[10px] font-bold">
                {currency}
              </span>
              <ChevronDown className="w-3 h-3 opacity-75 shrink-0" />
            </button>

            {walletDrawerOpen && (
              <div className="absolute right-0 mt-2.5 w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-[#E4DCCF] rounded-2xl shadow-2xl p-4 space-y-4 z-50">
                {/* 1. Wallet Balance & Escrow Summary Header */}
                <div className="bg-[#144225] text-white rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] font-bold">
                      Enganda Safari Wallet &amp; UWA Escrow
                    </span>
                    <Link
                      to="/wallet"
                      onClick={() => setWalletDrawerOpen(false)}
                      className="font-mono text-[10px] text-white hover:text-[#D99B26] underline"
                    >
                      Full Wallet →
                    </Link>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#E4DCCF] uppercase">
                      Total Available Purchasing Power ({currency})
                    </div>
                    <div className="font-mono text-2xl font-bold text-white tabular-nums">
                      {formatPrice(availableBalanceUSD, currency)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/15 font-mono text-[10px]">
                    <div>
                      <span className="block text-[#D6CEC2]">Cash Balance</span>
                      <strong className="text-white">
                        {formatPrice(availableBalanceUSD, currency)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[#D6CEC2]">UWA Escrow</span>
                      <strong className="text-[#D99B26]">
                        {formatPrice(escrowBalanceUSD, currency)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[#D6CEC2]">Rewards</span>
                      <strong className="text-emerald-300">
                        {formatPrice(rewardCreditsUSD, currency)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Nested Currency Selector (UGX, USD, EUR, GBP) inside Wallet Drawer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                      Wallet &amp; Site Currency (UGX • USD • EUR • GBP)
                    </span>
                    <button
                      type="button"
                      onClick={() => refreshExchangeRates()}
                      disabled={isRefreshingRates}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1A1612] border border-[#E4DCCF] font-mono text-[10px] cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-2.5 h-2.5 text-[#226B3E] ${
                          isRefreshingRates ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {isRefreshingRates
                          ? 'Syncing'
                          : ratesSource === 'live_api'
                          ? 'Live FX'
                          : 'Entebbe FX'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {CURRENCIES.map((cur) => {
                      const active = currency === cur;
                      const info = CURRENCY_RATES[cur];
                      const liveRate = exchangeRates[cur] ?? info.rate;
                      return (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setCurrency(cur)}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                            active
                              ? 'bg-[#1A1612] text-white border-[#1A1612] shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-mono font-bold flex items-center gap-1">
                              <span>{cur}</span>
                              <span
                                className={`text-[10px] font-normal truncate ${
                                  active ? 'text-[#D99B26]' : 'text-[#5A5248]'
                                }`}
                              >
                                {info.symbol}
                              </span>
                            </div>
                            <div
                              className={`text-[9px] font-mono tabular-nums truncate ${
                                active ? 'text-[#E4DCCF]' : 'text-[#5A5248]'
                              }`}
                            >
                              {cur === 'USD'
                                ? '1 USD = $1.00'
                                : cur === 'UGX'
                                ? `1 USD = ${Math.round(liveRate).toLocaleString()} UGX`
                                : `1 USD = ${info.symbol}${liveRate.toFixed(3)}`}
                            </div>
                          </div>
                          {active && (
                            <Check className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Linked Payment Methods inside Wallet Drawer */}
                <div className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-bold">
                    <span>Active Settlement Methods (Relworx &amp; Cards)</span>
                    <span>3 Linked</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      {
                        id: 'pm-relworx-momo',
                        type: 'mobile_money',
                        label: 'Relworx MTN & Airtel Mobile Money',
                        detail: 'Instant UGX / USD Settlement',
                        isDefault: true,
                      },
                      {
                        id: 'pm-card-visa',
                        type: 'card',
                        label: 'Visa / Mastercard 3DS Escrow',
                        detail: 'Multi-Currency Card Rail',
                        isDefault: false,
                      },
                      {
                        id: 'pm-bank-ecobank',
                        type: 'bank',
                        label: 'Ecobank & FINCA Uganda Wire',
                        detail: 'UWA Permit Escrow Settlement',
                        isDefault: false,
                      },
                    ].map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {m.type === 'mobile_money' ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#C85A28] shrink-0" />
                          ) : m.type === 'card' ? (
                            <CreditCard className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
                          ) : (
                            <Landmark className="w-3.5 h-3.5 text-[#1A1612] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1A1612] text-[11px] truncate">
                              {m.label}
                            </div>
                            <div className="font-mono text-[10px] text-[#5A5248] truncate">
                              {m.detail}
                            </div>
                          </div>
                        </div>
                        {m.isDefault && (
                          <span className="px-1.5 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E] font-mono text-[9px] font-bold shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Recent Transaction History inside Wallet Drawer */}
                <div className="space-y-1.5 pt-2 border-t border-[#E4DCCF]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-bold">
                    <span className="inline-flex items-center gap-1">
                      <History className="w-3 h-3 text-[#226B3E]" />
                      <span>Recent Wallet Ledger</span>
                    </span>
                    <span className="text-[9px] text-[#5A5248]">
                      Updated{' '}
                      {new Date(ratesUpdatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {transactions.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] text-[11px]"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1A1612] truncate">
                            {tx.title}
                          </div>
                          <div className="font-mono text-[9px] text-[#5A5248]">
                            {tx.referenceCode} • {tx.paymentRail}
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold shrink-0 tabular-nums ${
                            tx.direction === 'credit'
                              ? 'text-[#226B3E]'
                              : 'text-[#1A1612]'
                          }`}
                        >
                          {tx.direction === 'credit' ? '+' : '-'}
                          {formatPrice(tx.amountUSD, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Open Full Safari Wallet & Top Up Button */}
                <Link
                  to="/wallet"
                  onClick={() => setWalletDrawerOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-bold transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>Open Safari Wallet, Top-Up &amp; Escrow Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/trip-planner"
            className="inline-flex items-center gap-1.5 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <span>{t.nav.planMySafari}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {/* Mobile & Tablet Bar (< lg) */}
        <div className="flex items-center gap-1.5 lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search safari experiences and guides"
            className="inline-flex items-center gap-1 bg-white hover:bg-[#F3ECE1] border border-[#E4DCCF] text-[#1A1612] text-xs font-medium rounded-md px-2.5 py-1.5 whitespace-nowrap cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
          </button>

          <Link
            to="/wallet"
            className="inline-flex items-center gap-1 bg-[#144225] text-white text-xs font-mono font-semibold rounded-md px-2.5 py-1.5 whitespace-nowrap"
          >
            <Wallet className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
            <span>{currency}</span>
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
          {/* Mobile Wallet & Nested Currency Card */}
          <div className="bg-white border border-[#E4DCCF] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                  Safari Wallet &amp; Currency
                </span>
                <span className="font-mono text-lg font-bold text-[#1A1612]">
                  {formatPrice(availableBalanceUSD, currency)}
                </span>
              </div>
              <Link
                to="/wallet"
                className="px-3 py-1.5 rounded-md bg-[#226B3E] text-white font-mono text-xs font-bold"
              >
                Open Wallet
              </Link>
            </div>

            <div className="pt-2 border-t border-[#E4DCCF]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5A5248] mb-1.5">
                <span>Wallet Currency ({formatExchangeRateSummary(currency)})</span>
                <button
                  type="button"
                  onClick={() => refreshExchangeRates()}
                  className="inline-flex items-center gap-1 text-[#226B3E] font-semibold"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRefreshingRates ? 'animate-spin' : ''}`}
                  />
                  <span>Refresh</span>
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
                        ? 'bg-[#1A1612] text-[#D99B26] border-[#1A1612]'
                        : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF]'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Service Providers Sub-Menu in Mobile Drawer */}
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
              Service Providers
            </div>
            <div className="grid grid-cols-2 gap-2">
              {serviceProviderItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold border bg-white text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]"
                  >
                    <IconComp className="w-3.5 h-3.5 text-[#226B3E] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Primary + Explore & Impact Links */}
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-bold">
              Marketplace Navigation
            </div>
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 rounded-md text-xs font-semibold border ${
                    isActive(link.path)
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                      : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                  }`}
                >
                  {link.shortLabel}
                </Link>
              ))}
              {exploreImpactItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2.5 rounded-md text-xs font-semibold border ${
                    isActive(item.path)
                      ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                      : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Language Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E4DCCF]">
            <div className="font-mono text-[10px] uppercase text-[#5A5248] font-bold">
              {t.geoBanner.selectLanguagePrompt}
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
          </div>

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

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
};
