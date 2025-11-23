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

