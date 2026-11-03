import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Building2,
  FileText,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Compass,
  Calendar,
  CreditCard,
  Smartphone,
  Landmark,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useWallet } from '../context/WalletContext';
import { useInquiry } from '../context/InquiryContext';
import { formatPrice } from '../lib/currency';
import {
  PERMIT_FACTS,
  PARTNER_ACCOMMODATIONS,
  EXPERIENCES,
} from '../data/seedData';
import { WalletPaymentRail, ComfortTier } from '../types';

type ActiveWalletTab = 'topup' | 'escrow' | 'book' | 'withdraw';
type LedgerFilter = 'all' | 'deposit' | 'permit' | 'booking' | 'withdrawal' | 'reward';

const PAYMENT_RAILS: {
  id: WalletPaymentRail;
  label: string;
  detail: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'Visa / Mastercard',
    label: 'Visa / Mastercard',
    detail: 'Instant USD / Multi-currency card settlement',
    icon: CreditCard,
  },
  {
    id: 'MTN Mobile Money Uganda',
    label: 'MTN Mobile Money Uganda',
    detail: '+256 MTN MoMo instant East African settlement',
    icon: Smartphone,
  },
  {
    id: 'Airtel Money Uganda',
    label: 'Airtel Money Uganda',
    detail: '+256 Airtel Money instant mobile wallet',
    icon: Smartphone,
  },
  {
    id: 'International Bank Wire',
    label: 'International Bank Wire',
    detail: 'Stanbic Bank Uganda Entebbe Trust Account (SWIFT)',
    icon: Landmark,
  },
];

