"use client";

import { useEffect, useRef } from "react";
import { BAYER4 } from "../lib/pixel";
import { cloudFalloff, cloudLevel } from "../lib/dither";

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
      const level = cloudLevel(u, v);
      const lower = Math.floor(level);
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      const color = blues[level - lower > threshold ? lower + 1 : lower]!;
      let [red, green, blue] = color;

      for (const accent of accents) {
        const amount =
          cloudFalloff(u, v, accent.x, accent.y, 0.28, 0.32) * 0.32;
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
