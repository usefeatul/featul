/** Shared loaders for request detail pages. */
import { db, board, post, user, postMerge, widgetUser } from "@featul/db";
import { and, eq, sql } from "drizzle-orm";
import { client } from "@featul/api/client";
import { headers } from "next/headers";
import { readInitialCollapsedCommentIds } from "@/lib/comments.server";
import { avatarUrlFromFingerprint } from "@/lib/author/avatar";
import type { CommentData } from "@/types/comment";
import type { CommentSurface } from "@/lib/comment/shared";
import {
  getWorkspaceSummaryBySlug,
  type WorkspaceSummaryBySlug,
} from "@/lib/workspace/slug";

export type WorkspaceSummary = WorkspaceSummaryBySlug;

type AuthorRecord = {
  name: string | null;
  image: string | null;
  email: string | null;
} | null;

type MetadataWithFingerprint =
  | { fingerprint?: string | null }
  | Record<string, unknown>
  | null
  | undefined;

export async function loadWorkspaceBySlug(
  slug: string,
): Promise<WorkspaceSummary | null> {
  return getWorkspaceSummaryBySlug(slug);
}

/** Post select shape; coalesces widget-user over registered user. */
export function buildPostSelect<T extends Record<string, unknown>>(extra?: T) {
  return {
    id: post.id,
    authorId: post.authorId,
    widgetUserId: post.widgetUserId,
    title: post.title,
    content: post.content,
    image: post.image,
    upvotes: post.upvotes,
    commentCount: post.commentCount,
    roadmapStatus: post.roadmapStatus,
    isFeatured: post.isFeatured,
    isLocked: post.isLocked,
    isPinned: post.isPinned,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    boardName: board.name,
    boardSlug: board.slug,
    allowComments: board.allowComments,
    duplicateOfId: post.duplicateOfId,
    metadata: post.metadata,
    author: {
      name: sql<string | null>`coalesce(${widgetUser.name}, ${user.name})`,
      image: sql<string | null>`coalesce(${widgetUser.image}, ${user.image})`,
      email: sql<string | null>`coalesce(${widgetUser.email}, ${user.email})`,
    },
    ...(extra || {}),
  };
}

function getFingerprint(metadata: MetadataWithFingerprint): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as { fingerprint?: unknown }).fingerprint;
  return typeof value === "string" && value ? value : null;
}

/** Fills a Guest avatar when the author is missing but a fingerprint exists. */
export function ensureAuthorAvatar<
  T extends { author: AuthorRecord; metadata?: MetadataWithFingerprint },
>(postRecord: T, options?: { defaultEmail?: string | null }): T {
  const fingerprint = getFingerprint(postRecord.metadata);
  if ((!postRecord.author || !postRecord.author.name) && fingerprint) {
    if (!postRecord.author) {
      postRecord.author = {
        name: "Guest",
        image: null,
        email: options?.defaultEmail ?? null,
      };
    }

    postRecord.author.image = avatarUrlFromFingerprint(fingerprint);
    postRecord.author.name = "Guest";
  }

  return postRecord;
}

/** Comments plus collapsed-thread ids from cookies. */
export async function loadPostComments(
  postId: string,
  surface: CommentSurface = "workspace",
): Promise<{ initialComments: CommentData[]; initialCollapsedIds: string[] }> {
  const incomingHeaders = await headers();
  const cookieHeader = incomingHeaders.get("cookie");
  const commentsRes = await client.comment.list.$get(
    { postId, surface },
    cookieHeader
      ? {
          headers: {
            cookie: cookieHeader,
          },
        }
      : undefined,
  );
  const commentsJson = (await commentsRes
    .json()
    .catch(() => ({ comments: [] }))) as { comments?: CommentData[] };
  const initialComments = Array.isArray(commentsJson.comments)
    ? commentsJson.comments
    : [];
  const initialCollapsedIds = await readInitialCollapsedCommentIds(postId);

  return { initialComments, initialCollapsedIds };
}

