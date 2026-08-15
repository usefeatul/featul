import { and, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createId } from "@paralleldrive/cuid2";
import { board, post, user, vote, workspace } from "@featul/db";
import { toSlug } from "../../shared/slug";
import type { AuthenticatedRouterContext } from "../../types/router";
import type { WidgetIdentity } from "./schema";

export type WidgetRouterContext = Pick<AuthenticatedRouterContext, "db">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getWidgetRequest(c: unknown): Request {
  if (!isRecord(c)) {
    throw new Error("Expected request on widget router context");
  }
  const req = c.req;
  if (isRecord(req) && req.raw instanceof Request) return req.raw;
  if (c.request instanceof Request) return c.request;
  throw new Error("Expected request on widget router context");
}

export type ResolvedWidget = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaceLogo: string | null;
  primaryColor: string | null;
  hideBranding: boolean | null;
  config: {
    projectId: string;
    defaultBoardId: string | null;
    theme: "light" | "dark" | "auto";
    position: "left" | "right";
    enabledTabs: Array<"feedback" | "roadmap" | "changelog">;
    allowGuestPosting: boolean;
  };
};

export function assertWidgetPostImageUrl(imageUrl: string, workspaceSlug: string) {
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new HTTPException(400, { message: "Invalid image URL" });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new HTTPException(400, { message: "Invalid image URL" });
  }

  const publicBase = String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  if (!publicBase) {
    throw new HTTPException(500, { message: "Image storage is not configured" });
  }
  const expectedPrefix = `${publicBase}/workspaces/${workspaceSlug}/posts/`;
  if (!imageUrl.startsWith(expectedPrefix)) {
    throw new HTTPException(400, { message: "Invalid image URL" });
  }
}

function defaultConfig(workspaceId: string): ResolvedWidget["config"] {
  return {
    projectId: workspaceId,
    defaultBoardId: null,
    theme: "auto",
    position: "right",
    enabledTabs: ["feedback", "roadmap", "changelog"],
    allowGuestPosting: true,
  };
}

export async function resolveWidget(ctx: WidgetRouterContext, projectId: string): Promise<ResolvedWidget> {
  const [ws] = await ctx.db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      primaryColor: workspace.primaryColor,
      hideBranding: workspace.hideBranding,
    })
    .from(workspace)
    .where(eq(workspace.id, projectId))
    .limit(1);

  if (!ws) throw new HTTPException(404, { message: "Widget project not found" });

  return {
    workspaceId: ws.id,
    workspaceName: ws.name,
    workspaceSlug: ws.slug,
    workspaceLogo: ws.logo,
    primaryColor: ws.primaryColor,
    hideBranding: ws.hideBranding,
    config: defaultConfig(ws.id),
  };
}

export function createPostSlug(title: string): string {
  const base = toSlug(title).replace(/[^a-z0-9-]+/g, "").replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `post-${suffix}`;
}

/**
 * Unsigned identify/userId is not trusted. HMAC verification is a follow-up
 * once a workspace signing secret is wired.
 */
export function isVerifiedIdentity(_identity?: WidgetIdentity) {
  return false;
}

