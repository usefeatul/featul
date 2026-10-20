export const PLANS = ["free", "starter", "professional"] as const;

export type PlanKey = (typeof PLANS)[number];

/** Feature caps and entitlements for a billing plan. */
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
  maxHelpCollections: number | null;
  maxHelpArticles: number | null;
  /** Suggest help articles in the widget's feedback composer. */
  allowHelpWidget: boolean;
  /** Daily views, top articles, and lowest-rated articles. */
  allowHelpAnalytics: boolean;
  /** Visitor search terms and searches that found nothing. */
  allowHelpSearchInsights: boolean;
  /** Ask AI answers per month on the public help center; 0 turns it off. */
  monthlyHelpAiAnswers: number;
  /** Website/GitHub scans that draft articles; `null` means no lifetime cap. */
  helpImportsTotal: number | null;
  /** Scans per calendar month from Settings; `null` means scans aren't monthly. */
  helpImportsPerMonth: number | null;
  helpImportMaxPages: number;
  helpImportMaxArticles: number;
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
    maxHelpCollections: 5,
    maxHelpArticles: 25,
    allowHelpWidget: false,
    allowHelpAnalytics: false,
    allowHelpSearchInsights: false,
    monthlyHelpAiAnswers: 0,
    helpImportsTotal: 1,
    helpImportsPerMonth: null,
    helpImportMaxPages: 6,
    helpImportMaxArticles: 6,
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
    maxHelpCollections: 50,
    maxHelpArticles: 200,
    allowHelpWidget: true,
    allowHelpAnalytics: true,
    allowHelpSearchInsights: false,
    monthlyHelpAiAnswers: 0,
    helpImportsTotal: null,
    helpImportsPerMonth: 5,
    helpImportMaxPages: 20,
    helpImportMaxArticles: 12,
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
    maxHelpCollections: null,
    maxHelpArticles: null,
    allowHelpWidget: true,
    allowHelpAnalytics: true,
    allowHelpSearchInsights: true,
    monthlyHelpAiAnswers: 500,
    helpImportsTotal: null,
    helpImportsPerMonth: 20,
    helpImportMaxPages: 40,
    helpImportMaxArticles: 20,
  },
};

/** Unknown plan names fall back to free. */
export function normalizePlan(raw: string): PlanKey {
  const s = String(raw || "free")
    .trim()
    .toLowerCase();
  return (PLANS as ReadonlyArray<string>).includes(s) ? (s as PlanKey) : "free";
}

/** Limits for a plan key or raw plan string. */
export function getPlanLimits(plan: PlanKey | string): PlanLimits {
  return LIMITS[normalizePlan(String(plan))];
}

/** Text colour used to identify each plan consistently across the product. */
export function getPlanColorClassName(plan: PlanKey | string): string {
  switch (normalizePlan(String(plan))) {
    case "starter":
      return "text-blue-600 dark:text-blue-400";
    case "professional":
      return "text-orange-600 dark:text-orange-400";
    default:
      return "text-muted-foreground";
  }
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

/** Copy for the member-cap upgrade prompt. */
export function getMemberLimitMessage(
  plan: PlanKey | string,
  maxMembers: number,
) {
  return `${PLAN_LABELS[normalizePlan(String(plan))]} plan allows up to ${maxMembers} members.`;
}