export const WalletPage: React.FC = () => {
  const {
    availableBalanceUSD,
    escrowBalanceUSD,
    rewardCreditsUSD,
    transactions,
    permitHolds,
    partnerBookings,
    topUpWallet,
    withdrawFunds,
    holdPermitInEscrow,
    releasePermitEscrow,
    bookPartnerStay,
    paySafariDeposit,
    savedItineraries,
    paySavedItineraryDeposit,
    removeSavedItinerary,
    resetWalletToDefault,
  } = useWallet();

  const { currency } = useInquiry();

  const [activeTab, setActiveTab] = useState<ActiveWalletTab>('topup');
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Top-up state
  const [topUpAmount, setTopUpAmount] = useState<number>(800);
  const [topUpRail, setTopUpRail] = useState<WalletPaymentRail>('Visa / Mastercard');
  const [topUpNote, setTopUpNote] = useState('');

  // Escrow state
  const [selectedPermitId, setSelectedPermitId] = useState<string>(
    PERMIT_FACTS[0]?.id || 'uwa-gorilla-trekking'
  );
  const [permitGuests, setPermitGuests] = useState<number>(2);
  const [permitDate, setPermitDate] = useState<string>('2026-12-18');

  // Partner Stay & Safari Deposit booking state
  const [bookingMode, setBookingMode] = useState<'partner' | 'safari'>('partner');
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState<string>(
    PARTNER_ACCOMMODATIONS[0]?.slug || ''
  );
  const [stayCheckIn, setStayCheckIn] = useState<string>('2026-12-16');
  const [stayNights, setStayNights] = useState<number>(2);
  const [stayGuests, setStayGuests] = useState<number>(2);

  const [selectedExpSlug, setSelectedExpSlug] = useState<string>(
    EXPERIENCES[0]?.slug || ''
  );
  const [safariGuests, setSafariGuests] = useState<number>(2);
  const [safariTier, setSafariTier] = useState<ComfortTier>('mid-range');
  const [safariDate, setSafariDate] = useState<string>('2026-12-20');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(250);
  const [withdrawRail, setWithdrawRail] = useState<WalletPaymentRail>('Visa / Mastercard');
  const [withdrawDestination, setWithdrawDestination] = useState<string>(
    'Original Visa Card ending 4821'
  );

  // Ledger filter state
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>('all');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  const selectedPermit = useMemo(
    () => PERMIT_FACTS.find((p) => p.id === selectedPermitId) || PERMIT_FACTS[0],
    [selectedPermitId]
  );

  const selectedPartner = useMemo(
    () =>
      PARTNER_ACCOMMODATIONS.find((p) => p.slug === selectedPartnerSlug) ||
      PARTNER_ACCOMMODATIONS[0],
    [selectedPartnerSlug]
  );

  const selectedExperience = useMemo(
    () =>
      EXPERIENCES.find((e) => e.slug === selectedExpSlug) || EXPERIENCES[0],
    [selectedExpSlug]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (ledgerFilter === 'deposit' && tx.type !== 'deposit') return false;
      if (
        ledgerFilter === 'permit' &&
        tx.type !== 'permit_escrow' &&
        tx.type !== 'permit_release'
      ) {
        return false;
      }
      if (
        ledgerFilter === 'booking' &&
        tx.type !== 'partner_booking' &&
        tx.type !== 'safari_deposit'
      ) {
        return false;
      }
      if (ledgerFilter === 'withdrawal' && tx.type !== 'withdrawal') return false;
      if (ledgerFilter === 'reward' && tx.type !== 'expedition_reward') return false;

      if (ledgerSearch.trim()) {
        const q = ledgerSearch.trim().toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesSub = tx.subtitle.toLowerCase().includes(q);
        const matchesRef = tx.referenceCode.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesRef) return false;
      }

      return true;
    });
  }, [transactions, ledgerFilter, ledgerSearch]);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = topUpWallet(topUpAmount, topUpRail, topUpNote);
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
    if (res.ok) {
      setTopUpNote('');
    }
  };

  const handleEscrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = holdPermitInEscrow(selectedPermitId, permitGuests, permitDate);
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleReleaseEscrow = (holdId: string) => {
    const res = releasePermitEscrow(holdId);
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
  };

  const handlePartnerBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = bookPartnerStay(
      selectedPartnerSlug,
      stayCheckIn,
      stayNights,
      stayGuests
    );
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleSafariDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = paySafariDeposit(
      selectedExpSlug,
      safariGuests,
      safariTier,
      safariDate
    );
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = withdrawFunds(withdrawAmount, withdrawRail, withdrawDestination);
    setBanner({
      type: res.ok ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Reference Code',
      'Type',
      'Title',
      'Details',
      'Direction',
      'Amount (USD)',
      'Status',
      'Payment Rail',
    ];
    const rows = transactions.map((tx) => [
      new Date(tx.createdAt).toISOString().split('T')[0],
      tx.referenceCode,
      tx.type,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.subtitle.replace(/"/g, '""')}"`,
      tx.direction,
      tx.amountUSD.toString(),
      tx.status,
      `"${tx.paymentRail}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `enganda-safari-wallet-statement-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBanner({
      type: 'success',
      message: 'Downloaded your Enganda Safari Wallet statement (.csv).',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1612] pb-20">
      <SEO
        title="Safari Wallet & UWA Permit Escrow"
        description="Manage your Enganda Safari Wallet, hold Uganda Wildlife Authority gorilla and chimpanzee permits in escrow, and book partner lodges, hotels, motels, and camp sites."
        canonicalPath="/wallet"
      />

      {/* Header Banner */}
      <section className="bg-[#144225] text-[#FAF7F2] border-b border-[#2E8550] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D99B26]">
                <ShieldCheck className="w-4 h-4" />
                <span>Entebbe Trust Account • UWA Permit Escrow & Partner Bookings</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                Enganda Safari Wallet
              </h1>
              <p className="text-sm sm:text-base text-[#E4DCCF] leading-relaxed">
                Fund your Uganda expedition in one place. Lock official UWA gorilla and chimpanzee permits in protected escrow until your receipt is verified, pay 30% safari deposits, or book partner lodges, hotels, motels, and camp sites directly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#287A47] text-white border border-white/15 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D99B26]" />
                <span>Export CSV Statement</span>
              </button>
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Browse Guides & Partners</span>
              </Link>
            </div>
          </div>

          {/* 3 Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="bg-[#1B5632] border border-white/15 rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#D6CEC2]">
                  Available Safari Balance
                </span>
                <Wallet className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {formatPrice(availableBalanceUSD, currency)}
              </div>
              <div className="text-xs text-[#D6CEC2] flex items-center justify-between pt-1">
                <span>Ready for instant permits & partner stays</span>
                <span className="font-mono text-[#D99B26]">
                  US${availableBalanceUSD.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-[#1B5632] border border-white/15 rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#D6CEC2]">
                  Held in UWA Permit Escrow
                </span>
                <Lock className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-[#D99B26] tabular-nums">
                {formatPrice(escrowBalanceUSD, currency)}
              </div>
              <div className="text-xs text-[#D6CEC2] flex items-center justify-between pt-1">
                <span>
                  {permitHolds.filter((h) => h.status === 'active_escrow').length} active UWA permit{' '}
                  {permitHolds.filter((h) => h.status === 'active_escrow').length === 1
                    ? 'hold'
                    : 'holds'}
                </span>
                <span className="font-mono text-[#E4DCCF]">
                  100% Refundable pre-issue
                </span>
              </div>
            </div>

            <div className="bg-[#1B5632] border border-white/15 rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#D6CEC2]">
                  Total Expedition Value
                </span>
                <ShieldCheck className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {formatPrice(availableBalanceUSD + escrowBalanceUSD, currency)}
              </div>
              <div className="text-xs text-[#D6CEC2] flex items-center justify-between pt-1">
                <span>Includes Expedition Credits earned</span>
                <span className="font-mono text-[#D99B26]">
                  +{formatPrice(rewardCreditsUSD, currency)} Rewards
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Feedback Banner */}
        {banner && (
          <div
            className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
              banner.type === 'success'
                ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#144225]'
                : 'bg-[#C85A28]/10 border-[#C85A28] text-[#9E3F16]'
            }`}
          >
            <div className="flex items-start gap-3">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#226B3E] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#C85A28] shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{banner.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-xs font-mono uppercase underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Interactive Wallet Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Action Workspace */}
          <div className="lg:col-span-7 bg-white border border-[#E4DCCF] rounded-xl overflow-hidden shadow-sm">
            {/* Action Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E4DCCF] bg-[#F3ECE1]">
              <button
                type="button"
                onClick={() => setActiveTab('topup')}
                className={`py-3.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'topup'
                    ? 'bg-white text-[#226B3E] border-[#226B3E]'
                    : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Funds</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('escrow')}
                className={`py-3.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'escrow'
                    ? 'bg-white text-[#226B3E] border-[#226B3E]'
                    : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>UWA Permit Escrow</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`py-3.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'book'
                    ? 'bg-white text-[#226B3E] border-[#226B3E]'
                    : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Book Partner / Safari</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('withdraw')}
                className={`py-3.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'withdraw'
                    ? 'bg-white text-[#226B3E] border-[#226B3E]'
                    : 'text-[#5A5248] border-transparent hover:text-[#1A1612]'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* TAB 1: TOP UP */}
              {activeTab === 'topup' && (
                <form onSubmit={handleTopUpSubmit} className="space-y-6">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                      Instant Wallet Funding
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1">
                      Top Up Your Safari Wallet
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                      Select a preset safari milestone amount or enter a custom USD figure. All balances automatically display in your chosen currency ({currency}).
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#1A1612]">
                      Quick Milestone Presets
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { usd: 100, label: 'Partner Camp Pitch' },
                        { usd: 250, label: 'Kibale Chimp Permit' },
                        { usd: 500, label: 'Lodge Stay Deposit' },
                        { usd: 800, label: 'Bwindi Gorilla Permit' },
                        { usd: 1500, label: 'Gorilla Habituation' },
                        { usd: 2500, label: 'Full Safari Deposit' },
                      ].map((preset) => (
                        <button
                          key={preset.usd}
                          type="button"
                          onClick={() => setTopUpAmount(preset.usd)}
                          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                            topUpAmount === preset.usd
                              ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#1A1612]'
                              : 'bg-[#FAF7F2] border-[#E4DCCF] text-[#5A5248] hover:border-[#226B3E]/50'
                          }`}
                        >
                          <div className="font-mono text-sm font-bold text-[#1A1612] tabular-nums">
                            {formatPrice(preset.usd, currency)}
                          </div>
                          <div className="text-[11px] text-[#5A5248] mt-0.5">
                            {preset.label} (US${preset.usd})
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div>
                    <label
                      htmlFor="wallet-topup-amount"
                      className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                    >
                      Amount in USD (Equivalent: {formatPrice(topUpAmount || 0, currency)})
                    </label>
                    <input
                      id="wallet-topup-amount"
                      type="number"
                      min={10}
                      max={50000}
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-base font-bold text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                    />
                  </div>

                  {/* Payment Rail Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#1A1612]">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PAYMENT_RAILS.map((rail) => {
                        const Icon = rail.icon;
                        const active = topUpRail === rail.id;
                        return (
                          <button
                            key={rail.id}
                            type="button"
                            onClick={() => setTopUpRail(rail.id)}
                            className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#226B3E]/10 border-[#226B3E]'
                                : 'bg-[#FAF7F2] border-[#E4DCCF] hover:border-[#226B3E]/40'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-[#226B3E] shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-[#1A1612]">
                                {rail.label}
                              </div>
                              <div className="text-[11px] text-[#5A5248] mt-0.5">
                                {rail.detail}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="wallet-topup-note"
                      className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                    >
                      Reference Note <span className="font-normal text-[#5A5248]">(Optional)</span>
                    </label>
                    <input
                      id="wallet-topup-note"
                      type="text"
                      value={topUpNote}
                      onChange={(e) => setTopUpNote(e.target.value)}
                      placeholder="e.g. December Bwindi trek & Hotel No.5 stay"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#D99B26]" />
                    <span>
                      Add {formatPrice(topUpAmount || 0, currency)} to Safari Wallet
                    </span>
                  </button>
                </form>
              )}

              {/* TAB 2: UWA PERMIT ESCROW */}
              {activeTab === 'escrow' && (
                <form onSubmit={handleEscrowSubmit} className="space-y-6">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                      Official UWA Receipt Protection
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1">
                      Lock Gorilla & Chimp Permits in Escrow
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                      When you lock permit funds in escrow, our Entebbe desk reserves your date slot with the Uganda Wildlife Authority and shares your official UWA receipt before releasing the funds.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="escrow-permit-select"
                      className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                    >
                      Select Official UWA Permit
                    </label>
                    <select
                      id="escrow-permit-select"
                      value={selectedPermitId}
                      onChange={(e) => setSelectedPermitId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                    >
                      {PERMIT_FACTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatPrice(p.costUSD, currency)} (US${p.costUSD}) / person
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPermit && (
                    <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase text-[#226B3E] font-semibold">
                          {selectedPermit.park}
                        </span>
                        <span className="font-mono font-bold text-[#1A1612]">
                          Min Age: {selectedPermit.minAge} yrs
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5248]">{selectedPermit.validity}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="escrow-guests"
                        className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                      >
                        Number of Trekkers
                      </label>
                      <input
                        id="escrow-guests"
                        type="number"
                        min={1}
                        max={8}
                        value={permitGuests}
                        onChange={(e) => setPermitGuests(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="escrow-date"
                        className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                      >
                        Preferred Trekking Date
                      </label>
                      <input
                        id="escrow-date"
                        type="date"
                        value={permitDate}
                        onChange={(e) => setPermitDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-sm text-[#1A1612]"
                      />
                    </div>
                  </div>

                  <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#1A1612]">
                        Total Escrow Hold Required
                      </div>
                      <div className="text-[11px] text-[#5A5248]">
                        Deducted from your Available Balance ({formatPrice(availableBalanceUSD, currency)})
                      </div>
                    </div>
                    <div className="font-mono text-xl font-bold text-[#226B3E] tabular-nums">
                      {formatPrice(
                        (selectedPermit?.costUSD || 800) * (permitGuests || 1),
                        currency
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      Lock{' '}
                      {formatPrice(
                        (selectedPermit?.costUSD || 800) * (permitGuests || 1),
                        currency
                      )}{' '}
                      in UWA Permit Escrow
                    </span>
                  </button>
                </form>
              )}

              {/* TAB 3: BOOK PARTNER STAY OR SAFARI DEPOSIT */}
              {activeTab === 'book' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#E4DCCF] pb-4">
                    <button
                      type="button"
                      onClick={() => setBookingMode('partner')}
                      className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        bookingMode === 'partner'
                          ? 'bg-[#226B3E] text-white'
                          : 'bg-[#F3ECE1] text-[#5A5248] hover:text-[#1A1612]'
                      }`}
                    >
                      Book Partner Hotel, Motel, Camp Site or Lodge
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingMode('safari')}
                      className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        bookingMode === 'safari'
                          ? 'bg-[#226B3E] text-white'
                          : 'bg-[#F3ECE1] text-[#5A5248] hover:text-[#1A1612]'
                      }`}
                    >
                      Pay 30% Safari Package Deposit
                    </button>
                  </div>

                  {bookingMode === 'partner' ? (
                    <form onSubmit={handlePartnerBookingSubmit} className="space-y-5">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                          Direct Partner Settlement
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#1A1612] mt-0.5">
                          Book a Verified Uganda Partner Stay
                        </h2>
                      </div>

                      <div>
                        <label
                          htmlFor="wallet-partner-select"
                          className="block text-xs font-semibold text-[#1A1612] mb-1.5"
                        >
                          Select Partner Lodge, Hotel, Motel, or Camp Site
                        </label>
                        <select
                          id="wallet-partner-select"
                          value={selectedPartnerSlug}
                          onChange={(e) => setSelectedPartnerSlug(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612]"
                        >
                          {PARTNER_ACCOMMODATIONS.map((p) => (
                            <option key={p.id} value={p.slug}>
                              [{p.categoryLabel}] {p.name} ({p.region}) —{' '}
                              {formatPrice(p.pricePerNightUSD, currency)}/night
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Check-In Date
                          </label>
                          <input
                            type="date"
                            value={stayCheckIn}
                            onChange={(e) => setStayCheckIn(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-xs text-[#1A1612]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Nights
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={14}
                            value={stayNights}
                            onChange={(e) => setStayNights(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Guests
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={stayGuests}
                            onChange={(e) => setStayGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                          />
                        </div>
                      </div>

                      {selectedPartner && (
                        <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-[#1A1612]">
                              {selectedPartner.name} ({selectedPartner.categoryLabel})
                            </div>
                            <div className="text-[11px] text-[#5A5248]">
                              {stayNights} {stayNights === 1 ? 'night' : 'nights'} •{' '}
                              {Math.ceil(stayGuests / 2)}{' '}
                              {Math.ceil(stayGuests / 2) === 1 ? 'room/unit' : 'rooms/units'}
                            </div>
                          </div>
                          <div className="font-mono text-xl font-bold text-[#226B3E] tabular-nums">
                            {formatPrice(
                              selectedPartner.pricePerNightUSD *
                                stayNights *
                                Math.ceil(stayGuests / 2),
                              currency
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-[#D99B26]" />
                        <span>Confirm Partner Booking from Wallet</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSafariDepositSubmit} className="space-y-5">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                          30% Private Safari Deposit
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#1A1612] mt-0.5">
                          Reserve a Signature Uganda Safari
                        </h2>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                          Select Uganda Safari Experience
                        </label>
                        <select
                          value={selectedExpSlug}
                          onChange={(e) => setSelectedExpSlug(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612]"
                        >
                          {EXPERIENCES.map((exp) => (
                            <option key={exp.id} value={exp.slug}>
                              {exp.title} ({exp.durationDays} Days)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Comfort Tier
                          </label>
                          <select
                            value={safariTier}
                            onChange={(e) => setSafariTier(e.target.value as ComfortTier)}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-xs font-semibold text-[#1A1612]"
                          >
                            <option value="mid-range">Mid-Range</option>
                            <option value="luxury">Luxury</option>
                            <option value="signature">Signature</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Travelers
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={safariGuests}
                            onChange={(e) => setSafariGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-sm font-bold text-[#1A1612]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                            Departure Date
                          </label>
                          <input
                            type="date"
                            value={safariDate}
                            onChange={(e) => setSafariDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-xs text-[#1A1612]"
                          />
                        </div>
                      </div>

                      {selectedExperience && (
                        <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-[#1A1612]">
                              30% Deposit for {selectedExperience.title}
                            </div>
                            <div className="text-[11px] text-[#5A5248]">
                              Balance due after official UWA permit & lodge confirmation
                            </div>
                          </div>
                          <div className="font-mono text-xl font-bold text-[#C85A28] tabular-nums">
                            {formatPrice(
                              Math.round(
                                ((selectedExperience.priceBands.find(
                                  (b) => b.tier === safariTier
                                )?.perPersonUSD ||
                                  selectedExperience.priceBands[0].perPersonUSD) *
                                  safariGuests) *
                                  0.3
                              ),
                              currency
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Pay 30% Safari Deposit from Wallet</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: WITHDRAW */}
              {activeTab === 'withdraw' && (
                <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                      Instant Available Balance Refund
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1">
                      Withdraw Unused Wallet Funds
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A5248] mt-1">
                      Transfer any unallocated funds from your Available Safari Balance ({formatPrice(availableBalanceUSD, currency)}) back to your card, Ugandan mobile money account, or bank wire.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                        Withdrawal Amount (USD)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={availableBalanceUSD}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] font-mono text-base font-bold text-[#1A1612]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                        Destination Rail
                      </label>
                      <select
                        value={withdrawRail}
                        onChange={(e) =>
                          setWithdrawRail(e.target.value as WalletPaymentRail)
                        }
                        className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612]"
                      >
                        {PAYMENT_RAILS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1612] mb-1.5">
                      Destination Account / Card / Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      placeholder="e.g. Visa ending 4821 or +256 772 000 000"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1A1612] hover:bg-[#332C24] text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#D99B26]" />
                    <span>
                      Withdraw {formatPrice(withdrawAmount || 0, currency)} Now
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Active Escrow Certificates & Partner Vouchers */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active UWA Permit Escrow Holds */}
            <div className="bg-white border border-[#E4DCCF] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#226B3E] font-semibold">
                    Protected UWA Quotas
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A1612]">
                    Active Permit Escrow Holds
                  </h3>
                </div>
                <Lock className="w-5 h-5 text-[#226B3E]" />
              </div>

              {permitHolds.length === 0 ? (
                <p className="text-xs text-[#5A5248] py-4">
                  No UWA permits currently held in escrow. Use the UWA Permit Escrow tab to lock gorilla or chimpanzee permits.
                </p>
              ) : (
                <div className="space-y-3">
                  {permitHolds.map((hold) => (
                    <div
                      key={hold.id}
                      className={`p-4 rounded-lg border space-y-2 ${
                        hold.status === 'active_escrow'
                          ? 'bg-[#FAF7F2] border-[#226B3E]/40'
                          : 'bg-[#F3ECE1]/60 border-[#E4DCCF] opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#226B3E] text-white">
                            {hold.uwaReceiptCode}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#1A1612] mt-1">
                            {hold.permitName}
                          </h4>
                        </div>
                        <div className="text-right font-mono text-sm font-bold text-[#226B3E] tabular-nums">
                          {formatPrice(hold.amountHeldUSD, currency)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5248]">
                        <span>
                          {hold.guests} {hold.guests === 1 ? 'Trekker' : 'Trekkers'} • Target:{' '}
                          <strong className="font-mono text-[#1A1612]">
                            {hold.PreferredTrekDate}
                          </strong>
                        </span>
                        <span className="font-mono uppercase text-[11px]">
                          {hold.status === 'active_escrow'
                            ? 'Escrow Locked'
                            : 'Released to Balance'}
                        </span>
                      </div>

                      {hold.status === 'active_escrow' && (
                        <div className="pt-2 border-t border-[#E4DCCF] flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleReleaseEscrow(hold.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A28] hover:underline cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Release Escrow to Available Balance</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Partner Accommodation Vouchers */}
            <div className="bg-white border border-[#E4DCCF] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C85A28] font-semibold">
                    Hotels, Motels, Camp Sites & Lodges
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A1612]">
                    Confirmed Partner Stay Vouchers
                  </h3>
                </div>
                <Building2 className="w-5 h-5 text-[#C85A28]" />
              </div>

              {partnerBookings.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] space-y-2">
                  <p className="text-xs text-[#5A5248] leading-relaxed">
                    You have not booked any partner hotels, motels, camp sites, or lodges from your wallet yet.
                  </p>
                  <Link
                    to="/guides?view=partners"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#226B3E] hover:text-[#C85A28]"
                  >
                    <span>Explore Partner Hotels, Motels, Camp Sites & Lodges</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {partnerBookings.map((stay) => (
                    <div
                      key={stay.id}
                      className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#C85A28] text-white">
                          {stay.voucherCode}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#1A1612] tabular-nums">
                          {formatPrice(stay.totalPaidUSD, currency)}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-[#1A1612]">
                        {stay.partnerName}
                      </h4>
                      <div className="text-xs text-[#5A5248] flex items-center justify-between">
                        <span>
                          Check-in: {stay.checkInDate} ({stay.nights}{' '}
                          {stay.nights === 1 ? 'night' : 'nights'}, {stay.guests}{' '}
                          {stay.guests === 1 ? 'guest' : 'guests'})
                        </span>
                        <span className="font-mono text-[11px] text-[#226B3E]">
                          Paid in Full
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved AI Custom Safari Itineraries (Generated with Gemini) */}
            <div className="bg-white border border-[#E4DCCF] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#226B3E] font-semibold">
                    Gemini AI Safari Plans
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A1612]">
                    Saved Custom Itineraries ({savedItineraries.length})
                  </h3>
                </div>
                <Sparkles className="w-5 h-5 text-[#D99B26]" />
              </div>

              {savedItineraries.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] space-y-2">
                  <p className="text-xs text-[#5A5248] leading-relaxed">
                    No AI-generated custom safari itineraries saved yet. Build a personalized multi-day Uganda plan using our Gemini Safari Itinerary Generator and save it here.
                  </p>
                  <Link
                    to="/#ai-safari-generator"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#226B3E] hover:text-[#C85A28]"
                  >
                    <span>Open AI Safari Itinerary Generator</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItineraries.map((itin) => (
                    <div
                      key={itin.id}
                      className="p-4 rounded-lg bg-[#FAF7F2] border border-[#226B3E]/30 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#226B3E] text-white">
                              {itin.referenceCode}
                            </span>
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#F3ECE1] text-[#5A5248] border border-[#E4DCCF]">
                              {itin.durationDays} Days • {itin.budgetTier}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-[#1A1612] mt-1">
                            {itin.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSavedItinerary(itin.id)}
                          aria-label={`Remove ${itin.title} from wallet`}
                          className="text-[#5A5248] hover:text-[#C85A28] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-[#5A5248] space-y-1">
                        <div>
                          <strong className="text-[#1A1612]">Region:</strong> {itin.region}
                        </div>
                        <div>
                          <strong className="text-[#1A1612]">Matched Guide:</strong>{' '}
                          <Link
                            to={`/guides/${itin.matchedGuideSlug}`}
                            className="text-[#226B3E] font-semibold hover:underline"
                          >
                            {itin.matchedGuideName}
                          </Link>{' '}
                          • {itin.partySize} {itin.partySize === 1 ? 'Guest' : 'Guests'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="text-[#5A5248]">Est. Total: </span>
                          <strong className="font-mono text-[#1A1612]">
                            {formatPrice(itin.totalPackageUSD, currency)}
                          </strong>
                        </div>

                        {itin.depositPaid ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#226B3E] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            30% Deposit Paid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const res = paySavedItineraryDeposit(itin.id);
                              setBanner({
                                type: res.ok ? 'success' : 'error',
                                message: res.message,
                              });
                            }}
                            className="px-3 py-1.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Pay 30% Deposit ({formatPrice(itin.depositAmountUSD, currency)})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Transaction Ledger */}
        <div className="bg-white border border-[#E4DCCF] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#C85A28] font-semibold">
                Audited Entebbe Trust Ledger
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612]">
                Transaction History & Receipts
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5A5248] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search reference or title..."
                  className="pl-9 pr-3 py-2 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-xs text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>

              <button
                type="button"
                onClick={resetWalletToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#E4DCCF] text-xs text-[#5A5248] hover:text-[#1A1612] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Ledger</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E4DCCF] pb-4">
            {(
              [
                { id: 'all', label: 'All Transactions' },
                { id: 'deposit', label: 'Deposits' },
                { id: 'permit', label: 'UWA Permit Escrow' },
                { id: 'booking', label: 'Partner Stays & Safaris' },
                { id: 'reward', label: 'Expedition Credits' },
                { id: 'withdrawal', label: 'Withdrawals' },
              ] as { id: LedgerFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLedgerFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  ledgerFilter === tab.id
                    ? 'bg-[#226B3E] text-white'
                    : 'bg-[#FAF7F2] text-[#5A5248] border border-[#E4DCCF] hover:text-[#1A1612]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ledger Rows */}
          <div className="divide-y divide-[#E4DCCF]">
            {filteredTransactions.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#5A5248]">
                No wallet transactions match the current filter.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isCredit =
                  tx.direction === 'credit' || tx.direction === 'escrow_unlock';
                return (
                  <div
                    key={tx.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          tx.direction === 'credit'
                            ? 'bg-[#226B3E]/15 text-[#226B3E]'
                            : tx.direction === 'escrow_lock'
                            ? 'bg-[#D99B26]/20 text-[#9E6B0E]'
                            : 'bg-[#C85A28]/15 text-[#C85A28]'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : tx.direction === 'escrow_lock' ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F3ECE1] text-[#1A1612]">
                            {tx.referenceCode}
                          </span>
                          <span className="text-xs font-mono text-[#5A5248]">
                            {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] font-mono text-[#5A5248]">
                            • {tx.paymentRail}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-[#1A1612]">
                          {tx.title}
                        </h4>
                        <p className="text-xs text-[#5A5248]">{tx.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div
                        className={`font-mono text-lg font-bold tabular-nums ${
                          isCredit
                            ? 'text-[#226B3E]'
                            : tx.direction === 'escrow_lock'
                            ? 'text-[#B37B14]'
                            : 'text-[#1A1612]'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatPrice(tx.amountUSD, currency)}
                      </div>
                      <div className="text-[11px] font-mono uppercase text-[#5A5248]">
                        {tx.status === 'escrow_held'
                          ? 'Locked in UWA Escrow'
                          : tx.status === 'refunded'
                          ? 'Escrow Released'
                          : 'Completed'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
