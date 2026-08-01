const SKY_PATHS = new Set(["/", "/pricing", "/blog", "/terms", "/privacy", "/gdpr"])

export function isSkyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (SKY_PATHS.has(pathname)) return true
  // Individual blog posts share the same sky treatment as the blog index.
  if (pathname.startsWith("/blog/")) return true
  return false
}
