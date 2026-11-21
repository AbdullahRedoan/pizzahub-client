"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/hero-neapolitan.png";

type MenuImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
};

/** next/image wrapper that tolerates vendor URLs and broken remote files. */
export function MenuImage({
  src,
  fallbackSrc = FALLBACK_IMAGE,
  alt,
  ...props
}: MenuImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [previousInput, setPreviousInput] = useState({ src, fallbackSrc });

  // Adjust during render when the gallery selection changes, rather than in an
  // effect, so the displayed image always matches the selected thumbnail.
  if (previousInput.src !== src || previousInput.fallbackSrc !== fallbackSrc) {
    setPreviousInput({ src, fallbackSrc });
    setCurrentSrc(src || fallbackSrc);
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
