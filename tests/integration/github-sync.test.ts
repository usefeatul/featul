import { expect, mock, test } from "bun:test";
import { createHmac } from "node:crypto";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { and, eq } from "drizzle-orm";

// Runs against a disposable local Postgres loaded with the current schema
// (`bunx drizzle-kit export --sql` from packages/db), e.g. TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/featul_test
const url = process.env.TEST_DATABASE_URL;
const local = Boolean(url && ["localhost", "127.0.0.1"].includes(new URL(url).hostname));
const ROOT = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
process.env.DATABASE_URL ??= "postgresql://unused@127.0.0.1:1/unused";
process.env.API_RATE_LIMIT_ENABLED = "false";
process.env.GITHUB_WEBHOOK_SECRET = "test-webhook-secret";

const schema = await import(`${ROOT}/packages/db/schema/index.ts`);
const db = drizzle({ client: new SQL(local ? url! : "postgres://unused@127.0.0.1:1/unused"), schema });
mock.module(`${ROOT}/packages/db/index.ts`, () => ({ ...schema, db }));

let plan = "starter";
mock.module(`${ROOT}/packages/auth/src/billing.ts`, () => ({ getEffectiveWorkspacePlan: async () => plan }));

const notified: Array<{ postId: string; fromStatus: string | null; toStatus: string }> = [];
let notifyDelayMs = 0;
mock.module(`${ROOT}/packages/api/src/status/notify.ts`, () => ({
  notifyPostStatusChange: async (p: any) => {
    if (notifyDelayMs) await Bun.sleep(notifyDelayMs);
    notified.push({ postId: p.postId, fromStatus: p.fromStatus, toStatus: p.toStatus });
  },
}));

// GitHub's API is faked: repo permissions per login, and the issue listing used by "Sync".
const realGithub = await import(`${ROOT}/packages/api/src/services/github-app.ts`);
const permissions: Record<string, string> = { maintainer: "write", triager: "triage", rando: "read", contrib: "read" };
const permissionLookups: string[] = [];
let listing: Record<string, { issues: any[]; complete: boolean } | "error"> = {};
mock.module(`${ROOT}/packages/api/src/services/github-app.ts`, () => ({
  ...realGithub,
  getRepoPermission: async (_installationId: string, _repo: string, login: string) => {
    permissionLookups.push(login);
    return permissions[login] ?? "none";
  },
  listRepoIssues: async (_installationId: string, repo: string, maxPages: number) => {
    const result = listing[repo] ?? { issues: [], complete: true };
    if (result === "error") throw new Error("GitHub request failed (422)");
    return { ...result, pages: Math.min(maxPages, Math.max(1, Math.ceil(result.issues.length / 100))) };
  },
}));

const procedure = { input: () => procedure, get: (fn: unknown) => fn, post: (fn: unknown) => fn };
mock.module(`${ROOT}/packages/api/src/jstack.ts`, () => ({
  j: { router: (routes: unknown) => routes },
  privateProcedure: procedure,
  publicProcedure: procedure,
}));

const { createGithubRouter } = await import(`${ROOT}/packages/api/src/router/github.ts`);
const webhook = await import(`${ROOT}/apps/app/src/app/api/integrations/github/webhook/route.ts`);
const { listPostActivity } = await import(`${ROOT}/packages/api/src/post/activity.ts`);
const { user, workspace, workspaceMember, board, post, helpCenter, githubIssueLink, activityLog } = schema;

const run = crypto.randomUUID().slice(0, 8);
const ids = { owner: `o-${run}`, admin: `a-${run}`, member: `m-${run}`, ws: `ws-${run}`, ws2: `ws2-${run}` };
const c = { superjson: (v: unknown) => v, header() {} };
const router = createGithubRouter() as any;
const as = (userId: string) => ({ db, session: { user: { id: userId } } });

async function hook(event: string, payload: unknown, secret = "test-webhook-secret") {
  const body = JSON.stringify(payload);
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const response = await webhook.POST(
    new Request("http://localhost/api/integrations/github/webhook", {
      method: "POST",
      body,
      headers: { "x-github-event": event, "x-hub-signature-256": signature },
    }),
  );
  // Voter emails are sent after the response; let them run.
  await Bun.sleep(20);
  return response;
}

