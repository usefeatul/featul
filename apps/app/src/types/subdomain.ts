export type SubdomainRequestDetailData = {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  upvotes: number;
  commentCount: number;
  roadmapStatus: string | null;
  isFeatured?: boolean;
  isLocked?: boolean;
  isPinned?: boolean;
  publishedAt: string | null;
  createdAt: string;
  boardName: string;
  boardSlug: string;
  hasVoted?: boolean;
  hidePublicMemberIdentity?: boolean;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  isFeatul?: boolean;
  viewerCanEdit?: boolean;
  duplicateOfId?: string | null;
  mergedInto?:
  | {
    id: string;
    slug: string;
    title: string;
    roadmapStatus?: string | null;
    mergedAt?: string | null;
    boardName?: string;
    boardSlug?: string;
  }
  | null;
  mergedCount?: number;
  mergedSources?: Array<{
    id: string;
    slug: string;
    title: string;
    roadmapStatus?: string | null;
    mergedAt?: string | null;
    boardName?: string;
    boardSlug?: string;
  }>;
  author?: {
    name: string | null;
    image: string | null;
    email: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
};
