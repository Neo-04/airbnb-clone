"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { clearCheckout, loadCheckout, type CheckoutData } from "@/lib/checkout";
import { formatMoney, formatRange } from "@/lib/format";
import { useUser } from "@/lib/user-context";
import { SmartImage } from "@/components/SmartImage";
import { EmptyState, Loading } from "@/components/States";

export default function CheckoutPage() {
  const router = useRouter();
  const { ready } = useUser();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Restore the pending reservation saved on the listing page.
  useEffect(() => {
    setData(loadCheckout());
    setHydrated(true);
  }, []);

  // Create the booking with the current mock user, then confirm.
  const confirm = async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        listing_id: data.listing.id,
        check_in: data.quote.check_in,
        check_out: data.quote.check_out,
        guest_count: data.quote.guest_count,
      });
      clearCheckout();
      toast.success("Booking confirmed!");
      router.push(`/booking-confirmation/${booking.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) toast.error("These dates are no longer available.");
        else if (err.status === 401) toast.error("Select a user before booking.");
        else if (err.status === 403) toast.error("You can't book this listing.");
        else toast.error(err.message);
      } else {
        toast.error("Network error. Please try again.");
      }
      setSubmitting(false);
    }
  };

  if (!hydrated || !ready) return <Loading label="Loading checkout..." />;

  if (!data) {
    return (
      <EmptyState
        title="Nothing to check out"
        message="Start by choosing a stay and selecting your dates."
        action={
          <Link href="/" className="btn btn-primary">
            Browse stays
          </Link>
        }
      />
    );
  }

  const { listing, quote } = data;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 className="page-title">Confirm and pay</h1>

      <div className="panel" style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <SmartImage
          src={listing.cover_image}
          alt={listing.title}
          className="card-image"
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{listing.title}</div>
          <div className="muted">
            {listing.city}, {listing.country}
          </div>
          <div style={{ marginTop: 8 }}>{formatRange(quote.check_in, quote.check_out)}</div>
          <div className="muted">
            {quote.guest_count} {quote.guest_count === 1 ? "guest" : "guests"} ·{" "}
            {quote.number_of_nights} {quote.number_of_nights === 1 ? "night" : "nights"}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Price details</h2>
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
          <span>Total (INR)</span>
          <span>{formatMoney(quote.total_price)}</span>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Payment</h2>
        {/* Mock payment only — no real card details are collected or stored. */}
        <div className="pay-box">
          This is a demo checkout. No real payment is processed and no card details are stored.
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={confirm} disabled={submitting}>
        {submitting ? "Confirming..." : `Confirm booking · ${formatMoney(quote.total_price)}`}
      </button>
    </div>
  );
}
