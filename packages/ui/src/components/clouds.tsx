"use client";

import { useEffect, useRef } from "react";
import { BAYER4 } from "../lib/pixel";
import { cloudFalloff, cloudLevel, contourDensity } from "../lib/dither";

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
function contourColor(u: number, v: number, threshold: number): Color {
  const x = (u - 0.48) * 1.5;
  const y = v - 0.5;
  const radius = Math.hypot(x, y);
  const angle = Math.atan2(y, x);
  const density = contourDensity(u, v);
  const base: Color = [65, 137, 226];
  if (density <= threshold) return base;

  const cyan: Color = [127, 214, 242];
  const violet: Color = [169, 165, 242];
  const blend = (Math.sin(angle + radius * 2) + 1) / 2;
  return cyan.map(
    (channel, index) => channel + (violet[index]! - channel) * blend,
  ) as Color;
}

function paint(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  multicolor: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || ctx.isContextLost?.() || width < 1 || height < 1) return false;

  const cell = multicolor ? 2 : 3;
  const cols = Math.min(960, Math.max(4, Math.round(width / cell)));
  const rows = Math.min(600, Math.max(4, Math.round(height / cell)));
  canvas.width = cols;
  canvas.height = rows;
  const pixels = ctx.createImageData(cols, rows);

  for (let y = 0; y < rows; y++) {
    const v = (y + 0.5) / rows;
    for (let x = 0; x < cols; x++) {
      const u = (x + 0.5) / cols;
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      const level = cloudLevel(u, v);
      const lower = Math.floor(level);
      const color = multicolor
        ? contourColor(u, v, threshold)
        : blues[level - lower > threshold ? lower + 1 : lower]!;
      let [red, green, blue] = color;

      if (!multicolor) {
        for (const accent of accents) {
          const amount =
            cloudFalloff(u, v, accent.x, accent.y, 0.28, 0.32) * 0.32;
          red += (accent.color[0] - red) * amount;
          green += (accent.color[1] - green) * amount;
          blue += (accent.color[2] - blue) * amount;
        }
      }

      const index = (y * cols + x) * 4;
      pixels.data[index] = Math.round(red);
      pixels.data[index + 1] = Math.round(green);
      pixels.data[index + 2] = Math.round(blue);
      pixels.data[index + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return true;
}

export function DitherClouds({ multicolor = false }: { multicolor?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let frame = 0;
    const render = () => {
      frame = 0;
      const bounds = wrap.getBoundingClientRect();
      paint(canvas, bounds.width, bounds.height, multicolor);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onContextLost = (event: Event) => event.preventDefault();
    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    render();
    const observer = new ResizeObserver(schedule);
    observer.observe(wrap);
    window.addEventListener("pageshow", schedule);
    document.addEventListener("visibilitychange", onVisible);
    canvas.addEventListener("contextlost", onContextLost);
    canvas.addEventListener("contextrestored", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pageshow", schedule);
      document.removeEventListener("visibilitychange", onVisible);
      canvas.removeEventListener("contextlost", onContextLost);
      canvas.removeEventListener("contextrestored", schedule);
    };
  }, [multicolor]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full [image-rendering:pixelated]"
      />
    </div>
  );
}
