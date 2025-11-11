export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const DEFAULT_TITLE = "Feedgot"
export const TITLE_TEMPLATE = "%s | Feedgot"

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

export const DEFAULT_OG_IMAGE = "/logo.png"

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Feedgot',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'contact@feedgot.com',
        contactType: 'customer support',
      },
    ],
  }
}

export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: DEFAULT_TITLE,
  }
}