export function formatTime12h(tz: string, d: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(d)
    const h = parts.find((p) => p.type === "hour")?.value || ""
    const m = parts.find((p) => p.type === "minute")?.value || ""
    const ap = (parts.find((p) => p.type === "dayPeriod")?.value || "").toUpperCase()
    return `${h}:${m} ${ap}`.trim()
  } catch {
    return ""
  }
}

export function relativeTime(date: string): string {
  const past = new Date(date)
  const ts = past.getTime()
  if (isNaN(ts)) return ""
  const diffMs = Date.now() - ts
  if (diffMs < 60_000) return "just now"
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(past)
}
