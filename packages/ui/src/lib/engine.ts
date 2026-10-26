import {
  cellHash,
  cloudColor,
  contourColor,
  contourField,
  DRIFT_SPEED,
  fieldDensity,
  glint,
} from "./dither";
import { LIGHT_PURPLE, type Rgb } from "./palette";
import { BAYER4 } from "./pixel";

/**
 * One animation loop for every dither surface on the page. It runs from an inline
 * script in the document head, so surfaces animate from the first painted frame
 * rather than after hydration, and picks up surfaces mounted later (dialogs, menus).
 *
 * Surfaces are plain markup described by data attributes:
 * - `data-dither="gradient"` with `data-from`, `data-to` ("r,g,b", "primary" or
 *   "transparent"), `data-direction`, `data-cell` and `data-opacity`.
 * - `data-dither="clouds"` with `data-variant` ("primary", "contours", "clouds") and
 *   `data-fit` ("fill" or "cover").
 * Both take `data-animated="false"` to stay still, and contain a `canvas[data-dither-canvas]`
 * plus an optional `[data-dither-still]` shown until the canvas paints.
 */

/** Stepped frame rate keeps the motion reading as pixel art and the cost low. */
const FPS = 12;
const MAX_COLS = 960;
const MAX_ROWS = 600;
/** Size of the generated cloud artwork, which `fit` scales like a background image. */
const ART_W = 960;
const ART_H = 600;
/** CSS pixels per animated cloud dot. */
const CLOUD_CELL = 2;
const PRIMARY_FALLBACK: Rgb = [40, 117, 197];

type Direction = "up" | "down" | "left" | "right";

type Grid = {
  cols: number;
  rows: number;
  field: Float32Array;
  threshold: Float32Array;
  hash: Float32Array;
  /** Gradient: alpha falloff per cell. */
  fade: Float32Array | null;
  /** Clouds: RGBA when lit, then when off. */
  on: Uint8ClampedArray | null;
  off: Uint8ClampedArray | null;
  image: ImageData;
};

type Surface = {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid: Grid | null;
  dirty: boolean;
  visible: boolean;
  /** Gradient colours resolved at layout time. */
  from: Rgb;
  to: Rgb | null;
};

declare global {
  interface Window {
    __featulDither?: boolean;
  }
}

function parseColor(value: string, el: Element): Rgb | null {
  if (value === "transparent") return null;
  if (value === "primary") {
    const css = getComputedStyle(el).getPropertyValue("--primary").trim();
    const probe = document.createElement("canvas").getContext("2d");
    if (!css || !probe) return PRIMARY_FALLBACK;
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  }
  const [r = 0, g = 0, b = 0] = value.split(",").map(Number);
  return [r, g, b];
}

function emptyGrid(ctx: CanvasRenderingContext2D, cols: number, rows: number) {
  const size = cols * rows;
  return {
    cols,
    rows,
    field: new Float32Array(size),
    threshold: new Float32Array(size),
    hash: new Float32Array(size),
    fade: null,
    on: null,
    off: null,
    image: ctx.createImageData(cols, rows),
  } as Grid;
}

function gradientGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cell: number,
  direction: Direction,
) {
  const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / cell)));
  const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / cell)));
  const grid = emptyGrid(ctx, cols, rows);
  const fade = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const u = (x + 0.5) / cols;
      const v = (y + 0.5) / rows;
      const t =
        direction === "up"
          ? 1 - v
          : direction === "down"
            ? v
            : direction === "left"
              ? 1 - u
              : u;
      fade[i] = Math.sqrt(1 - t);
      // Rotate the shared contours with the requested fade direction.
      grid.field[i] =
        direction === "up"
          ? contourField(1 - u, 1 - v)
          : direction === "left"
            ? contourField(v, 1 - u)
            : direction === "right"
              ? contourField(1 - v, u)
              : contourField(u, v);
      grid.threshold[i] = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      grid.hash[i] = cellHash(x, y);
    }
  }
  grid.fade = fade;
  return grid;
}

function cloudGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  variant: string,
  fit: string,
) {
  const cols = Math.max(4, Math.round(width / CLOUD_CELL));
  const rows = Math.max(4, Math.round(height / CLOUD_CELL));
  const grid = emptyGrid(ctx, cols, rows);
  const on = new Uint8ClampedArray(cols * rows * 4);
  const off = new Uint8ClampedArray(cols * rows * 4);
  // Map each dot back to artwork coordinates the way the background image is laid out.
  const scale = Math.max(width / ART_W, height / ART_H);
  const artW = fit === "cover" ? ART_W * scale : width;
  const artH = fit === "cover" ? ART_H * scale : height;
  const left = (width - artW) / 2;
  const top = (height - artH) / 2;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const u = (((x + 0.5) / cols) * width - left) / artW;
      const v = (((y + 0.5) / rows) * height - top) / artH;
      const threshold = BAYER4[y & 3]?.[x & 3] ?? 0.5;
      grid.field[i] = contourField(u, v);
      grid.threshold[i] = threshold;
      grid.hash[i] = cellHash(x, y);
      const p = i * 4;
      if (variant === "primary") {
        // Off dots stay transparent so the container's bg-primary shows through.
        on.set([...LIGHT_PURPLE, 255], p);
      } else if (variant === "contours") {
        // Thresholds outside [0, 1] force the lit and unlit colours.
        on.set([...contourColor(u, v, -1), 255], p);
        off.set([...contourColor(u, v, 2), 255], p);
      } else {
        // The cloud art has no rings; its dots only glint.
        const color = [...cloudColor(u, v, threshold), 255];
        on.set(color, p);
        off.set(color, p);
      }
    }
  }
  grid.on = on;
  grid.off = off;
  return grid;
}

/**
 * Paints one frame. At `time` 0 this is the still artwork; as time runs the rings
 * ripple outward, so dots switch on and off through the Bayer grid, and lit dots glint.
 */
function paint(s: Surface, time: number) {
  const grid = s.grid;
  if (!grid) return;
  const { cols, rows, field, threshold, hash, fade, on, off, image } = grid;
  const data = image.data;
  const clouds = s.el.dataset.dither === "clouds";
  const ringless = clouds && s.el.dataset.variant === "clouds";
  const drift = ringless ? 0 : time * DRIFT_SPEED;
  const o = Number(s.el.dataset.opacity ?? 1);

  for (let i = 0; i < cols * rows; i++) {
    const density = ringless ? 1 : fieldDensity(field[i]! - drift);
    const lit = ringless || density > threshold[i]!;
    const g = lit && time > 0 ? glint(hash[i]!, time) : 0;
    const p = i * 4;
    let r: number, gr: number, b: number, a: number, shine: number;
    if (clouds) {
      const src = lit ? on! : off!;
      r = src[p]!;
      gr = src[p + 1]!;
      b = src[p + 2]!;
      a = src[p + 3]! / 255;
      shine = 0.55 * g;
    } else {
      const color = lit || !s.to ? s.from : s.to;
      r = color[0];
      gr = color[1];
      b = color[2];
      a = s.to ? o : (lit ? 0.75 + 0.25 * density : 0.035) * o * fade![i]!;
      if (g > 0) a = Math.min(1, a * (1 + 2 * g));
      shine = 0.35 * g;
    }
    data[p] = r + (255 - r) * shine;
    data[p + 1] = gr + (255 - gr) * shine;
    data[p + 2] = b + (255 - b) * shine;
    data[p + 3] = a <= 0.004 ? 0 : a * 255;
  }
  s.ctx.putImageData(image, 0, 0);
  const bloom = s.el.querySelector<HTMLCanvasElement>("[data-dither-bloom]");
  const bctx = bloom?.getContext("2d");
  if (bloom && bctx) {
    if (bloom.width !== cols) bloom.width = cols;
    if (bloom.height !== rows) bloom.height = rows;
    bctx.clearRect(0, 0, cols, rows);
    bctx.drawImage(s.canvas, 0, 0);
  }
}

