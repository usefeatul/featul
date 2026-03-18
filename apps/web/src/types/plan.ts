export type PricingPlanKey = "free" | "starter" | "professional"
export type BillingCycle = "monthly" | "yearly"

export type PricingPlanFeature = {
  title: string
}

export type PricingPlan = {
  key: PricingPlanKey
  name: string
  note: string
  monthlyPrice: number
  yearlyPrice: number
  href: string
  features: PricingPlanFeature[]
}

export const PRICING_PLANS: Record<PricingPlanKey, PricingPlan> = {
  free: {
    key: "free",
    name: "Free",
    note: "Ideal for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    href: "https://app.featul.com/auth/sign-up",
    features: [
      { title: "Up to 3 team members" },
      { title: "File attachments" },
      { title: "Essential tagging and changelog tools" },
      { title: "No integrations or imports" },
    ],
  },
  starter: {
    key: "starter",
    name: "Starter",
    note: "For growing teams",
    monthlyPrice: 20,
    yearlyPrice: 200,
    href: "https://app.featul.com/auth/sign-up",
    features: [
      { title: "Up to 5 team members" },
      { title: "Unlimited boards" },
      { title: "Branding controls" },
      { title: "Integrations and imports" },
      { title: "Advanced organization and publishing" },
    ],
  },
  professional: {
    key: "professional",
    name: "Professional",
    note: "For advanced teams",
    monthlyPrice: 45,
    yearlyPrice: 450,
    href: "https://app.featul.com/auth/sign-up",
    features: [
      { title: "Everything in Starter" },
      { title: "Up to 10 team members" },
      { title: "Comprehensive tagging controls" },
      { title: "Unlimited changelog entries" },
      { title: "Best for scale" },
    ],
  },
}

export const PRICING_PLAN_ORDER: PricingPlanKey[] = ["free", "starter", "professional"]

export function getPricingPlan(plan: PricingPlanKey) {
  return PRICING_PLANS[plan]
}

export function formatPricingPrice(plan: PricingPlan, cycle: BillingCycle) {
  const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
  if (cycle === "yearly") return `$${amount} / year`
  return `$${amount} / month`
}
