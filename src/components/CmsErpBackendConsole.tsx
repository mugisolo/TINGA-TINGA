import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Layers,
  Building2,
  Car,
  ShieldCheck,
  DollarSign,
  Send,
  RefreshCw,
  FileText,
  Plus,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import { formatPrice } from '../lib/currency';
import { ServiceProviderVerifiedBadge } from './ServiceProviderVerifiedBadge';

interface CMSSiteContentBlock {
  id: string;
  key: string;
  section: string;
  title: string;
  subtitle: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  active: boolean;
  updatedAt: string;
}

interface CMSCarouselSlot {
  slotNumber: number;
  menuLabel: string;
  title: string;
  vendorName: string;
  utbLicenseNumber: string;
  priceUSD: number;
  status: string;
}

interface CMSFooterLogo {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  category: string;
  active: boolean;
  displayOrder: number;
}

interface CMSJournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  readTime: string;
  summary: string;
  published: boolean;
}

interface CMSOverviewResponse {
  systemName: string;
  architecture: string;
  maxPaidCarouselSlots: number;
  activeCarouselCount: number;
  standbyCarouselCount: number;
  activeCarouselSlots: CMSCarouselSlot[];
  standbyCarouselSlots: CMSCarouselSlot[];
  siteContentBlocks: CMSSiteContentBlock[];
  footerPartnerLogos: CMSFooterLogo[];
  journalArticles: CMSJournalArticle[];
  lastSynchronizedAt: string;
}

interface ERPGuideRecord {
  id: string;
  slug: string;
  name: string;
  utbLicenseNumber: string;
  uwaAccreditationId: string;
  usagaTier: string;
  homeRegion: string;
  dailyRateUSD: number;
  status: string;
  verified: boolean;
}

interface ERPSafariOperator {
  id: string;
  slug: string;
  name: string;
  utbLicenseNumber: string;
  uwaAccreditationId: string;
  headquarters: string;
  verifiedStatus: string;
  rating: number;
}

interface ERPDriverVehicle {
  id: string;
  title: string;
  driverName: string;
  utbDriverPermit: string;
  uwaParkVehiclePass: string;
  registrationPlate: string;
  vehicleCategory: string;
  passengerCapacity: number;
  dailyRateUSD: number;
  baseLocation: string;
  availabilityStatus: string;
  verified: boolean;
}

interface ERPHotelRoom {
  id: string;
  hotelId: string;
  hotelName: string;
  roomTitle: string;
  category: string;
  region: string;
  utbLicenseNumber: string;
  pricePerNightUSD: number;
  capacityGuests: number;
  boardBasis: string;
  availableUnits: number;
  verified: boolean;
}

interface ERPUWAPermitAllocation {
  permitId: string;
  bookingReference: string;
  parkSector: string;
  permitType: string;
  guests: number;
  unitFeeUSD: number;
  totalEscrowUSD: number;
  escrowBank: string;
  uwaStatus: string;
  trekDate: string;
}

interface ERPFinanceLedgerEntry {
  transactionId: string;
  reference: string;
  entryType: string;
  settlementChannel: string;
  currency: string;
  amountUSD: number;
  convertedAmount: number;
  beneficiaryVendor: string;
  status: string;
  timestamp: string;
}

interface ERPPortalDispatch {
  id: string;
  targetPortal: string;
  priority: string;
  title: string;
  instruction: string;
  assignedTo: string;
  status: string;
  createdAt: string;
}

interface ERPOverviewResponse {
  systemName: string;
  regulatoryAuthority: string;
  bankingPartners: string[];
  serviceProviderTiers: {
    guides: number;
    safariOperators: number;
    driversAndFleet: number;
    hotelsAndCampsites: number;
  };
  guides: ERPGuideRecord[];
  safariOperators: ERPSafariOperator[];
  driverFleetVehicles: ERPDriverVehicle[];
  partnerHotelRooms: ERPHotelRoom[];
  uwaPermitAllocations: ERPUWAPermitAllocation[];
  financeLedger: ERPFinanceLedgerEntry[];
  portalDispatches: ERPPortalDispatch[];
  treasuryMetrics: {
    grossEscrowVolumeUSD: number;
    uwaPermitTrustBalanceUSD: number;
    netVendorPayableUSD: number;
    totalBookingsCount: number;
  };
  lastSynchronizedAt: string;
}

