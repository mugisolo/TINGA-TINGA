export type Currency = 'USD' | 'EUR' | 'GBP' | 'UGX';

export type Specialty =
  | 'gorillas'
  | 'chimps'
  | 'birding'
  | 'big-game'
  | 'culture'
  | 'hiking'
  | 'photography';

export type ComfortTier = 'mid-range' | 'luxury' | 'signature';

export interface Guide {
  id: string;
  slug: string;
  name: string;
  photo: string;
  homeRegion: string;
  tagline: string;
  bio: string;
  fieldStory: string;
  languages: string[];
  specialties: Specialty[];
  regionsCovered: string[];
  yearsExperience: number;
  certifications: string[];
  rating: number; // 4.7 - 5.0
  reviewCount: number;
}

export interface DayPlan {
  day: number;
  title: string;
  location: string;
  summary: string;
  activities: string[];
  accommodationTier: string;
  meals: string;
  driveTime: string;
  wildlifeHighlights: string[];
}

export interface PriceBand {
  tier: ComfortTier;
  label: string;
  perPersonUSD: number;
  perPersonPerDayUSD: number;
  lodgeExamples: string[];
  description: string;
}

export interface ShumaGroupOffer {
  companyName: string;
  tagline: string;
  seasonWindow: string;
  countries: string[];
  payingGuests: number;
  freeTourLeaders: number;
  totalTravellers: number;
  totalGroupCostUSD: number;
  perPersonExactUSD: number;
  roomingPlan: string;
  accommodationStyle: string;
  flightsAndTransport: {
    sector: string;
    mode: string;
    details: string;
  }[];
  planningNotes: string[];
  pdfBrochureUrl: string;
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  region: string;
  regions: string[];
  durationDays: number;
  summary: string;
  heroImage: string;
  galleryImages: string[];
  interests: Specialty[];
  dayByDay: DayPlan[];
  comfortTiers: ComfortTier[];
  priceBands: PriceBand[];
  inclusions: string[]; // Always includes: "Private 4x4 Land Cruiser with pop-up roof", "Professional Enganda guide-driver", "All park entrance fees", "Gorilla/chimp permits as specified", "Full-board meals", "Airport meet & greet in Entebbe"
  exclusions: string[];
  recommendedGuides: string[]; // guide slugs
  permitsRequired: string[]; // PermitFact ids
  bestMonths: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  shumaGroupOffer?: ShumaGroupOffer;
  packageCode?: string;
  operatorName?: string;
  adminRecommended?: boolean;
  adminRecommendationNote?: string;
  twoPaxSharingPriceUSD?: number;
  soloTravelerPriceUSD?: number;
  pdfBrochureUrl?: string;
}

export interface PermitFact {
  id: string;
  name: string;
  authority: 'UWA';
  park: string;
  costUSD: number;
  lowSeasonCostUSD?: number;
  lowSeasonMonths?: string;
  priceFrom2027USD?: number;
  validity: string;
  dailyQuota: string;
  minAge: number;
  notes: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  partySize: number;
  targetDates: string;
  budgetTier: ComfortTier;
  interests: string[];
  regions?: string[];
  durationDays?: number;
  preferredGuideSlug?: string;
  experienceSlug?: string;
  notes?: string;
  status: 'new' | 'quote_sent' | 'confirmed';
  createdAt: string;
}

export interface Review {
  id: string;
  guestName: string;
  country: string;
  destination?: string;
  experienceSlug: string;
  guideSlug: string;
  guideName?: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  partyType: string;
  status?: 'published' | 'archived';
  authorId?: string;
}

export interface GeneratedItineraryDay {
  day: number;
  title: string;
  destination: string;
  morningActivity: string;
  afternoonActivity: string;
  accommodation: string;
  meals: string;
  driveTime: string;
  wildlifeHighlight: string;
}

