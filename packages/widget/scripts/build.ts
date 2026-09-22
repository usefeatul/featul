import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src/host/index.ts");
const outdir = join(root, "dist");
const outfile = join(outdir, "sdk.js");
const generated = join(root, "src/source.ts");

mkdirSync(outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: [entry],
  outdir,
  target: "browser",
  format: "iife",
  minify: true,
  naming: "sdk.js",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const source = readFileSync(outfile, "utf8");
writeFileSync(
  generated,
  `export const WIDGET_SDK_SOURCE = ${JSON.stringify(source)};\n\nexport function getWidgetSdkSource() {\n  return WIDGET_SDK_SOURCE;\n}\n`,
);