interface CmsErpBackendConsoleProps {
  onNotify?: (type: 'success' | 'error', text: string) => void;
}

export const CmsErpBackendConsole: React.FC<CmsErpBackendConsoleProps> = ({
  onNotify,
}) => {
  const { currency } = useInquiry();
  const [activeTab, setActiveTab] = useState<'cms' | 'erp_providers' | 'erp_finance' | 'erp_dispatch'>('cms');
  const [cmsData, setCmsData] = useState<CMSOverviewResponse | null>(null);
  const [erpData, setErpData] = useState<ERPOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // CMS Site Block Form
  const [blockKey, setBlockKey] = useState('homepage_standalone_frame');
  const [blockSection, setBlockSection] = useState('Homepage Standalone Editorial Frame');
  const [blockTitle, setBlockTitle] = useState('East Africa, shown to you by the people who call it home.');
  const [blockSubtitle, setBlockSubtitle] = useState('Uganda-First Specialist Marketplace · UTB & UWA Verified Multi-Vendor Platform');
  const [blockBody, setBlockBody] = useState(
    'Connect directly with Uganda Tourism Board (UTB) and Uganda Wildlife Authority (UWA) licensed guides, safari operators, 4x4 fleet drivers, and heritage hotels—backed by Ecobank & FINCA permit escrow.'
  );

  // ERP Hotel Room Form
  const [hotelName, setHotelName] = useState('Igongo Country Hotel & Cultural Centre');
  const [roomTitle, setRoomTitle] = useState('Ankole Heritage Deluxe Garden Cottage');
  const [roomCategory, setRoomCategory] = useState('Hotel');
  const [roomRegion, setRoomRegion] = useState('Biharwe, Mbarara — Western Circuit');
  const [roomUtbLicense, setRoomUtbLicense] = useState('UTB/HL/2026/0089');
  const [roomPriceUSD, setRoomPriceUSD] = useState<number>(175);
  const [roomUnits, setRoomUnits] = useState<number>(6);

  // ERP Driver Fleet Form
  const [vehicleTitle, setVehicleTitle] = useState('4x4 Extended Safari Land Cruiser V8 (Pop-Up Roof)');
  const [driverName, setDriverName] = useState('Robert T. — Senior Savannah & Primate Driver');
  const [registrationPlate, setRegistrationPlate] = useState('UBH 614T');
  const [vehicleDailyRateUSD, setVehicleDailyRateUSD] = useState<number>(195);

  // ERP Finance Ledger Form
  const [ledgerRef, setLedgerRef] = useState('ENG-804120');
  const [ledgerType, setLedgerType] = useState('ESCROW_DEPOSIT');
  const [ledgerChannel, setLedgerChannel] = useState('Relworx Mobile Money -> Ecobank Escrow');
  const [ledgerAmountUSD, setLedgerAmountUSD] = useState<number>(3980);
  const [ledgerBeneficiary, setLedgerBeneficiary] = useState('Tingatinga Safaris (UTB/TO/2026/0418)');

  // ERP Dispatch Form
  const [dispatchPortal, setDispatchPortal] = useState('specialist');
  const [dispatchPriority, setDispatchPriority] = useState('HIGH');
  const [dispatchTitle, setDispatchTitle] = useState('Buhoma Sector Gorilla Trekking Permit & Vehicle Handover');
  const [dispatchAssignedTo, setDispatchAssignedTo] = useState('Sam M. (UWA-G-1084) & Moses K. (UBF 418T)');
  const [dispatchInstruction, setDispatchInstruction] = useState(
    'Confirm UWA permit vouchers and complete Entebbe pre-departure 4x4 vehicle checklist.'
  );

  const reportMessage = (type: 'success' | 'error', text: string) => {
    setStatusMessage(text);
    if (onNotify) {
      onNotify(type, text);
    }
  };

  const fetchBackendSnapshots = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cmsRes, erpRes] = await Promise.all([
        fetch('/api/cms/overview'),
        fetch('/api/erp/overview'),
      ]);
      if (cmsRes.ok) {
        const cmsJson = (await cmsRes.json()) as CMSOverviewResponse;
        setCmsData(cmsJson);
      }
      if (erpRes.ok) {
        const erpJson = (await erpRes.json()) as ERPOverviewResponse;
        setErpData(erpJson);
      }
    } catch (_err) {
      // Keep previous snapshot if offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendSnapshots();
  }, [fetchBackendSnapshots]);

  const handleSaveCmsSiteBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cms/site-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: blockKey,
          section: blockSection,
          title: blockTitle,
          subtitle: blockSubtitle,
          bodyText: blockBody,
          active: true,
        }),
      });
      if (res.ok) {
        await fetchBackendSnapshots();
        reportMessage('success', `CMS site block "${blockKey}" saved to backend.`);
      } else {
        const err = await res.json();
        reportMessage('error', err.error || 'Failed to save CMS site block.');
      }
    } catch (_e) {
      reportMessage('error', 'Network error while saving CMS block.');
    }
  };

  const handleSaveErpHotelRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/hotel-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName,
          roomTitle,
          category: roomCategory,
          region: roomRegion,
          utbLicenseNumber: roomUtbLicense,
          pricePerNightUSD: Number(roomPriceUSD),
          availableUnits: Number(roomUnits),
        }),
      });
      if (res.ok) {
        await fetchBackendSnapshots();
        reportMessage('success', `ERP Hotel/Campsite Room "${roomTitle}" added to backend inventory.`);
      } else {
        const err = await res.json();
        reportMessage('error', err.error || 'Failed to add hotel room.');
      }
    } catch (_e) {
      reportMessage('error', 'Network error while saving ERP hotel room.');
    }
  };

  const handleSaveErpVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/driver-fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: vehicleTitle,
          driverName,
          registrationPlate,
          dailyRateUSD: Number(vehicleDailyRateUSD),
        }),
      });
      if (res.ok) {
        await fetchBackendSnapshots();
        reportMessage('success', `ERP Driver & 4x4 Fleet Vehicle (${registrationPlate}) registered.`);
      } else {
        const err = await res.json();
        reportMessage('error', err.error || 'Failed to save fleet vehicle.');
      }
    } catch (_e) {
      reportMessage('error', 'Network error while saving ERP fleet vehicle.');
    }
  };

  const handlePostFinanceLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: ledgerRef,
          entryType: ledgerType,
          settlementChannel: ledgerChannel,
          currency,
          amountUSD: Number(ledgerAmountUSD),
          beneficiaryVendor: ledgerBeneficiary,
        }),
      });
      if (res.ok) {
        await fetchBackendSnapshots();
        reportMessage('success', `ERP Finance Escrow transaction (${ledgerRef}) recorded.`);
      } else {
        const err = await res.json();
        reportMessage('error', err.error || 'Failed to record ERP transaction.');
      }
    } catch (_e) {
      reportMessage('error', 'Network error while posting ERP transaction.');
    }
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPortal: dispatchPortal,
          priority: dispatchPriority,
          title: dispatchTitle,
          assignedTo: dispatchAssignedTo,
          instruction: dispatchInstruction,
        }),
      });
      if (res.ok) {
        await fetchBackendSnapshots();
        reportMessage('success', `Operational dispatch sent to ${dispatchPortal.toUpperCase()} portal.`);
      } else {
        const err = await res.json();
        reportMessage('error', err.error || 'Failed to create operational dispatch.');
      }
    } catch (_e) {
      reportMessage('error', 'Network error while creating dispatch.');
    }
  };

  return (
    <div className="bg-white border border-[#E4DCCF] rounded-lg overflow-hidden shadow-2xs">
      {/* Header Bar */}
      <div className="bg-[#144225] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-[#E59A52]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#E59A52] text-[#1A1612] font-bold">
                Go Chi Router &amp; Express API Active
              </span>
              <span className="font-mono text-[10px] text-[#C7B9A5]">
                /api/cms/* · /api/erp/*
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
              Unified Backend CMS &amp; ERP Control Center
            </h2>
            <p className="text-xs text-[#D6CEC2]">
              Live content management, 4-tier service provider resource planning (Guides, Safari Operators, Drivers, Hotels), UWA permit escrow, and Relworx/Ecobank/FINCA settlement ledger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchBackendSnapshots}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Backend State</span>
        </button>
      </div>

      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 p-4 bg-[#FAF7F2] border-b border-[#E4DCCF] text-xs">
        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">Paid Carousel Cap</div>
          <div className="font-serif text-base font-bold text-[#1A1612] mt-0.5">
            {cmsData?.activeCarouselCount ?? 10} / {cmsData?.maxPaidCarouselSlots ?? 10} Active
          </div>
          <div className="font-mono text-[10px] text-[#226B3E]">
            +{cmsData?.standbyCarouselCount ?? 1} Standby (Slot 011)
          </div>
        </div>

        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">CMS Content &amp; Logos</div>
          <div className="font-serif text-base font-bold text-[#1A1612] mt-0.5">
            {cmsData?.siteContentBlocks.length ?? 3} Blocks · {cmsData?.footerPartnerLogos.length ?? 5} Logos
          </div>
          <div className="font-mono text-[10px] text-[#C85A28]">
            UWA · UTB · ECO Bank · FINCA · RELWORX
          </div>
        </div>

        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">4-Tier Service Providers</div>
          <div className="font-serif text-base font-bold text-[#1A1612] mt-0.5">
            {(erpData?.serviceProviderTiers.guides ?? 3) +
              (erpData?.serviceProviderTiers.safariOperators ?? 4) +
              (erpData?.serviceProviderTiers.driversAndFleet ?? 3) +
              (erpData?.serviceProviderTiers.hotelsAndCampsites ?? 3)}{' '}
            Active Units
          </div>
          <div className="font-mono text-[10px] text-[#226B3E]">
            Guides · Operators · Drivers · Hotels
          </div>
        </div>

        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">Gross Escrow Volume</div>
          <div className="font-serif text-base font-bold text-[#144225] mt-0.5">
            {formatPrice(erpData?.treasuryMetrics.grossEscrowVolumeUSD ?? 7960, currency)}
          </div>
          <div className="font-mono text-[10px] text-[#5A5248]">
            Ecobank &amp; FINCA Trust
          </div>
        </div>

        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">UWA Permit Escrow</div>
          <div className="font-serif text-base font-bold text-[#C85A28] mt-0.5">
            {formatPrice(erpData?.treasuryMetrics.uwaPermitTrustBalanceUSD ?? 2100, currency)}
          </div>
          <div className="font-mono text-[10px] text-[#5A5248]">
            {erpData?.uwaPermitAllocations.length ?? 2} Permit Quotas Locked
          </div>
        </div>

        <div className="bg-white border border-[#E4DCCF] rounded p-2.5">
          <div className="font-mono text-[10px] uppercase text-[#5A5248]">Portal Dispatches</div>
          <div className="font-serif text-base font-bold text-[#1A1612] mt-0.5">
            {erpData?.portalDispatches.length ?? 2} Active Orders
          </div>
          <div className="font-mono text-[10px] text-[#226B3E]">
            Entebbe Operations Desk
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="px-5 pt-3 border-b border-[#E4DCCF] bg-white flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'cms'
              ? 'border-[#226B3E] text-[#226B3E]'
              : 'border-transparent text-[#5A5248] hover:text-[#1A1612]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. CMS Engine (Editorial, 10-Slot Carousel &amp; Logos)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erp_providers')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'erp_providers'
              ? 'border-[#226B3E] text-[#226B3E]'
              : 'border-transparent text-[#5A5248] hover:text-[#1A1612]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. ERP Service Providers (Guides, Operators, Drivers &amp; Hotels)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erp_finance')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'erp_finance'
              ? 'border-[#226B3E] text-[#226B3E]'
              : 'border-transparent text-[#5A5248] hover:text-[#1A1612]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>3. ERP Treasury, UWA Permit Escrow &amp; Relworx Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erp_dispatch')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border-b-2 font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'erp_dispatch'
              ? 'border-[#226B3E] text-[#226B3E]'
              : 'border-transparent text-[#5A5248] hover:text-[#1A1612]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>4. ERP Multi-Portal Operational Dispatches</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mx-5 mt-4 px-3.5 py-2 rounded bg-[#226B3E]/10 border border-[#226B3E] text-[#144225] text-xs flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="font-mono text-[10px] underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* TAB 1: CMS ENGINE */}
      {activeTab === 'cms' && (
        <div className="p-5 space-y-6 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* CMS Site Content Blocks Editor */}
            <div className="lg:col-span-6 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#C85A28] font-bold">
                    POST /api/cms/site-blocks
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1612]">
                    CMS Editorial &amp; Standalone Content Blocks
                  </h3>
                </div>
                <FileText className="w-4 h-4 text-[#226B3E]" />
              </div>

              <form onSubmit={handleSaveCmsSiteBlock} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Block Key
                    </label>
                    <input
                      type="text"
                      required
                      value={blockKey}
                      onChange={(e) => setBlockKey(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Section Name
                    </label>
                    <input
                      type="text"
                      value={blockSection}
                      onChange={(e) => setBlockSection(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Headline / Frame Title
                  </label>
                  <input
                    type="text"
                    required
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={blockSubtitle}
                    onChange={(e) => setBlockSubtitle(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Body Copy
                  </label>
                  <textarea
                    rows={2}
                    value={blockBody}
                    onChange={(e) => setBlockBody(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white font-mono text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save CMS Content Block to Backend</span>
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-[#E4DCCF]">
                {(cmsData?.siteContentBlocks || []).map((block) => (
                  <div
                    key={block.id}
                    className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono text-[10px] text-[#226B3E] font-bold">
                        {block.key} · {block.section}
                      </div>
                      <div className="font-semibold text-[#1A1612]">{block.title}</div>
                      <div className="text-[11px] text-[#5A5248] line-clamp-2">{block.bodyText}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBlockKey(block.key);
                        setBlockSection(block.section);
                        setBlockTitle(block.title);
                        setBlockSubtitle(block.subtitle);
                        setBlockBody(block.bodyText);
                      }}
                      className="px-2 py-1 rounded bg-[#F3ECE1] hover:bg-[#E4DCCF] font-mono text-[10px] font-semibold text-[#1A1612] shrink-0 cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CMS 10-Slot Paid Carousel Governance & Standby Queue */}
            <div className="lg:col-span-6 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                    GET /api/cms/overview · Strict 10-Slot Cap
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1A1612]">
                    Paid-Tier Featured Carousel &amp; Slot 011 Standby Queue
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#226B3E] text-white font-mono text-[10px] font-bold">
                  10/10 Active + 1 Standby
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {(cmsData?.activeCarouselSlots || []).map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className="bg-white border border-[#E4DCCF] rounded px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#1A1612]">
                        {slot.menuLabel}
                      </div>
                      <div className="text-[11px] text-[#5A5248]">
                        {slot.title} · <span className="font-mono text-[#226B3E]">{slot.vendorName} ({slot.utbLicenseNumber})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-[#1A1612]">
                        {formatPrice(slot.priceUSD, currency)}
                      </div>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#226B3E]/15 text-[#226B3E] font-bold">
                        {slot.status}
                      </span>
                    </div>
                  </div>
                ))}

                {(cmsData?.standbyCarouselSlots || []).map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className="bg-[#FFFBEB] border border-[#D99B26] rounded px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#92400E]">
                        {slot.menuLabel} (Standby Rotation)
                      </div>
                      <div className="text-[11px] text-[#78350F]">
                        {slot.title} · {slot.vendorName}
                      </div>
                    </div>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#D99B26]/20 text-[#92400E] font-bold">
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ERP 4-TIER SERVICE PROVIDERS */}
      {activeTab === 'erp_providers' && (
        <div className="p-5 space-y-6 text-xs">
          {/* Tier A & Tier B: Guides & Safari Operators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                  Tier A · UTB/UWA Licensed Guides ({erpData?.guides.length ?? 3})
                </span>
                <Compass className="w-4 h-4 text-[#226B3E]" />
              </div>
              <div className="space-y-2">
                {(erpData?.guides || []).map((g) => (
                  <div
                    key={g.id}
                    className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#1A1612]">{g.name}</span>
                        <ServiceProviderVerifiedBadge
                          providerType="Guide"
                          utbLicense={g.utbLicenseNumber}
                          uwaAccreditation={g.uwaAccreditationId}
                          compact
                        />
                      </div>
                      <div className="text-[11px] text-[#5A5248] mt-0.5">
                        {g.usagaTier} · {g.homeRegion}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-[#1A1612]">
                        {formatPrice(g.dailyRateUSD, currency)}/day
                      </div>
                      <span className="text-[10px] text-[#226B3E] font-semibold">{g.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-[#C85A28] font-bold">
                  Tier B · Verified Safari Operators ({erpData?.safariOperators.length ?? 4})
                </span>
                <ShieldCheck className="w-4 h-4 text-[#C85A28]" />
              </div>
              <div className="space-y-2">
                {(erpData?.safariOperators || []).map((op) => (
                  <div
                    key={op.id}
                    className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#1A1612]">{op.name}</span>
                        <ServiceProviderVerifiedBadge
                          providerType="Safari Operator"
                          utbLicense={op.utbLicenseNumber}
                          uwaAccreditation={op.uwaAccreditationId}
                          compact
                        />
                      </div>
                      <div className="text-[11px] text-[#5A5248] mt-0.5">
                        {op.headquarters} · {op.verifiedStatus}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#226B3E] shrink-0">
                      ★ {op.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier C & Tier D: Drivers Fleet & Partner Hotel Rooms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tier C: Drivers & 4x4 Fleet */}
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                    Tier C · POST /api/erp/driver-fleet
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#1A1612]">
                    Drivers &amp; 4x4 Fleet Inventory ({erpData?.driverFleetVehicles.length ?? 3})
                  </h4>
                </div>
                <Car className="w-4 h-4 text-[#226B3E]" />
              </div>

              <form onSubmit={handleSaveErpVehicle} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={vehicleTitle}
                  onChange={(e) => setVehicleTitle(e.target.value)}
                  placeholder="Vehicle Title"
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                />
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver Name"
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                />
                <input
                  type="text"
                  required
                  value={registrationPlate}
                  onChange={(e) => setRegistrationPlate(e.target.value)}
                  placeholder="Plate (e.g. UBH 614T)"
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612] font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={50}
                    required
                    value={vehicleDailyRateUSD}
                    onChange={(e) => setVehicleDailyRateUSD(Number(e.target.value))}
                    placeholder="Daily USD"
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white font-mono text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    + Add Vehicle
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-1">
                {(erpData?.driverFleetVehicles || []).map((v) => (
                  <div
                    key={v.id}
                    className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#1A1612]">{v.title}</span>
                        <ServiceProviderVerifiedBadge
                          providerType="Driver"
                          utbLicense={v.utbDriverPermit}
                          uwaAccreditation={v.uwaParkVehiclePass}
                          compact
                        />
                      </div>
                      <div className="text-[11px] text-[#5A5248] mt-0.5">
                        {v.driverName} · Plate: <span className="font-mono font-bold">{v.registrationPlate}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-[#1A1612]">
                        {formatPrice(v.dailyRateUSD, currency)}/day
                      </div>
                      <span className="text-[10px] text-[#226B3E]">{v.availabilityStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier D: Partner Hotels, Motels & Campsites */}
            <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#C85A28] font-bold">
                    Tier D · POST /api/erp/hotel-rooms
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#1A1612]">
                    Hotels, Motels &amp; Campsites Inventory ({erpData?.partnerHotelRooms.length ?? 3})
                  </h4>
                </div>
                <Building2 className="w-4 h-4 text-[#C85A28]" />
              </div>

              <form onSubmit={handleSaveErpHotelRoom} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="Property Name"
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                />
                <input
                  type="text"
                  required
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="Room / Pitch Title"
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                />
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Motel">Motel</option>
                  <option value="Campsite">Campsite</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={20}
                    required
                    value={roomPriceUSD}
                    onChange={(e) => setRoomPriceUSD(Number(e.target.value))}
                    placeholder="Nightly USD"
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    + Add Room
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-1">
                {(erpData?.partnerHotelRooms || []).map((rm) => (
                  <div
                    key={rm.id}
                    className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#1A1612]">{rm.hotelName}</span>
                        <ServiceProviderVerifiedBadge
                          providerType="Hotel"
                          utbLicense={rm.utbLicenseNumber}
                          compact
                        />
                      </div>
                      <div className="text-[11px] text-[#5A5248] mt-0.5">
                        {rm.roomTitle} ({rm.category}) · {rm.boardBasis}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-[#1A1612]">
                        {formatPrice(rm.pricePerNightUSD, currency)}/night
                      </div>
                      <span className="text-[10px] text-[#226B3E]">{rm.availableUnits} units open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ERP TREASURY, UWA PERMIT ESCROW & RELWORX LEDGER */}
      {activeTab === 'erp_finance' && (
        <div className="p-5 space-y-6 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Post Finance Transaction Form */}
            <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                  POST /api/erp/finance/transactions
                </span>
                <h3 className="font-serif text-base font-bold text-[#1A1612]">
                  Record Relworx, Ecobank &amp; FINCA Escrow Settlement
                </h3>
              </div>

              <form onSubmit={handlePostFinanceLedger} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Booking Reference
                    </label>
                    <input
                      type="text"
                      required
                      value={ledgerRef}
                      onChange={(e) => setLedgerRef(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 font-mono text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Entry Type
                    </label>
                    <select
                      value={ledgerType}
                      onChange={(e) => setLedgerType(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                    >
                      <option value="ESCROW_DEPOSIT">ESCROW_DEPOSIT</option>
                      <option value="UWA_PERMIT_SETTLEMENT">UWA_PERMIT_SETTLEMENT</option>
                      <option value="VENDOR_DISBURSEMENT">VENDOR_DISBURSEMENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Settlement Channel
                  </label>
                  <select
                    value={ledgerChannel}
                    onChange={(e) => setLedgerChannel(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  >
                    <option value="Relworx Mobile Money -> Ecobank Escrow">
                      Relworx Mobile Money -&gt; Ecobank Escrow
                    </option>
                    <option value="FINCA Uganda UWA Permit Escrow Trust">
                      FINCA Uganda UWA Permit Escrow Trust
                    </option>
                    <option value="Ecobank Pan-African Multi-Currency Wire">
                      Ecobank Pan-African Multi-Currency Wire
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Amount (USD Base)
                    </label>
                    <input
                      type="number"
                      min={10}
                      required
                      value={ledgerAmountUSD}
                      onChange={(e) => setLedgerAmountUSD(Number(e.target.value))}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 font-mono text-[#1A1612]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Beneficiary Vendor
                    </label>
                    <input
                      type="text"
                      required
                      value={ledgerBeneficiary}
                      onChange={(e) => setLedgerBeneficiary(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#226B3E] hover:bg-[#194E2D] text-white font-mono text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Ledger Entry to ERP</span>
                </button>
              </form>
            </div>

            {/* Live Finance Ledger & UWA Permit Escrow Allocations */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-2.5">
                <div className="font-mono text-[10px] uppercase text-[#C85A28] font-bold">
                  UWA Permit Escrow Trust Allocations ({erpData?.uwaPermitAllocations.length ?? 2})
                </div>
                <div className="space-y-2">
                  {(erpData?.uwaPermitAllocations || []).map((p) => (
                    <div
                      key={p.permitId}
                      className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-[#1A1612]">
                          {p.permitId} · {p.permitType}
                        </div>
                        <div className="text-[11px] text-[#5A5248]">
                          {p.parkSector} · Trek Date: {p.trekDate} ({p.guests} guests)
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="font-bold text-[#226B3E]">
                          {formatPrice(p.totalEscrowUSD, currency)}
                        </div>
                        <span className="text-[10px] text-[#C85A28] font-bold">{p.uwaStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-2.5">
                <div className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                  ERP General Ledger Entries ({erpData?.financeLedger.length ?? 2})
                </div>
                <div className="space-y-2">
                  {(erpData?.financeLedger || []).map((tx) => (
                    <div
                      key={tx.transactionId}
                      className="bg-white border border-[#E4DCCF] rounded p-2.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-[#1A1612]">
                          {tx.transactionId} · Ref: {tx.reference}
                        </div>
                        <div className="text-[11px] text-[#5A5248]">
                          {tx.settlementChannel} · Beneficiary: {tx.beneficiaryVendor}
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="font-bold text-[#144225]">
                          {formatPrice(tx.amountUSD, currency)}
                        </div>
                        <span className="text-[10px] text-[#226B3E] font-semibold">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ERP MULTI-PORTAL DISPATCHES */}
      {activeTab === 'erp_dispatch' && (
        <div className="p-5 space-y-5 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#C85A28] font-bold">
                  POST /api/erp/dispatches
                </span>
                <h3 className="font-serif text-base font-bold text-[#1A1612]">
                  Create Entebbe Operations Desk Dispatch
                </h3>
              </div>

              <form onSubmit={handleCreateDispatch} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Target Portal
                    </label>
                    <select
                      value={dispatchPortal}
                      onChange={(e) => setDispatchPortal(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                    >
                      <option value="specialist">Specialist Guide Portal</option>
                      <option value="partner">Partner Hotel &amp; Lodge Portal</option>
                      <option value="staff">Entebbe Staff Desk Portal</option>
                      <option value="client">Client VIP Safari Portal</option>
                      <option value="admin">Admin Executive Portal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                      Priority
                    </label>
                    <select
                      value={dispatchPriority}
                      onChange={(e) => setDispatchPriority(e.target.value)}
                      className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                    >
                      <option value="HIGH">HIGH</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="URGENT_PERMIT">URGENT_PERMIT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Dispatch Title
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchTitle}
                    onChange={(e) => setDispatchTitle(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Assigned Service Provider / Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchAssignedTo}
                    onChange={(e) => setDispatchAssignedTo(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] font-semibold mb-1">
                    Operational Instruction
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={dispatchInstruction}
                    onChange={(e) => setDispatchInstruction(e.target.value)}
                    className="w-full bg-white border border-[#D6CEC2] rounded px-2.5 py-1.5 text-[#1A1612]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#C85A28] hover:bg-[#B04B1D] text-white font-mono text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Operational Dispatch</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg p-4 space-y-2.5">
              <div className="font-mono text-[10px] uppercase text-[#226B3E] font-bold">
                Active 5-Portal Operational Dispatches ({erpData?.portalDispatches.length ?? 2})
              </div>
              <div className="space-y-2.5">
                {(erpData?.portalDispatches || []).map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border border-[#E4DCCF] rounded p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#226B3E]/15 text-[#226B3E] font-bold">
                        {d.id} · Portal: {d.targetPortal.toUpperCase()} · {d.priority}
                      </span>
                      <span className="font-mono text-[10px] text-[#C85A28] font-semibold">
                        {d.status}
                      </span>
                    </div>
                    <div className="font-semibold text-[#1A1612]">{d.title}</div>
                    <div className="text-[11px] text-[#5A5248]">{d.instruction}</div>
                    <div className="font-mono text-[10px] text-[#226B3E]">
                      Assigned To: {d.assignedTo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
