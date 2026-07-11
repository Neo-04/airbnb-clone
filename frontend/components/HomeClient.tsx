"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, buildQuery } from "@/lib/api";
import type { ListingListResponse } from "@/types";
import { ListingCard } from "./ListingCard";
import { SearchBar, type SearchValues } from "./SearchBar";
import { CategoryRow } from "./CategoryRow";
import { Filters, type FilterValues } from "./Filters";
import { Pagination } from "./Pagination";
import { Loading, ErrorState, EmptyState } from "./States";

const PAGE_SIZE = 12;

export function HomeClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<ListingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback((key: string) => params.get(key) ?? "", [params]);

  // Merge changes into the URL so search state survives refresh and sharing.
  const updateParams = useCallback(
    (patch: Record<string, string | undefined>, keepPage = false) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!keepPage) next.delete("page");
      router.push(`/?${next.toString()}`);
    },
    [params, router]
  );

  // Fetch listings whenever the URL params change.
  useEffect(() => {
    const location = get("location");
    const checkIn = get("check_in");
    const checkOut = get("check_out");
    const guests = get("guests");
    const minPrice = get("min_price");
    const maxPrice = get("max_price");
    const propertyType = get("property_type");
    const amenities = get("amenities");
    const page = get("page") || "1";

    // The backend requires both dates together, so only send them as a pair.
    const bothDates = checkIn && checkOut;

    const query = buildQuery({
      location: location || undefined,
      check_in: bothDates ? checkIn : undefined,
      check_out: bothDates ? checkOut : undefined,
      guests: guests || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      property_type: propertyType || undefined,
      amenities: amenities || undefined,
      page,
      page_size: String(PAGE_SIZE),
    });

    let active = true;
    setLoading(true);
    setError(null);
    api
      .searchListings(query)
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [params, get]);

  const searchValues: SearchValues = {
    location: get("location"),
    check_in: get("check_in"),
    check_out: get("check_out"),
    guests: get("guests"),
  };

  const filterValues: FilterValues = {
    min_price: get("min_price"),
    max_price: get("max_price"),
    amenities: get("amenities") ? get("amenities").split(",") : [],
  };

  const onSearch = (v: SearchValues) =>
    updateParams({
      location: v.location,
      check_in: v.check_in,
      check_out: v.check_out,
      guests: v.guests,
    });

  const onApplyFilters = (v: FilterValues) =>
    updateParams({
      min_price: v.min_price,
      max_price: v.max_price,
      amenities: v.amenities.join(","),
    });

  const onClearFilters = () =>
    updateParams({ min_price: undefined, max_price: undefined, amenities: undefined });

  return (
    <div>
      <SearchBar initial={searchValues} onSearch={onSearch} />

      <CategoryRow
        active={get("property_type")}
        onSelect={(type) => updateParams({ property_type: type || undefined })}
      />

      <Filters initial={filterValues} onApply={onApplyFilters} onClear={onClearFilters} />

      {loading && <Loading label="Finding stays..." />}

      {!loading && error && <ErrorState message={error} onRetry={() => router.refresh()} />}

      {!loading && !error && data && data.items.length === 0 && (
        <EmptyState
          title="No stays match your search"
          message="Try widening your dates, price range, or filters."
        />
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="grid">
            {data.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {/* Preserve active search and filters while changing pages. */}
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onChange={(p) => updateParams({ page: String(p) }, true)}
          />
        </>
      )}
    </div>
  );
}
