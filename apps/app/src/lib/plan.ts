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
  allowDataImports: boolean
  maxTags: number | null
  maxChangelogTags: number | null
}

const LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    maxMembers: 1,
    maxNonSystemBoards: 5,
    monthlyPostLimit: 100,
    allowBranding: false,
    allowHidePoweredBy: false,
    allowAttachments: true,
    allowIntegrations: false,
    allowDataImports: false,
    maxTags: 5,
    maxChangelogTags: 5,
  },
  starter: {
    maxMembers: 15,
    maxNonSystemBoards: 10,
    monthlyPostLimit: 1000,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
    allowIntegrations: true,
    allowDataImports: true,
    maxTags: 10,
    maxChangelogTags: 10,
  },
  professional: {
    maxMembers: null,
    maxNonSystemBoards: null,
    monthlyPostLimit: null,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
    allowIntegrations: true,
    allowDataImports: true,
    maxTags: 20,
    maxChangelogTags: 20,
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

export function isDataImportsAllowed(plan: PlanKey | string): boolean {
  return getPlanLimits(plan).allowDataImports
}
