"use client";

import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/constants";

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

// Plain img with a fallback so broken URLs never leave a blank space.
export function SmartImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const finalSrc = !src || failed ? FALLBACK_IMAGE : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
