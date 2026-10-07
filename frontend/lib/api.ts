import type {
  AuthResponse,
  AuthUser,
  AvailabilityResponse,
  BookingDetail,
  BookingQuoteRequest,
  BookingQuoteResponse,
  FavouritesResponse,
  HostBookingsResponse,
  HostListing,
  HostStats,
  ListingCard,
  ListingDetail,
  ListingListResponse,
  ListingWrite,
  MyTripsResponse,
  Role,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "authToken";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Read the JWT token saved by the user context (browser only).
function storedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Turn a FastAPI error body into a readable message.
function parseError(status: number, data: unknown): ApiError {
  let message = "Something went wrong";
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : ""))
        .filter(Boolean)
        .join(", ") || message;
    }
  }
  return new ApiError(status, message);
}

interface RequestOptions {
  auth?: boolean;
  body?: unknown;
  /** Override the token (used by getMe before context is ready). */
  token?: string;
}

// Single fetch wrapper used by every typed endpoint below.
async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  // Attach the Bearer token on protected routes.
  if (opts.auth) {
    const t = opts.token ?? storedToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  // 204 responses (e.g. delete) have no body.
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw parseError(res.status, data);
  return data as T;
}

// Build a query string from only the params that have a value.
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  // Auth
  signup: (name: string, email: string, password: string, role: Role) =>
    request<AuthResponse>("POST", "/api/auth/signup", {
      body: { name, email, password, role },
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("POST", "/api/auth/login", {
      body: { email, password },
    }),
  getMe: (token?: string) =>
    request<AuthUser>("GET", "/api/auth/me", { auth: true, token }),

  // Listings
  searchListings: (query: string) =>
    request<ListingListResponse>("GET", `/api/listings${query}`),
  getListing: (id: number | string) =>
    request<ListingDetail>("GET", `/api/listings/${id}`),
  getAvailability: (id: number | string) =>
    request<AvailabilityResponse>("GET", `/api/listings/${id}/availability`),

  // Bookings
  quote: (body: BookingQuoteRequest) =>
    request<BookingQuoteResponse>("POST", "/api/bookings/quote", { body }),
  createBooking: (body: BookingQuoteRequest) =>
    request<BookingDetail>("POST", "/api/bookings", { body, auth: true }),
  myTrips: () => request<MyTripsResponse>("GET", "/api/bookings/me", { auth: true }),
  getBooking: (id: number | string) =>
    request<BookingDetail>("GET", `/api/bookings/${id}`, { auth: true }),

  // Host
  hostListings: () => request<HostListing[]>("GET", "/api/host/listings", { auth: true }),
  createListing: (body: ListingWrite) =>
    request<HostListing>("POST", "/api/host/listings", { body, auth: true }),
  updateListing: (id: number | string, body: ListingWrite) =>
    request<HostListing>("PUT", `/api/host/listings/${id}`, { body, auth: true }),
  deleteListing: (id: number | string) =>
    request<void>("DELETE", `/api/host/listings/${id}`, { auth: true }),
  hostBookings: () => request<HostBookingsResponse>("GET", "/api/host/bookings", { auth: true }),
  hostStats: () => request<HostStats>("GET", "/api/host/stats", { auth: true }),

  // Favourites
  favourites: () => request<FavouritesResponse>("GET", "/api/favourites", { auth: true }),
  addFavourite: (id: number) =>
    request<ListingCard>("POST", `/api/favourites/${id}`, { auth: true }),
  removeFavourite: (id: number) =>
    request<{ detail: string }>("DELETE", `/api/favourites/${id}`, { auth: true }),
};
