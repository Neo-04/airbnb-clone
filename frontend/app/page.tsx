import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";
import { Loading } from "@/components/States";

// useSearchParams needs a Suspense boundary in the App Router.
export default function HomePage() {
  return (
    <Suspense fallback={<Loading label="Loading stays..." />}>
      <HomeClient />
    </Suspense>
  );
}
