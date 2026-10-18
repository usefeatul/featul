/** Cookie-backed so the server renders pinned items in place on first paint. */
export function sidebarPinsCookieName(slug: string) {
  return `featul_sidebar_pins_${slug}`
}

export function parseSidebarPins(value: string | undefined | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(decodeURIComponent(value))
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
  } catch {
    return []
  }
}

export function serializeSidebarPins(pins: string[]) {
  return encodeURIComponent(JSON.stringify(pins))
}