let body = "";
let clock = Date.parse("2026-10-01T00:00:00Z");
const tick = () => new Date((clock += 60_000)).toISOString();
const issueEvent = (
  action: string,
  installation: number,
  issue: Record<string, unknown> = {},
  who: { author?: string; sender?: string; senderType?: string } = {},
  extra: Record<string, unknown> = {},
) => ({
  action,
  installation: { id: installation },
  repository: { full_name: "Acme/App" },
  sender: { login: who.sender ?? who.author ?? "maintainer", type: who.senderType ?? "User" },
  ...(action === "opened" || action === "edited" ? { changes: { body: { from: "" } } } : {}),
  ...extra,
  issue: {
    number: 5,
    title: "Dark mode",
    html_url: "https://github.com/acme/app/issues/5",
    state: "open",
    state_reason: null,
    labels: [],
    body,
    user: { login: who.author ?? "maintainer" },
    updated_at: tick(),
    ...issue,
  },
});
const statusOf = async (postId: string) =>
  (await db.select({ s: post.roadmapStatus }).from(post).where(eq(post.id, postId)))[0]?.s;
const linkedPosts = async (workspaceId: string) =>
  (await db.select({ postId: githubIssueLink.postId }).from(githubIssueLink).where(eq(githubIssueLink.workspaceId, workspaceId)))
    .map((row: any) => row.postId)
    .sort();
const linkOf = async (postId: string) =>
  (await db.select().from(githubIssueLink).where(eq(githubIssueLink.postId, postId)))[0];
const enableStatus = () =>
  router.settingsUpdate({ ctx: as(ids.admin), input: { slug: ids.ws, autoStatus: true, openStatus: "planned", progressLabels: ["in progress"] }, c });

async function seed() {
  const now = new Date();
  await db.insert(user).values(
    [ids.owner, ids.admin, ids.member].map((id) => ({ id, name: id, email: `${id}@example.invalid`, emailVerified: true, createdAt: now, updatedAt: now })),
  );
  for (const [ws, installation, domain] of [[ids.ws, "111", "feedback.acme.io"], [ids.ws2, "222", null]] as const) {
    await db.insert(workspace).values({ id: ws, name: "QA", slug: ws, domain: `${ws}.invalid`, customDomain: domain, ownerId: ids.owner, widgetSecret: "x" });
    await db.insert(board).values({ id: `b-${ws}`, workspaceId: ws, name: "Feedback", slug: "feedback", createdBy: ids.owner } as any);
    await db.insert(board).values({ id: `b2-${ws}`, workspaceId: ws, name: "Bugs", slug: "bugs", createdBy: ids.owner } as any);
    await db.insert(helpCenter).values({ workspaceId: ws, githubInstallationId: installation, githubAccountLogin: "acme", githubRepos: ["acme/app", "acme/web"] } as any);
  }
  await db.insert(workspaceMember).values([
    { workspaceId: ids.ws, userId: ids.admin, role: "admin", isActive: true },
    { workspaceId: ids.ws, userId: ids.member, role: "member", isActive: true },
  ] as any);
  await db.insert(post).values([
    { id: `p1-${run}`, boardId: `b-${ids.ws}`, title: "Dark mode", content: "x", slug: "dark-mode", roadmapStatus: "pending" },
    { id: `p2-${run}`, boardId: `b-${ids.ws}`, title: "Night theme", content: "x", slug: "night-theme", roadmapStatus: "pending" },
    // Same slug on two boards: ambiguous, never linked
    { id: `p4-${run}`, boardId: `b-${ids.ws}`, title: "Export", content: "x", slug: "export", roadmapStatus: "pending" },
    { id: `p5-${run}`, boardId: `b2-${ids.ws}`, title: "Export bug", content: "x", slug: "export", roadmapStatus: "pending" },
    { id: `p3-${run}`, boardId: `b-${ids.ws2}`, title: "Other tenant", content: "x", slug: "dark-mode", roadmapStatus: "pending" },
  ] as any);
}

async function cleanup() {
  await db.delete(workspace).where(eq(workspace.ownerId, ids.owner));
  for (const id of [ids.owner, ids.admin, ids.member]) await db.delete(user).where(eq(user.id, id));
}

