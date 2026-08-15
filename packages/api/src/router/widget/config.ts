import { and, asc, eq } from "drizzle-orm";
import { board } from "@featul/db";
import { publicProcedure } from "../../jstack";
import { identifySchema, projectInput } from "./schema";
import { resolveWidget } from "./resolve";

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
});

export const widgetIdentify = publicProcedure.input(identifySchema).post(async ({ ctx, input, c }) => {
  await resolveWidget(ctx, input.projectId);
  // Unsigned identify is ignored until HMAC verification is wired.
  const user: { id: string } | null = null;
  return c.superjson({ user });
});
