import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { helpArticle, helpCollection } from "@featul/db";
import { extractTiptapPlainText } from "../router/widget/resolve";
import { searchHelpArticles } from "./queries";

type Db = any;

// Words that carry no topic, so a question like "how do I export" ranks on "export".
const STOPWORDS = new Set(
  (
    "a an and are as at be but by can cant could did do does dont for from get got had has have " +
    "how i if im in into is it its ive me my no not of on or our please should so some still " +
    "that the their them then there these they this to too use using was way we what when where " +
    "which who why will with would you your yours hi hello help thanks thank anyone just want need"
  ).split(" "),
);

/** Distinct topic words from free text, letters and digits only so they are safe in a tsquery. */
export function helpQueryTerms(text: string, max = 12): string[] {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const terms: string[] = [];
  for (const word of words) {
    if (word.length < 2 || STOPWORDS.has(word) || terms.includes(word)) continue;
    terms.push(word);
    if (terms.length >= max) break;
  }
  return terms;
}

const bodyText = sql`coalesce((select string_agg(t #>> '{}', ' ') from jsonb_path_query(${helpArticle.content}::jsonb, 'strict $.**.text') as t), '')`;
const headingVector = sql`setweight(to_tsvector('english', ${helpArticle.title}), 'A') || setweight(to_tsvector('english', coalesce(${helpArticle.summary}, '')), 'B')`;
const documentVector = sql`(${headingVector}) || setweight(to_tsvector('english', ${bodyText}), 'C')`;

export type RankedHelpArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  collectionId: string | null;
  collectionName: string | null;
};

/**
 * Published articles matching any topic word, best first. Unlike the as-you-type title search,
 * this handles whole questions and feedback titles. `strict` matches whole words in the title or
 * summary only, for places where a weak suggestion is worse than none.
 */
export async function rankHelpArticles(
  db: Db,
  workspaceId: string,
  text: string,
  { limit = 5, strict = false }: { limit?: number; strict?: boolean } = {},
): Promise<RankedHelpArticle[]> {
  const terms = helpQueryTerms(text);
  if (terms.length === 0) return [];
  // Prefix matching helps recall for questions, but turns "mode" into "moderation" and
  // "change" into "changelog", so whole-word matches always rank first.
  const exact = sql`to_tsquery('english', ${terms.join(" | ")})`;
  const query = strict ? exact : sql`to_tsquery('english', ${terms.map((t) => `${t}:*`).join(" | ")})`;
  return db
    .select({
      id: helpArticle.id,
      title: helpArticle.title,
      slug: helpArticle.slug,
      summary: helpArticle.summary,
      collectionId: helpArticle.collectionId,
      collectionName: helpCollection.name,
    })
    .from(helpArticle)
    .leftJoin(helpCollection, eq(helpArticle.collectionId, helpCollection.id))
    .where(
      and(
        eq(helpArticle.workspaceId, workspaceId),
        eq(helpArticle.status, "published"),
        strict ? sql`(${headingVector}) @@ ${query}` : sql`(${documentVector}) @@ ${query}`,
      ),
    )
    .orderBy(
      sql`ts_rank(${documentVector}, ${exact}) desc`,
      sql`ts_rank(${documentVector}, ${query}) desc`,
      desc(helpArticle.viewCount),
    )
    .limit(limit);
}

/** Plain text of each article, keyed by id, for building an AI prompt. */
export async function helpArticleTexts(db: Db, workspaceId: string, ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const rows: Array<{ id: string; content: unknown }> = await db
    .select({ id: helpArticle.id, content: helpArticle.content })
    .from(helpArticle)
    .where(and(eq(helpArticle.workspaceId, workspaceId), inArray(helpArticle.id, ids)));
  return new Map(rows.map((row) => [row.id, extractTiptapPlainText(row.content)]));
}

/**
 * Public help search: phrase matches first, then topic-word matches, so "export csv" still
 * finds "Export and import data". Analytics counts results the same way visitors see them.
 */
export async function searchHelpCenter(db: Db, workspaceId: string, query: string, limit = 8) {
  const direct: RankedHelpArticle[] = await searchHelpArticles(db, workspaceId, query, limit);
  if (direct.length >= limit) return direct;
  const seen = new Set(direct.map((a) => a.id));
  const ranked = await rankHelpArticles(db, workspaceId, query, { limit });
  return [...direct, ...ranked.filter((a) => !seen.has(a.id))].slice(0, limit);
}
