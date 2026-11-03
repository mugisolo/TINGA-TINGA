import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Plane,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  HQ_ADDRESS,
  HQ_AIRPORT_NOTE,
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  AVAILABILITY_PROMISE,
  GUIDES,
  SOCIAL_LINKS,
  getWhatsAppUrl,
} from '../data/seedData';
import { ComfortTier } from '../types';
import { useInquiry } from '../context/InquiryContext';
import { SEO } from '../components/SEO';
import { SocialIcon } from '../components/SocialLinks';

export const ContactPage: React.FC = () => {
  const { submitLead } = useInquiry();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [targetDates, setTargetDates] = useState('');
  const [budgetTier, setBudgetTier] = useState<ComfortTier>('luxury');
  const [preferredGuideSlug, setPreferredGuideSlug] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const lead = await submitLead({
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || 'Not provided',
        partySize,
        targetDates: targetDates.trim() || 'Flexible 2026/2027',
        budgetTier,
        interests: ['gorillas'],
        preferredGuideSlug: preferredGuideSlug || undefined,
        notes: notes.trim(),
      });
      setSubmittedLeadId(lead.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16">
      <SEO
        title="Contact Our Entebbe Head Office | Enganda Safaris Uganda"
        description="Visit or message Enganda Safaris at Mugwanya Road, Bugonga, Entebbe, Uganda (next to Rosemary Courts — 5 minutes from Entebbe International Airport)."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="bg-[#226B3E] text-[#FAF7F2] rounded-lg p-8 sm:p-12 border border-[#2E8550]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B5632] border border-[#D99B26]/40 text-xs font-mono text-[#D99B26]">
              <Plane className="w-3.5 h-3.5" />
              <span>Airport Pickup Available — {HQ_AIRPORT_NOTE}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Speak With Our Entebbe Coordination Desk
            </h1>
            <p className="text-sm sm:text-base text-[#D6CEC2] leading-relaxed">
              Whether you know the exact Ugandan guide you want to request or are just starting to explore Bwindi gorilla permit dates, a real coordinator at our Bugonga, Entebbe office replies within 12 hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left 5 Columns: Office Info + Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-5">
              <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
                Entebbe Head Office
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#5A5248]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C85A28] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#1A1612]">Street Address</div>
                    <div>{HQ_ADDRESS}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-[#226B3E] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#1A1612]">Airport Proximity</div>
                    <div className="text-[#2D6A4F] font-medium">
                      Airport pickup available — {HQ_AIRPORT_NOTE}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#1A1612]">WhatsApp Direct Line</div>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#226B3E] hover:underline"
                    >
                      {WHATSAPP_NUMBER}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C85A28] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#1A1612]">Email</div>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="font-mono text-[#226B3E] hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D99B26] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-[#1A1612]">Office Hours (East Africa Time, UTC+3)</div>
                    <div>Monday – Sunday: 07:00 – 21:00 EAT</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2D6A4F] hover:bg-[#23533D] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message Entebbe Desk on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Map Embed */}
            <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F3ECE1] border-b border-[#E4DCCF] text-xs font-mono text-[#1A1612]">
                Map: Mugwanya Road, Bugonga, Entebbe (Next to Rosemary Courts)
              </div>
              <iframe
                title="Map of Mugwanya Road, Bugonga, Entebbe, Uganda"
                src="https://www.openstreetmap.org/export/embed.html?bbox=32.445%2C0.038%2C32.482%2C0.065&layer=mapnik&marker=0.0512%2C32.4637"
                className="w-full h-64 border-0"
                loading="lazy"
              />
            </div>

            {/* Social Connections Card (X, Instagram, LinkedIn) */}
            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 space-y-4">
              <div>
                <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                  Social Channels & Dispatches
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1A1612] mt-1">
                  Follow Enganda Safaris Online
                </h3>
                <p className="text-xs text-[#5A5248] mt-1">
                  Connect with our Entebbe desk and field guides on X, Instagram, and LinkedIn for live UWA permit alerts and trail updates.
                </p>
              </div>

              <div className="space-y-2.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 p-3.5 rounded-md bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-[#E4DCCF] transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-[#226B3E] text-[#D99B26] shrink-0 mt-0.5">
                        <SocialIcon platform={item.platform} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1A1612] group-hover:text-[#C85A28] transition-colors">
                            {item.label}
                          </span>
                          <span className="font-mono text-[11px] text-[#5A5248]">
                            {item.handle}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A5248] mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#5A5248] group-hover:text-[#1A1612] shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E4DCCF] rounded-lg p-6 sm:p-8">
              {submittedLeadId ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-[#1A1612]">
                    Message Received in Entebbe
                  </h2>
                  <p className="text-sm text-[#5A5248] max-w-md mx-auto">
                    Thank you, <strong>{name}</strong>. Your inquiry (<span className="font-mono text-xs">{submittedLeadId}</span>) is with our coordination team. {AVAILABILITY_PROMISE}
                  </p>
                  <div className="pt-3">
                    <a
                      href={getWhatsAppUrl(`Oli otya! Following up on my contact inquiry ${submittedLeadId} (${name}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#226B3E] text-[#FAF7F2] text-xs font-semibold px-5 py-3 rounded-md"
                    >
                      <MessageCircle className="w-4 h-4 text-[#D99B26]" />
                      <span>Continue on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="font-mono text-xs uppercase text-[#C85A28] font-semibold">
                      Direct Inquiry Form
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-[#1A1612] mt-1">
                      Send Us Your Safari Questions or Dates
                    </h2>
                    <p className="text-xs text-[#5A5248] mt-1">
                      {AVAILABILITY_PROMISE}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Eleanor Vance"
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        WhatsApp / Phone
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+44 7700 900000"
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Party Size
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={partySize}
                        onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm font-mono text-[#1A1612]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Target Dates
                      </label>
                      <input
                        type="text"
                        value={targetDates}
                        onChange={(e) => setTargetDates(e.target.value)}
                        placeholder="e.g. Nov 2026"
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Preferred Ugandan Guide (Optional)
                      </label>
                      <select
                        value={preferredGuideSlug}
                        onChange={(e) => setPreferredGuideSlug(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      >
                        <option value="">Match me with the best guide</option>
                        {GUIDES.map((g) => (
                          <option key={g.slug} value={g.slug}>
                            {g.name} ({g.homeRegion})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                        Comfort Tier
                      </label>
                      <select
                        value={budgetTier}
                        onChange={(e) => setBudgetTier(e.target.value as ComfortTier)}
                        className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                      >
                        <option value="mid-range">Mid-Range Eco-Lodges</option>
                        <option value="luxury">Luxury Wilderness Sanctuaries</option>
                        <option value="signature">Signature Premier Camps</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                      How Can Our Entebbe Team Help?
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us about your dream Uganda route, gorilla permit questions, or arrival flight into Entebbe..."
                      className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2.5 text-sm text-[#1A1612]"
                    />
                  </div>

                  <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-3.5 flex items-center gap-2 text-xs text-[#5A5248]">
                    <ShieldCheck className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
                    <span>
                      Official UWA permit receipts provided before balance collection.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Sending to Entebbe Desk...' : 'Send Inquiry to Entebbe Desk'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
