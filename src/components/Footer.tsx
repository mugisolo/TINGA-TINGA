import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, ShieldCheck, Heart, ExternalLink, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Upper Footer: Value pillars and transparency manifesto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-stone-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">Named Ground Partners</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                We reject hidden subcontracting. You are driven by vetted, AUTO & KATO-accredited local ground partners with published license numbers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">Official Permit Guarantee</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                UWA & RDB gorilla permits secured immediately upon 30% deposit. Genuine official government receipts provided before final payment.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-500">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">Fair Guide Wages</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                100% fair compensation policy. Our naturalist guides and park porters receive top-tier daily living wages and comprehensive AMREF cover.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-500">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">One Accountable Contact</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Founder Akim is on WhatsApp 24/7. No call centers, no ticket queues—just personal safari craftmanship from Arusha.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-wider font-display text-white">
                GANDA <span className="text-amber-500 font-normal">SAFARIS</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Ganda Safaris & Holiday is an independent boutique safari operator headquartered in Arusha, Tanzania. We architect tailor-made wildlife safaris, gorilla tracking expeditions, and seamless cross-border circuits across Tanzania, Kenya, Uganda, and Rwanda.
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>P.O. Box 2751, Goliondoi Rd / Clock Tower, Arusha, Tanzania</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+255 784 123 456 (24/7 Operations & WhatsApp)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>info@gandasafaris.com | akim@gandasafaris.com</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2">Team Languages</div>
              <div className="flex flex-wrap gap-1.5 text-xs text-stone-300">
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">English</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">Français</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">Deutsch</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">Español</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">Italiano</span>
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">Kiswahili</span>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-stone-100 font-semibold text-sm mb-4">Destinations</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safaris/tanzania" className="hover:text-amber-400 transition-colors">
                  Tanzania Safaris
                </Link>
              </li>
              <li>
                <Link to="/safaris/uganda" className="hover:text-amber-400 transition-colors">
                  Uganda Gorilla & Chimp Safaris
                </Link>
              </li>
              <li>
                <Link to="/safaris/rwanda" className="hover:text-amber-400 transition-colors">
                  Rwanda Volcanoes NP
                </Link>
              </li>
              <li>
                <Link to="/safaris/kenya" className="hover:text-amber-400 transition-colors">
                  Kenya Maasai Mara Safaris
                </Link>
              </li>
              <li>
                <Link to="/#circuits" className="hover:text-amber-400 transition-colors">
                  Cross-Border Circuits
                </Link>
              </li>
              <li>
                <Link to="/permits" className="hover:text-amber-400 transition-colors">
                  Gorilla Permit Facts ($800 / $1500)
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Transparency */}
          <div>
            <h4 className="text-stone-100 font-semibold text-sm mb-4">Transparency</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/how-we-work" className="hover:text-amber-400 transition-colors">
                  How We Work & Operating Model
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-amber-400 transition-colors">
                  Accredited Ground Partners Directory
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-amber-400 transition-colors">
                  Our Team & Guides
                </Link>
              </li>
              <li>
                <Link to="/responsible-travel" className="hover:text-amber-400 transition-colors">
                  Fair Wages & Responsible Travel
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-amber-400 transition-colors">
                  Guest Reviews & Testimonials
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-amber-400 transition-colors">
                  Safari Field Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Accreditations & Payments */}
          <div>
            <h4 className="text-stone-100 font-semibold text-sm mb-4">Accreditation & Safety</h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-[11px] leading-relaxed">
                <strong className="text-stone-200 block">Licensing Standards:</strong>
                TATO Licensed (TZ), AUTO Vetted Ground Affiliate (UG), KATO Bonded Partner Network (KE).
              </div>
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-[11px] leading-relaxed">
                <strong className="text-stone-200 block">Medical Safety:</strong>
                All safari guests covered by AMREF Flying Doctors 24/7 air emergency evacuation.
              </div>
              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Secure Payments</div>
                <div className="flex flex-wrap gap-2 text-[10px] text-stone-300">
                  <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 font-medium">DPO Group (Africa)</span>
                  <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 font-medium">Stripe</span>
                  <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 font-medium">PayPal</span>
                  <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 font-medium">Visa / Mastercard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Ganda Safaris and Holiday. All rights reserved. Registered in Arusha, Tanzania.
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link to="/how-we-work" className="hover:text-stone-300">Terms & Booking Charter</Link>
            <span>•</span>
            <Link to="/responsible-travel" className="hover:text-stone-300">Ethics Charter</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-stone-300">Arusha Head Office</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-amber-500">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
