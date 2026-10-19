import { and, eq, inArray, isNull, sql, type AnyColumn } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { helpArticle, helpCenter, helpCollection } from "@featul/db";
import { j, publicProcedure, privateProcedure } from "../jstack";
import {
  requireActiveWorkspaceMemberBySlug,
  requireBoardManagerBySlug,
} from "../shared/access";
import { toUrlSlug } from "../shared/slug";
import { bySlugSchema } from "../validators/changelog";
import {
  helpArticleCreateSchema,
  helpArticleIdSchema,
  helpArticleUpdateSchema,
  helpArticlesDeleteSchema,
  helpCollectionIdSchema,
  helpVisibilitySchema,
  helpCollectionCreateSchema,
  helpCollectionUpdateSchema,
  helpFeedbackSchema,
  helpReorderSchema,
  helpSearchSchema,
} from "../validators/help";
import {
  countPublishedHelpArticles,
  findPublicHelpWorkspace,
  getHelpAdminTree,
  isHelpCenterEnabled,
  nextHelpPosition,
  searchHelpArticles,
  uniqueHelpSlug,
} from "../help/queries";

async function requireCollection(ctx: any, workspaceId: string, id: string) {
  const [row] = await ctx.db
    .select({ id: helpCollection.id })
    .from(helpCollection)
    .where(
      and(eq(helpCollection.id, id), eq(helpCollection.workspaceId, workspaceId)),
    )
    .limit(1);
  if (!row) throw new HTTPException(404, { message: "Collection not found" });
  return row;
}

async function requireArticle(ctx: any, workspaceId: string, id: string) {
  const [row] = await ctx.db
    .select()
    .from(helpArticle)
    .where(and(eq(helpArticle.id, id), eq(helpArticle.workspaceId, workspaceId)))
    .limit(1);
  if (!row) throw new HTTPException(404, { message: "Article not found" });
  return row as typeof helpArticle.$inferSelect;
}

/** Published article on a public help center, for anonymous view and vote counters. */
async function requirePublicArticle(ctx: any, slug: string, articleId: string) {
  const ws = await findPublicHelpWorkspace(ctx.db, slug);
  if (!ws) throw new HTTPException(404, { message: "Help center not found" });
  const [row] = await ctx.db
    .select({ id: helpArticle.id })
    .from(helpArticle)
    .where(
      and(
        eq(helpArticle.id, articleId),
        eq(helpArticle.workspaceId, ws.id),
        eq(helpArticle.status, "published"),
      ),
    )
    .limit(1);
  if (!row) throw new HTTPException(404, { message: "Article not found" });
  return row;
}

