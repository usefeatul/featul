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

/** Title relevance takes priority over votes or recency in search suggestions. */
export function buildPostSearchRelevance(search: string): SQL {
  const query = search.trim()
  const escaped = query.replace(/[\\%_]/g, "\\$&")
  const title = sql`coalesce(${post.title}, '')`
  const titleDocument = sql`to_tsvector('english', ${title})`
  const prefix = buildPrefixQuery(query)
  const terms = prefix
    ? sql`to_tsquery('english', ${prefix})`
    : sql`plainto_tsquery('english', ${query})`

  return sql`(
    case
      when lower(${title}) = lower(${query}) then 4
      when ${title} ilike ${escaped + "%"} then 3
      when ${title} ilike ${"%" + escaped + "%"} then 2
      when ${titleDocument} @@ ${terms} then 1
      else 0
    end + ts_rank_cd(${titleDocument}, ${terms}, 32) * 0.5
  )`
}

/** When a text search is active, board filters are ignored so results aren't over-narrowed. */
export function boardSlugsForSearch<T extends string>(
  search: string | undefined | null,
  boardSlugs: T[],
): T[] {
  return (search || "").trim() ? [] : boardSlugs
}
