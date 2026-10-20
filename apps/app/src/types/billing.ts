export type BillingUsage = {
  boards: number;
  members: number;
  tags: number;
  integrations: number;
  helpCollections: number;
  /** Published only; drafts don't count toward the plan limit. */
  helpArticles: number;
};
