"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatMoney, formatRange } from "@/lib/format";
import { useUser } from "@/lib/user-context";
import type { BookingListItem } from "@/types";
import { SmartImage } from "@/components/SmartImage";
import { StatusBadge } from "@/components/Badges";
import { Loading, ErrorState, EmptyState } from "@/components/States";

function TripCard({ trip }: { trip: BookingListItem }) {
  return (
    <div className="trip">
      <SmartImage src={trip.listing.cover_image} alt={trip.listing.title} />
      <div className="trip-body">
        <div style={{ fontWeight: 700, fontSize: 17 }}>{trip.listing.title}</div>
        <div className="muted">
          {trip.listing.city}, {trip.listing.country}
        </div>
        <div style={{ marginTop: 6 }}>{formatRange(trip.check_in, trip.check_out)}</div>
        <div className="muted">
          {trip.guest_count} {trip.guest_count === 1 ? "guest" : "guests"} · {trip.number_of_nights}{" "}
          {trip.number_of_nights === 1 ? "night" : "nights"}
        </div>
      </div>
      <div className="trip-side">
        <StatusBadge status={trip.status} />
        <div style={{ fontWeight: 700, marginTop: 8 }}>{formatMoney(trip.total_price)}</div>
        <Link href={`/listings/${trip.listing.id}`} className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
          View stay
        </Link>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const { ready, userId } = useUser();
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the current user's bookings once the user context is ready.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    setError(null);
    api
      .myTrips()
      .then((res) => active && setItems(res.items))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ready, userId]);

  if (loading) return <Loading label="Loading your trips..." />;
  if (error) return <ErrorState message={error} />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="No trips yet"
        message="When you book a stay, it will show up here."
        action={
          <Link href="/" className="btn btn-primary">
            Start exploring
          </Link>
        }
      />
    );
  }

  const upcoming = items.filter((t) => t.trip_type === "upcoming");
  const current = items.filter((t) => t.trip_type === "current");
  const past = items.filter((t) => t.trip_type === "past");

  return (
    <div>
      <h1 className="page-title">My Trips</h1>

      {current.length > 0 && (
        <>
          <h2 className="section-title">Currently staying</h2>
          {current.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="section-title">Upcoming</h2>
          {upcoming.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Previous</h2>
          {past.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </>
      )}
    </div>
  );
}
