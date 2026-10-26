import { LIGHT_PURPLE } from "./palette";

/** The warped ring field behind the contours; each whole unit is one ring. */
export function contourField(u: number, v: number) {
  const x = (u - 0.48) * 1.5;
  const y = v - 0.5;
  const radius = Math.hypot(x, y);
  const angle = Math.atan2(y, x);
  return (
    radius * 9 +
    0.38 * (radius / (radius + 0.2)) * Math.sin(angle * 3 + radius * 4) +
    0.18 * Math.sin(u * 7 + v * 4)
  );
}

/** Density of a ring field value; subtracting time from `field` ripples the rings outward. */
export function fieldDensity(field: number) {
  const phase = field - Math.floor(field);
  const line = Math.max(0, 1 - Math.abs(phase - 0.5) / 0.3);
  return Math.min(1, line * 1.6);
}

/** Shared contour density in [0, 1], with soft edges for ordered dithering. */
export function contourDensity(u: number, v: number) {
  return fieldDensity(contourField(u, v));
}

/** Rings drift outward by this many field units per second. */
export const DRIFT_SPEED = 0.12;

/** Stable per-cell hash in [0, 1), so each dot keeps its own glint timing. */
export function cellHash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

/**
 * Glint strength in [0, 1] for a dot at `time` seconds: mostly 0, with a short flash
 * every few seconds at a moment unique to the cell.
 */
export function glint(hash: number, time: number) {
  const wave = Math.sin(time * 1.3 + hash * 97);
  return wave > 0.97 ? (wave - 0.97) / 0.03 : 0;
}

/** A soft field shared by monochrome washes and the full-colour dither artwork. */
export function cloudFalloff(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  return Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));
}

/** Returns a level in [0, 2) for the three-tone ordered-dither palette. */
export function cloudLevel(u: number, v: number) {
  const field =
    0.8 * cloudFalloff(u, v, 0.08, 0.24, 0.25, 0.24) +
    0.75 * cloudFalloff(u, v, 0.65, 0.04, 0.3, 0.23) +
    0.95 * cloudFalloff(u, v, 0.93, 0.78, 0.26, 0.34) +
    0.65 * cloudFalloff(u, v, 0.28, 0.9, 0.27, 0.26) -
    0.35 * cloudFalloff(u, v, 0.5, 0.48, 0.25, 0.25) +
    0.12 * Math.sin(u * 18 + v * 9) * Math.sin(v * 12 - u * 7);
  return Math.max(0, Math.min(1.999, 0.6 + field * 1.7));
}

type Color = [number, number, number];

const blues: Color[] = [
  [45, 114, 207],
  [77, 150, 232],
  [177, 223, 255],
];
const accents: { x: number; y: number; color: Color }[] = [
  { x: 0, y: 0, color: [188, 169, 239] },
  { x: 1, y: 0, color: [249, 195, 146] },
  { x: 0, y: 1, color: [166, 223, 192] },
  { x: 1, y: 1, color: [240, 172, 201] },
];

// Warped concentric contours: clear looping shapes with ordered-dither edges.
const violet: Color = LIGHT_PURPLE;

export function contourColor(u: number, v: number, threshold: number): Color {
  const x = (u - 0.48) * 1.5;
  const y = v - 0.5;
  const radius = Math.hypot(x, y);
  const angle = Math.atan2(y, x);
  const density = contourDensity(u, v);
  const base: Color = [65, 137, 226];
  if (density <= threshold) return base;

  const cyan: Color = [127, 214, 242];
  const blend = (Math.sin(angle + radius * 2) + 1) / 2;
  return cyan.map(
    (channel, index) => channel + (violet[index]! - channel) * blend,
  ) as Color;
}

// Light purple contours on a transparent base, so the container's bg-primary shows through.
export function primaryContourColor(
  u: number,
  v: number,
  threshold: number,
): [...Color, number] {
  return contourDensity(u, v) > threshold ? [...violet, 255] : [0, 0, 0, 0];
}

export function cloudColor(u: number, v: number, threshold: number): Color {
  const level = cloudLevel(u, v);
  const lower = Math.floor(level);
  const color = [
    ...blues[level - lower > threshold ? lower + 1 : lower]!,
  ] as Color;
  for (const accent of accents) {
    const amount = cloudFalloff(u, v, accent.x, accent.y, 0.28, 0.32) * 0.32;
    for (let i = 0; i < 3; i++)
      color[i] = color[i]! + (accent.color[i]! - color[i]!) * amount;
  }
  return color;
}