test.skipIf(!local)("webhooks: trusted senders link requests and drive their status", async () => {
  await seed();
  try {
    const [p1, p2, p3, p4] = [`p1-${run}`, `p2-${run}`, `p3-${run}`, `p4-${run}`];

    // Signature required
    expect((await hook("issues", issueEvent("opened", 111), "wrong")).status).toBe(401);

    // Unrelated issues cost no GitHub API call
    body = "no featul links";
    await hook("issues", issueEvent("opened", 111, { number: 99 }));
    expect(permissionLookups).toEqual([]);

    // Status updates are opt-in: links are made, statuses untouched
    body = `Users keep asking: https://${ids.ws}.featul.com/board/p/dark-mode\nalso https://app.featul.com/workspaces/${ids.ws}/requests/night-theme and https://${ids.ws}.featul.com/board/p/export`;
    let res = await hook("issues", issueEvent("opened", 111));
    expect(await res.json()).toEqual({ linked: 2, updated: 0, ignored: false });
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    expect(await statusOf(p1)).toBe("pending");
    expect(await linkedPosts(ids.ws2)).toEqual([]);

    // Members (not managers) can't change the integration
    await expect(router.settingsUpdate({ ctx: as(ids.member), input: { slug: ids.ws, autoStatus: true, openStatus: "planned", progressLabels: [] }, c })).rejects.toThrow("Forbidden");
    await enableStatus();

    // Labels and close reasons drive status once enabled
    res = await hook("issues", issueEvent("labeled", 111, { labels: [{ name: "In Progress" }] }));
    expect(await res.json()).toEqual({ linked: 0, updated: 2, ignored: false });
    expect([await statusOf(p1), await statusOf(p2), await statusOf(p4)]).toEqual(["progress", "progress", "pending"]);
    const activity = await listPostActivity(db as any, { postId: p1, surface: "workspace", offset: 0 }, ids.admin);
    expect(activity.items[0]!.actor.name).toBe("GitHub");

    // Replayed or out-of-order events are ignored
    await hook("issues", issueEvent("closed", 111, { state: "closed", state_reason: "not_planned", updated_at: "2026-01-01T00:00:00Z" }));
    expect(await statusOf(p1)).toBe("progress");

    // Someone without triage access can't move a linked request by closing the issue
    await hook("issues", issueEvent("closed", 111, { state: "closed", state_reason: "not_planned" }, { sender: "rando" }));
    expect(await statusOf(p1)).toBe("progress");
    // A bot installed on the repo can; so can a triager
    await hook("issues", issueEvent("closed", 111, { state: "closed", state_reason: "not_planned" }, { sender: "stale[bot]", senderType: "Bot" }));
    expect(await statusOf(p1)).toBe("closed");
    await hook("issues", issueEvent("reopened", 111, { state: "open", state_reason: "reopened" }, { sender: "triager" }));
    expect(await statusOf(p1)).toBe("planned");

    // Label/close events never re-read the description; only edits to the body do
    body = `Only https://feedback.acme.io/board/p/dark-mode now`;
    await hook("issues", issueEvent("labeled", 111, {}));
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    await hook("issues", issueEvent("edited", 111, {}, {}, { changes: { title: { from: "x" } } }));
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    await hook("issues", issueEvent("edited", 111));
    expect(await linkedPosts(ids.ws)).toEqual([p1]);

    // Outsiders can't link from their own issues, even after a maintainer labels it
    body = `https://${ids.ws}.featul.com/board/p/night-theme`;
    const outsiderIssue = { number: 6, html_url: "https://github.com/acme/app/issues/6" };
    res = await hook("issues", issueEvent("opened", 111, outsiderIssue, { author: "rando" }));
    expect((await res.json()).ignored).toBe(true);
    await hook("issues", issueEvent("labeled", 111, outsiderIssue, { author: "rando", sender: "maintainer" }));
    expect(await linkedPosts(ids.ws)).toEqual([p1]);
    // A maintainer editing the description of that issue does link it
    await hook("issues", issueEvent("edited", 111, outsiderIssue, { author: "rando", sender: "maintainer" }));
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    // (#6 is open with no labels, so p2 is now Planned)...
    expect(await statusOf(p2)).toBe("planned");
    // ...and its author still can't steer the status
    await hook("issues", issueEvent("closed", 111, { ...outsiderIssue, state: "closed", state_reason: "completed" }, { author: "rando" }));
    expect(await statusOf(p2)).toBe("planned");

    // Another installation's events never touch this workspace
    body = `https://${ids.ws}.featul.com/board/p/dark-mode`;
    await hook("issues", issueEvent("closed", 222, { state: "closed", state_reason: "completed" }));
    expect(await statusOf(p1)).toBe("planned");
    await hook("issues", issueEvent("deleted", 222));
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    expect(await statusOf(p3)).toBe("pending");

    // Plan downgrade stops webhooks
    plan = "free";
    await hook("issues", issueEvent("closed", 111, { state: "closed", state_reason: "completed" }));
    expect(await statusOf(p1)).toBe("planned");
    plan = "starter";

    // Settings list and unlink (scoped to the workspace, managers only)
    const { links } = await router.links({ ctx: as(ids.admin), input: { slug: ids.ws, offset: 0 }, c });
    const p1Link = links.find((l: any) => l.postTitle === "Dark mode");
    await expect(router.unlink({ ctx: as(ids.owner), input: { slug: ids.ws2, linkId: p1Link.id }, c })).rejects.toThrow("not found");
    await expect(router.unlink({ ctx: as(ids.member), input: { slug: ids.ws, linkId: p1Link.id }, c })).rejects.toThrow("Forbidden");
    await router.unlink({ ctx: as(ids.admin), input: { slug: ids.ws, linkId: p1Link.id }, c });
    expect(await linkedPosts(ids.ws)).toEqual([p2]);

    // Deleting the issue drops its links; a repo removed from the installation stops syncing
    await hook("issues", issueEvent("deleted", 111, outsiderIssue));
    expect(await linkedPosts(ids.ws)).toEqual([]);
    await hook("installation_repositories", { action: "removed", installation: { id: 111 }, repositories_removed: [{ full_name: "Acme/App" }] });
    expect((await db.select().from(helpCenter).where(eq(helpCenter.workspaceId, ids.ws)))[0]!.githubRepos).toEqual(["acme/web"]);
    await hook("installation", { action: "deleted", installation: { id: 111 } });
    expect((await db.select().from(helpCenter).where(eq(helpCenter.workspaceId, ids.ws)))[0]!.githubInstallationId).toBeNull();

    const githubLogs = await db.select().from(activityLog).where(and(eq(activityLog.workspaceId, ids.ws), eq(activityLog.entityId, p1)));
    expect(githubLogs.length).toBeGreaterThan(0);
    expect(githubLogs.every((log: any) => log.userId === null && log.metadata?.via === "github")).toBe(true);
  } finally {
    await cleanup();
  }
}, 30000);

