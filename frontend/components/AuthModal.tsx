"use client";

import { useState, type FormEvent } from "react";
import { useUser } from "@/lib/user-context";
import { ApiError } from "@/lib/api";
import type { Role } from "@/types";

type Tab = "login" | "signup";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, signup } = useUser();
  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("guest");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("guest");
    setError(null);
  };

  const switchTab = (t: Tab) => {
    reset();
    setTab(t);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password, role);
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => switchTab("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div className="field">
              <label>Name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "signup" ? "At least 6 characters" : "Your password"}
              required
              minLength={tab === "signup" ? 6 : undefined}
            />
          </div>

          {tab === "signup" && (
            <div className="field">
              <label>I want to</label>
              <div className="row" style={{ gap: 12 }}>
                <label
                  className={`chip ${role === "guest" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={role === "guest"}
                    onChange={() => setRole("guest")}
                    style={{ display: "none" }}
                  />
                  🏠 Book stays
                </label>
                <label
                  className={`chip ${role === "host" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={role === "host"}
                    onChange={() => setRole("host")}
                    style={{ display: "none" }}
                  />
                  🔑 Host my place
                </label>
              </div>
            </div>
          )}

          {error && <p className="field-error">{error}</p>}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading
              ? "Please wait..."
              : tab === "login"
              ? "Log in"
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
