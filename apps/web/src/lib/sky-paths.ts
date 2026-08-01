const SKY_PATHS = new Set(["/", "/pricing"])

export function isSkyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return SKY_PATHS.has(pathname)
}
