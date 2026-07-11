"use client";

import { useUser } from "@/lib/user-context";

// Development-only switcher to change the active mock user.
export function UserSwitcher() {
  const { userId, users, setUserId, user } = useUser();

  return (
    <div className="stack" style={{ gap: 2 }}>
      <select
        className="select"
        style={{ padding: "6px 10px", fontSize: 14, maxWidth: 220 }}
        value={userId}
        onChange={(e) => setUserId(Number(e.target.value))}
        aria-label="Switch mock user"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
      <span className="muted" style={{ fontSize: 12 }}>
        Signed in as {user.name}
      </span>
    </div>
  );
}
