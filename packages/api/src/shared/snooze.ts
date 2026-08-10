export const SNOOZED_STATUS_KEY = "snoozed"

export const SNOOZE_PRESETS = [
  { id: "1d", label: "1 day", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
] as const

export type SnoozePresetId = (typeof SNOOZE_PRESETS)[number]["id"]

export function isSnoozedStatusFilter(value: string) {
  return value.trim().toLowerCase() === SNOOZED_STATUS_KEY
}

export function snoozeUntilFromDays(days: number, now = new Date()) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}

export function isActivelySnoozed(
  snoozedUntil: string | Date | null | undefined,
  now = new Date(),
) {
  if (!snoozedUntil) return false
  const until =
    snoozedUntil instanceof Date ? snoozedUntil : new Date(snoozedUntil)
  if (!Number.isFinite(until.getTime())) return false
  return until.getTime() > now.getTime()
}
