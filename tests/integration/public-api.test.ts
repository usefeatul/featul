import { expect, mock, test } from "bun:test";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { eq } from "drizzle-orm";

// Runs against a disposable local Postgres loaded with the current schema
// (`bunx drizzle-kit export --sql` from packages/db), e.g. TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/featul_test
const url = process.env.TEST_DATABASE_URL;
const local = Boolean(url && ["localhost", "127.0.0.1"].includes(new URL(url).hostname));
const ROOT = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
process.env.DATABASE_URL ??= "postgresql://unused@127.0.0.1:1/unused";
process.env.API_RATE_LIMIT_ENABLED = "false";

const schema = await import(`${ROOT}/packages/db/schema/index.ts`);
const db = drizzle({ client: new SQL(local ? url! : "postgres://unused@127.0.0.1:1/unused"), schema });
mock.module(`${ROOT}/packages/db/index.ts`, () => ({ ...schema, db }));

let plan = "starter";
mock.module(`${ROOT}/packages/auth/src/billing.ts`, () => ({ getEffectiveWorkspacePlan: async () => plan }));

const procedure = { input: () => procedure, get: (fn: unknown) => fn, post: (fn: unknown) => fn };
mock.module(`${ROOT}/packages/api/src/jstack.ts`, () => ({
  j: { router: (routes: unknown) => routes },
  privateProcedure: procedure,
  publicProcedure: procedure,
}));

const list = await import(`${ROOT}/apps/app/src/app/api/v1/changelog/route.ts`);
const one = await import(`${ROOT}/apps/app/src/app/api/v1/changelog/[id]/route.ts`);
const { createApiKeyRouter } = await import(`${ROOT}/packages/api/src/router/api-key.ts`);
const { user, workspace, workspaceMember, board, changelogEntry, workspaceApiKey, activityLog } = schema;

const run = crypto.randomUUID().slice(0, 8);
const ids = { owner: `owner-${run}`, admin: `admin-${run}`, ws: `ws-${run}`, ws2: `ws2-${run}` };
const base = "http://localhost:3000/api/v1/changelog";
const c = { superjson: (v: unknown) => v, header() {} };
const router = createApiKeyRouter() as any;

function req(path: string, key: string | null, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (key) headers.set("authorization", `Bearer ${key}`);
  if (init.body) headers.set("content-type", "application/json");
  return new Request(base + path, { ...init, headers });
}
async function call(handler: any, request: Request, params?: Record<string, string>) {
  const res: Response = await handler(request, params ? { params: Promise.resolve(params) } : undefined);
  return { status: res.status, body: (await res.json()) as any };
}

async function seed() {
  const now = new Date();
  await db.insert(user).values([
    { id: ids.owner, name: "Owner", email: `${ids.owner}@example.invalid`, emailVerified: true, createdAt: now, updatedAt: now },
    { id: ids.admin, name: "Admin", email: `${ids.admin}@example.invalid`, emailVerified: true, createdAt: now, updatedAt: now },
  ]);
  for (const ws of [ids.ws, ids.ws2]) {
    await db.insert(workspace).values({ id: ws, name: "QA", slug: ws, domain: `${ws}.invalid`, ownerId: ids.owner, widgetSecret: "x" });
    await db.insert(board).values({
      id: `b-${ws}`, workspaceId: ws, name: "Changelog", slug: "changelog", createdBy: ids.owner, systemType: "changelog",
      changelogTags: [{ id: "t-fix", name: "Fix", slug: "fix", color: null }, { id: "t-new", name: "New feature", slug: "new-feature", color: null }],
    } as any);
  }
  await db.insert(workspaceMember).values({ workspaceId: ids.ws, userId: ids.admin, role: "admin", isActive: true } as any);
}

async function cleanup() {
  await db.delete(workspace).where(eq(workspace.ownerId, ids.owner));
  await db.delete(user).where(eq(user.id, ids.owner));
  await db.delete(user).where(eq(user.id, ids.admin));
}

