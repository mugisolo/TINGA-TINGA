import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  WalletTransaction,
  WalletPaymentRail,
  PermitEscrowHold,
  PartnerBookingRecord,
  NewsletterSubscription,
  ComfortTier,
  GeneratedSafariItinerary,
  SavedSafariChecklist,
} from '../types';
import {
  PERMIT_FACTS,
  PARTNER_ACCOMMODATIONS,
  EXPERIENCES,
} from '../data/seedData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface WalletState {
  availableBalanceUSD: number;
  escrowBalanceUSD: number;
  rewardCreditsUSD: number;
  transactions: WalletTransaction[];
  permitHolds: PermitEscrowHold[];
  partnerBookings: PartnerBookingRecord[];
  newsletterSubscriptions: NewsletterSubscription[];
  savedItineraries: GeneratedSafariItinerary[];
  savedChecklists: SavedSafariChecklist[];
}

interface WalletContextValue extends WalletState {
  topUpWallet: (
    amountUSD: number,
    paymentRail: WalletPaymentRail,
    note?: string
  ) => { ok: boolean; message: string; transaction?: WalletTransaction };
  withdrawFunds: (
    amountUSD: number,
    paymentRail: WalletPaymentRail,
    destinationAccount: string
  ) => { ok: boolean; message: string; transaction?: WalletTransaction };
  holdPermitInEscrow: (
    permitId: string,
    guests: number,
    preferredTrekDate: string
  ) => { ok: boolean; message: string; hold?: PermitEscrowHold };
  releasePermitEscrow: (
    holdId: string
  ) => { ok: boolean; message: string };
  bookPartnerStay: (
    partnerSlug: string,
    checkInDate: string,
    nights: number,
    guests: number
  ) => { ok: boolean; message: string; booking?: PartnerBookingRecord };
  paySafariDeposit: (
    experienceSlug: string,
    guests: number,
    tier: ComfortTier,
    departureDate: string
  ) => { ok: boolean; message: string; transaction?: WalletTransaction };
  subscribeNewsletter: (input: {
    email: string;
    firstName?: string;
    topics: string[];
    preferredSeason?: string;
  }) => {
    ok: boolean;
    alreadySubscribed: boolean;
    rewardGrantedUSD: number;
    subscription: NewsletterSubscription;
  };
  saveCustomItineraryToWallet: (
    itinerary: GeneratedSafariItinerary
  ) => {
    ok: boolean;
    alreadySaved: boolean;
    message: string;
    savedItinerary: GeneratedSafariItinerary;
  };
  paySavedItineraryDeposit: (
    itineraryId: string
  ) => {
    ok: boolean;
    message: string;
    transaction?: WalletTransaction;
  };
  removeSavedItinerary: (itineraryId: string) => void;
  saveChecklistToWallet: (
    checklist: SavedSafariChecklist
  ) => {
    ok: boolean;
    updatedExisting: boolean;
    message: string;
    savedChecklist: SavedSafariChecklist;
  };
  removeSavedChecklist: (checklistId: string) => void;
  resetWalletToDefault: () => void;
}

const WALLET_STORAGE_KEY = 'enganda_safari_wallet_v2';

