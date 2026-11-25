import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  CreditCard,
  Smartphone,
  FileText,
  Sparkles,
  Award,
  Terminal,
} from 'lucide-react';
import {
  ConciergeMessage,
  AutonomousBookingQuote,
  AutonomousBookingConfirmation,
  Currency,
} from '../types';
import {
  askGuideMatcherConcierge,
  buildQuoteFromPackage,
  buildBookingConfirmation,
} from '../concierge/conciergeEngine';
import { GUIDES, EXPERIENCES } from '../data/seedData';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { formatPrice } from '../lib/currency';

const QUICK_PROMPTS = [
  'Check availability & quote for Enganda E5 Ankole & Bwindi',
  'Quote Tingatinga T5 12-Day Luxury Safari for 2 guests',
  'Switch currency to UGX and quote 3-Day Bwindi Gorillas',
  'Show UTB/UWA Volunteer Programs & Fundraisers',
];

const CURRENCY_OPTIONS: Currency[] = ['UGX', 'USD', 'EUR', 'GBP'];

export const ConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { currency, setCurrency, openInquiryModal } = useInquiry();
  const { availableBalanceUSD, payPackageDirect } = useWallet();

  const [activeQuote, setActiveQuote] = useState<AutonomousBookingQuote>(() =>
    buildQuoteFromPackage({
      packageQuery: 'pkg-enganda-e5-ankole-cattle-mburo-bwindi',
      guests: 2,
      currency,
    })
  );
  const [activeBooking, setActiveBooking] =
    useState<AutonomousBookingConfirmation | null>(null);
  const [executedToolsLog, setExecutedToolsLog] = useState<string[]>([
    'check_availability',
    'calculate_quote',
  ]);
  const [clientName, setClientName] = useState('Enganda Marketplace Traveler');
  const [clientEmail, setClientEmail] = useState('traveler@engandasafaris.com');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    AutonomousBookingConfirmation['paymentMethod']
  >('wallet_balance');
  const [checkoutReceiptBanner, setCheckoutReceiptBanner] = useState<
    string | null
  >(null);

  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Oli otya! I'm your **Autonomous Agentic Safari Planner** (powered by our Go GenAI backend). I can verify real-time **UTB/UWA** availability, calculate itemized quotes in **UGX, USD, EUR, or GBP**, generate your UWA permit escrow invoice, and complete your payment checkout autonomously. Expand this window for our full split-view planning & checkout workspace!",
      suggestedGuideSlugs: ['grace-akello', 'david-mukasa'],
      suggestedExperienceSlugs: [
        '9-day-enganda-e5-ankole-cattle-mburo-walking-bwindi',
        '12-day-tingatinga-t5-ultimate-luxury-gorillas-nile-kidepo',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isExpanded]);

  // Keep quote currency synced when global wallet currency changes
  useEffect(() => {
    setActiveQuote((prev) =>
      buildQuoteFromPackage({
        packageQuery: prev.packageId,
        guests: prev.guests,
        departureDate: prev.departureDate,
        currency,
        includeGorillaPermits: prev.includesGorillaPermit,
      })
    );
  }, [currency]);

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || loading) return;

    const userMsg: ConciergeMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput('');
    setLoading(true);
    setCheckoutReceiptBanner(null);

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    const reply = await askGuideMatcherConcierge(text, history, currency);

    if (reply.appliedCurrency && reply.appliedCurrency !== currency) {
      setCurrency(reply.appliedCurrency);
    }
    if (reply.activeQuote) {
      setActiveQuote(reply.activeQuote);
    }
    if (reply.activeBooking) {
      setActiveBooking(reply.activeBooking);
    }
    if (reply.executedTools && reply.executedTools.length > 0) {
      setExecutedToolsLog(reply.executedTools);
    }

    const botMsg: ConciergeMessage = {
      id: `m-${Date.now()}`,
      role: 'model',
      text: reply.text,
      suggestedGuideSlugs: reply.suggestedGuideSlugs,
      suggestedExperienceSlugs: reply.suggestedExperienceSlugs,
    };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const handleAutonomousToolCurrencySwitch = (targetCur: Currency) => {
    setCurrency(targetCur);
    const updatedQuote = buildQuoteFromPackage({
      packageQuery: activeQuote.packageId,
      guests: activeQuote.guests,
      departureDate: activeQuote.departureDate,
      currency: targetCur,
      includeGorillaPermits: activeQuote.includesGorillaPermit,
    });
    setActiveQuote(updatedQuote);
    setExecutedToolsLog((prev) =>
      Array.from(new Set([...prev, 'apply_wallet_currency', 'calculate_quote']))
    );
  };

  const handleAutonomousCreateBooking = () => {
    const booking = buildBookingConfirmation(activeQuote, {
      clientName,
      clientEmail,
      paymentMethod: selectedPaymentMethod,
      status: 'pending_payment',
    });
    setActiveBooking(booking);
    setExecutedToolsLog((prev) =>
      Array.from(new Set([...prev, 'create_booking']))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `m-bk-${Date.now()}`,
        role: 'model',
        text: `Executed \`create_booking\`: Generated Booking **#${booking.bookingId}** and UWA Permit Escrow Invoice **#${booking.invoiceNumber}** for **${activeQuote.packageTitle}** (${activeQuote.guests} guests — ${formatPrice(activeQuote.totalUSD, currency)}). Ready for immediate autonomous checkout.`,
      },
    ]);
  };

  const handleAutonomousPaymentCheckout = () => {
    const railMap: Record<
      AutonomousBookingConfirmation['paymentMethod'],
      | 'Enganda Expedition Credit'
      | 'MTN Mobile Money Uganda'
      | 'Airtel Money Uganda'
      | 'Visa / Mastercard'
      | 'International Bank Wire'
    > = {
      wallet_balance: 'Enganda Expedition Credit',
      mtn_momo: 'MTN Mobile Money Uganda',
      airtel_money: 'Airtel Money Uganda',
      visa_mastercard: 'Visa / Mastercard',
      bank_transfer: 'International Bank Wire',
    };

    const paymentResult = payPackageDirect({
      packageIdOrSlug: activeQuote.packageId,
      packageTitle: activeQuote.packageTitle,
      perPersonUSD: activeQuote.pricePerPersonUSD,
      guests: activeQuote.guests,
      paymentType: 'full_100',
      departureDate: activeQuote.departureDate,
      guideName: activeQuote.leadGuideName,
      paymentRail: railMap[selectedPaymentMethod],
      autoTopUpIfShort: true,
    });

    const confirmedBooking = buildBookingConfirmation(activeQuote, {
      clientName,
      clientEmail,
      paymentMethod: selectedPaymentMethod,
      status: 'confirmed_paid',
    });
    if (paymentResult.transaction?.referenceCode) {
      confirmedBooking.receiptId = paymentResult.transaction.referenceCode;
    }

    setActiveBooking(confirmedBooking);
    setExecutedToolsLog((prev) =>
      Array.from(
        new Set([...prev, 'create_booking', 'process_payment_checkout'])
      )
    );
    const receiptMsg = `Autonomous Settlement Complete! Booking #${confirmedBooking.bookingId} paid via ${selectedPaymentMethod.toUpperCase()} (${formatPrice(activeQuote.totalUSD, currency)}). Official Receipt: #${confirmedBooking.receiptId} • UWA Escrow Ref: ${confirmedBooking.uwaEscrowReference}.`;
    setCheckoutReceiptBanner(receiptMsg);
    setMessages((prev) => [
      ...prev,
      {
        id: `m-pay-${Date.now()}`,
        role: 'model',
        text: `Executed \`process_payment_checkout\`: **${receiptMsg}** Your UWA permits and specialist guide (${activeQuote.leadGuideName}) are now locked in escrow.`,
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] px-4 py-3 rounded-full shadow-xl border border-[#D99B26]/50 transition-all cursor-pointer"
            aria-label="Open Autonomous Agentic Safari Planner"
          >
            <Compass className="w-5 h-5 text-[#D99B26]" />
            <span className="text-xs sm:text-sm font-semibold">
              Autonomous Safari Planner
            </span>
          </button>
        )}
      </div>

      {/* Backdrop when Expanded to Full-Screen Split-View Workspace */}
      {isOpen && isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1612]/75 backdrop-blur-xs transition-opacity print:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Widget Container: Transitions seamlessly between Compact Corner Drawer and Expanded Full-Screen Split-View Modal Workspace */}
      {isOpen && (
        <div
          className={
            isExpanded
              ? 'fixed inset-3 sm:inset-6 lg:inset-10 z-50 bg-[#FAF7F2] border-2 border-[#D99B26] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden'
              : 'fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[450px] h-[630px] max-h-[86vh] bg-[#FAF7F2] border border-[#D6CEC2] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden'
          }
        >
          {/* Top Header Bar with Expand / Full-Screen Toggle Button */}
          <div className="bg-[#144225] text-[#FAF7F2] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-white/15 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#D99B26]/20 border border-[#D99B26] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base sm:text-lg font-bold leading-tight truncate">
                    Autonomous Agentic Safari Planner
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1612] text-[#D99B26] font-mono text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Go GenAI SDK • Zero HITM</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#E4DCCF] font-mono truncate">
                  UTB &amp; UWA Verified • Multi-Currency Quote, Booking &amp; Direct Wallet Checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs font-semibold transition-colors cursor-pointer"
                title={
                  isExpanded
                    ? 'Minimize to Compact Corner Widget'
                    : 'Expand to Full-Screen Split-View Planning & Checkout Workspace'
                }
                aria-label={
                  isExpanded
                    ? 'Minimize Safari Planner'
                    : 'Expand Safari Planner to Full-Screen Workspace'
                }
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span className="hidden sm:inline">Compact View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>Expand Workspace</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-[#D6CEC2] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Safari Planner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Workspace Grid: Single Column in Compact Mode, 12-Col Split-View in Expanded Mode */}
          <div
            className={`flex-1 min-h-0 ${
              isExpanded
                ? 'grid grid-cols-1 lg:grid-cols-12'
                : 'flex flex-col'
            }`}
          >
            {/* LEFT PANE: Agentic Chat & Guide/Package Recommendations */}
            <div
              className={`flex flex-col min-h-0 ${
                isExpanded
                  ? 'lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#E4DCCF]'
                  : 'flex-1'
              }`}
            >
              {/* Active Agentic Tool Pipeline Bar */}
              <div className="px-4 py-2 bg-white border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                    <Terminal className="w-3 h-3 text-[#226B3E]" />
                    <span>Tools Wired:</span>
                  </span>
                  {[
                    'check_availability',
                    'calculate_quote',
                    'apply_wallet_currency',
                    'create_booking',
                    'process_payment_checkout',
                  ].map((tool) => {
                    const ran = executedToolsLog.includes(tool);
                    return (
                      <span
                        key={tool}
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] border ${
                          ran
                            ? 'bg-[#226B3E] text-white border-[#226B3E] font-bold'
                            : 'bg-[#FAF7F2] text-[#5A5248] border-[#E4DCCF]'
                        }`}
                      >
                        {tool}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const matchedGuides = (msg.suggestedGuideSlugs || [])
                    .map((s) => GUIDES.find((g) => g.slug === s))
                    .filter(Boolean);

                  const matchedExps = (msg.suggestedExperienceSlugs || [])
                    .map((s) => EXPERIENCES.find((e) => e.slug === s))
                    .filter(Boolean);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-[#226B3E] text-[#FAF7F2]'
                            : 'bg-white text-[#1A1612] border border-[#E4DCCF] shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Matched Guides Cards */}
                      {matchedGuides.length > 0 && (
                        <div className="mt-2 w-full max-w-[92%] grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchedGuides.map((g) =>
                            g ? (
                              <div
                                key={g.id}
                                className="bg-white border border-[#D6CEC2] rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={g.photo}
                                    alt={g.name}
                                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#226B3E]"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-serif font-bold text-sm text-[#1A1612] truncate">
                                      {g.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-[#5A5248] truncate">
                                      {g.tagline}
                                    </div>
                                  </div>
                                </div>
                                <Link
                                  to={`/guides/${g.slug}`}
                                  onClick={() => {
                                    setIsExpanded(false);
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#226B3E] text-white rounded hover:bg-[#194E2D] shrink-0"
                                >
                                  Profile
                                </Link>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Matched Experiences Cards */}
                      {matchedExps.length > 0 && (
                        <div className="mt-2 w-full max-w-[92%] space-y-1.5">
                          {matchedExps.map((e) =>
                            e ? (
                              <div
                                key={e.id}
                                className="bg-white border border-[#E4DCCF] hover:border-[#226B3E] rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="font-semibold text-[#1A1612] truncate">
                                    {e.title}
                                  </div>
                                  <div className="font-mono text-[10px] text-[#5A5248]">
                                    {e.durationDays} Days · From{' '}
                                    {formatPrice(
                                      e.twoPaxSharingPriceUSD ||
                                        e.priceBands[0]?.perPersonUSD ||
                                        1950,
                                      currency
                                    )}{' '}
                                    pp
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const q = buildQuoteFromPackage({
                                        packageQuery: e.slug,
                                        guests: activeQuote.guests,
                                        currency,
                                      });
                                      setActiveQuote(q);
                                      setExecutedToolsLog((prev) =>
                                        Array.from(
                                          new Set([
                                            ...prev,
                                            'check_availability',
                                            'calculate_quote',
                                          ])
                                        )
                                      );
                                      if (!isExpanded) setIsExpanded(true);
                                    }}
                                    className="px-2.5 py-1 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-[10px] font-bold cursor-pointer"
                                  >
                                    Load in Checkout
                                  </button>
                                  <Link
                                    to={`/experiences/${e.slug}`}
                                    onClick={() => {
                                      setIsExpanded(false);
                                      setIsOpen(false);
                                    }}
                                    className="p-1 text-[#226B3E] hover:text-[#C85A28]"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="text-xs font-mono text-[#5A5248] animate-pulse">
                    Executing Go GenAI tools (check_availability • calculate_quote)...
                  </div>
                )}

                {/* Compact-Mode Quick Quote Summary Strip (encourages expanding to full checkout terminal) */}
                {!isExpanded && activeQuote && (
                  <div className="bg-white border-2 border-[#226B3E] rounded-xl p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#226B3E]">
                        Active Quote #{activeQuote.quoteId} • {activeQuote.operatorName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="font-mono text-[10px] font-bold text-[#C85A28] hover:underline cursor-pointer"
                      >
                        Open Checkout Terminal →
                      </button>
                    </div>
                    <div className="text-xs font-bold text-[#1A1612] line-clamp-1">
                      {activeQuote.packageTitle}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E4DCCF]">
                      <div className="font-mono text-xs font-bold text-[#226B3E]">
                        {activeQuote.guests} Guests:{' '}
                        {formatPrice(activeQuote.totalUSD, currency)}
                      </div>
                      <button
                        type="button"
                        onClick={handleAutonomousPaymentCheckout}
                        className="px-3 py-1 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-[10px] font-bold cursor-pointer"
                      >
                        Instant Wallet Pay
                      </button>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-4 py-2 bg-[#F3ECE1] border-t border-[#E4DCCF] flex flex-wrap gap-1.5 shrink-0">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="text-[11px] bg-white hover:bg-[#226B3E] hover:text-white text-[#1A1612] border border-[#D6CEC2] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-[#E4DCCF] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask to check availability, calculate a quote in UGX/USD, or book & pay..."
                  className="flex-1 text-xs sm:text-sm bg-[#FAF7F2] border border-[#D6CEC2] rounded-lg px-3.5 py-2.5 text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] disabled:opacity-50 text-white transition-colors cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* RIGHT PANE (Expanded Split-View Workspace): Autonomous Sales, Quote & Payment Checkout Terminal */}
            {isExpanded && (
              <div className="lg:col-span-5 bg-white p-5 sm:p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                        Autonomous Sales &amp; Checkout Terminal
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#1A1612]">
                        Zero Human-in-the-Middle Settlement
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E4DCCF] font-mono text-xs font-bold text-[#1A1612]">
                      #{activeQuote.quoteId}
                    </span>
                  </div>

                  {checkoutReceiptBanner && (
                    <div className="bg-[#226B3E] text-white rounded-xl p-3.5 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#D99B26]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>AUTONOMOUS CHECKOUT CONFIRMED</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {checkoutReceiptBanner}
                      </p>
                    </div>
                  )}

                  {/* Active Package & UTB/UWA Verification Card */}
                  <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#226B3E]/30 text-[#226B3E] font-mono text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>UTB: {activeQuote.utbLicenseNumber}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#C85A28]/30 text-[#C85A28] font-mono text-[10px] font-bold">
                        <Award className="w-3 h-3" />
                        <span>UWA: {activeQuote.uwaAccreditationId}</span>
                      </span>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] uppercase text-[#5A5248] font-bold">
                        {activeQuote.operatorName} • Lead Specialist:{' '}
                        {activeQuote.leadGuideName}
                      </div>
                      <h5 className="font-serif text-lg font-bold text-[#1A1612] leading-snug mt-0.5">
                        {activeQuote.packageTitle}
                      </h5>
                      <div className="font-mono text-xs text-[#226B3E] mt-1">
                        {activeQuote.departureDate} • {activeQuote.durationLabel}
                      </div>
                    </div>

                    {/* Guest Count & Currency Controls (Invokes apply_wallet_currency & calculate_quote) */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4DCCF]">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-bold mb-1">
                          Travelers (Guests)
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 4, 6].map((gCount) => (
                            <button
                              key={gCount}
                              type="button"
                              onClick={() =>
                                setActiveQuote(
                                  buildQuoteFromPackage({
                                    packageQuery: activeQuote.packageId,
                                    guests: gCount,
                                    departureDate: activeQuote.departureDate,
                                    currency,
                                    includeGorillaPermits:
                                      activeQuote.includesGorillaPermit,
                                  })
                                )
                              }
                              className={`flex-1 py-1.5 rounded font-mono text-xs font-bold border cursor-pointer ${
                                activeQuote.guests === gCount
                                  ? 'bg-[#1A1612] text-[#D99B26] border-[#1A1612]'
                                  : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                              }`}
                            >
                              {gCount}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-bold mb-1">
                          Wallet Currency
                        </label>
                        <div className="flex items-center gap-1">
                          {CURRENCY_OPTIONS.map((cur) => (
                            <button
                              key={cur}
                              type="button"
                              onClick={() =>
                                handleAutonomousToolCurrencySwitch(cur)
                              }
                              className={`flex-1 py-1.5 rounded font-mono text-[11px] font-bold border cursor-pointer ${
                                currency === cur
                                  ? 'bg-[#226B3E] text-white border-[#226B3E]'
                                  : 'bg-white text-[#1A1612] border-[#E4DCCF]'
                              }`}
                            >
                              {cur}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Itemized Quote Ledger */}
                    <div className="bg-white rounded-lg p-3 border border-[#E4DCCF] space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-[#5A5248]">
                        <span>
                          Tariff ({activeQuote.guests} × $
                          {activeQuote.pricePerPersonUSD.toLocaleString()})
                        </span>
                        <span className="font-semibold text-[#1A1612]">
                          {formatPrice(activeQuote.totalUSD, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#226B3E]">
                        <span>Incl. UWA Primate Permits Escrow</span>
                        <span className="font-semibold">
                          {formatPrice(activeQuote.uwaPermitsTotalUSD, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#5A5248]">
                        <span>Incl. 3% UWA Conservation Pledge</span>
                        <span>
                          {formatPrice(activeQuote.conservationLevyUSD, currency)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#E4DCCF] flex items-baseline justify-between">
                        <span className="font-bold text-[#1A1612] uppercase">
                          Total Settlement ({currency})
                        </span>
                        <span className="text-base font-bold text-[#226B3E]">
                          {formatPrice(activeQuote.totalUSD, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Details & Payment Method Selector */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-bold mb-1">
                          Lead Traveler Name
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E4DCCF] bg-[#FAF7F2] text-xs text-[#1A1612]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-bold mb-1">
                          Escrow Receipt Email
                        </label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E4DCCF] bg-[#FAF7F2] text-xs text-[#1A1612]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#5A5248] font-bold mb-1.5">
                        <span>Settlement Channel</span>
                        <span className="text-[#226B3E]">
                          Wallet Power: {formatPrice(availableBalanceUSD, currency)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          {
                            id: 'wallet_balance' as const,
                            label: 'Safari Wallet Balance',
                            icon: Wallet,
                          },
                          {
                            id: 'mtn_momo' as const,
                            label: 'Relworx MTN MoMo',
                            icon: Smartphone,
                          },
                          {
                            id: 'airtel_money' as const,
                            label: 'Relworx Airtel Money',
                            icon: Smartphone,
                          },
                          {
                            id: 'visa_mastercard' as const,
                            label: 'Visa / Mastercard',
                            icon: CreditCard,
                          },
                        ].map((m) => {
                          const IconComp = m.icon;
                          const active = selectedPaymentMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSelectedPaymentMethod(m.id)}
                              className={`p-2 rounded-lg border text-left flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#1A1612] text-white border-[#1A1612]'
                                  : 'bg-[#FAF7F2] text-[#1A1612] border-[#E4DCCF] hover:border-[#226B3E]'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                              <span className="truncate">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Autonomous Action Buttons: create_booking & process_payment_checkout */}
                <div className="space-y-2 pt-4 border-t border-[#E4DCCF]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAutonomousCreateBooking}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1A1612] border border-[#E4DCCF] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#226B3E]" />
                      <span>1. Lock Invoice (create_booking)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAutonomousPaymentCheckout}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        2. Pay {formatPrice(activeQuote.totalUSD, currency)} Now
                      </span>
                    </button>
                  </div>

                  {activeBooking && (
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <span className="font-bold text-[#1A1612]">
                          {activeBooking.bookingId}
                        </span>{' '}
                        • <span>{activeBooking.invoiceNumber}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          activeBooking.status === 'confirmed_paid'
                            ? 'bg-[#226B3E] text-white'
                            : 'bg-[#D99B26]/20 text-[#C85A28]'
                        }`}
                      >
                        {activeBooking.status === 'confirmed_paid'
                          ? `PAID (${activeBooking.receiptId})`
                          : 'INVOICE LOCKED'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
