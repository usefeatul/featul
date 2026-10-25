import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { j, privateProcedure } from "../jstack";
import { activityLog, user, workspaceApiKey } from "@featul/db";
import { getWorkspaceAccessPlan, requireWorkspaceManagerBySlug } from "../shared/access";
import { isIntegrationsAllowed } from "../shared/plan";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import { API_KEY_SCOPES, generateApiKey } from "../public-api/keys";

const MAX_ACTIVE_KEYS = 10;
const slugSchema = z.string().min(2).max(64);

/**
 * Workspace API keys for the public REST API, managed from Settings → Integrations by
 * workspace managers (owner, admins), like the other integrations.
 */
export function createApiKeyRouter() {
  return j.router({
    list: privateProcedure
      .input(z.object({ slug: slugSchema }))
      .get(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        const keys = await ctx.db
          .select({
            id: workspaceApiKey.id,
            name: workspaceApiKey.name,
            prefix: workspaceApiKey.prefix,
            scopes: workspaceApiKey.scopes,
            lastUsedAt: workspaceApiKey.lastUsedAt,
            createdAt: workspaceApiKey.createdAt,
            createdByName: user.name,
          })
          .from(workspaceApiKey)
          .leftJoin(user, eq(workspaceApiKey.createdBy, user.id))
          .where(and(eq(workspaceApiKey.workspaceId, ws.id), isNull(workspaceApiKey.revokedAt)))
          .orderBy(desc(workspaceApiKey.createdAt));

        return c.superjson({ keys });
      }),

    create: privateProcedure
      .input(z.object({ slug: slugSchema, name: z.string().trim().min(1).max(64) }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        if (!isIntegrationsAllowed(await getWorkspaceAccessPlan(ws.id))) {
          throw new HTTPException(403, { message: "API keys are available on Starter or Professional plans" });
        }

        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(workspaceApiKey)
          .where(and(eq(workspaceApiKey.workspaceId, ws.id), isNull(workspaceApiKey.revokedAt)));
        if ((countResult?.count || 0) >= MAX_ACTIVE_KEYS) {
          throw new HTTPException(400, { message: `A workspace can have up to ${MAX_ACTIVE_KEYS} API keys` });
        }

        const { key, keyHash, prefix } = generateApiKey();
        const [row] = await ctx.db
          .insert(workspaceApiKey)
          .values({
            workspaceId: ws.id,
            name: input.name,
            prefix,
            keyHash,
            scopes: [...API_KEY_SCOPES],
            createdBy: ctx.session.user.id,
          })
          .returning({ id: workspaceApiKey.id });

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: ACTIVITY_ACTIONS.API_KEY_CREATED,
          actionType: "create",
          entity: "workspace_api_key",
          entityId: String(row.id),
          title: input.name,
          metadata: { prefix },
        });

        // The only time the plain key leaves the server.
        return c.superjson({ ok: true, id: row.id, key });
      }),

    revoke: privateProcedure
      .input(z.object({ slug: slugSchema, keyId: z.string().min(1) }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerBySlug(ctx, input.slug);
        const [row] = await ctx.db
          .update(workspaceApiKey)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(workspaceApiKey.id, input.keyId),
              eq(workspaceApiKey.workspaceId, ws.id),
              isNull(workspaceApiKey.revokedAt),
            ),
          )
          .returning({ id: workspaceApiKey.id, name: workspaceApiKey.name });
        if (!row) throw new HTTPException(404, { message: "API key not found" });

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: ACTIVITY_ACTIONS.API_KEY_REVOKED,
          actionType: "delete",
          entity: "workspace_api_key",
          entityId: String(row.id),
          title: row.name,
        });

        return c.superjson({ ok: true });
      }),
  });
}
