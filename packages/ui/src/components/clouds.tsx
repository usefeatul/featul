"use client";

import { useEffect } from "react";

import {
  cloudArtwork,
  contourArtwork,
  primaryContourArtwork,
} from "../lib/artwork";
import { startDitherEngine } from "../lib/engine";

/**
 * The finished kit artwork is present on first paint, including without JS. The dither
 * engine, running from the document head, paints over it straight away so the rings
 * ripple outward and dots glint.
 */
export function DitherClouds({
  multicolor = false,
  primary = false,
  fit = "fill",
  animated = true,
}: {
  multicolor?: boolean;
  /** Light purple contours over a transparent base; pair with a bg-primary container. */
  primary?: boolean;
  fit?: "fill" | "cover";
  /** Rings ripple and dots glint while on screen; off keeps the still artwork. */
  animated?: boolean;
}) {
  // Covers pages whose layout does not inline the engine script.
  useEffect(startDitherEngine, []);

  const variant = primary ? "primary" : multicolor ? "contours" : "clouds";
  const artwork =
    variant === "primary"
      ? primaryContourArtwork
      : variant === "contours"
        ? contourArtwork
        : cloudArtwork;
  return (
    <div
      aria-hidden
      data-dither="clouds"
      data-variant={variant}
      data-fit={fit}
      data-animated={animated}
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [image-rendering:pixelated]"
    >
      <div
        data-dither-still
        suppressHydrationWarning
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${artwork}")`,
          backgroundSize: fit === "cover" ? "cover" : "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <canvas
        data-dither-canvas
        suppressHydrationWarning
        className="absolute inset-0 block size-full [image-rendering:pixelated]"
      />
    </div>
  );
}
