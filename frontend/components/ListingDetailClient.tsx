"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AvailabilityResponse, ListingDetail } from "@/types";
import { SmartImage } from "./SmartImage";
import { Gallery } from "./Gallery";
import { BookingCard } from "./BookingCard";
import { ReviewList, MapPlaceholder } from "./ListingExtras";
import { Rating } from "./Badges";
import { Loading, ErrorState } from "./States";

export function ListingDetailClient({ id }: { id: string }) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load listing details and blocked dates together.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([api.getListing(id), api.getAvailability(id)])
      .then(([detail, avail]) => {
        if (!active) return;
        setListing(detail);
        setAvailability(avail);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loading label="Loading stay..." />;
  if (error || !listing) return <ErrorState message={error ?? "Listing not found"} />;

  return (
    <div>
      <div className="detail-header">
        <h1>{listing.title}</h1>
        <div className="detail-meta">
          <Rating rating={listing.rating} count={listing.review_count} />
          <span>·</span>
          <span>
            {listing.city}, {listing.country}
          </span>
          <span>·</span>
          <span>{listing.property_type}</span>
        </div>
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="detail-body">
        <div>
          {/* Host + capacity summary */}
          <div className="section" style={{ borderTop: "none", paddingTop: 0 }}>
            <div className="row-between">
              <div>
                <h2 style={{ marginBottom: 4 }}>Hosted by {listing.host.name}</h2>
                <div className="facts">
                  <span>{listing.max_guests} guests</span>
                  <span>· {listing.bedrooms} bedrooms</span>
                  <span>· {listing.beds} beds</span>
                  <span>· {listing.bathrooms} bathrooms</span>
                </div>
              </div>
              <SmartImage src={listing.host.avatar_url} alt={listing.host.name} className="avatar" />
            </div>
          </div>

          <div className="section">
            <h2>About this place</h2>
            <p>{listing.description}</p>
            {listing.address && <p className="muted">{listing.address}</p>}
          </div>

          <div className="section">
            <h2>What this place offers</h2>
            <div className="amenity-list">
              {listing.amenities.map((a) => (
                <div key={a.id}>• {a.name}</div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Where you'll be</h2>
            <MapPlaceholder city={listing.city} country={listing.country} />
          </div>

          <div className="section">
            <h2>
              Reviews {listing.review_count > 0 && <span className="muted">({listing.review_count})</span>}
            </h2>
            <ReviewList reviews={listing.reviews} />
          </div>
        </div>

        <BookingCard listing={listing} unavailable={availability?.unavailable_ranges ?? []} />
      </div>
    </div>
  );
}
