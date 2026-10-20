import { and, desc, eq, gt, gte, sql } from "drizzle-orm";
import { helpArticle, helpArticleDaily, helpSearchDaily } from "@featul/db";
import { getPlanLimits } from "../shared/plan";
import { getHelpAiUsage } from "./ask";
import { utcDay, type HelpSearchSource } from "./stats";

type Db = any;

export type HelpArticleStat = {
  id: string;
  title: string;
  slug: string;
  views: number;
  helpful: number;
  notHelpful: number;
};

export type HelpSearchStat = {
  query: string;
  count: number;
  results: number;
  source: HelpSearchSource;
};

export type HelpRangeTotals = {
  views: number;
  helpful: number;
  notHelpful: number;
  searches: number;
  gaps: number;
};

export type HelpDayTotals = HelpRangeTotals & { day: string };

export type HelpAnalytics = {
  days: number;
  access: { trends: boolean; searches: boolean; askAi: boolean };
  /** All-time counters, shown on every plan. */
  totals: { published: number; views: number; helpful: number; notHelpful: number };
  range: HelpRangeTotals | null;
  /** The same-length period just before `range`, for change indicators. */
  previous: HelpRangeTotals | null;
  series: HelpDayTotals[] | null;
  /** The previous period, day by day and aligned by index with `series`. */
  previousSeries: HelpDayTotals[] | null;
  topArticles: HelpArticleStat[] | null;
  needsWork: HelpArticleStat[] | null;
  topSearches: HelpSearchStat[] | null;
  gaps: HelpSearchStat[] | null;
  ai: { used: number; limit: number } | null;
};

function lastDays(days: number) {
  const out: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) out.push(utcDay(new Date(now - i * 86_400_000)));
  return out;
}

const n = (value: unknown) => Number(value ?? 0);

export type HelpAnalyticsAccess = HelpAnalytics["access"];

/** Which analytics sections a plan includes. */
export function helpAnalyticsAccess(plan: string): HelpAnalyticsAccess {
  const limits = getPlanLimits(plan);
  return {
    trends: limits.allowHelpAnalytics,
    searches: limits.allowHelpSearchInsights,
    askAi: limits.monthlyHelpAiAnswers > 0,
  };
}

