"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { ListingWrite } from "@/types";
import { HostOnly } from "@/components/HostOnly";
import { ListingForm, EMPTY_LISTING } from "@/components/ListingForm";

function NewListing() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Create the listing, then return to the dashboard.
  const submit = async (values: ListingWrite) => {
    setSubmitting(true);
    try {
      await api.createListing(values);
      toast.success("Listing created");
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create listing");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 className="page-title">Create a listing</h1>
      <ListingForm
        initial={EMPTY_LISTING}
        submitting={submitting}
        submitLabel="Create listing"
        onSubmit={submit}
      />
    </div>
  );
}

export default function NewListingPage() {
  return (
    <HostOnly>
      <NewListing />
    </HostOnly>
  );
}
