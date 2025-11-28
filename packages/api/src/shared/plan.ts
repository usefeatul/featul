export const PLANS = ["free", "starter", "professional"] as const

export type PlanKey = (typeof PLANS)[number]

export type PlanLimits = {
  maxMembers: number | null
  maxNonSystemBoards: number | null
  monthlyPostLimit: number | null
  allowBranding: boolean
  allowHidePoweredBy: boolean
  allowAttachments: boolean
}

const LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    maxMembers: 1,
    maxNonSystemBoards: 5,
    monthlyPostLimit: 100,
    allowBranding: false,
    allowHidePoweredBy: false,
    allowAttachments: true,
  },
  starter: {
    maxMembers: 15,
    maxNonSystemBoards: 10,
    monthlyPostLimit: 1000,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
  },
  professional: {
    maxMembers: null,
    maxNonSystemBoards: null,
    monthlyPostLimit: null,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
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
