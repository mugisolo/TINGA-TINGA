import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  Compass,
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  UserCheck,
  Wallet,
  FileCheck,
  Calendar,
  MapPin,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Plane,
  Truck,
  LogIn,
  LogOut,
  CheckSquare,
  Trash2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAuth, ROLE_RIGHTS_MATRIX } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useInquiry } from '../context/InquiryContext';
import {
  PortalRole,
  PortalDispatch,
  Lead,
} from '../types';
import {
  GUIDES,
  PARTNER_ACCOMMODATIONS,
  PERMIT_FACTS,
  CONFIRMED_PACKAGES_AND_EVENTS as CONFIRMED_EVENTS,
} from '../data/seedData';
import { formatPrice } from '../lib/currency';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const DISPATCH_STORAGE_KEY = 'enganda_portal_dispatches_v1';

interface PortalDefinition {
  role: PortalRole;
  slug: string;
  label: string;
  shortLabel: string;
  subtitle: string;
  badgeText: string;
  icon: React.FC<{ className?: string }>;
  sections: { id: string; label: string }[];
}

const PORTAL_DEFINITIONS: PortalDefinition[] = [
  {
    role: 'client',
    slug: 'client',
    label: 'Client Portal',
    shortLabel: 'Client',
    subtitle: 'Traveler Safari Wallet, UWA Permit Escrow, Partner Lodge Vouchers & Custom Itineraries',
    badgeText: 'Traveler Account',
    icon: Compass,
    sections: [
      { id: 'overview', label: 'Expeditions & Itineraries' },
      { id: 'permits', label: 'UWA Permit Escrow' },
      { id: 'vouchers', label: 'Lodge Vouchers & Stays' },
      { id: 'readiness', label: 'Checklists & Desk Requests' },
    ],
  },
  {
    role: 'specialist',
    slug: 'specialists',
    label: 'Specialists Portal',
    shortLabel: 'Specialists',
    subtitle: 'Lead Safari Guides, Primate Trackers & Ornithology Field Operations Roster',
    badgeText: 'UTB Field Specialist',
    icon: UserCheck,
    sections: [
      { id: 'roster', label: 'Assigned Expeditions' },
      { id: 'field-log', label: 'Field & Trail Dispatches' },
      { id: 'vehicle', label: '4x4 Land Cruiser Readiness' },
    ],
  },
  {
    role: 'partner',
    slug: 'partner',
    label: 'Partner Portal',
    shortLabel: 'Partner',
    subtitle: 'Safari Lodges, Tented Camps, Regional Hotels & Conservation Revenue Ledger',
    badgeText: 'Verified Partner',
    icon: Building2,
    sections: [
      { id: 'allocations', label: 'Room Allocations & Vouchers' },
      { id: 'rates', label: 'Seasonal Tariffs & Inventory' },
      { id: 'settlements', label: 'Escrow Payout Ledger' },
    ],
  },
  {
    role: 'staff',
    slug: 'staff',
    label: 'Staff Operations Portal',
    shortLabel: 'Staff Desk',
    subtitle: 'Entebbe Coordination Desk, UWA Permit Procurement, EBB Airport Pickups & 4x4 Fleet',
    badgeText: 'Entebbe Ops Desk',
    icon: Briefcase,
    sections: [
      { id: 'inquiries', label: 'Client Inquiry Dispatch' },
      { id: 'uwa-queue', label: 'UWA Permit Queue' },
      { id: 'fleet-ebb', label: 'EBB Arrivals & 4x4 Fleet' },
    ],
  },
  {
    role: 'admin',
    slug: 'admin',
    label: 'Admin Governance Portal',
    shortLabel: 'Admin',
    subtitle: 'Executive Treasury, Multi-Role Access Governance, Escrow Audit & Cloud Firestore Sync',
    badgeText: 'Executive Admin',
    icon: ShieldCheck,
    sections: [
      { id: 'command', label: 'Treasury & Platform Audit' },
      { id: 'rbac', label: 'Portal Roles & Directory' },
      { id: 'dispatches', label: 'All Operational Dispatches' },
    ],
  },
];

const INITIAL_DISPATCHES: PortalDispatch[] = [
  {
    id: 'dsp_seed_1',
    userId: 'system_specialist_samuel',
    authorName: 'Samuel Kato (Lead Primate Specialist)',
    portalRole: 'specialist',
    category: 'Trail Condition Report',
    title: 'Bwindi Rushaga Sector — Habituation Trail Firm & Clear',
    region: 'Bwindi & Mgahinga',
    status: 'verified',
    priority: 'normal',
    notes: 'Morning mist clearing by 08:15 EAT. Busingye gorilla family located 1.4 hrs from Rushaga ranger post. Recommend gaiters and light rain shell.',
    referenceCode: 'ENG-FLD-8041',
    createdAt: '2026-11-02T07:30:00.000Z',
  },
  {
    id: 'dsp_seed_2',
    userId: 'system_partner_mahogany',
    authorName: 'Mahogany Springs Bwindi Reservations',
    portalRole: 'partner',
    category: 'Room Block Confirmation',
    title: 'Confirmed 2 River-Facing Suites for Vandenberg Party (Dec 14–17)',
    region: 'Bwindi & Mgahinga',
    status: 'verified',
    priority: 'high',
    notes: 'Early 05:30 AM packed breakfast arranged for gorilla trek departure. Dietary preferences logged with executive chef.',
    referenceCode: 'ENG-PRT-3319',
    createdAt: '2026-11-02T11:15:00.000Z',
  },
  {
    id: 'dsp_seed_3',
    userId: 'system_staff_entebbe',
    authorName: 'Entebbe Operations Desk (Bugonga HQ)',
    portalRole: 'staff',
    category: 'UWA Permit Procurement',
    title: 'UWA E-Permit Serial #UWA-BW-994120 Assigned to Escrow UWA-ESC-773910',
    region: 'Entebbe & Lake Victoria',
    status: 'in_progress',
    priority: 'high',
    notes: 'Official Uganda Wildlife Authority receipt scanned and ready for client counter-verification in Safari Wallet.',
    referenceCode: 'ENG-OPS-5190',
    createdAt: '2026-11-03T06:45:00.000Z',
  },
  {
    id: 'dsp_seed_4',
    userId: 'system_specialist_grace',
    authorName: 'Grace Namukasa (Ornithology Specialist)',
    portalRole: 'specialist',
    category: 'Ornithology Sighting',
    title: 'Mabamba Bay Canoe Channel — Pair of Shoebill Storks Active at Dawn',
    region: 'Entebbe & Lake Victoria',
    status: 'verified',
    priority: 'normal',
    notes: 'Water levels optimal along northern papyrus channel. Best canoe launch window is 06:45 AM from Nakiwogo jetty.',
    referenceCode: 'ENG-FLD-8092',
    createdAt: '2026-11-03T08:10:00.000Z',
  },
];

interface FleetVehicle {
  regNumber: string;
  model: string;
  assignedGuide: string;
  currentLocation: string;
  status: 'on_safari' | 'ready_entebbe' | 'maintenance_check';
  nextDeparture: string;
  equipmentVerified: boolean;
}

