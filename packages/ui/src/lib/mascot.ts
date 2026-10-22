import { BAYER4 } from "./pixel";

/** The mascot is drawn on a 32×32 grid, then scaled up with crisp edges. */
export const MASCOT_GRID = 32;

export type MascotMood = "idle" | "search" | "sleep";

export type MascotTone =
  | "face"
  | "shade"
  | "base"
  | "light"
  | "blush"
  | "ink"
  | "spark";

export type MascotArt = {
  layers: Partial<Record<MascotTone, string>>;
  eyes: { ink: string; spark: string };
  mouth: string;
  marks: string;
};

const circle = (x: number, y: number, cx: number, cy: number, r: number) =>
  (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

function roundRect(
  x: number,
  y: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const dx = Math.max(x0 + r - x, 0, x - (x1 - r));
  const dy = Math.max(y0 + r - y, 0, y - (y1 - r));
  return dx * dx + dy * dy <= r * r;
}

function triangle(
  x: number,
  y: number,
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
  [cx, cy]: [number, number],
) {
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  const a = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d;
  const b = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
  return a >= 0 && b >= 0 && a + b <= 1;
}

const Z_SMALL = ["###", ".#.", "###"];

function stamp(glyph: string[], ox: number, oy: number, put: (x: number, y: number) => void) {
  glyph.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === "#") put(ox + x, oy + y);
    }),
  );
}

/** Joins horizontal runs of cells into compact path data. */
function toPath(cells: Set<number>) {
  let d = "";
  for (let y = 0; y < MASCOT_GRID; y++) {
    let x = 0;
    while (x < MASCOT_GRID) {
      if (!cells.has(y * MASCOT_GRID + x)) {
        x++;
        continue;
      }
      const start = x;
      while (x < MASCOT_GRID && cells.has(y * MASCOT_GRID + x)) x++;
      d += `M${start} ${y}h${x - start}v1h${start - x}z`;
    }
  }
  return d;
}

/** A tone-per-cell canvas; later puts win, so paint back to front. */
function painter() {
  const N = MASCOT_GRID;
  const tones = new Map<MascotTone, Set<number>>();
  const put = (tone: MascotTone, x: number, y: number) => {
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const index = y * N + x;
    for (const set of tones.values()) set.delete(index);
    if (!tones.has(tone)) tones.set(tone, new Set());
    tones.get(tone)!.add(index);
  };
  const layers = () => {
    const out: MascotArt["layers"] = {};
    for (const [tone, set] of tones) out[tone] = toPath(set);
    return out;
  };
  return { put, layers };
}

/**
 * Tully: a face in a rounded pixel square, so the same art also works as an
 * avatar. Headphones because Featul's job is listening to feedback; the cowlick
 * is the tail of the logo's speech bubble, breaking out of the frame. Flat
 * fills, with dither only in the hair.
 */
function faceArt(mood: MascotMood): MascotArt {
  const N = MASCOT_GRID;
  const { put, layers } = painter();
  const cell = (x: number, y: number) => y * N + x;

  const tile = (x: number, y: number) => roundRect(x, y, 2, 3, 30, 30, 5);
  const tuft = (x: number, y: number) =>
    triangle(x, y, [16.5, 4], [22, 4], [23.5, 0.4]) || circle(x, y, 22.6, 1.7, 1.4);
  const cup = (x: number, y: number) =>
    roundRect(x, y, 1, 13, 6.5, 23, 2) || roundRect(x, y, 25.5, 13, 31, 23, 2);
  const shape = (x: number, y: number) => tile(x, y) || tuft(x, y) || cup(x, y);
  // Low over the left eye, lifting to show the raised right brow.
  const hairline = (x: number) => (x < 20 ? 13 - (x - 2) * 0.22 : 9 + (x - 20) * 0.45);
  // The band rides over the crown and drops to the cups at ear level.
  const band = (x: number) => 7.2 + ((x - 16) / 11.5) ** 2 * 6.2;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      if (!shape(px, py)) {
        const edge = shape(px - 1, py) || shape(px + 1, py) || shape(px, py - 1) || shape(px, py + 1);
        if (edge) put("ink", x, y);
        continue;
      }
      if (cup(px, py)) {
        const left = px < 16;
        const inner = left ? roundRect(px, py, 2, 14, 5.5, 22, 1.2) : roundRect(px, py, 26.5, 14, 30, 22, 1.2);
        const cushion = left ? px > 5 : px < 26.5;
        put(!inner || cushion ? "ink" : py < 15.5 && (left ? px < 3.5 : px > 28.5) ? "light" : "shade", x, y);
        continue;
      }
      const yb = band(px);
      if (px > 4 && px < 28 && Math.abs(py - yb) < 1.6) {
        put(Math.abs(py - yb) < 0.6 ? "shade" : "ink", x, y);
        continue;
      }
      if (py < hairline(px) || tuft(px, py)) {
        const threshold = BAYER4[y & 3]![x & 3]!;
        // Light from the top left, a darker band down the right like a cast shadow.
        const lit = 0.55 - (px - 16) / 22 - (py - 8) / 16;
        put(lit > 0.95 + threshold * 0.3 ? "light" : lit < threshold * 0.5 - 0.25 ? "shade" : "base", x, y);
        continue;
      }
      put("face", x, y);
    }
  }

  const eyeInk = new Set<number>();
  const eyeSpark = new Set<number>();
  const mouth = new Set<number>();
  const marks = new Set<number>();
  const look = mood === "search" ? 1 : 0;

  for (const ex of [10, 19]) {
    const x0 = ex + look;
    if (mood === "sleep") {
      eyeInk.add(cell(x0, 18)).add(cell(x0 + 1, 19)).add(cell(x0 + 2, 18));
      continue;
    }
    // Tall pill eyes with the corners clipped and a catchlight.
    for (let dy = 0; dy < 5; dy++)
      for (let dx = 0; dx < 3; dx++)
        if (!((dy === 0 || dy === 4) && dx !== 1)) eyeInk.add(cell(x0 + dx, 15 + dy - look));
    eyeInk.delete(cell(x0 + 1, 16 - look));
    eyeSpark.add(cell(x0 + 1, 16 - look));
  }

  // One raised brow does most of the acting.
  const brow = mood === "search" ? 11 : mood === "sleep" ? 13 : 12;
  for (const [dx, dy] of [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]] as const)
    put("ink", 18 + dx + look, brow + dy);

  for (const bx of [8, 22]) {
    put("blush", bx, 21);
    put("blush", bx + 1, 21);
  }

  if (mood === "idle") {
    mouth.add(cell(14, 23)).add(cell(17, 23)).add(cell(15, 24)).add(cell(16, 24));
  } else if (mood === "search") {
    mouth.add(cell(16, 23)).add(cell(17, 23)).add(cell(16, 24)).add(cell(17, 24));
  } else {
    mouth.add(cell(15, 24)).add(cell(16, 24));
  }

  if (mood === "sleep") {
    stamp(Z_SMALL, 1, 0, (x, y) => marks.add(cell(x, y)));
  }

  return {
    layers: layers(),
    eyes: { ink: toPath(eyeInk), spark: toPath(eyeSpark) },
    mouth: toPath(mouth),
    marks: toPath(marks),
  };
}

const cache = new Map<MascotMood, MascotArt>();

/** Pure and deterministic, so server and client render identical markup. */
export function mascotArt(mood: MascotMood): MascotArt {
  const hit = cache.get(mood);
  if (hit) return hit;
  const art = faceArt(mood);
  cache.set(mood, art);
  return art;
}