/** Help center analytics for the admin page; sections a plan doesn't include come back null. */
export async function getHelpAnalytics(
  db: Db,
  workspaceId: string,
  plan: string,
  days: number,
): Promise<HelpAnalytics> {
  const limits = getPlanLimits(plan);
  const access = helpAnalyticsAccess(plan);

  const [totalsRow] = await db
    .select({
      published: sql<number>`count(*) filter (where ${helpArticle.status} = 'published')::int`,
      views: sql<number>`coalesce(sum(${helpArticle.viewCount}), 0)::int`,
      helpful: sql<number>`coalesce(sum(${helpArticle.helpfulCount}), 0)::int`,
      notHelpful: sql<number>`coalesce(sum(${helpArticle.notHelpfulCount}), 0)::int`,
    })
    .from(helpArticle)
    .where(eq(helpArticle.workspaceId, workspaceId));
  const totals = {
    published: n(totalsRow?.published),
    views: n(totalsRow?.views),
    helpful: n(totalsRow?.helpful),
    notHelpful: n(totalsRow?.notHelpful),
  };

  const empty: HelpAnalytics = {
    days,
    access,
    totals,
    range: null,
    previous: null,
    series: null,
    previousSeries: null,
    topArticles: null,
    needsWork: null,
    topSearches: null,
    gaps: null,
    ai: null,
  };
  if (!access.trends) return empty;

  const windowDays = lastDays(days * 2);
  const dayList = windowDays.slice(days);
  const previousDays = windowDays.slice(0, days);
  const start = dayList[0]!;
  const inRange = and(eq(helpArticleDaily.workspaceId, workspaceId), gte(helpArticleDaily.day, start));
  // Daily totals cover both periods so the page can show change against the previous one.
  const inWindow = and(
    eq(helpArticleDaily.workspaceId, workspaceId),
    gte(helpArticleDaily.day, windowDays[0]!),
  );
  const searchesInRange = and(
    eq(helpSearchDaily.workspaceId, workspaceId),
    gte(helpSearchDaily.day, start),
  );
  const searchesInWindow = and(
    eq(helpSearchDaily.workspaceId, workspaceId),
    gte(helpSearchDaily.day, windowDays[0]!),
  );

  const [dailyViews, topRows, needsWorkRows, searchDaily, searchRows, gapRows, aiUsed] =
    await Promise.all([
      db
        .select({
          day: helpArticleDaily.day,
          views: sql<number>`sum(${helpArticleDaily.views})::int`,
          helpful: sql<number>`sum(${helpArticleDaily.helpful})::int`,
          notHelpful: sql<number>`sum(${helpArticleDaily.notHelpful})::int`,
        })
        .from(helpArticleDaily)
        .where(inWindow)
        .groupBy(helpArticleDaily.day),
      db
        .select({
          id: helpArticle.id,
          title: helpArticle.title,
          slug: helpArticle.slug,
          views: sql<number>`sum(${helpArticleDaily.views})::int`,
          helpful: sql<number>`sum(${helpArticleDaily.helpful})::int`,
          notHelpful: sql<number>`sum(${helpArticleDaily.notHelpful})::int`,
        })
        .from(helpArticleDaily)
        .innerJoin(helpArticle, eq(helpArticleDaily.articleId, helpArticle.id))
        .where(inRange)
        .groupBy(helpArticle.id)
        .orderBy(sql`sum(${helpArticleDaily.views}) desc`)
        .limit(8),
      // All-time votes: a single range rarely has enough to judge an article.
      db
        .select({
          id: helpArticle.id,
          title: helpArticle.title,
          slug: helpArticle.slug,
          views: helpArticle.viewCount,
          helpful: helpArticle.helpfulCount,
          notHelpful: helpArticle.notHelpfulCount,
        })
        .from(helpArticle)
        .where(
          and(
            eq(helpArticle.workspaceId, workspaceId),
            eq(helpArticle.status, "published"),
            gt(helpArticle.notHelpfulCount, 0),
          ),
        )
        .orderBy(
          sql`${helpArticle.notHelpfulCount}::float / (${helpArticle.helpfulCount} + ${helpArticle.notHelpfulCount}) desc`,
          desc(helpArticle.notHelpfulCount),
        )
        .limit(5),
      access.searches
        ? db
            .select({
              day: helpSearchDaily.day,
              searches: sql<number>`sum(${helpSearchDaily.count})::int`,
              gaps: sql<number>`(sum(${helpSearchDaily.count}) filter (where ${helpSearchDaily.results} = 0))::int`,
            })
            .from(helpSearchDaily)
            .where(searchesInWindow)
            .groupBy(helpSearchDaily.day)
        : Promise.resolve([]),
      access.searches
        ? db
            .select({
              query: helpSearchDaily.query,
              source: helpSearchDaily.source,
              count: sql<number>`sum(${helpSearchDaily.count})::int`,
              results: sql<number>`(array_agg(${helpSearchDaily.results} order by ${helpSearchDaily.day} desc))[1]`,
            })
            .from(helpSearchDaily)
            .where(and(searchesInRange, eq(helpSearchDaily.source, "search")))
            .groupBy(helpSearchDaily.query, helpSearchDaily.source)
            .orderBy(sql`sum(${helpSearchDaily.count}) desc`)
            .limit(10)
        : Promise.resolve([]),
      access.searches
        ? db
            .select({
              query: helpSearchDaily.query,
              source: helpSearchDaily.source,
              count: sql<number>`sum(${helpSearchDaily.count})::int`,
              results: sql<number>`0`,
            })
            .from(helpSearchDaily)
            .where(and(searchesInRange, eq(helpSearchDaily.results, 0)))
            .groupBy(helpSearchDaily.query, helpSearchDaily.source)
            .orderBy(sql`sum(${helpSearchDaily.count}) desc`)
            .limit(10)
        : Promise.resolve([]),
      access.askAi ? getHelpAiUsage(workspaceId) : Promise.resolve(0),
    ]);

  const viewsByDay = new Map<string, { views: number; helpful: number; notHelpful: number }>(
    dailyViews.map((row: { day: string; views: number; helpful: number; notHelpful: number }) => [
      row.day,
      { views: n(row.views), helpful: n(row.helpful), notHelpful: n(row.notHelpful) },
    ]),
  );
  const searchesByDay = new Map<string, { searches: number; gaps: number }>(
    searchDaily.map((row: { day: string; searches: number; gaps: number }) => [
      row.day,
      { searches: n(row.searches), gaps: n(row.gaps) },
    ]),
  );
  const dayTotals = (day: string) => {
    const views = viewsByDay.get(day);
    const searches = searchesByDay.get(day);
    return {
      views: views?.views ?? 0,
      helpful: views?.helpful ?? 0,
      notHelpful: views?.notHelpful ?? 0,
      searches: searches?.searches ?? 0,
      gaps: searches?.gaps ?? 0,
    };
  };
  const series = dayList.map((day) => ({ day, ...dayTotals(day) }));
  const previousSeries = previousDays.map((day) => ({ day, ...dayTotals(day) }));
  const totalOf = (list: string[]): HelpRangeTotals =>
    list.map(dayTotals).reduce(
      (total, d) => ({
        views: total.views + d.views,
        helpful: total.helpful + d.helpful,
        notHelpful: total.notHelpful + d.notHelpful,
        searches: total.searches + d.searches,
        gaps: total.gaps + d.gaps,
      }),
      { views: 0, helpful: 0, notHelpful: 0, searches: 0, gaps: 0 },
    );

  const toArticle = (row: HelpArticleStat) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    views: n(row.views),
    helpful: n(row.helpful),
    notHelpful: n(row.notHelpful),
  });
  const toSearch = (row: HelpSearchStat) => ({
    query: row.query,
    source: row.source,
    count: n(row.count),
    results: n(row.results),
  });

  return {
    ...empty,
    range: totalOf(dayList),
    previous: totalOf(previousDays),
    series,
    previousSeries,
    topArticles: topRows.map(toArticle),
    needsWork: needsWorkRows.map(toArticle),
    topSearches: access.searches ? searchRows.map(toSearch) : null,
    gaps: access.searches ? gapRows.map(toSearch) : null,
    ai: access.askAi ? { used: n(aiUsed), limit: limits.monthlyHelpAiAnswers } : null,
  };
}