const INITIAL_FLEET: FleetVehicle[] = [
  {
    regNumber: 'UAT 773G',
    model: 'Toyota Land Cruiser 78 Series (Extended 7-Seater Pop-Up Roof)',
    assignedGuide: 'Samuel Kato',
    currentLocation: 'Bwindi Buhoma Sector',
    status: 'on_safari',
    nextDeparture: '2026-12-14',
    equipmentVerified: true,
  },
  {
    regNumber: 'UBA 902M',
    model: 'Toyota Land Cruiser GX V8 (Luxury Savanna & Kidepo Spec)',
    assignedGuide: 'David Ochieng',
    currentLocation: 'Entebbe Bugonga HQ',
    status: 'ready_entebbe',
    nextDeparture: '2026-11-18',
    equipmentVerified: true,
  },
  {
    regNumber: 'UBB 114E',
    model: 'Toyota Land Cruiser 79 Double-Cab Photographic Rig',
    assignedGuide: 'Grace Namukasa',
    currentLocation: 'Kibale Fort Portal Base',
    status: 'on_safari',
    nextDeparture: '2026-11-25',
    equipmentVerified: true,
  },
  {
    regNumber: 'UAZ 418K',
    model: 'Toyota Land Cruiser 78 Extended (Dual Winch & Snorkel)',
    assignedGuide: 'Moses Byaruhanga',
    currentLocation: 'Entebbe Service Bay',
    status: 'maintenance_check',
    nextDeparture: '2026-12-02',
    equipmentVerified: false,
  },
];

function normalizeRoleParam(param?: string): PortalRole | null {
  if (!param) return null;
  const clean = param.toLowerCase();
  if (clean === 'client' || clean === 'traveler') return 'client';
  if (clean === 'admin') return 'admin';
  if (clean === 'partner' || clean === 'partners') return 'partner';
  if (clean === 'specialist' || clean === 'specialists' || clean === 'guide' || clean === 'guides')
    return 'specialist';
  if (clean === 'staff' || clean === 'operations') return 'staff';
  return null;
}

