export const PLANS = ["free", "starter", "professional"] as const

export type PlanKey = (typeof PLANS)[number]

export type PlanLimits = {
  maxMembers: number | null
  maxNonSystemBoards: number | null
  monthlyPostLimit: number | null
  allowBranding: boolean
  allowHidePoweredBy: boolean
  allowAttachments: boolean
  allowIntegrations: boolean
  maxTags: number | null
  maxChangelogTags: number | null
  maxChangelogEntries: number | null
}

const LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    maxMembers: 3,
    maxNonSystemBoards: null,
    monthlyPostLimit: null,
    allowBranding: false,
    allowHidePoweredBy: false,
    allowAttachments: true,
    allowIntegrations: false,
    maxTags: 5,
    maxChangelogTags: 5,
    maxChangelogEntries: 10,
  },
  starter: {
    maxMembers: 5,
    maxNonSystemBoards: null,
    monthlyPostLimit: null,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
    allowIntegrations: true,
    maxTags: 10,
    maxChangelogTags: 10,
    maxChangelogEntries: 50,
  },
  professional: {
    maxMembers: 10,
    maxNonSystemBoards: null,
    monthlyPostLimit: null,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
    allowIntegrations: true,
    maxTags: 20,
    maxChangelogTags: 20,
    maxChangelogEntries: null,
  },
}

export function normalizePlan(raw: string): PlanKey {
  const s = String(raw || "free").trim().toLowerCase()
  if (s === "pro" || s === "growth") return "starter"
  if (s === "enterprise" || s === "scale") return "professional"
  return (PLANS as ReadonlyArray<string>).includes(s) ? (s as PlanKey) : "free"
}

export function getPlanLimits(plan: PlanKey | string): PlanLimits {
  return LIMITS[normalizePlan(String(plan))]
}

export function isIntegrationsAllowed(plan: PlanKey | string): boolean {
  return getPlanLimits(plan).allowIntegrations
}

export function assertWithinLimit(
  current: number,
  max: number | null,
  message: (max: number) => string
) {
  if (typeof max === "number" && current >= max) {
    throw new Error(message(max))
  }
}
