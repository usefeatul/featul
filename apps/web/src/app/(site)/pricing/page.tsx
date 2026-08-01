import type { Metadata } from "next"
import Faq from "@/components/home/faq"
import Pricing from "@/components/home/pricing"
import { LinearSeparator } from "@/components/linear-separator"
import { VerticalLines } from "@/components/vertical-lines"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Pricing - Transparent plans for teams",
  description: "Simple, honest pricing with a free tier and startup‑friendly plans.",
  path: "/pricing",
})

export default function PricingPage() {
  return (
    <>
      <h1 className="font-heading sr-only">Pricing for customer feedback, roadmap, and changelog software</h1>
      <Pricing />
      <div className="relative mx-auto max-w-6xl">
        <VerticalLines force className="absolute inset-0 z-30" />
        <LinearSeparator variant="zigzag" />
        <Faq />
      </div>
    </>
  )
}
