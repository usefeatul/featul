import type { db } from "@featul/db";
import { tag } from "@featul/db/schema";
import { eq } from "drizzle-orm";

export type WorkspaceTagDatabase = Pick<typeof db, "select">;

/** The tag catalog used by both the changelog picker and its writing assistant. */
export async function fetchWorkspaceChangelogTags(params: {
  db: WorkspaceTagDatabase;
  workspaceId: string;
}) {
  const tags = await params.db
    .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
    .from(tag)
    .where(eq(tag.workspaceId, params.workspaceId))
    .orderBy(tag.name);

  return tags.map((item) => ({ ...item, color: item.color || null }));
}
