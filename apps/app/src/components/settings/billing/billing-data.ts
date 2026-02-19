import type { PlanKey } from "@/lib/plan"

export type BillingCycle = "monthly" | "yearly"

export type PlanFeature = {
  title: string
  description: string
}

export type PlanOption = {
  id: PlanKey
  label: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
}

export const BILLING_PLANS: Record<PlanKey, PlanOption> = {
  free: {
    id: "free",
    label: "Free",
    tagline: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { title: "Basic feedback boards", description: "Collect and track feedback in a simple board." },
      { title: "Up to 3 team members", description: "Invite a small team to collaborate." },
      { title: "Standard branding", description: "Show the Featul badge on your workspace." },
    ],
  },
  starter: {
    id: "starter",
    label: "Starter",
    tagline: "For teams ready to grow",
    monthlyPrice: 24,
    yearlyPrice: 240,
    features: [
      { title: "Everything in Free", description: "All core feedback features included." },
      { title: "Premium branding", description: "Upload your logo and colors." },
      { title: "Integrations", description: "Connect Slack, Discord and more." },
      { title: "Migration imports", description: "Canny, Nolt, and ProductBoard imports (coming soon)." },
      { title: "More members", description: "Invite your team without friction." },
    ],
  },
  professional: {
    id: "professional",
    label: "Professional",
    tagline: "Built for teams that need unlimited everything",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      { title: "Everything in Starter", description: "All starter features included." },
      { title: "Custom domains", description: "Use your own domain for professional branding." },
      { title: "White-label", description: "Remove Featul branding from your workspace." },
      { title: "Unlimited boards", description: "Create unlimited public and private boards." },
      { title: "Unlimited integrations", description: "Connect all your tools without limits." },
    ],
  },
}

export const PLAN_ORDER: PlanKey[] = ["free", "starter", "professional"]

export function getPlan(plan: PlanKey) {
  return BILLING_PLANS[plan]
}

export function formatPrice(plan: PlanOption, cycle: BillingCycle) {
  const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
  if (cycle === "yearly") return `$${amount} / year`
  return `$${amount} / month`
}

export function getCheckoutSlug(plan: PlanKey, cycle: BillingCycle): string | null {
  if (plan === "starter") return cycle === "yearly" ? "starter-yearly" : "starter-monthly"
  if (plan === "professional") return cycle === "yearly" ? "professional-yearly" : "professional-monthly"
  return null
}
