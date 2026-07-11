"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { useFavorites } from "@/lib/favorites-context";
import type { ListingCard as ListingCardType } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { Loading, ErrorState, EmptyState } from "@/components/States";

export default function WishlistPage() {
  const { ready, userId } = useUser();
  const { isFavorite } = useFavorites();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favourite listing cards for the current user.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    setError(null);
    api
      .favourites()
      .then((res) => active && setListings(res.items))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ready, userId]);

  if (loading) return <Loading label="Loading your wishlist..." />;
  if (error) return <ErrorState message={error} />;

  // Removals reflect instantly by filtering against the favourites state.
  const visible = listings.filter((l) => isFavorite(l.id));

  if (visible.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        message="Tap the heart on any stay to save it here."
        action={
          <Link href="/" className="btn btn-primary">
            Find a stay
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="page-title">Wishlist</h1>
      <div className="grid">
        {visible.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
