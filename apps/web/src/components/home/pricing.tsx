"use client"

import React from "react"
import { AnimatePresence, animate, motion } from "framer-motion"
import { Button } from "@featul/ui/components/button"
import { StarIcon } from "@featul/ui/icons/star"
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

export default function Pricing() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")

  return (
    <SkyPageShell
      dataComponent="Pricing"
      title="Pricing that grows with your team"
      description="Start free, then move into simple flat-workspace plans for early and growing product teams."
      headerClassName="mx-auto max-w-4xl text-center"
      below={<Faq />}
    >
      <div className="flex justify-center">
        <BillingCycleTabs billingCycle={billingCycle} onChange={setBillingCycle} />
      </div>

      <div className="mt-8 mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:mb-12">
        {PRICING_PLAN_ORDER.map((planKey) => (
          <PricingPlanCard
            key={planKey}
            planKey={planKey}
            billingCycle={billingCycle}
          />
        ))}
      </div>
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

  return (
    <OverlayCard className="relative">
      <OverlayCardPanel className="relative flex flex-1 flex-col overflow-hidden px-4 py-4">
        <SubtleDitherWash color={PLAN_WASH[planKey]} direction="down" opacity={0.52} />
        {ribbon ? <PricingPlanRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

        <div className="relative z-10 mb-3 flex items-start justify-between gap-2">
        <div className="relative z-10">
          <div className="text-2xl font-heading font-semibold leading-none text-foreground">
            {plan.name}
          </div>
          <div className="mt-1.5 text-sm leading-snug text-accent">{plan.note}</div>
        </div>
      </div>

      <div className="relative z-10 mb-4 flex items-baseline text-4xl font-semibold tracking-tight text-foreground">
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
            className="ml-1 text-sm font-normal text-accent"
          >
            /{billingCycle === "yearly" ? "year" : "mo"}
          </motion.span>
        </AnimatePresence>
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
