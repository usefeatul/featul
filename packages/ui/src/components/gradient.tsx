"use client";

import { useEffect, type CSSProperties } from "react";

import { cn } from "@featul/ui/lib/utils";
import { LIGHT_PURPLE, rgb } from "../lib/palette";
import { contourMasks } from "../lib/artwork";
import { startDitherEngine } from "../lib/engine";
import {
  fillOf,
  type PixelBloom,
  type PixelColor,
  pixelBloomStyle,
} from "../lib/pixel";

export type GradientDirection = "up" | "down" | "left" | "right";

/** "primary" follows the theme's --primary token, repainting on theme changes. */
export type GradientColor = PixelColor | "primary";

export type DitherGradientProps = {
  from?: GradientColor;
  to?: GradientColor | "transparent";
  direction?: GradientDirection;
  cell?: number;
  opacity?: number;
  bloom?: PixelBloom;
  /** Rings ripple and dots glint while on screen; off paints the still artwork. */
  animated?: boolean;
  className?: string;
};

function cssColor(color: GradientColor) {
  return color === "primary" ? "var(--primary)" : rgb(fillOf(color));
}

/** How the dither engine (lib/engine.ts) reads a colour from a data attribute. */
function engineColor(color: GradientColor | "transparent") {
  return color === "primary" || color === "transparent"
    ? color
    : fillOf(color).join(",");
}

const canvasLayout: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  imageRendering: "pixelated",
};

/**
 * Painted and animated by the dither engine, which runs from the document head so the
 * motion starts with the first frame. The masked layer is the no-JS still.
 */
export function DitherGradient({
  from = LIGHT_PURPLE,
  to = "transparent",
  direction = "up",
  cell = 3,
  opacity = 1,
  bloom = "off",
  animated = true,
  className,
}: DitherGradientProps) {
  // Covers pages whose layout does not inline the engine script.
  useEffect(startDitherEngine, []);

  const bloomStyle = pixelBloomStyle(bloom);

  return (
    <div
      aria-hidden
      data-dither="gradient"
      data-from={engineColor(from)}
      data-to={engineColor(to)}
      data-direction={direction}
      data-cell={cell}
      data-opacity={opacity}
      data-animated={animated}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [overflow-anchor:none]",
        className,
      )}
    >
      <div
        data-dither-still
        suppressHydrationWarning
        className="absolute inset-0"
        style={{
          backgroundColor: to === "transparent" ? undefined : cssColor(to),
          opacity,
        }}
      >
        <div
          className="absolute inset-0 [image-rendering:pixelated]"
          style={{
            backgroundColor: cssColor(from),
            maskImage: `url("${contourMasks[direction]}")`,
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        />
      </div>
      <canvas data-dither-canvas suppressHydrationWarning style={canvasLayout} />
      {bloomStyle ? (
        <canvas
          data-dither-bloom
          suppressHydrationWarning
          style={{ ...canvasLayout, ...bloomStyle }}
        />
      ) : null}
    </div>
  );
}
