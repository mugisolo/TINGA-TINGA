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
import { useLanguage } from '../context/LanguageContext';

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
  countLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All Partners', countLabel: 'Hotels, Motels, Camps & Lodges', icon: Compass },
  { id: 'hotel', label: 'Hotels', countLabel: 'Igongo, Entebbe, Jinja & Fort Portal', icon: Building2 },
  { id: 'motel', label: 'Motels', countLabel: 'Highway & Airport Transit', icon: Car },
  { id: 'lodge', label: 'Safari Lodges', countLabel: 'Forest & Savanna Lodges', icon: Hotel },
  { id: 'campsite', label: 'Camp Sites', countLabel: 'Wilderness & Island Camps', icon: Tent },
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

export const GuidesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'guides' | 'operators' | 'partners' | 'drivers-cars'>(() => {
    const sec = searchParams.get('section');
    if (sec === 'operators' || sec === 'safari-operators') return 'operators';
    if (sec === 'partners' || sec === 'hotels') return 'partners';
    if (sec === 'drivers-cars' || sec === 'drivers' || sec === 'fleet') return 'drivers-cars';
    return 'guides';
  });
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<PartnerCategory | 'all'>('all');

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
  const { t } = useLanguage();

  useEffect(() => {
    const sec = searchParams.get('section');
    if (sec === 'guides') {
      setActiveSection('guides');
    } else if (sec === 'operators' || sec === 'safari-operators') {
      setActiveSection('operators');
    } else if (sec === 'partners' || sec === 'hotels') {
      setActiveSection('partners');
      setSelectedPartnerCategory('all');
    } else if (sec === 'drivers-cars' || sec === 'drivers' || sec === 'fleet') {
      setActiveSection('drivers-cars');
    }
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

  // Drivers & Cars Fleet State
  const [selectedFleetCategory, setSelectedFleetCategory] = useState<
    DriverFleetVehicle['vehicleCategory'] | 'all'
  >('all');
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

  const filteredGuides = useMemo(() => {
    return GUIDES.filter((guide) => {
      const matchesSpecialty =
        selectedSpecialty === 'all' || guide.specialties.includes(selectedSpecialty);
      const matchesLanguage =
        selectedLanguage === 'all' || guide.languages.includes(selectedLanguage);
      return matchesSpecialty && matchesLanguage;
    });
  }, [selectedSpecialty, selectedLanguage]);

  const filteredPartners = useMemo(() => {
    if (selectedPartnerCategory === 'all') return PARTNER_ACCOMMODATIONS;
    return PARTNER_ACCOMMODATIONS.filter((p) => p.category === selectedPartnerCategory);
  }, [selectedPartnerCategory]);

  const igongoPartner = useMemo(
    () =>
      PARTNER_ACCOMMODATIONS.find(
        (p) => p.slug === 'igongo-country-hotel-and-cultural-centre'
      ) || PARTNER_ACCOMMODATIONS[0],
    []
  );

  const filteredFleet = useMemo(() => {
    if (selectedFleetCategory === 'all') return driverFleetVehicles;
    return driverFleetVehicles.filter((v) => v.vehicleCategory === selectedFleetCategory);
  }, [driverFleetVehicles, selectedFleetCategory]);

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

  const switchSection = (sec: 'guides' | 'operators' | 'partners' | 'drivers-cars') => {
    setActiveSection(sec);
    const paramMap: Record<'guides' | 'operators' | 'partners' | 'drivers-cars', string> = {
      guides: 'guides',
      operators: 'operators',
      'drivers-cars': 'drivers',
      partners: 'hotels',
    };
    setSearchParams({ section: paramMap[sec] });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Page Header */}
      <section className="bg-stone-900 text-white py-16 md:py-20 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
                Service Providers • UTB &amp; UWA Verified Directory
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Service Providers
              </h1>
              <p className="text-stone-300 text-lg leading-relaxed">
                Explore our UTB-licensed and UWA-accredited service providers across East Africa —
                connecting you directly with named specialist guides, safari operators, verified
                drivers, and partner hotels.
              </p>
            </div>

            {/* Section Switcher: Guides, Safari Operators, Drivers, Hotels */}
            <div className="flex flex-wrap bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700 self-start gap-1">
              <button
                onClick={() => switchSection('guides')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'guides'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Guides</span>
              </button>
              <button
                onClick={() => switchSection('operators')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'operators'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Safari Operators</span>
              </button>
              <button
                onClick={() => switchSection('drivers-cars')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'drivers-cars'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Drivers</span>
              </button>
              <button
                onClick={() => switchSection('partners')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'partners'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hotels</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeSection === 'guides' && (
        <>
          {/* Filter Bar */}
          <div className="sticky top-20 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Specialty Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {ALL_SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSpecialty === spec
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                    }`}
                  >
                    {spec === 'all'
                      ? `All Specialties (${GUIDES.length})`
                      : SPECIALTY_LABELS[spec]}
                  </button>
                ))}
              </div>

              {/* Language Filter + Partner & Fleet Quick Links */}
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
                <button
                  onClick={() => switchSection('partners')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  Igongo & Partner Hotels
                </button>
                <button
                  onClick={() => switchSection('drivers-cars')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  Drivers & Cars
                </button>
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {filteredGuides.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                <p className="text-stone-600 mb-4">
                  No guides match that exact specialty and language combination.
                </p>
                <button
                  onClick={() => {
                    setSelectedSpecialty('all');
                    setSelectedLanguage('all');
                  }}
                  className="px-5 py-2.5 bg-amber-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Reset Filters
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
                        {/* Image Column */}
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

                        {/* Details Column */}
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

                            {/* Specialties */}
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

                            {/* Languages & Certifications */}
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
        </>
      )}

      {activeSection === 'operators' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                UTB &amp; UWA Verified Safari Operators
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {TOUR_OPERATORS.map((operator) => {
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
        </div>
      )}

      {activeSection === 'partners' && (
        <>
          {/* Partner Categories Filter Bar */}
          <div className="sticky top-20 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {PARTNER_CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    tab.id === 'all'
                      ? PARTNER_ACCOMMODATIONS.length
                      : PARTNER_ACCOMMODATIONS.filter((p) => p.category === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedPartnerCategory(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedPartnerCategory === tab.id
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          selectedPartnerCategory === tab.id
                            ? 'bg-stone-800 text-amber-300'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <button
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
                      Partner Hotel & Motel Owner Inventory Desk
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      Upload Hotel or Motel Room & Nightly Rate Per Room
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Property owners and reservations managers (including Igongo Country Hotel,
                      Entebbe & Western Circuit hotels and motels) can upload room categories and
                      exact nightly rates per room directly to the live Firestore booking catalog.
                    </p>
                  </div>
                  <button
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
                        {PARTNER_ACCOMMODATIONS.filter(
                          (p) => p.category === 'hotel' || p.category === 'motel' || p.category === 'lodge'
                        ).map((p) => (
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
                        <option value="Bed & Breakfast">Bed & Breakfast</option>
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
                          Total Rooms
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
                        Upload Room Photo (From Device or URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-700" />
                          Choose File
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
                        value={uploadedByOwnerName}
                        onChange={(e) => setUploadedByOwnerName(e.target.value)}
                        placeholder="e.g. Igongo Reservations Manager"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Publish Room & Rate to Live Catalog
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* OFFICIAL PARTNER SPOTLIGHT: IGONGO COUNTRY HOTEL & CULTURAL CENTRE */}
            {(selectedPartnerCategory === 'all' || selectedPartnerCategory === 'hotel') && (
              <div className="bg-white rounded-3xl border border-amber-300/90 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white px-6 sm:px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-md">
                      <img
                        src="/assets/aistudio/logo_igongo_8f5928e8.png"
                        alt="Igongo Country Hotel & Cultural Centre Official Logo"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                          Official Partner of Enganda Safaris • Western Safari Circuit
                        </span>
                        <span className="text-stone-500">·</span>
                        <span className="text-xs text-emerald-300 font-semibold">
                          Biharwe, Mbarara (Ankole Kingdom)
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                        Igongo Country Hotel & Cultural Centre
                      </h2>
                      <p className="text-stone-300 text-sm mt-1 max-w-2xl">
                        Where Uganda’s heritage meets 5-star country hospitality: home to the
                        Eriijukiro Museum of South Western Uganda, the Itaramiro Cultural Village,
                        and the historic 1520 AD Biharwe Eclipse Monument.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <a
                      href="https://igongo.co.ug/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      <span>Visit igongo.co.ug</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </a>
                    <button
                      onClick={() => {
                        setRoomPartnerSelect('igongo-country-hotel-and-cultural-centre');
                        setShowRoomUploadForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Upload Igongo Room & Rate
                    </button>
                  </div>
                </div>

                {/* Igongo 4-Photo Visual Gallery + Uploaded Rooms & Rates */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left 7 Cols: Interactive 4-Photo Gallery of Attached Igongo Media */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-stone-900 aspect-[16/10] border border-stone-200">
                      <img
                        src={IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].src}
                        alt={IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute top-3 right-3 bg-white/95 rounded-xl p-2 shadow-md">
                        <img
                          src="/assets/aistudio/Logo_Igongo_5f7425de.png"
                          alt="Igongo Crest"
                          className="h-10 w-auto object-contain"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-0.5">
                          Igongo Cultural Centre & Country Hotel Gallery ({activeIgongoPhotoIndex + 1}{' '}
                          / {IGONGO_GALLERY_ITEMS.length})
                        </div>
                        <h3 className="font-serif text-xl font-bold">
                          {IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].title}
                        </h3>
                        <p className="text-xs text-stone-200 mt-1">
                          {IGONGO_GALLERY_ITEMS[activeIgongoPhotoIndex].caption}
                        </p>
                      </div>
                    </div>

                    {/* 4 Thumbnails */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {IGONGO_GALLERY_ITEMS.map((item, idx) => (
                        <button
                          key={item.src}
                          type="button"
                          onClick={() => setActiveIgongoPhotoIndex(idx)}
                          className={`group text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            activeIgongoPhotoIndex === idx
                              ? 'border-amber-600 ring-2 ring-amber-500/30'
                              : 'border-stone-200 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="aspect-[4/3] bg-stone-900 overflow-hidden">
                            <img
                              src={item.src}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-2 bg-stone-50">
                            <div className="text-[11px] font-bold text-stone-900 truncate">
                              {item.title}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right 5 Cols: Live Igongo Rooms & Per-Room Nightly Rates */}
                  <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/90 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          Official Partner Room Tariff
                        </span>
                        <h3 className="font-serif text-xl font-bold text-stone-900">
                          Igongo Rooms & Nightly Rates
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setRoomPartnerSelect('igongo-country-hotel-and-cultural-centre');
                          setShowRoomUploadForm(true);
                        }}
                        className="text-xs font-bold text-amber-800 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Room
                      </button>
                    </div>

                    <div className="space-y-3">
                      {partnerHotelRooms
                        .filter(
                          (rm) =>
                            rm.partnerSlug === 'igongo-country-hotel-and-cultural-centre'
                        )
                        .map((room) => (
                          <div
                            key={room.id}
                            className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs hover:border-amber-400 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-bold text-amber-800">
                                  {room.roomType} · {room.boardBasis}
                                </div>
                                <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                                  {room.roomName}
                                </h4>
                                <div className="text-xs text-stone-500 mt-1">
                                  {room.bedConfiguration} · Up to {room.maxOccupancy} guests ·{' '}
                                  {room.totalRoomsAvailable} rooms
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-serif text-lg font-bold text-stone-900 tabular-nums">
                                  {formatPrice(room.ratePerNightUSD)}
                                </div>
                                <div className="text-[10px] text-stone-500">per room / night</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
                              <span className="text-[11px] text-stone-500 truncate">
                                {room.amenities.slice(0, 2).join(' · ')}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {room.id.startsWith('room_custom_') && (
                                  <button
                                    type="button"
                                    onClick={() => deletePartnerHotelRoom(room.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer"
                                    title="Remove custom room"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBookingPartner(igongoPartner);
                                    setBookingSelectedRoom(room);
                                    setBookingStatus(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Book Room ({formatPrice(room.ratePerNightUSD)})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ALL PARTNER HOTELS, MOTELS, CAMP SITES & LODGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPartners.map((partner) => {
                const matchedGuides = GUIDES.filter((g) =>
                  partner.recommendedGuideSlugs.includes(g.slug)
                );
                const propertyRooms = partnerHotelRooms.filter(
                  (rm) => rm.partnerSlug === partner.slug
                );

                return (
                  <div
                    key={partner.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-56 bg-stone-900 overflow-hidden">
                        <img
                          src={partner.heroImage}
                          alt={partner.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-stone-900/90 backdrop-blur-md text-amber-300 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
                            {partner.categoryLabel}
                          </span>
                          <span className="bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            {partner.verifiedPartnerBadge}
                          </span>
                        </div>

                        {partner.logoUrl && (
                          <div className="absolute top-3 right-3 bg-white/95 rounded-xl px-2.5 py-1.5 shadow-md">
                            <img
                              src={partner.logoUrl}
                              alt={`${partner.name} logo`}
                              className="h-7 w-auto object-contain"
                            />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                          <div>
                            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {partner.region}
                            </div>
                            <h3 className="font-serif text-xl font-bold leading-snug">
                              {partner.name}
                            </h3>
                          </div>
                          <div className="text-right bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="text-[10px] uppercase tracking-wider text-stone-300">
                              From
                            </div>
                            <div className="text-sm font-bold text-amber-300 tabular-nums">
                              {formatPrice(partner.pricePerNightUSD)}
                              <span className="text-[10px] font-normal text-stone-300">/nt</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                          <span className="truncate">{partner.locationDetails}</span>
                          <span className="flex items-center gap-1 font-bold text-stone-800 shrink-0 ml-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {partner.rating} ({partner.reviewCount})
                          </span>
                        </div>

                        <p className="text-stone-600 text-sm leading-relaxed mb-4">
                          {partner.summary}
                        </p>

                        {partner.websiteUrl && (
                          <div className="mb-4">
                            <a
                              href={partner.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-600 underline"
                            >
                              <span>Official Website ({partner.websiteUrl})</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Uploaded Rooms & Per-Room Rates for this Hotel/Motel */}
                        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                              <BedDouble className="w-3.5 h-3.5 text-amber-700" />
                              Uploaded Rooms & Rates ({propertyRooms.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setRoomPartnerSelect(partner.slug);
                                setShowRoomUploadForm(true);
                                window.scrollTo({ top: 280, behavior: 'smooth' });
                              }}
                              className="text-[11px] font-bold text-amber-800 hover:text-amber-600 cursor-pointer"
                            >
                              + Upload Room
                            </button>
                          </div>

                          {propertyRooms.length === 0 ? (
                            <div className="text-xs text-stone-500 py-1">
                              Standard Room Tariff:{' '}
                              <strong className="text-stone-800">
                                {formatPrice(partner.pricePerNightUSD)}/night
                              </strong>
                              . Owners can upload individual room categories above.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {propertyRooms.map((rm) => (
                                <div
                                  key={rm.id}
                                  className="bg-white rounded-xl p-2.5 border border-stone-200 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-stone-900 truncate">
                                      {rm.roomName}
                                    </div>
                                    <div className="text-[11px] text-stone-500 truncate">
                                      {rm.boardBasis} · Max {rm.maxOccupancy} pax
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-bold text-amber-900 tabular-nums">
                                      {formatPrice(rm.ratePerNightUSD)}/nt
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBookingPartner(partner);
                                        setBookingSelectedRoom(rm);
                                        setBookingStatus(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                      Book
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {partner.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>

                        {matchedGuides.length > 0 && (
                          <div className="border-t border-stone-100 pt-3 mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                              Recommended by Enganda Guides
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {matchedGuides.map((g) => (
                                <Link
                                  key={g.slug}
                                  to={`/guides/${g.slug}`}
                                  className="text-xs font-semibold text-stone-700 hover:text-amber-800 underline"
                                >
                                  {g.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setBookingPartner(partner);
                          setBookingSelectedRoom(propertyRooms[0] || null);
                          setBookingStatus(null);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Book via Wallet
                      </button>
                      <button
                        onClick={() =>
                          openInquiryModal({
                            defaultNotes: `Include partner stay at ${partner.name} (${partner.categoryLabel} in ${partner.region}) in my safari itinerary.`,
                          })
                        }
                        className="py-2.5 px-3 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Add to Safari
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* DRIVERS & CARS (KNOWN DRIVERS FLEET & DAILY RATES) */}
      {activeSection === 'drivers-cars' && (
        <>
          <div className="sticky top-20 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {FLEET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFleetCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedFleetCategory === cat
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                    }`}
                  >
                    {cat === 'all'
                      ? `All Safari Vehicles (${driverFleetVehicles.length})`
                      : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <button
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
            {/* KNOWN DRIVER FLEET & RATE UPLOAD FORM */}
            {showFleetUploadForm && (
              <div className="bg-white rounded-3xl border-2 border-amber-500/80 shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Enganda Verified Drivers & 4x4 Transport Roster
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                      Known Driver: Upload Your Safari Vehicle & Daily Rate
                    </h2>
                    <p className="text-sm text-stone-600 mt-1">
                      Verified Enganda driver-guides and fleet owners can upload their 4x4 Land
                      Cruisers, Prados, Safari Vans, or Coasters with transparent daily rates.
                    </p>
                  </div>
                  <button
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
                        UTB / USAGA License & Badge *
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
                        Safari Vehicle Make & Model *
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
                        Home Base & Operating Corridor
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
                      Publish Vehicle & Daily Rate to Fleet Roster
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DRIVERS & CARS FLEET GRID */}
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
                      {/* Known Driver Strip */}
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
                      Hire Driver & 4x4 ({formatPrice(vehicle.ratePerDayUSD)}/day)
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
          </div>
        </>
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
              {/* Select Specific Uploaded Room if available */}
              {partnerHotelRooms.filter((r) => r.partnerSlug === bookingPartner.slug).length >
                0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Select Uploaded Room & Per-Room Rate
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
                  Confirm & Issue Room Voucher
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
                  Direct 4x4 Safari Fleet & Driver Charter
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {hiringVehicle.vehicleName}
                </h3>
                <p className="text-xs text-stone-500">
                  Driver: {hiringVehicle.driverName} ({hiringVehicle.registrationPlate})
                </p>
              </div>
              <button
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
                    Daily Vehicle & Driver Rate ({formatPrice(hiringVehicle.ratePerDayUSD)} ×{' '}
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
                  Confirm Driver & 4x4 Charter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
