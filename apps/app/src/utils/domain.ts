export function hostFromDomain(domain: string) {
  const raw = domain.trim()
  if (!raw) return ""
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).host
  } catch {
    return raw.replace(/^https?:\/\//, "").split("/")[0] || ""
  }
}

export function faviconUrlForDomain(domain: string, size = 128) {
  const host = hostFromDomain(domain)
  if (!host) return ""
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(host)}&sz=${size}`
}
