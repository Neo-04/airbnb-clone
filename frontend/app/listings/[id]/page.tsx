import { ListingDetailClient } from "@/components/ListingDetailClient";

// Route params are async in the App Router.
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetailClient id={id} />;
}
