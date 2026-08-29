"use client"

import React from "react"
import { AnimatePresence, animate, motion } from "framer-motion"
import { Button } from "@featul/ui/components/button"
import { StarIcon } from "@featul/ui/icons/star"
import { AccentBar } from "@featul/ui/components/cardElements"
import { overlayRibbonInnerClass, overlayRibbonShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import type { PixelColor } from "@/components/dither-kit/pixel"
import { SubtleDitherWash } from "@/components/home/visual-well"
import Link from "next/link"
import Faq from "@/components/home/faq"
import { SkyPageShell } from "@/components/layout/shell"
import { Container } from "@/components/global/container"
import {
  type BillingCycle,
  type PricingPlanKey,
  PRICING_PLAN_ORDER,
  getPricingPlan,
} from "../../types/plan"

const PLAN_WASH: Record<PricingPlanKey, PixelColor> = {
  free: "grey",
  starter: "blue",
  professional: "orange",
}

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")

  return (
    <>
      <div className="flex justify-center">
        <BillingCycleTabs billingCycle={billingCycle} onChange={setBillingCycle} />
      </div>

      <div className="mt-8 mb-2 -mx-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 sm:-mx-4 lg:-mx-8">
        {PRICING_PLAN_ORDER.map((planKey) => (
          <PricingPlanCard
            key={planKey}
            planKey={planKey}
            billingCycle={billingCycle}
          />
        ))}
      </div>
    </>
  )
}

export function PricingSection() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-16 sm:my-20" data-component="HomePricing">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
              Pricing that grows with your team
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                Start free, then move into simple flat-workspace plans for early
                and growing product teams.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <PricingPlans />
          </div>
        </div>
      </section>
    </Container>
  )
}

export default function Pricing() {
  return (
    <SkyPageShell
      dataComponent="Pricing"
      title="Pricing that grows with your team"
      description={
        <p className="text-foreground/70">
          Start free, then move into simple flat-workspace plans for early and growing
          product teams.
        </p>
      }
      headerClassName="mx-auto max-w-4xl text-center"
      below={<Faq />}
    >
      <PricingPlans />
    </SkyPageShell>
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
  const highlightValueClass =
    planKey === "professional"
      ? "text-orange-600"
      : planKey === "starter"
        ? "text-primary"
        : "text-foreground"
  const chargedLabel =
    planKey === "free"
      ? "Free"
      : billingCycle === "yearly"
        ? `$${plan.yearlyPrice} / yr`
        : `$${plan.monthlyPrice} / mo`

  return (
    <OverlayCard className="relative">
      <OverlayCardPanel className="relative flex flex-1 flex-col overflow-hidden px-5 py-5">
        {ribbon ? <PricingPlanRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

        <div className="relative -mx-5 -mt-5 overflow-hidden px-5 pb-5 pt-5">
          <SubtleDitherWash
            color={PLAN_WASH[planKey]}
            direction="down"
            opacity={0.52}
            className="[mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
          />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="font-heading text-2xl font-light leading-none text-foreground">
              {plan.name}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/70">
              {billingCycle === "yearly" ? "Yearly" : "Monthly"}
            </span>
          </div>

          <div className="relative z-10 mt-4 flex items-baseline text-4xl font-light tracking-tight text-foreground">
            <AnimatedPrice
              value={billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={billingCycle}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="ml-1 text-sm font-normal text-foreground/80"
              >
                /{billingCycle === "yearly" ? "year" : "mo"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <dl className="relative z-10 -mx-5 space-y-2.5 border-t border-foreground/10 bg-background px-5 pt-4 text-sm font-extralight">
          {plan.highlights.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-foreground">{item.label}</dt>
              <dd className={cn("shrink-0 tabular-nums", highlightValueClass)}>
                {item.value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-foreground">Charged</dt>
            <dd className={cn("shrink-0 tabular-nums", highlightValueClass)}>
              {chargedLabel}
            </dd>
          </div>
        </dl>

        <ul className="relative z-10 mt-4 -mx-5 flex-1 space-y-2 border-t border-foreground/10 bg-background px-5 pt-4 text-sm font-normal text-foreground">
          {plan.features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-px select-none text-foreground/50" aria-hidden>
                +
              </span>
              <span>{feature.title}</span>
            </li>
          ))}
        </ul>

        <div className="relative z-10 mt-5 bg-background">
          <Button asChild variant={buttonVariant} className={buttonClassName}>
            <Link href={plan.href}>{ctaLabel}</Link>
          </Button>
          <p className="mt-2 text-center text-xs font-extralight text-foreground/65">{plan.finePrint}</p>
        </div>
      </OverlayCardPanel>
    </OverlayCard>
  )
}

function AnimatedPrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(value)
  const previousValue = React.useRef(value)

  React.useEffect(() => {
    const from = previousValue.current
    previousValue.current = value

    if (from === value) {
      setDisplayValue(value)
      return
    }

    const controls = animate(from, value, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    })

    return () => controls.stop()
  }, [value])

  return <span>${displayValue}</span>
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
      <TabsList className="w-auto gap-0 overflow-visible rounded-md border border-border/70 bg-muted/40 p-0.5 pb-0 [&>div.pointer-events-none.absolute]:hidden">
        <TabsTrigger
          value="monthly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-muted-foreground",
            billingCycle === "monthly" && "bg-card text-foreground dark:bg-black/50",
          )}
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-muted-foreground",
            billingCycle === "yearly" && "bg-card text-foreground dark:bg-black/50",
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
  return (
    <div
      className={cn(overlayRibbonShellClass, "z-20")}
      title={label}
      aria-hidden="true"
    >
      <span
        className={cn(
          overlayRibbonInnerClass,
          tone === "popular" ? "bg-primary" : "bg-orange-500",
        )}
      >
        <StarIcon width={10} height={10} className="fill-current" />
      </span>
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
