import { and, desc, eq, inArray } from "drizzle-orm";
import { board, post, postUpdate, workspace } from "@featul/db";

export type AiAction =
  | "prompt"
  | "format"
  | "improve"
  | "expand"
  | "summary"
  | "generateFromPosts";

export type AiTone = "user-friendly" | "technical" | "brief";
export type AiDetailLevel = "standard" | "detailed";

const CHANGELOG_BODY_STRUCTURE = [
  "Use this Markdown structure:",
  "1. Opening paragraph: set context and summarize what shipped.",
  "2. For each major update, add an ## heading.",
  "3. Under each heading include:",
  "   - A paragraph on what changed and why users care",
  "   - A bullet list with 2-4 concrete improvements or behaviors",
  "   - Optional short note on how to use it, if relevant",
  "4. Optional closing paragraph thanking users for feedback.",
].join("\n");

const DETAIL_GUIDANCE: Record<AiDetailLevel, string> = {
  standard:
    "Target length: roughly 200-450 words in contentMarkdown. Be thorough but not exhaustive.",
  detailed:
    "Target length: roughly 450-900 words in contentMarkdown for multi-item releases, or 250-500 for a single item. Write a full, publish-ready entry — not a short blurb.",
};

const TONE_GUIDANCE: Record<AiTone, string> = {
  "user-friendly":
    "Audience: end users. Use plain language, focus on outcomes and benefits, avoid internal jargon.",
  technical:
    "Audience: technical users. Include implementation details, APIs, settings, or constraints where helpful.",
  brief:
    "Keep the entry shorter, but still use headings and bullets. Aim for clarity over length.",
};

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
  detailLevel?: AiDetailLevel;
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
  const itemCount = input.sourcePosts?.length ?? 0;
  const detailLevel = input.detailLevel ?? "detailed";

  switch (input.action) {
    case "prompt":
      return [
        "Write a polished changelog entry based on the prompt below.",
        "Requirements:",
        "- Provide a clear, compelling title.",
        "- Write a substantive Markdown body — not just a few sentences.",
        "- Provide a 2-3 sentence summary (<= 512 characters).",
        DETAIL_GUIDANCE.detailed,
        CHANGELOG_BODY_STRUCTURE,
        TONE_GUIDANCE[input.tone ?? "user-friendly"],
        workspaceLine,
        titleLine ? `Current title (if helpful): ${titleLine}` : "",
        "Prompt:",
        input.prompt || "",
      ]
        .filter(Boolean)
        .join("\n\n");
    case "generateFromPosts":
      return [
        `Write a polished, publish-ready changelog entry covering ${itemCount} shipped feedback item${itemCount === 1 ? "" : "s"}.`,
        "Requirements:",
        "- Title: clear and compelling (max 12 words).",
        "- Summary: 2-3 sentences previewing the release (<= 512 characters).",
        "- Body: comprehensive Markdown that explains what shipped and why it matters.",
        "- Reference original user requests naturally when the feedback context supports it.",
        "- Mention vote counts only when they add credibility.",
        "- Do NOT write a thin update with only a few sentences.",
        DETAIL_GUIDANCE[detailLevel],
        CHANGELOG_BODY_STRUCTURE,
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
        "Preserve or improve headings, paragraphs, and bullet lists.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "improve":
      return [
        "Improve clarity, flow, and polish without losing important detail.",
        "Make the writing sound more professional and user-friendly.",
        "If the entry is too thin, expand key sections with helpful context.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "expand":
      return [
        "Expand this changelog entry with more useful detail.",
        "Add missing context, user benefits, examples, and concrete bullet points.",
        "Use headings and lists where helpful. Do not remove existing information.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "summary":
      return [
        "Write a compelling 2-3 sentence summary (<= 512 characters) that previews the entry.",
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
