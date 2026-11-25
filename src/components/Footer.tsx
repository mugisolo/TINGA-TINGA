import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  ShieldCheck,
  FileCheck,
  Award,
  Plane,
  Globe,
  Settings,
} from 'lucide-react';
import {
  BRAND_NAME,
  HQ_ADDRESS,
  CONTACT_EMAIL,
} from '../data/seedData';
import { SocialLinks } from './SocialLinks';
import { useLanguage } from '../context/LanguageContext';
import { useInquiry } from '../context/InquiryContext';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';

export const Footer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { activeFooterLogos, poweredByText } = useInquiry();

  return (
    <footer className="bg-[#226B3E] text-[#FAF7F2] border-t border-[#2E8550] print:hidden">
      {/* Accreditation & Trust Strip */}
      <div className="border-b border-[#2E8550] bg-[#1B5632]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Main Footer Section: Brand & Entebbe Head Office */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Brand & Bio */}
          <div className="space-y-3 max-w-xl">
            <Link
              to="/"
              className="inline-flex items-center gap-3 group"
              aria-label="Enganda Safaris — Your Gateway to the Wild"
            >
              <div className="bg-[#1B191A] px-3 py-1.5 rounded-lg border border-[#D99B26]/50 group-hover:border-[#D99B26] shadow-sm inline-flex items-center">
                <img
                  src="/assets/aistudio/enganda-logo-header.png"
                  alt="Enganda Safaris — Your Gateway to the Wild"
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="font-serif italic text-base text-[#E4DCCF]">
              “{t.home.heroTitle}”
            </p>
            <p className="text-xs sm:text-sm text-[#D6CEC2] leading-relaxed">
              {t.footer.brandBio}
            </p>
          </div>

          {/* Right: Entebbe Head Office & Social Channels */}
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-[#E4DCCF]">
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
                <Mail className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-mono text-xs hover:text-[#D99B26] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#D99B26] font-semibold">
                {t.footer.connectSocials}
              </div>
              <SocialLinks variant="footer-dark" showLabels={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Official Partner, Conservation & Banking Logos Strip (Resized to fit accurately + Admin Editable) */}
      <div className="border-t border-[#2E8550] bg-[#184D2B]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono tracking-wide text-[#FAF7F2]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D99B26] shrink-0" />
              <span className="font-semibold text-[#D99B26]">
                {poweredByText || 'Powered by WildLife, RONSOL, RELWORX, FINCA & ECO Bank, SPYDA MC'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#D6CEC2] hidden md:inline">
                Official Conservation, Banking &amp; Strategic Infrastructure Partners
              </span>
              <Link
                to="/portals/admin?section=footer-logos"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#226B3E] hover:bg-[#2E8550] text-[#FAF7F2] border border-[#34945A] font-mono text-[10px] font-semibold transition-colors shrink-0"
              >
                <Settings className="w-3 h-3 text-[#D99B26]" />
                <span>Admin: Update Footer Logos</span>
              </Link>
            </div>
          </div>

          {/* Partner Logos Grid — Uniformly Sized White Badge Frames for Accurate Fit */}
          {activeFooterLogos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {activeFooterLogos.map((partner) => {
                const badgeContent = (
                  <div className="bg-white rounded-md px-2.5 py-2 h-14 sm:h-16 flex items-center gap-2.5 border border-[#E4DCCF]/60 shadow-xs hover:border-[#D99B26] transition-all min-w-0">
                    <div className="w-14 sm:w-16 h-10 sm:h-11 flex items-center justify-center shrink-0 overflow-hidden bg-white rounded-xs p-0.5">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-9 sm:max-h-10 max-w-full w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] font-bold text-[#1A1612] truncate leading-tight">
                        {partner.name}
                      </div>
                      <div className="text-[10px] text-[#5A5248] line-clamp-2 leading-tight mt-0.5">
                        {partner.subtitle}
                      </div>
                    </div>
                  </div>
                );

                return partner.websiteUrl ? (
                  <a
                    key={partner.id}
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${partner.name} — ${partner.subtitle}`}
                    className="block"
                  >
                    {badgeContent}
                  </a>
                ) : (
                  <div
                    key={partner.id}
                    title={`${partner.name} — ${partner.subtitle}`}
                    className="block"
                  >
                    {badgeContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal & Language Bar */}
      <div className="border-t border-[#2E8550] bg-[#144225] pb-14 sm:pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs text-[#9E9385]">
          <div className="text-center lg:text-left space-y-1">
            <div>
              © {new Date().getFullYear()} {BRAND_NAME} — Mugwanya Road, Bugonga,
              Entebbe, Uganda. {t.footer.rightsReserved}
            </div>
            <div className="font-mono text-[11px] text-[#D99B26]">
              Powered by WildLife, RONSOL, RELWORX, FINCA &amp; ECO Bank, SPYDA MC
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
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

