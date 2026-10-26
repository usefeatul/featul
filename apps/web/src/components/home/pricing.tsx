"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { StarIcon } from "@featul/ui/icons/star"
import {
  modalCardInnerClass,
  modalCardShellClass,
  overlayRibbonInnerClass,
  overlayRibbonShellClass,
} from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { SegmentedControl } from "@featul/ui/components/segmented-control"
import type { PixelColor } from "@/components/dither-kit/pixel"
import { SubtleDitherWash } from "@/components/home/visual-well"
import Link from "next/link"
import Faq from "@/components/home/faq"
import { pricingCopy } from "@/data/home"
import { SkyPageShell } from "@/components/layout/shell"
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container"
import {
  HeadingHighlight,
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight"
import {
  type BillingCycle,
  type PricingPlanKey,
  PRICING_PLAN_ORDER,
  getPricingPlan,
} from "../../types/plan"

const PLAN_WASH: Record<PricingPlanKey, PixelColor> = {
  free: [110, 114, 122],
  starter: "blue",
  professional: "orange",
}

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")
  // The suffix only animates once the visitor switches cycles, never on first paint.
  const [cycleChanged, setCycleChanged] = React.useState(false)

  return (
    <>
      <div className="flex justify-start">
        <BillingCycleTabs
          billingCycle={billingCycle}
          onChange={(value) => {
            setCycleChanged(true)
            setBillingCycle(value)
          }}
        />
      </div>

      <div className="mt-8 mb-2 -mx-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 sm:-mx-4 lg:-mx-8">
        {PRICING_PLAN_ORDER.map((planKey) => (
          <PricingPlanCard
            key={planKey}
            planKey={planKey}
            billingCycle={billingCycle}
            cycleChanged={cycleChanged}
          />
        ))}
      </div>
    </>
  )
}

function PricingTitle() {
  return (
    <>
      <span className="inline-block">{pricingCopy.title}</span>{" "}
      <HeadingHighlight>{pricingCopy.highlight}</HeadingHighlight>
    </>
  )
}

export function PricingSection() {
  return (
    <MarketingContainer>
      <section className="my-16 sm:my-20" data-component="HomePricing">
        <MarketingRail>
          <div className="max-w-2xl text-left">
            <h2 className={marketingDisplayHeadingClass}>
              <PricingTitle />
            </h2>
            <p className={marketingLeadClass}>
              {pricingCopy.description}
            </p>
          </div>
          <div className="mt-8">
            <PricingPlans />
          </div>
        </MarketingRail>
      </section>
    </MarketingContainer>
  )
}

export default function Pricing() {
  return (
    <SkyPageShell
      dataComponent="Pricing"
      title={<PricingTitle />}
      description={
        <p className={cn(marketingLeadClass, "mt-0 sm:mt-0")}>
          {pricingCopy.description}
        </p>
      }
      below={<Faq />}
    >
      <PricingPlans />
    </SkyPageShell>
  )
}

function PricingPlanCard({
  planKey,
  billingCycle,
  cycleChanged,
}: {
  planKey: PricingPlanKey
  billingCycle: BillingCycle
  cycleChanged: boolean
}) {
  const plan = getPricingPlan(planKey)
  const ribbon = getPlanRibbon(planKey)
  const buttonVariant = planKey === "free" ? "outline" : "default"
  const ctaLabel = getPlanCtaLabel(planKey)
  const buttonClassName = cn(
    "h-9 w-full text-sm",
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
        ? `£${plan.yearlyPrice} / yr`
        : `£${plan.monthlyPrice} / mo`

  return (
    <section className={cn(modalCardShellClass, "flex h-full min-w-0 flex-col")}>
      <header className="flex items-center justify-between gap-3 px-2.5 py-1.5">
        <h3 className="text-sm font-medium leading-6 text-foreground">{plan.name}</h3>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/60">
          {billingCycle === "yearly" ? "Yearly" : "Monthly"}
        </span>
      </header>

      <div className={cn(modalCardInnerClass, "relative flex min-w-0 flex-1 flex-col")}>
        {ribbon ? <PricingPlanRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

        <div className="relative overflow-hidden px-5 py-5">
          <SubtleDitherWash
            color={PLAN_WASH[planKey]}
            direction="down"
            bloom="low"
            opacity={0.9}
            className="[mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
          />
          <div className="relative z-10 flex items-baseline text-4xl font-light tracking-tight text-foreground">
            <AnimatedPrice
              value={billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
            />
            <span
              key={billingCycle}
              className={cn(
                "ml-1 text-sm font-normal text-foreground/80",
                cycleChanged &&
                  "animate-in fade-in slide-in-from-bottom-1 duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              /{billingCycle === "yearly" ? "year" : "mo"}
            </span>
          </div>
          <p className="relative z-10 mt-2 text-sm text-foreground/80">{plan.note}</p>
        </div>

        <dl className="space-y-2.5 border-t border-border/40 px-5 py-4 text-sm font-extralight">
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

        <ul className="flex-1 space-y-2 border-t border-border/40 px-5 py-4 text-sm font-normal text-foreground">
          {plan.features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-2 leading-relaxed">
              <span className="mt-px select-none text-foreground/50" aria-hidden>
                +
              </span>
              <span>{feature.title}</span>
            </li>
          ))}
        </ul>

        <div className="px-5 pb-5">
          <Button asChild variant={buttonVariant} className={buttonClassName}>
            <Link href={plan.href}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>

      <footer className="flex min-h-13 flex-col justify-center gap-0.5 px-2.5 py-2 text-center text-xs font-extralight text-foreground/65">
        <p>
          {planKey !== "free" && billingCycle === "yearly"
            ? pricingCopy.yearlyNote
            : plan.finePrint}
        </p>
        {plan.trialDays ? <p>{pricingCopy.trialNote}</p> : null}
      </footer>
    </section>
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

    // A plain rAF tween keeps framer-motion out of the pricing bundle.
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / 550)
      const eased = 1 - (1 - t) ** 4
      setDisplayValue(Math.round(from + (value - from) * eased))
      if (t < 1) frame = requestAnimationFrame(step)
    })

    return () => cancelAnimationFrame(frame)
  }, [value])

  return <span>£{displayValue}</span>
}

function BillingCycleTabs({
  billingCycle,
  onChange,
}: {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}) {
  return (
    <SegmentedControl
      aria-label="Billing cycle"
      size="sm"
      value={billingCycle}
      onValueChange={onChange}
      options={[
        { value: "monthly", label: "Monthly" },
        {
          value: "yearly",
          label: (
            <>
              Yearly
              {billingCycle === "yearly" ? (
                <span className="ml-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  2 months free
                </span>
              ) : null}
            </>
          ),
        },
      ]}
    />
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
  const plan = getPricingPlan(planKey)
  if (plan.trialDays) return `Start ${plan.trialDays}-day free trial`
  if (planKey === "free") return "Get Free"
  if (planKey === "starter") return "Get Starter"
  return "Get Professional"
}
