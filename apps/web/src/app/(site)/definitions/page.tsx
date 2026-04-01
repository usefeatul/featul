import type { Metadata } from "next"
import DefinitionsIndex from "@/components/definitions/DefinitionsIndex"
import { createPageMetadata } from "@/lib/seo"
import { DEFINITIONS } from "@/content/definitions"

export const metadata: Metadata = createPageMetadata({
  title: "SaaS Metrics & Definitions",
  description: "Plain‑English definitions for core SaaS metrics, pricing, and finance.",
  path: "/definitions",
})

export default function DefinitionsIndexPage() {
  return <DefinitionsIndex items={DEFINITIONS} />
}
