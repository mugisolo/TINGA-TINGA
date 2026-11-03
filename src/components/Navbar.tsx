import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass, ArrowUpRight, Wallet } from 'lucide-react';
import { Currency } from '../types';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../lib/currency';
import { SOCIAL_LINKS } from '../data/seedData';
import { SocialIcon, SocialStrip } from './SocialLinks';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'UGX'];

const NAV_LINKS = [
  { label: 'Guides & Partners', path: '/guides' },
  { label: 'Experiences', path: '/experiences' },
  { label: 'Destinations', path: '/destinations' },
  { label: 'How We Work', path: '/how-we-work' },
  { label: 'Journal', path: '/journal' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const { currency, setCurrency } = useInquiry();
  const { availableBalanceUSD } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E4DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Clean Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[#1A1612] hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Compass className="w-6 h-6 text-[#226B3E]" />
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1612]">
            Enganda Safaris
          </span>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-5" aria-label="Primary Navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors py-1 border-b-2 whitespace-nowrap ${
                isActive(link.path)
                  ? 'text-[#226B3E] border-[#C85A28] font-semibold'
                  : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls: Social Icons + Currency Selector + Safari Wallet + Primary CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="hidden 2xl:flex items-center gap-1 pr-1 border-r border-[#E4DCCF]">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Enganda Safaris on ${item.label}`}
                title={`${item.label} (${item.handle})`}
                className="p-2 rounded-md text-[#5A5248] hover:text-[#226B3E] hover:bg-[#F3ECE1] transition-colors"
              >
                <SocialIcon platform={item.platform} className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          <label htmlFor="currency-select" className="sr-only">
            Display Currency
          </label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-[#F3ECE1] border border-[#E4DCCF] text-[#1A1612] text-xs font-mono font-medium rounded-md px-2.5 py-2 focus:outline-none focus:border-[#226B3E] cursor-pointer"
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>

          <Link
            to="/wallet"
            title="Open Safari Wallet & UWA Permit Escrow"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
              isActive('/wallet')
                ? 'bg-[#144225] text-white border-[#144225]'
                : 'bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border-[#E4DCCF]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-[#226B3E]" />
            <span className="tabular-nums">{formatPrice(availableBalanceUSD, currency)}</span>
          </Link>

          <Link
            to="/trip-planner"
            className="inline-flex items-center gap-1.5 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-sm font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
          >
            <span>Plan My Safari</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 xl:hidden">
          <Link
            to="/wallet"
            className="md:hidden inline-flex items-center gap-1 bg-[#F3ECE1] border border-[#E4DCCF] text-[#1A1612] text-xs font-mono font-semibold rounded-md px-2.5 py-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-[#226B3E]" />
            <span className="tabular-nums">{formatPrice(availableBalanceUSD, currency)}</span>
          </Link>

          <select
            aria-label="Select Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="md:hidden bg-[#F3ECE1] border border-[#E4DCCF] text-[#1A1612] text-xs font-mono font-medium rounded-md px-2 py-1.5"
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-md border border-[#E4DCCF] text-[#1A1612] hover:bg-[#F3ECE1] transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-[#E4DCCF] bg-[#FAF7F2] px-4 pt-4 pb-6 space-y-4 shadow-lg">
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
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
              <span>Safari Wallet</span>
              <span className="font-mono text-xs font-bold tabular-nums">
                {formatPrice(availableBalanceUSD, currency)}
              </span>
            </Link>
            <Link
              to="/reviews"
              className="px-3 py-2.5 rounded-md text-sm font-medium border bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF]"
            >
              Guest Reviews
            </Link>
            <Link
              to="/responsible-travel"
              className="px-3 py-2.5 rounded-md text-sm font-medium border bg-[#F3ECE1]/60 text-[#1A1612] border-[#E4DCCF]"
            >
              Responsible Travel
            </Link>
          </nav>

          <div className="pt-2 border-t border-[#E4DCCF] space-y-3">
            <Link
              to="/trip-planner"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white text-sm font-semibold px-4 py-3 rounded-md transition-colors"
            >
              <span>Plan My Safari with a Ugandan Guide</span>
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
