"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useUser } from "@/lib/user-context";
import { Loading, EmptyState } from "./States";

// Restrict host pages to host accounts; unauthenticated users and guests get a clear message.
export function HostOnly({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated, isHost } = useUser();

  if (!ready) return <Loading />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Please log in"
        message="You need to log in to access host features."
        action={
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      />
    );
  }

  if (!isHost) {
    return (
      <EmptyState
        title="Host access only"
        message="This area is for host accounts. Sign up as a host to manage listings."
        action={
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
