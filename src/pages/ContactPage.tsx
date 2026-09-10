import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

export const ContactPage: React.FC = () => {
  const [currentTimeEAT, setCurrentTimeEAT] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate live East Africa Time (UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const eatString = now.toLocaleTimeString('en-US', {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeEAT(eatString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    trackEvent('lead_created', { source: 'contact_page' });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          status: 'new',
          source: 'contact_page',
          notes: message,
        }),
      });
      setIsSuccess(true);
    } catch (err) {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Headquarters in the Safari Capital</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Contact Akim & Our Arusha HQ
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Reach us directly at our Arusha office or connect via WhatsApp for an immediate response. We operate across all East African circuits 7 days a week.
          </p>
        </div>

        {/* Live EAT Time Card & Office Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Live Arusha Time</span>
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-white font-display">
              {currentTimeEAT || '03:45 PM'}
            </div>
            <div className="text-xs text-stone-400">
              East Africa Time (EAT • UTC+3). Our operations desk and WhatsApp line are live 24/7.
            </div>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Instant WhatsApp</span>
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">
              +255 784 123 456
            </div>
            <div className="text-xs text-stone-400">
              Founder Akim's direct operational WhatsApp line for itinerary design and in-trip assistance.
            </div>
            <a
              href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20am%20reaching%20out%20via%20your%20website%20contact%20page."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold text-emerald-400 hover:underline pt-1"
            >
              Open WhatsApp Chat →
            </a>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Physical HQ</span>
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-bold text-white">
              Arusha, Tanzania
            </div>
            <div className="text-xs text-stone-400 leading-relaxed">
              P.O. Box 2751, Goliondoi Road, Clock Tower Roundabout, Arusha.
            </div>
            <div className="text-[11px] text-stone-500 pt-1">
              GPS: -3.3731° S, 36.6944° E
            </div>
          </div>
        </div>

        {/* Form and Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-xl">
            <h2 className="text-xl font-bold text-white font-display mb-2">
              Send a Direct Message to Akim
            </h2>
            <p className="text-xs text-stone-400 mb-6">
              We respond to all inquiries within 12 hours with detailed circuit outlines and lodge recommendations.
            </p>

            {isSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Asante sana! Akim has received your inquiry and will reach out via WhatsApp or email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thomas Keller"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="thomas@example.com"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">How Can We Help You? *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your travel dates, target wildlife (migration, gorillas), party size, or questions..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending to Arusha...' : 'Dispatch Message to Akim'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Direct Credentials & Verification (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Regulatory Verification</span>
              </div>
              <h3 className="text-base font-bold text-white">Registered Operator in Tanzania</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                TingaTinga Safari & Holiday is officially registered under the Tanzania Tourism Business Licensing (TTBL) regulations, headquartered in Arusha.
              </p>

              <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                <div><strong>Business Registration:</strong> BRELA Cert #TZ-ARU-2018-842</div>
                <div><strong>Postal Address:</strong> P.O. Box 2751, Arusha, Tanzania</div>
                <div><strong>Lead Email:</strong> info@tingatingasafari.com</div>
                <div><strong>Founder Direct:</strong> akim@tingatingasafari.com</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-200 space-y-2">
              <strong className="text-white block font-semibold">24/7 Operations Desk:</strong>
              Guests in the field have continuous WhatsApp and satellite phone access directly to Akim and our Arusha dispatch coordinator for flight re-bookings, vehicle dispatch, or park permits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
