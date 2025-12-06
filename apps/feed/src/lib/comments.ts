export function encodeCollapsedIds(ids: Iterable<string>): string {
  const list = Array.from(ids)
  return list.join(",")
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)")
  return v ? decodeURIComponent(v[2]) : null
}

export function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return
  const d = new Date()
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
  document.cookie = name + "=" + encodeURIComponent(value) + ";path=/;expires=" + d.toUTCString()
}
