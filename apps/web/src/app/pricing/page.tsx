import type { Metadata } from "next"
import { Container } from "@/components/container"
import Faq from "@/app/components/faq"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a plan that fits your team.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Pricing</h1>
            <p className="text-muted-foreground mt-4">Transparent pricing built for teams of any size.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 text-left">
                <h2 className="text-lg font-semibold">Starter</h2>
                <p className="text-muted-foreground mt-2">Good for individuals and small teams.</p>
                <div className="mt-4 text-foreground text-2xl font-bold">$0<span className="text-muted-foreground text-sm font-medium">/mo</span></div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 text-left">
                <h2 className="text-lg font-semibold">Pro</h2>
                <p className="text-muted-foreground mt-2">For growing teams who need more.</p>
                <div className="mt-4 text-foreground text-2xl font-bold">$29<span className="text-muted-foreground text-sm font-medium">/mo</span></div>
              </div>
            </div>
          </div>
        </section>
      </Container>
      <Faq />
    </main>
  )
}