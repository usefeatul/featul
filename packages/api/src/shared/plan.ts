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
  maxChangelogEntries: number | null;
  maxHelpCollections: number | null;
  /** Drafts are unlimited; only published articles count. */
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
    monthlyPostLimit: null,
    allowBranding: false,
    allowHidePoweredBy: false,
    allowAttachments: true,
    allowIntegrations: false,
    allowDataImports: false,
    maxTags: 5,
    maxChangelogTags: 5,
    maxChangelogEntries: 10,
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
    monthlyPostLimit: null,
    allowBranding: true,
    allowHidePoweredBy: true,
    allowAttachments: true,
    allowIntegrations: true,
    allowDataImports: true,
    maxTags: 10,
    maxChangelogTags: 10,
    maxChangelogEntries: 50,
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
    maxChangelogEntries: null,
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

export function assertWithinLimit(
  current: number,
  max: number | null,
  message: (max: number) => string,
) {
  if (typeof max === "number" && current >= max) {
    throw new Error(message(max));
  }
}
