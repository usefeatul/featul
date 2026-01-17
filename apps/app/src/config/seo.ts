export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const DEFAULT_TITLE = "featul"
export const TITLE_TEMPLATE = "%s - featul"

export const DEFAULT_DESCRIPTION =
  "Plan, track, and ship projects with featul."

export const DEFAULT_KEYWORDS = [
  "featul",
  "project management",
  "roadmap",
  "changelog",
  "productivity",
]

export const DEFAULT_OG_IMAGE = "/og.png"

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "featul",
    url: SITE_URL,
    logo: `${SITE_URL}/og.png`,
    sameAs: [],
  }
}