function makeCode(prefix: string): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomDigits}`;
}

const INITIAL_WALLET_STATE: WalletState = {
  availableBalanceUSD: 1450,
  escrowBalanceUSD: 800,
  rewardCreditsUSD: 50,
  transactions: [
    {
      id: 'tx-seed-1',
      type: 'deposit',
      title: 'Safari Wallet Top-Up',
      subtitle: 'Initial expedition funding via Visa ending in 4821',
      amountUSD: 2200,
      direction: 'credit',
      status: 'completed',
      paymentRail: 'Visa / Mastercard',
      referenceCode: 'ENG-DEP-409182',
      createdAt: '2026-10-28T09:15:00.000Z',
    },
    {
      id: 'tx-seed-2',
      type: 'permit_escrow',
      title: 'UWA Mountain Gorilla Permit Escrow (1 Guest)',
      subtitle: 'Bwindi Impenetrable NP & Mgahinga Gorilla NP • Held for Official UWA Receipt Verification',
      amountUSD: 800,
      direction: 'escrow_lock',
      status: 'escrow_held',
      paymentRail: 'Visa / Mastercard',
      referenceCode: 'UWA-ESC-773910',
      createdAt: '2026-10-29T14:30:00.000Z',
      metadata: {
        permitId: 'uwa-gorilla-trekking',
        guests: 1,
        trekDate: '2026-12-14',
      },
    },
    {
      id: 'tx-seed-3',
      type: 'expedition_reward',
      title: 'Enganda Welcome Expedition Credit',
      subtitle: 'Entebbe Coordination Desk Direct Booking Credit',
      amountUSD: 50,
      direction: 'credit',
      status: 'completed',
      paymentRail: 'Enganda Expedition Credit',
      referenceCode: 'ENG-RWD-104829',
      createdAt: '2026-11-01T11:00:00.000Z',
    },
  ],
  permitHolds: [
    {
      id: 'hold-seed-1',
      permitId: 'uwa-gorilla-trekking',
      permitName: 'Mountain Gorilla Trekking Permit (Foreign Non-Resident)',
      park: 'Bwindi Impenetrable NP & Mgahinga Gorilla NP',
      guests: 1,
      PreferredTrekDate: '2026-12-14',
      amountHeldUSD: 800,
      uwaReceiptCode: 'UWA-ESC-773910',
      status: 'active_escrow',
      createdAt: '2026-10-29T14:30:00.000Z',
    },
  ],
  partnerBookings: [],
  newsletterSubscriptions: [],
  savedItineraries: [],
  savedChecklists: [],
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem(WALLET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.availableBalanceUSD === 'number') {
          return {
            ...INITIAL_WALLET_STATE,
            ...parsed,
            savedItineraries: Array.isArray(parsed.savedItineraries)
              ? parsed.savedItineraries
              : [],
            savedChecklists: Array.isArray(parsed.savedChecklists)
              ? parsed.savedChecklists
              : [],
          };
        }
      }
    } catch {
      // ignore storage read errors
    }
    return INITIAL_WALLET_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage write errors
    }
  }, [state]);

  // Sync per-user saved_itineraries & saved_checklists from Firestore under active security rules
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      // 1. Load user's saved checklists from Firestore
      try {
        const chkQuery = query(
          collection(db, 'saved_checklists'),
          where('userId', '==', currentUser.uid)
        );
        const chkSnap = await getDocs(chkQuery);
        if (!chkSnap.empty && isMounted) {
          const remoteChecklists: SavedSafariChecklist[] = [];
          chkSnap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.title) {
              remoteChecklists.push({
                id: String(d.id),
                referenceCode: String(d.referenceCode || 'ENG-CHK'),
                title: String(d.title),
                selectedActivities: ['gorilla-trekking', 'savannah-game-drive', 'cultural-visits'],
                checkedItemIds: [],
                customItems: [],
                totalItems: Number(d.totalItems) || 0,
                checkedCount: Number(d.checkedCount) || 0,
                notes: String(d.notes || ''),
                updatedAt: String(d.updatedAt || new Date().toISOString()),
              });
            }
          });
          if (remoteChecklists.length > 0) {
            setState((prev) => {
              const existingIds = new Set(prev.savedChecklists.map((c) => c.id));
              const merged = [
                ...prev.savedChecklists,
                ...remoteChecklists.filter((rc) => !existingIds.has(rc.id)),
              ];
              return { ...prev, savedChecklists: merged };
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'saved_checklists');
        } catch {
          // Logged by handleFirestoreError
        }
      }

      // 2. Load user's saved itineraries from Firestore
      try {
        const itinQuery = query(
          collection(db, 'saved_itineraries'),
          where('userId', '==', currentUser.uid)
        );
        const itinSnap = await getDocs(itinQuery);
        if (!itinSnap.empty && isMounted) {
          const remoteItineraries: GeneratedSafariItinerary[] = [];
          itinSnap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.title) {
              remoteItineraries.push({
                id: String(d.id),
                referenceCode: String(d.referenceCode || 'ENG-ITN'),
                title: String(d.title),
                subtitle: `${d.region} • ${d.durationDays} Days (${d.budgetTier})`,
                region: String(d.region || 'Bwindi & Southwestern Circuit'),
                budgetTier:
                  d.budgetTier === 'luxury' || d.budgetTier === 'signature'
                    ? d.budgetTier
                    : 'mid-range',
                activityFocus: String(d.activityFocus || 'Gorilla & Primate Trekking'),
                durationDays: Number(d.durationDays) || 5,
                partySize: 2,
                estimatedPerPersonUSD: Number(d.estimatedPerPersonUSD) || 2400,
                totalPackageUSD: (Number(d.estimatedPerPersonUSD) || 2400) * 2,
                depositAmountUSD:
                  Number(d.depositAmountUSD) ||
                  Math.round((Number(d.estimatedPerPersonUSD) || 2400) * 0.6),
                matchedGuideSlug: String(d.matchedGuideSlug || 'samuel-kato'),
                matchedGuideName: String(d.matchedGuideName || 'Samuel Kato'),
                matchedGuideReason: 'Matched by regional primate and savannah field expertise.',
                permitBreakdown: [
                  {
                    permitName: 'UWA Mountain Gorilla Trekking Permit',
                    costUSD: 800,
                  },
                ],
                recommendedPartnerStays: ['Mahogany Springs Bwindi', 'Ishasha Wilderness Camp'],
                days: [],
                conservationNote: '20% of UWA park entrance revenue supports frontline host communities.',
                createdAt: String(d.createdAt || new Date().toISOString()),
                depositPaid: Boolean(d.depositPaid),
              });
            }
          });
          if (remoteItineraries.length > 0) {
            setState((prev) => {
              const existingIds = new Set(prev.savedItineraries.map((i) => i.id));
              const merged = [
                ...prev.savedItineraries,
                ...remoteItineraries.filter((ri) => !existingIds.has(ri.id)),
              ];
              return { ...prev, savedItineraries: merged };
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'saved_itineraries');
        } catch {
          // Logged by handleFirestoreError
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const topUpWallet: WalletContextValue['topUpWallet'] = (
    amountUSD,
    paymentRail,
    note
  ) => {
    const cleanAmount = Math.round(Number(amountUSD));
    if (!Number.isFinite(cleanAmount) || cleanAmount < 10) {
      return {
        ok: false,
        message: 'Minimum wallet top-up amount is US$10.',
      };
    }
    if (cleanAmount > 50000) {
      return {
        ok: false,
        message: 'Maximum single transaction top-up is US$50,000.',
      };
    }

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'deposit',
      title: `Safari Wallet Top-Up (${paymentRail})`,
      subtitle: note?.trim()
        ? note.trim()
        : `Instant settlement to Enganda Entebbe Trust Account via ${paymentRail}`,
      amountUSD: cleanAmount,
      direction: 'credit',
      status: 'completed',
      paymentRail,
      referenceCode: makeCode('ENG-DEP'),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD + cleanAmount,
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Added US$${cleanAmount.toLocaleString()} to your Safari Wallet (${tx.referenceCode}).`,
      transaction: tx,
    };
  };

  const withdrawFunds: WalletContextValue['withdrawFunds'] = (
    amountUSD,
    paymentRail,
    destinationAccount
  ) => {
    const cleanAmount = Math.round(Number(amountUSD));
    if (!Number.isFinite(cleanAmount) || cleanAmount < 10) {
      return {
        ok: false,
        message: 'Minimum withdrawal amount is US$10.',
      };
    }
    if (cleanAmount > state.availableBalanceUSD) {
      return {
        ok: false,
        message: `Insufficient available balance. You have US$${state.availableBalanceUSD.toLocaleString()} available (excluding funds locked in UWA Permit Escrow).`,
      };
    }

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'withdrawal',
      title: `Wallet Withdrawal to ${paymentRail}`,
      subtitle: destinationAccount?.trim()
        ? `Transferred to ${destinationAccount.trim()}`
        : `Refunded to registered ${paymentRail} account`,
      amountUSD: cleanAmount,
      direction: 'debit',
      status: 'completed',
      paymentRail,
      referenceCode: makeCode('ENG-WDR'),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD - cleanAmount,
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Withdrew US$${cleanAmount.toLocaleString()} via ${paymentRail} (${tx.referenceCode}).`,
      transaction: tx,
    };
  };

  const holdPermitInEscrow: WalletContextValue['holdPermitInEscrow'] = (
    permitId,
    guests,
    preferredTrekDate
  ) => {
    const permit = PERMIT_FACTS.find((p) => p.id === permitId);
    if (!permit) {
      return { ok: false, message: 'Selected UWA permit tariff was not found.' };
    }
    const cleanGuests = Math.max(1, Math.min(12, Math.round(guests)));
    const totalCostUSD = permit.costUSD * cleanGuests;

    if (totalCostUSD > state.availableBalanceUSD) {
      return {
        ok: false,
        message: `Insufficient available wallet balance. This UWA permit escrow requires US$${totalCostUSD.toLocaleString()}, and your available balance is US$${state.availableBalanceUSD.toLocaleString()}. Please top up your wallet first.`,
      };
    }

    const uwaCode = makeCode('UWA-ESC');
    const nowIso = new Date().toISOString();

    const hold: PermitEscrowHold = {
      id: 'hold_' + Date.now(),
      permitId: permit.id,
      permitName: permit.name,
      park: permit.park,
      guests: cleanGuests,
      PreferredTrekDate: preferredTrekDate || '2026-12-15',
      amountHeldUSD: totalCostUSD,
      uwaReceiptCode: uwaCode,
      status: 'active_escrow',
      createdAt: nowIso,
    };

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'permit_escrow',
      title: `UWA Permit Escrow: ${permit.name}`,
      subtitle: `${cleanGuests} ${cleanGuests === 1 ? 'Guest' : 'Guests'} • Target Trek Date: ${hold.PreferredTrekDate} • ${permit.park}`,
      amountUSD: totalCostUSD,
      direction: 'escrow_lock',
      status: 'escrow_held',
      paymentRail: 'Visa / Mastercard',
      referenceCode: uwaCode,
      createdAt: nowIso,
      metadata: {
        permitId: permit.id,
        guests: cleanGuests,
        trekDate: hold.PreferredTrekDate,
      },
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD - totalCostUSD,
      escrowBalanceUSD: prev.escrowBalanceUSD + totalCostUSD,
      permitHolds: [hold, ...prev.permitHolds],
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Locked US$${totalCostUSD.toLocaleString()} in UWA Permit Escrow (${uwaCode}). Our Entebbe desk releases funds only after sharing your official UWA receipt.`,
      hold,
    };
  };

  const releasePermitEscrow: WalletContextValue['releasePermitEscrow'] = (
    holdId
  ) => {
    const existing = state.permitHolds.find(
      (h) => h.id === holdId && h.status === 'active_escrow'
    );
    if (!existing) {
      return {
        ok: false,
        message: 'Active permit escrow hold was not found.',
      };
    }

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'permit_release',
      title: `Escrow Released to Available Balance: ${existing.permitName}`,
      subtitle: `Released UWA Escrow ${existing.uwaReceiptCode} (${existing.guests} ${existing.guests === 1 ? 'guest' : 'guests'})`,
      amountUSD: existing.amountHeldUSD,
      direction: 'escrow_unlock',
      status: 'refunded',
      paymentRail: 'Enganda Expedition Credit',
      referenceCode: makeCode('UWA-REL'),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD + existing.amountHeldUSD,
      escrowBalanceUSD: Math.max(0, prev.escrowBalanceUSD - existing.amountHeldUSD),
      permitHolds: prev.permitHolds.map((h) =>
        h.id === holdId ? { ...h, status: 'released' } : h
      ),
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Released US$${existing.amountHeldUSD.toLocaleString()} from UWA Escrow back to your available Safari Wallet balance.`,
    };
  };

  const bookPartnerStay: WalletContextValue['bookPartnerStay'] = (
    partnerSlug,
    checkInDate,
    nights,
    guests
  ) => {
    const partner = PARTNER_ACCOMMODATIONS.find((p) => p.slug === partnerSlug);
    if (!partner) {
      return { ok: false, message: 'Selected accommodation partner not found.' };
    }

    const cleanNights = Math.max(1, Math.min(21, Math.round(nights)));
    const cleanGuests = Math.max(1, Math.min(12, Math.round(guests)));
    const roomsNeeded = Math.ceil(cleanGuests / 2);
    const totalCostUSD = partner.pricePerNightUSD * cleanNights * roomsNeeded;

    if (totalCostUSD > state.availableBalanceUSD) {
      return {
        ok: false,
        message: `Insufficient Safari Wallet balance. Booking ${cleanNights} ${cleanNights === 1 ? 'night' : 'nights'} at ${partner.name} requires US$${totalCostUSD.toLocaleString()}, and your available balance is US$${state.availableBalanceUSD.toLocaleString()}.`,
      };
    }

    const voucherCode = makeCode('ENG-STAY');
    const nowIso = new Date().toISOString();

    const booking: PartnerBookingRecord = {
      id: 'stay_' + Date.now(),
      partnerSlug: partner.slug,
      partnerName: partner.name,
      partnerCategory: partner.category,
      region: partner.region,
      checkInDate: checkInDate || '2026-12-12',
      nights: cleanNights,
      guests: cleanGuests,
      totalPaidUSD: totalCostUSD,
      voucherCode,
      createdAt: nowIso,
    };

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'partner_booking',
      title: `Partner ${partner.categoryLabel} Booking: ${partner.name}`,
      subtitle: `${cleanNights} ${cleanNights === 1 ? 'Night' : 'Nights'} (${cleanGuests} ${cleanGuests === 1 ? 'Guest' : 'Guests'}) • Check-in ${booking.checkInDate} • ${partner.region}`,
      amountUSD: totalCostUSD,
      direction: 'debit',
      status: 'completed',
      paymentRail: 'Visa / Mastercard',
      referenceCode: voucherCode,
      createdAt: nowIso,
      metadata: {
        partnerSlug: partner.slug,
        nights: cleanNights,
        guests: cleanGuests,
      },
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD - totalCostUSD,
      partnerBookings: [booking, ...prev.partnerBookings],
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Confirmed ${cleanNights}-night stay at ${partner.name} (${voucherCode}). Paid US$${totalCostUSD.toLocaleString()} from your Safari Wallet.`,
      booking,
    };
  };

  const paySafariDeposit: WalletContextValue['paySafariDeposit'] = (
    experienceSlug,
    guests,
    tier,
    departureDate
  ) => {
    const exp = EXPERIENCES.find((e) => e.slug === experienceSlug);
    if (!exp) {
      return { ok: false, message: 'Selected safari experience was not found.' };
    }

    const band =
      exp.priceBands.find((b) => b.tier === tier) || exp.priceBands[0];
    const cleanGuests = Math.max(1, Math.min(12, Math.round(guests)));
    const totalPackageUSD = band.perPersonUSD * cleanGuests;
    const depositUSD = Math.round(totalPackageUSD * 0.3);

    if (depositUSD > state.availableBalanceUSD) {
      return {
        ok: false,
        message: `Insufficient Safari Wallet balance. The 30% safari deposit for ${exp.title} is US$${depositUSD.toLocaleString()}, and your available balance is US$${state.availableBalanceUSD.toLocaleString()}.`,
      };
    }

    const refCode = makeCode('ENG-SAF');
    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'safari_deposit',
      title: `30% Safari Deposit: ${exp.title}`,
      subtitle: `${cleanGuests} ${cleanGuests === 1 ? 'Guest' : 'Guests'} • ${band.label} • Target Departure: ${departureDate || 'Flexible 2026/2027'}`,
      amountUSD: depositUSD,
      direction: 'debit',
      status: 'completed',
      paymentRail: 'Visa / Mastercard',
      referenceCode: refCode,
      createdAt: new Date().toISOString(),
      metadata: {
        experienceSlug: exp.slug,
        guests: cleanGuests,
        trekDate: departureDate,
      },
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD - depositUSD,
      transactions: [tx, ...prev.transactions],
    }));

    return {
      ok: true,
      message: `Reserved ${exp.title} with a 30% deposit of US$${depositUSD.toLocaleString()} (${refCode}).`,
      transaction: tx,
    };
  };

  const subscribeNewsletter: WalletContextValue['subscribeNewsletter'] = ({
    email,
    firstName,
    topics,
    preferredSeason,
  }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = state.newsletterSubscriptions.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      const updatedSub: NewsletterSubscription = {
        ...existing,
        firstName: firstName?.trim() || existing.firstName,
        topics: topics.length > 0 ? topics : existing.topics,
        preferredSeason: preferredSeason || existing.preferredSeason,
      };
      setState((prev) => ({
        ...prev,
        newsletterSubscriptions: prev.newsletterSubscriptions.map((s) =>
          s.id === existing.id ? updatedSub : s
        ),
      }));
      return {
        ok: true,
        alreadySubscribed: true,
        rewardGrantedUSD: 0,
        subscription: updatedSub,
      };
    }

    const rewardUSD = 50;
    const nowIso = new Date().toISOString();
    const newSub: NewsletterSubscription = {
      id: 'sub_' + Date.now(),
      email: normalizedEmail,
      firstName: firstName?.trim() || undefined,
      topics:
        topics.length > 0
          ? topics
          : ['Safari Updates & Trail Conditions', 'Cultural Insights & Stories'],
      preferredSeason,
      subscribedAt: nowIso,
      rewardClaimed: true,
    };

    const rewardTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'expedition_reward',
      title: 'Join the Expedition Newsletter Credit',
      subtitle: `Awarded to ${normalizedEmail} for subscribing to Enganda Field Dispatches`,
      amountUSD: rewardUSD,
      direction: 'credit',
      status: 'completed',
      paymentRail: 'Enganda Expedition Credit',
      referenceCode: makeCode('ENG-EXP'),
      createdAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD + rewardUSD,
      rewardCreditsUSD: prev.rewardCreditsUSD + rewardUSD,
      newsletterSubscriptions: [newSub, ...prev.newsletterSubscriptions],
      transactions: [rewardTx, ...prev.transactions],
    }));

    return {
      ok: true,
      alreadySubscribed: false,
      rewardGrantedUSD: rewardUSD,
      subscription: newSub,
    };
  };

  const saveCustomItineraryToWallet: WalletContextValue['saveCustomItineraryToWallet'] = (
    itinerary
  ) => {
    const existing = state.savedItineraries.find(
      (item) =>
        item.id === itinerary.id ||
        item.referenceCode === itinerary.referenceCode
    );

    if (existing) {
      return {
        ok: true,
        alreadySaved: true,
        message: `Itinerary ${existing.referenceCode} is already saved in your Safari Wallet.`,
        savedItinerary: existing,
      };
    }

    const sanitizedId = (itinerary.id || `itin_${Date.now()}`).replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );
    const savedItem: GeneratedSafariItinerary = {
      ...itinerary,
      id: sanitizedId,
      depositPaid: Boolean(itinerary.depositPaid),
      createdAt: itinerary.createdAt || new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      savedItineraries: [savedItem, ...prev.savedItineraries],
    }));

    // Sync to Firestore if user is signed in
    if (auth.currentUser) {
      const docPath = `saved_itineraries/${sanitizedId}`;
      setDoc(doc(db, 'saved_itineraries', sanitizedId), {
        id: sanitizedId.slice(0, 128),
        userId: auth.currentUser.uid.slice(0, 128),
        title: savedItem.title.slice(0, 200),
        region: savedItem.region.slice(0, 200),
        budgetTier: savedItem.budgetTier,
        activityFocus: savedItem.activityFocus.slice(0, 200),
        durationDays: savedItem.durationDays,
        estimatedPerPersonUSD: savedItem.estimatedPerPersonUSD,
        depositAmountUSD: savedItem.depositAmountUSD,
        matchedGuideName: savedItem.matchedGuideName.slice(0, 128),
        matchedGuideSlug: savedItem.matchedGuideSlug.slice(0, 128),
        depositPaid: Boolean(savedItem.depositPaid),
        referenceCode: savedItem.referenceCode.slice(0, 64),
        createdAt: savedItem.createdAt.slice(0, 64),
      }).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        } catch {
          // Logged by handleFirestoreError
        }
      });
    }

    return {
      ok: true,
      alreadySaved: false,
      message: `Saved "${savedItem.title}" (${savedItem.referenceCode}) to your Safari Wallet.`,
      savedItinerary: savedItem,
    };
  };

  const paySavedItineraryDeposit: WalletContextValue['paySavedItineraryDeposit'] = (
    itineraryId
  ) => {
    const target = state.savedItineraries.find((i) => i.id === itineraryId);
    if (!target) {
      return { ok: false, message: 'Saved custom itinerary was not found in your wallet.' };
    }
    if (target.depositPaid) {
      return {
        ok: false,
        message: `The 30% deposit for ${target.referenceCode} has already been paid.`,
      };
    }

    const depositUSD = Math.max(50, Math.round(target.depositAmountUSD));
    if (depositUSD > state.availableBalanceUSD) {
      return {
        ok: false,
        message: `Insufficient Safari Wallet balance. The 30% deposit for "${target.title}" is US$${depositUSD.toLocaleString()}, and your available balance is US$${state.availableBalanceUSD.toLocaleString()}. Please top up your wallet first.`,
      };
    }

    const tx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      type: 'safari_deposit',
      title: `30% Custom Safari Deposit: ${target.title}`,
      subtitle: `${target.durationDays} Days • ${target.partySize} ${
        target.partySize === 1 ? 'Guest' : 'Guests'
      } • Led by ${target.matchedGuideName} (${target.referenceCode})`,
      amountUSD: depositUSD,
      direction: 'debit',
      status: 'completed',
      paymentRail: 'Visa / Mastercard',
      referenceCode: target.referenceCode,
      createdAt: new Date().toISOString(),
      metadata: {
        itineraryId: target.id,
        guests: target.partySize,
      },
    };

    setState((prev) => ({
      ...prev,
      availableBalanceUSD: prev.availableBalanceUSD - depositUSD,
      savedItineraries: prev.savedItineraries.map((item) =>
        item.id === itineraryId ? { ...item, depositPaid: true } : item
      ),
      transactions: [tx, ...prev.transactions],
    }));

    if (auth.currentUser) {
      const docPath = `saved_itineraries/${target.id}`;
      setDoc(doc(db, 'saved_itineraries', target.id), {
        id: target.id.slice(0, 128),
        userId: auth.currentUser.uid.slice(0, 128),
        title: target.title.slice(0, 200),
        region: target.region.slice(0, 200),
        budgetTier: target.budgetTier,
        activityFocus: target.activityFocus.slice(0, 200),
        durationDays: target.durationDays,
        estimatedPerPersonUSD: target.estimatedPerPersonUSD,
        depositAmountUSD: target.depositAmountUSD,
        matchedGuideName: target.matchedGuideName.slice(0, 128),
        matchedGuideSlug: target.matchedGuideSlug.slice(0, 128),
        depositPaid: true,
        referenceCode: target.referenceCode.slice(0, 64),
        createdAt: target.createdAt.slice(0, 64),
      }).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        } catch {
          // Logged by handleFirestoreError
        }
      });
    }

    return {
      ok: true,
      message: `Paid 30% deposit of US$${depositUSD.toLocaleString()} for "${target.title}" (${target.referenceCode}).`,
      transaction: tx,
    };
  };

  const removeSavedItinerary: WalletContextValue['removeSavedItinerary'] = (
    itineraryId
  ) => {
    setState((prev) => ({
      ...prev,
      savedItineraries: prev.savedItineraries.filter((i) => i.id !== itineraryId),
    }));

    if (auth.currentUser) {
      const docPath = `saved_itineraries/${itineraryId}`;
      deleteDoc(doc(db, 'saved_itineraries', itineraryId)).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Logged by handleFirestoreError
        }
      });
    }
  };

  const saveChecklistToWallet: WalletContextValue['saveChecklistToWallet'] = (
    checklist
  ) => {
    const sanitizedId = (checklist.id || `chk_${Date.now()}`).replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );
    const existing = state.savedChecklists.find(
      (item) =>
        item.id === sanitizedId ||
        item.referenceCode === checklist.referenceCode
    );

    const savedItem: SavedSafariChecklist = {
      ...checklist,
      id: existing ? existing.id : sanitizedId,
      referenceCode:
        checklist.referenceCode ||
        (existing ? existing.referenceCode : makeCode('ENG-CHK')),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      savedChecklists: existing
        ? prev.savedChecklists.map((item) =>
            item.id === existing.id ? savedItem : item
          )
        : [savedItem, ...prev.savedChecklists],
    }));

    if (auth.currentUser) {
      const docPath = `saved_checklists/${savedItem.id}`;
      setDoc(doc(db, 'saved_checklists', savedItem.id), {
        id: savedItem.id.slice(0, 128),
        userId: auth.currentUser.uid.slice(0, 128),
        referenceCode: savedItem.referenceCode.slice(0, 64),
        title: savedItem.title.slice(0, 200),
        totalItems: Number(savedItem.totalItems) || 0,
        checkedCount: Number(savedItem.checkedCount) || 0,
        notes: (savedItem.notes || '').slice(0, 1000),
        updatedAt: savedItem.updatedAt.slice(0, 64),
      }).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        } catch {
          // Logged by handleFirestoreError
        }
      });
    }

    return {
      ok: true,
      updatedExisting: Boolean(existing),
      message: existing
        ? `Updated "${savedItem.title}" (${savedItem.referenceCode}) in your Safari Wallet.`
        : `Saved "${savedItem.title}" (${savedItem.referenceCode}) to your Safari Wallet.`,
      savedChecklist: savedItem,
    };
  };

  const removeSavedChecklist: WalletContextValue['removeSavedChecklist'] = (
    checklistId
  ) => {
    setState((prev) => ({
      ...prev,
      savedChecklists: prev.savedChecklists.filter((c) => c.id !== checklistId),
    }));

    if (auth.currentUser) {
      const docPath = `saved_checklists/${checklistId}`;
      deleteDoc(doc(db, 'saved_checklists', checklistId)).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Logged by handleFirestoreError
        }
      });
    }
  };

  const resetWalletToDefault = () => {
    setState(INITIAL_WALLET_STATE);
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        topUpWallet,
        withdrawFunds,
        holdPermitInEscrow,
        releasePermitEscrow,
        bookPartnerStay,
        paySafariDeposit,
        subscribeNewsletter,
        saveCustomItineraryToWallet,
        paySavedItineraryDeposit,
        removeSavedItinerary,
        saveChecklistToWallet,
        removeSavedChecklist,
        resetWalletToDefault,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return ctx;
}
