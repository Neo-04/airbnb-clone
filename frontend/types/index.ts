// Types mirror the FastAPI backend response and request schemas.

export type Role = "guest" | "host";

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price_per_night: number;
  cleaning_fee: number;
  rating: number;
  review_count: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  cover_image: string | null;
  amenities: string[];
}

export interface ListingListResponse {
  items: ListingCard[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface HostPublic {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface ListingImage {
  id: number;
  image_url: string;
  display_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
}

export interface DateRange {
  check_in: string;
  check_out: string;
}

export interface ListingDetail {
  id: number;
  host: HostPublic;
  title: string;
  description: string;
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
  unavailable_ranges: DateRange[];
}

export interface AvailabilityResponse {
  listing_id: number;
  unavailable_ranges: DateRange[];
}

export interface BookingQuoteRequest {
  listing_id: number;
  check_in: string;
  check_out: string;
  guest_count: number;
}

export interface BookingQuoteResponse {
  listing_id: number;
  check_in: string;
  check_out: string;
  guest_count: number;
  number_of_nights: number;
  nightly_rate: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  available: boolean;
}

export interface ListingSummary {
  id: number;
  title: string;
  city: string;
  country: string;
  cover_image: string | null;
}

export interface GuestSummary {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface BookingDetail {
  id: number;
  status: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  number_of_nights: number;
  nightly_rate: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  created_at: string;
  listing: ListingSummary;
  guest: GuestSummary;
}

export interface BookingListItem {
  id: number;
  status: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  number_of_nights: number;
  total_price: number;
  trip_type: "upcoming" | "current" | "past";
  listing: ListingSummary;
}

export interface MyTripsResponse {
  items: BookingListItem[];
}

export interface HostImage {
  image_url: string;
  display_order: number;
}

export interface HostListing {
  id: number;
  host_id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  cleaning_fee: number;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  images: HostImage[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface HostBookingItem {
  id: number;
  status: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  number_of_nights: number;
  total_price: number;
  listing: ListingSummary;
  guest: GuestSummary;
}

export interface HostBookingsResponse {
  items: HostBookingItem[];
}

export interface HostStats {
  total_listings: number;
  total_bookings: number;
  upcoming_bookings: number;
  total_confirmed_revenue: number;
}

export interface FavouritesResponse {
  items: ListingCard[];
}

// Request body for creating/updating a listing.
export interface ListingWrite {
  title: string;
  description: string;
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  cleaning_fee: number;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  image_urls: string[];
}
