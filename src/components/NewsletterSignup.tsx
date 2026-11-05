import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Compass,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Sparkles,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useInquiry } from '../context/InquiryContext';
import { formatPrice } from '../lib/currency';

const EXPEDITION_TOPICS = [
  {
    id: 'Safari Updates & Trail Conditions',
    label: 'Safari Updates & Trail Conditions',
    detail: 'Monthly road, park track & dry-season wildlife reports from Bwindi to Kidepo',
  },
  {
    id: 'Cultural Insights & Stories',
    label: 'Cultural Insights & Stories',
    detail: 'Field essays on Karamojong homesteads, Batwa forest botany & Ankole heritage',
  },
  {
    id: 'UWA Gorilla & Chimp Permit Alerts',
    label: 'UWA Gorilla & Chimp Permit Alerts',
    detail: 'Early notice on low-season quotas and confirmed primate departures',
  },
  {
    id: 'Partner Lodges, Hotels & Camp Sites',
    label: 'Partner Lodges, Hotels & Camp Sites',
    detail: 'New community eco-camps, lakeside hotels & safari lodge partner rates',
  },
];

export const NewsletterSignup: React.FC = () => {
  const { subscribeNewsletter, newsletterSubscriptions, availableBalanceUSD } = useWallet();
  const { currency } = useInquiry();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Safari Updates & Trail Conditions',
    'Cultural Insights & Stories',
  ]);
  const [preferredSeason, setPreferredSeason] = useState('Jun – Sep (Dry Season)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    email: string;
    firstName?: string;
    topics: string[];
    alreadySubscribed: boolean;
    rewardGrantedUSD: number;
  } | null>(null);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((item) => item !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address to receive field dispatches.');
      return;
    }

    if (selectedTopics.length === 0) {
      setErrorMessage('Please select at least one expedition dispatch topic.');
      return;
    }

    const res = subscribeNewsletter({
      email: trimmedEmail,
      firstName: firstName.trim() || undefined,
      topics: selectedTopics,
      preferredSeason,
    });

    if (res.ok) {
      setSubmissionResult({
        email: res.subscription.email,
        firstName: res.subscription.firstName,
        topics: res.subscription.topics,
        alreadySubscribed: res.alreadySubscribed,
        rewardGrantedUSD: res.rewardGrantedUSD,
      });
    }
  };

  return (
    <section
      id="join-the-expedition"
      className="bg-[#144225] text-[#FAF7F2] border-y border-[#2E8550] py-16"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Pitch & Field Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26]">
              <Compass className="w-4 h-4" />
              <span>Entebbe Field Dispatches • Written by Our Ugandan Guides</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Join the Expedition
            </h2>

            <p className="text-sm sm:text-base text-[#E4DCCF] leading-relaxed">
              Receive twice-monthly safari updates, seasonal trail reports from Bwindi and Kidepo Valley, and deep cultural insights written directly by our licensed Ugandan guides — never automated marketing fluff.
            </p>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#1B5632]/90 border border-white/15 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26]">
                  <BookOpen className="w-4 h-4" />
                  <span>Field-Verified Notes</span>
                </div>
                <p className="text-xs text-[#E4DCCF] leading-relaxed">
                  Real-time fruiting fig updates in Kibale, Mabamba Shoebill sightings, and Karamojong cultural stories.
                </p>
              </div>

              <div className="bg-[#1B5632]/90 border border-white/15 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26]">
                  <Sparkles className="w-4 h-4" />
                  <span>{formatPrice(50, currency)} Safari Wallet Credit</span>
                </div>
                <p className="text-xs text-[#E4DCCF] leading-relaxed">
                  New subscribers automatically receive a {formatPrice(50, currency)} Expedition Credit in their Safari Wallet toward any partner stay or safari deposit.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#D6CEC2]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                <span>Zero third-party sharing • Unsubscribe in one click</span>
              </span>
              {newsletterSubscriptions.length > 0 && (
                <span className="font-mono text-[#D99B26]">
                  • {newsletterSubscriptions.length} active expedition {newsletterSubscriptions.length === 1 ? 'subscription' : 'subscriptions'} saved on this device
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Signup Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#FAF7F2] text-[#1A1612] border border-[#E4DCCF] rounded-xl p-6 sm:p-8 shadow-xl">
              {submissionResult ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#226B3E]/15 text-[#226B3E] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#226B3E] font-semibold">
                        Expedition Dispatch Confirmed
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-0.5">
                        Welcome Aboard{submissionResult.firstName ? `, ${submissionResult.firstName}` : ''}!
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                        Field dispatches will be sent to{' '}
                        <span className="font-mono font-semibold text-[#1A1612]">
                          {submissionResult.email}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  {/* Wallet Reward Banner */}
                  <div className="bg-[#F3ECE1] border border-[#D99B26]/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                        {submissionResult.alreadySubscribed
                          ? 'Preferences Updated'
                          : `+${formatPrice(submissionResult.rewardGrantedUSD, currency)} Expedition Credit Added`}
                      </div>
                      <p className="text-xs text-[#5A5248]">
                        Your available Safari Wallet balance is now{' '}
                        <span className="font-mono font-bold text-[#1A1612] tabular-nums">
                          {formatPrice(availableBalanceUSD, currency)}
                        </span>
                        .
                      </p>
                    </div>
                    <Link
                      to="/wallet"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      <Wallet className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>Open Safari Wallet</span>
                    </Link>
                  </div>

                  {/* Selected Topics Summary */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#5A5248]">
                      Your Active Dispatch Topics
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {submissionResult.topics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center gap-1.5 text-xs bg-[#226B3E]/10 text-[#226B3E] font-medium px-3 py-1.5 rounded-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{topic}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E4DCCF] flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmissionResult(null)}
                      className="text-xs font-semibold text-[#226B3E] hover:text-[#C85A28] transition-colors cursor-pointer"
                    >
                      Update preferences or register another email
                    </button>
                    <Link
                      to="/guides"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85A28] hover:underline"
                    >
                      <span>Meet Our Guides and Partners</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                      Field Notes & Safari Updates
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#1A1612] mt-0.5">
                      Subscribe to Ugandan Guide Dispatches
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expedition-first-name"
                        className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                      >
                        First Name <span className="font-normal text-[#5A5248]">(Optional)</span>
                      </label>
                      <input
                        id="expedition-first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Elena"
                        className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="expedition-season"
                        className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                      >
                        Target Travel Window
                      </label>
                      <select
                        id="expedition-season"
                        value={preferredSeason}
                        onChange={(e) => setPreferredSeason(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                      >
                        <option value="Dec – Feb (Dry Season)">Dec – Feb (Dry Season)</option>
                        <option value="Mar – May (Green Season)">Mar – May (Emerald Green Season)</option>
                        <option value="Jun – Sep (Dry Season)">Jun – Sep (Peak Primate Season)</option>
                        <option value="Oct – Nov (Birding & Nyege Nyege)">Oct – Nov (Birding & Nyege Nyege)</option>
                        <option value="Exploring Future Dates">Exploring Future Dates</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="expedition-email"
                      className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                    >
                      Email Address <span className="text-[#C85A28]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5A5248] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="expedition-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                      />
                    </div>
                  </div>

                  {/* Topic Checkboxes */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-[#1A1612]">
                      Choose Your Dispatch Topics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {EXPEDITION_TOPICS.map((topic) => {
                        const isChecked = selectedTopics.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => toggleTopic(topic.id)}
                            className={`text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${
                              isChecked
                                ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#1A1612]'
                                : 'bg-white border-[#E4DCCF] text-[#5A5248] hover:border-[#226B3E]/50'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                isChecked
                                  ? 'bg-[#226B3E] border-[#226B3E] text-white'
                                  : 'border-[#9E9385] bg-white'
                              }`}
                            >
                              {isChecked && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[#1A1612] leading-snug">
                                {topic.label}
                              </div>
                              <div className="text-[11px] text-[#5A5248] mt-0.5 leading-snug">
                                {topic.detail}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-md bg-[#C85A28]/10 border border-[#C85A28] text-xs text-[#C85A28] font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                  >
                    <span>Join the Expedition & Claim {formatPrice(50, currency)} Wallet Credit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