export interface GeneratedSafariItinerary {
  id: string;
  referenceCode: string;
  title: string;
  subtitle: string;
  region: string;
  budgetTier: ComfortTier;
  activityFocus: string;
  durationDays: number;
  partySize: number;
  estimatedPerPersonUSD: number;
  totalPackageUSD: number;
  depositAmountUSD: number;
  matchedGuideSlug: string;
  matchedGuideName: string;
  matchedGuideReason: string;
  permitBreakdown: {
    permitName: string;
    costUSD: number;
  }[];
  recommendedPartnerStays: string[];
  days: GeneratedItineraryDay[];
  conservationNote: string;
  depositPaid?: boolean;
  createdAt: string;
}

export interface DestinationRegion {
  slug: string;
  name: string;
  country?: 'Uganda' | 'Tanzania' | 'Kenya' | 'Rwanda';
  operatedBy?: string;
  tagline: string;
  summary: string;
  bestSeasons: string;
  keyWildlife: string[];
  highlights: string[];
  heroImage: string;
  parkElevation?: string;
  driveFromEntebbe: string;
}

export interface JournalArticle {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category:
    | 'Travel Updates'
    | 'Safari Tips'
    | 'Cultural Stories'
    | 'Permits & Planning'
    | 'Birding Field Notes'
    | 'Packing & Preparation'
    | 'Conservation & Tariffs';
  authorGuideSlug: string;
  publishedDate: string;
  readTimeMinutes: number;
  heroImage: string;
  keyTakeaways: string[];
  sections: {
    heading: string;
    body: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: {
    name: string;
    arguments: Record<string, any>;
    result: any;
  }[];
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface SocialLink {
  platform: 'x' | 'instagram' | 'linkedin';
  label: string;
  handle: string;
  url: string;
  description: string;
}

export type EventDisplayPlacement = 'carousel' | 'upcoming' | 'both';

export interface ConfirmedPackageEvent {
  id: string;
  title: string;
  shortTabLabel?: string;
  subtitle: string;
  eventTag: string;
  category: 'Cultural & Music Event' | 'Guaranteed Primate Departure' | 'Seasonal Migration & Savanna' | 'Ornithology Special';
  dateWindow: string;
  durationLabel: string;
  location: string;
  spotsRemaining: number;
  pricePerPersonUSD: number;
  leadGuideSlug: string;
  experienceSlug?: string;
  heroImage: string;
  highlights: string[];
  statusLabel: string;
  placement?: EventDisplayPlacement;
  operatorName?: string;
  dayByDaySummary?: string[];
  sourceDocumentName?: string;
  packageCode?: string;
  operatorLogoUrl?: string;
  utbLicenseNumber?: string;
  uwaAccreditationId?: string;
  carouselSlotNumber?: number;
  isStandbySlot?: boolean;
  soloPricePerPersonUSD?: number;
  adminRecommended?: boolean;
  pdfBrochureUrl?: string;
}

export interface FooterPartnerLogo {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  category: 'Government & Conservation' | 'Banking & Fintech' | 'Strategic Partner';
  websiteUrl?: string;
  active: boolean;
  displayOrder: number;
}


export type UgandaRegion = string;

export type PartnerCategory = 'hotel' | 'motel' | 'campsite' | 'lodge';

export interface AccommodationPartner {
  id: string;
  slug: string;
  name: string;
  category: PartnerCategory;
  categoryLabel: 'Hotel' | 'Motel' | 'Camp Site' | 'Safari Lodge';
  region: UgandaRegion;
  locationDetails: string;
  pricePerNightUSD: number;
  comfortTier: ComfortTier;
  rating: number;
  reviewCount: number;
  heroImage: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  websiteUrl?: string;
  utbLicenseNumber?: string;
  uwaAccreditationId?: string;
  galleryImages?: string[];
  officialPartnerHighlights?: string[];
  summary: string;
  amenities: string[];
  sustainabilityNote: string;
  recommendedGuideSlugs: string[];
  featured: boolean;
  verifiedPartnerBadge: string;
}

export interface PartnerHotelRoom {
  id: string;
  partnerSlug: string;
  partnerName: string;
  partnerCategory: PartnerCategory;
  roomName: string;
  roomType: string;
  ratePerNightUSD: number;
  boardBasis: 'Bed & Breakfast' | 'Half Board' | 'Full Board' | 'Room Only';
  maxOccupancy: number;
  bedConfiguration: string;
  totalRoomsAvailable: number;
  imageUrl: string;
  amenities: string[];
  uploadedByOwnerName: string;
  utbLicenseNumber?: string;
  createdAt: string;
}

export interface DriverFleetVehicle {
  id: string;
  driverName: string;
  driverSlug?: string;
  driverLicenseAndBadge: string;
  utbLicenseNumber?: string;
  uwaAccreditationId?: string;
  driverPhone: string;
  driverPhotoUrl: string;
  vehicleName: string;
  vehicleCategory:
    | '4x4 Extended Land Cruiser'
    | '4x4 Land Cruiser Prado'
    | '4x4 Pop-Up Safari Van'
    | 'Executive Group Coaster'
    | 'Luxury Overland Truck';
  registrationPlate: string;
  passengerCapacity: number;
  ratePerDayUSD: number;
  rateIncludes: string;
  homeBaseRegion: string;
  regionsCovered: string[];
  vehicleImageUrl: string;
  features: string[];
  availableStatus: 'Available Now' | 'On Charter' | 'Advance Booking';
  createdAt: string;
}

export interface TourOperatorPartner {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  utbLicenseNumber?: string;
  uwaAccreditationId?: string;
  tagline: string;
  roleLabel: string;
  headquarters: string;
  countriesCovered: string[];
  specialties: string[];
  description: string;
  heroImage: string;
  featuredExperienceSlugs: string[];
  accreditations: string[];
}

export interface VolunteerProgram {
  id: string;
  slug: string;
  title: string;
  organization: string;
  utbLicenseNumber: string;
  uwaAccreditationId: string;
  region: string;
  durationWeeks: string;
  programFeeUSD: number;
  category: 'Wildlife Conservation' | 'Community Education & Healthcare' | 'Reforestation & Agroforestry' | 'Cultural Heritage';
  heroImage: string;
  summary: string;
  impactHighlights: string[];
  includedSupport: string[];
  spotsAvailable: number;
}

export interface ConservationFundraiser {
  id: string;
  slug: string;
  title: string;
  beneficiaryOrganization: string;
  utbUwaVerificationCode: string;
  region: string;
  category: 'Ranger Welfare & Anti-Poaching' | 'Batwa & Host Community Livelihoods' | 'Primate Habitat Corridor' | 'Clean Water & Schools';
  targetAmountUSD: number;
  raisedAmountUSD: number;
  backersCount: number;
  heroImage: string;
  summary: string;
  milestones: string[];
}

export interface ConciergeMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestedGuideSlugs?: string[];
  suggestedExperienceSlugs?: string[];
}

export interface AutonomousBookingQuote {
  quoteId: string;
  packageId: string;
  packageTitle: string;
  operatorName: string;
  utbLicenseNumber: string;
  uwaAccreditationId: string;
  leadGuideName: string;
  leadGuideSlug: string;
  guests: number;
  durationLabel: string;
  departureDate: string;
  pricePerPersonUSD: number;
  uwaPermitsTotalUSD: number;
  accommodationAndTransportUSD: number;
  conservationLevyUSD: number;
  totalUSD: number;
  currency: Currency;
  convertedTotal: number;
  includesGorillaPermit: boolean;
  includesChimpPermit: boolean;
  createdAt: string;
}

export interface AutonomousBookingConfirmation {
  bookingId: string;
  invoiceNumber: string;
  quote: AutonomousBookingQuote;
  clientName: string;
  clientEmail: string;
  paymentMethod:
    | 'wallet_balance'
    | 'mtn_momo'
    | 'airtel_money'
    | 'visa_mastercard'
    | 'bank_transfer';
  status: 'confirmed_paid' | 'pending_payment' | 'reserved_pending_payment';
  receiptId: string;
  uwaEscrowReference: string;
  createdAt: string;
}

export interface DriveMediaPhoto {
  id: string;
  fileId: string;
  title: string;
  folderCategory: string;
  region: string;
  activityTag: string;
  url: string;
}

export type WithdrawalChannel = 'bank_account' | 'momo' | 'enganda_agent';

export interface EngandaAgentLocation {
  id: string;
  name: string;
  cityOrPark: string;
  address: string;
  hours: string;
  maxInstantCashUSD: number;
  contactPhone: string;
}

export type WalletTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'permit_escrow'
  | 'permit_release'
  | 'partner_booking'
  | 'safari_deposit'
  | 'expedition_reward';

export type WalletPaymentRail =
  | 'Visa / Mastercard'
  | 'MTN Mobile Money Uganda'
  | 'Airtel Money Uganda'
  | 'International Bank Wire'
  | 'Bank Account Transfer'
  | 'Cash Withdrawal at Enganda Agent'
  | 'Enganda Expedition Credit'
  | 'WildLife Expedition Credit';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  title: string;
  subtitle: string;
  amountUSD: number;
  direction: 'credit' | 'debit' | 'escrow_lock' | 'escrow_unlock';
  status: 'completed' | 'escrow_held' | 'refunded';
  paymentRail: WalletPaymentRail;
  referenceCode: string;
  createdAt: string;
  metadata?: {
    permitId?: string;
    partnerSlug?: string;
    experienceSlug?: string;
    itineraryId?: string;
    nights?: number;
    guests?: number;
    trekDate?: string;
    withdrawalChannel?: WithdrawalChannel;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    momoProvider?: string;
    momoNumber?: string;
    agentLocationId?: string;
    agentLocationName?: string;
    cashPickupCode?: string;
    recipientName?: string;
    idDocumentNumber?: string;
  };
}

