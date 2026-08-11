export type PropertyType = 'tent' | 'glamping' | 'rv' | 'cabin' | 'other';

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

export type UserType = 'client' | 'host' | 'admin';

export type HostTier = 'free' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  userType?: UserType; // 'client' | 'host' | 'admin'
  isAdmin: boolean;
  isSuperhost?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  verifiedPhone?: string;
  verifiedEmail?: string;
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
  primaryPassword?: string;
}

export interface Host {
  id: string;
  name: string;
  avatar: string;
  isSuperhost: boolean;
  joinedDate: string;
  responseRate: string;
  bio: string;
  phone?: string;
  email?: string;
  tier?: HostTier;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface Review {
  id: string;
  campsiteId?: string;
  bookingId?: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
  verifiedStay?: boolean;
  disputed?: boolean;
  disputeReason?: string;
  disputeCategory?: 'profanity' | 'hate_speech' | 'no_show' | 'other_violation';
  disputeStatus?: 'none' | 'pending_admin' | 'dismissed' | 'removed_violation';
  disputeDate?: string;
}

export interface Amenity {
  id: string;
  name: string;
  iconName: string; // Lucide icon name mapping
  category: 'essentials' | 'hookups' | 'activities' | 'rules';
}

export interface ICalSyncFeed {
  id: string;
  name: string;
  url: string;
  lastSynced?: string;
  itemCount?: number;
}

export interface ImportedCalendarEvent {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  summary: string;
  source?: string; // e.g. "Airbnb", "Booking.com", "Manual iCal"
  uid?: string;
}

export interface Campsite {
  id: string;
  title: string;
  description: string;
  location: string;
  region: string;
  addressLine?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  arrivalInstructions?: string;
  pricePerNight: number;
  hasCleaningFee?: boolean;
  cleaningFee?: number;
  rating: number;
  reviewCount: number;
  propertyType: PropertyType;
  maxGuests: number;
  rvMaxLengthFt?: number;
  images: string[];
  host: Host;
  amenities: string[]; // List of amenity IDs or names
  cancellationPolicy: CancellationPolicy;
  terrainType: string;
  featured: boolean;
  blockedDates: string[]; // ISO date strings YYYY-MM-DD
  customPrices?: Record<string, number>; // YYYY-MM-DD -> price override
  icalSyncUrls?: ICalSyncFeed[];
  importedEvents?: ImportedCalendarEvent[];
  icalExportToken?: string;
  reviews: Review[];
  rules: string[];
  status?: 'approved' | 'pending' | 'rejected';
  isPro?: boolean;
  videoUrl?: string;
  stats?: {
    views: number;
    wishlistCount: number;
    searchImpressions: number;
  };
}

export interface Booking {
  id: string;
  campsiteId: string;
  campsiteTitle: string;
  campsiteImage: string;
  location: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNote?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestsCount: number;
  totalNights: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  bookingSubtotal?: number;
  platformFeeCents?: number;
  platformFeeEur?: number;
  feePercentage?: number;
  hostPayoutAmount?: number;
  stripePaymentStatus?: 'unpaid' | 'succeeded_escrow_held' | 'payout_released' | 'refunded';
  escrowStatus?: 'held_in_escrow' | 'payout_released_to_host' | 'refunded_to_guest';
  paymentMethodType?: 'card' | 'apple_pay' | 'google_pay';
  stripePaymentIntentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  propertyType: PropertyType;
  visitConfirmedByGuest?: boolean;
  visitConfirmedAt?: string;
  escrowPayoutReleaseAt?: string;
  arrivalNotificationSent?: boolean;
  arrivalNotificationSentAt?: string;
}

export interface SearchFilters {
  location: string;
  propertyType: PropertyType | 'all';
  checkIn: string;
  checkOut: string;
  guests: number;
  maxPrice: number;
  petFriendly: boolean;
  electricity: boolean;
  nearWater: boolean;
  firePit: boolean;
}

export type ViewState = 'landing' | 'search' | 'detail' | 'host-dashboard' | 'client-dashboard' | 'add-listing' | 'my-trips' | 'pending-requests' | 'admin' | 'rules';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  role: 'client' | 'host' | 'admin';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string; // chat-{campsiteId}-{clientId}
  campsiteId: string;
  campsiteTitle: string;
  campsiteImage?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientAvatar?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  messages: ChatMessage[];
  unreadByHost?: boolean;
  unreadByClient?: boolean;
  unreadByAdmin?: boolean;
}

export const TERRAIN_OPTIONS = [
  'Miškas ir pieva',
  'Upės pakrantė',
  'Ežero pakrantė',
  'Laukymė',
  'Sodas prie Sodybos'
] as const;

export type TerrainOption = typeof TERRAIN_OPTIONS[number];

