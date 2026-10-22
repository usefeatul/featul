import type { CSSProperties } from "react";

import { cn } from "@featul/ui/lib/utils";
import {
  MASCOT_GRID,
  mascotArt,
  type MascotMood,
  type MascotTone,
} from "../lib/mascot";

export type { MascotMood } from "../lib/mascot";

export type MascotProps = {
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
    face: `color-mix(in oklab, ${color} 6%, #fff1e2)`,
    shade: `color-mix(in oklab, ${color} 62%, black)`,
    base: color,
    light: `color-mix(in oklab, ${color} 48%, white)`,
    blush: "rgb(255 170 220)",
    ink: `color-mix(in oklab, ${color} 30%, #0b0b12)`,
    spark: "#ffffff",
  };
}

const TONES: MascotTone[] = ["face", "shade", "base", "light", "blush", "ink", "spark"];

/** Tully, the empty-state mascot. */
export function Mascot({
  mood = "idle",
  size = 64,
  color = "var(--primary)",
  animated = true,
  className,
}: MascotProps) {
  const art = mascotArt(mood);
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
      <g className="featul-mascot__body">
        {TONES.map((tone) =>
          art.layers[tone] ? <path key={tone} d={art.layers[tone]} style={{ fill: fill[tone] }} /> : null,
        )}
        <g className="featul-mascot__eyes">
          <path d={art.eyes.ink} style={{ fill: "#16161d" }} />
          <path d={art.eyes.spark} style={{ fill: "#ffffff" }} />
        </g>
        <path d={art.mouth} style={{ fill: "#16161d" }} />
      </g>
      {art.marks ? <path className="featul-mascot__marks" d={art.marks} style={{ fill: "currentColor" }} /> : null}
    </svg>
  );
}
