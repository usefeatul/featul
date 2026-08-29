import { type DitherColor, PALETTE, type Rgb } from "./palette";

export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

export type PixelColor = DitherColor | number;

export function hueFill(hue: number): Rgb {
  const h = ((hue % 360) + 360) % 360;
  const s = 0.85;
  const l = 0.58;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function fillOf(color: PixelColor): Rgb {
  return typeof color === "number" ? hueFill(color) : PALETTE[color].fill;
}

export type PixelBloom = "off" | "low" | "high" | "aura";

const BLOOM_PRESET: Record<
  Exclude<PixelBloom, "off">,
  { blur: number; brightness: number; opacity: number; saturate: number }
> = {
  low: { blur: 3, brightness: 1.35, opacity: 0.7, saturate: 1.4 },
  high: { blur: 5, brightness: 1.5, opacity: 0.78, saturate: 1.5 },
  aura: { blur: 15, brightness: 2.9, opacity: 0.1, saturate: 3 },
};

export type PixelBloomStyle = {
  filter: string;
  opacity: number;
  mixBlendMode: "plus-lighter";
  imageRendering: "auto";
};

export function pixelBloomStyle(bloom: PixelBloom): PixelBloomStyle | null {
  if (bloom === "off") return null;
  const cfg = BLOOM_PRESET[bloom];
  return {
    filter: `blur(${cfg.blur}px) brightness(${cfg.brightness}) saturate(${cfg.saturate})`,
    opacity: cfg.opacity,
    mixBlendMode: "plus-lighter",
    imageRendering: "auto",
  };
}