export function startDitherEngine() {
  if (typeof window === "undefined" || window.__featulDither) return;
  window.__featulDither = true;

  const surfaces = new Map<HTMLElement, Surface>();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const still = (s: Surface) => reduce.matches || s.el.dataset.animated === "false";
  const clock = () => performance.now() / 1000;

  const io =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const s = surfaces.get(entry.target as HTMLElement);
            if (s) s.visible = entry.isIntersecting;
          }
        });
  const ro =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver((entries) => {
          for (const entry of entries) {
            const s = surfaces.get(entry.target as HTMLElement);
            if (s) s.dirty = true;
          }
          wake();
        });

  /** Rebuilds the grid for the surface's size and props, then paints its current frame. */
  const layout = (s: Surface) => {
    const box = s.el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1 || s.ctx.isContextLost?.()) return;
    const d = s.el.dataset;
    if (d.dither === "clouds") {
      s.grid = cloudGrid(s.ctx, box.width, box.height, d.variant ?? "clouds", d.fit ?? "fill");
    } else {
      s.grid = gradientGrid(
        s.ctx,
        box.width,
        box.height,
        Number(d.cell ?? 3),
        (d.direction ?? "up") as Direction,
      );
      s.from = parseColor(d.from ?? "primary", s.el) ?? PRIMARY_FALLBACK;
      s.to = parseColor(d.to ?? "transparent", s.el);
    }
    s.dirty = false;
    if (s.canvas.width !== s.grid.cols) s.canvas.width = s.grid.cols;
    if (s.canvas.height !== s.grid.rows) s.canvas.height = s.grid.rows;
    paint(s, still(s) ? 0 : clock());
    const stillLayer = s.el.querySelector<HTMLElement>("[data-dither-still]");
    if (stillLayer) stillLayer.style.visibility = "hidden";
  };

  const add = (el: HTMLElement) => {
    if (surfaces.has(el)) return;
    const canvas = el.querySelector<HTMLCanvasElement>("canvas[data-dither-canvas]");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const s: Surface = {
      el,
      canvas,
      ctx,
      grid: null,
      dirty: true,
      visible: !io,
      from: PRIMARY_FALLBACK,
      to: null,
    };
    surfaces.set(el, s);
    canvas.addEventListener("contextrestored", () => {
      s.dirty = true;
      wake();
    });
    io?.observe(el);
    ro?.observe(el);
    // Paint now, before the browser's next frame, so there is never a still flash.
    layout(s);
    wake();
  };

  const scan = (node: Node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.dither) add(node);
    node.querySelectorAll<HTMLElement>("[data-dither]").forEach(add);
  };

  const prune = () => {
    for (const [el] of surfaces) {
      if (el.isConnected) continue;
      surfaces.delete(el);
      io?.unobserve(el);
      ro?.unobserve(el);
    }
  };

  new MutationObserver((records) => {
    let removed = false;
    for (const record of records) {
      if (record.type === "attributes") {
        const s = surfaces.get(record.target as HTMLElement);
        if (s) s.dirty = true;
        continue;
      }
      record.addedNodes.forEach(scan);
      if (record.removedNodes.length) removed = true;
    }
    if (removed) prune();
    wake();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-from",
      "data-to",
      "data-direction",
      "data-cell",
      "data-opacity",
      "data-variant",
      "data-fit",
      "data-animated",
    ],
  });

  // Theme switches change --primary.
  new MutationObserver(() => {
    surfaces.forEach((s) => (s.dirty = true));
    wake();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });

  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    raf = 0;
    let moving = false;
    for (const s of surfaces.values()) {
      if (!s.el.isConnected) continue;
      if (s.dirty) layout(s);
      if (still(s) || !s.grid) continue;
      moving = true;
      if (s.visible && now - last >= 1000 / FPS) paint(s, now / 1000);
    }
    if (now - last >= 1000 / FPS) last = now;
    if (moving) raf = window.requestAnimationFrame(tick);
  };
  function wake() {
    if (!raf) raf = window.requestAnimationFrame(tick);
  }

  reduce.addEventListener("change", () => {
    surfaces.forEach((s) => (s.dirty = true));
    wake();
  });
  window.addEventListener("pageshow", () => {
    surfaces.forEach((s) => (s.dirty = true));
    wake();
  });

  scan(document.documentElement);
  document.addEventListener("DOMContentLoaded", () => scan(document.documentElement));
}
