import { and, eq } from "drizzle-orm";
import { db, helpArticle, workspace } from "@featul/db";
import type { JSONContent } from "@featul/editor";
import { getHelpAdminTree } from "@featul/api/help/queries";
import type { HelpAdminTree } from "@/components/help/types";
import type { HelpArticleFormData } from "@/hooks/useHelpArticle";

async function workspaceIdBySlug(slug: string) {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  return ws?.id ?? null;
}

/** Collections and articles (drafts included); null when the workspace is missing. */
export async function getHelpTreeData(slug: string): Promise<HelpAdminTree | null> {
  const workspaceId = await workspaceIdBySlug(slug);
  if (!workspaceId) return null;
  return (await getHelpAdminTree(db, workspaceId)) as HelpAdminTree;
}

export async function getHelpArticleForEdit(
  slug: string,
  articleId: string,
): Promise<{ article: HelpArticleFormData; tree: HelpAdminTree } | null> {
  const workspaceId = await workspaceIdBySlug(slug);
  if (!workspaceId) return null;
  const [[row], tree] = await Promise.all([
    db
      .select()
      .from(helpArticle)
      .where(and(eq(helpArticle.id, articleId), eq(helpArticle.workspaceId, workspaceId)))
      .limit(1),
    getHelpAdminTree(db, workspaceId),
  ]);
  if (!row) return null;
  return {
    article: {
      title: row.title,
      summary: row.summary,
      content: row.content as JSONContent,
      collectionId: row.collectionId,
      status: row.status as "draft" | "published",
    },
    tree: tree as HelpAdminTree,
  };
}
