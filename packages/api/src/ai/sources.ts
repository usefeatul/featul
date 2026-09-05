import { and, desc, eq, inArray } from "drizzle-orm";
import {
  board,
  changelogEntry,
  post,
  postUpdate,
  workspace,
} from "@featul/db";
import { getChangelogTags } from "../changelog/types";
import { SHIPPABLE_ROADMAP_STATUSES } from "./constants";
import type { AiSourcePost } from "./types";

type PostMetadata = {
  integrations?: { github?: string; jira?: string };
} | null;

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function githubUrlFromMetadata(metadata: PostMetadata) {
  const url = metadata?.integrations?.github?.trim();
  return url || null;
}

function tiptapToPlain(content: unknown, maxLength: number) {
  const parts: string[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.text === "string" && record.text.trim()) {
      parts.push(record.text);
    }
    if (Array.isArray(record.content)) {
      for (const child of record.content) {
        walk(child);
      }
    }
  };

  walk(content);
  return truncateText(parts.join(" "), maxLength);
}

export async function fetchAiSourcePostsList(params: {
  db: any;
  workspaceId: string;
  limit?: number;
}) {
  const limit = params.limit ?? 50;

  const rows = (await params.db
    .select({
      id: post.id,
      title: post.title,
      content: post.content,
      upvotes: post.upvotes,
      roadmapStatus: post.roadmapStatus,
      slug: post.slug,
      metadata: post.metadata,
      publishedAt: post.publishedAt,
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
    slug: string | null;
    metadata: PostMetadata;
    publishedAt: Date | null;
    updatedAt: Date | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: truncateText(row.content, 240),
    upvotes: row.upvotes ?? 0,
    roadmapStatus: row.roadmapStatus,
    slug: row.slug,
    githubUrl: githubUrlFromMetadata(row.metadata),
    publishedAt: row.publishedAt,
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
        slug: post.slug,
        metadata: post.metadata,
        publishedAt: post.publishedAt,
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
        slug: string | null;
        metadata: PostMetadata;
        publishedAt: Date | null;
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
      slug: row.slug,
      githubUrl: githubUrlFromMetadata(row.metadata),
      publishedAt: row.publishedAt,
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

export async function fetchAiBrandContext(params: {
  db: any;
  workspaceId: string;
}) {
  const [changelogBoard] = (await params.db
    .select({
      id: board.id,
      changelogTags: board.changelogTags,
    })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, params.workspaceId),
        eq(board.systemType, "changelog"),
      ),
    )
    .limit(1)) as Array<{ id: string; changelogTags: unknown }>;

  if (!changelogBoard) {
    return { brandVoice: "", tagNames: [] as string[] };
  }

  const entries = (await params.db
    .select({
      title: changelogEntry.title,
      summary: changelogEntry.summary,
      content: changelogEntry.content,
    })
    .from(changelogEntry)
    .where(
      and(
        eq(changelogEntry.boardId, changelogBoard.id),
        eq(changelogEntry.status, "published"),
      ),
    )
    .orderBy(desc(changelogEntry.publishedAt))
    .limit(3)) as Array<{
    title: string;
    summary: string | null;
    content: unknown;
  }>;

  const brandVoice = entries
    .map((entry) => {
      const sample =
        entry.summary?.trim() || tiptapToPlain(entry.content, 500);
      return [`Title: ${entry.title}`, sample].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

  return {
    brandVoice,
    tagNames: getChangelogTags(changelogBoard.changelogTags).map(
      (tag) => tag.name,
    ),
  };
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
      const linkLine = item.slug ? `Public path: /board/p/${item.slug}` : null;
      const githubLine = item.githubUrl ? `GitHub: ${item.githubUrl}` : null;
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
        linkLine,
        githubLine,
        `Original request: ${truncateText(item.content, 400)}`,
        updateBlock,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export function ensureFeedbackSection(
  markdown: string,
  posts: Array<{ title: string; slug?: string | null }>,
) {
  const linkable = posts.filter((post) => post.slug);
  if (linkable.length === 0) return markdown;
  if (/^##\s+feedback\b/im.test(markdown)) return markdown;

  const list = linkable
    .map((post) => `- [${post.title}](/board/p/${post.slug})`)
    .join("\n");

  return `${markdown.trim()}\n\n## Feedback\n${list}\n`;
}
