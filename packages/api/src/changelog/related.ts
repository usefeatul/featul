import { and, desc, eq, ilike, inArray } from "drizzle-orm";
import { board, post, type db } from "@featul/db";

export type RelatedPost = {
  id: string;
  title: string;
  slug: string;
  roadmapStatus: string | null;
};

export async function getRelatedPosts(
  database: typeof db,
  workspaceId: string,
  options: { ids?: string[]; search?: string; publicOnly?: boolean } = {},
): Promise<RelatedPost[]> {
  if (options.ids?.length === 0) return [];
  const rows = await database
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      roadmapStatus: post.roadmapStatus,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        eq(post.status, "published"),
        options.publicOnly ? eq(board.isPublic, true) : undefined,
        options.publicOnly ? eq(board.isVisible, true) : undefined,
        options.ids ? inArray(post.id, options.ids) : undefined,
        options.search
          ? ilike(post.title, `%${options.search.replace(/[\\%_]/g, "\\$&")}%`)
          : undefined,
      ),
    )
    .orderBy(desc(post.createdAt))
    .limit(options.ids ? 20 : 30);
  return options.ids
    ? options.ids.flatMap((id) => rows.filter((row) => row.id === id))
    : rows;
}
