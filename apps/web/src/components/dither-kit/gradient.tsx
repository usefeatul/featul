"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@featul/ui/lib/utils";
import { rgb } from "./palette";
import {
  BAYER4,
  fillOf,
  type PixelBloom,
  type PixelColor,
  pixelBloomStyle,
} from "./pixel";

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
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || width <= 0 || height <= 0) return;
  const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / spec.cell)));
  const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / spec.cell)));
  if (canvas.width !== cols) canvas.width = cols;
  if (canvas.height !== rows) canvas.height = rows;

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

export type DitherBand = {
  color: PixelColor;
  /** 0–1 vertical stop where this color takes over. */
  at: number;
};

type BandPaintSpec = {
  bands: { fill: ReturnType<typeof fillOf>; at: number }[];
  cell: number;
  opacity: number;
};

function paintBands(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  spec: BandPaintSpec,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || width <= 0 || height <= 0 || spec.bands.length === 0) return;
  const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / spec.cell)));
  const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / spec.cell)));
  if (canvas.width !== cols) canvas.width = cols;
  if (canvas.height !== rows) canvas.height = rows;

  const stops = spec.bands;
  const o = spec.opacity;

  for (let y = 0; y < rows; y++) {
    const t = (y + 0.5) / rows;
    let i = 0;
    while (i < stops.length - 1 && stops[i + 1]!.at < t) i++;
    const a = stops[i]!;
    const b = stops[Math.min(i + 1, stops.length - 1)]!;
    const span = Math.max(1e-6, b.at - a.at);
    const local = (t - a.at) / span;
    for (let x = 0; x < cols; x++) {
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      const fill = local > threshold ? b.fill : a.fill;
      ctx.fillStyle = rgb(fill, 1, o);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export type DitherBandsProps = {
  bands: DitherBand[];
  cell?: number;
  opacity?: number;
  className?: string;
};

/** Full-area Bayer-dithered color bands (Ferndesk-style hero field). */
export function DitherBands({
  bands,
  cell = 5,
  opacity = 1,
  className,
}: DitherBandsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const packed = bands
    .map((band) => `${band.at}:${Array.isArray(band.color) ? band.color.join(",") : band.color}`)
    .join("|");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resolved = [...bands]
      .map((band) => ({ fill: fillOf(band.color), at: band.at }))
      .sort((a, b) => a.at - b.at);

    let frame = 0;
    let retries = 0;

    const paint = () => {
      const box = wrap.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) {
        if (retries < 24) {
          retries += 1;
          schedule();
        }
        return;
      }
      retries = 0;
      paintBands(canvas, box.width, box.height, {
        bands: resolved,
        cell,
        opacity,
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };

    schedule();

    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            schedule();
          });
    ro?.observe(wrap);

    return () => {
      ro?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [packed, cell, opacity]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [overflow-anchor:none]",
        className,
      )}
    >
      <canvas ref={canvasRef} style={canvasLayout} />
    </div>
  );
}

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

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let visible = false;
    let frame = 0;

    const paint = () => {
      if (!visible) return;
      const box = wrap.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return;
      paintGradient(canvas, bloomRef.current, box.width, box.height, {
        from,
        to,
        direction,
        cell,
        opacity,
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) schedule();
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (visible) schedule();
          });
    ro?.observe(wrap);

    return () => {
      io.disconnect();
      ro?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [from, to, direction, cell, opacity, bloom]);

  const bloomStyle = pixelBloomStyle(bloom);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [overflow-anchor:none]",
        className,
      )}
    >
      <canvas ref={canvasRef} style={canvasLayout} />
      {bloomStyle ? (
        <canvas ref={bloomRef} style={{ ...canvasLayout, ...bloomStyle }} />
      ) : null}
    </div>
  );
}
