const DEFAULT_SITE_URL = "https://www.featul.com"

function normalizeSiteUrl(input?: string) {
  const candidate = input?.trim() || DEFAULT_SITE_URL

  try {
    const url = new URL(candidate)

    if (url.hostname === "featul.com") {
      url.hostname = "www.featul.com"
    }

    url.hash = ""
    // URL#toString() re-adds a trailing slash for origin-only URLs
    // (e.g. https://www.featul.com/). Strip it so `${SITE_URL}/path`
    // never becomes `https://www.featul.com//path`.
    return url.toString().replace(/\/$/, "")
  } catch {
    return DEFAULT_SITE_URL
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

/** Join SITE_URL with a path without producing double slashes. */
export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (normalized === "/") return `${SITE_URL}/`
  return `${SITE_URL}${normalized}`
}

export const DEFAULT_TITLE = "Featul"
export const TITLE_TEMPLATE = "%s - Featul"

export const DEFAULT_DESCRIPTION =
  "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery."

export const DEFAULT_KEYWORDS = [
  "product feedback",
  "roadmap",
  "changelog",
  "EU hosting",
  "GDPR",
  "SaaS",
]

export const DEFAULT_OG_IMAGE = "/og.png"

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Featul',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/og.png'),
    sameAs: [
      "https://github.com/usefeatul/feautl",
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'contact@featul.com',
        contactType: 'customer support',
      },
    ],
  }
}