export interface PermitEscrowHold {
  id: string;
  permitId: string;
  permitName: string;
  park: string;
  guests: number;
  PreferredTrekDate: string;
  amountHeldUSD: number;
  uwaReceiptCode: string;
  status: 'active_escrow' | 'released';
  createdAt: string;
}

export interface PartnerBookingRecord {
  id: string;
  partnerSlug: string;
  partnerName: string;
  partnerCategory: PartnerCategory;
  region: UgandaRegion;
  checkInDate: string;
  nights: number;
  guests: number;
  totalPaidUSD: number;
  voucherCode: string;
  createdAt: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  firstName?: string;
  topics: string[];
  preferredSeason?: string;
  subscribedAt: string;
  rewardClaimed: boolean;
}

export type SafariEssentialCategory =
  | 'gorilla-trekking'
  | 'savannah-game-drive'
  | 'cultural-visits'
  | 'chimpanzee-primate'
  | 'documents-health';

export interface SafariChecklistItem {
  id: string;
  category: SafariEssentialCategory;
  title: string;
  description: string;
  priority: 'essential' | 'recommended' | 'optional';
  weightOrSpec?: string;
  guideTip?: string;
  checked: boolean;
  isCustom?: boolean;
}

export interface SavedSafariChecklist {
  id: string;
  referenceCode: string;
  title: string;
  selectedActivities: SafariEssentialCategory[];
  totalItems: number;
  checkedCount: number;
  checkedItemIds: string[];
  customItems: SafariChecklistItem[];
  notes?: string;
  updatedAt: string;
}

export interface LiveCurrencyRatesPayload {
  base: 'USD';
  rates: Record<Currency, number>;
  updatedAt: string;
  source: 'live_api' | 'entebbe_desk_reference';
}

export type PortalRole = 'client' | 'admin' | 'partner' | 'specialist' | 'staff';

export interface PortalDispatch {
  id: string;
  userId: string;
  authorName: string;
  portalRole: PortalRole;
  category: string;
  title: string;
  region: string;
  status: 'open' | 'in_progress' | 'verified' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  referenceCode: string;
  createdAt: string;
}

export type ShortlistProviderType = 'guide' | 'operator' | 'driver' | 'hotel';

export interface ShortlistedProviderItem {
  id: string;
  userId?: string;
  providerId: string;
  providerSlug: string;
  providerType: ShortlistProviderType;
  providerName: string;
  region: string;
  subtitle: string;
  imageUrl: string;
  licenseBadge: string;
  rateLabel?: string;
  createdAt: string;
}


