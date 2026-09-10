export type Country = 'Tanzania' | 'Uganda' | 'Rwanda' | 'Kenya' | 'Cross-Border';
export type DestinationCountry = Country;

export type SafariStyle = 
  | 'Gorilla Trekking'
  | 'Great Migration'
  | 'Big Five Safari'
  | 'Photography Expedition'
  | 'Birding & Naturalist'
  | 'Fly-In Luxury Circuit'
  | 'Cross-Border Overland';

export type BudgetTier = 'Mid-Range' | 'Luxury' | 'Signature / Ultra-Luxe';

export interface DayPlan {
  day: number;
  dayNumber?: number;
  title: string;
  location: string;
  description: string;
  accommodation: string;
  mealPlan: string; // e.g. 'Full Board (B, L, D)'
  meals?: string;
  driveDistance?: string;
  wildlifeHighlights?: string[];
  activities: string[];
  transferTime?: string;
}

export interface PriceBandDetail {
  perPersonDouble: number;
  perPersonDay: number;
  description: string;
  lodgesPreview?: string[];
}

export interface PriceBands {
  midRange: PriceBandDetail;
  luxury: PriceBandDetail;
  signature: PriceBandDetail;
}

export interface Itinerary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  country: Country;
  countries: Country[];
  durationDays: number;
  days?: DayPlan[];
  featured: boolean;
  heroImage: string;
  galleryImages: string[];
  overview: string;
  highlights: string[];
  startingPricePerDayUSD: number;
  priceBands: PriceBands;
  dayByDay: DayPlan[];
  inclusions: string[];
  exclusions: string[];
  lodges: {
    name: string;
    type: string;
    location: string;
    image?: string;
  }[];
  vehicleInfo: string;
  guideLanguages: string[];
  bestTimeToTravel: string;
  gorillaPermitRequired: boolean;
  permitDetails?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface GroundPartner {
  id: string;
  name: string;
  partnerName?: string;
  country: 'Uganda' | 'Kenya' | 'Tanzania';
  licenseNumber: string;
  accreditation: string; // e.g. 'AUTO Member #294, UWA Licensed Operator'
  accreditationBody?: string;
  badgeUrl?: string;
  operatingSince?: number;
  serviceAreas?: string[];
  fleetSpecs: string;
  emergencyProtocols?: string;
  insuranceSpecs?: string;
  guideCredentials?: string;
  headquarters?: string;
  contactPerson?: string;
  vettingDate?: string;
  accountabilityGuarantee?: string;
  verified?: boolean;
  notes?: string;
}

export interface PermitFact {
  id: string;
  parkOrPermit?: string;
  parkName?: string;
  permitType?: string;
  authority?: string;
  country: Country;
  costUSD: number;
  validityDetails?: string;
  advanceBookingMonths?: number;
  minimumAge?: number;
  dailyPermitLimit?: number;
  cancellationPolicy?: string;
  notes?: string;
  governmentBody?: string;
  lastVerified?: string;
}

export interface Review {
  id: string;
  author?: string;
  guestName?: string;
  location?: string;
  rating: number; // 1-5
  date?: string;
  title?: string;
  tripTitle?: string;
  content?: string;
  comment?: string;
  safariType?: SafariStyle;
  country: Country | string;
  itineraryName?: string;
  budgetTier?: string;
  tripMonthYear?: string;
  verifiedGuest?: boolean;
  verified?: boolean;
  source?: 'Direct Guest' | 'TripAdvisor' | 'SafariBookings' | string;
  avatar?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'quote_sent' | 'deposit_paid' | 'closed_won' | 'closed_lost' | 'abandoned';

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  stepReached?: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsappOptIn?: boolean;
  preferredLanguage?: string;
  countries?: Country[] | string[];
  travelDates?: string;
  targetDates?: string;
  durationDays?: number;
  travelersCount?: number;
  travelerType?: 'couple' | 'family' | 'private_group' | 'solo';
  budgetBand?: BudgetTier | string;
  interests?: string[];
  notes?: string;
  source: 'trip_planner' | 'whatsapp' | 'agent_concierge' | 'contact_page' | 'web_chat' | 'assistant_tool' | string;
  assignedTo?: string;
  wabaConversationId?: string;
  depositAmountUSD?: number;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: any[];
}

export interface ChatSession {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  channel?: string;
  language?: string;
  startedAt?: string;
  lastActive?: string;
  userLanguage?: string;
  messages: ChatMessage[];
  leadId?: string;
  handoffRequested?: boolean;
  handoffReason?: string;
  status?: 'active' | 'paused_for_human' | 'closed';
}

export interface WABAMessage {
  id: string;
  waId: string;
  fromName?: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'template' | 'interactive' | 'location';
  body: string;
  timestamp: string;
  templateName?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WABATemplate {
  name: string;
  category: 'UTILITY' | 'MARKETING';
  language: string;
  header?: string;
  body: string;
  footer?: string;
  buttons?: { type: 'QUICK_REPLY' | 'URL'; text: string; value?: string }[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  rateAgainstUSD: number; // USD = 1
}

export type LanguageCode = 'en' | 'fr' | 'de' | 'es' | 'it';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  languages: string[];
  specialties: string[];
  bio: string;
  photo: string;
}
