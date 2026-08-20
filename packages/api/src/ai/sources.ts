import { and, desc, eq, inArray } from "drizzle-orm";
import { board, post, postUpdate, workspace } from "@featul/db";
import { SHIPPABLE_ROADMAP_STATUSES } from "./constants";
import type { AiSourcePost } from "./types";

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

export async function fetchAiSourcePostsList(params: {
  db: any;
  workspaceId: string;
  limit?: number;
}) {
  const limit = params.limit ?? 30;

  const rows = (await params.db
    .select({
      id: post.id,
      title: post.title,
      content: post.content,
      upvotes: post.upvotes,
      roadmapStatus: post.roadmapStatus,
      updatedAt: post.updatedAt,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, params.workspaceId),
        inArray(post.roadmapStatus, [...SHIPPABLE_ROADMAP_STATUSES]),
        eq(post.status, "published"),
      ),
    )
    .orderBy(desc(post.updatedAt))
    .limit(limit)) as Array<{
    id: string;
    title: string;
    content: string;
    upvotes: number | null;
    roadmapStatus: string | null;
    updatedAt: Date | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: truncateText(row.content, 240),
    upvotes: row.upvotes ?? 0,
    roadmapStatus: row.roadmapStatus,
    updatedAt: row.updatedAt,
  }));
}

export async function fetchAiSourcePostsByIds(params: {
  db: any;
  workspaceId: string;
  postIds: string[];
}): Promise<AiSourcePost[]> {
  if (params.postIds.length === 0) {
    return [];
  }

  const [rows, updates] = await Promise.all([
    params.db
      .select({
        id: post.id,
        title: post.title,
        content: post.content,
        upvotes: post.upvotes,
        roadmapStatus: post.roadmapStatus,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(board.workspaceId, params.workspaceId),
          inArray(post.id, params.postIds),
          inArray(post.roadmapStatus, [...SHIPPABLE_ROADMAP_STATUSES]),
          eq(post.status, "published"),
        ),
      ) as Promise<
      Array<{
        id: string;
        title: string;
        content: string;
        upvotes: number | null;
        roadmapStatus: string | null;
        updatedAt: Date | null;
      }>
    >,
    params.db
      .select({
        postId: postUpdate.postId,
        title: postUpdate.title,
        content: postUpdate.content,
        createdAt: postUpdate.createdAt,
      })
      .from(postUpdate)
      .where(
        and(
          inArray(postUpdate.postId, params.postIds),
          eq(postUpdate.isPublic, true),
        ),
      )
      .orderBy(desc(postUpdate.createdAt)) as Promise<
      Array<{
        postId: string;
        title: string;
        content: string;
        createdAt: Date | null;
      }>
    >,
  ]);

  const latestUpdateByPostId = new Map<
    string,
    { title: string; content: string }
  >();
  for (const update of updates) {
    if (!latestUpdateByPostId.has(update.postId)) {
      latestUpdateByPostId.set(update.postId, {
        title: update.title,
        content: update.content,
      });
    }
  }

  const rowById = new Map(rows.map((row) => [row.id, row]));

  return params.postIds
    .map((postId) => rowById.get(postId))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      upvotes: row.upvotes,
      roadmapStatus: row.roadmapStatus,
      updatedAt: row.updatedAt,
      latestUpdate: latestUpdateByPostId.get(row.id) ?? null,
    }));
}

export async function getWorkspaceNameForAi(params: {
  db: any;
  workspaceId: string;
}) {
  const [row] = (await params.db
    .select({ name: workspace.name })
    .from(workspace)
    .where(eq(workspace.id, params.workspaceId))
    .limit(1)) as Array<{ name: string }>;

  return row?.name?.trim() || "this product";
}

export function formatSourcePostsBlock(posts: AiSourcePost[]) {
  if (posts.length === 0) {
    return "";
  }

  return posts
    .map((item, index) => {
      const voteLine =
        typeof item.upvotes === "number" && item.upvotes > 0
          ? `Votes: ${item.upvotes}`
          : null;
      const statusLine = item.roadmapStatus
        ? `Roadmap status: ${item.roadmapStatus}`
        : null;
      const updateBlock = item.latestUpdate
        ? [
            "Latest status update:",
            `Title: ${item.latestUpdate.title}`,
            `Content: ${truncateText(item.latestUpdate.content, 300)}`,
          ].join("\n")
        : null;

      return [
        `${index + 1}. ${item.title}`,
        voteLine,
        statusLine,
        `Original request: ${truncateText(item.content, 400)}`,
        updateBlock,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}
