import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileCheck,
  Award,
  Plane,
  ArrowUpRight,
  Globe,
} from 'lucide-react';
import {
  BRAND_NAME,
  HQ_ADDRESS,
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  getWhatsAppUrl,
} from '../data/seedData';
import { SocialLinks } from './SocialLinks';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';

export const Footer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-[#226B3E] text-[#FAF7F2] border-t border-[#2E8550] print:hidden">
      {/* Accreditation & Trust Strip */}
      <div className="border-b border-[#2E8550] bg-[#1B5632]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#FAF7F2]">
                {t.footer.utbTitle}
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-0.5 leading-relaxed">
                {t.footer.utbDesc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#FAF7F2]">
                {t.footer.autoTitle}
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-0.5 leading-relaxed">
                {t.footer.autoDesc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#FAF7F2]">
                {t.footer.uwaTitle}
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-0.5 leading-relaxed">
                {t.footer.uwaDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Column 1-2: Brand & Entebbe Head Office */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#D99B26]" />
              <span className="font-serif text-xl font-bold tracking-tight text-[#FAF7F2]">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="font-serif italic text-base text-[#E4DCCF]">
              “{t.home.heroTitle}”
            </p>
            <p className="text-xs sm:text-sm text-[#D6CEC2] leading-relaxed max-w-md">
              {t.footer.brandBio}
            </p>

            <div className="pt-1 space-y-2 text-sm text-[#E4DCCF]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-[#FAF7F2]">
                    {t.footer.headOfficeLabel}
                  </div>
                  <div className="text-xs text-[#D6CEC2]">{HQ_ADDRESS}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Plane className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <span className="text-xs text-[#D99B26] font-medium">
                  {t.footer.airportPickupLabel}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs hover:text-[#D99B26] transition-colors"
                >
                  WhatsApp: {WHATSAPP_NUMBER}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-mono text-xs hover:text-[#D99B26] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#D99B26] font-semibold">
                {t.footer.connectSocials}
              </div>
              <SocialLinks variant="footer-dark" showLabels={true} />
            </div>
          </div>

          {/* Column 3: Our Guides, Partners & Safaris */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              {t.footer.colGuidesPartners}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CEC2]">
              <li>
                <Link
                  to="/guides"
                  className="hover:text-white transition-colors font-semibold text-[#FAF7F2]"
                >
                  {t.home.ctaMeetGuides}
                </Link>
              </li>
              <li>
                <Link
                  to="/guides?view=partners"
                  className="hover:text-white transition-colors"
                >
                  Partner Hotels, Motels, Camp Sites & Lodges
                </Link>
              </li>
              <li>
                <Link
                  to="/wallet"
                  className="hover:text-white transition-colors text-[#D99B26] font-medium"
                >
                  {t.nav.safariWallet} & UWA Permit Escrow
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences"
                  className="hover:text-white transition-colors"
                >
                  {t.nav.experiences}
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/3-day-bwindi-gorilla-trek"
                  className="hover:text-white transition-colors"
                >
                  3-Day Bwindi Gorilla Trek
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/5-day-gorillas-and-kibale-chimps"
                  className="hover:text-white transition-colors"
                >
                  5-Day Gorillas & Kibale Chimps
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/7-day-best-of-uganda"
                  className="hover:text-white transition-colors"
                >
                  7-Day Best of Uganda
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/10-day-uganda-grand-circuit-kidepo"
                  className="hover:text-white transition-colors"
                >
                  10-Day Grand Circuit & Kidepo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Uganda Regions */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              {t.footer.colRegions}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CEC2]">
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Bwindi & Mgahinga
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Kibale Forest
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Queen Elizabeth NP
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Murchison Falls NP
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Kidepo Valley NP
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Rwenzori Mountains & Lake Bunyonyi
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-white transition-colors"
                >
                  Entebbe, Mabamba & Jinja
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Planning & Role Portals */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              {t.footer.colPlanning} & Portals
            </h4>
            <ul className="space-y-2 text-sm text-[#D6CEC2]">
              <li>
                <Link
                  to="/trip-planner"
                  className="hover:text-white transition-colors font-semibold text-[#FAF7F2] inline-flex items-center gap-1"
                >
                  <span>{t.nav.tripPlanner}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D99B26]" />
                </Link>
              </li>
              <li>
                <Link
                  to="/safari-essentials"
                  className="hover:text-white transition-colors text-[#D99B26] font-medium"
                >
                  Safari Essentials Checklist
                </Link>
              </li>
              <li>
                <Link
                  to="/portals/client"
                  className="hover:text-white transition-colors font-medium text-[#FAF7F2]"
                >
                  Client Portal (Wallet & Escrow)
                </Link>
              </li>
              <li>
                <Link
                  to="/portals/specialists"
                  className="hover:text-white transition-colors"
                >
                  Specialists & Field Guides Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/portals/partner"
                  className="hover:text-white transition-colors"
                >
                  Partner Lodges & Camps Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/portals/staff"
                  className="hover:text-white transition-colors"
                >
                  Staff (Entebbe Operations Desk)
                </Link>
              </li>
              <li>
                <Link
                  to="/portals/admin"
                  className="hover:text-white transition-colors"
                >
                  Admin Governance Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/how-we-work"
                  className="hover:text-white transition-colors"
                >
                  {t.nav.howWeWork}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Language Bar */}
      <div className="border-t border-[#2E8550] bg-[#144225] pb-14 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs text-[#9E9385]">
          <div>
            © {new Date().getFullYear()} {BRAND_NAME} — Mugwanya Road, Bugonga,
            Entebbe, Uganda. {t.footer.rightsReserved}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 bg-[#1B5632] border border-white/10 rounded px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-[#D99B26]" />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors cursor-pointer ${
                    language === lang.code
                      ? 'bg-[#C85A28] text-white font-bold'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  {lang.shortLabel}
                </button>
              ))}
            </div>
            <span>•</span>
            <span className="font-mono text-[#D6CEC2]">UTB Licensed</span>
            <span>•</span>
            <span className="font-mono text-[#D6CEC2]">AUTO Member</span>
            <span>•</span>
            <span className="font-mono text-[#D99B26]">
              Official UWA Permit Receipts
            </span>
            <span>•</span>
            <SocialLinks variant="icon-only" />
          </div>
        </div>
      </div>
    </footer>
  );
};
