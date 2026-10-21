import { getPlanLimits } from "@featul/api/shared/plan";
import type { PlanKey } from "@/lib/plan";

export type BillingCycle = "monthly" | "yearly";

export type PlanFeature = {
  title: string;
  description: string;
};

export type PlanOption = {
  id: PlanKey;
  label: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays?: number;
  features: PlanFeature[];
};

export const BILLING_PLANS: Record<PlanKey, PlanOption> = {
  free: {
    id: "free",
    label: "Free",
    tagline: "Ideal for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      {
        title: "Public feedback portal",
        description: "Public feedback portal",
      },
      { title: "Roadmap and changelog", description: "Roadmap and changelog" },
      { title: "Help center", description: "Help center" },
      { title: "In-app widget", description: "In-app widget" },
      { title: "Voting and comments", description: "Voting and comments" },
      { title: "File attachments", description: "File attachments" },
      {
        title: "Guest and anonymous feedback",
        description: "Guest and anonymous feedback",
      },
    ],
  },
  starter: {
    id: "starter",
    label: "Starter",
    tagline: "For early teams",
    monthlyPrice: 18,
    yearlyPrice: 180,
    trialDays: 14,
    features: [
      { title: "Everything in Free", description: "Everything in Free" },
      { title: "Custom domain", description: "Custom domain" },
      { title: "Branding controls", description: "Branding controls" },
      {
        title: "Hide Powered by Featul",
        description: "Hide Powered by Featul",
      },
      {
        title: "Help articles in widget",
        description: "Help articles in widget",
      },
      {
        title: "Help center analytics",
        description: "Help center analytics",
      },
      {
        title: "Slack and Discord alerts",
        description: "Slack and Discord alerts",
      },
      {
        title: "Canny, Nolt, and ProductBoard import",
        description: "Canny, Nolt, and ProductBoard import",
      },
    ],
  },
  professional: {
    id: "professional",
    label: "Professional",
    tagline: "For growing product teams",
    monthlyPrice: 35,
    yearlyPrice: 350,
    trialDays: 14,
    features: [
      { title: "Everything in Starter", description: "Everything in Starter" },
      {
        title: "Unlimited help collections and articles",
        description: "Unlimited help collections and articles",
      },
      {
        title: "Ask AI answers on your help center",
        description: "Ask AI answers on your help center",
      },
      {
        title: "Help search insights and content gaps",
        description: "Help search insights and content gaps",
      },
      {
        title: "More website article drafts",
        description: "More website article drafts",
      },
    ],
  },
};

export const PLAN_ORDER: PlanKey[] = ["free", "starter", "professional"];

/** Plan copy and pricing for the given key. */
export function getPlan(plan: PlanKey) {
  return BILLING_PLANS[plan];
}

/** Price label for the selected billing cycle. */
export function formatPrice(plan: PlanOption, cycle: BillingCycle) {
  const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  if (cycle === "yearly") return `£${amount} / year`;
  return `£${amount} / month`;
}

/** Stripe checkout slug for paid plans. Free returns null. */
export function getCheckoutSlug(
  plan: PlanKey,
  cycle: BillingCycle,
): string | null {
  if (plan === "starter")
    return cycle === "yearly" ? "starter-yearly" : "starter-monthly";
  if (plan === "professional")
    return cycle === "yearly" ? "professional-yearly" : "professional-monthly";
  return null;
}

/** Use the enforced limits for the comparison rows. */
export function getPlanHighlights(plan: PlanKey) {
  const limits = getPlanLimits(plan);
  const value = (limit: number | null) =>
    limit === null ? "Unlimited" : String(limit);
  return [
    { label: "Team members", value: value(limits.maxMembers) },
    { label: "Boards", value: value(limits.maxNonSystemBoards) },
    { label: "Changelog entries", value: value(limits.maxChangelogEntries) },
    { label: "Tags", value: value(limits.maxTags) },
    { label: "Help articles", value: value(limits.maxHelpArticles) },
  ];
}
