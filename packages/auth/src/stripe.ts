import Stripe from "stripe"

export type StripeBillingPlanName = "starter" | "professional"

const STRIPE_API_VERSION = "2026-02-25.clover"

let stripeClient: Stripe | null | undefined

export function getStripeClient() {
  if (stripeClient !== undefined) {
    return stripeClient
  }

  const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim()
  if (!stripeSecretKey) {
    stripeClient = null
    return stripeClient
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: STRIPE_API_VERSION,
  })

  return stripeClient
}

function getStripePlanPriceIds() {
  return {
    starter: [
      (process.env.STRIPE_PRICE_ID_STARTER_MONTHLY || "").trim(),
      (process.env.STRIPE_PRICE_ID_STARTER_YEARLY || "").trim(),
    ].filter(Boolean),
    professional: [
      (process.env.STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY || "").trim(),
      (process.env.STRIPE_PRICE_ID_PROFESSIONAL_YEARLY || "").trim(),
    ].filter(Boolean),
  } satisfies Record<StripeBillingPlanName, string[]>
}

export function getStripePlanNameFromPriceId(priceId: string | null | undefined): StripeBillingPlanName | null {
  const normalizedPriceId = String(priceId || "").trim()
  if (!normalizedPriceId) return null

  const priceIds = getStripePlanPriceIds()

  if (priceIds.starter.includes(normalizedPriceId)) return "starter"
  if (priceIds.professional.includes(normalizedPriceId)) return "professional"

  return null
}

export function getStripePlanNameFromSubscription(
  stripeSubscription: Stripe.Subscription,
): StripeBillingPlanName | null {
  for (const item of stripeSubscription.items.data) {
    const matchedPlan = getStripePlanNameFromPriceId(item.price?.id)
    if (matchedPlan) {
      return matchedPlan
    }
  }

  return null
}
