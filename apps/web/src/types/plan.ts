import { AUTH_SIGN_UP_URL } from "@/config/auth";

export type PricingPlanKey = "free" | "starter" | "professional";
export type BillingCycle = "monthly" | "yearly";

export type PricingPlanFeature = {
  title: string;
};

export type PricingPlanHighlight = {
  label: string;
  value: string;
};

export type PricingPlan = {
  key: PricingPlanKey;
  name: string;
  note: string;
  monthlyPrice: number;
  yearlyPrice: number;
  href: string;
  finePrint: string;
  highlights: PricingPlanHighlight[];
  features: PricingPlanFeature[];
};

export const PRICING_PLANS: Record<PricingPlanKey, PricingPlan> = {
  free: {
    key: "free",
    name: "Free",
    note: "Ideal for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    href: AUTH_SIGN_UP_URL,
    finePrint: "No credit card required.",
    highlights: [
      { label: "Team members", value: "3" },
      { label: "Boards", value: "5" },
      { label: "Changelog entries", value: "10" },
      { label: "Tags", value: "5" },
    ],
    features: [
      { title: "Public feedback portal" },
      { title: "Roadmap and changelog" },
      { title: "In-app widget" },
      { title: "Voting and comments" },
      { title: "File attachments" },
      { title: "Guest and anonymous feedback" },
    ],
  },
  starter: {
    key: "starter",
    name: "Starter",
    note: "For early teams",
    monthlyPrice: 24,
    yearlyPrice: 240,
    href: AUTH_SIGN_UP_URL,
    finePrint: "Flat workspace pricing. Cancel anytime.",
    highlights: [
      { label: "Team members", value: "5" },
      { label: "Boards", value: "10" },
      { label: "Changelog entries", value: "50" },
      { label: "Tags", value: "10" },
    ],
    features: [
      { title: "Everything in Free" },
      { title: "Custom domain" },
      { title: "Branding controls" },
      { title: "Hide Powered by Featul" },
      { title: "Slack and Discord alerts" },
      { title: "Canny, Nolt, and ProductBoard import" },
    ],
  },
  professional: {
    key: "professional",
    name: "Professional",
    note: "For growing product teams",
    monthlyPrice: 47,
    yearlyPrice: 470,
    href: AUTH_SIGN_UP_URL,
    finePrint: "Flat workspace pricing. Cancel anytime.",
    highlights: [
      { label: "Team members", value: "10" },
      { label: "Boards", value: "Unlimited" },
      { label: "Changelog entries", value: "Unlimited" },
      { label: "Tags", value: "20" },
    ],
    features: [
      { title: "Everything in Free" },
      { title: "Custom domain" },
      { title: "Branding controls" },
      { title: "Hide Powered by Featul" },
      { title: "Slack and Discord alerts" },
      { title: "Canny, Nolt, and ProductBoard import" },
    ],
  },
};

export const PRICING_PLAN_ORDER: PricingPlanKey[] = [
  "free",
  "starter",
  "professional",
];

export function getPricingPlan(plan: PricingPlanKey) {
  return PRICING_PLANS[plan];
}

export function formatPricingPrice(plan: PricingPlan, cycle: BillingCycle) {
  const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  if (cycle === "yearly") return `$${amount} / year`;
  return `$${amount} / month`;
}
