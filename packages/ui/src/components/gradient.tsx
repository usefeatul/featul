"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@featul/ui/lib/utils";
import { rgb } from "../lib/palette";
import {
  BAYER4,
  fillOf,
  type PixelBloom,
  type PixelColor,
  pixelBloomStyle,
} from "../lib/pixel";

const MAX_COLS = 960;
const MAX_ROWS = 600;

export type GradientDirection = "up" | "down" | "left" | "right";

export type DitherGradientProps = {
  from: PixelColor;
  to?: PixelColor | "transparent";
  direction?: GradientDirection;
  cell?: number;
  opacity?: number;
  bloom?: PixelBloom;
  className?: string;
};

type PaintSpec = {
  from: PixelColor;
  to: PixelColor | "transparent";
  direction: GradientDirection;
  cell: number;
  opacity: number;
};

function paintGradient(
  canvas: HTMLCanvasElement,
  bloomCanvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  spec: PaintSpec,
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx || ctx.isContextLost?.() || width <= 0 || height <= 0) return false;
  const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / spec.cell)));
  const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / spec.cell)));
  if (canvas.width !== cols) canvas.width = cols;
  if (canvas.height !== rows) canvas.height = rows;

  ctx.clearRect(0, 0, cols, rows);

  const fromFill = fillOf(spec.from);
  const toFill = spec.to === "transparent" ? null : fillOf(spec.to);
  const o = spec.opacity;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t =
        spec.direction === "up"
          ? 1 - (y + 0.5) / rows
          : spec.direction === "down"
            ? (y + 0.5) / rows
            : spec.direction === "left"
              ? 1 - (x + 0.5) / cols
              : (x + 0.5) / cols;
      const density = 1 - t;
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      const lit = density > threshold;
      if (toFill) {
        ctx.fillStyle = rgb(lit ? fromFill : toFill, 1, o);
        ctx.fillRect(x, y, 1, 1);
      } else {
        const alpha = (lit ? 0.35 + 0.65 * density : 0.12 * density) * o;
        if (alpha <= 0.004) continue;
        ctx.fillStyle = rgb(fromFill, 1, alpha);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
  if (bloomCanvas && bloomCtx) {
    if (bloomCanvas.width !== cols) bloomCanvas.width = cols;
    if (bloomCanvas.height !== rows) bloomCanvas.height = rows;
    bloomCtx.clearRect(0, 0, cols, rows);
    bloomCtx.drawImage(canvas, 0, 0);
  }
  return true;
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

export function DitherGradient({
  from,
  to = "transparent",
  direction = "up",
  cell = 3,
  opacity = 1,
  bloom = "off",
  className,
}: DitherGradientProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let frame = 0;

    const paint = () => {
      const box = wrap.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      const painted = paintGradient(canvas, bloomRef.current, box.width, box.height, {
        from,
        to,
        direction,
        cell,
        opacity,
      });
      if (fallbackRef.current) fallbackRef.current.hidden = painted;
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };

    // Draw on mount rather than waiting for a visibility notification. Resize
    // observation also handles containers that initially have no dimensions.
    paint();
    const ro = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(schedule);
    ro?.observe(wrap);

    const restore = () => {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
      schedule();
    };
    const resume = () => {
      if (document.visibilityState === "visible") schedule();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      if (fallbackRef.current) fallbackRef.current.hidden = false;
    };
    window.addEventListener("pageshow", restore);
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", resume);
    canvas.addEventListener("contextlost", contextLost);
    canvas.addEventListener("contextrestored", restore);

    return () => {
      ro?.disconnect();
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", resume);
      canvas.removeEventListener("contextlost", contextLost);
      canvas.removeEventListener("contextrestored", restore);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [from, to, direction, cell, opacity, bloom]);

  const bloomStyle = pixelBloomStyle(bloom);
  // An inline tile is rendered on the server, so refreshes never start with an
  // empty canvas. The full-resolution canvas replaces it after its first paint.
  const fill = fillOf(from);
  const pixels = BAYER4.flatMap((row, y) =>
    row.map((threshold, x) =>
      `<rect x="${x}" y="${y}" width="1" height="1" fill="${rgb(fill, 1, 0.2 + 0.8 * threshold)}"/>`,
    ),
  ).join("");
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4">${pixels}</svg>`;
  const fadeDirection = {
    up: "top", down: "bottom", left: "left", right: "right",
  }[direction];

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [overflow-anchor:none]",
        className,
      )}
    >
      <div
        ref={fallbackRef}
        className="absolute inset-0"
        style={{
          backgroundColor: to === "transparent" ? undefined : rgb(fillOf(to)),
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile)}")`,
          backgroundSize: `${cell * 4}px ${cell * 4}px`,
          maskImage: to === "transparent" ? `linear-gradient(to ${fadeDirection}, black, transparent)` : undefined,
          opacity,
        }}
      />
      <canvas ref={canvasRef} style={canvasLayout} />
      {bloomStyle ? (
        <canvas ref={bloomRef} style={{ ...canvasLayout, ...bloomStyle }} />
      ) : null}
    </div>
  );
}
