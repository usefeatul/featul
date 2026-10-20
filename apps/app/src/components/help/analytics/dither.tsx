"use client";

import React from "react";
import type { GradientColor } from "@featul/ui/components/gradient";
import { BAYER4, fillOf } from "@featul/ui/lib/pixel";
import { rgb, type Rgb } from "@featul/ui/lib/palette";
import { cn } from "@featul/ui/lib/utils";

/** Any CSS colour value, normalised to RGB through the canvas parser. */
function parseCss(value: string, fallback: Rgb): Rgb {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!value || !ctx) return fallback;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const cssVar = (el: Element, name: string, fallback: Rgb) =>
  parseCss(getComputedStyle(el).getPropertyValue(name).trim(), fallback);

/** Same rules as the kit's DitherGradient, so "primary" follows the theme token. */
function resolveColor(color: GradientColor, el: Element): Rgb {
  return color === "primary"
    ? cssVar(el, "--primary", [40, 117, 197])
    : fillOf(color);
}

const lit = (x: number, y: number, density: number) =>
  density > (BAYER4[y & 3]?.[x & 3] ?? 0.5);

/** Repaints on resize and theme changes; `draw` reads the latest props through the closure. */
function useRepaint(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  draw: () => void,
) {
  React.useEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    const theme = new MutationObserver(() => draw());
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => {
      ro.disconnect();
      theme.disconnect();
    };
  }, [draw, wrapRef]);
}

/** Sizes the canvas for the device pixel ratio and hands back a context in CSS pixels. */
function prepare(wrap: HTMLDivElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const { width, height } = wrap.getBoundingClientRect();
  if (!ctx || width < 1 || height < 1) return null;
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(width * dpr);
  const ph = Math.round(height * dpr);
  if (canvas.width !== pw) canvas.width = pw;
  if (canvas.height !== ph) canvas.height = ph;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

export type ChartDatum = { key: string; value: number; label: string };

/** Rounds up to a readable step times a power of ten, so the peak nearly fills the chart. */
export function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step =
    [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

/** Horizontal position of point `i` when points run edge to edge. */
export const pointX = (i: number, n: number) => (n <= 1 ? 0.5 : i / (n - 1));

/** Monotone cubic interpolation (Fritsch–Carlson): smooth, but never overshoots the data. */
function monotone(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n === 1) return () => ys[0]!;
  const dx = xs.slice(1).map((x, i) => x - xs[i]!);
  const m = ys.slice(1).map((y, i) => (y - ys[i]!) / (dx[i] || 1));
  const t = ys.map((_, i) => {
    if (i === 0) return m[0]!;
    if (i === n - 1) return m[n - 2]!;
    const a = m[i - 1]!;
    const b = m[i]!;
    if (a * b <= 0) return 0;
    const d0 = dx[i - 1]!;
    const d1 = dx[i]!;
    return (3 * (d0 + d1)) / ((2 * d1 + d0) / a + (d1 + 2 * d0) / b);
  });
  return (x: number) => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]!) i++;
    const h = dx[i]!;
    const s = Math.min(1, Math.max(0, (x - xs[i]!) / (h || 1)));
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * ys[i]! +
      (s3 - 2 * s2 + s) * h * t[i]! +
      (-2 * s3 + 3 * s2) * ys[i + 1]! +
      (s3 - s2) * h * t[i + 1]!
    );
  };
}

/**
 * "Glow wave": a smooth neon line over a gradient that dissolves into the kit's ordered
 * dither. Interactive mode adds a light beam and glowing marker on the hovered day, and an
 * optional dashed ghost line for the previous period. `compact` suits sparklines.
 */