test.skipIf(!local)("Sync: old mentions, missed closes, deleted issues, no flip-flopping, failures, paging", async () => {
  await seed();
  try {
    const [p1, p2, p4] = [`p1-${run}`, `p2-${run}`, `p4-${run}`];
    await enableStatus();
    const issue = (number: number, extra: Record<string, unknown> = {}) => ({
      number,
      title: `Issue ${number}`,
      html_url: `https://github.com/acme/app/issues/${number}`,
      state: "open",
      state_reason: null,
      labels: [],
      body: "",
      user: { login: "maintainer" },
      updated_at: tick(),
      ...extra,
    });

    // Webhooks linked p1 to #5 and p4 (made unambiguous) to #8
    body = `https://${ids.ws}.featul.com/board/p/dark-mode`;
    await hook("issues", issueEvent("opened", 111));
    await db.update(post).set({ slug: "export-unique" }).where(eq(post.id, p4));
    body = `https://app.featul.com/workspaces/${ids.ws}/requests/export-unique`;
    await hook("issues", issueEvent("opened", 111, { number: 8, html_url: "https://github.com/acme/app/issues/8" }));
    expect(await linkedPosts(ids.ws)).toEqual([p1, p4].sort());
    notified.length = 0;

    // GitHub now: #5 closed (missed webhook), #8 deleted, #7 mentions p2, #9 is an outsider's,
    // #3 is an older closed issue that also mentions p1, plus 300 unrelated issues. acme/web fails.
    const unrelated = Array.from({ length: 300 }, (_, i) => issue(100 + i, { body: "no links here" }));
    listing = {
      "acme/app": {
        complete: true,
        issues: [
          issue(5, { state: "closed", state_reason: "completed", body: `https://${ids.ws}.featul.com/board/p/dark-mode` }),
          issue(7, { body: `See https://${ids.ws}.featul.com/board/p/night-theme` }),
          issue(9, { body: `https://${ids.ws}.featul.com/board/p/night-theme`, user: { login: "rando" } }),
          ...unrelated,
          issue(3, { state: "closed", state_reason: "not_planned", body: `old: https://${ids.ws}.featul.com/board/p/dark-mode` }),
        ],
      },
      "acme/web": "error",
    };

    // Emails are slow; the sync answers before any of them go out.
    notifyDelayMs = 40;
    const summary = await router.sync({ ctx: as(ids.admin), input: { slug: ids.ws }, c });
    expect(notified).toHaveLength(0);
    await Bun.sleep(400);
    notifyDelayMs = 0;
    expect(summary).toEqual({ repos: 1, issues: 304, linked: 1, updated: 2, unlinked: 1, truncated: [], failed: ["acme/web"] });
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());
    // p1 stays on #5 (not taken over by old #3); p2 comes from #7, not the outsider's #9
    expect([(await linkOf(p1))!.issueNumber, (await linkOf(p2))!.issueNumber]).toEqual([5, 7]);
    expect([await statusOf(p1), await statusOf(p2)]).toEqual(["completed", "planned"]);
    expect(notified.map((n) => [n.postId, n.toStatus]).sort()).toEqual([[p1, "completed"], [p2, "planned"]].sort());

    // A second sync changes nothing and emails nobody
    notified.length = 0;
    const again = await router.sync({ ctx: as(ids.admin), input: { slug: ids.ws }, c });
    await Bun.sleep(50);
    expect([again.linked, again.updated, again.unlinked]).toEqual([0, 0, 0]);
    expect(notified).toHaveLength(0);

    // A partial read never unlinks, and says which repos were cut short
    listing = { "acme/app": { complete: false, issues: [issue(7, { body: `https://${ids.ws}.featul.com/board/p/night-theme` })] } };
    const partial = await router.sync({ ctx: as(ids.admin), input: { slug: ids.ws }, c });
    expect(partial.truncated).toEqual(["acme/app"]);
    expect(partial.unlinked).toBe(0);
    expect(await linkedPosts(ids.ws)).toEqual([p1, p2].sort());

    // Members, free plan, not connected
    await expect(router.sync({ ctx: as(ids.member), input: { slug: ids.ws }, c })).rejects.toThrow("Forbidden");
    plan = "free";
    await expect(router.sync({ ctx: as(ids.admin), input: { slug: ids.ws }, c })).rejects.toThrow("Starter or Professional");
    plan = "starter";
    await db.update(helpCenter).set({ githubInstallationId: null }).where(eq(helpCenter.workspaceId, ids.ws));
    await expect(router.sync({ ctx: as(ids.admin), input: { slug: ids.ws }, c })).rejects.toThrow("Connect GitHub first");

    // Paging: 60 links come back 50 + 10
    const extra = Array.from({ length: 58 }, (_, i) => ({ id: `px${i}-${run}`, boardId: `b-${ids.ws}`, title: `Req ${i}`, content: "x", slug: `req-${i}`, roadmapStatus: "pending" }));
    await db.insert(post).values(extra as any);
    await db.insert(githubIssueLink).values(
      extra.map((p, i) => ({ workspaceId: ids.ws, postId: p.id, repoFullName: "acme/app", issueNumber: 1000 + i, title: "t", url: "u", state: "open" as const })),
    );
    const first = await router.links({ ctx: as(ids.admin), input: { slug: ids.ws, offset: 0 }, c });
    expect([first.links.length, first.total, first.nextOffset]).toEqual([50, 60, 50]);
    const second = await router.links({ ctx: as(ids.admin), input: { slug: ids.ws, offset: 50 }, c });
    expect([second.links.length, second.nextOffset]).toEqual([10, null]);
    expect(new Set([...first.links, ...second.links].map((l: any) => l.id)).size).toBe(60);
  } finally {
    await cleanup();
  }
}, 30000);
