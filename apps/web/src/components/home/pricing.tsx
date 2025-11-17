import { Button } from '@feedgot/ui/components/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@feedgot/ui/components/card'
import { Container } from '../global/container'
import { topPlans, selfHostedPlan } from '../../types/plan'

// plans moved to ../tools/pricing/plan for cleaner structure

export default function Pricing() {
  return (
    <section className="bg-background" data-component="Pricing">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">Transparent, minimal pricing</h2>
            <p className="text-accent mt-4 text-base sm:text-lg">Generous free tier. Simple plans. Developer‑first and self‑host friendly.</p>
            </div>

          <div className="mt-12 md:mt-16">
            {/* Top row: 3 cards (Free, Growth, Scale) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topPlans.map((plan) => (
                  <Card key={plan.key} className="border border-border/60 bg-background shadow-none hover:border-primary/50 transition-colors">
                    <CardHeader className="p-5">
                      <CardTitle className="text-foreground text-base sm:text-lg font-medium">{plan.name}</CardTitle>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">{plan.price}</div>
                      <CardDescription className="mt-2 text-sm text-accent">{plan.note}</CardDescription>
                    </CardHeader>
                    <div className="border-y border-border/60 px-5 py-4">
                      <Button asChild className="w-full" variant={plan.key === 'pro' ? 'default' : 'outline'}>
                        <Link href={plan.href}>{plan.ctaLabel}</Link>
                      </Button>
                    </div>
                    <ul role="list" className="space-y-2.5 p-5 text-accent">
                      {plan.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <Check className="text-primary size-3" strokeWidth={3.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
            </div>

            {/* Bottom row: 1 card (Self‑Hosted) */}
            <div className="mt-8">
              {[selfHostedPlan].map((plan) => (
                  <Card key={plan.key} className="border border-border/60 bg-background shadow-none hover:border-primary/50 transition-colors">
                    <CardHeader className="p-5">
                      <CardTitle className="text-foreground text-base sm:text-lg font-medium">{plan.name}</CardTitle>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">{plan.price}</div>
                      <CardDescription className="mt-2 text-sm text-accent">{plan.note}</CardDescription>
                    </CardHeader>
                    <div className="border-y border-border/60 px-5 py-4">
                      <Button asChild className="w-full" variant="outline">
                        <Link href={plan.href}>{plan.ctaLabel}</Link>
                      </Button>
                    </div>
                    <ul role="list" className="space-y-2.5 p-5 text-accent">
                      {plan.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <Check className="text-primary size-3" strokeWidth={3.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="px-5 pb-5 text-xs text-accent">
                      Optional add‑ons: Professional Support $99/mo, Managed Self‑Hosting $199/mo
                    </div>
                  </Card>
                ))}
            </div>
          </div>
          </div>
        </section>
      </Container>
    </section>
  )
}