export type MergedPostSummary = {
  id: string;
  slug: string;
  title: string;
  content?: string | null;
  upvotes?: number;
  commentCount?: number;
  roadmapStatus?: string | null;
  mergedAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  boardName?: string;
  boardSlug?: string;
  authorId?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
};

const mergedPostSelect = {
  id: post.id,
  slug: post.slug,
  title: post.title,
  content: post.content,
  upvotes: post.upvotes,
  commentCount: post.commentCount,
  roadmapStatus: post.roadmapStatus,
  publishedAt: post.publishedAt,
  createdAt: post.createdAt,
  authorId: post.authorId,
  boardName: board.name,
  boardSlug: board.slug,
  authorName: sql<string | null>`coalesce(${widgetUser.name}, ${user.name})`,
  authorImage: sql<string | null>`coalesce(${widgetUser.image}, ${user.image})`,
};

function toIsoOrNull(value?: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toMergedPostSummary(
  row: {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    upvotes: number | null;
    commentCount: number | null;
    roadmapStatus: string | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    authorId: string | null;
    boardName: string;
    boardSlug: string;
    authorName: string | null;
    authorImage: string | null;
  },
  mergedAt?: Date | string | null,
): MergedPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    upvotes: Number(row.upvotes || 0),
    commentCount: Number(row.commentCount || 0),
    roadmapStatus: row.roadmapStatus,
    mergedAt: toIsoOrNull(mergedAt),
    publishedAt: toIsoOrNull(row.publishedAt),
    createdAt: toIsoOrNull(row.createdAt),
    boardName: row.boardName,
    boardSlug: row.boardSlug,
    authorId: row.authorId,
    authorName: row.authorName,
    authorImage: row.authorImage,
  };
}

export type MergedPostData = {
  mergedCount: number;
  mergedInto: MergedPostSummary | null;
  mergedSources?: MergedPostSummary[];
};

/** Merge count, target, and optional recent source posts. */
export async function loadMergedPostData({
  workspaceId,
  postId,
  duplicateOfId,
  includeSources = false,
}: {
  workspaceId: string;
  postId: string;
  duplicateOfId?: string | null;
  includeSources?: boolean;
}): Promise<MergedPostData> {
  const [mergedCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postMerge)
    .where(eq(postMerge.targetPostId, postId))
    .limit(1);

  const mergedCount = Number(mergedCountRow?.count || 0);
  let mergedInto: MergedPostSummary | null = null;

  if (duplicateOfId) {
    const [target] = await db
      .select(mergedPostSelect)
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .leftJoin(widgetUser, eq(post.widgetUserId, widgetUser.id))
      .where(
        and(eq(board.workspaceId, workspaceId), eq(post.id, duplicateOfId)),
      )
      .limit(1);
    const [mergeRow] = await db
      .select({ createdAt: postMerge.createdAt })
      .from(postMerge)
      .where(
        and(
          eq(postMerge.sourcePostId, postId),
          eq(postMerge.targetPostId, duplicateOfId),
        ),
      )
      .limit(1);
    if (target) {
      mergedInto = toMergedPostSummary(target, mergeRow?.createdAt);
    }
  }

  let mergedSources: MergedPostSummary[] | undefined;
  if (includeSources) {
    const mergedSourcesRows = await db
      .select({
        ...mergedPostSelect,
        mergedAt: postMerge.createdAt,
      })
      .from(postMerge)
      .innerJoin(post, eq(post.id, postMerge.sourcePostId))
      .innerJoin(board, eq(post.boardId, board.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .leftJoin(widgetUser, eq(post.widgetUserId, widgetUser.id))
      .where(eq(postMerge.targetPostId, postId))
      .orderBy(sql`${postMerge.createdAt} desc`)
      .limit(3);

    mergedSources = mergedSourcesRows.map((r) =>
      toMergedPostSummary(r, r.mergedAt),
    );
  }

  return { mergedCount, mergedInto, mergedSources };
}
