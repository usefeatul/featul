export function parseArrayParam(v: string | null): string[] {
  try {
    if (!v) return []
    const arr = JSON.parse(v)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function encodeArray(arr: string[]): string {
  return encodeURIComponent(JSON.stringify(arr))
}

export function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]
}

export function isAllSelected(items: string[], selected: string[]): boolean {
  return items.length > 0 && selected.length === items.length
}

type SearchParamsLike = { get: (key: string) => string | null }

export function buildRequestsUrl(
  slug: string,
  prev: SearchParamsLike,
  overrides: Partial<{ status: string[]; board: string[]; tag: string[]; order: string; search: string }>
): string {
  const status = overrides.status ? encodeArray(overrides.status) : prev.get("status") || encodeArray([])
  const board = overrides.board ? encodeArray(overrides.board) : prev.get("board") || encodeArray([])
  const tag = overrides.tag ? encodeArray(overrides.tag) : prev.get("tag") || encodeArray([])
  const order = overrides.order || prev.get("order") || "newest"
  const search = overrides.search ?? prev.get("search") ?? ""
  return `/workspaces/${slug}/requests?status=${status}&board=${board}&tag=${tag}&order=${order}&search=${search}`
}
