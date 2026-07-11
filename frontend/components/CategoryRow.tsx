"use client";

import { PROPERTY_TYPES } from "@/lib/constants";

// Horizontal property-type selector. Clicking the active one clears it.
export function CategoryRow({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="category-row">
      {PROPERTY_TYPES.map((type) => (
        <button
          key={type}
          className={`category${active === type ? " active" : ""}`}
          onClick={() => onSelect(active === type ? "" : type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
