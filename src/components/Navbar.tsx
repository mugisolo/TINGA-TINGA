import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, MessageCircle, Menu, X, Globe, DollarSign, ShieldCheck, ChevronDown } from 'lucide-react';
import { Currency, LanguageCode } from '../types';
import { CURRENCY_RATES } from '../lib/currency';
import { LANGUAGES, getTranslation } from '../lib/i18n';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (l: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  currentLanguage,
  onLanguageChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
  const location = useLocation();

  const t = (key: string) => getTranslation(currentLanguage, key);

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_how_we_work'), path: '/how-we-work' },
    { label: t('nav_partners'), path: '/partners' },
    { label: t('nav_permits'), path: '/permits' },
    { label: t('nav_team'), path: '/team' },
    { label: t('nav_reviews'), path: '/reviews' },
    { label: t('nav_journal'), path: '/journal' },
    { label: t('nav_contact'), path: '/contact' },
  ];

  const destinations = [
    { name: 'Tanzania Safaris', path: '/safaris/tanzania', desc: 'Serengeti, Ngorongoro, Tarangire & Zanzibar' },
    { name: 'Uganda Primates', path: '/safaris/uganda', desc: 'Bwindi Mountain Gorillas & Kibale Chimps' },
    { name: 'Rwanda Volcanoes', path: '/safaris/rwanda', desc: 'Volcanoes NP & Golden Monkeys' },
    { name: 'Kenya Savannahs', path: '/safaris/kenya', desc: 'Maasai Mara & Amboseli Kilimanjaro Vistas' },
    { name: 'Cross-Border Circuits', path: '/#circuits', desc: 'Serengeti to Bwindi Multi-Country Expeditions' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 text-stone-100 backdrop-blur-md border-b border-stone-800">
      {/* Top micro-bar: Arusha HQ & Trust Guarantee */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 text-xs text-stone-400 bg-stone-950/80 border-b border-stone-800/60">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-300 font-medium">HQ: Arusha, Tanzania (P.O. Box 2751)</span>
          </span>
          <span className="text-stone-500">|</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Named AUTO & KATO Vetted Ground Partners</span>
          </span>
          <span className="text-stone-500">|</span>
          <span className="text-amber-400 font-medium">Gorilla Permit Receipts Before Final Payment</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Currency Switcher */}
          <div className="flex items-center space-x-1 bg-stone-900 px-2 py-0.5 rounded border border-stone-700/60">
            <DollarSign className="w-3 h-3 text-stone-400" />
            {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  currentCurrency === c ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-stone-900 px-2 py-0.5 rounded border border-stone-700/60">
            <Globe className="w-3 h-3 text-stone-400" />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                title={l.name}
                className={`px-1 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  currentLanguage === l.code ? 'bg-stone-700 text-amber-400' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>

          <Link to="/admin" className="text-stone-400 hover:text-amber-400 transition-colors">
            Staff Portal
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-lg shadow-amber-900/40 border border-amber-500/30">
            <Compass className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-wider text-stone-100 font-display flex items-center space-x-1">
              <span>TINGA TINGA</span>
              <span className="text-amber-500 font-normal">SAFARI</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
              Boutique East Africa Architects
            </div>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center space-x-6 text-sm font-medium">
          <div 
            className="relative"
            onMouseEnter={() => setIsDestDropdownOpen(true)}
            onMouseLeave={() => setIsDestDropdownOpen(false)}
          >
            <button className="flex items-center space-x-1 text-stone-300 hover:text-amber-400 py-2 transition-colors">
              <span>{t('nav_safaris')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>
            {isDestDropdownOpen && (
              <div className="absolute top-full left-0 w-72 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {destinations.map((d) => (
                  <Link
                    key={d.path}
                    to={d.path}
                    onClick={() => setIsDestDropdownOpen(false)}
                    className="block p-2.5 rounded-lg hover:bg-stone-800 transition-colors group"
                  >
                    <div className="text-sm font-semibold text-stone-200 group-hover:text-amber-400">
                      {d.name}
                    </div>
                    <div className="text-xs text-stone-400 leading-tight mt-0.5">
                      {d.desc}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors py-1 ${
                location.pathname === link.path
                  ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                  : 'text-stone-300 hover:text-amber-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action CTAs */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20am%20interested%20in%20planning%20an%20East%20African%20safari%20with%20Tinga%20Tinga%20Safari."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-all duration-200 border border-emerald-500/40 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Akim</span>
          </a>

          {/* Primary Trip Planner */}
          <Link
            to="/trip-planner"
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-900/30 hover:shadow-lg hover:shadow-amber-900/40"
          >
            <span>{t('nav_planner')}</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex xl:hidden items-center space-x-2">
          <Link
            to="/trip-planner"
            className="px-3 py-1.5 rounded bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider"
          >
            Plan
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-stone-950 border-b border-stone-800 px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center space-x-1">
              {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    currentCurrency === c ? 'bg-amber-600 text-white' : 'text-stone-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-1.5 py-1 rounded text-xs ${
                    currentLanguage === l.code ? 'bg-stone-700 text-amber-400' : 'text-stone-400'
                  }`}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-amber-500 font-bold px-2 pt-1">Destinations</div>
            {destinations.map((d) => (
              <Link
                key={d.path}
                to={d.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-stone-300 hover:bg-stone-900 text-sm"
              >
                {d.name}
              </Link>
            ))}
          </div>

          <div className="space-y-1 border-t border-stone-800/80 pt-2">
            <div className="text-xs uppercase tracking-wider text-stone-400 font-bold px-2">Navigation</div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm ${
                  location.pathname === link.path ? 'bg-amber-600/20 text-amber-400 font-semibold' : 'text-stone-300 hover:bg-stone-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-stone-400 hover:text-amber-400"
            >
              Admin Dashboard
            </Link>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <a
              href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20am%20interested%20in%20planning%20an%20East%20African%20safari."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-emerald-700 text-white font-semibold text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat directly on WhatsApp</span>
            </a>
            <Link
              to="/trip-planner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-amber-600 text-stone-950 font-bold text-sm"
            >
              <span>Design Your Tailor-Made Safari</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
