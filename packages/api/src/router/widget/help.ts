import { publicProcedure } from "../../jstack";
import { publicPortalOrigin } from "../../changelog/notify";
import { isHelpCenterPublic } from "../../help/queries";
import { rankHelpArticles } from "../../help/rank";
import { getWorkspaceAccessPlan } from "../../shared/access";
import { getPlanLimits } from "../../shared/plan";
import { resolveWidget } from "./resolve";
import { helpSuggestSchema } from "./schema";

/** Help articles that may already answer the feedback being written, on plans that include it. */
export const widgetHelpArticles = publicProcedure
  .input(helpSuggestSchema)
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(ctx, input.projectId, input.parentOrigin);
    const { allowHelpWidget } = getPlanLimits(await getWorkspaceAccessPlan(resolved.workspaceId));
    if (!allowHelpWidget || !(await isHelpCenterPublic(ctx.db, resolved.workspaceId))) {
      // Tells the widget to stop asking while it's open.
      return c.superjson({ articles: [], enabled: false });
    }
    const origin = publicPortalOrigin(resolved.workspaceSlug, resolved.customDomain);
    const rows = await rankHelpArticles(ctx.db, resolved.workspaceId, input.q, {
      limit: 3,
      strict: true,
    });
    return c.superjson({
      articles: rows.map((row) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        url: `${origin}/help/articles/${encodeURIComponent(row.slug)}`,
      })),
    });
  });
