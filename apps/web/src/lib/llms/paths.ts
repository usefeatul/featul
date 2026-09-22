function normalizePath(path?: string) {
  if (!path) return "/"
  const withSlash = path.startsWith("/") ? path : `/${path}`
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

/** HTML path → public Markdown twin (`/index.md`, `/pricing.md`, `/docs/....md`). */
export function htmlPathToMarkdownPath(path?: string): string | undefined {
  const canonical = normalizePath(path)
  if (canonical === "/") return "/index.md"
  if (canonical === "/pricing") return "/pricing.md"
  if (canonical === "/docs" || canonical.startsWith("/docs/")) {
    if (canonical.endsWith(".txt") || canonical.endsWith(".md")) return undefined
    return `${canonical}.md`
  }
  return undefined
}

export function normalizeMarkdownPathname(path?: string) {
  return normalizePath(path)
}
