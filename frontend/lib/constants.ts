import type { Role } from "@/types";

export interface MockUser {
  id: number;
  name: string;
  role: Role;
}

// Seeded backend users used by the development user switcher.
export const MOCK_USERS: MockUser[] = [
  { id: 4, name: "Aditya Balaji", role: "guest" },
  { id: 5, name: "Rohan Verma", role: "guest" },
  { id: 1, name: "Priya Sharma", role: "host" },
  { id: 2, name: "Rahul Mehta", role: "host" },
  { id: 3, name: "Neha Kapoor", role: "host" },
];

export const DEFAULT_USER_ID = 4;

// Mirrors the backend's allowed property types.
export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Cottage",
  "Cabin",
  "Beach House",
  "Farm Stay",
];

// Mirrors the seeded amenity names accepted by the backend.
export const AMENITIES = [
  "Wi-Fi",
  "Air conditioning",
  "Kitchen",
  "Free parking",
  "Swimming pool",
  "Washing machine",
  "TV",
  "Workspace",
  "Balcony",
  "Mountain view",
  "Sea view",
  "Breakfast",
  "Heating",
  "Pet friendly",
  "Garden",
];

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f0f0f0'/><text x='50%' y='50%' fill='#999' font-family='sans-serif' font-size='18' text-anchor='middle' dy='.3em'>No image</text></svg>`
  );
