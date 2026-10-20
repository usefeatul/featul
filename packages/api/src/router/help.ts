import { z } from "zod";
import { and, eq, inArray, isNull, sql, type AnyColumn } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { helpArticle, helpCenter, helpCollection, workspace } from "@featul/db";
import { j, publicProcedure, privateProcedure } from "../jstack";
import {
  getWorkspaceAccessPlan,
  requireActiveWorkspaceMemberBySlug,
  requireBoardManagerBySlug,
} from "../shared/access";
import { getPlanLimits } from "../shared/plan";
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
  helpTrackSearchSchema,
  helpAnalyticsSchema,
  helpImportApplySchema,
} from "../validators/help";
import { markdownToTiptapDoc } from "../notra/content";
import { getHelpImportUsage } from "../help/import/usage";
import { clearHelpGithubConnection, getHelpGithubConnection } from "../help/import/github";
import {
  createSetupState,
  githubAppInstallUrl,
  isGithubAppConfigured,
  listInstallationRepos,
} from "../services/github-app";
import { getHelpAiUsage } from "../help/ask";
import {
  countPublishedHelpArticles,
  findPublicHelpWorkspace,
  getHelpAdminTree,
  isHelpCenterEnabled,
  nextHelpPosition,
  uniqueHelpSlug,
} from "../help/queries";
import { getHelpAnalytics } from "../help/analytics";
import { searchHelpCenter } from "../help/rank";
import { bumpHelpArticleDaily, recordHelpSearch } from "../help/stats";

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

async function assertCollectionLimit(ctx: any, workspaceId: string) {
  const { maxHelpCollections: max } = getPlanLimits(await getWorkspaceAccessPlan(workspaceId));
  if (max === null) return;
  const [row] = await ctx.db
    .select({ count: sql<number>`count(*)::int` })
    .from(helpCollection)
    .where(eq(helpCollection.workspaceId, workspaceId));
  if (Number(row?.count || 0) >= max) {
    throw new HTTPException(403, { message: `Help collections limit reached (${max})` });
  }
}

