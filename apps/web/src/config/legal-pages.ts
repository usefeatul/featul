import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import type { LegalPageMeta, LegalSlug } from "@/types/legal"

const LEGAL_PAGE_META: Record<LegalSlug, LegalPageMeta> = {
  gdpr: {
    title: "GDPR Compliance",
    description: "featul’s approach to GDPR and data protection obligations.",
    path: "/gdpr",
  },
  privacy: {
    title: "Privacy Policy",
    description: "How featul collects, uses, and protects personal data in line with GDPR.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service",
    description: "featul terms and conditions for using our services.",
    path: "/terms",
  },
}

export const LEGAL_PAGE_METADATA: Record<LegalSlug, Metadata> = {
  gdpr: createPageMetadata(LEGAL_PAGE_META.gdpr),
  privacy: createPageMetadata(LEGAL_PAGE_META.privacy),
  terms: createPageMetadata(LEGAL_PAGE_META.terms),
}
