function decodeSelectionValue(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function selectingStorageKey(key: string): string {
  return `requests:isSelecting:${key}`
}

export function selectedStorageKey(key: string): string {
  return `requests:selected:${key}`
}

export function selectingCookieName(key: string): string {
  return `requests_isSelecting_${key}`
}

export function selectedCookieName(key: string): string {
  return `requests_selected_${key}`
}

export function parseSelectingValue(value: string | null | undefined): boolean {
  return value === "1" || value === "true"
}

export function parseSelectedIdsValue(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(decodeSelectionValue(value))
    if (!Array.isArray(parsed)) return undefined
    return parsed.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
  } catch {
    return undefined
  }
}
