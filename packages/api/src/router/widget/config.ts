import { and, eq } from "drizzle-orm";
import { workspace, workspaceMember } from "@featul/db";
import { HTTPException } from "hono/http-exception";
import { privateProcedure, publicProcedure } from "../../jstack";
import { identifySchema, projectIdInput, projectInput } from "./schema";
import {
  loadWidgetPublicConfig,
  resolveWidget,
  upsertIdentifiedUser,
} from "./resolve";
import {
  isVerifiedIdentity,
  signWidgetIdentity,
  WIDGET_IDENTITY_TTL_SECONDS,
} from "../../shared/identity";

export const widgetConfig = publicProcedure
  .input(projectInput)
  .get(async ({ ctx, input, c }) => {
    const payload = await loadWidgetPublicConfig(
      ctx,
      input.projectId,
      input.parentOrigin,
    );

    c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return c.superjson(payload);
  });

export const widgetIdentify = publicProcedure
  .input(identifySchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );
    if (!input.user) return c.superjson({ user: null });
    if (
      !isVerifiedIdentity(
        input.user,
        resolved.widgetSecret,
        resolved.workspaceId,
      )
    ) {
      return c.superjson({ user: null });
    }
    const row = await upsertIdentifiedUser(
      ctx,
      resolved.workspaceId,
      input.user,
    );
    if (!row) return c.superjson({ user: null });
    return c.superjson({ user: { id: row.id } });
  });

export const widgetSessionIdentity = privateProcedure
  .input(projectIdInput)
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(ctx, input.projectId);
    const sessionUser = ctx.session.user;
    const [access] = await ctx.db
      .select({
        ownerId: workspace.ownerId,
        role: workspaceMember.role,
        permissions: workspaceMember.permissions,
      })
      .from(workspace)
      .leftJoin(
        workspaceMember,
        and(
          eq(workspaceMember.workspaceId, workspace.id),
          eq(workspaceMember.userId, sessionUser.id),
        ),
      )
      .where(eq(workspace.id, resolved.workspaceId))
      .limit(1);
    const permissions = (access?.permissions || {}) as Record<string, boolean>;
    if (
      !access ||
      (access.ownerId !== sessionUser.id &&
        access.role !== "admin" &&
        !permissions.canManageWorkspace)
    ) {
      throw new HTTPException(403, { message: "Forbidden" });
    }
    const email = String(sessionUser.email || "")
      .trim()
      .toLowerCase();
    const userId = String(sessionUser.id || "").trim();
    if (!email || !userId) return c.superjson({ user: null });
    const identity = {
      id: userId,
      email,
      name: sessionUser.name || undefined,
      avatar: sessionUser.image || undefined,
      expiresAt: Math.floor(Date.now() / 1000) + WIDGET_IDENTITY_TTL_SECONDS,
    };

    return c.superjson({
      user: {
        ...identity,
        signature: signWidgetIdentity(
          resolved.widgetSecret,
          resolved.workspaceId,
          identity,
        ),
      },
    });
  });

/** Dev-only helper for the in-app widget test embed. */
export const widgetDevIdentity = privateProcedure
  .input(projectIdInput)
  .get(async ({ ctx, input, c }) => {
    if (process.env.NODE_ENV === "production") {
      throw new HTTPException(404, { message: "Not found" });
    }

    const resolved = await resolveWidget(ctx, input.projectId);
    const sessionUser = ctx.session.user;
    const email = String(sessionUser.email || "")
      .trim()
      .toLowerCase();
    const userId = String(sessionUser.id || "").trim();
    if (!email || !userId) return c.superjson({ user: null });

    const identity = {
      id: userId,
      email,
      name: sessionUser.name || undefined,
      avatar: sessionUser.image || undefined,
      expiresAt: Math.floor(Date.now() / 1000) + WIDGET_IDENTITY_TTL_SECONDS,
    };

    return c.superjson({
      user: {
        ...identity,
        signature: signWidgetIdentity(
          resolved.widgetSecret,
          resolved.workspaceId,
          identity,
        ),
      },
    });
  });
