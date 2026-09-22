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
