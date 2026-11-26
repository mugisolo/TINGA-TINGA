import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  Languages,
  Calendar,
  ArrowRight,
  Building2,
  Tent,
  Compass,
  Hotel,
  Car,
  Star,
  MapPin,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Plus,
  Upload,
  Trash2,
  BedDouble,
  Users,
  Phone,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  GUIDES,
  SPECIALTY_LABELS,
  EXPERIENCES,
  PARTNER_ACCOMMODATIONS,
  TOUR_OPERATORS,
} from '../data/seedData';
import {
  Specialty,
  PartnerCategory,
  AccommodationPartner,
  PartnerHotelRoom,
  DriverFleetVehicle,
} from '../types';
import { useInquiry } from '../context/InquiryContext';
import { useWallet } from '../context/WalletContext';

export type ServiceProviderTier = 'all' | 'guides' | 'operators' | 'drivers' | 'hotels';

export interface RegionFilterOption {
  id: string;
  label: string;
  keywords: string[];
}

const REGION_FILTER_OPTIONS: RegionFilterOption[] = [
  { id: 'all', label: 'All Regions', keywords: [] },
  {
    id: 'bwindi-mgahinga',
    label: 'Bwindi & Mgahinga',
    keywords: ['bwindi', 'mgahinga', 'rushaga', 'buhoma', 'nkuringo', 'ruhija', 'kisoro', 'mutanda'],
  },
  {
    id: 'entebbe-kampala',
    label: 'Entebbe & Kampala',
    keywords: ['entebbe', 'kampala', 'mabamba', 'bugonga', 'ebb', 'victoria'],
  },
  {
    id: 'mbarara-igongo-mburo',
    label: 'Mbarara, Igongo & Lake Mburo',
    keywords: ['mbarara', 'igongo', 'mburo', 'ankole', 'biharwe', 'western'],
  },
  {
    id: 'kibale-queen-elizabeth',
    label: 'Kibale & Queen Elizabeth NP',
    keywords: ['kibale', 'queen elizabeth', 'ishasha', 'kazinga', 'fort portal', 'kasenyi', 'crater'],
  },
  {
    id: 'murchison-kidepo',
    label: 'Murchison Falls & Kidepo Valley',
    keywords: ['murchison', 'kidepo', 'ziwa', 'karamoja', 'para', 'pakuba', 'budongo', 'northern'],
  },
  {
    id: 'jinja-eastern',
    label: 'Jinja & Eastern Circuit',
    keywords: ['jinja', 'nile', 'sipi', 'elgon', 'eastern'],
  },
  {
    id: 'east-africa-cross-border',
    label: 'Cross-Border East Africa',
    keywords: ['tanzania', 'kenya', 'rwanda', 'serengeti', 'mara', 'volcanoes', 'arusha', 'kigali', 'nairobi'],
  },
];

const ALL_SPECIALTIES: (Specialty | 'all')[] = [
  'all',
  'gorillas',
  'chimps',
  'birding',
  'big-game',
  'culture',
  'hiking',
  'photography',
];

const PARTNER_CATEGORY_TABS: {
  id: PartnerCategory | 'all';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All Properties', icon: Compass },
  { id: 'hotel', label: 'Hotels', icon: Building2 },
  { id: 'motel', label: 'Motels', icon: Car },
  { id: 'lodge', label: 'Safari Lodges', icon: Hotel },
  { id: 'campsite', label: 'Camp Sites', icon: Tent },
];

const IGONGO_GALLERY_ITEMS = [
  {
    src: '/assets/aistudio/cow_b5a75acc.jpg',
    title: 'Ankole Long-Horned Cow & Eriijukiro Museum',
    caption: 'Iconic Ankole cattle monument welcoming guests at Igongo Cultural Centre in Biharwe, Mbarara.',
  },
  {
    src: '/assets/aistudio/cultural-village-e1720185580794_60f38fea.jpg',
    title: 'Itaramiro Cultural Village Homestead',
    caption: 'Visitors experiencing traditional Ankole milk gourds (Ekyanzi) inside the woven cultural hut.',
  },
  {
    src: '/assets/aistudio/monument-1_d59343db.jpg',
    title: '1520 AD Biharwe Eclipse Monument',
    caption: 'Historic hilltop monument overlooking Ankole ranchlands, commemorating the solar eclipse of 1520 AD.',
  },
  {
    src: '/assets/aistudio/museum-2-scaled_b13d5e4a.jpg',
    title: 'Eriijukiro — "The Power of Milk" Exhibition',
    caption: 'Inside the Museum of South Western Uganda celebrating Ankole, Kigezi, Tooro & Bunyoro heritage.',
  },
];

const FLEET_CATEGORIES: (DriverFleetVehicle['vehicleCategory'] | 'all')[] = [
  'all',
  '4x4 Extended Land Cruiser',
  '4x4 Land Cruiser Prado',
  '4x4 Pop-Up Safari Van',
  'Executive Group Coaster',
  'Luxury Overland Truck',
];

function parseInitialTier(searchParams: URLSearchParams): ServiceProviderTier {
  const raw = (searchParams.get('type') || searchParams.get('section') || '').toLowerCase();
  if (raw === 'guides' || raw === 'guide') return 'guides';
  if (raw === 'operators' || raw === 'safari-operators' || raw === 'operator') return 'operators';
  if (raw === 'drivers' || raw === 'drivers-cars' || raw === 'fleet' || raw === 'driver') return 'drivers';
  if (raw === 'hotels' || raw === 'partners' || raw === 'hotel') return 'hotels';
  if (raw === 'all') return 'all';
  return 'guides';
}

function matchesRegionKeywords(textPool: string, regionId: string): boolean {
  if (regionId === 'all') return true;
  const option = REGION_FILTER_OPTIONS.find((r) => r.id === regionId);
  if (!option || option.keywords.length === 0) return true;
  const lower = textPool.toLowerCase();
  return option.keywords.some((kw) => lower.includes(kw));
}

