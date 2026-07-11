"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import type { ListingWrite } from "@/types";
import { HostOnly } from "@/components/HostOnly";
import { ListingForm } from "@/components/ListingForm";
import { Loading, ErrorState } from "@/components/States";

function EditListing({ id }: { id: string }) {
  const router = useRouter();
  const { ready } = useUser();
  const [initial, setInitial] = useState<ListingWrite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill the form from the public listing detail endpoint.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    api
      .getListing(id)
      .then((l) => {
        if (!active) return;
        setInitial({
          title: l.title,
          description: l.description,
          city: l.city,
          country: l.country,
          address: l.address,
          latitude: l.latitude,
          longitude: l.longitude,
          price_per_night: l.price_per_night,
          cleaning_fee: l.cleaning_fee,
          property_type: l.property_type,
          max_guests: l.max_guests,
          bedrooms: l.bedrooms,
          beds: l.beds,
          bathrooms: l.bathrooms,
          amenities: l.amenities.map((a) => a.name),
          image_urls: [...l.images]
            .sort((a, b) => a.display_order - b.display_order)
            .map((img) => img.image_url),
        });
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, ready]);

  // Submit the update; ownership is enforced by the backend.
  const submit = async (values: ListingWrite) => {
    setSubmitting(true);
    try {
      await api.updateListing(id, values);
      toast.success("Listing updated");
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update listing");
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Loading listing..." />;
  if (error || !initial) return <ErrorState message={error ?? "Listing not found"} />;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 className="page-title">Edit listing</h1>
      <ListingForm
        initial={initial}
        submitting={submitting}
        submitLabel="Save changes"
        onSubmit={submit}
      />
    </div>
  );
}

export function EditListingClient({ id }: { id: string }) {
  return (
    <HostOnly>
      <EditListing id={id} />
    </HostOnly>
  );
}
