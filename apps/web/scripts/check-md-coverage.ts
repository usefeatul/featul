#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Fails when a public page route has no Markdown twin.
 *
 * Every `page.tsx` under src/app must map to an entry in MARKDOWN_PATTERNS
 * (with a renderer in src/lib/md/registry.ts) or to MARKDOWN_SKIPPED_PATTERNS
 * with a reason. Also renders one concrete path per pattern to catch broken
 * renderers.
 *
 * Run with: bun run check-md
 */

import { readdirSync, statSync } from "node:fs"
import path from "node:path"
import { MARKDOWN_PATTERNS, MARKDOWN_SKIPPED_PATTERNS } from "../src/lib/md/patterns"
import { listMarkdownRoutes, MARKDOWN_REGISTRY, resolveMarkdown } from "../src/lib/md/registry"

const APP_DIR = path.join(import.meta.dir, "..", "src", "app")

function findPages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return findPages(full)
    return name === "page.tsx" ? [full] : []
  })
}

function toPattern(file: string) {
  const segments = path
    .relative(APP_DIR, path.dirname(file))
    .split(path.sep)
    .filter((segment) => segment && !/^\(.+\)$/.test(segment))
  return `/${segments.join("/")}`
}

const known = new Set<string>(MARKDOWN_PATTERNS)
const errors: string[] = []

for (const file of findPages(APP_DIR)) {
  const pattern = toPattern(file)
  if (!known.has(pattern) && !(pattern in MARKDOWN_SKIPPED_PATTERNS)) {
    errors.push(`${pattern} (${path.relative(process.cwd(), file)}) has no Markdown renderer. Add it to MARKDOWN_PATTERNS + registry, or to MARKDOWN_SKIPPED_PATTERNS with a reason.`)
  }
}

for (const pattern of MARKDOWN_PATTERNS) {
  if (!MARKDOWN_REGISTRY[pattern]) errors.push(`${pattern} is in MARKDOWN_PATTERNS but has no renderer.`)
}

const entries = await listMarkdownRoutes()
const counts = new Map<string, number>()
for (const pattern of MARKDOWN_PATTERNS) {
  const sample = entries.find((entry) => entry.pattern === pattern)
  counts.set(pattern, entries.filter((entry) => entry.pattern === pattern).length)
  if (!sample) continue // e.g. blog posts without CMS credentials
  const resolved = await resolveMarkdown(sample.path)
  if (!resolved) errors.push(`${pattern}: entry ${sample.path} is listed but renders nothing.`)
}

for (const [pattern, count] of counts) console.log(`  ${String(count).padStart(3)}  ${pattern}`)

if (errors.length) {
  console.error(`\n✗ Markdown coverage check failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`)
  process.exit(1)
}
console.log(`\n✓ ${entries.length} Markdown routes across ${MARKDOWN_PATTERNS.length} patterns; every public page is covered.`)
