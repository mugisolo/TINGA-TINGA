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
} from 'lucide-react';
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  HQ_ADDRESS,
  HQ_AIRPORT_NOTE,
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  PERMIT_RECEIPT_GUARANTEE,
  getWhatsAppUrl,
} from '../data/seedData';
import { SocialLinks } from './SocialLinks';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#226B3E] text-[#FAF7F2] border-t border-[#2E8550]">
      {/* Accreditation & Trust Strip */}
      <div className="border-b border-[#2E8550] bg-[#1B5632]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Uganda Tourism Board (UTB) Registered
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                Licensed Ugandan safari operator coordinated from our Entebbe head office with verified USAGA & UWA guide credentials.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Association of Uganda Tour Operators (AUTO)
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                Committed to fair living wages for Ugandan safari guides and mountain porters, deposit protection, and ethical park operations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-md bg-[#226B3E] border border-[#34945A] text-[#D99B26] flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Official UWA Permit Receipts Provided
              </h3>
              <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                {PERMIT_RECEIPT_GUARANTEE} Every gorilla and chimpanzee permit is booked directly with Uganda Wildlife Authority.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1-2: Brand & Entebbe Head Office */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-[#D99B26]" />
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF7F2]">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="font-serif italic text-lg text-[#E4DCCF]">
              “{BRAND_TAGLINE}”
            </p>
            <p className="text-sm text-[#D6CEC2] leading-relaxed max-w-md">
              A curated collective of professional, licensed local Ugandan safari guides spread across every major region of Uganda, coordinated from our head office in Entebbe.
            </p>

            <div className="pt-2 space-y-2.5 text-sm text-[#E4DCCF]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-[#FAF7F2]">Entebbe Head Office</div>
                  <div className="text-xs text-[#D6CEC2]">{HQ_ADDRESS}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Plane className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <span className="text-xs text-[#D99B26] font-medium">
                  {HQ_AIRPORT_NOTE} — Airport pickup available
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
                Connect on X, Instagram & LinkedIn
              </div>
              <SocialLinks variant="footer-dark" showLabels={true} />
            </div>
          </div>

          {/* Column 3: Our Guides, Partners & Safaris */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              Guides, Partners & Safaris
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CEC2]">
              <li>
                <Link to="/guides" className="hover:text-white transition-colors font-semibold text-[#FAF7F2]">
                  Meet Our Guides and Partners
                </Link>
              </li>
              <li>
                <Link to="/guides?view=partners" className="hover:text-white transition-colors">
                  Partner Hotels, Motels, Camp Sites & Lodges
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-white transition-colors text-[#D99B26] font-medium">
                  Safari Wallet & UWA Permit Escrow
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-white transition-colors">
                  All Uganda Experiences
                </Link>
              </li>
              <li>
                <Link to="/experiences/3-day-bwindi-gorilla-trek" className="hover:text-white transition-colors">
                  3-Day Bwindi Gorilla Trek
                </Link>
              </li>
              <li>
                <Link to="/experiences/5-day-gorillas-and-kibale-chimps" className="hover:text-white transition-colors">
                  5-Day Gorillas & Kibale Chimps
                </Link>
              </li>
              <li>
                <Link to="/experiences/7-day-best-of-uganda" className="hover:text-white transition-colors">
                  7-Day Best of Uganda
                </Link>
              </li>
              <li>
                <Link to="/experiences/10-day-uganda-grand-circuit-kidepo" className="hover:text-white transition-colors">
                  10-Day Grand Circuit & Kidepo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Uganda Regions */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              Uganda Regions
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CEC2]">
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Bwindi & Mgahinga
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Kibale Forest
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Queen Elizabeth NP
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Murchison Falls NP
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Kidepo Valley NP
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Rwenzori Mountains & Lake Bunyonyi
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  Entebbe, Mabamba & Jinja
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Planning & Trust */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#D99B26] font-semibold mb-4">
              Planning & Transparency
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6CEC2]">
              <li>
                <Link to="/trip-planner" className="hover:text-white transition-colors font-semibold text-[#FAF7F2] inline-flex items-center gap-1">
                  <span>Interactive Trip Planner</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D99B26]" />
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" className="hover:text-white transition-colors">
                  How Our Guide Collective Works
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">
                  Guest Stories & Guide Reviews
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-white transition-colors">
                  Field Notes Journal
                </Link>
              </li>
              <li>
                <Link to="/responsible-travel" className="hover:text-white transition-colors">
                  Responsible Travel Charter
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Enganda Safaris
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Entebbe Office
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#2E8550] bg-[#144225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E9385]">
          <div>
            © {new Date().getFullYear()} {BRAND_NAME} — Mugwanya Road, Bugonga, Entebbe, Uganda. All safaris operated exclusively within Uganda.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[#D6CEC2]">UTB Licensed</span>
            <span>•</span>
            <span className="font-mono text-[#D6CEC2]">AUTO Member</span>
            <span>•</span>
            <span className="font-mono text-[#D99B26]">Official UWA Permit Receipts</span>
            <span>•</span>
            <SocialLinks variant="icon-only" />
          </div>
        </div>
      </div>
    </footer>
  );
};
