import { sql, type SQL } from "drizzle-orm"
import { post } from "@featul/db"

export function buildPostFtsFilter(search: string | undefined | null): SQL | undefined {
  const trimmed = (search || "").trim()
  if (!trimmed) return undefined

  return sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, '')) @@ plainto_tsquery('english', ${trimmed})`
}

/** When a text search is active, board filters are ignored so results aren't over-narrowed. */
export function boardSlugsForSearch<T extends string>(
  search: string | undefined | null,
  boardSlugs: T[],
): T[] {
  return (search || "").trim() ? [] : boardSlugs
}
