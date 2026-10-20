import { sql, type AnyColumn } from "drizzle-orm";
import { helpArticleDaily, helpSearchDaily } from "@featul/db";

type Db = any;

export type HelpSearchSource = "search" | "ai";

/** Analytics buckets by UTC day. */
export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Case and spacing variants of the same search count as one query. */
export function normalizeHelpQuery(query: string) {
  return query.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 120);
}

/** Analytics must never fail the request that triggered it, so writes only log errors. */
function logStatError(error: unknown) {
  console.error("[help-stats] write failed", error);
}

export async function bumpHelpArticleDaily(
  db: Db,
  input: {
    workspaceId: string;
    articleId: string;
    views?: number;
    helpful?: number;
    notHelpful?: number;
  },
) {
  const views = input.views ?? 0;
  const helpful = input.helpful ?? 0;
  const notHelpful = input.notHelpful ?? 0;
  const add = (col: AnyColumn, by: number) => sql`greatest(${col} + ${by}, 0)`;
  await db
    .insert(helpArticleDaily)
    .values({
      articleId: input.articleId,
      workspaceId: input.workspaceId,
      day: utcDay(),
      views: Math.max(views, 0),
      helpful: Math.max(helpful, 0),
      notHelpful: Math.max(notHelpful, 0),
    })
    .onConflictDoUpdate({
      target: [helpArticleDaily.articleId, helpArticleDaily.day],
      set: {
        views: add(helpArticleDaily.views, views),
        helpful: add(helpArticleDaily.helpful, helpful),
        notHelpful: add(helpArticleDaily.notHelpful, notHelpful),
      },
    })
    .catch(logStatError);
}

export async function recordHelpSearch(
  db: Db,
  input: {
    workspaceId: string;
    source: HelpSearchSource;
    query: string;
    results: number;
  },
) {
  const query = normalizeHelpQuery(input.query);
  if (query.length < 2) return;
  await db
    .insert(helpSearchDaily)
    .values({
      workspaceId: input.workspaceId,
      day: utcDay(),
      source: input.source,
      query,
      count: 1,
      results: input.results,
    })
    .onConflictDoUpdate({
      target: [
        helpSearchDaily.workspaceId,
        helpSearchDaily.day,
        helpSearchDaily.source,
        helpSearchDaily.query,
      ],
      set: {
        count: sql`${helpSearchDaily.count} + 1`,
        results: input.results,
      },
    })
    .catch(logStatError);
}