export const PortalsPage: React.FC = () => {
  const { role: routeRoleParam } = useParams<{ role?: string }>();
  const navigate = useNavigate();

  const {
    user,
    userRole,
    activePortalRole,
    canSwitchToRole,
    setActivePortalRole,
    isBootstrappedAdmin,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const {
    availableBalanceUSD,
    escrowBalanceUSD,
    rewardCreditsUSD,
    transactions,
    permitHolds,
    partnerBookings,
    savedItineraries,
    savedChecklists,
    topUpWallet,
    holdPermitInEscrow,
    releasePermitEscrow,
    bookPartnerStay,
    paySavedItineraryDeposit,
  } = useWallet();

  const {
    currency,
    leads,
    updateLeadStatus,
    openInquiryModal,
  } = useInquiry();

  const currentRole: PortalRole = useMemo(() => {
    return normalizeRoleParam(routeRoleParam) || activePortalRole || 'client';
  }, [routeRoleParam, activePortalRole]);

  const activePortalDef = useMemo(() => {
    return (
      PORTAL_DEFINITIONS.find((p) => p.role === currentRole) ||
      PORTAL_DEFINITIONS[0]
    );
  }, [currentRole]);

  const [activeSection, setActiveSection] = useState<string>(
    activePortalDef.sections[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Specialist & Partner active selector state
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string>(
    GUIDES[0]?.slug || 'samuel-kato'
  );
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState<string>(
    PARTNER_ACCOMMODATIONS[0]?.slug || 'mahogany-springs-bwindi'
  );

  // Fleet & Partner custom rate overrides
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [partnerRateOverrides, setPartnerRateOverrides] = useState<
    Record<string, number>
  >({});

  // Operational Dispatches state (persisted locally + synced to Firestore /portal_dispatches)
  const [dispatches, setDispatches] = useState<PortalDispatch[]>(() => {
    try {
      const saved = localStorage.getItem(DISPATCH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DISPATCHES;
  });

  // New Dispatch Form State
  const [showNewDispatchModal, setShowNewDispatchModal] = useState(false);
  const [newDispatchTitle, setNewDispatchTitle] = useState('');
  const [newDispatchCategory, setNewDispatchCategory] = useState('Field Dispatch');
  const [newDispatchRegion, setNewDispatchRegion] = useState('Bwindi & Mgahinga');
  const [newDispatchPriority, setNewDispatchPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [newDispatchNotes, setNewDispatchNotes] = useState('');

  // Reset active section when portal role changes
  useEffect(() => {
    const def =
      PORTAL_DEFINITIONS.find((p) => p.role === currentRole) ||
      PORTAL_DEFINITIONS[0];
    setActiveSection(def.sections[0].id);
    setStatusFilter('all');
    setSearchQuery('');
  }, [currentRole]);

  // Persist dispatches locally
  useEffect(() => {
    try {
      localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(dispatches));
    } catch {
      // ignore
    }
  }, [dispatches]);

  // Load user's Firestore dispatches when authenticated
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;

    const loadFirestoreDispatches = async () => {
      try {
        const q = query(
          collection(db, 'portal_dispatches'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const remote: PortalDispatch[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d && d.id && d.title) {
              remote.push({
                id: String(d.id),
                userId: String(d.userId),
                authorName: String(d.authorName || 'Portal User'),
                portalRole: (d.portalRole as PortalRole) || 'client',
                category: String(d.category || 'General'),
                title: String(d.title),
                region: String(d.region || 'Entebbe & Lake Victoria'),
                status: (d.status as PortalDispatch['status']) || 'open',
                priority: (d.priority as PortalDispatch['priority']) || 'normal',
                notes: d.notes ? String(d.notes) : undefined,
                referenceCode: String(d.referenceCode || 'ENG-DSP'),
                createdAt: String(d.createdAt || new Date().toISOString()),
              });
            }
          });
          if (remote.length > 0) {
            setDispatches((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              return [
                ...remote.filter((r) => !existingIds.has(r.id)),
                ...prev,
              ];
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'portal_dispatches');
        } catch {
          // Handled
        }
      }
    };

    loadFirestoreDispatches();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const handleRoleSwitch = async (targetDef: PortalDefinition) => {
    const allowed = canSwitchToRole(targetDef.role);
    if (allowed) {
      await setActivePortalRole(targetDef.role);
    } else {
      notify(
        'error',
        'Executive Admin role write is protected by firestore.rules (isAdmin() required). Viewing in read-only audit mode.'
      );
    }
    navigate(`/portals/${targetDef.slug}`);
  };

  const notify = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispatchTitle.trim()) return;

    const cleanId = `dsp_${Date.now()}`;
    const refCode = `ENG-${currentRole.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authorName =
      user?.displayName ||
      (currentRole === 'specialist'
        ? GUIDES.find((g) => g.slug === selectedGuideSlug)?.name || 'Enganda Specialist'
        : currentRole === 'partner'
        ? PARTNER_ACCOMMODATIONS.find((p) => p.slug === selectedPartnerSlug)?.name || 'Enganda Partner'
        : currentRole === 'staff'
        ? 'Entebbe Operations Desk'
        : currentRole === 'admin'
        ? 'Executive Admin'
        : 'Enganda Client');

    const record: PortalDispatch = {
      id: cleanId,
      userId: user?.uid || 'local_session_user',
      authorName: authorName.slice(0, 128),
      portalRole: currentRole,
      category: newDispatchCategory.slice(0, 64),
      title: newDispatchTitle.trim().slice(0, 200),
      region: newDispatchRegion.slice(0, 160),
      status: 'open',
      priority: newDispatchPriority,
      notes: newDispatchNotes.trim().slice(0, 1500),
      referenceCode: refCode,
      createdAt: new Date().toISOString(),
    };

    setDispatches((prev) => [record, ...prev]);
    setNewDispatchTitle('');
    setNewDispatchNotes('');
    setShowNewDispatchModal(false);
    notify('success', `Logged ${refCode} to ${activePortalDef.label}.`);

    if (user?.uid) {
      const docPath = `portal_dispatches/${cleanId}`;
      try {
        await setDoc(doc(db, 'portal_dispatches', cleanId), {
          id: record.id,
          userId: user.uid.slice(0, 128),
          authorName: record.authorName,
          portalRole: record.portalRole,
          category: record.category,
          title: record.title,
          region: record.region,
          status: record.status,
          priority: record.priority,
          notes: record.notes || '',
          referenceCode: record.referenceCode,
          createdAt: record.createdAt,
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const handleUpdateDispatchStatus = async (
    dispatchId: string,
    nextStatus: PortalDispatch['status']
  ) => {
    const target = dispatches.find((d) => d.id === dispatchId);
    if (!target) return;

    const updated: PortalDispatch = { ...target, status: nextStatus };
    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? updated : d))
    );
    notify('success', `Updated ${target.referenceCode} status to ${nextStatus.replace('_', ' ')}.`);

    if (user?.uid && target.userId === user.uid) {
      const docPath = `portal_dispatches/${dispatchId}`;
      try {
        await setDoc(doc(db, 'portal_dispatches', dispatchId), {
          ...updated,
          notes: updated.notes || '',
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const handleDeleteDispatch = async (dispatchId: string) => {
    const target = dispatches.find((d) => d.id === dispatchId);
    setDispatches((prev) => prev.filter((d) => d.id !== dispatchId));
    if (target) {
      notify('success', `Removed dispatch ${target.referenceCode}.`);
    }
    if (user?.uid && target?.userId === user.uid) {
      const docPath = `portal_dispatches/${dispatchId}`;
      try {
        await deleteDoc(doc(db, 'portal_dispatches', dispatchId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        } catch {
          // Handled
        }
      }
    }
  };

  const selectedGuide = useMemo(
    () => GUIDES.find((g) => g.slug === selectedGuideSlug) || GUIDES[0],
    [selectedGuideSlug]
  );

  const selectedPartner = useMemo(
    () =>
      PARTNER_ACCOMMODATIONS.find((p) => p.slug === selectedPartnerSlug) ||
      PARTNER_ACCOMMODATIONS[0],
    [selectedPartnerSlug]
  );

  const activeSectionLabel =
    activePortalDef.sections.find((s) => s.id === activeSection)?.label ||
    activePortalDef.sections[0].label;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1612] pb-16">
      {/* Top Role Switcher Strip */}
      <div className="bg-[#1A1612] text-[#FAF7F2] border-b border-[#2E2720]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#D99B26] font-semibold whitespace-nowrap mr-1">
              Role Portals:
            </span>
            {PORTAL_DEFINITIONS.map((portal) => {
              const Icon = portal.icon;
              const isSelected = portal.role === currentRole;
              return (
                <button
                  key={portal.role}
                  type="button"
                  onClick={() => handleRoleSwitch(portal)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#226B3E] text-white border-[#34945A] font-semibold'
                      : 'bg-[#26201B] text-[#D6CEC2] border-[#3A322B] hover:text-white hover:border-[#5A5248]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>{portal.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Auth & Cloud Sync Status */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#D6CEC2] hidden sm:inline">
                  Signed in as{' '}
                  <strong className="text-white">{user.email}</strong>
                  <span className="ml-1.5 font-mono text-[10px] bg-[#226B3E]/40 text-[#FAF7F2] px-1.5 py-0.5 rounded uppercase">
                    Role: {userRole}
                  </span>
                  {isBootstrappedAdmin && (
                    <span className="ml-1.5 font-mono text-[10px] bg-[#D99B26]/20 text-[#D99B26] px-1.5 py-0.5 rounded">
                      Admin Verified
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#26201B] hover:bg-[#3A322B] text-[#E4DCCF] border border-[#3A322B] text-xs font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-[#C85A28]" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google to Sync Cloud Records</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Canvas: Sidebar + Top Bar + Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Workspace Sidebar (256px on lg+) */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-[#E4DCCF] rounded-lg p-3.5 space-y-4">
            <div className="pb-3 border-b border-[#E4DCCF]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E] font-semibold">
                  {activePortalDef.badgeText}
                </span>
                <span className="font-mono text-[10px] text-[#5A5248] tabular-nums">
                  {currency}
                </span>
              </div>
              <h1 className="font-serif text-lg font-bold text-[#1A1612] mt-2">
                {activePortalDef.label}
              </h1>
              <p className="text-xs text-[#5A5248] mt-0.5 leading-snug">
                {activePortalDef.subtitle}
              </p>
            </div>

            {/* Contextual Selector for Specialist or Partner Portal */}
            {currentRole === 'specialist' && (
              <div className="pb-3 border-b border-[#E4DCCF] space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold">
                  Active Specialist Profile
                </label>
                <select
                  value={selectedGuideSlug}
                  onChange={(e) => setSelectedGuideSlug(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-2.5 py-1.5 text-xs font-medium text-[#1A1612]"
                >
                  {GUIDES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.name} ({g.homeRegion})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentRole === 'partner' && (
              <div className="pb-3 border-b border-[#E4DCCF] space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold">
                  Active Partner Property
                </label>
                <select
                  value={selectedPartnerSlug}
                  onChange={(e) => setSelectedPartnerSlug(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D6CEC2] rounded px-2.5 py-1.5 text-xs font-medium text-[#1A1612]"
                >
                  {PARTNER_ACCOMMODATIONS.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} ({p.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Portal Section Navigation */}
            <nav className="space-y-1" aria-label="Portal Workspace Navigation">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold px-2 pb-1">
                Workspace Views
              </div>
              {activePortalDef.sections.map((sec) => {
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-[#226B3E] text-white font-semibold'
                        : 'text-[#1A1612] hover:bg-[#F3ECE1]'
                    }`}
                  >
                    <span>{sec.label}</span>
                    {active && <span className="font-mono text-[10px]">Active</span>}
                  </button>
                );
              })}
            </nav>

            {/* Quick Cross-Portal Directory */}
            <div className="pt-3 border-t border-[#E4DCCF] space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248] font-semibold px-1">
                Switch Portal Role
              </div>
              {PORTAL_DEFINITIONS.map((p) => {
                const Icon = p.icon;
                const active = p.role === currentRole;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleRoleSwitch(p)}
                    className={`w-full px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                      active
                        ? 'bg-[#F3ECE1] border-[#226B3E] text-[#1A1612] font-semibold'
                        : 'bg-white border-transparent text-[#5A5248] hover:bg-[#FAF7F2] hover:text-[#1A1612]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#226B3E]" />
                      <span>{p.label}</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Workspace Viewport */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Top Bar Contract: Breadcrumb on Left, 1-2 Primary Actions on Right */}
            <div className="bg-white border border-[#E4DCCF] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#5A5248] font-mono">
                <span>Enganda Portals</span>
                <span>/</span>
                <span className="text-[#1A1612] font-semibold">
                  {activePortalDef.shortLabel}
                </span>
                <span>/</span>
                <span className="text-[#226B3E] font-semibold">
                  {activeSectionLabel}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewDispatchModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {currentRole === 'client'
                      ? 'New Desk Request'
                      : currentRole === 'specialist'
                      ? 'Log Field Dispatch'
                      : currentRole === 'partner'
                      ? 'Log Room Allocation'
                      : 'Create Operational Dispatch'}
                  </span>
                </button>
                {currentRole === 'client' && (
                  <Link
                    to="/wallet"
                    className="inline-flex items-center gap-1.5 bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] text-xs font-mono font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#226B3E]" />
                    <span className="tabular-nums">
                      {formatPrice(availableBalanceUSD, currency)}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Active Firestore Security Rule & Role Rights Strip */}
            <div className="bg-[#F3ECE1] border border-[#E4DCCF] rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#226B3E] shrink-0" />
                <span className="font-mono text-[11px] font-bold text-[#1A1612] uppercase">
                  Firestore Rule Scope ({ROLE_RIGHTS_MATRIX[currentRole].label}):
                </span>
                <span className="font-mono text-[11px] text-[#226B3E]">
                  {ROLE_RIGHTS_MATRIX[currentRole].firestoreScope}
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#5A5248] shrink-0">
                Collections:{' '}
                <strong className="text-[#1A1612]">
                  {ROLE_RIGHTS_MATRIX[currentRole].allowedCollections.join(' · ')}
                </strong>
              </div>
            </div>

            {/* Notification Banner */}
            {statusBanner && (
              <div
                className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                  statusBanner.type === 'success'
                    ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#144225]'
                    : 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{statusBanner.text}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStatusBanner(null)}
                  className="font-mono text-[10px] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ============================================================== */}
            {/* 1. CLIENT PORTAL VIEWS                                         */}
            {/* ============================================================== */}
            {currentRole === 'client' && (
              <div className="space-y-4">
                {/* Summary KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248]">
                      Available Safari Wallet
                    </div>
                    <div className="font-mono text-lg font-bold text-[#226B3E] tabular-nums mt-1">
                      {formatPrice(availableBalanceUSD, currency)}
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5">
                      Ready for deposits & stays
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248]">
                      UWA Permit Escrow
                    </div>
                    <div className="font-mono text-lg font-bold text-[#D97706] tabular-nums mt-1">
                      {formatPrice(escrowBalanceUSD, currency)}
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5 tabular-nums">
                      {permitHolds.filter((h) => h.status === 'active_escrow').length} active permit holds
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248]">
                      Saved Custom Safaris
                    </div>
                    <div className="font-mono text-lg font-bold text-[#1A1612] tabular-nums mt-1">
                      {savedItineraries.length}
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5 tabular-nums">
                      {partnerBookings.length} partner lodge vouchers
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A5248]">
                      Expedition Credits
                    </div>
                    <div className="font-mono text-lg font-bold text-[#C85A28] tabular-nums mt-1">
                      {formatPrice(rewardCreditsUSD, currency)}
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5 tabular-nums">
                      {savedChecklists.length} packing checklists
                    </div>
                  </div>
                </div>

                {activeSection === 'overview' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Saved Safari Itineraries & Deposit Status
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Custom multi-day Uganda itineraries synced with your Safari Wallet and Firestore account.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const res = topUpWallet(500, 'Visa / Mastercard', 'Client Portal Quick Top-Up');
                            notify(res.ok ? 'success' : 'error', res.message);
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] text-xs font-mono font-semibold cursor-pointer"
                        >
                          + Top Up {formatPrice(500, currency)}
                        </button>
                        <Link
                          to="/trip-planner"
                          className="px-3 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold"
                        >
                          Build New Safari
                        </Link>
                      </div>
                    </div>

                    {savedItineraries.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-sm font-medium text-[#1A1612]">
                          No custom safari itineraries saved in your Client Portal yet.
                        </p>
                        <p className="text-xs text-[#5A5248] max-w-md mx-auto">
                          Use our interactive Trip Planner to generate a tailored Uganda primate or savannah circuit and save it to your account.
                        </p>
                        <div className="pt-2">
                          <Link
                            to="/trip-planner"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#C85A28] text-white text-xs font-semibold"
                          >
                            <span>Launch Custom Trip Planner</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                              <th className="py-2.5 px-3.5">Ref Code</th>
                              <th className="py-2.5 px-3.5">Expedition & Region</th>
                              <th className="py-2.5 px-3.5">Assigned Specialist</th>
                              <th className="py-2.5 px-3.5 text-right">Duration</th>
                              <th className="py-2.5 px-3.5 text-right">Est. Per Person</th>
                              <th className="py-2.5 px-3.5 text-right">30% Deposit</th>
                              <th className="py-2.5 px-3.5">Status</th>
                              <th className="py-2.5 px-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E4DCCF]">
                            {savedItineraries.map((itin) => (
                              <tr key={itin.id} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5 font-mono font-semibold text-[#1A1612] tabular-nums">
                                  {itin.referenceCode}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-[#1A1612]">
                                    {itin.title}
                                  </div>
                                  <div className="text-[11px] text-[#5A5248]">
                                    {itin.region} • {itin.budgetTier}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <Link
                                    to={`/guides/${itin.matchedGuideSlug}`}
                                    className="text-[#226B3E] font-medium hover:underline"
                                  >
                                    {itin.matchedGuideName}
                                  </Link>
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                  {itin.durationDays}d
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                  {formatPrice(itin.estimatedPerPersonUSD, currency)}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                  {formatPrice(itin.depositAmountUSD, currency)}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  {itin.depositPaid ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#16A34A]/15 text-[#16A34A]">
                                      Deposit Paid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D97706]/15 text-[#D97706]">
                                      Pending 30%
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3.5 text-right">
                                  {!itin.depositPaid ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = paySavedItineraryDeposit(itin.id);
                                        notify(res.ok ? 'success' : 'error', res.message);
                                      }}
                                      className="px-2.5 py-1 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white font-semibold cursor-pointer"
                                    >
                                      Pay Deposit
                                    </button>
                                  ) : (
                                    <span className="font-mono text-[10px] text-[#5A5248]">
                                      Confirmed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'permits' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          UWA Primate Permit Escrow Holds
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Funds held in escrow until our Entebbe desk uploads your official Uganda Wildlife Authority receipt.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const res = holdPermitInEscrow('uwa-chimp-kibale', 1, '2026-12-18');
                          notify(res.ok ? 'success' : 'error', res.message);
                        }}
                        className="px-3 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                      >
                        + Lock Kibale Chimp Permit ({formatPrice(250, currency)})
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Escrow Receipt</th>
                            <th className="py-2.5 px-3.5">UWA Permit Tariff</th>
                            <th className="py-2.5 px-3.5">National Park</th>
                            <th className="py-2.5 px-3.5 text-right">Guests</th>
                            <th className="py-2.5 px-3.5">Trek Date</th>
                            <th className="py-2.5 px-3.5 text-right">Escrow Held</th>
                            <th className="py-2.5 px-3.5">Status</th>
                            <th className="py-2.5 px-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {permitHolds.map((hold) => (
                            <tr key={hold.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-semibold tabular-nums">
                                {hold.uwaReceiptCode}
                              </td>
                              <td className="py-2.5 px-3.5 font-medium text-[#1A1612]">
                                {hold.permitName}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {hold.park}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                {hold.guests}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                {hold.PreferredTrekDate}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                {formatPrice(hold.amountHeldUSD, currency)}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                    hold.status === 'active_escrow'
                                      ? 'bg-[#D97706]/15 text-[#D97706]'
                                      : 'bg-[#16A34A]/15 text-[#16A34A]'
                                  }`}
                                >
                                  {hold.status === 'active_escrow' ? 'In Escrow' : 'Released'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                {hold.status === 'active_escrow' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const res = releasePermitEscrow(hold.id);
                                      notify(res.ok ? 'success' : 'error', res.message);
                                    }}
                                    className="px-2.5 py-1 rounded border border-[#D6CEC2] hover:bg-[#F3ECE1] text-[#1A1612] font-mono text-[10px] cursor-pointer"
                                  >
                                    Release to Wallet
                                  </button>
                                ) : (
                                  <span className="font-mono text-[10px] text-[#5A5248]">
                                    Settled
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'vouchers' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Confirmed Partner Lodge & Camp Vouchers
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Direct accommodation vouchers settled from your Safari Wallet.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const firstPartner = PARTNER_ACCOMMODATIONS[0];
                          if (firstPartner) {
                            const res = bookPartnerStay(
                              firstPartner.slug,
                              '2026-12-14',
                              2,
                              2
                            );
                            notify(res.ok ? 'success' : 'error', res.message);
                          }
                        }}
                        className="px-3 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                      >
                        + Reserve 2 Nights at {PARTNER_ACCOMMODATIONS[0]?.name}
                      </button>
                    </div>
                    {partnerBookings.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-sm font-medium text-[#1A1612]">
                          No partner accommodation vouchers issued yet.
                        </p>
                        <p className="text-xs text-[#5A5248]">
                          Reserve verified lodges, tented camps, or boutique hotels directly from your Safari Wallet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                              <th className="py-2.5 px-3.5">Voucher Code</th>
                              <th className="py-2.5 px-3.5">Property & Region</th>
                              <th className="py-2.5 px-3.5">Check-In</th>
                              <th className="py-2.5 px-3.5 text-right">Nights / Guests</th>
                              <th className="py-2.5 px-3.5 text-right">Total Settled</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E4DCCF]">
                            {partnerBookings.map((b) => (
                              <tr key={b.id} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5 font-mono font-semibold text-[#226B3E] tabular-nums">
                                  {b.voucherCode}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-[#1A1612]">
                                    {b.partnerName}
                                  </div>
                                  <div className="text-[11px] text-[#5A5248]">
                                    {b.region}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                  {b.checkInDate}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                  {b.nights}n • {b.guests}g
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                  {formatPrice(b.totalPaidUSD, currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'readiness' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Pre-Departure Checklists & Entebbe Desk Dispatches
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Track your Safari Essentials packing progress and communicate with your assigned specialist.
                        </p>
                      </div>
                      <Link
                        to="/safari-essentials"
                        className="px-3 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] text-xs font-semibold"
                      >
                        Open Safari Essentials Checklist
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {dispatches
                        .filter((d) => d.portalRole === 'client' || d.portalRole === 'specialist' || d.portalRole === 'staff')
                        .map((d) => (
                          <div
                            key={d.id}
                            className="p-3 rounded border border-[#E4DCCF] bg-[#FAF7F2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-[#226B3E] tabular-nums">
                                  {d.referenceCode}
                                </span>
                                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-white border border-[#E4DCCF] text-[#5A5248]">
                                  {d.category}
                                </span>
                                <span className="text-xs font-semibold text-[#1A1612]">
                                  {d.title}
                                </span>
                              </div>
                              <p className="text-xs text-[#5A5248]">
                                {d.notes} — <strong className="text-[#1A1612]">{d.authorName}</strong>
                              </p>
                            </div>
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#16A34A]/15 text-[#16A34A] self-start sm:self-center shrink-0">
                              {d.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. SPECIALISTS (GUIDE) PORTAL VIEWS                            */}
            {/* ============================================================== */}
            {currentRole === 'specialist' && selectedGuide && (
              <div className="space-y-4">
                {/* Active Specialist Header Strip */}
                <div className="bg-white border border-[#E4DCCF] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedGuide.photo}
                      alt={selectedGuide.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#D6CEC2]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          {selectedGuide.name}
                        </h2>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E] font-semibold tabular-nums">
                          {selectedGuide.yearsExperience} Yrs Exp • ★ {selectedGuide.rating.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5248]">
                        Home Base: <strong className="text-[#1A1612]">{selectedGuide.homeRegion}</strong> • Languages: {selectedGuide.languages.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/guides/${selectedGuide.slug}`}
                      className="px-3 py-1.5 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] text-xs font-semibold"
                    >
                      View Public Dossier
                    </Link>
                  </div>
                </div>

                {activeSection === 'roster' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1A1612]">
                          Assigned Expeditions & Guaranteed Departures
                        </h3>
                        <p className="text-xs text-[#5A5248]">
                          Confirmed client departures and custom itineraries matched to {selectedGuide.name}.
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#226B3E] tabular-nums">
                        {CONFIRMED_EVENTS.length + leads.filter((l) => l.preferredGuideSlug === selectedGuide.slug).length} Active Assignments
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Expedition / Client</th>
                            <th className="py-2.5 px-3.5">Circuit & Sector</th>
                            <th className="py-2.5 px-3.5">Date Window</th>
                            <th className="py-2.5 px-3.5 text-right">Party / Spots</th>
                            <th className="py-2.5 px-3.5 text-right">Package Tariff</th>
                            <th className="py-2.5 px-3.5">Readiness</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {leads
                            .filter((l) => !l.preferredGuideSlug || l.preferredGuideSlug === selectedGuide.slug)
                            .map((lead) => (
                              <tr key={lead.id} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-[#1A1612]">
                                    {lead.name}
                                  </div>
                                  <div className="text-[11px] text-[#5A5248]">
                                    {lead.notes || 'Private 4x4 Land Cruiser Charter'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 text-[#5A5248]">
                                  {(lead.regions || ['Bwindi & Kibale']).join(', ')}
                                </td>
                                <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                  {lead.targetDates}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                  {lead.partySize} Guests
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                  {lead.budgetTier.toUpperCase()}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#16A34A]/15 text-[#16A34A]">
                                    {lead.status.replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          {CONFIRMED_EVENTS.map((ev) => (
                            <tr key={ev.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5">
                                <div className="font-semibold text-[#1A1612]">
                                  {ev.title}
                                </div>
                                <div className="text-[11px] text-[#5A5248]">
                                  {ev.category}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {ev.location}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                {ev.dateWindow}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                {ev.spotsRemaining} spots left
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                {formatPrice(ev.pricePerPersonUSD, currency)}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#226B3E]/15 text-[#226B3E]">
                                  {ev.statusLabel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'field-log' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-3">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1A1612]">
                          Specialist Field & Trail Condition Dispatches
                        </h3>
                        <p className="text-xs text-[#5A5248]">
                          Live wildlife tracking notes, Bwindi/Mgahinga trail conditions, and river crossing updates.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewDispatchCategory('Trail & Wildlife Sighting');
                          setShowNewDispatchModal(true);
                        }}
                        className="px-3 py-1.5 rounded bg-[#226B3E] text-white text-xs font-semibold cursor-pointer"
                      >
                        + Submit Field Report
                      </button>
                    </div>
                    <div className="space-y-2">
                      {dispatches
                        .filter((d) => d.portalRole === 'specialist' || d.portalRole === 'staff')
                        .map((d) => (
                          <div
                            key={d.id}
                            className="p-3 rounded border border-[#E4DCCF] bg-[#FAF7F2]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-[#226B3E] tabular-nums">
                                  {d.referenceCode}
                                </span>
                                <span className="font-mono text-[10px] text-[#5A5248]">
                                  {d.region}
                                </span>
                                <span className="text-xs font-semibold text-[#1A1612]">
                                  {d.title}
                                </span>
                              </div>
                              <p className="text-xs text-[#5A5248]">{d.notes}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#16A34A]/15 text-[#16A34A]">
                                {d.status}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeSection === 'vehicle' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF]">
                      <h3 className="font-serif text-base font-bold text-[#1A1612]">
                        4x4 Land Cruiser Inspection & Field Optics Verification
                      </h3>
                      <p className="text-xs text-[#5A5248]">
                        Confirm vehicle mechanical sign-off, pop-up roof latches, dual-battery fridge, and Swarovski optics before leaving Entebbe HQ.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Registration</th>
                            <th className="py-2.5 px-3.5">4x4 Specification</th>
                            <th className="py-2.5 px-3.5">Lead Specialist</th>
                            <th className="py-2.5 px-3.5">Current Sector</th>
                            <th className="py-2.5 px-3.5">Equipment Check</th>
                            <th className="py-2.5 px-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {fleet.map((v) => (
                            <tr key={v.regNumber} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-bold text-[#1A1612] tabular-nums">
                                {v.regNumber}
                              </td>
                              <td className="py-2.5 px-3.5 font-medium text-[#1A1612]">
                                {v.model}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {v.assignedGuide}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {v.currentLocation}
                              </td>
                              <td className="py-2.5 px-3.5">
                                {v.equipmentVerified ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#16A34A]/15 text-[#16A34A]">
                                    Verified Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D97706]/15 text-[#D97706]">
                                    Inspection Pending
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFleet((prev) =>
                                      prev.map((item) =>
                                        item.regNumber === v.regNumber
                                          ? {
                                              ...item,
                                              equipmentVerified: !item.equipmentVerified,
                                              status: !item.equipmentVerified
                                                ? 'ready_entebbe'
                                                : item.status,
                                            }
                                          : item
                                      )
                                    );
                                    notify(
                                      'success',
                                      `Updated pre-safari inspection status for ${v.regNumber}.`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded border border-[#D6CEC2] hover:bg-[#F3ECE1] text-[#1A1612] font-mono text-[10px] cursor-pointer"
                                >
                                  {v.equipmentVerified ? 'Recheck' : 'Verify Rig'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. PARTNER PORTAL VIEWS (LODGES, CAMPS & HOTELS)               */}
            {/* ============================================================== */}
            {currentRole === 'partner' && selectedPartner && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E4DCCF] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedPartner.heroImage}
                      alt={selectedPartner.name}
                      className="w-14 h-12 rounded object-cover border border-[#D6CEC2]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          {selectedPartner.name}
                        </h2>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#226B3E]/10 text-[#226B3E] font-semibold">
                          {selectedPartner.verifiedPartnerBadge}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5248]">
                        {selectedPartner.categoryLabel} • {selectedPartner.region} ({selectedPartner.locationDetails})
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] uppercase text-[#5A5248]">
                      Contracted Nightly Tariff
                    </div>
                    <div className="text-base font-bold text-[#226B3E] tabular-nums">
                      {formatPrice(
                        partnerRateOverrides[selectedPartner.slug] ??
                          selectedPartner.pricePerNightUSD,
                        currency
                      )}{' '}
                      / night
                    </div>
                  </div>
                </div>

                {activeSection === 'allocations' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1A1612]">
                          Guest Room Allocations & Confirmed Safari Vouchers
                        </h3>
                        <p className="text-xs text-[#5A5248]">
                          Live guest bookings from Enganda Safari Wallet and Entebbe Desk room block holds.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const res = bookPartnerStay(
                            selectedPartner.slug,
                            '2027-01-15',
                            2,
                            2
                          );
                          notify(res.ok ? 'success' : 'error', res.message);
                        }}
                        className="px-3 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                      >
                        + Issue Test Partner Voucher
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Voucher / Ref</th>
                            <th className="py-2.5 px-3.5">Property</th>
                            <th className="py-2.5 px-3.5">Region</th>
                            <th className="py-2.5 px-3.5">Check-In Date</th>
                            <th className="py-2.5 px-3.5 text-right">Nights / Guests</th>
                            <th className="py-2.5 px-3.5 text-right">Settlement Amount</th>
                            <th className="py-2.5 px-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {partnerBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-semibold text-[#226B3E] tabular-nums">
                                {b.voucherCode}
                              </td>
                              <td className="py-2.5 px-3.5 font-semibold text-[#1A1612]">
                                {b.partnerName}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {b.region}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                {b.checkInDate}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                {b.nights}n • {b.guests}g
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                {formatPrice(b.totalPaidUSD, currency)}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#16A34A]/15 text-[#16A34A]">
                                  Voucher Settled
                                </span>
                              </td>
                            </tr>
                          ))}
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-semibold text-[#1A1612] tabular-nums">
                                BLK-{lead.id.slice(-5).toUpperCase()}
                              </td>
                              <td className="py-2.5 px-3.5 font-semibold text-[#1A1612]">
                                {selectedPartner.name} ({lead.name})
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {selectedPartner.region}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                {lead.targetDates}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                2n • {lead.partySize}g
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                {formatPrice(
                                  (partnerRateOverrides[selectedPartner.slug] ??
                                    selectedPartner.pricePerNightUSD) *
                                    2 *
                                    Math.ceil(lead.partySize / 2),
                                  currency
                                )}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D97706]/15 text-[#D97706]">
                                  Desk Allocation Hold
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'rates' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF]">
                      <h3 className="font-serif text-base font-bold text-[#1A1612]">
                        Partner Properties & Seasonal Contracted Tariffs
                      </h3>
                      <p className="text-xs text-[#5A5248]">
                        Manage contracted full-board nightly rates across Enganda’s verified accommodation network.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Partner Property</th>
                            <th className="py-2.5 px-3.5">Category & Tier</th>
                            <th className="py-2.5 px-3.5">Uganda Region</th>
                            <th className="py-2.5 px-3.5 text-right">Nightly Rate ({currency})</th>
                            <th className="py-2.5 px-3.5 text-right">Adjust Tariff (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {PARTNER_ACCOMMODATIONS.map((p) => {
                            const currentUSD =
                              partnerRateOverrides[p.slug] ?? p.pricePerNightUSD;
                            return (
                              <tr key={p.slug} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5 font-semibold text-[#1A1612]">
                                  {p.name}
                                </td>
                                <td className="py-2.5 px-3.5 text-[#5A5248]">
                                  {p.categoryLabel} • {p.comfortTier}
                                </td>
                                <td className="py-2.5 px-3.5 text-[#5A5248]">
                                  {p.region}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-[#226B3E] tabular-nums">
                                  {formatPrice(currentUSD, currency)}
                                </td>
                                <td className="py-2.5 px-3.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = Math.max(60, currentUSD - 20);
                                        setPartnerRateOverrides((prev) => ({
                                          ...prev,
                                          [p.slug]: next,
                                        }));
                                        notify(
                                          'success',
                                          `Updated ${p.name} nightly tariff to US$${next}.`
                                        );
                                      }}
                                      className="px-2 py-0.5 rounded border border-[#D6CEC2] hover:bg-[#F3ECE1] font-mono text-[10px] cursor-pointer"
                                    >
                                      -$20
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = currentUSD + 20;
                                        setPartnerRateOverrides((prev) => ({
                                          ...prev,
                                          [p.slug]: next,
                                        }));
                                        notify(
                                          'success',
                                          `Updated ${p.name} nightly tariff to US$${next}.`
                                        );
                                      }}
                                      className="px-2 py-0.5 rounded border border-[#D6CEC2] hover:bg-[#F3ECE1] font-mono text-[10px] cursor-pointer"
                                    >
                                      +$20
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
                )}

                {activeSection === 'settlements' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-4 space-y-3">
                    <h3 className="font-serif text-base font-bold text-[#1A1612]">
                      Partner Escrow Settlement & Conservation Levy Ledger
                    </h3>
                    <p className="text-xs text-[#5A5248]">
                      All partner accommodation vouchers are settled in USD, EUR, GBP, or UGX via Stanbic Uganda Wire or Corporate MTN Mobile Money within 24 hours of guest check-in.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded border border-[#E4DCCF] bg-[#FAF7F2]">
                        <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                          Settled Vouchers
                        </div>
                        <div className="font-mono text-base font-bold text-[#16A34A] tabular-nums mt-0.5">
                          {formatPrice(
                            partnerBookings.reduce((acc, b) => acc + b.totalPaidUSD, 0) || 1480,
                            currency
                          )}
                        </div>
                      </div>
                      <div className="p-3 rounded border border-[#E4DCCF] bg-[#FAF7F2]">
                        <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                          Community Conservation Share
                        </div>
                        <div className="font-mono text-base font-bold text-[#226B3E] tabular-nums mt-0.5">
                          10.0% Included
                        </div>
                      </div>
                      <div className="p-3 rounded border border-[#E4DCCF] bg-[#FAF7F2]">
                        <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                          Settlement Rail
                        </div>
                        <div className="font-mono text-xs font-semibold text-[#1A1612] mt-1">
                          Entebbe Trust Direct Wire
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. STAFF PORTAL VIEWS (ENTEBBE OPERATIONS DESK)                */}
            {/* ============================================================== */}
            {currentRole === 'staff' && (
              <div className="space-y-4">
                {activeSection === 'inquiries' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Entebbe Desk — Client Inquiry & Lead Dispatch Queue
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Assign field specialists, send custom quotes, and confirm incoming safari inquiries.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-[#FAF7F2] border border-[#D6CEC2] rounded px-2.5 py-1 text-xs font-mono text-[#1A1612]"
                        >
                          <option value="all">All Statuses ({leads.length})</option>
                          <option value="new">New Inquiries</option>
                          <option value="quote_sent">Quote Sent</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => openInquiryModal()}
                          className="px-3 py-1 rounded bg-[#C85A28] text-white text-xs font-semibold cursor-pointer"
                        >
                          + Log Phone/WhatsApp Lead
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Client & Contact</th>
                            <th className="py-2.5 px-3.5">Target Dates & Tier</th>
                            <th className="py-2.5 px-3.5 text-right">Party</th>
                            <th className="py-2.5 px-3.5">Assigned Specialist</th>
                            <th className="py-2.5 px-3.5">Status</th>
                            <th className="py-2.5 px-3.5 text-right">Desk Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {leads
                            .filter((l) => statusFilter === 'all' || l.status === statusFilter)
                            .map((lead) => (
                              <tr key={lead.id} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-[#1A1612]">
                                    {lead.name}
                                  </div>
                                  <div className="font-mono text-[10px] text-[#5A5248] tabular-nums">
                                    {lead.email} • {lead.whatsapp}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <div className="font-mono text-[11px] tabular-nums">
                                    {lead.targetDates}
                                  </div>
                                  <div className="text-[10px] uppercase font-mono text-[#5A5248]">
                                    {lead.budgetTier}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                  {lead.partySize}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <select
                                    value={lead.preferredGuideSlug || 'samuel-kato'}
                                    onChange={(e) => {
                                      updateLeadStatus(lead.id, lead.status, e.target.value);
                                      notify(
                                        'success',
                                        `Assigned specialist to ${lead.name}.`
                                      );
                                    }}
                                    className="bg-[#FAF7F2] border border-[#D6CEC2] rounded px-2 py-1 text-xs text-[#1A1612]"
                                  >
                                    {GUIDES.map((g) => (
                                      <option key={g.slug} value={g.slug}>
                                        {g.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                      lead.status === 'confirmed'
                                        ? 'bg-[#16A34A]/15 text-[#16A34A]'
                                        : lead.status === 'quote_sent'
                                        ? 'bg-[#D97706]/15 text-[#D97706]'
                                        : 'bg-[#C85A28]/15 text-[#C85A28]'
                                    }`}
                                  >
                                    {lead.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    {lead.status === 'new' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateLeadStatus(lead.id, 'quote_sent');
                                          notify('success', `Marked quote sent for ${lead.name}.`);
                                        }}
                                        className="px-2 py-1 rounded bg-[#226B3E] text-white font-mono text-[10px] cursor-pointer"
                                      >
                                        Send Quote
                                      </button>
                                    )}
                                    {lead.status !== 'confirmed' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateLeadStatus(lead.id, 'confirmed');
                                          notify('success', `Confirmed expedition for ${lead.name}.`);
                                        }}
                                        className="px-2 py-1 rounded border border-[#226B3E] text-[#226B3E] hover:bg-[#226B3E] hover:text-white font-mono text-[10px] cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'uwa-queue' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF]">
                      <h2 className="font-serif text-base font-bold text-[#1A1612]">
                        Uganda Wildlife Authority (UWA) Permit Procurement Desk
                      </h2>
                      <p className="text-xs text-[#5A5248]">
                        Official UWA Kampala & Entebbe permit reservation desk — verify escrow holds and issue E-Permit serial receipts.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Permit Tariff</th>
                            <th className="py-2.5 px-3.5">National Park</th>
                            <th className="py-2.5 px-3.5 text-right">Official UWA Cost</th>
                            <th className="py-2.5 px-3.5">Daily Quota</th>
                            <th className="py-2.5 px-3.5 text-right">Min Age</th>
                            <th className="py-2.5 px-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {PERMIT_FACTS.map((pf) => (
                            <tr key={pf.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-semibold text-[#1A1612]">
                                {pf.name}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {pf.park}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-[#226B3E] tabular-nums">
                                {formatPrice(pf.costUSD, currency)}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[11px] tabular-nums">
                                {pf.dailyQuota}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                                {pf.minAge} yrs
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = holdPermitInEscrow(pf.id, 1, '2027-01-20');
                                    notify(res.ok ? 'success' : 'error', res.message);
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] border border-[#D6CEC2] font-mono text-[10px] cursor-pointer"
                                >
                                  Queue Escrow Hold
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'fleet-ebb' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF]">
                      <h2 className="font-serif text-base font-bold text-[#1A1612]">
                        Entebbe International Airport (EBB) Meet & Greet + 4x4 Fleet Dispatch
                      </h2>
                      <p className="text-xs text-[#5A5248]">
                        10 minutes from Bugonga HQ — coordinate EBB VIP arrivals and 4x4 Extended Land Cruiser assignments.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Vehicle Reg</th>
                            <th className="py-2.5 px-3.5">Model & Roof Spec</th>
                            <th className="py-2.5 px-3.5">Assigned Specialist</th>
                            <th className="py-2.5 px-3.5">Location</th>
                            <th className="py-2.5 px-3.5">Next EBB Pickup</th>
                            <th className="py-2.5 px-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {fleet.map((v) => (
                            <tr key={v.regNumber} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-bold tabular-nums">
                                {v.regNumber}
                              </td>
                              <td className="py-2.5 px-3.5 font-medium text-[#1A1612]">
                                {v.model}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {v.assignedGuide}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {v.currentLocation}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono tabular-nums">
                                {v.nextDeparture}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                    v.status === 'ready_entebbe'
                                      ? 'bg-[#16A34A]/15 text-[#16A34A]'
                                      : v.status === 'on_safari'
                                      ? 'bg-[#226B3E]/15 text-[#226B3E]'
                                      : 'bg-[#D97706]/15 text-[#D97706]'
                                  }`}
                                >
                                  {v.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 5. ADMIN GOVERNANCE PORTAL VIEWS                               */}
            {/* ============================================================== */}
            {currentRole === 'admin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Total Client & Escrow Liquidity
                    </div>
                    <div className="font-mono text-lg font-bold text-[#226B3E] tabular-nums mt-1">
                      {formatPrice(availableBalanceUSD + escrowBalanceUSD, currency)}
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5 tabular-nums">
                      {transactions.length} ledger transactions
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Verified Specialists & Partners
                    </div>
                    <div className="font-mono text-lg font-bold text-[#1A1612] tabular-nums mt-1">
                      {GUIDES.length} Guides • {PARTNER_ACCOMMODATIONS.length} Lodges
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5">
                      UTB & AUTO Accredited
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Active Inquiry Pipeline
                    </div>
                    <div className="font-mono text-lg font-bold text-[#C85A28] tabular-nums mt-1">
                      {leads.length} Leads
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5 tabular-nums">
                      {leads.filter((l) => l.status === 'confirmed').length} confirmed expeditions
                    </div>
                  </div>
                  <div className="bg-white border border-[#E4DCCF] rounded-lg p-3.5">
                    <div className="font-mono text-[10px] uppercase text-[#5A5248]">
                      Cloud Firestore RBAC
                    </div>
                    <div className="font-mono text-sm font-bold text-[#16A34A] mt-1">
                      Rules Enforced
                    </div>
                    <div className="text-[11px] text-[#5A5248] mt-0.5">
                      Admin: mugisolo@gmail.com
                    </div>
                  </div>
                </div>

                {activeSection === 'command' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Executive Treasury & Escrow Audit Ledger
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Complete audit trail of client wallet deposits, UWA permit escrow holds, and partner lodge settlements.
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-[#226B3E] font-semibold tabular-nums">
                        {transactions.length} Entries
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Reference</th>
                            <th className="py-2.5 px-3.5">Transaction Description</th>
                            <th className="py-2.5 px-3.5">Payment Rail</th>
                            <th className="py-2.5 px-3.5">Timestamp</th>
                            <th className="py-2.5 px-3.5 text-right">Amount</th>
                            <th className="py-2.5 px-3.5">State</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-mono font-semibold tabular-nums">
                                {tx.referenceCode}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <div className="font-semibold text-[#1A1612]">
                                  {tx.title}
                                </div>
                                <div className="text-[11px] text-[#5A5248]">
                                  {tx.subtitle}
                                </div>
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[11px]">
                                {tx.paymentRail}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#5A5248] tabular-nums">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-semibold tabular-nums">
                                {formatPrice(tx.amountUSD, currency)}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                    tx.status === 'completed'
                                      ? 'bg-[#16A34A]/15 text-[#16A34A]'
                                      : tx.status === 'escrow_held'
                                      ? 'bg-[#D97706]/15 text-[#D97706]'
                                      : 'bg-[#5A5248]/15 text-[#5A5248]'
                                  }`}
                                >
                                  {tx.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'rbac' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF]">
                      <h2 className="font-serif text-base font-bold text-[#1A1612]">
                        Multi-Role Portal Governance & Access Matrix
                      </h2>
                      <p className="text-xs text-[#5A5248]">
                        All 5 role portals enabled with Firestore `request.auth.uid` ownership rules and admin bootstrap for `mugisolo@gmail.com`.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Portal Role</th>
                            <th className="py-2.5 px-3.5">Route Endpoint</th>
                            <th className="py-2.5 px-3.5">Primary Capabilities</th>
                            <th className="py-2.5 px-3.5">Firestore Scope</th>
                            <th className="py-2.5 px-3.5 text-right">Launch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {PORTAL_DEFINITIONS.map((p) => (
                            <tr key={p.role} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-2.5 px-3.5 font-semibold text-[#1A1612]">
                                {p.label}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#226B3E]">
                                /portals/{p.slug}
                              </td>
                              <td className="py-2.5 px-3.5 text-[#5A5248]">
                                {p.subtitle}
                              </td>
                              <td className="py-2.5 px-3.5 font-mono text-[10px] text-[#5A5248]">
                                request.auth.uid + isAdmin()
                              </td>
                              <td className="py-2.5 px-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRoleSwitch(p)}
                                  className="px-2.5 py-1 rounded bg-[#226B3E] text-white font-mono text-[10px] cursor-pointer"
                                >
                                  Open Portal
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'dispatches' && (
                  <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E4DCCF] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-base font-bold text-[#1A1612]">
                          Cross-Portal Operational Dispatches & Field Logs
                        </h2>
                        <p className="text-xs text-[#5A5248]">
                          Approve, verify, or resolve dispatches submitted across Client, Specialist, Partner, and Staff portals.
                        </p>
                      </div>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter dispatches..."
                        className="bg-[#FAF7F2] border border-[#D6CEC2] rounded px-3 py-1 text-xs text-[#1A1612]"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E4DCCF] font-mono text-[10px] uppercase text-[#5A5248]">
                            <th className="py-2.5 px-3.5">Ref Code</th>
                            <th className="py-2.5 px-3.5">Portal</th>
                            <th className="py-2.5 px-3.5">Title & Author</th>
                            <th className="py-2.5 px-3.5">Region</th>
                            <th className="py-2.5 px-3.5">Status</th>
                            <th className="py-2.5 px-3.5 text-right">Governance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4DCCF]">
                          {dispatches
                            .filter(
                              (d) =>
                                !searchQuery.trim() ||
                                d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                d.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                d.authorName.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((d) => (
                              <tr key={d.id} className="hover:bg-[#FAF7F2]/60">
                                <td className="py-2.5 px-3.5 font-mono font-semibold tabular-nums">
                                  {d.referenceCode}
                                </td>
                                <td className="py-2.5 px-3.5 font-mono text-[10px] uppercase text-[#226B3E]">
                                  {d.portalRole}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <div className="font-semibold text-[#1A1612]">
                                    {d.title}
                                  </div>
                                  <div className="text-[11px] text-[#5A5248]">
                                    {d.authorName}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 text-[#5A5248]">
                                  {d.region}
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                      d.status === 'verified' || d.status === 'resolved'
                                        ? 'bg-[#16A34A]/15 text-[#16A34A]'
                                        : 'bg-[#D97706]/15 text-[#D97706]'
                                    }`}
                                  >
                                    {d.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    {d.status !== 'verified' && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateDispatchStatus(d.id, 'verified')
                                        }
                                        className="px-2 py-0.5 rounded bg-[#226B3E] text-white font-mono text-[10px] cursor-pointer"
                                      >
                                        Verify
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDispatch(d.id)}
                                      className="p-1 rounded text-[#5A5248] hover:text-[#DC2626] cursor-pointer"
                                      title="Remove dispatch"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Operational Dispatch Modal */}
      {showNewDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DCCF] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-semibold">
                  {activePortalDef.label}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1612]">
                  Submit Portal Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDispatchModal(false)}
                className="text-xs font-mono text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
              >
                Close [Esc]
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Subject / Dispatch Headline
                </label>
                <input
                  type="text"
                  required
                  value={newDispatchTitle}
                  onChange={(e) => setNewDispatchTitle(e.target.value)}
                  placeholder="e.g., Bwindi Nkuringo permit confirmation or vehicle readiness sign-off"
                  className="w-full bg-white border border-[#D6CEC2] rounded px-3 py-2 text-xs text-[#1A1612]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                    Category
                  </label>
                  <select
                    value={newDispatchCategory}
                    onChange={(e) => setNewDispatchCategory(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-2 text-xs text-[#1A1612]"
                  >
                    <option value="Field Dispatch">Field Dispatch</option>
                    <option value="UWA Permit Request">UWA Permit Request</option>
                    <option value="Room Allocation">Room Allocation</option>
                    <option value="EBB Airport Pickup">EBB Airport Pickup</option>
                    <option value="Client Concierge">Client Concierge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                    Uganda Region
                  </label>
                  <select
                    value={newDispatchRegion}
                    onChange={(e) => setNewDispatchRegion(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-2 text-xs text-[#1A1612]"
                  >
                    <option value="Bwindi & Mgahinga">Bwindi & Mgahinga</option>
                    <option value="Kibale Forest">Kibale Forest</option>
                    <option value="Queen Elizabeth NP">Queen Elizabeth NP</option>
                    <option value="Murchison Falls NP">Murchison Falls NP</option>
                    <option value="Kidepo Valley NP">Kidepo Valley NP</option>
                    <option value="Entebbe & Lake Victoria">Entebbe & Lake Victoria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                    Priority
                  </label>
                  <select
                    value={newDispatchPriority}
                    onChange={(e) =>
                      setNewDispatchPriority(
                        e.target.value as 'normal' | 'high' | 'urgent'
                      )
                    }
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-2 text-xs text-[#1A1612]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1612] mb-1">
                  Operational Notes & Reference Details
                </label>
                <textarea
                  rows={3}
                  value={newDispatchNotes}
                  onChange={(e) => setNewDispatchNotes(e.target.value)}
                  placeholder="Include UWA receipt numbers, flight numbers, or trail observations..."
                  className="w-full bg-white border border-[#D6CEC2] rounded px-3 py-2 text-xs text-[#1A1612]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DCCF]">
                <button
                  type="button"
                  onClick={() => setShowNewDispatchModal(false)}
                  className="px-3 py-1.5 rounded border border-[#D6CEC2] text-xs font-medium text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Sync Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
