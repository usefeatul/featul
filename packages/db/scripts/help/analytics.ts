import { and, eq, sql } from "drizzle-orm";
import { db, helpArticle, helpArticleDaily, helpSearchDaily, workspace } from "../../index";

/**
 * Fills a workspace's help center analytics with ~180 days of mock traffic, enough for the
 * 90-day range and the period before it. Views grow over time with weekday seasonality and
 * a few launch spikes; searches include content gaps and AI questions.
 * Replaces the workspace's existing daily stats and resets article counters to match.
 *
 *   bun scripts/help/analytics.ts <workspace slug or id> [--publish]
 *
 * --publish publishes the workspace's draft articles first, so more articles get traffic.
 */

const DAYS = 180;

if ((process.env.DATABASE_URL ?? "").includes("orange-darkness")) {
  throw new Error("Refusing to seed mock analytics into the production database.");
}

/** Seeded so reruns produce the same charts. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261020);

/** Poisson sample (Knuth for small means, normal approximation above). */
function poisson(mean: number) {
  if (mean <= 0) return 0;
  if (mean > 30) {
    const u = 1 - rand();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
    return Math.max(0, Math.round(mean + z * Math.sqrt(mean)));
  }
  const limit = Math.exp(-mean);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rand();
  } while (p > limit);
  return k - 1;
}

const utcDay = (date: Date) => date.toISOString().slice(0, 10);

/** Visitor searches; `hit: false` queries have no matching article and show up as gaps. */
const SEARCHES: { query: string; weight: number; hit: boolean }[] = [
  { query: "install script", weight: 30, hit: true },
  { query: "stripe", weight: 24, hit: true },
  { query: "gdpr", weight: 18, hit: true },
  { query: "real-time", weight: 16, hit: true },
  { query: "cookies", weight: 15, hit: true },
  { query: "shopify", weight: 14, hit: true },
  { query: "polar", weight: 11, hit: true },
  { query: "pricing", weight: 11, hit: true },
  { query: "funnels", weight: 9, hit: true },
  { query: "revenue", weight: 8, hit: true },
  { query: "identify users", weight: 7, hit: true },
  { query: "custom events", weight: 7, hit: true },
  { query: "next.js", weight: 6, hit: true },
  { query: "visitor journeys", weight: 5, hit: true },
  { query: "consent banner", weight: 4, hit: true },
  { query: "webflow", weight: 10, hit: false },
  { query: "wordpress plugin", weight: 9, hit: false },
  { query: "import google analytics", weight: 8, hit: false },
  { query: "ad blocker", weight: 7, hit: false },
  { query: "framer", weight: 6, hit: false },
  { query: "delete account", weight: 4, hit: false },
  { query: "refund", weight: 3, hit: false },
  { query: "react native", weight: 3, hit: false },
  { query: "zapier", weight: 2, hit: false },
];

const QUESTIONS: { query: string; weight: number; hit: boolean }[] = [
  { query: "how do i add seline to my website?", weight: 12, hit: true },
  { query: "is seline gdpr compliant?", weight: 9, hit: true },
  { query: "how do i connect stripe revenue?", weight: 8, hit: true },
  { query: "does seline use cookies?", weight: 7, hit: true },
  { query: "what does the real-time dashboard show?", weight: 5, hit: true },
  { query: "can i track revenue from polar?", weight: 4, hit: true },
  { query: "how do i exclude my own visits?", weight: 6, hit: false },
  { query: "can i import my google analytics history?", weight: 5, hit: false },
  { query: "does seline track across subdomains?", weight: 4, hit: false },
  { query: "is there an api to export my data?", weight: 3, hit: false },
];

