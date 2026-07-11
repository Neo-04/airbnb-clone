"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import type { ListingCard } from "@/types";

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  loading: boolean;
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { userId, ready } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load the current user's favourites; refetched whenever the user switches.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.favourites();
      setFavoriteIds(new Set(res.items.map((l: ListingCard) => l.id)));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, userId, refresh]);

  // Add or remove a favourite and keep local state in sync.
  const toggle = useCallback(
    async (id: number) => {
      const wasFavorite = favoriteIds.has(id);
      try {
        if (wasFavorite) {
          await api.removeFavourite(id);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          toast.success("Removed from wishlist");
        } else {
          await api.addFavourite(id);
          setFavoriteIds((prev) => new Set(prev).add(id));
          toast.success("Added to wishlist");
        }
      } catch (err) {
        // Treat a duplicate as already saved instead of an error.
        if (err instanceof ApiError && err.status === 409) {
          setFavoriteIds((prev) => new Set(prev).add(id));
          return;
        }
        toast.error(err instanceof Error ? err.message : "Could not update wishlist");
      }
    },
    [favoriteIds]
  );

  const value: FavoritesContextValue = {
    favoriteIds,
    loading,
    isFavorite: (id) => favoriteIds.has(id),
    toggle,
    refresh,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
