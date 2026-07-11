"use client";

import { useState } from "react";
import { AMENITIES } from "@/lib/constants";

export interface FilterValues {
  min_price: string;
  max_price: string;
  amenities: string[];
}

// Price range plus amenity chips. Applies only when the user clicks Apply.
export function Filters({
  initial,
  onApply,
  onClear,
}: {
  initial: FilterValues;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
}) {
  const [values, setValues] = useState<FilterValues>(initial);

  const toggleAmenity = (name: string) => {
    setValues((v) => ({
      ...v,
      amenities: v.amenities.includes(name)
        ? v.amenities.filter((a) => a !== name)
        : [...v.amenities, name],
    }));
  };

  return (
    <div className="filters">
      <div className="field" style={{ maxWidth: 130 }}>
        <label>Min price (₹)</label>
        <input
          className="input"
          type="number"
          min={0}
          value={values.min_price}
          onChange={(e) => setValues((v) => ({ ...v, min_price: e.target.value }))}
        />
      </div>
      <div className="field" style={{ maxWidth: 130 }}>
        <label>Max price (₹)</label>
        <input
          className="input"
          type="number"
          min={0}
          value={values.max_price}
          onChange={(e) => setValues((v) => ({ ...v, max_price: e.target.value }))}
        />
      </div>

      <div className="field" style={{ flex: 1, minWidth: 260 }}>
        <label>Amenities</label>
        <div className="chips">
          {AMENITIES.map((name) => (
            <button
              key={name}
              type="button"
              className={`chip${values.amenities.includes(name) ? " active" : ""}`}
              onClick={() => toggleAmenity(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onApply(values)}>
          Apply
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setValues({ min_price: "", max_price: "", amenities: [] });
            onClear();
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
