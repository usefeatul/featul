import { db, workspace, board, post, user, postMerge } from "@featul/db";
import { and, eq, sql } from "drizzle-orm";
import { client } from "@featul/api/client";
import { headers } from "next/headers";
import { readInitialCollapsedCommentIds } from "@/lib/comments.server";
import { avatarUrlFromFingerprint } from "@/lib/author-avatar";
import type { CommentData } from "@/types/comment";

export type WorkspaceSummary = {
  id: string;
  name: string;
  ownerId: string;
};

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
  slug: string
): Promise<WorkspaceSummary | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  return ws ?? null;
}

export function buildPostSelect<T extends Record<string, unknown>>(extra?: T) {
  return {
    id: post.id,
    authorId: post.authorId,
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
      name: user.name,
      image: user.image,
      email: user.email,
    },
    ...(extra || {}),
  };
}

function getFingerprint(metadata: MetadataWithFingerprint): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as { fingerprint?: unknown }).fingerprint;
  return typeof value === "string" && value ? value : null;
}

export function ensureAuthorAvatar<T extends { author: AuthorRecord; metadata?: MetadataWithFingerprint }>(
  postRecord: T,
  options?: { defaultEmail?: string | null }
): T {
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

export async function loadPostComments(
  postId: string,
  surface: "workspace" | "public" = "workspace"
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
      : undefined
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
  roadmapStatus?: string | null;
  mergedAt?: string | null;
  boardName?: string;
  boardSlug?: string;
};

export type MergedPostData = {
  mergedCount: number;
  mergedInto: MergedPostSummary | null;
  mergedSources?: MergedPostSummary[];
};

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
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        roadmapStatus: post.roadmapStatus,
        boardName: board.name,
        boardSlug: board.slug,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(and(eq(board.workspaceId, workspaceId), eq(post.id, duplicateOfId)))
      .limit(1);
    const [mergeRow] = await db
      .select({ createdAt: postMerge.createdAt })
      .from(postMerge)
      .where(
        and(
          eq(postMerge.sourcePostId, postId),
          eq(postMerge.targetPostId, duplicateOfId)
        )
      )
      .limit(1);
    if (target) {
      mergedInto = {
        id: target.id,
        slug: target.slug,
        title: target.title,
        roadmapStatus: target.roadmapStatus,
        mergedAt: mergeRow?.createdAt
          ? new Date(mergeRow.createdAt as any).toISOString()
          : null,
        boardName: target.boardName,
        boardSlug: target.boardSlug,
      };
    }
  }

  let mergedSources: MergedPostSummary[] | undefined;
  if (includeSources) {
    const mergedSourcesRows = await db
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        roadmapStatus: post.roadmapStatus,
        mergedAt: postMerge.createdAt,
        boardName: board.name,
        boardSlug: board.slug,
      })
      .from(postMerge)
      .innerJoin(post, eq(post.id, postMerge.sourcePostId))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(eq(postMerge.targetPostId, postId))
      .orderBy(sql`${postMerge.createdAt} desc`)
      .limit(3);

    mergedSources = mergedSourcesRows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      roadmapStatus: r.roadmapStatus ?? null,
      mergedAt: r.mergedAt ? new Date(r.mergedAt as any).toISOString() : null,
      boardName: r.boardName,
      boardSlug: r.boardSlug,
    }));
  }

  return { mergedCount, mergedInto, mergedSources };
}
