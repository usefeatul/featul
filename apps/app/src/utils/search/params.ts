import { parseSortOrder, type SortOrder } from "@/types/sort"

export type SearchParamValue = string | string[] | null | undefined

export function getSingleSearchParam(value: SearchParamValue): string | null {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

export function parsePositiveIntSearchParam(
  value: SearchParamValue,
  fallback = 1
): number {
  const raw = getSingleSearchParam(value)
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.trunc(parsed))
}

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

export function normalizeSlugList(items: string[]): string[] {
  return items.map((item) => item.trim().toLowerCase()).filter(Boolean)
}

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