export function createHelpRouter() {
  return j.router({
    visible: publicProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await findPublicHelpWorkspace(ctx.db, input.slug);
        c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
        return c.superjson({ visible: Boolean(ws) });
      }),

    search: publicProcedure
      .input(helpSearchSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await findPublicHelpWorkspace(ctx.db, input.slug);
        if (!ws) return c.superjson({ articles: [] });
        const articles = await searchHelpArticles(ctx.db, ws.id, input.q, input.limit);
        return c.superjson({ articles });
      }),

    view: publicProcedure
      .input(helpArticleIdSchema)
      .post(async ({ ctx, input, c }) => {
        const article = await requirePublicArticle(ctx, input.slug, input.articleId);
        await ctx.db
          .update(helpArticle)
          .set({ viewCount: sql`${helpArticle.viewCount} + 1`, updatedAt: sql`${helpArticle.updatedAt}` })
          .where(eq(helpArticle.id, article.id));
        return c.superjson({ ok: true });
      }),

    feedback: publicProcedure
      .input(helpFeedbackSchema)
      .post(async ({ ctx, input, c }) => {
        const article = await requirePublicArticle(ctx, input.slug, input.articleId);
        if (input.previous === input.helpful) return c.superjson({ ok: true });
        const bump = (col: AnyColumn, by: number) =>
          sql`greatest(${col} + ${by}, 0)`;
        await ctx.db
          .update(helpArticle)
          .set({
            helpfulCount: bump(
              helpArticle.helpfulCount,
              (input.helpful ? 1 : 0) - (input.previous === true ? 1 : 0),
            ),
            notHelpfulCount: bump(
              helpArticle.notHelpfulCount,
              (input.helpful ? 0 : 1) - (input.previous === false ? 1 : 0),
            ),
            // Votes are not edits; keep "Updated" honest on the public page.
            updatedAt: sql`${helpArticle.updatedAt}`,
          })
          .where(eq(helpArticle.id, article.id));
        return c.superjson({ ok: true });
      }),

    settings: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireActiveWorkspaceMemberBySlug(ctx, input.slug);
        const [isVisible, publishedCount] = await Promise.all([
          isHelpCenterEnabled(ctx.db, ws.id),
          countPublishedHelpArticles(ctx.db, ws.id),
        ]);
        return c.superjson({ isVisible, publishedCount });
      }),

    toggleVisibility: privateProcedure
      .input(helpVisibilitySchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await ctx.db
          .insert(helpCenter)
          .values({ workspaceId: ws.id, isVisible: input.isVisible })
          .onConflictDoUpdate({
            target: helpCenter.workspaceId,
            set: { isVisible: input.isVisible, updatedAt: new Date() },
          });
        return c.superjson({ ok: true, isVisible: input.isVisible });
      }),

    tree: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireActiveWorkspaceMemberBySlug(ctx, input.slug);
        return c.superjson(await getHelpAdminTree(ctx.db, ws.id));
      }),

    collectionsCreate: privateProcedure
      .input(helpCollectionCreateSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const slug = await uniqueHelpSlug(
          ctx.db,
          helpCollection,
          ws.id,
          toUrlSlug(input.name) || "collection",
        );
        const position = await nextHelpPosition(
          ctx.db,
          helpCollection,
          eq(helpCollection.workspaceId, ws.id),
        );
        const [collection] = await ctx.db
          .insert(helpCollection)
          .values({
            workspaceId: ws.id,
            name: input.name,
            slug,
            description: input.description || null,
            icon: input.icon ?? "book",
            position,
          })
          .returning();
        return c.superjson({ ok: true, collection });
      }),

    collectionsUpdate: privateProcedure
      .input(helpCollectionUpdateSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await requireCollection(ctx, ws.id, input.collectionId);
        const patch: Partial<typeof helpCollection.$inferInsert> = {};
        if (input.name !== undefined) {
          patch.name = input.name;
          patch.slug = await uniqueHelpSlug(
            ctx.db,
            helpCollection,
            ws.id,
            toUrlSlug(input.name) || "collection",
            input.collectionId,
          );
        }
        if (input.description !== undefined) patch.description = input.description || null;
        if (input.icon !== undefined) patch.icon = input.icon;
        const [collection] = await ctx.db
          .update(helpCollection)
          .set(patch)
          .where(eq(helpCollection.id, input.collectionId))
          .returning();
        return c.superjson({ ok: true, collection });
      }),

    collectionsDelete: privateProcedure
      .input(helpCollectionIdSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await requireCollection(ctx, ws.id, input.collectionId);
        // The FK sets collection_id to null, so its articles become uncategorized.
        await ctx.db.delete(helpCollection).where(eq(helpCollection.id, input.collectionId));
        return c.superjson({ ok: true });
      }),

    collectionsReorder: privateProcedure
      .input(helpReorderSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await Promise.all(
          input.ids.map((id, position) =>
            ctx.db
              .update(helpCollection)
              .set({ position })
              .where(and(eq(helpCollection.id, id), eq(helpCollection.workspaceId, ws.id))),
          ),
        );
        return c.superjson({ ok: true });
      }),

    articlesReorder: privateProcedure
      .input(helpReorderSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await Promise.all(
          input.ids.map((id, position) =>
            ctx.db
              .update(helpArticle)
              .set({ position, updatedAt: sql`${helpArticle.updatedAt}` })
              .where(and(eq(helpArticle.id, id), eq(helpArticle.workspaceId, ws.id))),
          ),
        );
        return c.superjson({ ok: true });
      }),

    articlesGetForEdit: privateProcedure
      .input(helpArticleIdSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        return c.superjson({ article: await requireArticle(ctx, ws.id, input.articleId) });
      }),

    articlesCreate: privateProcedure
      .input(helpArticleCreateSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const collectionId = input.collectionId ?? null;
        if (collectionId) await requireCollection(ctx, ws.id, collectionId);
        const isPublished = input.status === "published";
        const [slug, position] = await Promise.all([
          uniqueHelpSlug(ctx.db, helpArticle, ws.id, toUrlSlug(input.title) || "article"),
          nextHelpPosition(
            ctx.db,
            helpArticle,
            and(
              eq(helpArticle.workspaceId, ws.id),
              collectionId
                ? eq(helpArticle.collectionId, collectionId)
                : isNull(helpArticle.collectionId),
            )!,
          ),
        ]);
        const [article] = await ctx.db
          .insert(helpArticle)
          .values({
            workspaceId: ws.id,
            collectionId,
            title: input.title,
            slug,
            summary: input.summary || null,
            content: input.content as Record<string, unknown>,
            status: input.status ?? "draft",
            authorId: ctx.session.user.id,
            position,
            publishedAt: isPublished ? new Date() : null,
          })
          .returning();
        return c.superjson({ ok: true, article });
      }),

    articlesUpdate: privateProcedure
      .input(helpArticleUpdateSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const existing = await requireArticle(ctx, ws.id, input.articleId);
        const patch: Partial<typeof helpArticle.$inferInsert> = {};

        if (input.title !== undefined && input.title !== existing.title) {
          patch.title = input.title;
          // Links to a published article must keep working, so only drafts follow their title.
          if (!existing.publishedAt) {
            patch.slug = await uniqueHelpSlug(
              ctx.db,
              helpArticle,
              ws.id,
              toUrlSlug(input.title) || "article",
              existing.id,
            );
          }
        }
        if (input.summary !== undefined) patch.summary = input.summary || null;
        if (input.content !== undefined) patch.content = input.content as Record<string, unknown>;
        if (input.collectionId !== undefined && input.collectionId !== existing.collectionId) {
          if (input.collectionId) await requireCollection(ctx, ws.id, input.collectionId);
          patch.collectionId = input.collectionId;
          patch.position = await nextHelpPosition(
            ctx.db,
            helpArticle,
            and(
              eq(helpArticle.workspaceId, ws.id),
              input.collectionId
                ? eq(helpArticle.collectionId, input.collectionId)
                : isNull(helpArticle.collectionId),
            )!,
          );
        }
        if (input.status !== undefined) {
          patch.status = input.status;
          if (input.status === "published" && !existing.publishedAt) {
            patch.publishedAt = new Date();
          }
        }

        const [article] = await ctx.db
          .update(helpArticle)
          .set(patch)
          .where(eq(helpArticle.id, existing.id))
          .returning();
        return c.superjson({ ok: true, article });
      }),

    articlesDelete: privateProcedure
      .input(helpArticlesDeleteSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const deleted = await ctx.db
          .delete(helpArticle)
          .where(and(inArray(helpArticle.id, input.articleIds), eq(helpArticle.workspaceId, ws.id)))
          .returning({ id: helpArticle.id });
        return c.superjson({ ok: true, deleted: deleted.length });
      }),
  });
}
