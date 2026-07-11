"use client";

import type { ListingImage } from "@/types";
import { SmartImage } from "./SmartImage";

// Airbnb-style gallery: one large image plus up to four smaller ones.
export function Gallery({ images, title }: { images: ListingImage[]; title: string }) {
  const ordered = [...images].sort((a, b) => a.display_order - b.display_order);
  const shown = ordered.slice(0, 5);

  if (shown.length === 0) {
    return (
      <div className="gallery">
        <SmartImage src={null} alt={title} />
      </div>
    );
  }

  return (
    <div className="gallery">
      {shown.map((img, i) => (
        <SmartImage key={img.id} src={img.image_url} alt={`${title} — photo ${i + 1}`} />
      ))}
    </div>
  );
}
