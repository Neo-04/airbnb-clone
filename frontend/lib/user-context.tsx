"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_USER_ID, MOCK_USERS, type MockUser } from "@/lib/constants";

const USER_KEY = "currentUserId";

interface UserContextValue {
  user: MockUser;
  userId: number;
  users: MockUser[];
  isHost: boolean;
  ready: boolean;
  setUserId: (id: number) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

function resolveUser(id: number): MockUser {
  return MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[0];
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setId] = useState<number>(DEFAULT_USER_ID);
  const [ready, setReady] = useState(false);

  // Restore the selected user after a page refresh.
  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY);
    const parsed = saved ? Number(saved) : DEFAULT_USER_ID;
    const valid = MOCK_USERS.some((u) => u.id === parsed) ? parsed : DEFAULT_USER_ID;
    localStorage.setItem(USER_KEY, String(valid));
    setId(valid);
    setReady(true);
  }, []);

  const setUserId = (id: number) => {
    localStorage.setItem(USER_KEY, String(id));
    setId(id);
  };

  const user = resolveUser(userId);
  const value: UserContextValue = {
    user,
    userId,
    users: MOCK_USERS,
    isHost: user.role === "host",
    ready,
    setUserId,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
