import { sql, type SQL } from "drizzle-orm"
import { post } from "@featul/db"

/** Quote searchable words and match each as a prefix as the user types. */
export function buildPrefixQuery(search: string): string {
  return (search.match(/[\p{L}\p{N}_]+/gu) || [])
    .map((word) => `'${word}':*`)
    .join(" & ")
}

export function buildPostFtsFilter(search: string | undefined | null): SQL | undefined {
  const trimmed = (search || "").trim()
  if (!trimmed) return undefined

  const document = sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, ''))`
  const wholeWords = sql`${document} @@ plainto_tsquery('english', ${trimmed})`
  const prefixQuery = buildPrefixQuery(trimmed)
  if (!prefixQuery) return wholeWords

  return sql`(${wholeWords} or ${document} @@ to_tsquery('english', ${prefixQuery}))`
}

/** When a text search is active, board filters are ignored so results aren't over-narrowed. */
export function boardSlugsForSearch<T extends string>(
  search: string | undefined | null,
  boardSlugs: T[],
): T[] {
  return (search || "").trim() ? [] : boardSlugs
}
