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
    tagline: "Ideal for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { title: "Up to 3 team members", description: "Invite your core team to collaborate in one workspace." },
      { title: "File attachments", description: "Capture richer context with attachments on feedback." },
      { title: "Essential tagging and changelog tools", description: "Organize feedback with tags and structure release updates with changelog tags." },
      { title: "No integrations or imports", description: "Third-party integrations and data imports are not included." },
    ],
  },
  starter: {
    id: "starter",
    label: "Starter",
    tagline: "For growing teams",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: [
      { title: "Up to 5 team members", description: "Scale collaboration with support for a larger team." },
      { title: "Unlimited boards", description: "Create as many boards as needed for your workflow." },
      { title: "Branding controls", description: "Customize branding and hide the 'Powered by' label." },
      { title: "Integrations and imports", description: "Use integrations and provider imports (Canny, Nolt, ProductBoard)." },
      { title: "Advanced organization and publishing", description: "Unlock richer tagging and changelog capabilities for a faster release cadence." },
    ],
  },
  professional: {
    id: "professional",
    label: "Professional",
    tagline: "For advanced teams",
    monthlyPrice: 45,
    yearlyPrice: 450,
    features: [
      { title: "Everything in Starter", description: "Includes all Starter features and capabilities." },
      { title: "Up to 10 team members", description: "Support larger teams with added collaboration capacity." },
      { title: "Comprehensive tagging controls", description: "Support complex categorization across feedback workflows and changelog updates." },
      { title: "Unlimited changelog entries", description: "Publish product updates freely as your product evolves." },
      { title: "Best for scale", description: "Designed for teams with higher volume and governance needs." },
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
