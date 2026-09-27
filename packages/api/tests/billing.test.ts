import { afterAll, expect, test } from "bun:test"
import type Stripe from "stripe"
import { belongsToWorkspace, getSubscriptionProjection, hasPaidAccess, isUnfinishedSubscription, isWorkspaceTrialEligible } from "@featul/auth/billing/policy"

const originalPrice = process.env.STRIPE_PRICE_ID_STARTER_MONTHLY
process.env.STRIPE_PRICE_ID_STARTER_MONTHLY = "price_starter_test"
afterAll(() => {
  if (originalPrice === undefined) delete process.env.STRIPE_PRICE_ID_STARTER_MONTHLY
  else process.env.STRIPE_PRICE_ID_STARTER_MONTHLY = originalPrice
})

function live(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_one", customer: "cus_owner", metadata: { referenceId: "ws_one" }, status: "trialing",
    cancel_at_period_end: false, trial_start: 1000, trial_end: 2000,
    items: { data: [{ price: { id: "price_starter_test", recurring: { interval: "month" } }, current_period_start: 1000, current_period_end: 2000 }] },
    ...overrides,
  } as unknown as Stripe.Subscription
}

test("a shared customer never grants another workspace's subscription", () => {
  expect(belongsToWorkspace(live(), "ws_other", new Set())).toBe(false)
  expect(belongsToWorkspace(live(), "ws_one", new Set())).toBe(true)
  expect(() => belongsToWorkspace(live(), "ws_other", new Set(["sub_one"]))).toThrow("conflicting")
})

test("trial access uses item billing periods and preserves cancellation timing", () => {
  const row = getSubscriptionProjection(live({ cancel_at_period_end: true }))
  expect(row.periodEnd?.getTime()).toBe(2_000_000)
  expect(row.trialEnd?.getTime()).toBe(2_000_000)
  expect(row.cancelAtPeriodEnd).toBe(true)
  expect(hasPaidAccess(row.status)).toBe(true)
  expect(isUnfinishedSubscription(row.status)).toBe(true)
})

test("paused, incomplete and unpaid subscriptions do not grant paid access", () => {
  for (const status of ["paused", "incomplete", "incomplete_expired", "unpaid", "canceled"]) expect(hasPaidAccess(status)).toBe(false)
  expect(hasPaidAccess("past_due")).toBe(true)
  expect(isUnfinishedSubscription("paused")).toBe(true)
  expect(isUnfinishedSubscription("incomplete_expired")).toBe(false)
})

test("unmapped live prices fail closed while retired canceled prices can reconcile", () => {
  const items = { data: [{ price: { id: "retired" }, current_period_start: 1000, current_period_end: 2000 }] }
  expect(() => getSubscriptionProjection(live({ items }))).toThrow("no configured")
  expect(getSubscriptionProjection(live({ status: "canceled", items })).plan).toBe("free")
})

test("a canceled trial still consumes eligibility when no active subscription remains", () => {
  expect(isWorkspaceTrialEligible([
    { status: "canceled", trialStart: new Date(), trialEnd: null },
    { status: "incomplete", trialStart: null, trialEnd: null },
  ])).toBe(false)
  expect(isWorkspaceTrialEligible([{ status: "incomplete_expired", trialEnd: new Date() }])).toBe(false)
  expect(isWorkspaceTrialEligible([{ status: "trialing" }])).toBe(false)
})

test("new workspaces and abandoned checkouts without trials remain eligible", () => {
  expect(isWorkspaceTrialEligible([])).toBe(true)
  expect(isWorkspaceTrialEligible([{ status: "incomplete", stripeSubscriptionId: null }])).toBe(true)
  expect(isWorkspaceTrialEligible([{ status: "canceled", stripeSubscriptionId: "sub_paid_without_trial" }])).toBe(true)
})

test("existing subscriptions show a plan change instead of a new trial offer", () => {
  expect(isWorkspaceTrialEligible([{ status: "active", trialStart: null }])).toBe(false)
  for (const status of ["past_due", "unpaid", "paused", "incomplete"]) {
    expect(isWorkspaceTrialEligible([{ status, stripeSubscriptionId: "sub_existing" }])).toBe(false)
  }
})
