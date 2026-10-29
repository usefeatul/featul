/** Regenerate with: bun packages/ui/scripts/artwork.ts (writes src/lib/artwork/*.png) */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  cloudColor,
  contourColor,
  contourDensity,
  primaryContourColor,
} from "../src/lib/dither";
import { BAYER4 } from "../src/lib/pixel";

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const label = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([label, data])));
  return Buffer.concat([length, label, data, crc]);
}

/**
 * Encodes the artwork as a PNG, indexed when the dithered palette fits in 256 colours
 * (most of it does, and indexed files are a fraction of the size).
 */
function png(
  sample: (u: number, v: number, threshold: number) => number[],
  width = 960,
  height = 600,
) {
  const pixels: number[][] = [];
  const palette = new Map<string, number>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgba = sample(
        (x + 0.5) / width,
        (y + 0.5) / height,
        BAYER4[y & 3]![x & 3]!,
      ).map(Math.round);
      pixels.push(rgba);
      const key = rgba.join(",");
      if (!palette.has(key)) palette.set(key, palette.size);
    }
  }
  const indexed = palette.size <= 256;
  const stride = indexed ? 1 : 4;
  const raw = Buffer.alloc(height * (1 + width * stride));
  pixels.forEach((rgba, i) => {
    const y = Math.floor(i / width);
    const offset = y * (1 + width * stride) + 1 + (i % width) * stride;
    if (indexed) raw[offset] = palette.get(rgba.join(","))!;
    else for (let c = 0; c < 4; c++) raw[offset + c] = rgba[c]!;
  });
  const colors = [...palette.keys()].map((key) => key.split(",").map(Number));
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = indexed ? 3 : 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    ...(indexed
      ? [
          chunk("PLTE", Buffer.from(colors.flatMap((c) => c.slice(0, 3)))),
          chunk("tRNS", Buffer.from(colors.map((c) => c[3]!))),
        ]
      : []),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const contours = png((u, v, threshold) => [
  ...contourColor(u, v, threshold),
  255,
]);
const primaryContours = png(primaryContourColor);
const clouds = png((u, v, threshold) => [...cloudColor(u, v, threshold), 255]);
const masks = Object.fromEntries(
  ["up", "down", "left", "right"].map((direction) => [
    direction,
    png(
      (u, v, threshold) => {
        const fade =
          direction === "up"
            ? v
            : direction === "down"
              ? 1 - v
              : direction === "left"
                ? u
                : 1 - u;
        const density =
          direction === "up"
            ? contourDensity(1 - u, 1 - v)
            : direction === "left"
              ? contourDensity(v, 1 - u)
              : direction === "right"
                ? contourDensity(1 - v, u)
                : contourDensity(u, v);
        const alpha =
          (density > threshold ? 0.75 + 0.25 * density : 0.035) *
          Math.sqrt(fade);
        return [0, 0, 0, (Math.round(alpha * 31) / 31) * 255];
      },
      320,
      200,
    ),
  ]),
);
// Real files rather than data URIs: the bundler serves them as cacheable assets, so
// the artwork is not inlined (twice, with the RSC payload) into every page's HTML.
const files: Record<string, Buffer> = {
  contours,
  "primary-contours": primaryContours,
  clouds,
  ...Object.fromEntries(
    Object.entries(masks).map(([direction, bytes]) => [`mask-${direction}`, bytes]),
  ),
};
const dir = new URL("../src/lib/artwork/", import.meta.url);
mkdirSync(dir, { recursive: true });
for (const [name, bytes] of Object.entries(files)) {
  writeFileSync(new URL(`${name}.png`, dir), bytes);
  console.log(`${name}.png: ${bytes.length} bytes`);
}
