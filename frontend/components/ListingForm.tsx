"use client";

import { useState } from "react";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/constants";
import type { ListingWrite } from "@/types";

// Shared create/edit form. Prefills from `initial` and validates before submit.
export function ListingForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: ListingWrite;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ListingWrite) => void;
}) {
  const [values, setValues] = useState<ListingWrite>(initial);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initial.image_urls.length ? initial.image_urls : [""]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ListingWrite>(key: K, value: ListingWrite[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const toggleAmenity = (name: string) =>
    setValues((v) => ({
      ...v,
      amenities: v.amenities.includes(name)
        ? v.amenities.filter((a) => a !== name)
        : [...v.amenities, name],
    }));

  const updateImage = (i: number, url: string) =>
    setImageUrls((list) => list.map((u, idx) => (idx === i ? url : u)));

  const addImage = () => setImageUrls((list) => [...list, ""]);
  const removeImage = (i: number) => setImageUrls((list) => list.filter((_, idx) => idx !== i));

  // Client-side checks before hitting the backend.
  const validate = (cleanImages: string[]): boolean => {
    const next: Record<string, string> = {};
    if (!values.title.trim()) next.title = "Title is required";
    if (!values.description.trim()) next.description = "Description is required";
    if (!values.city.trim()) next.city = "City is required";
    if (!values.country.trim()) next.country = "Country is required";
    if (values.price_per_night <= 0) next.price_per_night = "Price must be greater than 0";
    if (values.max_guests < 1) next.max_guests = "At least 1 guest";
    if (cleanImages.length === 0) next.image_urls = "Add at least one image URL";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    const cleanImages = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (!validate(cleanImages)) return;
    onSubmit({ ...values, image_urls: cleanImages });
  };

  return (
    <div className="panel">
      <div className="field">
        <label>Title</label>
        <input className="input" value={values.title} onChange={(e) => set("title", e.target.value)} />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          className="textarea"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-grid">
        <div className="field">
          <label>City</label>
          <input className="input" value={values.city} onChange={(e) => set("city", e.target.value)} />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
        <div className="field">
          <label>Country</label>
          <input
            className="input"
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
          />
          {errors.country && <span className="field-error">{errors.country}</span>}
        </div>
      </div>

      <div className="field">
        <label>Address</label>
        <input
          className="input"
          value={values.address ?? ""}
          onChange={(e) => set("address", e.target.value || null)}
        />
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Latitude</label>
          <input
            className="input"
            type="number"
            value={values.latitude ?? ""}
            onChange={(e) => set("latitude", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="field">
          <label>Longitude</label>
          <input
            className="input"
            type="number"
            value={values.longitude ?? ""}
            onChange={(e) => set("longitude", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Price per night (₹)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={values.price_per_night}
            onChange={(e) => set("price_per_night", Number(e.target.value))}
          />
          {errors.price_per_night && <span className="field-error">{errors.price_per_night}</span>}
        </div>
        <div className="field">
          <label>Cleaning fee (₹)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={values.cleaning_fee}
            onChange={(e) => set("cleaning_fee", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Property type</label>
          <select
            className="select"
            value={values.property_type}
            onChange={(e) => set("property_type", e.target.value)}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Max guests</label>
          <input
            className="input"
            type="number"
            min={1}
            value={values.max_guests}
            onChange={(e) => set("max_guests", Number(e.target.value))}
          />
          {errors.max_guests && <span className="field-error">{errors.max_guests}</span>}
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Bedrooms</label>
          <input
            className="input"
            type="number"
            min={0}
            value={values.bedrooms}
            onChange={(e) => set("bedrooms", Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label>Beds</label>
          <input
            className="input"
            type="number"
            min={0}
            value={values.beds}
            onChange={(e) => set("beds", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="field" style={{ maxWidth: 220 }}>
        <label>Bathrooms</label>
        <input
          className="input"
          type="number"
          min={0}
          value={values.bathrooms}
          onChange={(e) => set("bathrooms", Number(e.target.value))}
        />
      </div>

      <div className="field">
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

      <div className="field">
        <label>Image URLs</label>
        {imageUrls.map((url, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              className="input"
              placeholder="https://..."
              value={url}
              onChange={(e) => updateImage(i, e.target.value)}
            />
            {imageUrls.length > 1 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeImage(i)}>
                Remove
              </button>
            )}
          </div>
        ))}
        {errors.image_urls && <span className="field-error">{errors.image_urls}</span>}
        <button type="button" className="btn btn-outline btn-sm" onClick={addImage} style={{ marginTop: 4 }}>
          + Add image URL
        </button>
      </div>

      <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

// Blank listing used when creating a new one.
export const EMPTY_LISTING: ListingWrite = {
  title: "",
  description: "",
  city: "",
  country: "India",
  address: null,
  latitude: null,
  longitude: null,
  price_per_night: 0,
  cleaning_fee: 0,
  property_type: PROPERTY_TYPES[0],
  max_guests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  image_urls: [],
};
