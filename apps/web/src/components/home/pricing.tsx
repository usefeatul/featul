"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { StarIcon } from "@featul/ui/icons/star"
import { cn } from "@featul/ui/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import Link from "next/link"
import { Container } from "../global/container"
import {
  type BillingCycle,
  type PricingPlanKey,
  PRICING_PLAN_ORDER,
  getPricingPlan,
} from "../../types/plan"

export default function Pricing() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")

  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden"
      data-component="Pricing"
    >
      {/* Full-bleed sky — tall + top-pinned so the tree line stays cropped out */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[165%] bg-cover bg-[position:center_top] bg-no-repeat"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      {/* Blend the sky's top edge into the solid navbar color above it */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0063d2] from-[64px] to-transparent"
      />
      {/* Soft white fog — blurs a white layer so the sky doesn't frost into cyan */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-10 h-36 bg-background blur-2xl sm:h-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent from-10% via-background/90 via-60% to-background"
      />

      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <section className="pb-6 pt-14 sm:pb-8 sm:pt-16 md:pb-10">
          <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl [text-shadow:0_1px_8px_rgba(0,0,0,0.2)]">
                <span className="md:whitespace-nowrap">Pricing that grows with your team</span>
              </h2>
              <p className="mt-3 text-base text-white/90 sm:text-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.25)]">
                Start free, then move into simple flat-workspace plans for early and growing product teams.
              </p>
            </div>

            <div className="mt-4 flex justify-center sm:mt-5">
              <BillingCycleTabs billingCycle={billingCycle} onChange={setBillingCycle} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-7 lg:grid-cols-3">
              {PRICING_PLAN_ORDER.map((planKey) => (
                <PricingPlanCard
                  key={planKey}
                  planKey={planKey}
                  billingCycle={billingCycle}
                />
              ))}
            </div>
          </div>
        </section>
      </Container>
    </section>
  )
}

function PricingPlanCard({
  planKey,
  billingCycle,
}: {
  planKey: PricingPlanKey
  billingCycle: BillingCycle
}) {
  const plan = getPricingPlan(planKey)
  const ribbon = getPlanRibbon(planKey)
  const buttonVariant = planKey === "free" ? "outline" : "default"
  const ctaLabel = getPlanCtaLabel(planKey)
  const buttonClassName = cn(
    "h-9 w-full text-sm",
    planKey === "starter" && "bg-primary text-primary-foreground hover:bg-primary/90",
    planKey === "professional" && "bg-orange-500 text-white hover:bg-orange-500/90",
  )

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-md border border-border/70 bg-card p-4 shadow-lg shadow-zinc-950/15",
      )}
    >
      {ribbon ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-1",
            getRibbonSpotlightClass(ribbon.tone),
          )}
        />
      ) : null}
      {ribbon ? <PricingPlanRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

      <div className="relative z-10 mb-3 flex items-start justify-between gap-2">
        <div className="relative z-10">
          <div className="text-2xl font-heading font-semibold leading-none text-foreground">
            {plan.name}
          </div>
          <div className="mt-1.5 text-sm leading-snug text-accent">{plan.note}</div>
        </div>
      </div>

      <div className="relative z-10 mb-4 text-4xl font-semibold tracking-tight text-foreground">
        {billingCycle === "yearly" ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`}
        <span className="ml-1 text-sm font-normal text-accent">
          /{billingCycle === "yearly" ? "year" : "mo"}
        </span>
      </div>

      <ul className="relative z-10 mb-4 flex-1 space-y-1.5 text-sm text-accent">
        {plan.features.map((feature) => (
          <li key={feature.title} className="leading-relaxed">
            {feature.title}
          </li>
        ))}
      </ul>

      <div className="relative z-10">
        <Button asChild variant={buttonVariant} className={buttonClassName}>
          <Link href={plan.href}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}

function BillingCycleTabs({
  billingCycle,
  onChange,
}: {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}) {
  const handleValueChange = React.useCallback(
    (value: string) => {
      if (value === "monthly" || value === "yearly") onChange(value)
    },
    [onChange],
  )

  return (
    <Tabs value={billingCycle} onValueChange={handleValueChange} className="gap-0">
      <TabsList className="w-auto gap-0 overflow-visible rounded-md border border-white/30 bg-white/15 p-0.5 pb-0 backdrop-blur-sm [&>div.pointer-events-none.absolute]:hidden">
        <TabsTrigger
          value="monthly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-white/80",
            billingCycle === "monthly" && "bg-white text-foreground shadow-sm",
          )}
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-white/80",
            billingCycle === "yearly" && "bg-white text-foreground shadow-sm",
          )}
        >
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function PricingPlanRibbon({
  label,
  tone,
}: {
  label: string
  tone: "popular" | "value"
}) {
  const surfaceClassName = cn(
    "absolute inset-0 rounded-[1px] border border-border/80 dark:border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)] dark:ring-offset-black",
    tone === "popular" ? "bg-primary" : "bg-orange-500",
  )

  return (
    <div
      className="pointer-events-none absolute -right-[19px] -top-[19px] z-10 flex h-[38px] w-[38px] rotate-45 items-end justify-center pb-1"
      title={label}
      aria-hidden="true"
    >
      <div className={surfaceClassName} />
      <div className="relative z-10 mb-px text-white">
        <StarIcon width={10} height={10} className="fill-current" />
      </div>
    </div>
  )
}

function getPlanRibbon(planKey: PricingPlanKey): { label: string; tone: "popular" | "value" } | null {
  if (planKey === "professional") return { label: "Most popular", tone: "value" }
  return null
}

function getPlanCtaLabel(planKey: PricingPlanKey): string {
  if (planKey === "free") return "Get Free"
  if (planKey === "starter") return "Get Starter"
  return "Get Professional"
}

function getRibbonSpotlightClass(tone: "popular" | "value") {
  if (tone === "popular") {
    return "bg-[radial-gradient(340px_240px_at_100%_0%,var(--primary),transparent_58%)] opacity-30 dark:opacity-35"
  }
  return "bg-[radial-gradient(340px_240px_at_100%_0%,#f59e0b,transparent_58%)] opacity-30 dark:opacity-35"
}
