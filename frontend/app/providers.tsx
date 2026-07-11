"use client";

import { Toaster } from "react-hot-toast";
import { type ReactNode } from "react";
import { UserProvider } from "@/lib/user-context";
import { FavoritesProvider } from "@/lib/favorites-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <FavoritesProvider>
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </FavoritesProvider>
    </UserProvider>
  );
}
