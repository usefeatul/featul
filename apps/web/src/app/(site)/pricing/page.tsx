import type { Metadata } from "next"
import Faq from "@/components/faq"
import Pricing from "@/components/pricing"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a plan that fits your team.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Pricing />
      <Faq />
    </main>
  )
}