async function main() {
  const target = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!target) throw new Error("Usage: bun scripts/help/analytics.ts <workspace slug or id> [--publish]");

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name })
    .from(workspace)
    .where(sql`${workspace.id} = ${target} or ${workspace.slug} = ${target}`)
    .limit(1);
  if (!ws) throw new Error(`Workspace ${target} not found`);

  if (process.argv.includes("--publish")) {
    await db
      .update(helpArticle)
      .set({ status: "published", publishedAt: new Date(Date.now() - DAYS * 86_400_000) })
      .where(and(eq(helpArticle.workspaceId, ws.id), eq(helpArticle.status, "draft")));
  }

  const articles = await db
    .select({ id: helpArticle.id, title: helpArticle.title })
    .from(helpArticle)
    .where(and(eq(helpArticle.workspaceId, ws.id), eq(helpArticle.status, "published")))
    .orderBy(helpArticle.position);
  if (articles.length === 0) throw new Error(`"${ws.name}" has no published articles to attach views to.`);

  // Long-tail popularity, with per-article vote behavior. The last two articles read poorly
  // so the "needs work" list has something to show.
  const profiles = articles.map((article, i) => ({
    id: article.id,
    weight: 1 / Math.pow(i + 1, 0.8),
    helpfulRate: 0.06 + rand() * 0.08,
    notHelpfulRate: i >= articles.length - 2 && articles.length > 2 ? 0.04 + rand() * 0.03 : 0.004 + rand() * 0.012,
  }));
  const weightSum = profiles.reduce((sum, p) => sum + p.weight, 0);

  const now = Date.now();
  const hourShare = new Date().getUTCHours() / 24;
  const spikes = new Map([
    [150, 2.6],
    [96, 1.8],
    [41, 2.2],
    [12, 1.6],
  ]);
  const articleRows: (typeof helpArticleDaily.$inferInsert)[] = [];
  const searchRows: (typeof helpSearchDaily.$inferInsert)[] = [];
  const searchWeight = SEARCHES.reduce((sum, s) => sum + s.weight, 0);
  const questionWeight = QUESTIONS.reduce((sum, s) => sum + s.weight, 0);

  for (let ago = DAYS - 1; ago >= 0; ago--) {
    const date = new Date(now - ago * 86_400_000);
    const day = utcDay(date);
    const weekday = date.getUTCDay();
    const growth = 70 + 190 * Math.pow((DAYS - ago) / DAYS, 1.4);
    const season = weekday === 0 || weekday === 6 ? 0.55 : weekday === 1 ? 1.1 : 1;
    const spike = spikes.get(ago) ?? (spikes.get(ago + 1) ? 1.35 : 1);
    // Today is still in progress.
    const partial = ago === 0 ? Math.max(hourShare, 0.15) : 1;
    const volume = growth * season * spike * partial * (0.88 + rand() * 0.24);

    for (const p of profiles) {
      const views = poisson((volume * p.weight) / weightSum);
      if (views === 0) continue;
      articleRows.push({
        articleId: p.id,
        workspaceId: ws.id,
        day,
        views,
        helpful: poisson(views * p.helpfulRate),
        notHelpful: poisson(views * p.notHelpfulRate),
      });
    }

    // Searches grow a little faster than views as more visitors find the search box.
    const searchVolume = volume * (0.22 + 0.12 * ((DAYS - ago) / DAYS));
    for (const s of SEARCHES) {
      const count = poisson((searchVolume * s.weight) / searchWeight);
      if (count === 0) continue;
      searchRows.push({
        workspaceId: ws.id,
        day,
        source: "search",
        query: s.query,
        count,
        results: s.hit ? 1 + Math.floor(rand() * Math.min(articles.length, 4)) : 0,
      });
    }
    // Ask AI launched mid-period, so the earlier range has none.
    if (ago < 75) {
      const askVolume = volume * 0.07;
      for (const q of QUESTIONS) {
        const count = poisson((askVolume * q.weight) / questionWeight);
        if (count === 0) continue;
        searchRows.push({
          workspaceId: ws.id,
          day,
          source: "ai",
          query: q.query,
          count,
          results: q.hit ? 1 + Math.floor(rand() * Math.min(articles.length, 3)) : 0,
        });
      }
    }
  }

  await db.delete(helpArticleDaily).where(eq(helpArticleDaily.workspaceId, ws.id));
  await db.delete(helpSearchDaily).where(eq(helpSearchDaily.workspaceId, ws.id));
  for (let i = 0; i < articleRows.length; i += 500) {
    await db.insert(helpArticleDaily).values(articleRows.slice(i, i + 500));
  }
  for (let i = 0; i < searchRows.length; i += 500) {
    await db.insert(helpSearchDaily).values(searchRows.slice(i, i + 500));
  }

  // All-time counters match the daily rows; unpublished articles go back to zero.
  await db
    .update(helpArticle)
    .set({ viewCount: 0, helpfulCount: 0, notHelpfulCount: 0 })
    .where(eq(helpArticle.workspaceId, ws.id));
  for (const p of profiles) {
    const rows = articleRows.filter((row) => row.articleId === p.id);
    await db
      .update(helpArticle)
      .set({
        viewCount: rows.reduce((sum, row) => sum + (row.views ?? 0), 0),
        helpfulCount: rows.reduce((sum, row) => sum + (row.helpful ?? 0), 0),
        notHelpfulCount: rows.reduce((sum, row) => sum + (row.notHelpful ?? 0), 0),
      })
      .where(eq(helpArticle.id, p.id));
  }

  const views = articleRows.reduce((sum, row) => sum + (row.views ?? 0), 0);
  const searches = searchRows.reduce((sum, row) => sum + (row.count ?? 0), 0);
  console.log(
    `Seeded ${DAYS} days of help analytics into "${ws.name}": ${articles.length} articles, ` +
      `${views.toLocaleString()} views, ${searches.toLocaleString()} searches and questions.`,
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
