import type { MarkdownParams, MarkdownPattern } from "./patterns"

/** llms.txt / llms-full.txt section, in output order. */
export type MarkdownSection = "core" | "docs" | "compare" | "learn" | "tools" | "blog" | "legal"

export type MarkdownLink = { label: string; href: string; description?: string }

/** One rendered page. `body` is the main content only, below the summary. */
export type MarkdownDoc = {
  title: string
  summary: string
  /** Canonical HTML path, e.g. `/pricing`. */
  path: string
  /** ISO date (YYYY-MM-DD) when the content last changed, if known. */
  updated?: string
  body: string
  related?: MarkdownLink[]
}

/** One addressable page, used by llms.txt, llms-full.txt and the catalog. */
export type MarkdownEntry = {
  path: string
  title: string
  description: string
}

export type MarkdownRoute = {
  section: MarkdownSection
  /** Every concrete path this pattern serves (one entry for static pages). */
  entries: () => MarkdownEntry[] | Promise<MarkdownEntry[]>
  render: (params: MarkdownParams) => MarkdownDoc | null | Promise<MarkdownDoc | null>
  /** Cap on entries listed in llms.txt (default 50). */
  llmsLimit?: number
  /** Cap on entries rendered into llms-full.txt (default: all; 0 to skip). */
  fullLimit?: number
  /** Static pages cache longer at the edge. */
  static?: boolean
}

export type MarkdownRegistry = Record<MarkdownPattern, MarkdownRoute>
