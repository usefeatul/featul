import { eq, sql } from "drizzle-orm";
import { helpCenter } from "@featul/db";
import { getPlanLimits } from "../../shared/plan";

type Db = any;

const monthOf = (date = new Date()) => date.toISOString().slice(0, 7);

export type HelpImportUsage = {
  /** "total" for the free setup scan, "month" for paid plans. */
  window: "total" | "month";
  used: number;
  limit: number;
  remaining: number;
  maxPages: number;
  maxArticles: number;
  site: string | null;
  repo: string | null;
  lastImportAt: Date | null;
};

export async function getHelpImportUsage(db: Db, workspaceId: string, plan: string): Promise<HelpImportUsage> {
  const limits = getPlanLimits(plan);
  const [row] = await db.select().from(helpCenter).where(eq(helpCenter.workspaceId, workspaceId)).limit(1);
  const monthly = limits.helpImportsPerMonth !== null;
  const used = monthly
    ? row?.importMonth === monthOf()
      ? Number(row?.importsThisMonth ?? 0)
      : 0
    : Number(row?.importsTotal ?? 0);
  const limit = (monthly ? limits.helpImportsPerMonth : limits.helpImportsTotal) ?? 0;
  return {
    window: monthly ? "month" : "total",
    used,
    limit,
    remaining: Math.max(0, limit - used),
    maxPages: limits.helpImportMaxPages,
    maxArticles: limits.helpImportMaxArticles,
    site: row?.importSiteUrl ?? null,
    repo: row?.importRepoUrl ?? null,
    lastImportAt: row?.lastImportAt ?? null,
  };
}

/**
 * Atomically counts a scan against the plan and remembers its sources. Returns false when the
 * plan's allowance is used up. Counted before scanning, since a failed run still costs a model call.
 */
export async function reserveHelpImport(
  db: Db,
  input: { workspaceId: string; plan: string; site: string | null; repo: string | null },
): Promise<boolean> {
  const limits = getPlanLimits(input.plan);
  const month = monthOf();
  await db.insert(helpCenter).values({ workspaceId: input.workspaceId }).onConflictDoNothing();
  const monthly = limits.helpImportsPerMonth !== null;
  const limit = (monthly ? limits.helpImportsPerMonth : limits.helpImportsTotal) ?? 0;
  const withinLimit = monthly
    ? sql`(${helpCenter.importMonth} is distinct from ${month} or ${helpCenter.importsThisMonth} < ${limit})`
    : sql`${helpCenter.importsTotal} < ${limit}`;
  const updated = await db
    .update(helpCenter)
    .set({
      importsThisMonth: sql`case when ${helpCenter.importMonth} = ${month} then ${helpCenter.importsThisMonth} + 1 else 1 end`,
      importMonth: month,
      importsTotal: sql`${helpCenter.importsTotal} + 1`,
      lastImportAt: new Date(),
      importSiteUrl: input.site,
      importRepoUrl: input.repo,
      updatedAt: new Date(),
    })
    .where(sql`${helpCenter.workspaceId} = ${input.workspaceId} and ${withinLimit}`)
    .returning({ workspaceId: helpCenter.workspaceId });
  return updated.length > 0;
}