test.skipIf(!local)("public changelog API: keys, upserts, validation, tenant isolation, plan gating, revocation", async () => {
  await seed();
  try {
    const adminCtx = { db, session: { user: { id: ids.admin } } };

    // Settings: create keys
    const created = await router.create({ ctx: adminCtx, input: { slug: ids.ws, name: "GitHub Actions" }, c });
    const key: string = created.key;
    expect(key.startsWith("ftl_")).toBe(true);
    const [stored] = await db.select().from(workspaceApiKey).where(eq(workspaceApiKey.id, created.id));
    expect(stored.keyHash).not.toContain(key);
    expect(stored.prefix).toBe(key.slice(0, 12));
    const listed = await router.list({ ctx: adminCtx, input: { slug: ids.ws }, c });
    expect(listed.keys).toHaveLength(1);
    expect(JSON.stringify(listed.keys)).not.toContain(key.slice(12));
    const otherKey: string = (await router.create({ ctx: { db, session: { user: { id: ids.owner } } }, input: { slug: ids.ws2, name: "other" }, c })).key;

    // Auth failures
    expect((await call(list.GET, req("", null))).status).toBe(401);
    expect((await call(list.GET, req("", "ftl_nope"))).status).toBe(401);
    expect((await call(list.GET, req("", "Bearer"))).status).toBe(401);

    // Create
    const body = { title: "v1.0.0", content: "## Fixes\n\n- Fixed **login**\n\n![x](data:image/png;base64,AAA)\n\n![Screenshot](https://cdn.example.com/s.png)", tags: ["fix", "New Feature"], status: "draft", externalId: "v1.0.0" };
    const first = await call(list.POST, req("", key, { method: "POST", body: JSON.stringify(body) }));
    expect(first.status).toBe(201);
    expect(first.body.data.tags).toEqual(["Fix", "New feature"]);
    expect(first.body.data.status).toBe("draft");
    expect(first.body.data.url).toBeNull();
    expect(first.body.data.summary).toContain("Fixed login");
    const [row] = await db.select().from(changelogEntry).where(eq(changelogEntry.id, first.body.data.id));
    expect(row.authorId).toBe(ids.admin);
    expect(JSON.stringify(row.content)).not.toContain("data:image");
    expect((row.content as any).content.at(-1)).toEqual({ type: "image", attrs: { src: "https://cdn.example.com/s.png", alt: "Screenshot" } });

    // Upsert same externalId: update, no duplicate, keeps body when content omitted
    const second = await call(list.POST, req("", key, { method: "POST", body: JSON.stringify({ title: "v1.0.0 — Login fixes", status: "published", externalId: "v1.0.0" }) }));
    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.status).toBe("published");
    expect(second.body.data.url).toBe(`https://${ids.ws}.featul.com/changelog/p/${row.slug}`);
    const [afterUpsert] = await db.select().from(changelogEntry).where(eq(changelogEntry.id, first.body.data.id));
    expect(JSON.stringify(afterUpsert.content)).toContain("login");

    // Concurrent creates with a new externalId produce one entry
    const racing = await Promise.all(
      [1, 2, 3].map(() => call(list.POST, req("", key, { method: "POST", body: JSON.stringify({ title: "race", externalId: "sha-abc" }) }))),
    );
    expect(racing.filter((r) => r.status === 201)).toHaveLength(1);
    expect(new Set(racing.map((r) => r.body.data.id)).size).toBe(1);

    // List / filter / get
    const all = await call(list.GET, req("?limit=1", key));
    expect(all.status).toBe(200);
    expect(all.body.data.entries).toHaveLength(1);
    expect(all.body.data.hasMore).toBe(true);
    const byExt = await call(list.GET, req("?externalId=v1.0.0", key));
    expect(byExt.body.data.entries.map((e: any) => e.id)).toEqual([first.body.data.id]);
    expect((await call(one.GET, req(`/${first.body.data.id}`, key), { id: first.body.data.id })).body.data.title).toBe("v1.0.0 — Login fixes");

    // Patch
    const patched = await call(one.PATCH, req(`/${racing[0].body.data.id}`, key, { method: "PATCH", body: JSON.stringify({ status: "published", tags: ["Fix"] }) }), { id: racing[0].body.data.id });
    expect(patched.status).toBe(200);
    expect(patched.body.data.publishedAt).not.toBeNull();
    expect((await call(one.PATCH, req("/x", key, { method: "PATCH", body: "{}" }), { id: "x" })).status).toBe(400);
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const noop = await call(one.PATCH, req(`/${first.body.data.id}`, key, { method: "PATCH", body: JSON.stringify({ scheduledAt: future }) }), { id: first.body.data.id });
    expect(noop.status).toBe(200);
    expect(noop.body.data.scheduledAt).toBeNull();

    // Validation
    const badTags = await call(list.POST, req("", key, { method: "POST", body: JSON.stringify({ title: "x", tags: ["Beta"] }) }));
    expect(badTags.status).toBe(400);
    expect(badTags.body.error.code).toBe("unknown_tags");
    expect((await call(list.POST, req("", key, { method: "POST", body: "{not json" }))).body.error.code).toBe("invalid_json");
    expect((await call(list.POST, req("", key, { method: "POST", body: JSON.stringify({ title: "" }) }))).status).toBe(400);
    expect((await call(list.POST, req("", key, { method: "POST", body: JSON.stringify({ title: "x", externalId: "has space" }) }))).status).toBe(400);

    // Tenant isolation: another workspace's key can't see or edit this entry
    expect((await call(one.GET, req(`/${first.body.data.id}`, otherKey), { id: first.body.data.id })).status).toBe(404);
    expect((await call(one.PATCH, req(`/${first.body.data.id}`, otherKey, { method: "PATCH", body: JSON.stringify({ title: "pwn" }) }), { id: first.body.data.id })).status).toBe(404);
    expect((await call(list.GET, req("", otherKey))).body.data.entries).toHaveLength(0);

    // Activity is logged as the key's creator
    const logs = await db.select().from(activityLog).where(eq(activityLog.workspaceId, ids.ws));
    expect(logs.some((l: any) => l.metadata?.via === "api" && l.userId === ids.admin)).toBe(true);

    // Plan gating
    plan = "free";
    const gated = await call(list.GET, req("", key));
    expect(gated.status).toBe(403);
    expect(gated.body.error.code).toBe("plan_required");
    await expect(router.create({ ctx: adminCtx, input: { slug: ids.ws, name: "x" }, c })).rejects.toThrow();
    plan = "starter";

    // Creator loses access → key stops working
    await db.update(workspaceMember).set({ isActive: false }).where(eq(workspaceMember.userId, ids.admin));
    expect((await call(list.GET, req("", key))).status).toBe(401);
    await db.update(workspaceMember).set({ isActive: true }).where(eq(workspaceMember.userId, ids.admin));
    expect((await call(list.GET, req("", key))).status).toBe(200);

    // Revoke
    await router.revoke({ ctx: adminCtx, input: { slug: ids.ws, keyId: created.id }, c });
    expect((await call(list.GET, req("", key))).status).toBe(401);
    // Another workspace's manager can't revoke this workspace's key
    const keep = await router.create({ ctx: adminCtx, input: { slug: ids.ws, name: "keep" }, c });
    await expect(router.revoke({ ctx: { db, session: { user: { id: ids.owner } } }, input: { slug: ids.ws2, keyId: keep.id }, c })).rejects.toThrow("API key not found");
  } finally {
    await cleanup();
  }
}, 30000);