export async function upsertIdentifiedUser(ctx: WidgetRouterContext, identity: WidgetIdentity) {
  const now = new Date();
  const values = {
    id: `fu${createId()}`,
    email: identity.email.toLowerCase(),
    name: identity.name || identity.email,
    image: identity.avatar || null,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  const [row] = await ctx.db
    .insert(user)
    .values(values)
    .onConflictDoUpdate({
      target: user.email,
      set: {
        name: values.name,
        image: values.image,
        updatedAt: now,
      },
    })
    .returning();

  return row;
}

export async function resolveViewerId(
  _ctx: WidgetRouterContext,
  input: {
    userId?: string;
    identity?: WidgetIdentity;
  },
): Promise<string | null> {
  if (!isVerifiedIdentity(input.identity)) return null;
  return null;
}

export async function resolveAuthorId(
  _ctx: WidgetRouterContext,
  input: {
    userId?: string;
    identity?: WidgetIdentity;
  },
): Promise<string | null> {
  if (!isVerifiedIdentity(input.identity)) return null;
  return null;
}

export async function loadVotedPostIds(
  ctx: WidgetRouterContext,
  postIds: string[],
  viewer: { userId: string | null; fingerprint: string | null },
): Promise<Set<string>> {
  if (!postIds.length || (!viewer.userId && !viewer.fingerprint)) return new Set();

  const voteFilter = viewer.userId
    ? and(inArray(vote.postId, postIds), eq(vote.userId, viewer.userId))
    : and(
        inArray(vote.postId, postIds),
        isNull(vote.userId),
        eq(vote.fingerprint, viewer.fingerprint || ""),
      );

  const rows = await ctx.db
    .select({ postId: vote.postId })
    .from(vote)
    .where(voteFilter);

  return new Set(
    rows
      .map((row) => row.postId)
      .filter((postId): postId is string => typeof postId === "string"),
  );
}

export function publicPostWhere(
  workspaceId: string,
  boardId?: string,
  search?: string,
  status?: string,
) {
  const filters = [
    eq(board.workspaceId, workspaceId),
    eq(board.isSystem, false),
    eq(board.isPublic, true),
  ];
  if (boardId) filters.push(eq(board.id, boardId));
  if (status) filters.push(eq(post.roadmapStatus, status));
  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    filters.push(or(ilike(post.title, q), ilike(post.content, q))!);
  }
  return and(...filters);
}

export const postSelectFields = {
  id: post.id,
  title: post.title,
  slug: post.slug,
  content: post.content,
  image: post.image,
  upvotes: post.upvotes,
  commentCount: post.commentCount,
  roadmapStatus: post.roadmapStatus,
  createdAt: post.createdAt,
  boardId: post.boardId,
  boardName: board.name,
  boardSlug: board.slug,
  isAnonymous: post.isAnonymous,
  authorName: user.name,
  authorImage: user.image,
  metadata: post.metadata,
};

export function dicebearAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed || "guest")}`;
}

export function resolveWidgetAuthorImage(row: {
  id: string;
  slug: string;
  isAnonymous: boolean | null;
  authorImage: string | null;
  metadata?: unknown;
}) {
  if (!row.isAnonymous && row.authorImage) return row.authorImage;
  const fingerprint =
    isRecord(row.metadata) && typeof row.metadata.fingerprint === "string"
      ? row.metadata.fingerprint
      : "";
  return dicebearAvatar(fingerprint || row.id || row.slug || "guest");
}

export function mapWidgetPostRow<T extends {
  id: string;
  slug: string;
  isAnonymous: boolean | null;
  authorName: string | null;
  authorImage: string | null;
  metadata?: unknown;
}>(row: T, hasVoted: boolean) {
  const { metadata: _metadata, ...rest } = row;
  return {
    ...rest,
    authorName: row.isAnonymous ? null : row.authorName,
    authorImage: resolveWidgetAuthorImage(row),
    hasVoted,
  };
}

export function resolveAuthorRoleLabel(
  isOwner: boolean,
  role?: string | null,
): "Founder" | "Admin" | "Member" | "Viewer" | null {
  if (isOwner) return "Founder";
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  if (role === "viewer") return "Viewer";
  return null;
}

export function extractTiptapPlainText(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return extractTiptapPlainText(JSON.parse(trimmed));
      } catch {
        // fall through to html/plaintext cleanup
      }
    }
    return trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parts: string[] = [];
  const visit = (node: unknown) => {
    if (!isRecord(node)) return;
    if (typeof node.text === "string" && node.text.trim()) {
      parts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) visit(child);
    }
  };

  if (Array.isArray(content)) {
    for (const node of content) visit(node);
  } else {
    visit(content);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