export const ServiceProvidersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Unified Search & Filtering State
  const [activeTier, setActiveTier] = useState<ServiceProviderTier>(() =>
    parseInitialTier(searchParams)
  );
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState<string>(
    () => searchParams.get('region') || 'all'
  );

  // Sub-filters per tier
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<PartnerCategory | 'all'>(
    'all'
  );
  const [selectedFleetCategory, setSelectedFleetCategory] = useState<
    DriverFleetVehicle['vehicleCategory'] | 'all'
  >('all');

  const {
    openInquiryModal,
    formatPrice,
    partnerHotelRooms,
    addPartnerHotelRoom,
    deletePartnerHotelRoom,
    driverFleetVehicles,
    addDriverFleetVehicle,
    deleteDriverFleetVehicle,
  } = useInquiry();
  const { availableBalanceUSD, payPackageDirect } = useWallet();

  useEffect(() => {
    const nextTier = parseInitialTier(searchParams);
    setActiveTier(nextTier);
    const regionParam = searchParams.get('region');
    if (regionParam) setSelectedRegion(regionParam);
    const qParam = searchParams.get('q');
    if (qParam !== null) setSearchQuery(qParam);
  }, [searchParams]);

  // Booking Modal State (supports Partner Property OR Specific Uploaded Room)
  const [bookingPartner, setBookingPartner] = useState<AccommodationPartner | null>(null);
  const [bookingSelectedRoom, setBookingSelectedRoom] = useState<PartnerHotelRoom | null>(null);
  const [checkInDate, setCheckInDate] = useState('2026-07-18');
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [bookingStatus, setBookingStatus] = useState<{
    ok: boolean;
    message: string;
    voucherCode?: string;
  } | null>(null);

  // Hotel & Motel Owner Room Upload State
  const [showRoomUploadForm, setShowRoomUploadForm] = useState(false);
  const [roomPartnerSelect, setRoomPartnerSelect] = useState<string>(
    'igongo-country-hotel-and-cultural-centre'
  );
  const [customHotelName, setCustomHotelName] = useState('');
  const [customHotelCategory, setCustomHotelCategory] = useState<'hotel' | 'motel'>('hotel');
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('Deluxe Double / Twin Room');
  const [ratePerNightUSD, setRatePerNightUSD] = useState<number>(145);
  const [boardBasis, setBoardBasis] = useState<PartnerHotelRoom['boardBasis']>('Bed & Breakfast');
  const [maxOccupancy, setMaxOccupancy] = useState<number>(2);
  const [bedConfiguration, setBedConfiguration] = useState('1 King Bed or 2 Twin Beds');
  const [totalRoomsAvailable, setTotalRoomsAvailable] = useState<number>(6);
  const [roomImageUrl, setRoomImageUrl] = useState('/assets/aistudio/cow_b5a75acc.jpg');
  const [roomAmenitiesText, setRoomAmenitiesText] = useState(
    'En-Suite Hot Shower, Private Veranda, High-Speed Wi-Fi, Complimentary Breakfast'
  );
  const [uploadedByOwnerName, setUploadedByOwnerName] = useState('');
  const [roomUploadFeedback, setRoomUploadFeedback] = useState<string | null>(null);

  // Drivers & Cars Fleet Upload State
  const [showFleetUploadForm, setShowFleetUploadForm] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverSlug, setDriverSlug] = useState('samuel-kato');
  const [driverLicenseAndBadge, setDriverLicenseAndBadge] = useState(
    'UTB Licensed Driver-Guide • USAGA Verified'
  );
  const [driverPhone, setDriverPhone] = useState('+256 772 000 000');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<DriverFleetVehicle['vehicleCategory']>(
    '4x4 Extended Land Cruiser'
  );
  const [registrationPlate, setRegistrationPlate] = useState('UBF ');
  const [passengerCapacity, setPassengerCapacity] = useState<number>(7);
  const [ratePerDayUSD, setRatePerDayUSD] = useState<number>(220);
  const [rateIncludes, setRateIncludes] = useState(
    'Verified Driver-Guide, Pop-Up Safari Roof, Fridge & Comprehensive Insurance (Excl. Fuel)'
  );
  const [homeBaseRegion, setHomeBaseRegion] = useState(
    'Entebbe, Mbarara (Igongo Hub) & Bwindi Western Circuit'
  );
  const [regionsCoveredText, setRegionsCoveredText] = useState(
    'Bwindi & Mgahinga, Lake Mburo & Igongo, Queen Elizabeth NP, Murchison Falls NP'
  );
  const [vehicleImageUrl, setVehicleImageUrl] = useState('/assets/aistudio/cow_b5a75acc.jpg');
  const [vehicleFeaturesText, setVehicleFeaturesText] = useState(
    'Pop-Up Photography Roof, 40L Safari Fridge, 220V Camera Inverter, Dual Fuel Tanks'
  );
  const [fleetUploadFeedback, setFleetUploadFeedback] = useState<string | null>(null);

  // Active Hire Driver & Car Modal State
  const [hiringVehicle, setHiringVehicle] = useState<DriverFleetVehicle | null>(null);
  const [hireStartDate, setHireStartDate] = useState('2026-08-10');
  const [hireDays, setHireDays] = useState<number>(5);
  const [hirePassengers, setHirePassengers] = useState<number>(2);
  const [hireStatus, setHireStatus] = useState<{
    ok: boolean;
    message: string;
    voucherCode?: string;
  } | null>(null);

  // Selected Igongo Spotlight Photo
  const [activeIgongoPhotoIndex, setActiveIgongoPhotoIndex] = useState(0);

  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    GUIDES.forEach((g) => g.languages.forEach((l) => set.add(l)));
    return Array.from(set);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // 1. Filtered Guides
  const filteredGuides = useMemo(() => {
    return GUIDES.filter((guide) => {
      const matchesSpecialty =
        selectedSpecialty === 'all' || guide.specialties.includes(selectedSpecialty);
      const matchesLanguage =
        selectedLanguage === 'all' || guide.languages.includes(selectedLanguage);

      const textPool = [
        guide.name,
        guide.tagline,
        guide.homeRegion,
        guide.bio,
        ...guide.languages,
        ...guide.certifications,
        ...guide.specialties.map((s) => SPECIALTY_LABELS[s]),
      ].join(' ');

      const matchesRegion = matchesRegionKeywords(textPool, selectedRegion);
      const matchesSearch =
        !normalizedQuery || textPool.toLowerCase().includes(normalizedQuery);

      return matchesSpecialty && matchesLanguage && matchesRegion && matchesSearch;
    });
  }, [selectedSpecialty, selectedLanguage, selectedRegion, normalizedQuery]);

  // 2. Filtered Safari Operators
  const filteredOperators = useMemo(() => {
    return TOUR_OPERATORS.filter((operator) => {
      const textPool = [
        operator.name,
        operator.shortName,
        operator.tagline,
        operator.roleLabel,
        operator.headquarters,
        operator.description,
        operator.utbLicenseNumber || '',
        operator.uwaAccreditationId || '',
        ...operator.countriesCovered,
        ...operator.specialties,
        ...operator.accreditations,
      ].join(' ');

      const matchesRegion = matchesRegionKeywords(textPool, selectedRegion);
      const matchesSearch =
        !normalizedQuery || textPool.toLowerCase().includes(normalizedQuery);

      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, normalizedQuery]);

  // 3. Filtered Drivers & Fleet Vehicles
  const filteredFleet = useMemo(() => {
    return driverFleetVehicles.filter((vehicle) => {
      const matchesCategory =
        selectedFleetCategory === 'all' || vehicle.vehicleCategory === selectedFleetCategory;

      const textPool = [
        vehicle.driverName,
        vehicle.driverLicenseAndBadge,
        vehicle.vehicleName,
        vehicle.vehicleCategory,
        vehicle.registrationPlate,
        vehicle.homeBaseRegion,
        vehicle.rateIncludes,
        ...vehicle.regionsCovered,
        ...vehicle.features,
      ].join(' ');

      const matchesRegion = matchesRegionKeywords(textPool, selectedRegion);
      const matchesSearch =
        !normalizedQuery || textPool.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [driverFleetVehicles, selectedFleetCategory, selectedRegion, normalizedQuery]);

  // 4. Filtered Hotels (Inclusive of Motels, Safari Lodges, and Camp Sites)
  const filteredPartners = useMemo(() => {
    return PARTNER_ACCOMMODATIONS.filter((partner) => {
      const matchesCategory =
        selectedPartnerCategory === 'all' || partner.category === selectedPartnerCategory;

      const textPool = [
        partner.name,
        partner.categoryLabel,
        partner.region,
        partner.locationDetails,
        partner.summary,
        partner.sustainabilityNote,
        partner.verifiedPartnerBadge,
        partner.utbLicenseNumber || '',
        partner.uwaAccreditationId || '',
        ...partner.amenities,
        ...(partner.officialPartnerHighlights || []),
      ].join(' ');

      const matchesRegion = matchesRegionKeywords(textPool, selectedRegion);
      const matchesSearch =
        !normalizedQuery || textPool.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [selectedPartnerCategory, selectedRegion, normalizedQuery]);

  // Filtered Uploaded Partner Rooms
  const filteredPartnerRooms = useMemo(() => {
    return partnerHotelRooms.filter((room) => {
      const matchesCategory =
        selectedPartnerCategory === 'all' || room.partnerCategory === selectedPartnerCategory;

      const textPool = [
        room.partnerName,
        room.roomName,
        room.roomType,
        room.boardBasis,
        room.bedConfiguration,
        ...room.amenities,
      ].join(' ');

      const matchesRegion = matchesRegionKeywords(textPool, selectedRegion);
      const matchesSearch =
        !normalizedQuery || textPool.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [partnerHotelRooms, selectedPartnerCategory, selectedRegion, normalizedQuery]);

  const igongoPartner = useMemo(
    () =>
      PARTNER_ACCOMMODATIONS.find(
        (p) => p.slug === 'igongo-country-hotel-and-cultural-centre'
      ) || PARTNER_ACCOMMODATIONS[0],
    []
  );

  const switchTier = (tier: ServiceProviderTier) => {
    setActiveTier(tier);
    const nextParams: Record<string, string> = { type: tier, section: tier };
    if (selectedRegion !== 'all') nextParams.region = selectedRegion;
    if (searchQuery.trim()) nextParams.q = searchQuery.trim();
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedSpecialty('all');
    setSelectedLanguage('all');
    setSelectedPartnerCategory('all');
    setSelectedFleetCategory('all');
    setSearchParams({ type: activeTier, section: activeTier });
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedRegion !== 'all' ||
    selectedSpecialty !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedPartnerCategory !== 'all' ||
    selectedFleetCategory !== 'all';

  const handleRoomPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRoomImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVehiclePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setVehicleImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePartnerRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    let targetSlug = roomPartnerSelect;
    let targetName = 'Igongo Country Hotel & Cultural Centre';
    let targetCat: PartnerCategory = 'hotel';

    if (roomPartnerSelect === 'custom_property') {
      targetName = customHotelName.trim() || 'Partner Hotel & Motel';
      targetSlug = targetName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      targetCat = customHotelCategory;
    } else {
      const found = PARTNER_ACCOMMODATIONS.find((p) => p.slug === roomPartnerSelect);
      if (found) {
        targetSlug = found.slug;
        targetName = found.name;
        targetCat = found.category;
      }
    }

    const amenities = roomAmenitiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = await addPartnerHotelRoom({
      partnerSlug: targetSlug,
      partnerName: targetName,
      partnerCategory: targetCat,
      roomName: roomName.trim(),
      roomType: roomType.trim() || 'Deluxe Double Room',
      ratePerNightUSD: Math.max(15, Number(ratePerNightUSD) || 120),
      boardBasis,
      maxOccupancy: Math.max(1, Number(maxOccupancy) || 2),
      bedConfiguration: bedConfiguration.trim() || '1 King or 2 Twin Beds',
      totalRoomsAvailable: Math.max(1, Number(totalRoomsAvailable) || 4),
      imageUrl: roomImageUrl.trim() || '/assets/aistudio/cow_b5a75acc.jpg',
      amenities: amenities.length > 0 ? amenities : ['En-Suite Bathroom', 'Breakfast Included'],
      uploadedByOwnerName: uploadedByOwnerName.trim() || `${targetName} Owner Desk`,
    });

    setRoomName('');
    setRoomUploadFeedback(
      `Published "${created.roomName}" ($${created.ratePerNightUSD}/night) under ${created.partnerName}. Saved to live Firestore database.`
    );
  };

  const handleCreateDriverFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !vehicleName.trim()) return;

    const matchedGuide = GUIDES.find(
      (g) =>
        g.slug === driverSlug ||
        g.name.toLowerCase() === driverName.trim().toLowerCase()
    );

    const regionsCovered = regionsCoveredText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const features = vehicleFeaturesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = await addDriverFleetVehicle({
      driverName: driverName.trim(),
      driverSlug: matchedGuide?.slug,
      driverLicenseAndBadge:
        driverLicenseAndBadge.trim() || 'UTB Licensed Safari Driver-Guide',
      driverPhone: driverPhone.trim() || '+256 772 000 000',
      driverPhotoUrl: matchedGuide?.photo || '/assets/aistudio/cow_b5a75acc.jpg',
      vehicleName: vehicleName.trim(),
      vehicleCategory,
      registrationPlate: registrationPlate.trim() || 'UBF 880Q',
      passengerCapacity: Math.max(1, Number(passengerCapacity) || 7),
      ratePerDayUSD: Math.max(40, Number(ratePerDayUSD) || 200),
      rateIncludes:
        rateIncludes.trim() ||
        'Verified Driver-Guide, Pop-Up Safari Roof & Comprehensive Insurance',
      homeBaseRegion: homeBaseRegion.trim() || 'Entebbe & Western Safari Circuit',
      regionsCovered:
        regionsCovered.length > 0
          ? regionsCovered
          : ['Bwindi & Mgahinga', 'Igongo & Lake Mburo', 'Queen Elizabeth NP'],
      vehicleImageUrl: vehicleImageUrl.trim() || '/assets/aistudio/cow_b5a75acc.jpg',
      features:
        features.length > 0
          ? features
          : ['4x4 High/Low Range', 'Pop-Up Roof', 'Safari Fridge'],
      availableStatus: 'Available Now',
    });

    setVehicleName('');
    setFleetUploadFeedback(
      `Uploaded ${created.vehicleName} (${created.registrationPlate}) by Driver ${created.driverName} at $${created.ratePerDayUSD}/day to live Firestore database.`
    );
  };

  const activeBookingNightlyRate = bookingSelectedRoom
    ? bookingSelectedRoom.ratePerNightUSD
    : bookingPartner?.pricePerNightUSD || 140;

  const handleWalletBookPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPartner) return;
    const labelName = bookingSelectedRoom
      ? `${bookingPartner.name} — ${bookingSelectedRoom.roomName} (${nights} Nights)`
      : `${bookingPartner.name} (${nights} Nights)`;
    const res = payPackageDirect({
      packageTitle: labelName,
      packageIdOrSlug: bookingSelectedRoom?.id || bookingPartner.slug,
      perPersonUSD: activeBookingNightlyRate * nights,
      guests: 1,
      paymentType: 'full_100',
      departureDate: checkInDate,
      autoTopUpIfShort: true,
    });
    setBookingStatus({
      ok: res.ok,
      message: res.message,
      voucherCode: res.transaction?.referenceCode,
    });
  };

  const handleWalletHireDriverVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiringVehicle) return;
    const res = payPackageDirect({
      packageTitle: `4x4 Fleet Charter: ${hiringVehicle.vehicleName} (${hireDays} Days • Driver: ${hiringVehicle.driverName})`,
      packageIdOrSlug: hiringVehicle.id,
      perPersonUSD: hiringVehicle.ratePerDayUSD * hireDays,
      guests: 1,
      paymentType: 'full_100',
      departureDate: hireStartDate,
      guideName: hiringVehicle.driverName,
      autoTopUpIfShort: true,
    });
    setHireStatus({
      ok: res.ok,
      message: res.message,
      voucherCode: res.transaction?.referenceCode,
    });
  };

  const showGuidesTier = activeTier === 'all' || activeTier === 'guides';
  const showOperatorsTier = activeTier === 'all' || activeTier === 'operators';
  const showDriversTier = activeTier === 'all' || activeTier === 'drivers';
  const showHotelsTier = activeTier === 'all' || activeTier === 'hotels';

  const totalMatchingCount =
    (showGuidesTier ? filteredGuides.length : 0) +
    (showOperatorsTier ? filteredOperators.length : 0) +
    (showDriversTier ? filteredFleet.length : 0) +
    (showHotelsTier ? filteredPartners.length : 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Page Hero & Tiered Service Provider Switcher */}
      <section className="bg-stone-900 text-white py-14 md:py-16 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>UTB &amp; UWA Verified Multi-Vendor Directory</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                Service Providers
              </h1>
              <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
                Search and filter across our verified East African service providers — connecting
                you directly with licensed specialist guides, accredited safari operators, known
                4x4 fleet drivers, and partner hotels.
              </p>
            </div>

            {/* Tiered Provider Type Tabs: All, Guides, Safari Operators, Drivers, Hotels */}
            <div className="flex flex-wrap bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700 self-start gap-1">
              <button
                type="button"
                onClick={() => switchTier('all')}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTier === 'all'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>All Providers</span>
              </button>
              <button
                type="button"
                onClick={() => switchTier('guides')}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTier === 'guides'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Guides ({filteredGuides.length})</span>
              </button>
              <button
                type="button"
                onClick={() => switchTier('operators')}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTier === 'operators'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Safari Operators ({filteredOperators.length})</span>
              </button>
              <button
                type="button"
                onClick={() => switchTier('drivers')}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTier === 'drivers'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Drivers ({filteredFleet.length})</span>
              </button>
              <button
                type="button"
                onClick={() => switchTier('hotels')}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTier === 'hotels'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hotels ({filteredPartners.length})</span>
              </button>
            </div>
          </div>

          {/* Unified Search & Regional Filtering Console */}
          <div className="bg-stone-800/80 backdrop-blur-md border border-stone-700 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Keyword Search Input */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides, safari operators, 4x4 drivers, hotels, UTB licenses or regions..."
                  aria-label="Search service providers"
                  className="w-full bg-stone-900/90 border border-stone-600 focus:border-amber-500 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Provider Type Dropdown Filter */}
              <div className="md:col-span-3">
                <select
                  value={activeTier}
                  onChange={(e) => switchTier(e.target.value as ServiceProviderTier)}
                  aria-label="Filter by provider type"
                  className="w-full bg-stone-900/90 border border-stone-600 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none"
                >
                  <option value="all">Provider Type: All Providers</option>
                  <option value="guides">Provider Type: Guides</option>
                  <option value="operators">Provider Type: Safari Operators</option>
                  <option value="drivers">Provider Type: Drivers</option>
                  <option value="hotels">Provider Type: Hotels</option>
                </select>
              </div>

              {/* Region Dropdown Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Filter by region"
                  className="w-full bg-stone-900/90 border border-stone-600 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none"
                >
                  {REGION_FILTER_OPTIONS.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      Region: {reg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Regional Filter Pills & Active Result Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-700/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 shrink-0 mr-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Regions:
                </span>
                {REGION_FILTER_OPTIONS.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedRegion === reg.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-900/70 text-stone-300 hover:bg-stone-700 border border-stone-700'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-mono text-stone-300">
                  Showing <strong className="text-amber-400">{totalMatchingCount}</strong> verified
                  providers
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TIER 1: GUIDES                                                      */}
      {/* =================================================================== */}
      {showGuidesTier && (
        <section className="border-b border-stone-200/80">
          {/* Guides Sub-Filter Bar */}
          <div className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 mr-1 shrink-0">
                  Guides ({filteredGuides.length}):
                </span>
                {ALL_SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSpecialty === spec
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                    }`}
                  >
                    {spec === 'all' ? 'All Specialties' : SPECIALTY_LABELS[spec]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                  <Languages className="w-4 h-4 text-amber-700" />
                  <span>Language:</span>
                </div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-amber-600"
                >
                  <option value="all">All Languages</option>
                  {allLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {filteredGuides.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
                <p className="text-stone-600 mb-4">
                  No specialist guides match your current search, region, or language filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredGuides.map((guide) => {
                  const signatureExp = EXPERIENCES.find((e) =>
                    e.recommendedGuides.includes(guide.slug)
                  );
                  return (
                    <div
                      key={guide.id}
                      className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12">
                        <div className="sm:col-span-5 relative min-h-[280px] bg-stone-900">
                          <img
                            src={guide.photo}
                            alt={guide.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent sm:hidden" />
                          <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            {guide.yearsExperience} Years Field Exp.
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md text-stone-900 text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-sm">
                            Home Region: <span className="text-amber-800">{guide.homeRegion}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                {guide.tagline}
                              </span>
                            </div>
                            <Link
                              to={`/guides/${guide.slug}`}
                              className="group inline-block mb-3"
                            >
                              <h2 className="font-serif text-2xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                                {guide.name}
                              </h2>
                            </Link>

                            <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
                              {guide.bio}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {guide.specialties.map((spec) => (
                                <span
                                  key={spec}
                                  className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/70 px-2.5 py-1 rounded-md"
                                >
                                  {SPECIALTY_LABELS[spec]}
                                </span>
                              ))}
                            </div>

                            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3 mb-4">
                              <div className="flex items-center gap-2">
                                <Languages className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span>
                                  <strong className="text-stone-800">Languages:</strong>{' '}
                                  {guide.languages.join(', ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-emerald-800 font-medium">
                                  {guide.certifications.slice(0, 2).join(' · ')}
                                </span>
                              </div>
                            </div>

                            {signatureExp && (
                              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 mb-5">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                  Signature Route
                                </div>
                                <Link
                                  to={`/experiences/${signatureExp.slug}`}
                                  className="text-xs font-bold text-stone-800 hover:text-amber-700 flex items-center justify-between mt-0.5"
                                >
                                  <span>{signatureExp.title}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <Link
                              to={`/guides/${guide.slug}`}
                              className="flex-1 text-center py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-900 text-xs font-bold text-stone-900 transition-colors"
                            >
                              Full Specialist Profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => openInquiryModal({ guideSlug: guide.slug })}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Book with {guide.name.split(' ')[0]}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TIER 2: SAFARI OPERATORS                                            */}
      {/* =================================================================== */}
      {showOperatorsTier && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 border-b border-stone-200/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                UTB &amp; UWA Verified Safari Operators ({filteredOperators.length})
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                Safari Operators
              </h2>
              <p className="text-sm text-stone-600 mt-1 max-w-3xl">
                Official East African safari operators verified by the Uganda Tourism Board and
                Uganda Wildlife Authority, with direct UWA permit escrow and Safari Wallet checkout.
              </p>
            </div>
            <Link
              to="/tingatinga-safaris"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tingatinga Safaris Showcase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredOperators.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <p className="text-stone-600 mb-4">
                No safari operators match your current search or regional filter.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredOperators.map((operator) => {
                const operatorPackages = EXPERIENCES.filter((exp) =>
                  operator.featuredExperienceSlugs.includes(exp.slug)
                );
                return (
                  <div
                    key={operator.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 bg-stone-900 overflow-hidden">
                        <img
                          src={operator.heroImage}
                          alt={operator.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent" />
                        {operator.logoUrl && (
                          <div className="absolute top-3 left-3 bg-stone-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40">
                            <img
                              src={operator.logoUrl}
                              alt={operator.name}
                              className="h-9 w-auto object-contain"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>{operator.utbLicenseNumber || 'UTB Verified'}</span>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <div className="text-[11px] font-mono text-amber-300 uppercase tracking-wider">
                            {operator.roleLabel}
                          </div>
                          <h3 className="font-serif text-2xl font-bold leading-snug">
                            {operator.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {operator.accreditations.map((acc) => (
                            <span
                              key={acc}
                              className="text-[11px] font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-stone-600 leading-relaxed">
                          {operator.description}
                        </p>

                        <div className="text-xs text-stone-600 space-y-1 border-t border-stone-100 pt-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>
                              <strong className="text-stone-900">Headquarters:</strong>{' '}
                              {operator.headquarters}
                            </span>
                          </div>
                          <div>
                            <strong className="text-stone-900">Destinations:</strong>{' '}
                            {operator.countriesCovered.join(' · ')}
                          </div>
                        </div>

                        {operatorPackages.length > 0 && (
                          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                              Featured Safari Packages ({operatorPackages.length})
                            </div>
                            <div className="space-y-1.5">
                              {operatorPackages.slice(0, 3).map((pkg) => (
                                <Link
                                  key={pkg.id}
                                  to={`/experiences/${pkg.slug}`}
                                  className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-800 hover:text-amber-700"
                                >
                                  <span className="truncate">{pkg.title}</span>
                                  <span className="font-mono text-amber-800 shrink-0">
                                    {formatPrice(pkg.priceBands[0]?.perPersonUSD || 2500)}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex items-center gap-3">
                      {operator.slug === 'tingatinga-safaris' ? (
                        <Link
                          to="/tingatinga-safaris"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold text-center transition-colors"
                        >
                          Open Tingatinga Showcase
                        </Link>
                      ) : (
                        <Link
                          to="/experiences"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-xs font-bold text-center transition-colors"
                        >
                          View Operator Packages
                        </Link>
                      )}
                      <Link
                        to="/trip-planner"
                        className="py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-900 text-xs font-bold transition-colors"
                      >
                        Plan Safari
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TIER 3: DRIVERS                                                     */}
      {/* =================================================================== */}
      {showDriversTier && (
        <section className="border-b border-stone-200/80">
          <div className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 mr-1 shrink-0">
                  Drivers ({filteredFleet.length}):
                </span>
                {FLEET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFleetCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedFleetCategory === cat
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                    }`}
                  >
                    {cat === 'all' ? 'All Safari Vehicles' : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFleetUploadForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showFleetUploadForm
                    ? 'Hide Driver Fleet Uploader'
                    : 'Known Driver: Upload Fleet & Daily Rate'}
                </button>
                <Link
                  to="/wallet"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900 text-emerald-100 hover:bg-emerald-800 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  Wallet: {formatPrice(availableBalanceUSD)}
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {showFleetUploadForm && (
              <div className="bg-white rounded-3xl border-2 border-amber-500/80 shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Enganda Verified Drivers &amp; 4x4 Transport Roster
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      Known Driver: Upload Your Safari Vehicle &amp; Daily Rate
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Verified Enganda driver-guides and fleet owners can upload their 4x4 Land
                      Cruisers, Prados, Safari Vans, or Coasters with transparent daily rates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFleetUploadForm(false)}
                    className="self-start text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 cursor-pointer"
                  >
                    Close Form
                  </button>
                </div>

                {fleetUploadFeedback && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{fleetUploadFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFleetUploadFeedback(null)}
                      className="text-xs font-bold text-emerald-800 underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <form onSubmit={handleCreateDriverFleet} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Known Driver Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Kato or Patrick Bwambale"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Link to Enganda Guide Profile
                      </label>
                      <select
                        value={driverSlug}
                        onChange={(e) => {
                          setDriverSlug(e.target.value);
                          const g = GUIDES.find((item) => item.slug === e.target.value);
                          if (g && !driverName) setDriverName(g.name);
                        }}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-white"
                      >
                        <option value="">Independent Known Enganda Driver</option>
                        {GUIDES.map((g) => (
                          <option key={g.slug} value={g.slug}>
                            {g.name} ({g.homeRegion})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        UTB / USAGA License &amp; Badge *
                      </label>
                      <input
                        type="text"
                        required
                        value={driverLicenseAndBadge}
                        onChange={(e) => setDriverLicenseAndBadge(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Driver Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Safari Vehicle Make &amp; Model *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toyota Land Cruiser 78 Extended 4x4 (Pop-Up Roof)"
                        value={vehicleName}
                        onChange={(e) => setVehicleName(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Vehicle Category
                      </label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) =>
                          setVehicleCategory(
                            e.target.value as DriverFleetVehicle['vehicleCategory']
                          )
                        }
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-white"
                      >
                        <option value="4x4 Extended Land Cruiser">4x4 Extended Land Cruiser</option>
                        <option value="4x4 Land Cruiser Prado">4x4 Land Cruiser Prado</option>
                        <option value="4x4 Pop-Up Safari Van">4x4 Pop-Up Safari Van</option>
                        <option value="Executive Group Coaster">Executive Group Coaster</option>
                        <option value="Luxury Overland Truck">Luxury Overland Truck</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Daily Hire Rate (USD / Day) *
                      </label>
                      <input
                        type="number"
                        min={40}
                        max={5000}
                        required
                        value={ratePerDayUSD}
                        onChange={(e) => setRatePerDayUSD(Number(e.target.value) || 220)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Registration Plate *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationPlate}
                        onChange={(e) => setRegistrationPlate(e.target.value)}
                        placeholder="UBF 842Q"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Max Passenger Seats
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={passengerCapacity}
                        onChange={(e) => setPassengerCapacity(Number(e.target.value) || 7)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Home Base &amp; Operating Corridor
                      </label>
                      <input
                        type="text"
                        value={homeBaseRegion}
                        onChange={(e) => setHomeBaseRegion(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Upload Vehicle Photo (File or URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-700" />
                          Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleVehiclePhotoFileChange}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          value={vehicleImageUrl}
                          onChange={(e) => setVehicleImageUrl(e.target.value)}
                          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Rate Includes
                      </label>
                      <input
                        type="text"
                        value={rateIncludes}
                        onChange={(e) => setRateIncludes(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        4x4 Safari Features (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={vehicleFeaturesText}
                        onChange={(e) => setVehicleFeaturesText(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Car className="w-4 h-4" />
                      Publish Vehicle &amp; Daily Rate to Fleet Roster
                    </button>
                  </div>
                </form>
              </div>
            )}

            {filteredFleet.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
                <p className="text-stone-600 mb-4">
                  No drivers or 4x4 fleet vehicles match your current search or regional filter.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredFleet.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-60 bg-stone-900 overflow-hidden">
                        <img
                          src={vehicle.vehicleImageUrl}
                          alt={vehicle.vehicleName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                          <span className="bg-stone-900/90 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                            {vehicle.vehicleCategory}
                          </span>
                          <span className="bg-emerald-950/90 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                            {vehicle.availableStatus}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 bg-white/95 text-stone-900 text-xs font-mono font-bold px-3 py-1 rounded-lg shadow">
                          {vehicle.registrationPlate}
                        </div>

                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                          <div className="pr-3">
                            <div className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {vehicle.homeBaseRegion}
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                              {vehicle.vehicleName}
                            </h3>
                          </div>
                          <div className="text-right bg-stone-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
                            <div className="text-[10px] uppercase tracking-wider text-stone-300">
                              Daily Rate
                            </div>
                            <div className="text-base font-bold text-amber-300 tabular-nums">
                              {formatPrice(vehicle.ratePerDayUSD)}
                              <span className="text-xs font-normal text-stone-300">/day</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-amber-900 text-amber-200 font-serif font-bold text-lg flex items-center justify-center shrink-0">
                              {vehicle.driverName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-stone-900 truncate">
                                  {vehicle.driverName}
                                </span>
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              </div>
                              <div className="text-xs text-stone-500 truncate">
                                {vehicle.driverLicenseAndBadge}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-semibold text-stone-700 flex items-center gap-1 justify-end">
                              <Users className="w-3.5 h-3.5 text-amber-700" />
                              Up to {vehicle.passengerCapacity} Seats
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1 justify-end mt-0.5">
                              <Phone className="w-3 h-3" />
                              {vehicle.driverPhone}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-stone-600 leading-relaxed">
                          <strong className="text-stone-900">Rate Includes:</strong>{' '}
                          {vehicle.rateIncludes}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {vehicle.features.map((feat) => (
                            <span
                              key={feat}
                              className="text-[11px] font-medium bg-amber-50 text-amber-950 border border-amber-200/60 px-2.5 py-1 rounded-md"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>

                        {vehicle.regionsCovered.length > 0 && (
                          <div className="text-xs text-stone-500 border-t border-stone-100 pt-3">
                            <strong className="text-stone-700">Operating Circuits:</strong>{' '}
                            {vehicle.regionsCovered.join(' · ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHiringVehicle(vehicle);
                          setHireStatus(null);
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Hire Driver &amp; 4x4 ({formatPrice(vehicle.ratePerDayUSD)}/day)
                      </button>
                      {vehicle.driverSlug && (
                        <Link
                          to={`/guides/${vehicle.driverSlug}`}
                          className="py-2.5 px-3.5 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-bold transition-colors"
                        >
                          Driver Bio
                        </Link>
                      )}
                      {vehicle.id.startsWith('fleet_custom_') && (
                        <button
                          type="button"
                          onClick={() => deleteDriverFleetVehicle(vehicle.id)}
                          className="p-2.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="Remove custom vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TIER 4: HOTELS                                                      */}
      {/* =================================================================== */}
      {showHotelsTier && (
        <section>
          {/* Hotels Sub-Category Filter Bar */}
          <div className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 mr-1 shrink-0">
                  Hotels ({filteredPartners.length}):
                </span>
                {PARTNER_CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedPartnerCategory(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedPartnerCategory === tab.id
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRoomUploadForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showRoomUploadForm
                    ? 'Hide Owner Room Uploader'
                    : 'Hotel & Motel Owner: Upload Room & Rate'}
                </button>
                <Link
                  to="/wallet"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900 text-emerald-100 hover:bg-emerald-800 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  Wallet: {formatPrice(availableBalanceUSD)}
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            {/* HOTEL & MOTEL OWNER ROOM & RATE UPLOAD PORTAL */}
            {showRoomUploadForm && (
              <div className="bg-white rounded-3xl border-2 border-amber-500/80 shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Partner Hotel &amp; Motel Owner Inventory Desk
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      Upload Hotel or Motel Room &amp; Nightly Rate Per Room
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Property owners and reservations managers can upload room categories and exact
                      nightly rates per room directly to the live Firestore booking catalog.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoomUploadForm(false)}
                    className="self-start text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 cursor-pointer"
                  >
                    Close Form
                  </button>
                </div>

                {roomUploadFeedback && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{roomUploadFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoomUploadFeedback(null)}
                      className="text-xs font-bold text-emerald-800 underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <form onSubmit={handleCreatePartnerRoom} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Select Partner Hotel or Motel
                      </label>
                      <select
                        value={roomPartnerSelect}
                        onChange={(e) => setRoomPartnerSelect(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-900 bg-white"
                      >
                        {PARTNER_ACCOMMODATIONS.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name} ({p.categoryLabel})
                          </option>
                        ))}
                        <option value="custom_property">
                          + Add New / Custom Partner Hotel or Motel
                        </option>
                      </select>
                    </div>

                    {roomPartnerSelect === 'custom_property' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            Custom Hotel / Motel Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mbarara Agip Transit Motel"
                            value={customHotelName}
                            onChange={(e) => setCustomHotelName(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            Property Category
                          </label>
                          <select
                            value={customHotelCategory}
                            onChange={(e) =>
                              setCustomHotelCategory(e.target.value as 'hotel' | 'motel')
                            }
                            className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                          >
                            <option value="hotel">Hotel</option>
                            <option value="motel">Motel</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            Room Title / Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Eriijukiro Deluxe Garden Twin"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            Rate Per Room / Night (USD) *
                          </label>
                          <input
                            type="number"
                            min={15}
                            max={10000}
                            required
                            value={ratePerNightUSD}
                            onChange={(e) => setRatePerNightUSD(Number(e.target.value) || 120)}
                            className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-900"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {roomPartnerSelect === 'custom_property' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Room Title / Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Executive Highway Courtyard Double"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Rate Per Room / Night (USD) *
                        </label>
                        <input
                          type="number"
                          min={15}
                          max={10000}
                          required
                          value={ratePerNightUSD}
                          onChange={(e) => setRatePerNightUSD(Number(e.target.value) || 95)}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-900"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Room Category / Type
                      </label>
                      <input
                        type="text"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        placeholder="Deluxe Double / Suite"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Meal / Board Basis
                      </label>
                      <select
                        value={boardBasis}
                        onChange={(e) =>
                          setBoardBasis(e.target.value as PartnerHotelRoom['boardBasis'])
                        }
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-white"
                      >
                        <option value="Bed & Breakfast">Bed &amp; Breakfast</option>
                        <option value="Half Board">Half Board</option>
                        <option value="Full Board">Full Board</option>
                        <option value="Room Only">Room Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Bed Configuration
                      </label>
                      <input
                        type="text"
                        value={bedConfiguration}
                        onChange={(e) => setBedConfiguration(e.target.value)}
                        placeholder="1 King or 2 Twin Beds"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Max Guests
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={maxOccupancy}
                          onChange={(e) => setMaxOccupancy(Number(e.target.value) || 2)}
                          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Rooms Open
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={totalRoomsAvailable}
                          onChange={(e) => setTotalRoomsAvailable(Number(e.target.value) || 5)}
                          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Upload Room Photo (File or URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-700" />
                          Choose Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRoomPhotoFileChange}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          value={roomImageUrl}
                          onChange={(e) => setRoomImageUrl(e.target.value)}
                          placeholder="/assets/aistudio/cow_b5a75acc.jpg"
                          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Room Amenities (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={roomAmenitiesText}
                        onChange={(e) => setRoomAmenitiesText(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Uploaded By (Owner / Manager Name)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Igongo Reservations Manager"
                        value={uploadedByOwnerName}
                        onChange={(e) => setUploadedByOwnerName(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <BedDouble className="w-4 h-4" />
                      Publish Room &amp; Nightly Rate
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* OFFICIAL PARTNER SPOTLIGHT: IGONGO COUNTRY HOTEL & CULTURAL CENTRE */}
            {(selectedPartnerCategory === 'all' || selectedPartnerCategory === 'hotel') &&
              matchesRegionKeywords(
                'Igongo Country Hotel Cultural Centre Mbarara Ankole Western Circuit Biharwe',
                selectedRegion
              ) && (
                <div className="bg-white rounded-3xl overflow-hidden border-2 border-amber-500/70 shadow-lg">
                  <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white px-6 sm:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800">
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-2xl px-3.5 py-2 shadow-sm shrink-0">
                        <img
                          src="/assets/aistudio/logo_igongo_8f5928e8.png"
                          alt="Igongo Country Hotel & Cultural Centre"
                          className="h-10 sm:h-12 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Official Flagship Partner of Enganda Safaris</span>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                          Igongo Country Hotel &amp; Cultural Centre — Mbarara
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="https://igongo.co.ug/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors"
                      >
                        <span>Visit igongo.co.ug</span>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingPartner(igongoPartner);
                          const rooms = partnerHotelRooms.filter(
                            (r) => r.partnerSlug === igongoPartner.slug
                          );
                          setBookingSelectedRoom(rooms[0] || null);
                          setBookingStatus(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Book Igongo Room via Safari Wallet</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-3">
                      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-900 border border-stone-200">
                        <img
                          src={IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].src}
                          alt={IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].title}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            {IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].title}
                          </div>
                          <p className="text-xs sm:text-sm text-stone-200 mt-0.5">
                            {IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].caption}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        {IGONGO_GALLERY_ITEMS.map((item, idx) => (
                          <button
                            key={item.src}
                            type="button"
                            onClick={() => setActiveIgongoPhotoIndex(idx)}
                            className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              activeIgongoPhotoIndex === idx
                                ? 'border-amber-600 ring-2 ring-amber-500/40'
                                : 'border-transparent opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={item.src}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-5">
                      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-amber-700" />
                        <span>Western Safari Corridor Hub • Biharwe, Mbarara</span>
                      </div>

                      <p className="text-sm text-stone-600 leading-relaxed">
                        {igongoPartner.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                            Live Igongo Rooms &amp; Nightly Rates
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setRoomPartnerSelect(igongoPartner.slug);
                              setShowRoomUploadForm(true);
                            }}
                            className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                          >
                            + Add Igongo Room
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {partnerHotelRooms
                            .filter((rm) => rm.partnerSlug === igongoPartner.slug)
                            .map((rm) => (
                              <div
                                key={rm.id}
                                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-stone-900 truncate">
                                    {rm.roomName}
                                  </div>
                                  <div className="text-xs text-stone-500">
                                    {rm.roomType} • {rm.boardBasis} • Max {rm.maxOccupancy} Guests
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-amber-800 tabular-nums">
                                      {formatPrice(rm.ratePerNightUSD)}
                                    </div>
                                    <div className="text-[10px] text-stone-500">per room/night</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBookingPartner(igongoPartner);
                                      setBookingSelectedRoom(rm);
                                      setBookingStatus(null);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Book
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* UPLOADED HOTEL & MOTEL ROOMS INVENTORY */}
            {filteredPartnerRooms.length > 0 && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Live Owner-Uploaded Room Inventory &amp; Per-Room Rates
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                      Available Hotel &amp; Motel Rooms ({filteredPartnerRooms.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoomUploadForm(true)}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload Another Room &amp; Rate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPartnerRooms.map((room) => {
                    const parentPartner =
                      PARTNER_ACCOMMODATIONS.find((p) => p.slug === room.partnerSlug) ||
                      igongoPartner;
                    return (
                      <div
                        key={room.id}
                        className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 bg-stone-900">
                            <img
                              src={room.imageUrl}
                              alt={room.roomName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
                            <div className="absolute top-2.5 left-2.5 bg-stone-900/85 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              {room.partnerName}
                            </div>
                            <div className="absolute top-2.5 right-2.5 bg-emerald-950/90 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              {room.totalRoomsAvailable} Rooms Open
                            </div>
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                              <div>
                                <div className="text-[11px] text-amber-300 font-semibold">
                                  {room.roomType} • {room.boardBasis}
                                </div>
                                <h3 className="font-serif text-lg font-bold leading-snug">
                                  {room.roomName}
                                </h3>
                              </div>
                              <div className="text-right shrink-0 pl-2">
                                <div className="text-base font-bold text-amber-300 tabular-nums">
                                  {formatPrice(room.ratePerNightUSD)}
                                </div>
                                <div className="text-[10px] text-stone-300">per room/night</div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-stone-600">
                              <span>
                                <strong className="text-stone-800">Beds:</strong>{' '}
                                {room.bedConfiguration}
                              </span>
                              <span>
                                <strong className="text-stone-800">Max:</strong> {room.maxOccupancy}{' '}
                                Guests
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 4).map((am) => (
                                <span
                                  key={am}
                                  className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                                >
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBookingPartner(parentPartner);
                              setBookingSelectedRoom(room);
                              setBookingStatus(null);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            Book Room ({formatPrice(room.ratePerNightUSD)}/night)
                          </button>
                          {room.id.startsWith('room_custom_') && (
                            <button
                              type="button"
                              onClick={() => deletePartnerHotelRoom(room.id)}
                              className="p-2 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                              title="Delete custom uploaded room"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ALL PARTNER HOTELS, MOTELS, SAFARI LODGES & CAMP SITES GRID */}
            {filteredPartners.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
                <p className="text-stone-600 mb-4">
                  No partner hotels, motels, lodges, or camp sites match your current search or
                  regional filter.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPartners.map((partner) => {
                  const partnerUploadedRooms = partnerHotelRooms.filter(
                    (r) => r.partnerSlug === partner.slug
                  );
                  return (
                    <div
                      key={partner.id}
                      className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-64 bg-stone-900 overflow-hidden">
                          <img
                            src={partner.heroImage}
                            alt={partner.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent" />

                          {partner.logoUrl && (
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                              <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                className="h-8 w-auto object-contain"
                              />
                            </div>
                          )}

                          <div
                            className={`absolute ${
                              partner.logoUrl ? 'top-16 left-3' : 'top-3 left-3'
                            } flex items-center gap-2`}
                          >
                            <span className="bg-stone-900/90 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                              {partner.categoryLabel}
                            </span>
                            <span className="bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                              {partner.verifiedPartnerBadge}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{partner.rating.toFixed(1)}</span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                            <div>
                              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {partner.region}
                              </div>
                              <h2 className="font-serif text-2xl font-bold leading-tight">
                                {partner.name}
                              </h2>
                            </div>
                            <div className="text-right bg-stone-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
                              <div className="text-[10px] uppercase tracking-wider text-stone-300">
                                From
                              </div>
                              <div className="text-base font-bold text-amber-300">
                                {formatPrice(partner.pricePerNightUSD)}
                                <span className="text-xs font-normal text-stone-300">/night</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="text-xs font-semibold text-stone-500">
                            {partner.locationDetails}
                          </div>

                          <p className="text-stone-600 text-sm leading-relaxed">
                            {partner.summary}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {partner.amenities.map((hl) => (
                              <span
                                key={hl}
                                className="text-[11px] font-medium bg-amber-50 text-amber-950 border border-amber-200/60 px-2.5 py-1 rounded-md"
                              >
                                {hl}
                              </span>
                            ))}
                          </div>

                          <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-600 gap-2">
                            <div className="line-clamp-1">
                              <strong className="text-stone-900">Sustainability &amp; Standards:</strong>{' '}
                              {partner.sustainabilityNote}
                            </div>
                            {partnerUploadedRooms.length > 0 && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                                {partnerUploadedRooms.length} Live Rooms Priced
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setBookingPartner(partner);
                            setBookingSelectedRoom(partnerUploadedRooms[0] || null);
                            setBookingStatus(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Book via Safari Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoomPartnerSelect(partner.slug);
                            setShowRoomUploadForm(true);
                          }}
                          className="py-2.5 px-3.5 rounded-xl border border-stone-300 hover:border-stone-900 text-xs font-bold text-stone-800 transition-colors cursor-pointer"
                        >
                          + Owner: Add Room Rate
                        </button>
                        {partner.websiteUrl && (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Direct Wallet Partner / Room Booking Modal */}
      {bookingPartner && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                  Direct Safari Wallet Room Voucher
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {bookingPartner.name}
                </h3>
                <p className="text-xs text-stone-500">{bookingPartner.locationDetails}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingPartner(null);
                  setBookingSelectedRoom(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingStatus && (
              <div
                className={`mb-5 p-4 rounded-2xl border text-xs font-medium ${
                  bookingStatus.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {bookingStatus.ok ? 'Partner Room Voucher Issued!' : 'Wallet Balance Notice'}
                  </span>
                </div>
                <p>{bookingStatus.message}</p>
                {bookingStatus.ok && (
                  <Link
                    to="/wallet"
                    className="inline-block mt-2 font-bold text-emerald-800 underline"
                  >
                    View Voucher in Safari Wallet →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleWalletBookPartner} className="space-y-4">
              {partnerHotelRooms.filter((r) => r.partnerSlug === bookingPartner.slug).length >
                0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Select Uploaded Room &amp; Per-Room Rate
                  </label>
                  <select
                    value={bookingSelectedRoom?.id || ''}
                    onChange={(e) => {
                      const found = partnerHotelRooms.find((r) => r.id === e.target.value);
                      setBookingSelectedRoom(found || null);
                    }}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-white"
                  >
                    {partnerHotelRooms
                      .filter((r) => r.partnerSlug === bookingPartner.slug)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.roomName} ({r.boardBasis}) — {formatPrice(r.ratePerNightUSD)}/night
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value) || 1)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value) || 1)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>
                    {bookingSelectedRoom ? bookingSelectedRoom.roomName : 'Room Rate'} (
                    {formatPrice(activeBookingNightlyRate)} × {nights} nights)
                  </span>
                  <span className="font-bold text-stone-900">
                    {formatPrice(activeBookingNightlyRate * nights)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 pt-1 border-t border-stone-200">
                  <span>Your Available Safari Wallet Balance</span>
                  <span className="font-bold text-emerald-700">
                    {formatPrice(availableBalanceUSD)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingPartner(null);
                    setBookingSelectedRoom(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm &amp; Issue Room Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Wallet Driver & 4x4 Vehicle Hire Modal */}
      {hiringVehicle && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                  Direct 4x4 Safari Fleet &amp; Driver Charter
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {hiringVehicle.vehicleName}
                </h3>
                <p className="text-xs text-stone-500">
                  Driver: {hiringVehicle.driverName} ({hiringVehicle.registrationPlate})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHiringVehicle(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hireStatus && (
              <div
                className={`mb-5 p-4 rounded-2xl border text-xs font-medium ${
                  hireStatus.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {hireStatus.ok
                      ? '4x4 Vehicle & Driver Charter Confirmed!'
                      : 'Wallet Balance Notice'}
                  </span>
                </div>
                <p>{hireStatus.message}</p>
                {hireStatus.ok && (
                  <Link
                    to="/wallet"
                    className="inline-block mt-2 font-bold text-emerald-800 underline"
                  >
                    View Charter Voucher in Safari Wallet →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleWalletHireDriverVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Safari Pickup / Start Date
                </label>
                <input
                  type="date"
                  value={hireStartDate}
                  onChange={(e) => setHireStartDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Charter Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={hireDays}
                    onChange={(e) => setHireDays(Number(e.target.value) || 1)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Passengers (Max {hiringVehicle.passengerCapacity})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={hiringVehicle.passengerCapacity}
                    value={hirePassengers}
                    onChange={(e) => setHirePassengers(Number(e.target.value) || 1)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>
                    Daily Vehicle &amp; Driver Rate ({formatPrice(hiringVehicle.ratePerDayUSD)} ×{' '}
                    {hireDays} days)
                  </span>
                  <span className="font-bold text-stone-900">
                    {formatPrice(hiringVehicle.ratePerDayUSD * hireDays)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 pt-1 border-t border-stone-200">
                  <span>Your Available Safari Wallet Balance</span>
                  <span className="font-bold text-emerald-700">
                    {formatPrice(availableBalanceUSD)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHiringVehicle(null)}
                  className="flex-1 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Driver &amp; 4x4 Charter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
