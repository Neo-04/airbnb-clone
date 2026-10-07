"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { AuthUser, Role } from "@/types";

const TOKEN_KEY = "authToken";

interface UserContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHost: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore session from localStorage on mount.
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setReady(true);
      return;
    }
    // Validate the token by calling /auth/me.
    api
      .getMe(saved)
      .then((u) => {
        setToken(saved);
        setUser(u);
      })
      .catch(() => {
        // Token is invalid or expired — clear it silently.
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, role: Role) => {
      const res = await api.signup(name, email, password, role);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: UserContextValue = {
    user,
    token,
    isAuthenticated: user !== null,
    isHost: user?.role === "host",
    ready,
    login,
    signup,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
