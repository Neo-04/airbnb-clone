"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useUser } from "@/lib/user-context";
import { Loading, EmptyState } from "./States";

// Restrict host pages to host accounts; guests get a clear message.
export function HostOnly({ children }: { children: ReactNode }) {
  const { ready, isHost } = useUser();

  if (!ready) return <Loading />;

  if (!isHost) {
    return (
      <EmptyState
        title="Host access only"
        message="Switch to a host account (Priya, Rahul, or Neha) to manage listings."
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
