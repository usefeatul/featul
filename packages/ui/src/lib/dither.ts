/** Shared contour density in [0, 1], with soft edges for ordered dithering. */
export function contourDensity(u: number, v: number) {
  const x = (u - 0.48) * 1.5;
  const y = v - 0.5;
  const radius = Math.hypot(x, y);
  const angle = Math.atan2(y, x);
  const field =
    radius * 9 +
    0.38 * (radius / (radius + 0.2)) * Math.sin(angle * 3 + radius * 4) +
    0.18 * Math.sin(u * 7 + v * 4);
  const phase = field - Math.floor(field);
  const line = Math.max(0, 1 - Math.abs(phase - 0.5) / 0.3);
  return Math.min(1, line * 1.6);
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
