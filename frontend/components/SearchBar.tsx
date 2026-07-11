"use client";

import { useState } from "react";
import { todayISO } from "@/lib/format";

export interface SearchValues {
  location: string;
  check_in: string;
  check_out: string;
  guests: string;
}

// Controlled search inputs; submitting pushes the values up to the URL.
export function SearchBar({
  initial,
  onSearch,
}: {
  initial: SearchValues;
  onSearch: (values: SearchValues) => void;
}) {
  const [values, setValues] = useState<SearchValues>(initial);

  const update = (patch: Partial<SearchValues>) => setValues((v) => ({ ...v, ...patch }));

  return (
    <div className="searchbar">
      <div className="field">
        <label>Location</label>
        <input
          className="input"
          placeholder="Goa, Manali, Jaipur..."
          value={values.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Check in</label>
        <input
          className="input"
          type="date"
          min={todayISO()}
          value={values.check_in}
          onChange={(e) => update({ check_in: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Check out</label>
        <input
          className="input"
          type="date"
          min={values.check_in || todayISO()}
          value={values.check_out}
          onChange={(e) => update({ check_out: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Guests</label>
        <input
          className="input"
          type="number"
          min={1}
          value={values.guests}
          onChange={(e) => update({ guests: e.target.value })}
        />
      </div>
      <button className="btn btn-primary" onClick={() => onSearch(values)}>
        Search
      </button>
    </div>
  );
}
