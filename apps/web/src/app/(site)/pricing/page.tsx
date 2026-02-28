import type { Metadata } from "next"
import Faq from "@/components/home/faq"
import Pricing from "@/components/home/pricing"
import { SectionStack } from "@/components/layout/section-stack"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Pricing - Transparent plans for teams",
  description: "Simple, honest pricing with a free tier and startup‑friendly plans.",
  path: "/pricing",
})

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <div className="mx-auto max-w-6xl">
        <SectionStack>
          <Pricing />
          <Faq />
        </SectionStack>
      </div>
    </main>
  )
}
