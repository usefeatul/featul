import { createHash } from "crypto";
import { and, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createId } from "@paralleldrive/cuid2";
import {
  board,
  post,
  user,
  vote,
  widgetUser,
  workspace,
  workspaceDomain,
} from "@featul/db";
import { toSlug } from "../../shared/slug";
import {
  buildWidgetOriginAllowlist,
  isVerifiedIdentity as verifySignedIdentity,
} from "../../shared/identity";
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
  widgetSecret: string;
  customDomain: string | null;
  allowedOrigins: string[];
  config: {
    projectId: string;
    defaultBoardId: string | null;
    theme: "light" | "dark" | "auto";
    position: "left" | "right";
    enabledTabs: Array<"feedback" | "roadmap" | "changelog">;
    allowGuestPosting: boolean;
  };
};

export function assertWidgetPostImageUrl(
  imageUrl: string,
  workspaceSlug: string,
) {
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new HTTPException(400, { message: "Invalid image URL" });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new HTTPException(400, { message: "Invalid image URL" });
  }

  const publicBase = String(process.env.R2_PUBLIC_BASE_URL || "").replace(
    /\/$/,
    "",
  );
  if (!publicBase) {
    throw new HTTPException(500, {
      message: "Image storage is not configured",
    });
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

export async function resolveWidget(
  ctx: WidgetRouterContext,
  projectId: string,
  parentOrigin?: string,
): Promise<ResolvedWidget> {
  const [ws] = await ctx.db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      primaryColor: workspace.primaryColor,
      hideBranding: workspace.hideBranding,
      widgetSecret: workspace.widgetSecret,
      domain: workspace.domain,
      customDomain: workspace.customDomain,
    })
    .from(workspace)
    .where(eq(workspace.id, projectId))
    .limit(1);

  if (!ws)
    throw new HTTPException(404, { message: "Widget project not found" });

  const domains = await ctx.db
    .select({ host: workspaceDomain.host, status: workspaceDomain.status })
    .from(workspaceDomain)
    .where(eq(workspaceDomain.workspaceId, ws.id));
  const allowedOrigins = buildWidgetOriginAllowlist({
    slug: ws.slug,
    workspaceDomain: ws.domain,
    customDomain: ws.customDomain,
    verifiedHosts: domains
      .filter(
        (row: { host: string; status: string }) => row.status === "verified",
      )
      .map((row: { host: string; status: string }) => row.host),
    appOrigin:
      process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || null,
    includeDevOrigins:
      process.env.NODE_ENV !== "production" ||
      process.env.WIDGET_ALLOW_LOCALHOST === "true",
  });
  if (parentOrigin && !allowedOrigins.includes(parentOrigin)) {
    throw new HTTPException(403, { message: "Widget origin is not allowed" });
  }

  return {
    workspaceId: ws.id,
    workspaceName: ws.name,
    workspaceSlug: ws.slug,
    workspaceLogo: ws.logo,
    primaryColor: ws.primaryColor,
    hideBranding: ws.hideBranding,
    widgetSecret: ws.widgetSecret,
    customDomain: ws.customDomain,
    allowedOrigins,
    config: defaultConfig(ws.id),
  };
}

export function createPostSlug(title: string): string {
  const base = toSlug(title)
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `post-${suffix}`;
}

/**
 * Only HMAC-signed identify payloads are trusted.
 */
export function isVerifiedIdentity(
  identity: WidgetIdentity | undefined,
  secret: string | null | undefined,
  workspaceId: string,
) {
  return verifySignedIdentity(identity, secret, workspaceId);
}

export async function upsertIdentifiedUser(
  ctx: WidgetRouterContext,
  workspaceId: string,
  identity: WidgetIdentity,
) {
  const now = new Date();
  const values = {
    id: `fw${createId()}`,
    workspaceId,
    externalId: identity.id.trim(),
    email: identity.email.toLowerCase(),
    name: identity.name || identity.email,
    image: identity.avatar || null,
    createdAt: now,
    updatedAt: now,
  };

  const [row] = await ctx.db
    .insert(widgetUser)
    .values(values)
    .onConflictDoUpdate({
      target: [widgetUser.workspaceId, widgetUser.externalId],
      set: {
        email: values.email,
        name: values.name,
        image: values.image,
        updatedAt: now,
      },
    })
    .returning();

  return row;
}

