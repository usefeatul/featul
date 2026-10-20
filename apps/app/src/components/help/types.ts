export type HelpAdminCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  position: number;
};

export type HelpAdminArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  collectionId: string | null;
  status: "draft" | "published";
  position: number;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  updatedAt: string | Date;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
};

export type HelpAdminTree = {
  collections: HelpAdminCollection[];
  articles: HelpAdminArticle[];
};

/** Helpful share of all votes, or null before anyone has voted. */
export function helpfulRatio(a: Pick<HelpAdminArticle, "helpfulCount" | "notHelpfulCount">) {
  const total = a.helpfulCount + a.notHelpfulCount;
  return total > 0 ? Math.round((a.helpfulCount / total) * 100) : null;
}
