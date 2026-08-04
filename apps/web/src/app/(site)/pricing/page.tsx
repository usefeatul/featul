import type { Metadata } from "next"
import Pricing from "@/components/home/pricing"
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
    </>
  )
}
