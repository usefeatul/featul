/**
 * Public content routes that have a Markdown twin. Kept free of renderer
 * imports so `proxy.ts` can use it for `.md` and `Accept` negotiation.
 *
 * Adding a page: add its app route pattern here, then register a renderer in
 * `registry.ts` (TypeScript fails until both exist).
 */
export const MARKDOWN_PATTERNS = [
  "/",
  "/pricing",
  "/docs/[...slug]",
  "/alternatives",
  "/alternatives/[slug]",
  "/integrations",
  "/integrations/[slug]",
  "/use-cases",
  "/use-cases/[slug]",
  "/definitions",
  "/definitions/[term]",
  "/tools",
  "/tools/categories",
  "/tools/categories/[category]",
  "/tools/categories/[category]/[tool]",
  "/blog",
  "/blog/[slug]",
  "/terms",
  "/privacy",
  "/gdpr",
] as const

export type MarkdownPattern = (typeof MARKDOWN_PATTERNS)[number]

/** App routes deliberately without a Markdown twin. Checked by `scripts/check-md-coverage.ts`. */
export const MARKDOWN_SKIPPED_PATTERNS: Record<string, string> = {
  "/search": "noindex search results page",
  "/docs": "redirects to the docs home page",
}

export type MarkdownParams = Record<string, string>

function compile(pattern: string) {
  const parts = pattern.split("/").filter(Boolean)
  const keys: string[] = []
  const source = parts
    .map((part) => {
      const rest = /^\[\.\.\.(.+)\]$/.exec(part)
      if (rest) {
        keys.push(rest[1]!)
        return "/(.+)"
      }
      const param = /^\[(.+)\]$/.exec(part)
      if (param) {
        keys.push(param[1]!)
        return "/([^/]+)"
      }
      return `/${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
    })
    .join("")
  return { regex: new RegExp(`^${source || "/"}$`), keys }
}

const COMPILED = MARKDOWN_PATTERNS.map((pattern) => ({ pattern, ...compile(pattern) }))

export function normalizeContentPath(path?: string) {
  if (!path) return "/"
  const withSlash = path.startsWith("/") ? path : `/${path}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash
}

export function matchMarkdownPattern(
  path: string,
): { pattern: MarkdownPattern; params: MarkdownParams } | null {
  const normalized = normalizeContentPath(path)
  for (const { pattern, regex, keys } of COMPILED) {
    const match = regex.exec(normalized)
    if (!match) continue
    const params: MarkdownParams = {}
    keys.forEach((key, i) => {
      params[key] = decodeURIComponent(match[i + 1]!)
    })
    return { pattern, params }
  }
  return null
}

/** HTML path → public Markdown twin (`/` → `/index.md`, `/pricing` → `/pricing.md`). */
export function htmlPathToMarkdownPath(path?: string): string | undefined {
  const normalized = normalizeContentPath(path)
  if (!matchMarkdownPattern(normalized)) return undefined
  return normalized === "/" ? "/index.md" : `${normalized}.md`
}

/** Public Markdown twin → HTML path (`/index.md` → `/`). */
export function markdownPathToHtmlPath(path: string) {
  const normalized = normalizeContentPath(path)
  const stripped = normalized.replace(/\.md$/, "")
  return stripped === "/index" || stripped === "" ? "/" : stripped
}
