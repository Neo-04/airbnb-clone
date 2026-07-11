"use client";

import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { UserSwitcher } from "./UserSwitcher";

export function Header() {
  const { isHost } = useUser();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          StayFinder
        </Link>

        <nav className="nav">
          <Link href="/" className="nav-link">
            <span className="nav-text">Explore</span>
          </Link>
          <Link href="/wishlist" className="nav-link">
            <span className="nav-text">Wishlist</span>
          </Link>
          <Link href="/trips" className="nav-link">
            <span className="nav-text">Trips</span>
          </Link>
          {/* Host navigation only shows for host accounts. */}
          {isHost && (
            <Link href="/host" className="nav-link">
              <span className="nav-text">Host</span>
            </Link>
          )}
        </nav>

        <UserSwitcher />
      </div>
    </header>
  );
}