/** Only publishing counts toward the article cap, so drafts stay unlimited. */
async function assertPublishLimit(ctx: any, workspaceId: string) {
  const { maxHelpArticles: max } = getPlanLimits(await getWorkspaceAccessPlan(workspaceId));
  if (max === null) return;
  if ((await countPublishedHelpArticles(ctx.db, workspaceId)) >= max) {
    throw new HTTPException(403, { message: `Published articles limit reached (${max})` });
  }
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
  return { id: row.id as string, workspaceId: ws.id };
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
        const articles = await searchHelpCenter(ctx.db, ws.id, input.q, input.limit);
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
        await bumpHelpArticleDaily(ctx.db, { workspaceId: article.workspaceId, articleId: article.id, views: 1 });
        return c.superjson({ ok: true });
      }),

    trackSearch: publicProcedure
      .input(helpTrackSearchSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await findPublicHelpWorkspace(ctx.db, input.slug);
        if (!ws) return c.superjson({ ok: true });
        // Re-run the search instead of trusting a client-reported result count.
        const results = await searchHelpCenter(ctx.db, ws.id, input.q, 8);
        await recordHelpSearch(ctx.db, {
          workspaceId: ws.id,
          source: "search",
          query: input.q,
          results: results.length,
        });
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
        // Daily buckets count votes cast; a flipped vote isn't taken back from an earlier day.
        await bumpHelpArticleDaily(ctx.db, {
          workspaceId: article.workspaceId,
          articleId: article.id,
          helpful: input.helpful ? 1 : 0,
          notHelpful: input.helpful ? 0 : 1,
        });
        return c.superjson({ ok: true });
      }),

    analytics: privateProcedure
      .input(helpAnalyticsSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireActiveWorkspaceMemberBySlug(ctx, input.slug);
        const plan = await getWorkspaceAccessPlan(ws.id);
        return c.superjson(await getHelpAnalytics(ctx.db, ws.id, plan, input.days));
      }),

    importStatus: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const plan = await getWorkspaceAccessPlan(ws.id);
        const [usage, collections, published, aiUsed, [site]] = await Promise.all([
          getHelpImportUsage(ctx.db, ws.id, plan),
          ctx.db
            .select({ count: sql<number>`count(*)::int` })
            .from(helpCollection)
            .where(eq(helpCollection.workspaceId, ws.id)),
          countPublishedHelpArticles(ctx.db, ws.id),
          getHelpAiUsage(ws.id),
          ctx.db
            .select({ domain: workspace.domain })
            .from(workspace)
            .where(eq(workspace.id, ws.id))
            .limit(1),
        ]);
        // Before the first scan, suggest the website the workspace was created with.
        const fallbackSite = String(site?.domain ?? "")
          .trim()
          .replace(/^https?:\/\//i, "")
          .replace(/\/+$/, "");
        return c.superjson({
          plan,
          usage: { ...usage, site: usage.site ?? (fallbackSite || null) },
          counts: { collections: Number(collections[0]?.count ?? 0), published, aiAnswers: aiUsed },
        });
      }),

    /** Whether private repos can be scanned, and the connected GitHub account if any. */
    githubStatus: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const connection = await getHelpGithubConnection(ctx.db, ws.id);
        return c.superjson({
          configured: isGithubAppConfigured(),
          connected: Boolean(connection),
          accountLogin: connection?.accountLogin ?? null,
        });
      }),

    githubConnectUrl: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, returnTo: z.string().max(300).optional() }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        if (!isGithubAppConfigured()) {
          throw new HTTPException(503, { message: "GitHub connection isn't set up on this server yet" });
        }
        const state = createSetupState({
          workspaceSlug: ws.slug,
          userId: ctx.session.user.id,
          returnTo: input.returnTo ?? `/workspaces/${ws.slug}/settings/help`,
        });
        return c.superjson({ url: githubAppInstallUrl(state) });
      }),

    githubRepos: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const connection = await getHelpGithubConnection(ctx.db, ws.id);
        if (!connection) return c.superjson({ repos: [] });
        try {
          return c.superjson({ repos: await listInstallationRepos(connection.installationId) });
        } catch (error) {
          // Uninstalled on GitHub's side: forget the stale connection.
          if (error instanceof HTTPException && error.status === 404) {
            await clearHelpGithubConnection(ctx.db, ws.id);
            return c.superjson({ repos: [], disconnected: true });
          }
          throw error;
        }
      }),

    githubDisconnect: privateProcedure
      .input(bySlugSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        await clearHelpGithubConnection(ctx.db, ws.id);
        return c.superjson({ ok: true });
      }),

    importApply: privateProcedure
      .input(helpImportApplySchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const { maxHelpCollections } = getPlanLimits(await getWorkspaceAccessPlan(ws.id));
        const existing: Array<{ id: string; name: string }> = await ctx.db
          .select({ id: helpCollection.id, name: helpCollection.name })
          .from(helpCollection)
          .where(eq(helpCollection.workspaceId, ws.id));
        const byName = new Map(existing.map((col) => [col.name.trim().toLowerCase(), col.id]));
        let collectionCount = existing.length;
        let collectionsCreated = 0;

        // Only collections an article actually uses; past the plan limit, articles stay uncategorized.
        const wanted = new Set(input.articles.map((a) => a.collection?.trim().toLowerCase()).filter(Boolean));
        for (const col of input.collections) {
          const key = col.name.trim().toLowerCase();
          if (!wanted.has(key) || byName.has(key)) continue;
          if (maxHelpCollections !== null && collectionCount >= maxHelpCollections) break;
          const [created] = await ctx.db
            .insert(helpCollection)
            .values({
              workspaceId: ws.id,
              name: col.name,
              slug: await uniqueHelpSlug(ctx.db, helpCollection, ws.id, toUrlSlug(col.name) || "collection"),
              description: col.description || null,
              icon: col.icon ?? "book",
              position: await nextHelpPosition(ctx.db, helpCollection, eq(helpCollection.workspaceId, ws.id)),
            })
            .returning({ id: helpCollection.id });
          byName.set(key, created.id);
          collectionCount += 1;
          collectionsCreated += 1;
        }

        let created = 0;
        for (const article of input.articles) {
          const collectionId = byName.get(article.collection?.trim().toLowerCase() ?? "") ?? null;
          await ctx.db.insert(helpArticle).values({
            workspaceId: ws.id,
            collectionId,
            title: article.title,
            slug: await uniqueHelpSlug(ctx.db, helpArticle, ws.id, toUrlSlug(article.title) || "article"),
            summary: article.summary || null,
            content: markdownToTiptapDoc(article.body) as unknown as Record<string, unknown>,
            status: "draft",
            authorId: ctx.session.user.id,
            position: await nextHelpPosition(
              ctx.db,
              helpArticle,
              and(
                eq(helpArticle.workspaceId, ws.id),
                collectionId ? eq(helpArticle.collectionId, collectionId) : isNull(helpArticle.collectionId),
              )!,
            ),
          });
          created += 1;
        }
        return c.superjson({ ok: true, created, collectionsCreated });
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
        await assertCollectionLimit(ctx, ws.id);
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
        if (isPublished) await assertPublishLimit(ctx, ws.id);
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
          if (input.status === "published" && existing.status !== "published") {
            await assertPublishLimit(ctx, ws.id);
          }
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
