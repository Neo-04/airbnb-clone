"use client";

import { formatDate } from "@/lib/format";
import type { Review } from "@/types";
import { SmartImage } from "./SmartImage";
import { Rating } from "./Badges";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet.</p>;
  }
  return (
    <div>
      {reviews.map((r) => (
        <div key={r.id} className="review">
          <div className="review-head">
            <SmartImage src={r.reviewer_avatar} alt={r.reviewer_name} className="avatar" />
            <div>
              <div style={{ fontWeight: 600 }}>{r.reviewer_name}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {formatDate(r.created_at.slice(0, 10))}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Rating rating={r.rating} />
            </div>
          </div>
          <p style={{ margin: 0 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

// Static placeholder standing in for a real interactive map.
export function MapPlaceholder({ city, country }: { city: string; country: string }) {
  return (
    <div className="map-placeholder">
      📍 {city}, {country} — map preview
    </div>
  );
}
