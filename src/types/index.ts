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

export interface ConfirmedPackageEvent {
  id: string;
  title: string;
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
  summary: string;
  amenities: string[];
  sustainabilityNote: string;
  recommendedGuideSlugs: string[];
  featured: boolean;
  verifiedPartnerBadge: string;
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
  | 'Enganda Expedition Credit';

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



