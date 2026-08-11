import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { createId } from "@paralleldrive/cuid2";
import { j, publicProcedure } from "../jstack";
import {
  board,
  changelogEntry,
  post,
  user,
  vote,
  workspace,
} from "@featul/db";
import { getRequestFingerprint } from "../shared/request-fingerprint";
import { toSlug } from "../shared/slug";

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

      const request = (c as any)?.req?.raw || (c as any)?.request;
      const fingerprint = authorId ? null : getRequestFingerprint(request, input.fingerprint);
      const [created] = await ctx.db
        .insert(post)
        .values({
          boardId: targetBoard.id,
          title: input.title,
          content: input.content,
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

      const rows = await ctx.db
        .select({
          id: changelogEntry.id,
          title: changelogEntry.title,
          slug: changelogEntry.slug,
          summary: changelogEntry.summary,
          publishedAt: changelogEntry.publishedAt,
        })
        .from(changelogEntry)
        .innerJoin(board, eq(changelogEntry.boardId, board.id))
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

      return c.superjson({ entries: rows });
    }),
  });
}
