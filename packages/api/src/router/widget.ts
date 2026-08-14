import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { createId } from "@paralleldrive/cuid2";
import { j, publicProcedure } from "../jstack";
import {
  board,
  changelogEntry,
  comment,
  commentReaction,
  post,
  user,
  vote,
  workspace,
  workspaceMember,
} from "@featul/db";
import { getRequestFingerprint } from "../shared/request-fingerprint";
import { toSlug } from "../shared/slug";
import { createStorageContext, buildSignedUpload } from "../services/storage-signer";
import { POST_IMAGE_UPLOAD_POLICY, validateUploadInput } from "../shared/storage-upload";
import {
  applyRateLimitHeaders,
  limitStoragePublicPostAnon,
  limitStoragePublicPostUser,
} from "../services/ratelimiter";

const parentOriginSchema = z.string().url().optional();
const projectInput = z.object({
  projectId: z.string().min(1),
  parentOrigin: parentOriginSchema,
});

const identifySchema = projectInput.extend({
  user: z.object({
    id: z.string().min(1).max(256),
    email: z.string().email(),
    name: z.string().max(160).optional(),
    avatar: z.string().url().optional(),
    signature: z.string().optional(),
  }),
});

const widgetIdentitySchema = z.object({
  id: z.string().min(1).max(256),
  email: z.string().email(),
  name: z.string().max(160).optional(),
  avatar: z.string().url().optional(),
  signature: z.string().optional(),
});

const createSchema = projectInput.extend({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(5000),
  boardId: z.string().min(1),
  image: z.string().url().optional(),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

const uploadImageSchema = projectInput.extend({
  boardId: z.string().min(1),
  fileName: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[^/\\]+$/, "Invalid file name"),
  contentType: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i, "Invalid content type"),
  fileSize: z.number().int().positive().max(POST_IMAGE_UPLOAD_POLICY.maxBytes),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

const voteSchema = projectInput.extend({
  postId: z.string().min(1),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

const similarSchema = projectInput.extend({
  title: z.string().min(2).max(128),
  boardId: z.string().min(1).optional(),
});

const viewerSchema = z.object({
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

const postsSchema = projectInput.merge(viewerSchema).extend({
  boardId: z.string().min(1).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "top"]).default("newest"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const postDetailSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
}).refine((value) => Boolean(value.postId || value.slug), {
  message: "postId or slug is required",
});

const commentsSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1),
});

const createCommentSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1),
  content: z.string().trim().min(1).max(5000),
  parentId: z.string().min(1).optional(),
});

const voteCommentSchema = projectInput.merge(viewerSchema).extend({
  commentId: z.string().min(1),
});

type ResolvedWidget = {
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

function assertWidgetPostImageUrl(imageUrl: string, workspaceSlug: string) {
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

async function resolveWidget(ctx: any, projectId: string): Promise<ResolvedWidget> {
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

function createPostSlug(title: string): string {
  const base = toSlug(title).replace(/[^a-z0-9-]+/g, "").replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `post-${suffix}`;
}

async function upsertIdentifiedUser(
  ctx: any,
  identity: z.infer<typeof widgetIdentitySchema>,
) {
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

async function resolveViewerId(
  ctx: any,
  input: {
    userId?: string;
    identity?: z.infer<typeof widgetIdentitySchema>;
  },
): Promise<string | null> {
  if (input.identity?.email) {
    const [existing] = await ctx.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.identity.email.toLowerCase()))
      .limit(1);
    if (existing) return existing.id;
  }
  if (input.userId) {
    const [existing] = await ctx.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);
    if (existing) return existing.id;
  }
  return null;
}

async function loadVotedPostIds(
  ctx: any,
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

  return new Set(rows.map((row: { postId: string }) => row.postId));
}

function publicPostWhere(workspaceId: string, boardId?: string, search?: string) {
  const filters = [
    eq(board.workspaceId, workspaceId),
    eq(board.isSystem, false),
    eq(board.isPublic, true),
  ];
  if (boardId) filters.push(eq(board.id, boardId));
  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    filters.push(or(ilike(post.title, q), ilike(post.content, q))!);
  }
  return and(...filters);
}

