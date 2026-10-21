import { contourDensity } from "./dither";
import { BAYER4 } from "./pixel";

/** The mascot is drawn on a 32×32 grid, then scaled up with crisp edges. */
export const MASCOT_GRID = 32;

export type MascotVariant = "tully" | "pip" | "blip" | "puff" | "orbit" | "boo";
export type MascotMood = "idle" | "search" | "sleep";

/** Body tones dither between shade, base and light, like the kit's three-tone clouds. */
export type MascotTone =
  | "shade"
  | "base"
  | "light"
  | "blush"
  | "face"
  | "ink"
  | "spark"
  | "mark"
  | "shadow";

export type MascotArt = {
  layers: Partial<Record<MascotTone, string>>;
  eyes: { ink: string; spark: string };
  mouth: string;
  marks: string;
};

type Shape = {
  inside: (x: number, y: number) => boolean;
  /** Lighting centre and radius; light falls from the top left. */
  cx: number;
  cy: number;
  r: number;
  eyeY: number;
  eyeX: [number, number];
  /** Paint the kit's contour rings across the body. */
  contour?: boolean;
  /** Wrap the silhouette in a one-pixel ink line. */
  outline?: boolean;
  /** Ground shadow centre and half-width. */
  shadow?: [number, number, number];
  extras?: (x: number, y: number) => MascotTone | null;
  /** Small sprites held or worn for a mood, stamped over the body. */
  props?: Partial<Record<MascotMood, { at: [number, number]; sprite: string[] }>>;
  /** Where the sleeping z's float; defaults to the top right corner. */
  zzz?: { big: [number, number]; small: [number, number] };
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

// Featul's mark stood upright: a round body, the bubble's tail as a tuft, the inner arc as gloss.
const pipInside = (x: number, y: number) =>
  circle(x, y, 16, 16.5, 10) ||
  triangle(x, y, [17.5, 8], [22.5, 10], [22.5, 5]) ||
  circle(x, y, 22, 5.5, 2) ||
  roundRect(x, y, 10, 24, 13.5, 27.5, 1.5) ||
  roundRect(x, y, 18.5, 24, 22, 27.5, 1.5);

// Held up to the right eye; the glass stays clear so the eye shows through.
const MAGNIFIER = [
  "..ooo.....",
  ".o...o....",
  "ow....o...",
  "o.....o...",
  "o.....o...",
  ".o...o....",
  "..ooooo...",
  "......oo..",
  ".......oo.",
  "........oo",
  ".........oo",
  "..........oo",
  "...........o",
];

const SHAPES: Record<Exclude<MascotVariant, "tully">, Shape> = {
  pip: {
    inside: pipInside,
    cx: 16,
    cy: 16.5,
    r: 10,
    eyeY: 13,
    eyeX: [11, 19],
    outline: true,
    shadow: [17.5, 29.5, 9],
    extras: (x, y) => {
      if (!pipInside(x, y)) return null;
      const d = Math.hypot(x - 16, y - 16.5);
      const a = Math.atan2(y - 16.5, x - 16);
      return d > 6.6 && d < 7.7 && a > -2.75 && a < -1.9 ? "spark" : null;
    },
    props: { search: { at: [17, 10], sprite: MAGNIFIER } },
    zzz: { big: [1, 0], small: [6, 4] },
  },
  // A speech bubble, since every post starts as something someone said.
  blip: {
    inside: (x, y) =>
      roundRect(x, y, 5, 5, 27, 22, 6) ||
      triangle(x, y, [8, 20], [15, 20], [6.5, 27.5]),
    cx: 16,
    cy: 13.5,
    r: 11,
    eyeY: 11,
    eyeX: [11, 19],
  },
  // The kit's dithered clouds, gathered into one soft body.
  puff: {
    inside: (x, y) =>
      circle(x, y, 10.5, 17, 5.5) ||
      circle(x, y, 16.5, 12.5, 7) ||
      circle(x, y, 22, 16, 6) ||
      roundRect(x, y, 5, 15, 27.5, 24, 4.5),
    cx: 16,
    cy: 16,
    r: 11,
    eyeY: 15,
    eyeX: [12, 19],
  },
  // A round signal with an antenna, wrapped in the kit's contour rings.
  orbit: {
    inside: (x, y) =>
      circle(x, y, 16, 17, 10.5) ||
      (x >= 15.5 && x <= 16.5 && y >= 4 && y <= 7.5),
    cx: 16,
    cy: 17,
    r: 10.5,
    eyeY: 15,
    eyeX: [12, 19],
    contour: true,
    extras: (x, y) => (circle(x, y, 16, 3.5, 1.9) ? "light" : null),
  },
  // A small ghost for places where there is nothing to haunt yet.
  boo: {
    inside: (x, y) => {
      if (y <= 14) return circle(x, y, 16, 14, 9.5);
      if (x < 6.5 || x > 25.5) return false;
      const hem = 24 + 1.6 * Math.cos(((x - 6.5) / 19) * Math.PI * 6);
      return y <= hem;
    },
    cx: 16,
    cy: 15,
    r: 10,
    eyeY: 12,
    eyeX: [12, 19],
  },
};

const Z_BIG = ["####", "..#.", ".#..", "####"];
const Z_SMALL = ["###", ".#.", "###"];
const QUESTION = [".##.", "#..#", "...#", "..#.", "....", "..#."];

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
 * Tully: a face cropped into an app-icon squircle, so the same art works as an
 * avatar. Headphones because Featul's job is listening to feedback; the tuft is
 * the tail of the logo's speech bubble. Flat fills, with dither only in the hair.
 */
function faceArt(mood: MascotMood): MascotArt {
  const N = MASCOT_GRID;
  const { put, layers } = painter();
  const cell = (x: number, y: number) => y * N + x;
  const squircle = (x: number, y: number) =>
    ((x - 16) / 12.5) ** 4 + ((y - 18) / 12.5) ** 4 <= 1;
  // Low over the left eye, lifting to show the raised right brow.
  const hairline = (x: number) => (x < 21 ? 14 - (x - 3) * 0.3 : 8.6 + (x - 21) * 0.5);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const tuft =
        triangle(px, py, [16, 7], [22, 7], [23, 1.5]) || circle(px, py, 22.2, 2.6, 1.9);
      if (!squircle(px, py) && !tuft) continue;
      if (py < hairline(px) || tuft) {
        const threshold = BAYER4[y & 3]![x & 3]!;
        // Light from the top left, a darker band down the right like a cast shadow.
        const lit = 0.55 - (px - 16) / 22 - (py - 10) / 18;
        put(lit > 0.75 + threshold * 0.3 ? "light" : lit < threshold * 0.5 - 0.2 ? "shade" : "base", x, y);
      } else {
        put("face", x, y);
      }
    }
  }

  // Headphones: a band over the crown and a cup on each side.
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const band = 5.4 + ((px - 16) / 12) ** 2 * 7.5;
      if (Math.abs(py - band) < 0.9 && px > 4.5 && px < 27.5) put("ink", x, y);
      for (const [x0, x1] of [[2, 6.5], [25.5, 30]] as const) {
        if (!roundRect(px, py, x0, 13, x1, 23, 2)) continue;
        const edge = !roundRect(px, py, x0 + 1, 14, x1 - 1, 22, 1.2);
        put(edge ? "ink" : py < 16 ? "light" : "base", x, y);
      }
    }
  }

  const eyeInk = new Set<number>();
  const eyeSpark = new Set<number>();
  const mouth = new Set<number>();
  const marks = new Set<number>();
  const look = mood === "search" ? 1 : 0;

  for (const ex of [9, 19]) {
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
  const brow = mood === "search" ? 10 : mood === "sleep" ? 13 : 11;
  for (const [dx, dy] of [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]] as const)
    put("ink", 18 + dx + look, brow + dy);

  for (const bx of [6, 23]) {
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
    stamp(Z_BIG, 2, 0, (x, y) => marks.add(cell(x, y)));
    stamp(Z_SMALL, 7, 2, (x, y) => marks.add(cell(x, y)));
  } else if (mood === "search") {
    stamp(QUESTION, 27, 4, (x, y) => marks.add(cell(x, y)));
  }

  return {
    layers: layers(),
    eyes: { ink: toPath(eyeInk), spark: toPath(eyeSpark) },
    mouth: toPath(mouth),
    marks: toPath(marks),
  };
}

