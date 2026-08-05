const SKY_PATHS = new Set([
  "/",
  "/pricing",
  "/blog",
  "/terms",
  "/privacy",
  "/gdpr",
  "/tools",
  "/tools/categories",
  "/definitions",
  "/use-cases",
  "/alternatives",
  "/integrations",
])

const SKY_PREFIXES = [
  "/blog/",
  "/tools/",
  "/definitions/",
  "/use-cases/",
  "/alternatives/",
  "/integrations/",
]

export function isSkyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (SKY_PATHS.has(pathname)) return true
  return SKY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
