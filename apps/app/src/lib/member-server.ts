import {
  activityLog,
  board,
  comment,
  db,
  post,
  vote,
  workspace,
  workspaceMember,
} from "@featul/db";
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import type { PaginatedActivity } from "@/types/activity";

function readActivityStatus(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const candidate = metadata as { status?: unknown; roadmapStatus?: unknown };
  if (typeof candidate.status === "string" && candidate.status.trim()) {
    return candidate.status;
  }
  if (
    typeof candidate.roadmapStatus === "string" &&
    candidate.roadmapStatus.trim()
  ) {
    return candidate.roadmapStatus;
  }
  return null;
}

async function getWorkspaceForMemberAccess(slug: string, viewerId: string) {
  const [workspaceRow] = await db
    .select({ id: workspace.id, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  if (!workspaceRow) return null;
  if (workspaceRow.ownerId === viewerId) return workspaceRow;

  const [membership] = await db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceRow.id),
        eq(workspaceMember.userId, viewerId),
        eq(workspaceMember.isActive, true)
      )
    )
    .limit(1);

  return membership ? workspaceRow : null;
}

export async function loadMemberStats(
  slug: string,
  memberUserId: string,
  viewerUserId: string
): Promise<{
  stats: { posts: number; comments: number; upvotes: number };
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    upvotes: number;
    status?: string | null;
  }>;
}> {
  const workspaceRow = await getWorkspaceForMemberAccess(slug, viewerUserId);
  if (!workspaceRow) {
    return {
      stats: { posts: 0, comments: 0, upvotes: 0 },
      topPosts: [],
    };
  }

  const [postsCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceRow.id),
        eq(post.authorId, memberUserId)
      )
    )
    .limit(1);

  const [commentsCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comment)
    .innerJoin(post, eq(comment.postId, post.id))
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceRow.id),
        eq(comment.authorId, memberUserId)
      )
    )
    .limit(1);

  const [postVotesCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vote)
    .innerJoin(post, eq(vote.postId, post.id))
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceRow.id),
        eq(vote.userId, memberUserId),
        isNull(vote.commentId)
      )
    )
    .limit(1);

  const [commentVotesCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vote)
    .innerJoin(comment, eq(vote.commentId, comment.id))
    .innerJoin(post, eq(comment.postId, post.id))
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceRow.id),
        eq(vote.userId, memberUserId),
        isNull(vote.postId)
      )
    )
    .limit(1);

  const topPosts = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      upvotes: post.upvotes,
      status: post.roadmapStatus,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceRow.id),
        eq(post.authorId, memberUserId)
      )
    )
    .orderBy(
      sql`coalesce(${post.upvotes}, 0) desc`,
      sql`coalesce(${post.createdAt}, now()) desc`
    )
    .limit(5);

  return {
    stats: {
      posts: Number(postsCountRow?.count || 0),
      comments: Number(commentsCountRow?.count || 0),
      upvotes:
        Number(postVotesCountRow?.count || 0) +
        Number(commentVotesCountRow?.count || 0),
    },
    topPosts: topPosts.map((topPost) => ({
      id: topPost.id,
      title: topPost.title,
      slug: topPost.slug,
      upvotes: Number(topPost.upvotes || 0),
      status: topPost.status ?? null,
    })),
  };
}

export async function loadMemberActivity(
  slug: string,
  memberUserId: string,
  viewerUserId: string,
  cursor?: string,
  limit: number = 20
): Promise<PaginatedActivity> {
  const workspaceRow = await getWorkspaceForMemberAccess(slug, viewerUserId);
  if (!workspaceRow) {
    return { items: [], nextCursor: null };
  }

  const safeLimit = Math.min(Math.max(Number(limit || 20), 1), 50);
  const cursorDate = cursor ? new Date(cursor) : null;

  const rows = await db
    .select({
      id: activityLog.id,
      type: activityLog.action,
      title: activityLog.title,
      entity: activityLog.entity,
      entityId: activityLog.entityId,
      createdAt: activityLog.createdAt,
      metadata: activityLog.metadata,
    })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.workspaceId, workspaceRow.id),
        eq(activityLog.userId, memberUserId),
        ...(cursorDate ? [lt(activityLog.createdAt, cursorDate)] : [])
      )
    )
    .orderBy(sql`${activityLog.createdAt} desc`)
    .limit(safeLimit + 1);

  const hasMore = rows.length > safeLimit;
  const items = rows.slice(0, safeLimit).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    entity: row.entity || undefined,
    entityId: row.entityId,
    createdAt: row.createdAt,
    metadata: row.metadata ?? undefined,
    status: readActivityStatus(row.metadata) ?? undefined,
  }));
  const lastCreatedAt = items[items.length - 1]?.createdAt;

  return {
    items,
    nextCursor:
      hasMore && lastCreatedAt ? new Date(lastCreatedAt).toISOString() : null,
  };
}
