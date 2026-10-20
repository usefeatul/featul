export type AnalyticsConsent = "granted" | "denied" | null
export const ANALYTICS_CONSENT_COOKIE = "featul_analytics"
const changeEvent = "featul:analytics-consent"

export function parseAnalyticsConsent(cookies: string): AnalyticsConsent {
  const values = cookies.split(";").map(value => value.trim())
    .filter(value => value.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
    .map(value => value.slice(ANALYTICS_CONSENT_COOKIE.length + 1))
  if (values.includes("v1.denied")) return "denied"
  return values.length === 1 && values[0] === "v1.granted" ? "granted" : null
}

export function browserForbidsAnalytics() {
  return typeof window === "undefined" || window.self !== window.top ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof document === "undefined") return null
  if (browserForbidsAnalytics()) return "denied"
  return parseAnalyticsConsent(document.cookie)
}

export function writeAnalyticsConsent(choice: Exclude<AnalyticsConsent, null>) {
  const hostname = window.location.hostname
  const shared = hostname === "featul.com" || hostname.endsWith(".featul.com")
  const security = window.location.protocol === "https:" ? "; Secure" : ""
  const domain = shared ? "; Domain=featul.com" : ""
  // Remove any older host-only copy so it cannot shadow the shared choice.
  if (shared) document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${security}`
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=v1.${choice}; Path=/; Max-Age=15552000; SameSite=Lax${security}${domain}`
  window.dispatchEvent(new Event(changeEvent))
}

export function subscribeAnalyticsConsent(listener: () => void) {
  let last = readAnalyticsConsent()
  const check = () => {
    const current = readAnalyticsConsent()
    if (current !== last) { last = current; listener() }
  }
  window.addEventListener(changeEvent, check)
  window.addEventListener("focus", check)
  document.addEventListener("visibilitychange", check)
  // Cookies shared across subdomains do not emit localStorage events.
  const timer = window.setInterval(check, 2000)
  return () => {
    window.removeEventListener(changeEvent, check)
    window.removeEventListener("focus", check)
    document.removeEventListener("visibilitychange", check)
    window.clearInterval(timer)
  }
}
