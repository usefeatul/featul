export const PLANS = ["free", "starter", "professional"] as const;

export type PlanKey = (typeof PLANS)[number];

export type PlanLimits = {
  maxMembers: number | null;
  maxNonSystemBoards: number | null;
  monthlyPostLimit: number | null;
  allowBranding: boolean;
  allowHidePoweredBy: boolean;
  allowAttachments: boolean;
  allowIntegrations: boolean;
  allowDataImports: boolean;
  maxTags: number | null;
  maxChangelogTags: number | null;
};

const LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    maxMembers: 3,
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
    maxMembers: 5,
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
    maxMembers: 10,
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
};

export function normalizePlan(raw: string): PlanKey {
  const s = String(raw || "free")
    .trim()
    .toLowerCase();
  return (PLANS as ReadonlyArray<string>).includes(s) ? (s as PlanKey) : "free";
}

export function getPlanLimits(plan: PlanKey | string): PlanLimits {
  return LIMITS[normalizePlan(String(plan))];
}

export function isIntegrationsAllowed(plan: PlanKey | string): boolean {
  return getPlanLimits(plan).allowIntegrations;
}

export function isDataImportsAllowed(plan: PlanKey | string): boolean {
  return getPlanLimits(plan).allowDataImports;
}

const PLAN_LABELS: Record<PlanKey, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
};

export function getMemberLimitMessage(
  plan: PlanKey | string,
  maxMembers: number,
) {
  return `${PLAN_LABELS[normalizePlan(String(plan))]} plan allows up to ${maxMembers} members.`;
}
