import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  Wallet,
  CreditCard,
  ShieldCheck,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';
import { GUIDES, EXPERIENCES } from '../data/seedData';
import { ComfortTier, WalletPaymentRail } from '../types';

export const InquiryModal: React.FC = () => {
  const { isInquiryModalOpen, modalOptions, closeInquiryModal, packageEvents, formatPrice } = useInquiry();
  const { availableBalanceUSD, payPackageDirect } = useWallet();

  const [selectedPackageKey, setSelectedPackageKey] = useState<string>('');
  const [partySize, setPartySize] = useState(2);
  const [targetDates, setTargetDates] = useState('');
  const [budgetTier, setBudgetTier] = useState<ComfortTier>('luxury');
  const [preferredGuideSlug, setPreferredGuideSlug] = useState('');
  const [paymentMode, setPaymentMode] = useState<'deposit_30' | 'full_100'>('deposit_30');
  const [paymentRail, setPaymentRail] = useState<WalletPaymentRail>('MTN Mobile Money Uganda');
  const [relworxMsisdn, setRelworxMsisdn] = useState<string>('+256 772 841 920');
  const [isProcessingRelworx, setIsProcessingRelworx] = useState<boolean>(false);
  const [paymentReceipt, setPaymentReceipt] = useState<{
    referenceCode: string;
    relworxInternalRef?: string;
    amountPaidUSD: number;
    packageTitle: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isInquiryModalOpen) {
      setPreferredGuideSlug(modalOptions.guideSlug || 'samuel-kato');
      const initialSlug =
        modalOptions.experienceSlug ||
        (packageEvents[0] ? `event:${packageEvents[0].id}` : EXPERIENCES[0].slug);
      setSelectedPackageKey(initialSlug);
      setBudgetTier(modalOptions.defaultTier || 'luxury');
      setTargetDates(modalOptions.defaultDates || 'June – September 2027');
      setPaymentReceipt(null);
      setErrorMessage(null);
    }
  }, [isInquiryModalOpen, modalOptions, packageEvents]);

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

  const selectedGuide = GUIDES.find((g) => g.slug === preferredGuideSlug) || GUIDES[0];

  // Resolve package either from packageEvents or EXPERIENCES
  const matchedEvent = selectedPackageKey.startsWith('event:')
    ? packageEvents.find((ev) => `event:${ev.id}` === selectedPackageKey)
    : packageEvents.find(
        (ev) => ev.id === selectedPackageKey || ev.experienceSlug === selectedPackageKey
      );
  const matchedExperience =
    EXPERIENCES.find((e) => e.slug === selectedPackageKey) ||
    (matchedEvent?.experienceSlug
      ? EXPERIENCES.find((e) => e.slug === matchedEvent.experienceSlug)
      : undefined) ||
    EXPERIENCES[0];

  const activeTitle = matchedEvent ? matchedEvent.title : matchedExperience.title;
  const activePerPersonUSD = matchedEvent
    ? matchedEvent.pricePerPersonUSD
    : (
        matchedExperience.priceBands.find((b) => b.tier === budgetTier) ||
        matchedExperience.priceBands[0]
      ).perPersonUSD;

  const totalPackageUSD = Math.round(activePerPersonUSD * partySize);
  const deposit30USD = Math.round(totalPackageUSD * 0.3);
  const amountDueUSD = paymentMode === 'full_100' ? totalPackageUSD : deposit30USD;
  const shortfallUSD = Math.max(0, amountDueUSD - availableBalanceUSD);

  const handleDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessingRelworx(true);

    let relworxInternalRef: string | undefined;

    try {
      if (
        paymentRail === 'MTN Mobile Money Uganda' ||
        paymentRail === 'Airtel Money Uganda' ||
        paymentRail === 'Visa / Mastercard'
      ) {
        const relworxRes = await fetch('/api/relworx/request-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msisdn: relworxMsisdn,
            currency: 'UGX',
            amountUSD: amountDueUSD,
            description: `Enganda Safaris: ${activeTitle} (${partySize} guests)`,
          }),
        });
        const relworxData = await relworxRes.json().catch(() => ({}));
        if (!relworxRes.ok || relworxData.success === false) {
          setErrorMessage(
            relworxData.message || 'Relworx payment gateway could not complete the request.'
          );
          setIsProcessingRelworx(false);
          return;
        }
        relworxInternalRef = relworxData.internal_reference;
      }

      const result = payPackageDirect({
        packageTitle: activeTitle,
        packageIdOrSlug: matchedEvent ? matchedEvent.id : matchedExperience.slug,
        perPersonUSD: activePerPersonUSD,
        guests: partySize,
        paymentType: paymentMode,
        departureDate:
          targetDates || (matchedEvent ? matchedEvent.dateWindow : 'Confirmed 2026/2027'),
        guideName: selectedGuide?.name,
        paymentRail,
        autoTopUpIfShort: true,
      });

      if (!result.ok || !result.transaction) {
        setErrorMessage(result.message);
        setIsProcessingRelworx(false);
        return;
      }

      setPaymentReceipt({
        referenceCode: result.transaction.referenceCode,
        relworxInternalRef,
        amountPaidUSD: result.transaction.amountUSD,
        packageTitle: activeTitle,
        message: relworxInternalRef
          ? `${result.message} Relworx Gateway Ref: ${relworxInternalRef}.`
          : result.message,
      });
    } finally {
      setIsProcessingRelworx(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1612]/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="direct-payment-modal-title"
    >
      <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={closeInquiryModal}
          className="absolute top-4 right-4 p-2 rounded-md text-[#5A5248] hover:text-[#1A1612] hover:bg-[#F3ECE1] transition-colors"
          aria-label="Close direct payment checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentReceipt ? (
          <div className="space-y-5 py-4 text-center">
            <div className="w-12 h-12 rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="inline-block px-3 py-1 rounded-md bg-[#226B3E]/10 text-[#226B3E] text-[11px] font-mono uppercase tracking-wider font-semibold">
              Direct Safari Payment Confirmed • Receipt {paymentReceipt.referenceCode}
            </span>
            <h2
              id="direct-payment-modal-title"
              className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612]"
            >
              Package Paid & Confirmed!
            </h2>
            <p className="text-sm text-[#5A5248] leading-relaxed max-w-md mx-auto">
              {paymentReceipt.message}
            </p>
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-4 text-left text-xs text-[#1A1612] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5A5248]">Package:</span>
                <strong className="text-right">{paymentReceipt.packageTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5248]">Amount Paid Directly:</span>
                <strong className="font-mono text-[#226B3E]">
                  {formatPrice(paymentReceipt.amountPaidUSD)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5248]">Assigned Enganda Specialist:</span>
                <strong>{selectedGuide.name}</strong>
              </div>
              {paymentReceipt.relworxInternalRef && (
                <div className="flex justify-between">
                  <span className="text-[#5A5248]">Relworx Gateway Reference:</span>
                  <strong className="font-mono text-[#226B3E]">
                    {paymentReceipt.relworxInternalRef}
                  </strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#5A5248]">Updated Wallet Balance:</span>
                <strong className="font-mono">{formatPrice(availableBalanceUSD)}</strong>
              </div>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/wallet"
                onClick={closeInquiryModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] text-xs font-semibold transition-colors"
              >
                <Wallet className="w-4 h-4 text-[#D99B26]" />
                <span>View Receipt in Safari Wallet</span>
              </Link>
              <button
                type="button"
                onClick={closeInquiryModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-[#E4DCCF] text-[#1A1612] hover:bg-[#F3ECE1] text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDirectPayment} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Direct Safari Package Checkout • Operated by Enganda Members</span>
              </div>
              <h2
                id="direct-payment-modal-title"
                className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1612] mt-1"
              >
                Book & Pay Directly
              </h2>
              <p className="text-xs text-[#5A5248] mt-1">
                Select your East African package, travelers, and preferred payment option (30% deposit or 100% full package) to confirm immediately.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-xs text-[#B91C1C]">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                Select East African Safari Package *
              </label>
              <select
                value={selectedPackageKey}
                onChange={(e) => setSelectedPackageKey(e.target.value)}
                className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
              >
                <optgroup label="Confirmed Departures & Multi-Country Packages">
                  {packageEvents.map((ev) => (
                    <option key={ev.id} value={`event:${ev.id}`}>
                      {ev.title} — ${ev.pricePerPersonUSD.toLocaleString()}/pp ({ev.durationLabel})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Signature East African Safari Packages">
                  {EXPERIENCES.map((exp) => (
                    <option key={exp.slug} value={exp.slug}>
                      {exp.title} — From ${exp.priceBands[0]?.perPersonUSD.toLocaleString()}/pp ({exp.durationDays} Days)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                  Departure Window
                </label>
                <input
                  type="text"
                  value={targetDates}
                  onChange={(e) => setTargetDates(e.target.value)}
                  placeholder="e.g. Dec 2026 or July 2027"
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Comfort Tier
                </label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value as ComfortTier)}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="mid-range">Mid-Range (4-Star)</option>
                  <option value="luxury">Luxury Lodges</option>
                  <option value="signature">Signature Exclusive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Assigned Enganda Member Guide
                </label>
                <select
                  value={preferredGuideSlug}
                  onChange={(e) => setPreferredGuideSlug(e.target.value)}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  {GUIDES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.name} — {g.homeRegion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Payment Method / Relworx Gateway
                </label>
                <select
                  value={paymentRail}
                  onChange={(e) => setPaymentRail(e.target.value as WalletPaymentRail)}
                  className="w-full bg-white border border-[#E4DCCF] rounded-md px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                >
                  <option value="MTN Mobile Money Uganda">Relworx • MTN Mobile Money</option>
                  <option value="Airtel Money Uganda">Relworx • Airtel Money</option>
                  <option value="Visa / Mastercard">Relworx • Visa &amp; Mastercard / Safari Wallet</option>
                  <option value="International Bank Wire">Ecobank / International Bank Wire</option>
                </select>
              </div>
            </div>

            {(paymentRail === 'MTN Mobile Money Uganda' ||
              paymentRail === 'Airtel Money Uganda') && (
              <div className="bg-white border border-[#226B3E]/30 rounded-md p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#226B3E] font-semibold">
                  <span>RELWORX PAYMENTS API V2 • MOBILE MONEY COLLECTION</span>
                  <a
                    href="https://payments.relworx.com/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#C85A28]"
                  >
                    payments.relworx.com
                  </a>
                </div>
                <label className="block text-xs font-semibold text-[#1A1612]">
                  East Africa Mobile Money Number (International Format e.g. +256...)
                </label>
                <input
                  type="tel"
                  required
                  value={relworxMsisdn}
                  onChange={(e) => setRelworxMsisdn(e.target.value)}
                  placeholder="+256 772 841 920"
                  className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-xs font-mono text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
            )}

            {/* Payment Option Selector: 30% Deposit vs 100% Full Package */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentMode('deposit_30')}
                className={`p-3.5 rounded-md border text-left transition-all ${
                  paymentMode === 'deposit_30'
                    ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#1A1612]'
                    : 'bg-white border-[#E4DCCF] text-[#5A5248] hover:bg-[#F3ECE1]/60'
                }`}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
                  30% Direct Deposit
                </div>
                <div className="font-mono text-lg font-bold text-[#1A1612] mt-0.5">
                  {formatPrice(deposit30USD)}
                </div>
                <div className="text-[11px] text-[#5A5248] mt-0.5">
                  Locks permits & lodges immediately
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('full_100')}
                className={`p-3.5 rounded-md border text-left transition-all ${
                  paymentMode === 'full_100'
                    ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#1A1612]'
                    : 'bg-white border-[#E4DCCF] text-[#5A5248] hover:bg-[#F3ECE1]/60'
                }`}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                  100% Full Package Payment
                </div>
                <div className="font-mono text-lg font-bold text-[#1A1612] mt-0.5">
                  {formatPrice(totalPackageUSD)}
                </div>
                <div className="text-[11px] text-[#5A5248] mt-0.5">
                  {formatPrice(activePerPersonUSD)}/person × {partySize}{' '}
                  {partySize === 1 ? 'guest' : 'guests'}
                </div>
              </button>
            </div>

            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-md p-3.5 text-xs text-[#1A1612] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#5A5248]">Your Current Safari Wallet Balance:</span>
                <strong className="font-mono text-[#226B3E]">
                  {formatPrice(availableBalanceUSD)}
                </strong>
              </div>
              {shortfallUSD > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#5A5248]">
                  <span>Instant Checkout Funding via {paymentRail}:</span>
                  <strong className="font-mono text-[#1A1612]">+{formatPrice(shortfallUSD)}</strong>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#5A5248] border-t border-[#E4DCCF]">
                <ShieldCheck className="w-4 h-4 text-[#226B3E] shrink-0" />
                <span>
                  Direct payment is recorded in the live database with instant permit escrow and official receipt generation.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isProcessingRelworx}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#226B3E] hover:bg-[#194E2D] disabled:opacity-60 text-[#FAF7F2] text-sm font-semibold transition-colors shadow-md cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#D99B26]" />
                <span>
                  {isProcessingRelworx
                    ? 'Processing via Relworx Gateway...'
                    : `Pay ${formatPrice(amountDueUSD)} via Relworx Now`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