const postSelectFields = {
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

function dicebearAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed || "guest")}`;
}

function resolveWidgetAuthorImage(row: {
  id: string;
  slug: string;
  isAnonymous: boolean | null;
  authorImage: string | null;
  metadata?: unknown;
}) {
  if (!row.isAnonymous && row.authorImage) return row.authorImage;
  const fingerprint =
    row.metadata && typeof row.metadata === "object" && row.metadata !== null
      ? String((row.metadata as Record<string, unknown>).fingerprint || "")
      : "";
  return dicebearAvatar(fingerprint || row.id || row.slug || "guest");
}

function mapWidgetPostRow<T extends {
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

export function createWidgetRouter() {
  return j.router({
    config: publicProcedure.input(projectInput).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const boards = await ctx.db
        .select({
          id: board.id,
          name: board.name,
          slug: board.slug,
          allowAnonymous: board.allowAnonymous,
          allowComments: board.allowComments,
        })
        .from(board)
        .where(and(eq(board.workspaceId, resolved.workspaceId), eq(board.isSystem, false), eq(board.isPublic, true)))
        .orderBy(asc(board.sortOrder), asc(board.createdAt));

      c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
      return c.superjson({
        workspace: {
          id: resolved.workspaceId,
          name: resolved.workspaceName,
          slug: resolved.workspaceSlug,
          logo: resolved.workspaceLogo,
          primaryColor: resolved.primaryColor,
          hideBranding: resolved.hideBranding,
        },
        config: {
          projectId: resolved.config.projectId,
          theme: resolved.config.theme,
          position: resolved.config.position,
          enabledTabs: resolved.config.enabledTabs,
          defaultBoardId: resolved.config.defaultBoardId,
          allowGuestPosting: resolved.config.allowGuestPosting,
        },
        boards,
      });
    }),

    identify: publicProcedure.input(identifySchema).post(async ({ ctx, input, c }) => {
      await resolveWidget(ctx, input.projectId);

      const row = await upsertIdentifiedUser(ctx, input.user);

      return c.superjson({ user: row });
    }),

    posts: publicProcedure.input(postsSchema).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;
      const viewerId = await resolveViewerId(ctx, input);
      const fingerprint = viewerId
        ? null
        : getRequestFingerprint(request, input.fingerprint);

      const orderBy =
        input.sort === "top"
          ? [desc(post.upvotes), desc(post.createdAt)]
          : [desc(post.isPinned), desc(post.createdAt)];

      const rows = await ctx.db
        .select(postSelectFields)
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .leftJoin(user, eq(post.authorId, user.id))
        .where(publicPostWhere(resolved.workspaceId, input.boardId, input.search))
        .orderBy(...orderBy)
        .limit(input.limit)
        .offset(input.offset);

      const votedIds = await loadVotedPostIds(
        ctx,
        rows.map((row: { id: string }) => row.id),
        { userId: viewerId, fingerprint },
      );

      return c.superjson({
        posts: rows.map((row: (typeof rows)[number]) =>
          mapWidgetPostRow(row, votedIds.has(row.id)),
        ),
        nextOffset: rows.length === input.limit ? input.offset + rows.length : null,
      });
    }),

    post: publicProcedure.input(postDetailSchema).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;
      const viewerId = await resolveViewerId(ctx, input);
      const fingerprint = viewerId
        ? null
        : getRequestFingerprint(request, input.fingerprint);

      const identityFilter = input.postId
        ? eq(post.id, input.postId)
        : eq(post.slug, input.slug!);

      const [row] = await ctx.db
        .select(postSelectFields)
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .leftJoin(user, eq(post.authorId, user.id))
        .where(and(publicPostWhere(resolved.workspaceId), identityFilter))
        .limit(1);

      if (!row) throw new HTTPException(404, { message: "Post not found" });

      const votedIds = await loadVotedPostIds(ctx, [row.id], {
        userId: viewerId,
        fingerprint,
      });

      return c.superjson({
        post: mapWidgetPostRow(row, votedIds.has(row.id)),
      });
    }),

    similar: publicProcedure.input(similarSchema).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const q = `%${input.title.trim()}%`;
      const rows = await ctx.db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          upvotes: post.upvotes,
          boardId: post.boardId,
        })
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .where(
          and(
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isSystem, false),
            eq(board.isPublic, true),
            input.boardId ? eq(board.id, input.boardId) : sql`true`,
            or(ilike(post.title, q), ilike(post.content, q)),
          ),
        )
        .orderBy(desc(post.upvotes), desc(post.createdAt))
        .limit(5);

      return c.superjson({ posts: rows });
    }),

    uploadImage: publicProcedure.input(uploadImageSchema).post(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const [targetBoard] = await ctx.db
        .select({
          id: board.id,
          allowAnonymous: board.allowAnonymous,
        })
        .from(board)
        .where(
          and(
            eq(board.id, input.boardId),
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isSystem, false),
            eq(board.isPublic, true),
          ),
        )
        .limit(1);

      if (!targetBoard) throw new HTTPException(404, { message: "Board not found" });

      let uploaderId: string | null = null;
      if (input.identity) {
        const identifiedUser = await upsertIdentifiedUser(ctx, input.identity);
        uploaderId = identifiedUser.id;
      } else if (input.userId) {
        const [identifiedUser] = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1);
        if (!identifiedUser) throw new HTTPException(401, { message: "User not found" });
        uploaderId = identifiedUser.id;
      }

      if (!uploaderId && (!resolved.config.allowGuestPosting || !targetBoard.allowAnonymous)) {
        throw new HTTPException(401, { message: "Please identify before uploading an image" });
      }

      const request = (c as any)?.req?.raw || (c as any)?.request;
      const rateLimit = uploaderId
        ? await limitStoragePublicPostUser(uploaderId)
        : await limitStoragePublicPostAnon(request);
      applyRateLimitHeaders(c, rateLimit, "Too many upload URL requests. Please try again shortly.");

      const { safeFileName, normalizedContentType } = validateUploadInput({
        fileName: input.fileName,
        contentType: input.contentType,
        fileSize: input.fileSize,
        policy: POST_IMAGE_UPLOAD_POLICY,
      });

      const { s3, bucket, publicBase } = createStorageContext();
      const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;
      const key = `workspaces/${resolved.workspaceSlug}/posts/${id}-${safeFileName}`;

      const payload = await buildSignedUpload({
        s3,
        bucket,
        publicBase,
        key,
        contentType: normalizedContentType,
        contentLength: input.fileSize,
      });

      return c.json(payload);
    }),

    create: publicProcedure.input(createSchema).post(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const [targetBoard] = await ctx.db
        .select({ id: board.id, slug: board.slug, allowAnonymous: board.allowAnonymous })
        .from(board)
        .where(
          and(
            eq(board.id, input.boardId),
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isSystem, false),
            eq(board.isPublic, true),
          ),
        )
        .limit(1);

      if (!targetBoard) throw new HTTPException(404, { message: "Board not found" });

      let authorId: string | null = null;
      if (input.identity) {
        const identifiedUser = await upsertIdentifiedUser(ctx, input.identity);
        authorId = identifiedUser.id;
      } else if (input.userId) {
        const [identifiedUser] = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1);
        if (!identifiedUser) throw new HTTPException(401, { message: "User not found" });
        authorId = identifiedUser.id;
      }

      if (!authorId && (!resolved.config.allowGuestPosting || !targetBoard.allowAnonymous)) {
        throw new HTTPException(401, { message: "Please identify before submitting feedback" });
      }

      if (input.image) {
        assertWidgetPostImageUrl(input.image, resolved.workspaceSlug);
      }

      const request = (c as any)?.req?.raw || (c as any)?.request;
      const fingerprint = authorId ? null : getRequestFingerprint(request, input.fingerprint);
      const [created] = await ctx.db
        .insert(post)
        .values({
          boardId: targetBoard.id,
          title: input.title,
          content: input.content,
          image: input.image || null,
          slug: createPostSlug(input.title),
          authorId,
          isAnonymous: !authorId,
          metadata: authorId ? { widget: true } : { fingerprint, widget: true },
          roadmapStatus: "pending",
        })
        .returning();

      await ctx.db.insert(vote).values({
        postId: created.id,
        userId: authorId,
        fingerprint,
        type: "upvote",
      });
      await ctx.db.update(post).set({ upvotes: 1 }).where(eq(post.id, created.id));

      return c.superjson({ post: { ...created, upvotes: 1 } });
    }),

    vote: publicProcedure.input(voteSchema).post(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const [targetPost] = await ctx.db
        .select({ id: post.id })
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .where(and(eq(post.id, input.postId), eq(board.workspaceId, resolved.workspaceId), eq(board.isPublic, true)))
        .limit(1);
      if (!targetPost) throw new HTTPException(404, { message: "Post not found" });

      let voterId: string | null = null;
      if (input.identity) {
        const identifiedUser = await upsertIdentifiedUser(ctx, input.identity);
        voterId = identifiedUser.id;
      } else if (input.userId) {
        voterId = input.userId;
      }

      const request = (c as any)?.req?.raw || (c as any)?.request;
      const fingerprint = voterId ? null : getRequestFingerprint(request, input.fingerprint);
      const anonymousFingerprint = fingerprint || "";
      const existingWhere = voterId
        ? and(eq(vote.postId, input.postId), eq(vote.userId, voterId))
        : and(eq(vote.postId, input.postId), isNull(vote.userId), eq(vote.fingerprint, anonymousFingerprint));

      const [existing] = await ctx.db.select({ id: vote.id }).from(vote).where(existingWhere).limit(1);
      if (existing) {
        await ctx.db.delete(vote).where(eq(vote.id, existing.id));
        const [updated] = await ctx.db
          .update(post)
          .set({ upvotes: sql`greatest(0, ${post.upvotes} - 1)` })
          .where(eq(post.id, input.postId))
          .returning({ upvotes: post.upvotes });
        return c.superjson({ hasVoted: false, upvotes: updated?.upvotes || 0 });
      }

      await ctx.db.insert(vote).values({
        postId: input.postId,
        userId: voterId,
        fingerprint,
        type: "upvote",
      });
      const [updated] = await ctx.db
        .update(post)
        .set({ upvotes: sql`${post.upvotes} + 1` })
        .where(eq(post.id, input.postId))
        .returning({ upvotes: post.upvotes });
      return c.superjson({ hasVoted: true, upvotes: updated?.upvotes || 0 });
    }),

    comments: publicProcedure.input(commentsSchema).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;
      const viewerId = await resolveViewerId(ctx, input);
      const fingerprint = viewerId
        ? null
        : getRequestFingerprint(request, input.fingerprint);

      const [targetPost] = await ctx.db
        .select({
          id: post.id,
          allowComments: board.allowComments,
        })
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .where(
          and(
            eq(post.id, input.postId),
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isPublic, true),
          ),
        )
        .limit(1);

      if (!targetPost) throw new HTTPException(404, { message: "Post not found" });

      const rows = await ctx.db
        .select({
          id: comment.id,
          postId: comment.postId,
          parentId: comment.parentId,
          content: comment.content,
          authorName: comment.authorName,
          authorImage: user.image,
          isAnonymous: comment.isAnonymous,
          upvotes: comment.upvotes,
          replyCount: comment.replyCount,
          depth: comment.depth,
          createdAt: comment.createdAt,
        })
        .from(comment)
        .leftJoin(user, eq(comment.authorId, user.id))
        .where(
          and(
            eq(comment.postId, input.postId),
            eq(comment.status, "published"),
            eq(comment.isInternal, false),
          ),
        )
        .orderBy(asc(comment.createdAt));

      const commentIds = rows.map((row: { id: string }) => row.id);
      const votedIds = new Set<string>();
      if (commentIds.length && (viewerId || fingerprint)) {
        const reactionFilter = viewerId
          ? and(inArray(commentReaction.commentId, commentIds), eq(commentReaction.userId, viewerId), eq(commentReaction.type, "upvote"))
          : and(
              inArray(commentReaction.commentId, commentIds),
              isNull(commentReaction.userId),
              eq(commentReaction.fingerprint, fingerprint || ""),
              eq(commentReaction.type, "upvote"),
            );
        const reactions = await ctx.db
          .select({ commentId: commentReaction.commentId })
          .from(commentReaction)
          .where(reactionFilter);
        for (const row of reactions) votedIds.add(row.commentId);
      }

      return c.superjson({
        allowComments: Boolean(targetPost.allowComments),
        comments: rows.map((row: (typeof rows)[number]) => ({
          id: row.id,
          postId: row.postId,
          parentId: row.parentId,
          content: row.content,
          authorName: row.isAnonymous ? "Guest" : row.authorName || "Guest",
          authorImage: row.isAnonymous
            ? dicebearAvatar(row.id)
            : row.authorImage || dicebearAvatar(row.authorName || row.id),
          isAnonymous: Boolean(row.isAnonymous),
          upvotes: row.upvotes || 0,
          replyCount: row.replyCount || 0,
          depth: row.depth || 0,
          createdAt: row.createdAt,
          hasVoted: votedIds.has(row.id),
        })),
      });
    }),

    createComment: publicProcedure.input(createCommentSchema).post(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;

      const [targetPost] = await ctx.db
        .select({
          id: post.id,
          isLocked: post.isLocked,
          allowComments: board.allowComments,
          allowAnonymous: board.allowAnonymous,
        })
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .where(
          and(
            eq(post.id, input.postId),
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isPublic, true),
          ),
        )
        .limit(1);

      if (!targetPost) throw new HTTPException(404, { message: "Post not found" });
      if (!targetPost.allowComments) {
        throw new HTTPException(403, { message: "Comments are disabled on this board" });
      }
      if (targetPost.isLocked) {
        throw new HTTPException(403, { message: "This post is locked" });
      }

      let authorId: string | null = null;
      let authorName = "Guest";
      let authorImage: string | null = null;
      if (input.identity) {
        const identifiedUser = await upsertIdentifiedUser(ctx, input.identity);
        authorId = identifiedUser.id;
        authorName = identifiedUser.name || input.identity.name || input.identity.email;
        authorImage = identifiedUser.image || input.identity.avatar || null;
      } else if (input.userId) {
        const [existing] = await ctx.db
          .select({ id: user.id, name: user.name, image: user.image })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1);
        if (existing) {
          authorId = existing.id;
          authorName = existing.name || "User";
          authorImage = existing.image;
        }
      }

      if (!authorId && (!resolved.config.allowGuestPosting || !targetPost.allowAnonymous)) {
        throw new HTTPException(401, { message: "Sign in to comment" });
      }

      const fingerprint = authorId ? null : getRequestFingerprint(request, input.fingerprint);
      if (!authorId && !fingerprint) {
        throw new HTTPException(400, { message: "Missing visitor fingerprint" });
      }

      let depth = 0;
      if (input.parentId) {
        const [parentComment] = await ctx.db
          .select({
            id: comment.id,
            depth: comment.depth,
            postId: comment.postId,
            isInternal: comment.isInternal,
          })
          .from(comment)
          .where(eq(comment.id, input.parentId))
          .limit(1);

        if (!parentComment || parentComment.postId !== input.postId) {
          throw new HTTPException(404, { message: "Parent comment not found" });
        }
        if (parentComment.isInternal) {
          throw new HTTPException(403, { message: "Cannot reply to this comment" });
        }
        depth = (parentComment.depth || 0) + 1;
        if (depth > 2) {
          throw new HTTPException(400, { message: "Reply nesting limit reached" });
        }
        await ctx.db
          .update(comment)
          .set({ replyCount: sql`${comment.replyCount} + 1` })
          .where(eq(comment.id, input.parentId));
      }

      const [created] = await ctx.db
        .insert(comment)
        .values({
          postId: input.postId,
          parentId: input.parentId || null,
          content: input.content,
          authorId,
          authorName: authorId ? authorName : "Guest",
          depth,
          status: "published",
          isInternal: false,
          isAnonymous: !authorId,
          metadata: fingerprint ? { fingerprint } : null,
          upvotes: 1,
        })
        .returning();

      await ctx.db.insert(commentReaction).values({
        commentId: created.id,
        userId: authorId,
        fingerprint: authorId ? null : fingerprint,
        type: "upvote",
      });

      const [updatedPost] = await ctx.db
        .update(post)
        .set({ commentCount: sql`${post.commentCount} + 1` })
        .where(eq(post.id, input.postId))
        .returning({ commentCount: post.commentCount });

      return c.superjson({
        comment: {
          id: created.id,
          postId: created.postId,
          parentId: created.parentId,
          content: created.content,
          authorName: created.isAnonymous ? "Guest" : created.authorName || "Guest",
          authorImage: created.isAnonymous
            ? dicebearAvatar(created.id)
            : authorImage || dicebearAvatar(created.authorName || created.id),
          isAnonymous: Boolean(created.isAnonymous),
          upvotes: 1,
          replyCount: 0,
          depth: created.depth || 0,
          createdAt: created.createdAt,
          hasVoted: true,
        },
        commentCount: updatedPost?.commentCount || 0,
      });
    }),

    voteComment: publicProcedure.input(voteCommentSchema).post(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;

      const [target] = await ctx.db
        .select({
          id: comment.id,
          upvotes: comment.upvotes,
        })
        .from(comment)
        .innerJoin(post, eq(comment.postId, post.id))
        .innerJoin(board, eq(post.boardId, board.id))
        .where(
          and(
            eq(comment.id, input.commentId),
            eq(comment.status, "published"),
            eq(comment.isInternal, false),
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isPublic, true),
          ),
        )
        .limit(1);

      if (!target) throw new HTTPException(404, { message: "Comment not found" });

      let voterId: string | null = null;
      if (input.identity) {
        const identifiedUser = await upsertIdentifiedUser(ctx, input.identity);
        voterId = identifiedUser.id;
      } else if (input.userId) {
        voterId = input.userId;
      }

      const fingerprint = voterId ? null : getRequestFingerprint(request, input.fingerprint);
      const anonymousFingerprint = fingerprint || "";
      const existingWhere = voterId
        ? and(
            eq(commentReaction.commentId, input.commentId),
            eq(commentReaction.userId, voterId),
            eq(commentReaction.type, "upvote"),
          )
        : and(
            eq(commentReaction.commentId, input.commentId),
            isNull(commentReaction.userId),
            eq(commentReaction.fingerprint, anonymousFingerprint),
            eq(commentReaction.type, "upvote"),
          );

      const [existing] = await ctx.db
        .select({ id: commentReaction.id })
        .from(commentReaction)
        .where(existingWhere)
        .limit(1);

      if (existing) {
        await ctx.db.delete(commentReaction).where(eq(commentReaction.id, existing.id));
        const [updated] = await ctx.db
          .update(comment)
          .set({ upvotes: sql`greatest(0, ${comment.upvotes} - 1)` })
          .where(eq(comment.id, input.commentId))
          .returning({ upvotes: comment.upvotes });
        return c.superjson({ hasVoted: false, upvotes: updated?.upvotes || 0 });
      }

      await ctx.db.insert(commentReaction).values({
        commentId: input.commentId,
        userId: voterId,
        fingerprint,
        type: "upvote",
      });
      const [updated] = await ctx.db
        .update(comment)
        .set({ upvotes: sql`${comment.upvotes} + 1` })
        .where(eq(comment.id, input.commentId))
        .returning({ upvotes: comment.upvotes });
      return c.superjson({ hasVoted: true, upvotes: updated?.upvotes || 0 });
    }),

    roadmap: publicProcedure.input(projectInput.merge(viewerSchema)).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);
      const request = (c as any)?.req?.raw || (c as any)?.request;
      const viewerId = await resolveViewerId(ctx, input);
      const fingerprint = viewerId
        ? null
        : getRequestFingerprint(request, input.fingerprint);

      const rows = await ctx.db
        .select({
          id: post.id,
          title: post.title,
          content: post.content,
          slug: post.slug,
          upvotes: post.upvotes,
          roadmapStatus: post.roadmapStatus,
          createdAt: post.createdAt,
          isAnonymous: post.isAnonymous,
          authorName: user.name,
          authorImage: user.image,
          metadata: post.metadata,
        })
        .from(post)
        .innerJoin(board, eq(post.boardId, board.id))
        .leftJoin(user, eq(post.authorId, user.id))
        .where(
          and(
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.isSystem, false),
            eq(board.isPublic, true),
            inArray(post.roadmapStatus, ["planned", "progress", "completed"]),
          ),
        )
        .orderBy(desc(post.updatedAt))
        .limit(30);

      const votedIds = await loadVotedPostIds(
        ctx,
        rows.map((row: { id: string }) => row.id),
        { userId: viewerId, fingerprint },
      );

      return c.superjson({
        posts: rows.map((row: (typeof rows)[number]) => {
          const mapped = mapWidgetPostRow(row, votedIds.has(row.id));
          return {
            id: mapped.id,
            title: mapped.title,
            content: mapped.content,
            slug: mapped.slug,
            upvotes: mapped.upvotes,
            roadmapStatus: mapped.roadmapStatus,
            createdAt: mapped.createdAt,
            authorName: mapped.authorName,
            authorImage: mapped.authorImage,
            isAnonymous: mapped.isAnonymous,
            hasVoted: mapped.hasVoted,
          };
        }),
      });
    }),

    changelog: publicProcedure.input(projectInput).get(async ({ ctx, input, c }) => {
      const resolved = await resolveWidget(ctx, input.projectId);

      const [wsOwner] = await ctx.db
        .select({ ownerId: workspace.ownerId })
        .from(workspace)
        .where(eq(workspace.id, resolved.workspaceId))
        .limit(1);

      const rows = await ctx.db
        .select({
          id: changelogEntry.id,
          title: changelogEntry.title,
          slug: changelogEntry.slug,
          summary: changelogEntry.summary,
          content: changelogEntry.content,
          publishedAt: changelogEntry.publishedAt,
          authorId: changelogEntry.authorId,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(changelogEntry)
        .innerJoin(board, eq(changelogEntry.boardId, board.id))
        .leftJoin(user, eq(changelogEntry.authorId, user.id))
        .where(
          and(
            eq(board.workspaceId, resolved.workspaceId),
            eq(board.systemType, "changelog"),
            eq(board.isPublic, true),
            eq(board.isVisible, true),
            eq(changelogEntry.status, "published"),
          ),
        )
        .orderBy(desc(changelogEntry.publishedAt))
        .limit(20);

      const authorIds: string[] = Array.from(
        new Set(
          rows
            .map((row: (typeof rows)[number]) => row.authorId)
            .filter((id: string | null | undefined): id is string => Boolean(id)),
        ),
      );

      const members =
        authorIds.length > 0
          ? await ctx.db
              .select({
                userId: workspaceMember.userId,
                role: workspaceMember.role,
              })
              .from(workspaceMember)
              .where(
                and(
                  eq(workspaceMember.workspaceId, resolved.workspaceId),
                  inArray(workspaceMember.userId, authorIds),
                ),
              )
          : [];

      const memberRoleMap = new Map(
        members.map((member: { userId: string; role: string | null }) => [
          member.userId,
          member.role,
        ]),
      );

      return c.superjson({
        entries: rows.map((row: (typeof rows)[number]) => {
          const fromContent = extractTiptapPlainText(row.content);
          const summary = typeof row.summary === "string" ? row.summary.trim() : "";
          const preview = (summary || fromContent).trim();
          const isOwner = Boolean(
            row.authorId && wsOwner?.ownerId && String(wsOwner.ownerId) === String(row.authorId),
          );
          const rawRole = row.authorId ? memberRoleMap.get(row.authorId) : null;
          const role = typeof rawRole === "string" ? rawRole : null;
          const authorRoleLabel = resolveAuthorRoleLabel(isOwner, role);

          return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            summary: summary || null,
            content: row.content,
            preview: preview || null,
            publishedAt: row.publishedAt,
            authorName: row.authorName || null,
            authorImage: row.authorImage || null,
            authorRole: role,
            authorIsOwner: isOwner,
            authorRoleLabel,
            author: {
              name: row.authorName || null,
              image: row.authorImage || null,
              role,
              isOwner,
              roleLabel: authorRoleLabel,
            },
          };
        }),
      });
    }),
  });
}

function resolveAuthorRoleLabel(
  isOwner: boolean,
  role?: string | null,
): "Founder" | "Admin" | "Member" | "Viewer" | null {
  if (isOwner) return "Founder";
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  if (role === "viewer") return "Viewer";
  return null;
}

function extractTiptapPlainText(content: unknown): string {
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
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.text === "string" && record.text.trim()) {
      parts.push(record.text);
    }
    if (Array.isArray(record.content)) {
      for (const child of record.content) visit(child);
    }
  };

  if (Array.isArray(content)) {
    for (const node of content) visit(node);
  } else {
    visit(content);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
