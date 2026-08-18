import { extractTextFromTiptap, type TiptapContent } from "@/types/changelog";
import type {
  Board,
  IdentifiedUser,
  Section,
  SimilarPost,
  WidgetComment,
  WidgetLayoutStyle,
  WidgetPost,
  WidgetThemeMode,
} from "./types";
import type { WidgetRoadmapItem } from "./roadmap";
import type { WidgetChangelogEntry } from "./updates";
import { toShortPreview } from "./utils";

type ChangelogAuthor = {
  name?: unknown;
  image?: unknown;
  isOwner?: unknown;
  role?: unknown;
  roleLabel?: unknown;
};

type ChangelogTag = {
  id: string;
  name: string;
  color: string | null;
};

type ConfigTab = Exclude<Section, "home">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asAuthor(value: unknown): ChangelogAuthor {
  return isRecord(value) ? value : {};
}

function isTiptapContent(value: unknown): value is TiptapContent {
  return isRecord(value) && value.type === "doc";
}

function asTiptapContent(value: unknown): TiptapContent | string | null {
  if (typeof value === "string") return value;
  if (isTiptapContent(value)) return value;
  return null;
}

function mapChangelogTag(value: unknown): ChangelogTag | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !value.name.trim()
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    color: typeof value.color === "string" ? value.color : null,
  };
}

export function mapChangelogEntries(
  entries: unknown[],
): WidgetChangelogEntry[] {
  return entries.map((raw) => {
    const entry = asRecord(raw);
    const author = asAuthor(entry.author);
    const summary = asOptionalString(entry.summary);
    const fromContent = extractTextFromTiptap(asTiptapContent(entry.content));
    const rawPreview =
      asOptionalString(entry.preview) ||
      summary ||
      (fromContent ? fromContent.trim() : null);
    const preview = rawPreview ? toShortPreview(rawPreview, 3) : null;
    const authorName =
      asOptionalString(entry.authorName) || asOptionalString(author.name);
    const authorImage =
      asOptionalString(entry.authorImage) || asOptionalString(author.image);
    const authorIsOwner = Boolean(entry.authorIsOwner ?? author.isOwner);
    const authorRole =
      (typeof entry.authorRole === "string" ? entry.authorRole : null) ||
      (typeof author.role === "string" ? author.role : null);
    const authorRoleLabel =
      asOptionalString(entry.authorRoleLabel) ||
      asOptionalString(author.roleLabel) ||
      (authorIsOwner
        ? "Founder"
        : authorRole === "admin"
          ? "Admin"
          : authorRole === "member"
            ? "Member"
            : authorRole === "viewer"
              ? "Viewer"
              : null);
    const tags = Array.isArray(entry.tags)
      ? entry.tags
          .map(mapChangelogTag)
          .filter((tag): tag is ChangelogTag => tag !== null)
      : [];

    return {
      id: String(entry.id || ""),
      title: String(entry.title || ""),
      slug: typeof entry.slug === "string" ? entry.slug : undefined,
      summary,
      preview,
      content: asTiptapContent(entry.content),
      coverImage: asOptionalString(entry.coverImage),
      publishedAt:
        entry.publishedAt instanceof Date
          ? entry.publishedAt.toISOString()
          : typeof entry.publishedAt === "string"
            ? entry.publishedAt
            : null,
      tags,
      authorName,
      authorImage,
      authorRoleLabel,
    } satisfies WidgetChangelogEntry;
  });
}

export function parseWidgetPost(value: unknown): WidgetPost | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.boardId !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    content: typeof value.content === "string" ? value.content : null,
    image: typeof value.image === "string" ? value.image : null,
    upvotes: typeof value.upvotes === "number" ? value.upvotes : null,
    commentCount:
      typeof value.commentCount === "number" ? value.commentCount : null,
    roadmapStatus:
      typeof value.roadmapStatus === "string" ? value.roadmapStatus : null,
    createdAt:
      value.createdAt instanceof Date || typeof value.createdAt === "string"
        ? value.createdAt
        : null,
    boardId: value.boardId,
    boardName: typeof value.boardName === "string" ? value.boardName : null,
    boardSlug: typeof value.boardSlug === "string" ? value.boardSlug : null,
    isAnonymous:
      typeof value.isAnonymous === "boolean" ? value.isAnonymous : null,
    authorName: typeof value.authorName === "string" ? value.authorName : null,
    authorImage:
      typeof value.authorImage === "string" ? value.authorImage : null,
    hasVoted: Boolean(value.hasVoted),
  };
}

export function parseWidgetPosts(value: unknown): WidgetPost[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const post = parseWidgetPost(item);
        return post ? [post] : [];
      })
    : [];
}

