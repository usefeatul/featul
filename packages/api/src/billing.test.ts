import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { getSubscriptionProjection } from "@featul/auth/billing/policy"
import { getStripePlanNameFromPriceId } from "@featul/auth/stripe"

const configuration = {
  STRIPE_PRICE_ID_STARTER_MONTHLY: "price_starter_monthly",
  STRIPE_PRICE_ID_STARTER_YEARLY: "price_starter_yearly",
  STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY: "price_professional_monthly",
  STRIPE_PRICE_ID_PROFESSIONAL_YEARLY: "price_professional_yearly",
  STRIPE_LEGACY_PRICE_IDS_STARTER: " price_old_starter_monthly, ,price_old_starter_yearly ",
  STRIPE_LEGACY_PRICE_IDS_PROFESSIONAL: "price_old_professional",
}
const original = new Map<string, string | undefined>()

beforeEach(() => {
  for (const [key, value] of Object.entries(configuration)) {
    original.set(key, process.env[key])
    process.env[key] = value
  }
})

afterEach(() => {
  for (const [key, value] of original) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  original.clear()
})

type Subscription = Parameters<typeof getSubscriptionProjection>[0]

function subscription(priceId: string, status: Subscription["status"] = "active") {
  return {
    id: "sub_legacy",
    status,
    customer: "cus_test",
    items: { data: [{
      price: { id: priceId, recurring: { interval: "year" } },
      quantity: 2,
      current_period_start: 1_700_000_000,
      current_period_end: 1_731_622_400,
    }] },
    cancel_at_period_end: false,
  } as Subscription
}

describe("billing price mappings", () => {
  for (const plan of ["starter", "professional"] as const) {
    for (const interval of ["monthly", "yearly"]) {
      test(`recognizes the current ${plan} ${interval} price`, () => {
        expect(getSubscriptionProjection(subscription(`price_${plan}_${interval}`)).plan).toBe(plan)
      })
    }
  }

  for (const [price, plan] of [
    ["price_old_starter_monthly", "starter"],
    ["price_old_starter_yearly", "starter"],
    ["price_old_professional", "professional"],
  ] as const) {
    test(`recognizes ${price} and preserves Stripe billing details`, () => {
      expect(getSubscriptionProjection(subscription(price))).toMatchObject({
        plan, status: "active", billingInterval: "year", seats: 2,
        periodStart: new Date(1_700_000_000_000),
        periodEnd: new Date(1_731_622_400_000),
      })
    })
  }

  test("legacy mappings are optional and empty entries never match", () => {
    delete process.env.STRIPE_LEGACY_PRICE_IDS_STARTER
    delete process.env.STRIPE_LEGACY_PRICE_IDS_PROFESSIONAL
    expect(getStripePlanNameFromPriceId("price_old_starter_monthly")).toBeNull()
    expect(getStripePlanNameFromPriceId("price_starter_monthly")).toBe("starter")
    expect(getStripePlanNameFromPriceId(" ")).toBeNull()
  })

  for (const status of ["active", "trialing", "past_due", "paused", "unpaid", "incomplete"] as const) {
    test(`rejects an unmapped ${status} price with actionable diagnostics`, () => {
      expect(() => getSubscriptionProjection(subscription("price_unknown", status)))
        .toThrow("Stripe subscription sub_legacy has no configured billing price (price_unknown). Configure the matching STRIPE_PRICE_ID_* or STRIPE_LEGACY_PRICE_IDS_* mapping.")
    })
  }

  for (const status of ["canceled", "incomplete_expired"] as const) {
    test(`keeps the free projection for an unmapped ${status} subscription`, () => {
      expect(getSubscriptionProjection(subscription("price_unknown", status)).plan).toBe("free")
    })
  }
})
