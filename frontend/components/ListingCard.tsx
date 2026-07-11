"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { formatMoney } from "@/lib/format";
import type { ListingCard as ListingCardType } from "@/types";
import { SmartImage } from "./SmartImage";
import { HeartButton, Rating } from "./Badges";

// Shared property card. The heart toggles favourites without navigating.
export function ListingCard({ listing }: { listing: ListingCardType }) {
  const { isFavorite, toggle } = useFavorites();

  return (
    <Link href={`/listings/${listing.id}`} className="card">
      <div className="card-image-wrap">
        <HeartButton active={isFavorite(listing.id)} onClick={() => toggle(listing.id)} />
        <SmartImage src={listing.cover_image} alt={listing.title} className="card-image" />
      </div>

      <div className="card-title-row">
        <span className="card-title">{listing.title}</span>
        <Rating rating={listing.rating} count={listing.review_count} />
      </div>

      <div className="card-sub">
        {listing.city}, {listing.country}
      </div>
      <div className="card-sub">{listing.property_type}</div>

      <div className="card-price">
        {formatMoney(listing.price_per_night)} <span className="muted">/ night</span>
      </div>
    </Link>
  );
}
