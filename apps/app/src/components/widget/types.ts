export type Section = "home" | "feedback" | "roadmap" | "changelog";
export type WidgetLayoutStyle = "compact" | "comfortable" | "spacious";
export type WidgetThemeMode = "light" | "dark" | "auto";

export type FeedbackView = "list" | "compose" | "detail";

export type Board = {
  id: string;
  name: string;
  slug?: string;
  allowAnonymous?: boolean;
};

export type IdentifiedUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  expiresAt: number;
  signature: string;
};

export type WidgetPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  image?: string | null;
  upvotes: number | null;
  commentCount: number | null;
  roadmapStatus: string | null;
  createdAt: string | Date | null;
  boardId: string;
  boardName: string | null;
  boardSlug: string | null;
  isAnonymous: boolean | null;
  authorName: string | null;
  authorImage: string | null;
  hasVoted: boolean;
};

export type WidgetComment = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  image?: string | null;
  authorName: string;
  authorImage: string | null;
  isAnonymous: boolean;
  upvotes: number;
  replyCount: number;
  depth: number;
  createdAt: string | Date;
  hasVoted: boolean;
};

export type SimilarPost = {
  id: string;
  title: string;
  slug: string;
  upvotes: number | null;
  boardId: string;
};

export type WidgetApiBase = {
  projectId: string;
  parentOrigin: string;
};

export type WidgetWorkspace = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
  hideBranding: boolean | null;
  layoutStyle: WidgetLayoutStyle;
  theme: WidgetThemeMode;
};