export function GlowWave({
  data,
  previous,
  color = "primary",
  max,
  className,
  interactive = false,
  compact = false,
  formatValue = (v) => String(v),
  ariaLabel,
}: {
  data: ChartDatum[];
  /** Previous-period values aligned by index with `data`. */
  previous?: number[];
  color?: GradientColor;
  max?: number;
  className?: string;
  interactive?: boolean;
  compact?: boolean;
  formatValue?: (value: number) => string;
  ariaLabel: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const n = data.length;
  const top =
    max ?? Math.max(1, ...data.map((d) => d.value), ...(previous ?? []));
  const headroom = compact ? 6 : 18;

  const draw = React.useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || n === 0) return;
    const frame = prepare(wrap, canvas);
    if (!frame) return;
    const { ctx, W, H } = frame;
    const fill = resolveColor(color, wrap);
    const yOf = (v: number) => H - (Math.min(v, top) / top) * (H - headroom);
    const xs = data.map((_, i) => pointX(i, n) * W);
    const curve = monotone(
      xs,
      data.map((d) => yOf(d.value)),
    );
    const trace = (fn: (x: number) => number) => {
      ctx.moveTo(0, fn(0));
      for (let x = 1; x <= W; x += 1) ctx.lineTo(x, fn(x));
    };
    const peak = Math.min(...data.map((d) => yOf(d.value)));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, curve(0));
    for (let x = 1; x <= W; x += 1) ctx.lineTo(x, curve(x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.clip();
    const wash = ctx.createLinearGradient(0, peak, 0, H);
    wash.addColorStop(0, rgb(fill, 1, compact ? 0.3 : 0.36));
    wash.addColorStop(1, rgb(fill, 1, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
    const cell = compact ? 2 : 3;
    for (let gx = 0; gx * cell < W; gx++) {
      const lineY = curve((gx + 0.5) * cell);
      for (
        let gy = Math.max(0, Math.floor(lineY / cell));
        gy * cell < H;
        gy++
      ) {
        const cy = (gy + 0.5) * cell;
        if (cy < lineY) continue;
        const depth = (cy - lineY) / Math.max(1, H - lineY);
        if (!lit(gx, gy, (1 - depth) ** 2 * 0.75)) continue;
        ctx.fillStyle = rgb(fill, 1, 0.55 * (1 - depth));
        ctx.fillRect(gx * cell, gy * cell, cell, cell);
      }
    }
    ctx.restore();

    if (previous && previous.length === n) {
      const ghost = monotone(xs, previous.map(yOf));
      ctx.beginPath();
      trace(ghost);
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = rgb(
        cssVar(wrap, "--muted-foreground", [120, 120, 120]),
        1,
        0.6,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Neon line: a blurred glow pass, then a bright core.
    ctx.save();
    ctx.beginPath();
    trace(curve);
    ctx.shadowColor = rgb(fill, 1, 0.9);
    ctx.shadowBlur = compact ? 8 : 18;
    ctx.lineWidth = compact ? 2 : 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = rgb(fill);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    trace(curve);
    ctx.lineWidth = compact ? 1 : 1.25;
    ctx.strokeStyle = rgb(fill, 1.3, 0.9);
    ctx.stroke();

    if (hover !== null) {
      const x = xs[hover]!;
      const y = curve(x);
      const beam = ctx.createLinearGradient(0, 0, 0, H);
      beam.addColorStop(0, rgb(fill, 1, 0));
      beam.addColorStop(0.5, rgb(fill, 1, 0.22));
      beam.addColorStop(1, rgb(fill, 1, 0));
      ctx.fillStyle = beam;
      ctx.fillRect(x - 16, 0, 32, H);
      ctx.fillStyle = rgb(fill, 1, 0.6);
      ctx.fillRect(x - 0.5, 0, 1, H);
      ctx.save();
      ctx.shadowColor = rgb(fill);
      ctx.shadowBlur = 16;
      ctx.fillStyle = rgb(fill);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [color, compact, data, headroom, hover, n, previous, top]);

  useRepaint(wrapRef, draw);

  const shown = hover !== null ? data[hover] : undefined;
  const before = hover !== null ? previous?.[hover] : undefined;
  const change =
    shown && before !== undefined && before > 0
      ? Math.round(((shown.value - before) / before) * 100)
      : null;

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={ariaLabel}
      className={cn("relative", interactive && "cursor-crosshair", className)}
      onPointerMove={
        interactive
          ? (e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const index =
                n <= 1
                  ? 0
                  : Math.round(((e.clientX - box.left) / box.width) * (n - 1));
              setHover(Math.min(n - 1, Math.max(0, index)));
            }
          : undefined
      }
      onPointerLeave={interactive ? () => setHover(null) : undefined}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
      {interactive && shown && hover !== null ? (
        <div
          className={cn(
            "pointer-events-none absolute top-2 z-10 whitespace-nowrap rounded-xl px-3 py-2 text-xs shadow-lg backdrop-blur-md",
            "border border-border/70 bg-popover/90 text-foreground dark:border-white/10",
            pointX(hover, n) > 0.7
              ? "-translate-x-[calc(100%+22px)]"
              : "translate-x-[22px]",
          )}
          style={{ left: `${pointX(hover, n) * 100}%` }}
        >
          <p className="opacity-70">{shown.label}</p>
          <p className="mt-0.5 text-base font-semibold tabular-nums">
            {formatValue(shown.value)}
          </p>
          {before !== undefined ? (
            <p className="mt-0.5 tabular-nums opacity-75">
              {formatValue(before)} last period
              {change !== null ? ` · ${change > 0 ? "+" : ""}${change}%` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      <table className="sr-only">
        <tbody>
          {data.map((d, i) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{formatValue(d.value)}</td>
              {previous ? (
                <td>{formatValue(previous[i] ?? 0)} in the previous period</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Radial LED gauge: a ring of rounded ticks lit up to `value`, the last lit tick glowing.
 * Children render in the centre.
 */
export function RingGauge({
  value,
  color,
  size = 92,
  ticks = 40,
  label,
  children,
}: {
  /** 0 to 1. */
  value: number;
  /** Any CSS colour. */
  color: string;
  size?: number;
  ticks?: number;
  label: string;
  children?: React.ReactNode;
}) {
  const litCount = Math.round(Math.min(1, Math.max(0, value)) * ticks);
  const c = size / 2;
  const outer = c - 3;
  const inner = outer - size * 0.13;
  const id = React.useId().replace(/:/g, "");
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-full -rotate-90 overflow-visible"
        aria-hidden
      >
        <defs>
          <filter
            id={`glow-${id}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          const on = i < litCount;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * inner}
              y1={c + Math.sin(a) * inner}
              x2={c + Math.cos(a) * outer}
              y2={c + Math.sin(a) * outer}
              strokeWidth={size * 0.035}
              strokeLinecap="round"
              stroke={on ? color : "currentColor"}
              className={on ? undefined : "text-foreground/10"}
              filter={on && i === litCount - 1 ? `url(#glow-${id})` : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/**
 * Horizontal dithered meter. One `value` fills from the left and dissolves toward its end;
 * `split` paints a second colour from the right for two-part totals (helpful vs not).
 */
export function DitherMeter({
  value,
  color = "primary",
  split,
  cell = 3,
  className,
  label,
}: {
  /** 0 to 1. */
  value: number;
  color?: GradientColor;
  split?: { color: GradientColor };
  cell?: number;
  className?: string;
  label: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const splitColor = split?.color;

  const draw = React.useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    const box = wrap.getBoundingClientRect();
    const cols = Math.max(1, Math.round(box.width / cell));
    const rows = Math.max(1, Math.round(box.height / cell));
    if (canvas.width !== cols) canvas.width = cols;
    if (canvas.height !== rows) canvas.height = rows;
    ctx.clearRect(0, 0, cols, rows);
    const fill = resolveColor(color, wrap);
    const other = splitColor ? resolveColor(splitColor, wrap) : null;
    const end = Math.round(Math.min(1, Math.max(0, value)) * cols);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x < end) {
          const density = 1 - (x / Math.max(1, end)) * 0.45;
          ctx.fillStyle = rgb(fill, 1, lit(x, y, density) ? 1 : 0.18);
        } else if (other) {
          const density = 1 - ((cols - 1 - x) / Math.max(1, cols - end)) * 0.45;
          ctx.fillStyle = rgb(other, 1, lit(x, y, density) ? 1 : 0.18);
        } else {
          if (!lit(x, y, 0.2)) continue;
          ctx.fillStyle = rgb(fill, 1, 0.1);
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [cell, color, splitColor, value]);

  useRepaint(wrapRef, draw);

  return (
    <div
      ref={wrapRef}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("relative h-3 overflow-hidden rounded-[3px]", className)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
      />
    </div>
  );
}
