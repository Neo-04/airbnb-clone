import type { BookingQuoteResponse, ListingSummary } from "@/types";

const CHECKOUT_KEY = "checkoutData";

export interface CheckoutData {
  listing: ListingSummary;
  quote: BookingQuoteResponse;
}

// Persist the pending reservation between the listing page and checkout.
export function saveCheckout(data: CheckoutData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
}

// Restore checkout details after navigation.
export function loadCheckout(): CheckoutData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutData;
  } catch {
    return null;
  }
}

export function clearCheckout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_KEY);
}
