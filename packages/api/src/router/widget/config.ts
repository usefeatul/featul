import { and, asc, eq } from "drizzle-orm";
import { board, workspaceDomain } from "@featul/db";
import { privateProcedure, publicProcedure } from "../../jstack";
import { identifySchema, projectInput } from "./schema";
import { resolveWidget, upsertIdentifiedUser } from "./resolve";
import {
  buildWidgetOriginAllowlist,
  isVerifiedIdentity,
  signWidgetIdentity,
} from "../../shared/identity";

export const widgetConfig = publicProcedure.input(projectInput).get(async ({ ctx, input, c }) => {
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

  const domains = await ctx.db
    .select({ host: workspaceDomain.host, status: workspaceDomain.status })
    .from(workspaceDomain)
    .where(eq(workspaceDomain.workspaceId, resolved.workspaceId));

  const allowedOrigins = buildWidgetOriginAllowlist({
    slug: resolved.workspaceSlug,
    customDomain: resolved.customDomain,
    verifiedHosts: domains
      .filter((row: { host: string; status: string }) => row.status === "verified")
      .map((row: { host: string; status: string }) => row.host),
    appOrigin: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || null,
  });

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
      allowedOrigins,
    },
    boards,
  });
});

export const widgetIdentify = publicProcedure.input(identifySchema).post(async ({ ctx, input, c }) => {
  const resolved = await resolveWidget(ctx, input.projectId);
  if (!input.user) return c.superjson({ user: null });
  if (!isVerifiedIdentity(input.user, resolved.widgetSecret)) {
    return c.superjson({ user: null });
  }
  const row = await upsertIdentifiedUser(ctx, input.user);
  if (!row) return c.superjson({ user: null });
  return c.superjson({ user: { id: row.id } });
});

export const widgetSessionIdentity = privateProcedure
  .input(projectInput)
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(ctx, input.projectId);
    const sessionUser = ctx.session.user;
    const email = String(sessionUser.email || "").trim().toLowerCase();
    if (!email) return c.superjson({ user: null });

    return c.superjson({
      user: {
        id: sessionUser.id,
        email,
        name: sessionUser.name || undefined,
        avatar: sessionUser.image || undefined,
        signature: signWidgetIdentity(resolved.widgetSecret, sessionUser.id, email),
      },
    });
  });
