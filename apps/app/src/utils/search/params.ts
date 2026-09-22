import { parseSortOrder, type SortOrder } from "@/types/sort"

export type SearchParamValue = string | string[] | null | undefined

/** First string from a Next.js search param. Arrays take index 0. */
export function getSingleSearchParam(value: SearchParamValue): string | null {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

/** Truncate to a positive integer. Invalid values use `fallback`. */
export function parsePositiveIntSearchParam(
  value: SearchParamValue,
  fallback = 1
): number {
  const raw = getSingleSearchParam(value)
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.trunc(parsed))
}

/** Parse a sort query. Unrecognized values keep `fallback`, not `"newest"`. */
export function parseSortOrderParam(
  value: SearchParamValue,
  fallback: SortOrder = "newest"
): SortOrder {
  const raw = getSingleSearchParam(value)
  if (!raw) return fallback
  const parsed = parseSortOrder(raw)
  if (parsed === "newest" && raw.toLowerCase() !== "newest") {
    return fallback
  }
  return parsed
}

/** Lowercase, trim, and drop empty slug tokens. */
export function normalizeSlugList(items: string[]): string[] {
  return items.map((item) => item.trim().toLowerCase()).filter(Boolean)
}

/** Await Next.js `searchParams`. Missing or thrown promises become `undefined`. */
export async function resolveSearchParams<T>(
  searchParams?: Promise<T>
): Promise<T | undefined> {
  if (!searchParams) return undefined
  try {
    return await searchParams
  } catch {
    return undefined
  }
}
