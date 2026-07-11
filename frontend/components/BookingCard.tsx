"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatMoney, todayISO, overlapsUnavailable } from "@/lib/format";
import type { BookingQuoteResponse, DateRange, ListingDetail } from "@/types";
import { saveCheckout } from "@/lib/checkout";

// Booking widget: pick dates/guests, fetch the authoritative quote, then reserve.
export function BookingCard({
  listing,
  unavailable,
}: {
  listing: ListingDetail;
  unavailable: DateRange[];
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const datesChosen = Boolean(checkIn && checkOut);
  const invalidOrder = datesChosen && checkIn >= checkOut;
  const hitsUnavailable = overlapsUnavailable(checkIn, checkOut, unavailable);

  // Ask the backend for the final price; it stays the source of truth.
  const getQuote = async () => {
    if (!datesChosen) {
      toast.error("Select check-in and check-out dates");
      return;
    }
    if (invalidOrder) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setLoading(true);
    setQuote(null);
    try {
      const res = await api.quote({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
      });
      setQuote(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not get a quote");
    } finally {
      setLoading(false);
    }
  };

  // Stash the selection + quote, then move to checkout without booking yet.
  const reserve = () => {
    if (!quote) return;
    saveCheckout({
      listing: {
        id: listing.id,
        title: listing.title,
        city: listing.city,
        country: listing.country,
        cover_image: listing.images[0]?.image_url ?? null,
      },
      quote,
    });
    router.push("/checkout");
  };

  return (
    <aside className="booking-card">
      <div className="price-lead">
        {formatMoney(listing.price_per_night)} <span className="muted">/ night</span>
      </div>

      <div className="date-grid">
        <div className="field">
          <label>Check in</label>
          <input
            className="input"
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setQuote(null);
            }}
          />
        </div>
        <div className="field">
          <label>Check out</label>
          <input
            className="input"
            type="date"
            min={checkIn || todayISO()}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setQuote(null);
            }}
          />
        </div>
      </div>

      <div className="field">
        <label>Guests</label>
        <select
          className="select"
          value={guests}
          onChange={(e) => {
            setGuests(Number(e.target.value));
            setQuote(null);
          }}
        >
          {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Warn early, but the backend quote is still the final authority. */}
      {hitsUnavailable && (
        <div className="warn">Some of these dates are already booked. Try different dates.</div>
      )}
      {invalidOrder && <div className="warn">Check-out must be after check-in.</div>}

      {!quote ? (
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 12 }}
          onClick={getQuote}
          disabled={loading || !datesChosen || invalidOrder || hitsUnavailable}
        >
          {loading ? "Checking..." : "Check price"}
        </button>
      ) : (
        <>
          <div className="breakdown">
            <div className="breakdown-row">
              <span>
                {formatMoney(quote.nightly_rate)} × {quote.number_of_nights}{" "}
                {quote.number_of_nights === 1 ? "night" : "nights"}
              </span>
              <span>{formatMoney(quote.subtotal)}</span>
            </div>
            <div className="breakdown-row">
              <span>Cleaning fee</span>
              <span>{formatMoney(quote.cleaning_fee)}</span>
            </div>
            <div className="breakdown-row">
              <span>Service fee</span>
              <span>{formatMoney(quote.service_fee)}</span>
            </div>
            <div className="breakdown-total">
              <span>Total</span>
              <span>{formatMoney(quote.total_price)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={reserve}>
            Reserve
          </button>
          <button
            className="btn btn-outline btn-block btn-sm"
            style={{ marginTop: 8 }}
            onClick={getQuote}
            disabled={loading}
          >
            Update price
          </button>
        </>
      )}
    </aside>
  );
}
