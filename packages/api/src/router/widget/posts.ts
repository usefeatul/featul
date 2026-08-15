import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { board, post, user, vote } from "@featul/db";
import { publicProcedure } from "../../jstack";
import { getRequestFingerprint } from "../../shared/request-fingerprint";
import {
  assertWidgetPostImageUrl,
  createPostSlug,
  loadVotedPostIds,
  mapWidgetPostRow,
  postSelectFields,
  publicPostWhere,
  resolveAuthorId,
  resolveViewerId,
  resolveWidget,
  resolveWidgetAuthorImage,
  getWidgetRequest,
} from "./resolve";
import { createSchema, postDetailSchema, postsSchema, similarSchema } from "./schema";

export const widgetPosts = publicProcedure.input(postsSchema).get(async ({ ctx, input, c }) => {
  const resolved = await resolveWidget(ctx, input.projectId);
  const request = getWidgetRequest(c);
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
    .where(
      publicPostWhere(
        resolved.workspaceId,
        input.boardId,
        input.search,
        input.status,
      ),
    )
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
});

export const widgetPost = publicProcedure.input(postDetailSchema).get(async ({ ctx, input, c }) => {
  const resolved = await resolveWidget(ctx, input.projectId);
  const request = getWidgetRequest(c);
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
});

export const widgetSimilar = publicProcedure.input(similarSchema).get(async ({ ctx, input, c }) => {
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
});

export const widgetCreate = publicProcedure.input(createSchema).post(async ({ ctx, input, c }) => {
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

  const authorId = await resolveAuthorId(ctx, input);

  if (!authorId && (!resolved.config.allowGuestPosting || !targetBoard.allowAnonymous)) {
    throw new HTTPException(401, { message: "Please identify before submitting feedback" });
  }

  if (input.image) {
    assertWidgetPostImageUrl(input.image, resolved.workspaceSlug);
  }

  const request = getWidgetRequest(c);
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

  return c.superjson({
    post: {
      ...created,
      upvotes: 1,
      authorImage: resolveWidgetAuthorImage({
        id: created.id,
        slug: created.slug,
        isAnonymous: created.isAnonymous,
        authorImage: null,
        metadata: created.metadata,
      }),
    },
  });
});
