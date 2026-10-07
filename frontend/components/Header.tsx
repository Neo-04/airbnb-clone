"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { AuthModal } from "./AuthModal";

export function Header() {
  const { isAuthenticated, isHost, user, logout } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            StayFinder
          </Link>

          <nav className="nav">
            <Link href="/" className="nav-link">
              <span className="nav-text">Explore</span>
            </Link>
            {isAuthenticated && (
              <>
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
              </>
            )}
          </nav>

          {isAuthenticated ? (
            <div className="stack" style={{ gap: 2, alignItems: "flex-end" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</span>
              <button
                className="btn btn-sm btn-outline"
                onClick={logout}
                style={{ fontSize: 13, padding: "4px 10px" }}
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAuth(true)}
            >
              Log in
            </button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
