import type { Metadata } from "next"
import LegalPage from "@/components/legal/legal-page"
import { LEGAL_PAGE_METADATA } from "@/config/legal-pages"

export const metadata: Metadata = LEGAL_PAGE_METADATA.terms

export default function TermsPage() {
  return <LegalPage slug="terms" />
}
