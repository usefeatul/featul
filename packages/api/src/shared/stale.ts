export const STALE_THRESHOLD_DAYS = 30
export const STALE_STATUS_KEY = "stale"
export const STALE_RESOLVED_STATUSES = ["completed", "closed"] as const

export function isStaleStatusFilter(value: string) {
  return value.trim().toLowerCase() === STALE_STATUS_KEY
}
