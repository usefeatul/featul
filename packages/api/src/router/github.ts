import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { j, privateProcedure } from "../jstack";
import {
  getWorkspaceAccessPlan,
  requireBoardManagerBySlug,
  requireWorkspaceManagerBySlug,
} from "../shared/access";
import { isIntegrationsAllowed } from "../shared/plan";
import { getHelpGithubConnection } from "../help/import/github";
import { isGithubAppConfigured } from "../services/github-app";
import { applyRateLimitHeaders, limitGithubSync } from "../services/ratelimiter";
import { sendAfterResponse } from "../github/defer";
import {
  getSyncSettings,
  listIssueLinks,
  saveSyncSettings,
  syncWorkspaceIssues,
  unlinkIssue,
  type StatusNotification,
} from "../github/sync";

const slugSchema = z.string().min(2).max(64);

/**
 * GitHub roadmap sync settings. Board managers can see the setup; changing it, syncing, and
 * unlinking (which can move many statuses and email voters) is for workspace managers, like
 * the other integrations.
 * Requests are linked from GitHub itself, by pasting a request
 * link into an issue description; the issue then drives the request's roadmap status.
 */
export function createGithubRouter() {
  return j.router({
    settings: privateProcedure
      .input(z.object({ slug: slugSchema }))
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const connection = await getHelpGithubConnection(ctx.db, ws.id);
        return c.superjson({
          configured: isGithubAppConfigured(),
          connected: Boolean(connection),
          accountLogin: connection?.accountLogin ?? null,
          settings: await getSyncSettings(ctx.db, ws.id),
        });
      }),

    settingsUpdate: privateProcedure
      .input(
        z.object({
          slug: slugSchema,
          autoStatus: z.boolean(),
          openStatus: z.enum(["review", "planned"]),
          progressLabels: z.array(z.string().trim().min(1).max(50)).max(10),
        }),
      )
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        if (!isIntegrationsAllowed(await getWorkspaceAccessPlan(ws.id))) {
          throw new HTTPException(403, { message: "GitHub sync is available on Starter or Professional plans" });
        }
        const { slug: _slug, ...settings } = input;
        await saveSyncSettings(ctx.db, ws.id, settings);
        return c.superjson({ ok: true });
      }),

    links: privateProcedure
      .input(z.object({ slug: slugSchema, offset: z.coerce.number().int().min(0).max(100_000).default(0) }))
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        return c.superjson(await listIssueLinks(ctx.db, ws.id, input.offset));
      }),

    /** Re-reads the connected repos' issues: missed webhooks and links made before connecting. */
    sync: privateProcedure
      .input(z.object({ slug: slugSchema }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        if (!isIntegrationsAllowed(await getWorkspaceAccessPlan(ws.id))) {
          throw new HTTPException(403, { message: "GitHub sync is available on Starter or Professional plans" });
        }
        if (!(await getHelpGithubConnection(ctx.db, ws.id))) {
          throw new HTTPException(400, { message: "Connect GitHub first" });
        }
        applyRateLimitHeaders(c, await limitGithubSync(ws.id), "GitHub was synced recently. Try again in a few minutes.");
        const notifications: StatusNotification[] = [];
        let summary;
        // Per-repo GitHub errors come back in `summary.failed`.
        try {
          summary = await syncWorkspaceIssues(ctx.db, ws.id, (n) => notifications.push(n));
        } finally {
          sendAfterResponse(notifications);
        }
        return c.superjson(summary);
      }),

    unlink: privateProcedure
      .input(z.object({ slug: slugSchema, linkId: z.string().min(1) }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        if (!(await unlinkIssue(ctx.db, ws.id, input.linkId))) {
          throw new HTTPException(404, { message: "Linked issue not found" });
        }
        return c.superjson({ ok: true });
      }),
  });
}
