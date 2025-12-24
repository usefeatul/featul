import { db, workspace, board, post, user, workspaceMember, postMerge } from "@oreilla/db";
import { and, eq, sql } from "drizzle-orm";
import { client } from "@oreilla/api/client";
import { readHasVotedForPost } from "@/lib/vote.server";
import { readInitialCollapsedCommentIds } from "@/lib/comments.server";
import { createHash } from "crypto";
import { randomAvatarUrl } from "@/utils/avatar";
import type { CommentData } from "@/types/comment";
import type { SubdomainRequestDetailData } from "@/types/subdomain";

type WorkspaceRow = {
  id: string;
  name: string;
  ownerId: string;
};

type RawPostRow = SubdomainRequestDetailData & {
  authorId: string | null;
  metadata: Record<string, any> | null;
  author:
    | {
        name: string | null;
        image: string | null;
        email: string | null;
      }
    | null;
};

export type PublicBoardRequestDetailPageData = {
  workspaceSlug: string;
  post: SubdomainRequestDetailData;
  initialComments: CommentData[];
  initialCollapsedIds: string[];
  backLink: string;
};

export async function loadPublicBoardRequestDetailPageData({
  subdomain,
  postSlug,
}: {
  subdomain: string;
  postSlug: string;
}): Promise<PublicBoardRequestDetailPageData | null> {
  const ws = await loadWorkspace(subdomain);
  if (!ws) return null;

  const rawPost = await loadPostWithAuthorAndBoard(ws.id, postSlug);
  if (!rawPost) return null;

  const postWithAuthor = ensureAuthorAvatar(rawPost);

  const isOwner = !!rawPost.authorId && rawPost.authorId === ws.ownerId;

  const hasVoted = await readHasVotedForPost(rawPost.id);
  const { initialComments, initialCollapsedIds } = await loadComments(rawPost.id);

  const post: SubdomainRequestDetailData = {
    ...postWithAuthor,
    hasVoted,
    isOwner,
  };

  return {
    workspaceSlug: subdomain,
    post,
    initialComments,
    initialCollapsedIds,
    backLink: `/board/${post.boardSlug}`,
  };
}

async function loadWorkspace(subdomain: string): Promise<WorkspaceRow | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, subdomain))
    .limit(1);

  return ws ?? null;
}

async function loadPostWithAuthorAndBoard(
  workspaceId: string,
  postSlug: string
): Promise<RawPostRow | null> {
  const [p] = await db
    .select({
      id: post.id,
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
      duplicateOfId: post.duplicateOfId,
      metadata: post.metadata,
      role: workspaceMember.role,
      authorId: post.authorId,
      author: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .leftJoin(
      workspaceMember,
      and(eq(workspaceMember.userId, post.authorId), eq(workspaceMember.workspaceId, workspaceId))
    )
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
        eq(post.slug, postSlug)
      )
    )
    .limit(1);

  if (!p) return null;

  const mergedCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(postMerge)
    .where(eq(postMerge.targetPostId, p.id))
    .limit(1);

  const mergedCount = Number(mergedCountRow?.[0]?.count || 0);
  let mergedInto:
    | {
        id: string;
        slug: string;
        title: string;
        roadmapStatus?: string | null;
        mergedAt?: string | null;
        boardName?: string;
        boardSlug?: string;
      }
    | null = null;

  if (p.duplicateOfId) {
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
      .where(and(eq(board.workspaceId, workspaceId), eq(post.id, p.duplicateOfId)))
      .limit(1);
    const [mergeRow] = await db
      .select({ createdAt: postMerge.createdAt })
      .from(postMerge)
      .where(and(eq(postMerge.sourcePostId, p.id), eq(postMerge.targetPostId, p.duplicateOfId)))
      .limit(1);
    if (target) {
      mergedInto = {
        id: target.id,
        slug: target.slug,
        title: target.title,
        roadmapStatus: (target as any).roadmapStatus,
        mergedAt: mergeRow?.createdAt ? new Date(mergeRow.createdAt as any).toISOString() : null,
        boardName: (target as any).boardName,
        boardSlug: (target as any).boardSlug,
      };
    }
  }

  return { ...(p as any), mergedCount, mergedInto } as RawPostRow;
}

function ensureAuthorAvatar(postRecord: RawPostRow): RawPostRow {
  if ((!postRecord.author || !postRecord.author.name) && (postRecord.metadata as any)?.fingerprint) {
    const avatarSeed = createHash("sha256")
      .update((postRecord.metadata as any).fingerprint)
      .digest("hex");

    if (!postRecord.author) {
      postRecord.author = { name: "Guest", image: null, email: "" };
    }

    postRecord.author.image = randomAvatarUrl(avatarSeed);
    postRecord.author.name = "Guest";
  }

  return postRecord;
}

async function loadComments(
  postId: string
): Promise<{ initialComments: CommentData[]; initialCollapsedIds: string[] }> {
  const commentsRes = await client.comment.list.$get({ postId });
  const commentsJson = await commentsRes.json().catch(() => ({ comments: [] }));
  const initialComments = Array.isArray((commentsJson as any)?.comments)
    ? ((commentsJson as any).comments as CommentData[])
    : [];
  const initialCollapsedIds = await readInitialCollapsedCommentIds(postId);

  return { initialComments, initialCollapsedIds };
}

