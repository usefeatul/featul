export type ComplimentaryPlan = "starter" | "professional"

type ComplimentarySubscription = {
  plan?: unknown
  status?: unknown
  stripeSubscriptionId?: string | null
}

const COMPLIMENTARY_SUBSCRIPTION_PREFIX = "comp_sub_"
const ACTIVE_COMPLIMENTARY_STATUSES = new Set(["active", "past_due", "trialing"])

function parseWorkspaceIds(value: string | undefined) {
  return new Set(
    String(value ?? "")
      .split(/[\s,]+/)
      .map((id) => id.trim())
      .filter(Boolean),
  )
}

function asComplimentaryPlan(value: unknown): ComplimentaryPlan | null {
  const plan = String(value ?? "").trim().toLowerCase()
  if (plan === "starter" || plan === "professional") return plan
  return null
}

export function getComplimentaryWorkspacePlan(workspaceId: string): ComplimentaryPlan | null {
  const id = String(workspaceId ?? "").trim()
  if (!id) return null
  if (!parseWorkspaceIds(process.env.COMPLIMENTARY_WORKSPACE_IDS).has(id)) return null

  return asComplimentaryPlan(process.env.COMPLIMENTARY_WORKSPACE_PLAN) ?? "professional"
}

export function getComplimentarySubscriptionPlan(
  subscription: ComplimentarySubscription,
): ComplimentaryPlan | null {
  const stripeSubscriptionId = String(subscription.stripeSubscriptionId ?? "").trim()
  if (!stripeSubscriptionId.startsWith(COMPLIMENTARY_SUBSCRIPTION_PREFIX)) return null
  if (!ACTIVE_COMPLIMENTARY_STATUSES.has(String(subscription.status ?? ""))) return null

  return asComplimentaryPlan(subscription.plan)
}
