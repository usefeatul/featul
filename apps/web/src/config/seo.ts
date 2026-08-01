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
    sameAs: [],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'contact@featul.com',
        contactType: 'customer support',
      },
    ],
  }
}

export function getUseCaseHowToJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to centralize product feedback with Featul',
    description:
      'Step-by-step guide to centralize product feedback, run a public roadmap, and publish changelogs with Featul.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl('/use-cases/product-feedback-platform'),
    },
    tool: [
      {
        '@type': 'SoftwareApplication',
        name: 'Featul',
        url: absoluteUrl('/'),
        applicationCategory: 'BusinessApplication',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Create a central feedback board',
        text:
          'Set up a public or private feedback board in Featul to collect user ideas, requests, and bug reports in one place.',
      },
      {
        '@type': 'HowToStep',
        name: 'Prioritize with a public roadmap',
        text:
          'Group feedback into themes, prioritize items with your team, and communicate what you are working on via a transparent roadmap.',
      },
      {
        '@type': 'HowToStep',
        name: 'Close the loop with changelogs',
        text:
          'Publish release notes and changelogs that automatically link back to the feedback and keep customers in the loop.',
      },
    ],
  }
}