export function parseWidgetComment(value: unknown): WidgetComment | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.postId !== "string" ||
    typeof value.content !== "string" ||
    typeof value.authorName !== "string"
  ) {
    return null;
  }
  if (
    !(value.createdAt instanceof Date || typeof value.createdAt === "string") ||
    (value.parentId !== null && typeof value.parentId !== "string")
  ) {
    return null;
  }
  return {
    id: value.id,
    postId: value.postId,
    parentId: typeof value.parentId === "string" ? value.parentId : null,
    content: value.content,
    image: typeof value.image === "string" ? value.image : null,
    authorName: value.authorName,
    authorImage:
      typeof value.authorImage === "string" ? value.authorImage : null,
    isAnonymous: Boolean(value.isAnonymous),
    upvotes: typeof value.upvotes === "number" ? value.upvotes : 0,
    replyCount: typeof value.replyCount === "number" ? value.replyCount : 0,
    depth: typeof value.depth === "number" ? value.depth : 0,
    createdAt: value.createdAt,
    hasVoted: Boolean(value.hasVoted),
  };
}

export function parseWidgetComments(value: unknown): WidgetComment[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const comment = parseWidgetComment(item);
        return comment ? [comment] : [];
      })
    : [];
}

export function parseWidgetRoadmapItem(
  value: unknown,
): WidgetRoadmapItem | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    content: typeof value.content === "string" ? value.content : null,
    slug: typeof value.slug === "string" ? value.slug : null,
    roadmapStatus:
      typeof value.roadmapStatus === "string" ? value.roadmapStatus : null,
    upvotes: typeof value.upvotes === "number" ? value.upvotes : null,
    hasVoted: Boolean(value.hasVoted),
    authorName: typeof value.authorName === "string" ? value.authorName : null,
    authorImage:
      typeof value.authorImage === "string" ? value.authorImage : null,
    isAnonymous:
      typeof value.isAnonymous === "boolean" ? value.isAnonymous : null,
    createdAt:
      value.createdAt instanceof Date || typeof value.createdAt === "string"
        ? value.createdAt
        : null,
  };
}

export function parseWidgetRoadmapItems(value: unknown): WidgetRoadmapItem[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const post = parseWidgetRoadmapItem(item);
        return post ? [post] : [];
      })
    : [];
}

export function parseSimilarPosts(value: unknown): SimilarPost[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.slug !== "string" ||
      typeof item.boardId !== "string"
    ) {
      return [];
    }
    return [
      {
        id: item.id,
        title: item.title,
        slug: item.slug,
        upvotes: typeof item.upvotes === "number" ? item.upvotes : null,
        boardId: item.boardId,
      },
    ];
  });
}

export function parseBoards(value: unknown): Board[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.name !== "string"
    ) {
      return [];
    }
    return [
      {
        id: item.id,
        name: item.name,
        slug: typeof item.slug === "string" ? item.slug : undefined,
        allowAnonymous:
          typeof item.allowAnonymous === "boolean"
            ? item.allowAnonymous
            : undefined,
      },
    ];
  });
}

export function parseConfigTabs(value: unknown): ConfigTab[] {
  if (!Array.isArray(value)) return [];
  const tabs = value.filter(
    (item): item is ConfigTab =>
      item === "feedback" || item === "roadmap" || item === "changelog",
  );
  return tabs.includes("feedback") ? tabs : ["feedback", ...tabs];
}

export function parseLayoutStyle(value: unknown): WidgetLayoutStyle {
  if (value === "compact" || value === "comfortable" || value === "spacious") {
    return value;
  }
  return "comfortable";
}

export function parseBrandingTheme(value: unknown): WidgetThemeMode {
  if (value === "light" || value === "dark" || value === "auto") return value;
  return "auto";
}

export function parseSection(value: unknown): Section | null {
  if (
    value === "home" ||
    value === "feedback" ||
    value === "roadmap" ||
    value === "changelog"
  ) {
    return value;
  }
  if (isRecord(value)) return parseSection(value.section);
  return null;
}

export function parseThemeMode(
  value: unknown,
): "light" | "dark" | "auto" | null {
  if (!isRecord(value)) return null;
  const mode = value.mode ?? value.theme;
  if (mode === "light" || mode === "dark" || mode === "auto") return mode;
  return null;
}

export function parseIdentifiedUser(value: unknown): IdentifiedUser | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    typeof value.expiresAt !== "number" ||
    typeof value.signature !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    email: value.email,
    name: typeof value.name === "string" ? value.name : undefined,
    avatar: typeof value.avatar === "string" ? value.avatar : undefined,
    expiresAt: value.expiresAt,
    signature: value.signature,
  };
}
