import {
  db,
  board,
  workspaceMember,
  tag,
  workspaceIntegration,
  helpCollection,
  helpArticle,
} from "@featul/db";
import { and, count, eq } from "drizzle-orm";
import type { BillingUsage } from "@/types/billing";

/** Count the same workspace resources used by the enforced plan limits. */
export async function getBillingUsage(
  workspaceId: string,
): Promise<BillingUsage> {
  const [boards, members, tags, integrations, helpCollections, helpArticles] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(board)
        .where(
          and(eq(board.workspaceId, workspaceId), eq(board.isSystem, false)),
        ),
      db
        .select({ count: count() })
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, workspaceId),
            eq(workspaceMember.isActive, true),
          ),
        ),
      db
        .select({ count: count() })
        .from(tag)
        .where(eq(tag.workspaceId, workspaceId)),
      db
        .select({ count: count() })
        .from(workspaceIntegration)
        .where(
          and(
            eq(workspaceIntegration.workspaceId, workspaceId),
            eq(workspaceIntegration.isActive, true),
          ),
        ),
      db
        .select({ count: count() })
        .from(helpCollection)
        .where(eq(helpCollection.workspaceId, workspaceId)),
      db
        .select({ count: count() })
        .from(helpArticle)
        .where(
          and(
            eq(helpArticle.workspaceId, workspaceId),
            eq(helpArticle.status, "published"),
          ),
        ),
    ]);
  return {
    boards: boards[0]?.count ?? 0,
    members: members[0]?.count ?? 0,
    tags: tags[0]?.count ?? 0,
    integrations: integrations[0]?.count ?? 0,
    helpCollections: helpCollections[0]?.count ?? 0,
    helpArticles: helpArticles[0]?.count ?? 0,
  };
}
