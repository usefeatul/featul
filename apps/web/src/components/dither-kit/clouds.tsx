"use client";

import { useEffect, useRef } from "react";
import { BAYER4 } from "./pixel";

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

function cloud(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  return Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));
}

function paint(canvas: HTMLCanvasElement, width: number, height: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx || ctx.isContextLost?.() || width < 1 || height < 1) return false;

  const cols = Math.min(960, Math.max(4, Math.round(width / 3)));
  const rows = Math.min(600, Math.max(4, Math.round(height / 3)));
  canvas.width = cols;
  canvas.height = rows;
  const pixels = ctx.createImageData(cols, rows);

  for (let y = 0; y < rows; y++) {
    const v = (y + 0.5) / rows;
    for (let x = 0; x < cols; x++) {
      const u = (x + 0.5) / cols;
      // Overlapping soft fields make the kit's ordered pixels follow cloud-like
      // contours rather than straight gradient bands. The artwork stays static.
      const field =
        0.8 * cloud(u, v, 0.08, 0.24, 0.25, 0.24) +
        0.75 * cloud(u, v, 0.65, 0.04, 0.3, 0.23) +
        0.95 * cloud(u, v, 0.93, 0.78, 0.26, 0.34) +
        0.65 * cloud(u, v, 0.28, 0.9, 0.27, 0.26) -
        0.35 * cloud(u, v, 0.5, 0.48, 0.25, 0.25) +
        0.12 * Math.sin(u * 18 + v * 9) * Math.sin(v * 12 - u * 7);
      const level = Math.max(0, Math.min(1.999, 0.6 + field * 1.7));
      const lower = Math.floor(level);
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      const color = blues[level - lower > threshold ? lower + 1 : lower]!;
      let [red, green, blue] = color;

      for (const accent of accents) {
        const amount = cloud(u, v, accent.x, accent.y, 0.28, 0.32) * 0.32;
        red += (accent.color[0] - red) * amount;
        green += (accent.color[1] - green) * amount;
        blue += (accent.color[2] - blue) * amount;
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

export function DitherClouds() {
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
      paint(canvas, bounds.width, bounds.height);
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
  }, []);

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