export async function resolveViewerId(
  ctx: WidgetRouterContext,
  input: {
    identity?: WidgetIdentity;
  },
  workspaceId: string,
  widgetSecret?: string | null,
): Promise<string | null> {
  if (
    !isVerifiedIdentity(input.identity, widgetSecret, workspaceId) ||
    !input.identity
  )
    return null;
  const row = await upsertIdentifiedUser(ctx, workspaceId, input.identity);
  return row?.id ?? null;
}

export async function resolveAuthorId(
  ctx: WidgetRouterContext,
  input: {
    identity?: WidgetIdentity;
  },
  workspaceId: string,
  widgetSecret?: string | null,
): Promise<string | null> {
  return resolveViewerId(ctx, input, workspaceId, widgetSecret);
}

export async function loadVotedPostIds(
  ctx: WidgetRouterContext,
  postIds: string[],
  viewer: { widgetUserId: string | null; fingerprint: string | null },
): Promise<Set<string>> {
  if (!postIds.length || (!viewer.widgetUserId && !viewer.fingerprint))
    return new Set();

  const voteFilter = viewer.widgetUserId
    ? and(
        inArray(vote.postId, postIds),
        eq(vote.widgetUserId, viewer.widgetUserId),
      )
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

export const widgetPostAuthorName = sql<string | null>`coalesce(
  (SELECT ${widgetUser.name} FROM ${widgetUser} WHERE ${widgetUser.id} = ${post.widgetUserId}),
  (SELECT ${user.name} FROM ${user} WHERE ${user.id} = ${post.authorId})
)`;

export const widgetPostAuthorImage = sql<string | null>`coalesce(
  (SELECT ${widgetUser.image} FROM ${widgetUser} WHERE ${widgetUser.id} = ${post.widgetUserId}),
  (SELECT ${user.image} FROM ${user} WHERE ${user.id} = ${post.authorId})
)`;

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
  authorName: widgetPostAuthorName,
  authorImage: widgetPostAuthorImage,
  metadata: post.metadata,
};

export function widgetPostQuery(db: WidgetRouterContext["db"]) {
  return db
    .select(postSelectFields)
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id));
}

export function dicebearAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
    (seed || "anonymous").trim() || "anonymous",
  )}`;
}

export function fingerprintFromMetadata(metadata: unknown): string | null {
  if (!isRecord(metadata) || typeof metadata.fingerprint !== "string")
    return null;
  const fingerprint = metadata.fingerprint.trim();
  return fingerprint || null;
}

export function avatarFromFingerprint(
  fingerprint?: string | null,
  fallback = "anonymous",
) {
  if (fingerprint) {
    const seed = createHash("sha256").update(fingerprint).digest("hex");
    return dicebearAvatar(seed);
  }
  return dicebearAvatar(fallback);
}

export function resolveWidgetAuthorImage(row: {
  id: string;
  slug: string;
  isAnonymous: boolean | null;
  authorImage: string | null;
  authorName?: string | null;
  metadata?: unknown;
}) {
  if (!row.isAnonymous && row.authorImage) return row.authorImage;
  const fingerprint = fingerprintFromMetadata(row.metadata);
  if (row.isAnonymous) {
    return avatarFromFingerprint(
      fingerprint,
      row.id || row.slug || "anonymous",
    );
  }
  return (
    row.authorImage || dicebearAvatar(row.authorName || row.id || "anonymous")
  );
}

export function resolveWidgetCommentAuthorImage(row: {
  id: string;
  isAnonymous: boolean | null;
  authorImage: string | null;
  authorName?: string | null;
  metadata?: unknown;
}) {
  if (!row.isAnonymous && row.authorImage) return row.authorImage;
  const fingerprint = fingerprintFromMetadata(row.metadata);
  if (row.isAnonymous) {
    return avatarFromFingerprint(fingerprint, row.id || "anonymous");
  }
  return (
    row.authorImage || dicebearAvatar(row.authorName || row.id || "anonymous")
  );
}

export function mapWidgetPostRow<
  T extends {
    id: string;
    slug: string;
    isAnonymous: boolean | null;
    authorName: string | null;
    authorImage: string | null;
    metadata?: unknown;
  },
>(row: T, hasVoted: boolean) {
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
    return trimmed
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
