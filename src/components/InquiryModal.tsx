import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageCircle, ShieldCheck, Calendar, Users } from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import {
  GUIDES,
  EXPERIENCES,
  AVAILABILITY_PROMISE,
  PERMIT_RECEIPT_GUARANTEE,
  getWhatsAppUrl,
} from '../data/seedData';
import { ComfortTier } from '../types';

export const InquiryModal: React.FC = () => {
  const { isInquiryModalOpen, modalOptions, closeInquiryModal, submitLead } = useInquiry();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [targetDates, setTargetDates] = useState('');
  const [budgetTier, setBudgetTier] = useState<ComfortTier>('luxury');
  const [preferredGuideSlug, setPreferredGuideSlug] = useState('');
  const [experienceSlug, setExperienceSlug] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isInquiryModalOpen) {
      setPreferredGuideSlug(modalOptions.guideSlug || '');
      setExperienceSlug(modalOptions.experienceSlug || '');
      setBudgetTier(modalOptions.defaultTier || 'luxury');
      setTargetDates(modalOptions.defaultDates || '');
      setNotes(modalOptions.defaultNotes || '');
      setSubmittedLeadId(null);
    }
  }, [isInquiryModalOpen, modalOptions]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInquiryModalOpen) {
        closeInquiryModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isInquiryModalOpen, closeInquiryModal]);

  if (!isInquiryModalOpen) return null;

  const selectedGuide = GUIDES.find((g) => g.slug === preferredGuideSlug);
  const selectedExperience = EXPERIENCES.find((e) => e.slug === experienceSlug);

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
        interests: selectedExperience ? selectedExperience.interests : ['gorillas'],
        preferredGuideSlug: preferredGuideSlug || undefined,
        experienceSlug: experienceSlug || undefined,
        notes: notes.trim(),
      });
      setSubmittedLeadId(lead.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1612]/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={closeInquiryModal}
          className="absolute top-4 right-4 p-2 rounded-md text-[#5A5248] hover:text-[#1A1612] hover:bg-[#F3ECE1] transition-colors"
          aria-label="Close inquiry modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedLeadId ? (
          <div className="space-y-5 py-4 text-center">
            <div className="w-12 h-12 rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 id="inquiry-modal-title" className="font-serif text-3xl font-bold text-[#1A1612]">
              Webale Nyo, {name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed max-w-md mx-auto">
              Your safari inquiry (<span className="font-mono text-xs">{submittedLeadId}</span>) has been logged with our Entebbe coordination desk.{' '}
              <strong className="text-[#1A1612]">{AVAILABILITY_PROMISE}</strong>
            </p>
            {selectedGuide && (
              <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-3.5 text-xs text-[#1A1612]">
                Requested Guide: <strong>{selectedGuide.name}</strong> ({selectedGuide.homeRegion})
              </div>
            )}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppUrl(
                  `Oli otya Enganda team! I just submitted inquiry ${submittedLeadId} (${name}, ${partySize} guests, ${targetDates || 'flexible dates'}${
                    selectedGuide ? `, preferred guide: ${selectedGuide.name}` : ''
                  }).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#D99B26]" />
                <span>Continue on WhatsApp Now</span>
              </a>
              <button
                type="button"
                onClick={closeInquiryModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-[#E4DCCF] text-[#1A1612] hover:bg-[#F3ECE1] text-xs font-semibold"
              >
                Return to Page
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                Entebbe Coordination Desk
              </span>
              <h2 id="inquiry-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-0.5">
                {selectedGuide
                  ? `Request ${selectedGuide.name} for Your Safari`
                  : selectedExperience
                  ? `Inquire: ${selectedExperience.title}`
                  : 'Plan Your Uganda Safari'}
              </h2>
              <p className="text-xs text-[#5A5248] mt-1">
                {AVAILABILITY_PROMISE}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
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
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-[#C85A28]" />
                  Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm font-mono text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#C85A28]" />
                  Target Month / Dates
                </label>
                <input
                  type="text"
                  value={targetDates}
                  onChange={(e) => setTargetDates(e.target.value)}
                  placeholder="e.g. Nov 2026 or July 2027"
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Preferred Ugandan Guide (Optional)
                </label>
                <select
                  value={preferredGuideSlug}
                  onChange={(e) => setPreferredGuideSlug(e.target.value)}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="">Match me with the best guide</option>
                  {GUIDES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.name} — {g.homeRegion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Uganda Experience (Optional)
                </label>
                <select
                  value={experienceSlug}
                  onChange={(e) => setExperienceSlug(e.target.value)}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="">Custom Tailor-Made Uganda Route</option>
                  {EXPERIENCES.map((exp) => (
                    <option key={exp.slug} value={exp.slug}>
                      {exp.title} ({exp.durationDays}d)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Comfort Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mid-range', 'luxury', 'signature'] as ComfortTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBudgetTier(t)}
                    className={`py-2 px-3 rounded-md text-xs font-semibold capitalize border transition-colors ${
                      budgetTier === t
                        ? 'bg-[#226B3E] text-[#FAF7F2] border-[#226B3E]'
                        : 'bg-white text-[#5A5248] border-[#E4DCCF] hover:bg-[#F3ECE1]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Notes, Wildlife Priorities, or Questions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about gorilla or chimp permits, birding goals, pace, or dietary preferences..."
                className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
              />
            </div>

            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-3 flex items-start gap-2 text-xs text-[#5A5248]">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
              <span>
                {PERMIT_RECEIPT_GUARANTEE} Your deposit is protected until permits and lodges are confirmed.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeInquiryModal}
                className="px-4 py-2.5 rounded-md border border-[#E4DCCF] text-xs font-semibold text-[#5A5248] hover:text-[#1A1612]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Sending to Entebbe...' : 'Submit Safari Inquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
