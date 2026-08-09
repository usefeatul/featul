import type { Metadata } from "next"
import LegalPage from "@/components/legal/page"
import { LEGAL_PAGE_METADATA } from "@/config/legal"

export const metadata: Metadata = LEGAL_PAGE_METADATA.privacy

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />
}
