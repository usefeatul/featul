export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const DEFAULT_TITLE = "Feedgot"
export const TITLE_TEMPLATE = "%s — Feedgot"

export const DEFAULT_DESCRIPTION =
  "Plan, track, and ship projects with Feedgot."

export const DEFAULT_KEYWORDS = [
  "Feedgot",
  "project management",
  "roadmap",
  "changelog",
  "productivity",
]

export const DEFAULT_OG_IMAGE = "/logo.png"

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Feedgot",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  }
}