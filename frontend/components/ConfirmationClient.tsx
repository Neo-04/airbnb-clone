"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatMoney, formatRange } from "@/lib/format";
import { useUser } from "@/lib/user-context";
import type { BookingDetail } from "@/types";
import { Loading, ErrorState } from "@/components/States";

export function ConfirmationClient({ id }: { id: string }) {
  const { ready } = useUser();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wait for the user context so X-User-Id is available.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    api
      .getBooking(id)
      .then((res) => active && setBooking(res))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, ready]);

  if (loading) return <Loading label="Loading confirmation..." />;
  if (error || !booking) return <ErrorState message={error ?? "Booking not found"} />;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <h1 className="page-title" style={{ marginTop: 8 }}>
        Booking confirmed
      </h1>
      <p className="muted">Your reservation #{booking.id} is all set.</p>

      <div className="panel" style={{ textAlign: "left", marginTop: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{booking.listing.title}</div>
        <div className="muted">
          {booking.listing.city}, {booking.listing.country}
        </div>
        <div className="breakdown" style={{ marginTop: 12 }}>
          <div className="breakdown-row">
            <span>Dates</span>
            <span>{formatRange(booking.check_in, booking.check_out)}</span>
          </div>
          <div className="breakdown-row">
            <span>Guests</span>
            <span>{booking.guest_count}</span>
          </div>
          <div className="breakdown-row">
            <span>Nights</span>
            <span>{booking.number_of_nights}</span>
          </div>
          <div className="breakdown-total">
            <span>Total paid</span>
            <span>{formatMoney(booking.total_price)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <Link href="/trips" className="btn btn-primary">
          View my trips
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
