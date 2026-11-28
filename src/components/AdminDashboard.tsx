import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUpRight,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Calendar,
  Sparkles,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
  testFirestoreConnection,
  DatabaseConnectionStatus,
  resolvedDatabaseId,
  firebaseConfig,
} from '../lib/firebase';
import {
  ConfirmedPackageEvent,
  EventDisplayPlacement,
  FooterPartnerLogo,
} from '../types';
import {
  GUIDES,
  DEFAULT_POWERED_BY_TEXT,
  drivePhotoUrl,
  SHARED_DRIVE_MEDIA_VAULT,
  SHARED_GOOGLE_DRIVE_FOLDER_URL,
} from '../data/seedData';
import { formatPrice } from '../lib/currency';
import { ServiceProviderPackageAIBuilder } from './ServiceProviderPackageAIBuilder';
import { CmsErpBackendConsole } from './CmsErpBackendConsole';

interface AdminDashboardProps {
  initialTab?: 'events' | 'logos' | 'both';
  onNotify?: (type: 'success' | 'error', text: string) => void;
}

const ATTACHED_LOGO_PRESETS: {
  label: string;
  name: string;
  subtitle: string;
  url: string;
  category: FooterPartnerLogo['category'];
}[] = [
  {
    label: 'UWA (Uganda Wildlife Authority)',
    name: 'UWA',
    subtitle: 'Uganda Wildlife Authority',
    url: '/assets/aistudio/UWA_f423bf74.png',
    category: 'Government & Conservation',
  },
  {
    label: 'UTB (Uganda Tourism Board)',
    name: 'UTB',
    subtitle: 'Uganda Tourism Board',
    url: '/assets/aistudio/UTB_08177dce.png',
    category: 'Government & Conservation',
  },
  {
    label: 'ECO Bank (Ecobank Pan-African Bank)',
    name: 'ECO Bank',
    subtitle: 'Ecobank Pan-African Banking & Escrow Partner',
    url: '/assets/aistudio/ecobank.svg',
    category: 'Banking & Fintech',
  },
  {
    label: 'FINCA Uganda',
    name: 'FINCA',
    subtitle: 'FINCA Banking & Microfinance Partner',
    url: '/assets/aistudio/finca_84848a21.png',
    category: 'Banking & Fintech',
  },
  {
    label: 'RELWORX Payment Gateway',
    name: 'RELWORX',
    subtitle: 'Digital Payments & Escrow Infrastructure',
    url: '/assets/aistudio/relworx_9ec37c45.jfif',
    category: 'Banking & Fintech',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'both',
  onNotify,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const { transactions, savedItineraries, permitHolds, partnerBookings } = useWallet();
  const {
    currency,
    safariEvents,
    carouselEvents,
    upcomingEvents,
    addSafariEvent,
    updateSafariEvent,
    updateSafariEventPlacement,
    deleteSafariEvent,
    resetSafariEventsToDefault,
    footerLogos,
    activeFooterLogos,
    poweredByText,
    setPoweredByText,
    addFooterLogo,
    updateFooterLogo,
    deleteFooterLogo,
    resetFooterLogosToDefault,
    firestoreSyncStatus,
    syncAllSystemDataToFirestore,
  } = useInquiry();

  const [dbConnStatus, setDbConnStatus] = useState<DatabaseConnectionStatus | null>(null);
  const [isTestingDb, setIsTestingDb] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    testFirestoreConnection().then((res) => {
      if (active) setDbConnStatus(res);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleVerifyAndSyncFirestore = async () => {
    setIsTestingDb(true);
    try {
      const conn = await testFirestoreConnection();
      setDbConnStatus(conn);
      if (user) {
        const syncRes = await syncAllSystemDataToFirestore();
        notify(syncRes.ok ? 'success' : 'error', syncRes.message);
      } else {
        notify(
          conn.connected ? 'success' : 'error',
          `${conn.statusMessage} (${conn.latencyMs}ms). Sign in with Google to write & sync admin records to Firestore.`
        );
      }
    } finally {
      setIsTestingDb(false);
    }
  };

  const [localBanner, setLocalBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    if (onNotify) {
      onNotify(type, text);
    } else {
      setLocalBanner({ type, text });
      setTimeout(() => {
        setLocalBanner((prev) => (prev?.text === text ? null : prev));
      }, 5000);
    }
  };

  // --- Event & Trip Upload / Replace Form State ---
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtShortTab, setEvtShortTab] = useState('');
  const [evtSubtitle, setEvtSubtitle] = useState('');
  const [evtTag, setEvtTag] = useState('CONFIRMED EXPEDITION');
  const [evtCategory, setEvtCategory] = useState<ConfirmedPackageEvent['category']>(
    'Guaranteed Primate Departure'
  );
  const [evtDateWindow, setEvtDateWindow] = useState('15 – 20 Feb 2027');
  const [evtDurationLabel, setEvtDurationLabel] = useState('6 Days / 5 Nights');
  const [evtLocation, setEvtLocation] = useState(
    'Bwindi Impenetrable NP & Queen Elizabeth NP'
  );
  const [evtSpots, setEvtSpots] = useState<number>(4);
  const [evtPriceUSD, setEvtPriceUSD] = useState<number>(2450);
  const [evtGuideSlug, setEvtGuideSlug] = useState<string>(
    GUIDES[0]?.slug || 'samuel-kato'
  );
  const [evtImage, setEvtImage] = useState<string>(
    drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE')
  );
  const [evtHighlightsText, setEvtHighlightsText] = useState<string>(
    'Guaranteed UWA Mountain Gorilla & Chimpanzee permits in escrow\nPrivate 4x4 Extended Land Cruiser with pop-up photographic roof\nFull-board luxury eco-lodge stays & Entebbe airport VIP pickup'
  );
  const [showOnCarousel, setShowOnCarousel] = useState<boolean>(true);
  const [showOnUpcoming, setShowOnUpcoming] = useState<boolean>(true);

  const computedPlacement: EventDisplayPlacement =
    showOnCarousel && showOnUpcoming
      ? 'both'
      : showOnCarousel
      ? 'carousel'
      : 'upcoming';

  const startEditingEvent = (ev: ConfirmedPackageEvent) => {
    setEditingEventId(ev.id);
    setEvtTitle(ev.title);
    setEvtShortTab(ev.shortTabLabel || ev.title.slice(0, 20));
    setEvtSubtitle(ev.subtitle || '');
    setEvtTag(ev.eventTag || 'CONFIRMED EXPEDITION');
    setEvtCategory(ev.category);
    setEvtDateWindow(ev.dateWindow);
    setEvtDurationLabel(ev.durationLabel);
    setEvtLocation(ev.location);
    setEvtSpots(ev.spotsRemaining);
    setEvtPriceUSD(ev.pricePerPersonUSD);
    setEvtGuideSlug(ev.leadGuideSlug);
    setEvtImage(ev.heroImage);
    setEvtHighlightsText((ev.highlights || []).join('\n'));
    const pl = ev.placement || 'both';
    setShowOnCarousel(pl === 'carousel' || pl === 'both');
    setShowOnUpcoming(pl === 'upcoming' || pl === 'both');
  };

  // --- Footer Logo Form State ---
  const [logoName, setLogoName] = useState('');
  const [logoSubtitle, setLogoSubtitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('/assets/aistudio/UWA_f423bf74.png');
  const [logoCategory, setLogoCategory] = useState<FooterPartnerLogo['category']>(
    'Strategic Partner'
  );
  const [logoWebsite, setLogoWebsite] = useState('');
  const [logoOrder, setLogoOrder] = useState<number>(footerLogos.length + 1);
  const [editingLogoId, setEditingLogoId] = useState<string | null>(null);
  const [draftPoweredBy, setDraftPoweredBy] = useState<string>(poweredByText);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        if (!logoName.trim()) {
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setLogoName(baseName.toUpperCase());
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;

    const highlightsList = evtHighlightsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      title: evtTitle.trim(),
      shortTabLabel: evtShortTab.trim() || evtTitle.trim().slice(0, 20),
      subtitle:
        evtSubtitle.trim() ||
        `${evtDurationLabel} guided expedition in ${evtLocation}`,
      eventTag: evtTag.trim() || 'CONFIRMED EXPEDITION',
      category: evtCategory,
      dateWindow: evtDateWindow.trim() || 'Upcoming 2026/2027',
      durationLabel: evtDurationLabel.trim() || '5 Days / 4 Nights',
      location: evtLocation.trim() || 'Bwindi & Queen Elizabeth NP',
      spotsRemaining: Number(evtSpots) || 4,
      pricePerPersonUSD: Number(evtPriceUSD) || 2150,
      leadGuideSlug: evtGuideSlug,
      experienceSlug: '7-day-best-of-uganda',
      heroImage:
        evtImage.trim() ||
        drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE'),
      highlights:
        highlightsList.length > 0
          ? highlightsList
          : [
              'Official UWA permits & park entry fees included in escrow',
              'Led by named UTB-licensed Ugandan specialist guide',
              'Private 4x4 Extended Safari Land Cruiser transport',
            ],
      statusLabel:
        computedPlacement === 'upcoming'
          ? `Upcoming • ${evtSpots} Spots Open`
          : `Confirmed • ${evtSpots} Spots Left`,
      placement: computedPlacement,
    };

    if (editingEventId) {
      await updateSafariEvent(editingEventId, payload);
      notify(
        'success',
        `Replaced & updated "${payload.title}" in Firestore (/safari_events/${editingEventId}).`
      );
      setEditingEventId(null);
    } else {
      const created = await addSafariEvent(payload);
      notify(
        'success',
        `Uploaded "${created.title}" to Firestore (${
          computedPlacement === 'both'
            ? 'Homepage Carousel & Upcoming Programs'
            : computedPlacement === 'carousel'
            ? 'Homepage Carousel Only'
            : 'Upcoming Programs List Only'
        }).`
      );
    }

    setEvtTitle('');
    setEvtShortTab('');
    setEvtSubtitle('');
  };

  const handleToggleEventTarget = async (
    ev: ConfirmedPackageEvent,
    target: 'carousel' | 'upcoming'
  ) => {
    const current = ev.placement || 'carousel';
    const isCarousel = current === 'carousel' || current === 'both';
    const isUpcoming = current === 'upcoming' || current === 'both';

    let nextCarousel = isCarousel;
    let nextUpcoming = isUpcoming;

    if (target === 'carousel') {
      nextCarousel = !isCarousel;
      if (!nextCarousel && !nextUpcoming) nextUpcoming = true;
    } else {
      nextUpcoming = !isUpcoming;
      if (!nextCarousel && !nextUpcoming) nextCarousel = true;
    }

    const nextPlacement: EventDisplayPlacement =
      nextCarousel && nextUpcoming
        ? 'both'
        : nextCarousel
        ? 'carousel'
        : 'upcoming';

    await updateSafariEventPlacement(ev.id, nextPlacement);
    notify(
      'success',
      `Updated "${ev.title}" placement to ${
        nextPlacement === 'both'
          ? 'Both Carousel & Upcoming'
          : nextPlacement === 'carousel'
          ? 'Homepage Carousel Only'
          : 'Upcoming Programs Only'
      }.`
    );
  };

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoName.trim() || !logoUrl.trim()) return;

    if (editingLogoId) {
      await updateFooterLogo(editingLogoId, {
        name: logoName.trim(),
        subtitle: logoSubtitle.trim() || 'Official Partner',
        logoUrl: logoUrl.trim(),
        category: logoCategory,
        websiteUrl: logoWebsite.trim() || undefined,
        displayOrder: Number(logoOrder) || 1,
      });
      notify('success', `Updated footer logo "${logoName.trim()}".`);
      setEditingLogoId(null);
    } else {
      const created = await addFooterLogo({
        name: logoName.trim(),
        subtitle: logoSubtitle.trim() || 'Official Partner',
        logoUrl: logoUrl.trim(),
        category: logoCategory,
        websiteUrl: logoWebsite.trim() || undefined,
        active: true,
        displayOrder: Number(logoOrder) || footerLogos.length + 1,
      });
      notify('success', `Added "${created.name}" to the Footer Logo Bar.`);
    }

    setLogoName('');
    setLogoSubtitle('');
    setLogoWebsite('');
    setLogoOrder(footerLogos.length + 2);
  };

  const startEditingLogo = (logo: FooterPartnerLogo) => {
    setEditingLogoId(logo.id);
    setLogoName(logo.name);
    setLogoSubtitle(logo.subtitle);
    setLogoUrl(logo.logoUrl);
    setLogoCategory(logo.category);
    setLogoWebsite(logo.websiteUrl || '');
    setLogoOrder(logo.displayOrder);
  };

  return (
    <div className="space-y-6">
      {localBanner && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
            localBanner.type === 'success'
              ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#144225]'
              : 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{localBanner.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setLocalBanner(null)}
            className="font-mono text-[10px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FIRESTORE DATABASE CONNECTION & SYSTEM DATA PERSISTENCE BAR           */}
      {/* ===================================================================== */}
      <div className="bg-[#1A1612] text-[#F5EFE6] border border-[#2D261F] rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#226B3E]/25 border border-[#226B3E] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#E59A52] font-bold">
                  Firestore Database &amp; Rules Verification
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    dbConnStatus?.connected !== false
                      ? 'bg-[#226B3E]/30 text-[#4ADE80] border border-[#226B3E]'
                      : 'bg-[#DC2626]/20 text-[#FCA5A5] border border-[#DC2626]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {dbConnStatus
                    ? `${dbConnStatus.statusMessage} (${dbConnStatus.latencyMs}ms)`
                    : 'Verifying Firestore connection...'}
                </span>
              </div>
              <p className="text-xs text-[#C7B9A5] mt-1 font-mono">
                Project: <span className="text-white">{firebaseConfig.projectId}</span> · Database ID:{' '}
                <span className="text-[#4ADE80]">{resolvedDatabaseId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!user && (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Sign In to Persist Records</span>
              </button>
            )}
            <button
              type="button"
              disabled={isTestingDb || firestoreSyncStatus.isSyncing}
              onClick={handleVerifyAndSyncFirestore}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#226B3E] hover:bg-[#1A5230] disabled:opacity-50 text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isTestingDb || firestoreSyncStatus.isSyncing ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isTestingDb || firestoreSyncStatus.isSyncing
                  ? 'Verifying & Syncing...'
                  : 'Verify & Sync All System Data to Firestore'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-white/10 text-[11px] font-mono">
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/safari_events</div>
            <div className="text-white font-bold">{safariEvents.length} Trips &amp; Events</div>
          </div>
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/footer_logos</div>
            <div className="text-white font-bold">{footerLogos.length} Partner Logos</div>
          </div>
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/permit_escrow_holds</div>
            <div className="text-white font-bold">{permitHolds.length} Permit Escrows</div>
          </div>
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/wallet_transactions</div>
            <div className="text-white font-bold">{transactions.length} Ledger Entries</div>
          </div>
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/saved_itineraries</div>
            <div className="text-white font-bold">{savedItineraries.length} Custom Plans</div>
          </div>
          <div className="bg-white/5 rounded px-2.5 py-1.5">
            <div className="text-[#9E9284] text-[10px]">/partner_bookings</div>
            <div className="text-white font-bold">{partnerBookings.length} Lodge Vouchers</div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* UNIFIED BACKEND CMS & ERP CONTROL CENTER (/api/cms/* & /api/erp/*)    */}
      {/* ===================================================================== */}
      <CmsErpBackendConsole onNotify={notify} />

      {/* ===================================================================== */}
      {/* PART 1: UPLOAD EVENT & TRIP DATA TO FIRESTORE + CAROUSEL/UPCOMING     */}
      {/* ===================================================================== */}
      {(initialTab === 'both' || initialTab === 'events') && (
        <div className="space-y-5">
          {/* AI Service Provider Document-to-Package & Pricing Engine */}
          <ServiceProviderPackageAIBuilder />
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-bold">
                  Admin Dashboard · Firestore Event &amp; Trip Publisher
                </span>
                <h2 className="font-serif text-xl font-bold text-[#1A1612]">
                  Upload New Safari Event or Trip to Firestore
                </h2>
                <p className="text-xs text-[#5A5248]">
                  Authorized admins can publish events and trips to Firestore (
                  <code className="font-mono text-[#226B3E]">/safari_events</code>) and toggle whether they appear on the Homepage Carousel, Upcoming Programs list, or both.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!user && (
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Sign In for Cloud Sync</span>
                  </button>
                )}
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#226B3E] font-mono text-xs font-semibold transition-colors"
                >
                  <span>Preview Homepage</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <form
              onSubmit={handlePublishEvent}
              className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs"
            >
              {/* Toggle Bar for Homepage Carousel vs Upcoming Programs */}
              <div className="md:col-span-12 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-bold">
                    Display Placement Toggle
                  </div>
                  <div className="text-xs font-semibold text-[#1A1612] mt-0.5">
                    Choose where this event or trip is displayed on the Homepage:
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (showOnCarousel && !showOnUpcoming) {
                        setShowOnUpcoming(true);
                      }
                      setShowOnCarousel(!showOnCarousel);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs font-semibold border transition-all cursor-pointer ${
                      showOnCarousel
                        ? 'bg-[#226B3E] text-white border-[#226B3E]'
                        : 'bg-white text-[#5A5248] border-[#D6CEC2] hover:border-[#1A1612]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Homepage Carousel: {showOnCarousel ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (showOnUpcoming && !showOnCarousel) {
                        setShowOnCarousel(true);
                      }
                      setShowOnUpcoming(!showOnUpcoming);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs font-semibold border transition-all cursor-pointer ${
                      showOnUpcoming
                        ? 'bg-[#C85A28] text-white border-[#C85A28]'
                        : 'bg-white text-[#5A5248] border-[#D6CEC2] hover:border-[#1A1612]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Upcoming Programs List: {showOnUpcoming ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Event / Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g., Rwenzori & Bwindi Primate Grand Expedition"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Short Carousel Tab Label
                </label>
                <input
                  type="text"
                  value={evtShortTab}
                  onChange={(e) => setEvtShortTab(e.target.value)}
                  placeholder="e.g., Rwenzori & Bwindi"
                  maxLength={24}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Category
                </label>
                <select
                  value={evtCategory}
                  onChange={(e) =>
                    setEvtCategory(
                      e.target.value as ConfirmedPackageEvent['category']
                    )
                  }
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                >
                  <option value="Guaranteed Primate Departure">
                    Guaranteed Primate Departure
                  </option>
                  <option value="Seasonal Migration & Savanna">
                    Seasonal Migration &amp; Savanna
                  </option>
                  <option value="Cultural & Music Event">
                    Cultural &amp; Music Event
                  </option>
                  <option value="Ornithology Special">Ornithology Special</option>
                </select>
              </div>

              <div className="md:col-span-8">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Subtitle / Route Overview
                </label>
                <input
                  type="text"
                  value={evtSubtitle}
                  onChange={(e) => setEvtSubtitle(e.target.value)}
                  placeholder="e.g., 6-Day Private Mountain Gorilla Trekking, Crater Lakes & Kazinga Boat Launch"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Badge / Event Tag
                </label>
                <input
                  type="text"
                  value={evtTag}
                  onChange={(e) => setEvtTag(e.target.value)}
                  placeholder="e.g., CONFIRMED EXPEDITION"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Date Window
                </label>
                <input
                  type="text"
                  value={evtDateWindow}
                  onChange={(e) => setEvtDateWindow(e.target.value)}
                  placeholder="e.g., 15 – 20 Feb 2027"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Duration Label
                </label>
                <input
                  type="text"
                  value={evtDurationLabel}
                  onChange={(e) => setEvtDurationLabel(e.target.value)}
                  placeholder="e.g., 6 Days / 5 Nights"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Tariff Per Person (USD)
                </label>
                <input
                  type="number"
                  min={100}
                  value={evtPriceUSD}
                  onChange={(e) => setEvtPriceUSD(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Available Spots
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={evtSpots}
                  onChange={(e) => setEvtSpots(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  National Parks / Location
                </label>
                <input
                  type="text"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="e.g., Bwindi, Kibale & Queen Elizabeth NP"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Lead Ugandan Specialist Guide
                </label>
                <select
                  value={evtGuideSlug}
                  onChange={(e) => setEvtGuideSlug(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                >
                  {GUIDES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.name} ({g.homeRegion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold">
                    Hero Image URL (Shared Google Drive Folder)
                  </label>
                  <a
                    href={SHARED_GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-[#226B3E] hover:underline"
                  >
                    Open Shared Drive Folder ↗
                  </a>
                </div>
                <input
                  type="url"
                  value={evtImage}
                  onChange={(e) => setEvtImage(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612] mb-1.5"
                />
                <select
                  value={evtImage}
                  onChange={(e) => setEvtImage(e.target.value)}
                  className="w-full bg-white border border-[#226B3E]/40 rounded px-2.5 py-1.5 text-[11px] font-mono text-[#144225]"
                >
                  {SHARED_DRIVE_MEDIA_VAULT.map((photo) => (
                    <option key={photo.id} value={photo.url}>
                      Drive Photo: [{photo.folderCategory}] {photo.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Key Highlights (One per line)
                </label>
                <textarea
                  rows={3}
                  value={evtHighlightsText}
                  onChange={(e) => setEvtHighlightsText(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-1.5 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-12 flex items-center justify-end gap-3 pt-1">
                {editingEventId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEventId(null);
                      setEvtTitle('');
                      setEvtShortTab('');
                      setEvtSubtitle('');
                    }}
                    className="px-4 py-2.5 rounded-md bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] font-mono text-xs font-semibold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#C85A28] hover:bg-[#B04B1D] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingEventId
                      ? 'Save Replacement to Firestore'
                      : 'Upload Event / Trip to Firestore'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Inventory Table with Instant Carousel / Upcoming Toggle & Edit/Replace Buttons */}
          <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1A1612]">
                  Loaded Safari Events &amp; Programs ({safariEvents.length})
                </h3>
                <p className="text-xs text-[#5A5248]">
                  Existing packages stay active in the system until replaced, edited, or removed by Admin.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#226B3E]/15 text-[#226B3E] font-semibold">
                  Carousel Active: {carouselEvents.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#C85A28]/15 text-[#C85A28] font-semibold">
                  Upcoming Active: {upcomingEvents.length}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await resetSafariEventsToDefault();
                    notify(
                      'success',
                      'Restored default safari events & departures in Firestore.'
                    );
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#226B3E]" />
                  <span>Reset Default Events</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                    <th className="py-2.5 px-3.5">Event / Trip &amp; Tab Label</th>
                    <th className="py-2.5 px-3.5">Date &amp; Location</th>
                    <th className="py-2.5 px-3.5">Lead Guide</th>
                    <th className="py-2.5 px-3.5 text-right">Tariff</th>
                    <th className="py-2.5 px-3.5">Quick Toggle (Carousel / Upcoming)</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DCCF]">
                  {safariEvents.map((ev) => {
                    const guide = GUIDES.find((g) => g.slug === ev.leadGuideSlug);
                    const placement = ev.placement || 'carousel';
                    const onCarousel =
                      placement === 'carousel' || placement === 'both';
                    const onUpcoming =
                      placement === 'upcoming' || placement === 'both';

                    return (
                      <tr key={ev.id} className="hover:bg-[#FAF7F2]/60">
                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-[#1A1612]">
                            {ev.title}
                          </div>
                          <div className="text-[10px] font-mono text-[#5A5248]">
                            Tab: {ev.shortTabLabel || ev.title.slice(0, 20)} ·{' '}
                            {ev.category}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-mono font-semibold text-[#226B3E]">
                            {ev.dateWindow} ({ev.durationLabel})
                          </div>
                          <div className="text-[11px] text-[#5A5248]">
                            {ev.location}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-[#5A5248]">
                          {guide ? guide.name : ev.leadGuideSlug}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                          {formatPrice(ev.pricePerPersonUSD, currency)}
                          <div className="text-[10px] font-normal text-[#5A5248]">
                            {ev.spotsRemaining} spots
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleEventTarget(ev, 'carousel')}
                              className={`px-2 py-1 rounded font-mono text-[10px] font-semibold border transition-colors cursor-pointer ${
                                onCarousel
                                  ? 'bg-[#226B3E] text-white border-[#226B3E]'
                                  : 'bg-white text-[#5A5248] border-[#D6CEC2] hover:border-[#1A1612]'
                              }`}
                            >
                              Carousel: {onCarousel ? 'ON' : 'OFF'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleEventTarget(ev, 'upcoming')}
                              className={`px-2 py-1 rounded font-mono text-[10px] font-semibold border transition-colors cursor-pointer ${
                                onUpcoming
                                  ? 'bg-[#C85A28] text-white border-[#C85A28]'
                                  : 'bg-white text-[#5A5248] border-[#D6CEC2] hover:border-[#1A1612]'
                              }`}
                            >
                              Upcoming: {onUpcoming ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditingEvent(ev)}
                              className="px-2 py-1 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] font-mono text-[10px] font-semibold cursor-pointer"
                            >
                              Edit / Replace
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteSafariEvent(ev.id);
                                notify(
                                  'success',
                                  `Removed "${ev.title}" from schedule.`
                                );
                              }}
                              className="p-1.5 rounded text-[#5A5248] hover:text-[#DC2626] hover:bg-[#DC2626]/10 cursor-pointer"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PART 2: FOOTER PARTNER LOGOS & POWERED BY TEXT MANAGER                */}
      {/* ===================================================================== */}
      {(initialTab === 'both' || initialTab === 'logos') && (
        <div className="space-y-5">
          {/* Footer Attribution Text Editor */}
          <div className="bg-white border border-[#E4DCCF] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-bold">
                  Admin Dashboard · Footer Logos &amp; Attribution Manager
                </span>
                <h2 className="font-serif text-xl font-bold text-[#1A1612]">
                  Manage Footer Partner Logos &amp; Attribution Text
                </h2>
                <p className="text-xs text-[#5A5248]">
                  Add, replace, reorder, or toggle the partner logos displayed at the bottom of every page. Logos are automatically scaled inside uniform white badge frames to fit accurately in the footer.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await resetFooterLogosToDefault();
                  setDraftPoweredBy(DEFAULT_POWERED_BY_TEXT);
                  notify(
                    'success',
                    'Restored all official partner logos (UWA, UTB, ECO Bank, FINCA, RELWORX, Igongo Country Hotel, Tingatinga Safaris) and default Powered By text.'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] font-mono text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#226B3E]" />
                <span>Reset Default Logos</span>
              </button>
            </div>

            {/* Powered By Attribution Line Control */}
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-3.5 space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold">
                Footer Attribution Banner Text
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={draftPoweredBy}
                  onChange={(e) => setDraftPoweredBy(e.target.value)}
                  className="flex-1 bg-white border border-[#D6CEC2] rounded px-3 py-2 text-xs font-mono text-[#1A1612]"
                  placeholder="Powered by WildLife, RONSOL, RELWORX, FINCA & ECO Bank, SPYDA MC"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPoweredByText(draftPoweredBy);
                    notify('success', 'Updated Footer Powered By attribution text.');
                  }}
                  className="px-4 py-2 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white font-mono text-xs font-semibold cursor-pointer shrink-0"
                >
                  Save Attribution Text
                </button>
              </div>
            </div>

            {/* Form to Add or Update a Footer Partner Logo */}
            <form
              onSubmit={handleSaveLogo}
              className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs pt-1"
            >
              <div className="md:col-span-12">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-bold">
                  {editingLogoId
                    ? `Editing Footer Logo (${logoName})`
                    : 'Add or Replace Footer Partner Logo'}
                </span>
              </div>

              {/* Quick Preset Selector for the 6 Attached Logos */}
              <div className="md:col-span-12 bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3 space-y-2">
                <div className="font-mono text-[10px] uppercase text-[#5A5248] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>Quick-Select Attached Official Partner Asset:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ATTACHED_LOGO_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setLogoName(preset.name);
                        setLogoSubtitle(preset.subtitle);
                        setLogoUrl(preset.url);
                        setLogoCategory(preset.category);
                      }}
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
                        logoUrl === preset.url
                          ? 'bg-[#226B3E] text-white border-[#226B3E]'
                          : 'bg-white text-[#1A1612] border-[#D6CEC2] hover:border-[#226B3E]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-5 h-5 object-contain bg-white rounded-xs p-0.5"
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Partner Short Name *
                </label>
                <input
                  type="text"
                  required
                  value={logoName}
                  onChange={(e) => setLogoName(e.target.value)}
                  placeholder="e.g., FINCA or ECO Bank"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Partner Subtitle / Role
                </label>
                <input
                  type="text"
                  value={logoSubtitle}
                  onChange={(e) => setLogoSubtitle(e.target.value)}
                  placeholder="e.g., Official Banking & Escrow Partner"
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Category
                </label>
                <select
                  value={logoCategory}
                  onChange={(e) =>
                    setLogoCategory(
                      e.target.value as FooterPartnerLogo['category']
                    )
                  }
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                >
                  <option value="Government & Conservation">
                    Government &amp; Conservation
                  </option>
                  <option value="Banking & Fintech">Banking &amp; Fintech</option>
                  <option value="Strategic Partner">Strategic Partner</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={logoOrder}
                  onChange={(e) => setLogoOrder(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Logo Image Path or URL *
                </label>
                <input
                  type="text"
                  required
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/assets/aistudio/finca_84848a21.png or https://..."
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Or Upload Logo File from Device
                </label>
                <label className="w-full bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-dashed border-[#226B3E] rounded px-3 py-2 text-[#226B3E] font-mono text-[11px] font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File (PNG/JPG/JFIF)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                  Partner Website (Optional)
                </label>
                <input
                  type="url"
                  value={logoWebsite}
                  onChange={(e) => setLogoWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-2 text-[#1A1612]"
                />
              </div>

              <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Live Resized Preview Tile */}
                <div className="flex items-center gap-3 bg-[#184D2B] px-3.5 py-2 rounded-md">
                  <span className="font-mono text-[10px] uppercase text-[#D99B26]">
                    Footer Size Preview:
                  </span>
                  <div className="bg-white rounded px-2.5 py-1.5 h-12 flex items-center gap-2">
                    <div className="w-12 h-8 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={logoUrl}
                        alt={logoName || 'Preview'}
                        className="max-h-8 max-w-full w-auto object-contain"
                      />
                    </div>
                    <div className="text-left pr-1">
                      <div className="font-mono text-[10px] font-bold text-[#1A1612] leading-tight">
                        {logoName || 'PARTNER'}
                      </div>
                      <div className="text-[9px] text-[#5A5248] leading-tight">
                        {logoSubtitle || 'Official Partner'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingLogoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLogoId(null);
                        setLogoName('');
                        setLogoSubtitle('');
                        setLogoWebsite('');
                      }}
                      className="px-3.5 py-2 rounded border border-[#D6CEC2] text-xs font-mono text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      {editingLogoId
                        ? 'Save Logo Changes to Footer'
                        : 'Add Partner Logo to Footer'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Current Footer Logos Inventory Grid */}
          <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1A1612]">
                  Active Footer Logos ({activeFooterLogos.length} visible of{' '}
                  {footerLogos.length})
                </h3>
                <p className="text-xs text-[#5A5248]">
                  Click &ldquo;Edit&rdquo; on any logo card to replace its image or title, or toggle visibility in the website footer.
                </p>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {footerLogos.map((logo) => (
                <div
                  key={logo.id}
                  className={`border rounded-lg p-3.5 flex flex-col justify-between gap-3 transition-all ${
                    logo.active
                      ? 'bg-[#FAF7F2] border-[#E4DCCF]'
                      : 'bg-[#F3ECE1]/50 border-[#D6CEC2] opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-white border border-[#E4DCCF] rounded-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src={logo.logoUrl}
                        alt={logo.name}
                        className="max-h-11 max-w-full w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#1A1612] truncate">
                          {logo.name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E]">
                          #{logo.displayOrder}
                        </span>
                      </div>
                      <div className="text-xs text-[#5A5248] truncate mt-0.5">
                        {logo.subtitle}
                      </div>
                      <div className="font-mono text-[10px] text-[#C85A28] mt-0.5">
                        {logo.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E4DCCF]">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateFooterLogo(logo.id, {
                          active: !logo.active,
                        });
                        notify(
                          'success',
                          `${logo.active ? 'Hidden' : 'Enabled'} "${logo.name}" in footer.`
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] font-semibold cursor-pointer ${
                        logo.active
                          ? 'bg-[#16A34A]/15 text-[#16A34A]'
                          : 'bg-[#5A5248]/15 text-[#5A5248]'
                      }`}
                    >
                      {logo.active ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible in Footer</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditingLogo(logo)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-[#F3ECE1] border border-[#D6CEC2] font-mono text-[10px] font-semibold text-[#1A1612] cursor-pointer"
                      >
                        Edit Logo
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteFooterLogo(logo.id);
                          notify('success', `Removed "${logo.name}" logo.`);
                        }}
                        className="p-1 rounded text-[#5A5248] hover:text-[#DC2626] hover:bg-[#DC2626]/10 cursor-pointer"
                        title="Delete logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
