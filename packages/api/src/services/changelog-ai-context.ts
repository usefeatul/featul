import { and, desc, eq, inArray } from "drizzle-orm";
import { board, post, postUpdate, workspace } from "@featul/db";

export type AiAction =
  | "prompt"
  | "format"
  | "improve"
  | "summary"
  | "generateFromPosts";

export type AiTone = "user-friendly" | "technical" | "brief";

export type AiSourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number | null;
  roadmapStatus: string | null;
  updatedAt: Date | null;
  latestUpdate: {
    title: string;
    content: string;
  } | null;
};

const SHIPPABLE_STATUSES = ["completed", "progress"] as const;

const TONE_GUIDANCE: Record<AiTone, string> = {
  "user-friendly":
    "Write for end users. Avoid jargon. Focus on benefits and what changed for them.",
  technical:
    "Write for technical users. Include implementation details where helpful.",
  brief:
    "Keep it very concise. Prefer short bullets and minimal prose.",
};

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function formatSourcePostsBlock(posts: AiSourcePost[]) {
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
            `Content: ${truncateText(item.latestUpdate.content, 600)}`,
          ].join("\n")
        : null;

      return [
        `${index + 1}. ${item.title}`,
        voteLine,
        statusLine,
        `Original request: ${truncateText(item.content, 800)}`,
        updateBlock,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
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
        inArray(post.roadmapStatus, [...SHIPPABLE_STATUSES]),
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
}) {
  if (params.postIds.length === 0) {
    return [];
  }

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
        inArray(post.id, params.postIds),
        inArray(post.roadmapStatus, [...SHIPPABLE_STATUSES]),
        eq(post.status, "published"),
      ),
    )) as Array<{
    id: string;
    title: string;
    content: string;
    upvotes: number | null;
    roadmapStatus: string | null;
    updatedAt: Date | null;
  }>;

  const updates = (await params.db
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
    .orderBy(desc(postUpdate.createdAt))) as Array<{
    postId: string;
    title: string;
    content: string;
    createdAt: Date | null;
  }>;

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
    })) satisfies AiSourcePost[];
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

export function buildAiUserPrompt(input: {
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
  tone?: AiTone;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
}) {
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}` : "";
  const contentBlock = input.contentMarkdown
    ? `Content (Markdown):\n${input.contentMarkdown}`
    : "";
  const workspaceLine = input.workspaceName
    ? `Workspace/product: ${input.workspaceName}`
    : "";
  const sourcePostsBlock = input.sourcePosts?.length
    ? `Shipped or in-progress feedback items:\n${formatSourcePostsBlock(input.sourcePosts)}`
    : "";

  switch (input.action) {
    case "prompt":
      return [
        "Write a changelog entry based on the prompt below.",
        "Requirements:",
        "- Provide a short, clear title.",
        "- Write a concise Markdown body with headings or bullets when helpful.",
        "- Provide a 1-2 sentence summary (<= 512 characters).",
        workspaceLine,
        titleLine ? `Current title (if helpful): ${titleLine}` : "",
        "Prompt:",
        input.prompt || "",
      ]
        .filter(Boolean)
        .join("\n");
    case "generateFromPosts":
      return [
        "Write a changelog entry for the shipped or in-progress feedback items below.",
        "Requirements:",
        "- Provide a short, clear title covering the selected updates.",
        "- Write a user-facing Markdown body with headings or bullets.",
        "- Reference the original user requests naturally when helpful.",
        "- Mention vote counts only when they add credibility.",
        "- Provide a 1-2 sentence summary (<= 512 characters).",
        TONE_GUIDANCE[input.tone ?? "user-friendly"],
        workspaceLine,
        sourcePostsBlock,
        input.prompt?.trim()
          ? `Additional instructions from the author:\n${input.prompt.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    case "format":
      return [
        "Fix formatting and structure without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "improve":
      return [
        "Improve clarity and concision without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "summary":
      return [
        "Write a concise 1-2 sentence summary (<= 512 characters).",
        "Return JSON with summary only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    default:
      return "";
  }
}