const cache = new Map<string, MascotArt>();

/** Pure and deterministic, so server and client render identical markup. */
export function mascotArt(variant: MascotVariant, mood: MascotMood): MascotArt {
  const key = `${variant}:${mood}`;
  const hit = cache.get(key);
  if (hit) return hit;

  if (variant === "tully") {
    const art = faceArt(mood);
    cache.set(key, art);
    return art;
  }

  const shape = SHAPES[variant];
  const N = MASCOT_GRID;
  const { put, layers } = painter();
  const inside = (x: number, y: number) => shape.inside(x + 0.5, y + 0.5);

  // A dithered ground shadow, so the mascot sits on the page.
  const [sx, sy, sr] = shape.shadow ?? [16, 29, 10];
  for (let y = 27; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = ((x + 0.5 - sx) / sr) ** 2 + ((y + 0.5 - sy) / 1.7) ** 2;
      const threshold = BAYER4[y & 3]![x & 3]!;
      if (d < 1 && 1 - d > threshold * 0.9) put("shadow", x, y);
    }
  }

  const ramp: MascotTone[] = ["shade", "base", "light"];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const extra = shape.extras?.(x + 0.5, y + 0.5);
      if (extra) {
        put(extra, x, y);
        continue;
      }
      if (!inside(x, y)) continue;
      const threshold = BAYER4[y & 3]![x & 3]!;
      const nx = (x + 0.5 - shape.cx) / shape.r;
      const ny = (y + 0.5 - shape.cy) / shape.r;
      const light = Math.max(0, Math.min(1, 0.62 - 0.32 * nx - 0.46 * ny));
      const level = Math.min(1.999, light * 2);
      const lower = Math.floor(level);
      let tone = ramp[level - lower > threshold ? lower + 1 : lower]!;
      // Same ordered-dither rings as DitherGradient, kept off the face and shaded side.
      if (
        shape.contour &&
        tone === "base" &&
        !(Math.abs(nx) < 0.6 && ny > -0.4 && ny < 0.5) &&
        contourDensity(x / N, y / N) > threshold
      )
        tone = "light";
      // A shaded rim along the underside keeps the silhouette readable.
      if (!inside(x, y + 1)) tone = "shade";
      put(tone, x, y);
    }
  }

  if (shape.outline) {
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inside(x, y)) continue;
        if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1))
          put("ink", x, y);
      }
    }
  }

  const prop = shape.props?.[mood];
  if (prop) {
    const spriteTones: Record<string, MascotTone> = { o: "ink", l: "light", w: "spark" };
    prop.sprite.forEach((row, dy) =>
      [...row].forEach((ch, dx) => {
        const tone = spriteTones[ch];
        if (tone) put(tone, prop.at[0] + dx, prop.at[1] + dy);
      }),
    );
  }

  const [left, right] = shape.eyeX;
  const ey = shape.eyeY;
  const eyeInk = new Set<number>();
  const eyeSpark = new Set<number>();
  const mouth = new Set<number>();
  const marks = new Set<number>();
  const cell = (x: number, y: number) => y * N + x;
  const look = mood === "search" ? 1 : 0;

  for (const ex of [left, right]) {
    if (mood === "sleep") {
      eyeInk.add(cell(ex, ey + 2)).add(cell(ex + 1, ey + 2));
      continue;
    }
    for (let dy = 0; dy < 3; dy++)
      for (let dx = 0; dx < 2; dx++) eyeInk.add(cell(ex + dx + look, ey + dy - look));
    eyeInk.delete(cell(ex + look, ey - look));
    eyeSpark.add(cell(ex + look, ey - look));
    // Blush on the outer cheek, only where it lands on the body.
    const bx = ex === left ? ex - 2 : ex + 2;
    for (const dx of [0, 1]) if (inside(bx + dx, ey + 4)) put("blush", bx + dx, ey + 4);
  }

  const mx = Math.round((left + right + 1) / 2);
  const my = ey + 5;
  if (mood === "idle") {
    mouth.add(cell(mx - 2, my)).add(cell(mx + 1, my));
    mouth.add(cell(mx - 1, my + 1)).add(cell(mx, my + 1));
  } else if (mood === "search") {
    mouth.add(cell(mx, my)).add(cell(mx + 1, my));
  } else {
    mouth.add(cell(mx - 1, my)).add(cell(mx, my));
  }

  if (mood === "sleep") {
    const zzz = shape.zzz ?? { big: [27, 0], small: [23, 2] };
    stamp(Z_BIG, zzz.big[0], zzz.big[1], (x, y) => marks.add(cell(x, y)));
    stamp(Z_SMALL, zzz.small[0], zzz.small[1], (x, y) => marks.add(cell(x, y)));
  } else if (mood === "search" && !prop) {
    stamp(QUESTION, 27, 0, (x, y) => marks.add(cell(x, y)));
  }

  const art: MascotArt = {
    layers: layers(),
    eyes: { ink: toPath(eyeInk), spark: toPath(eyeSpark) },
    mouth: toPath(mouth),
    marks: toPath(marks),
  };
  cache.set(key, art);
  return art;
}
