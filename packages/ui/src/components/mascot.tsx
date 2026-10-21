import type { CSSProperties } from "react";

import { cn } from "@featul/ui/lib/utils";
import {
  MASCOT_GRID,
  mascotArt,
  type MascotMood,
  type MascotTone,
  type MascotVariant,
} from "../lib/mascot";

export type { MascotMood, MascotVariant } from "../lib/mascot";

/** The variant used everywhere unless a surface asks for another. */
export const DEFAULT_MASCOT: MascotVariant = "tully";

export type MascotProps = {
  variant?: MascotVariant;
  mood?: MascotMood;
  /** Rendered width and height in CSS pixels. Multiples of 32 stay pixel-perfect. */
  size?: number;
  /** Any CSS colour. Defaults to the theme's --primary, so it follows branding. */
  color?: string;
  animated?: boolean;
  className?: string;
};

function toneFill(color: string): Record<MascotTone, string> {
  return {
    shade: `color-mix(in oklab, ${color} 62%, black)`,
    base: color,
    light: `color-mix(in oklab, ${color} 48%, white)`,
    blush: "rgb(255 170 220)",
    face: `color-mix(in oklab, ${color} 6%, #fff1e2)`,
    ink: `color-mix(in oklab, ${color} 30%, #0b0b12)`,
    spark: "#ffffff",
    mark: "currentColor",
    shadow: "currentColor",
  };
}

const BODY: MascotTone[] = ["face", "shade", "base", "light", "blush", "ink", "spark"];

export function Mascot({
  variant = DEFAULT_MASCOT,
  mood = "idle",
  size = 64,
  color = "var(--primary)",
  animated = true,
  className,
}: MascotProps) {
  const art = mascotArt(variant, mood);
  const fill = toneFill(color);
  const style: CSSProperties = { width: size, height: size };

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${MASCOT_GRID} ${MASCOT_GRID}`}
      shapeRendering="crispEdges"
      className={cn(
        "featul-mascot shrink-0 overflow-visible text-foreground/40 dark:text-white/30",
        animated && "featul-mascot--animated",
        className,
      )}
      data-mood={mood}
      style={style}
    >
      <path className="featul-mascot__shadow" d={art.layers.shadow} style={{ fill: fill.shadow, opacity: 0.35 }} />
      <g className="featul-mascot__body">
        {BODY.map((tone) =>
          art.layers[tone] ? <path key={tone} d={art.layers[tone]} style={{ fill: fill[tone] }} /> : null,
        )}
        <g className="featul-mascot__eyes">
          <path d={art.eyes.ink} style={{ fill: "#16161d" }} />
          <path d={art.eyes.spark} style={{ fill: "#ffffff" }} />
        </g>
        <path d={art.mouth} style={{ fill: "#16161d" }} />
      </g>
      {art.marks ? <path className="featul-mascot__marks" d={art.marks} style={{ fill: fill.mark }} /> : null}
    </svg>
  );
}
