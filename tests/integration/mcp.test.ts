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
const db: any = drizzle({ client: new SQL(local ? url! : "postgres://unused@127.0.0.1:1/unused"), schema });
// Neon's `batch` (one transaction) isn't on bun-sql; tests/integration/comments.test.ts covers its atomicity.
db.batch = async (queries: Promise<unknown>[]) => {
  const results = [];
  for (const query of queries) results.push(await query);
  return results;
};
mock.module(`${ROOT}/packages/db/index.ts`, () => ({ ...schema, db }));
mock.module(`${ROOT}/packages/auth/src/billing.ts`, () => ({ getEffectiveWorkspacePlan: async () => "starter" }));
const statusChanges: unknown[] = [];
mock.module(`${ROOT}/packages/api/src/status/notify.ts`, () => ({
  notifyPostStatusChange: async (params: unknown) => void statusChanges.push(params),
}));

const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");
const mcpRoute = await import(`${ROOT}/apps/app/src/app/api/mcp/route.ts`);
const feedbackRoute = await import(`${ROOT}/apps/app/src/app/api/v1/feedback/route.ts`);
const feedbackOne = await import(`${ROOT}/apps/app/src/app/api/v1/feedback/[id]/route.ts`);
const { generateApiKey } = await import(`${ROOT}/packages/api/src/public-api/keys.ts`);
const { user, workspace, workspaceMember, board, post, tag, postTag, comment, changelogEntry, workspaceApiKey, activityLog } = schema;

const run = crypto.randomUUID().slice(0, 8);
const ids = { owner: `owner-${run}`, ws: `ws-${run}`, ws2: `ws2-${run}` };
const endpoint = "http://api.localhost:3000/mcp";

async function createKey(workspaceId: string, scopes?: string[]) {
  const { key, keyHash, prefix } = generateApiKey();
  await db.insert(workspaceApiKey).values({
    workspaceId,
    name: "mcp",
    prefix,
    keyHash,
    scopes: scopes ?? ["changelog:read", "changelog:write", "feedback:read", "feedback:write"],
    createdBy: ids.owner,
  });
  return key;
}

/** An MCP SDK client whose HTTP requests go straight to the route handler. */
async function connect(key: string) {
  const client = new Client({ name: "test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    requestInit: { headers: { authorization: `Bearer ${key}` } },
    fetch: async (input: string | URL | Request, init?: RequestInit) => {
      const request = new Request(input, init);
      const handler = (mcpRoute as any)[request.method];
      return handler(request);
    },
  });
  await client.connect(transport);
  return client;
}

async function call(client: any, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  const raw: string = result.content[0].text;
  // The SDK rejects arguments that don't match a tool's schema with a plain-text error.
  const data = raw.startsWith("{") ? JSON.parse(raw) : { error: { code: "invalid_arguments", message: raw } };
  return { isError: Boolean(result.isError), data };
}

async function seed() {
  const now = new Date();
  await db.insert(user).values({ id: ids.owner, name: "Owner", email: `${ids.owner}@example.invalid`, emailVerified: true, createdAt: now, updatedAt: now });
  for (const ws of [ids.ws, ids.ws2]) {
    await db.insert(workspace).values({ id: ws, name: "QA", slug: ws, domain: `${ws}.invalid`, ownerId: ids.owner, widgetSecret: "x" });
    await db.insert(board).values([
      { id: `bc-${ws}`, workspaceId: ws, name: "Changelog", slug: "changelog", createdBy: ids.owner, systemType: "changelog", isSystem: true, changelogTags: [{ id: "t-new", name: "New", slug: "new" }] },
      { id: `bf-${ws}`, workspaceId: ws, name: "Features", slug: "features", createdBy: ids.owner },
      { id: `bb-${ws}`, workspaceId: ws, name: "Bugs", slug: "bugs", createdBy: ids.owner },
    ] as any);
    await db.insert(tag).values([
      { id: `tag-ui-${ws}`, workspaceId: ws, name: "UI", slug: "ui" },
      { id: `tag-perf-${ws}`, workspaceId: ws, name: "Performance", slug: "performance" },
    ]);
  }
  const at = (minutes: number) => new Date(Date.now() - minutes * 60_000);
  await db.insert(post).values([
    { id: `p1-${run}`, boardId: `bf-${ids.ws}`, title: "Dark mode", content: "<p>Please add a dark theme</p>", slug: "dark-mode", roadmapStatus: "pending", upvotes: 5, createdAt: at(30) },
    { id: `p2-${run}`, boardId: `bf-${ids.ws}`, title: "Night theme please", content: "<p>My eyes hurt at night</p>", slug: "night-theme", roadmapStatus: null, upvotes: 2, createdAt: at(20) },
    { id: `p3-${run}`, boardId: `bb-${ids.ws}`, title: "Slow dashboard", content: "Takes 10s to load", slug: "slow", roadmapStatus: "completed", upvotes: 9, createdAt: at(10) },
    { id: `p4-${run}`, boardId: `bf-${ids.ws2}`, title: "Other workspace", content: "secret", slug: "other", roadmapStatus: "pending" },
  ] as any);
  await db.insert(postTag).values({ postId: `p3-${run}`, tagId: `tag-perf-${ids.ws}` });
  await db.insert(comment).values([
    { postId: `p2-${run}`, content: "+1 from me", authorName: "Sam" },
    { postId: `p3-${run}`, content: "Fixed by caching", authorId: ids.owner, authorName: "Owner", isInternal: true },
  ] as any);
  await db.insert(workspaceMember).values({ workspaceId: ids.ws, userId: ids.owner, role: "owner", isActive: true } as any);
}

async function cleanup() {
  await db.delete(workspace).where(eq(workspace.ownerId, ids.owner));
  await db.delete(user).where(eq(user.id, ids.owner));
}

test.skipIf(!local)("MCP server: auth, tools, triage, merge, changelog drafts, tenant isolation, scopes", async () => {
  await seed();
  try {
    const key = await createKey(ids.ws);

    // Unauthenticated requests never reach the MCP server
    const anonymous = await mcpRoute.POST(new Request(endpoint, { method: "POST", body: "{}" }));
    expect(anonymous.status).toBe(401);
    // Stateless: no SSE stream or sessions, so clients don't loop reconnecting to GET
    for (const method of ["GET", "DELETE"] as const) {
      const res = await (mcpRoute as any)[method](new Request(endpoint, { method, headers: { authorization: `Bearer ${key}` } }));
      expect([res.status, res.headers.get("allow")]).toEqual([405, "POST"]);
    }

    const client = await connect(key);
    expect(client.getServerVersion()?.name).toBe("featul");
    expect(client.getInstructions()).toContain("drafts");
    const { tools } = await client.listTools();
    expect(tools.map((t: any) => t.name).sort()).toEqual([
      "add_feedback_comment", "create_changelog_draft", "get_changelog_entry", "get_feedback", "get_workspace_overview",
      "list_changelog_entries", "list_feedback", "merge_feedback", "update_changelog_draft", "update_feedback",
    ]);
    expect(tools.find((t: any) => t.name === "merge_feedback")?.annotations?.destructiveHint).toBe(true);
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p: any) => p.name).sort()).toEqual(["draft_changelog", "triage_feedback"]);
    const prompt = await client.getPrompt({ name: "triage_feedback", arguments: { board: "features" } });
    expect((prompt.messages[0].content as any).text).toContain(`board ["features"]`);

    // Overview: feedback boards only, statuses with counts (null status counts as pending), tags
    const overview = await call(client, "get_workspace_overview");
    expect(overview.data.boards.map((b: any) => b.slug).sort()).toEqual(["bugs", "features"]);
    expect(overview.data.statuses.find((s: any) => s.id === "pending").count).toBe(2);
    expect(overview.data.tags.map((t: any) => t.name)).toEqual(["Performance", "UI"]);
    expect(overview.data.changelogTags).toEqual([{ name: "New", slug: "new" }]);

    // List + filters
    const pending = await call(client, "list_feedback", { status: ["pending"] });
    expect(pending.data.posts.map((p: any) => p.id).sort()).toEqual([`p1-${run}`, `p2-${run}`]);
    expect(pending.data.posts[0].excerpt).not.toContain("<p>");
    expect(pending.data.posts[0].url).toBe(`https://${ids.ws}.featul.com/board/p/night-theme`);
    expect((await call(client, "list_feedback", { untagged: true })).data.posts).toHaveLength(2);
    expect((await call(client, "list_feedback", { tag: ["performance"] })).data.posts.map((p: any) => p.id)).toEqual([`p3-${run}`]);
    expect((await call(client, "list_feedback", { search: "eyes" })).data.posts.map((p: any) => p.id)).toEqual([`p2-${run}`]);
    expect((await call(client, "list_feedback", { sort: "votes", limit: 1 })).data).toMatchObject({ posts: [{ id: `p3-${run}` }], hasMore: true });
    expect((await call(client, "list_feedback", { board: ["bugs"] })).data.posts).toHaveLength(1);
    const badTag = await call(client, "list_feedback", { tag: ["Nope"] });
    expect(badTag.isError).toBe(true);
    expect(badTag.data.error.message).toContain("Available tags: Performance, UI");

    // Get: full content and comments, internal notes flagged
    const p3 = await call(client, "get_feedback", { id: `p3-${run}` });
    expect(p3.data.content).toBe("Takes 10s to load");
    expect(p3.data.comments).toMatchObject([{ content: "Fixed by caching", internal: true }]);

    // Triage: status + tags, logged as the key's creator and notified
    const triaged = await call(client, "update_feedback", { id: `p1-${run}`, status: "planned", addTags: ["ui"] });
    expect(triaged.isError).toBe(false);
    expect(triaged.data).toMatchObject({ status: "planned", tags: ["UI"] });
    expect(statusChanges).toMatchObject([{ postId: `p1-${run}`, fromStatus: "pending", toStatus: "planned", actorUserId: ids.owner }]);
    const retagged = await call(client, "update_feedback", { id: `p1-${run}`, addTags: ["Performance"], removeTags: ["UI"], board: "bugs" });
    expect(retagged.data).toMatchObject({ tags: ["Performance"], board: { slug: "bugs" } });
    expect(statusChanges).toHaveLength(1);
    expect((await call(client, "update_feedback", { id: `p1-${run}` })).isError).toBe(true);
    expect((await call(client, "update_feedback", { id: `p1-${run}`, status: "shipped" })).isError).toBe(true);
    expect((await call(client, "update_feedback", { id: `p1-${run}`, board: "changelog" })).data.error.code).toBe("unknown_board");
    const logs = await db.select().from(activityLog).where(eq(activityLog.entityId, `p1-${run}`));
    expect(logs.every((l: any) => l.userId === ids.owner && l.metadata?.via === "api")).toBe(true);
    expect(logs.find((l: any) => l.metadata?.hasTagsAdded)?.metadata?.tags).toMatchObject([{ name: "UI" }]);
    // No-op updates write nothing
    const [{ updatedAt: before }] = await db.select().from(post).where(eq(post.id, `p1-${run}`));
    expect((await call(client, "update_feedback", { id: `p1-${run}`, status: "planned", addTags: ["Performance"] })).isError).toBe(false);
    const [{ updatedAt: after }] = await db.select().from(post).where(eq(post.id, `p1-${run}`));
    expect(after.getTime()).toBe(before.getTime());
    expect(await db.select().from(activityLog).where(eq(activityLog.entityId, `p1-${run}`))).toHaveLength(logs.length);

    // Internal note
    const note = await call(client, "add_feedback_comment", { id: `p2-${run}`, content: "Duplicate of dark mode" });
    expect(note.data.internal).toBe(true);
    // Locked posts and boards with comments off reject comments, as in the dashboard
    await db.update(post).set({ isLocked: true }).where(eq(post.id, `p3-${run}`));
    expect((await call(client, "add_feedback_comment", { id: `p3-${run}`, content: "x", internal: false })).data.error.code).toBe("post_locked");
    await db.update(post).set({ isLocked: false }).where(eq(post.id, `p3-${run}`));
    await db.update(board).set({ allowComments: false }).where(eq(board.id, `bb-${ids.ws}`));
    expect((await call(client, "add_feedback_comment", { id: `p3-${run}`, content: "x" })).data.error.code).toBe("comments_disabled");
    await db.update(board).set({ allowComments: true }).where(eq(board.id, `bb-${ids.ws}`));

    // Merge the duplicate: votes, comments and tags move over, source archived
    const merged = await call(client, "merge_feedback", { duplicateId: `p2-${run}`, targetId: `p1-${run}`, reason: "Same request" });
    expect(merged.isError).toBe(false);
    expect(merged.data.upvotes).toBe(7);
    expect(merged.data.comments.map((c: any) => c.content)).toContain("+1 from me");
    expect(merged.data.commentCount).toBe(2);
    const [source] = await db.select().from(post).where(eq(post.id, `p2-${run}`));
    expect([source.status, source.duplicateOfId]).toEqual(["archived", `p1-${run}`]);
    expect((await call(client, "merge_feedback", { duplicateId: `p2-${run}`, targetId: `p1-${run}` })).data.error.code).toBe("already_merged");
    // An archived duplicate can't be merged again (its votes would count twice), nor merged into
    expect((await call(client, "merge_feedback", { duplicateId: `p2-${run}`, targetId: `p3-${run}` })).data.error.code).toBe("already_merged");
    expect((await call(client, "merge_feedback", { duplicateId: `p3-${run}`, targetId: `p2-${run}` })).data.error.code).toBe("invalid_target");
    expect((await db.select().from(post).where(eq(post.id, `p3-${run}`)))[0].upvotes).toBe(9);
    expect((await call(client, "merge_feedback", { duplicateId: `p1-${run}`, targetId: `p1-${run}` })).isError).toBe(true);
    expect((await call(client, "list_feedback", { state: "archived" })).data.posts.map((p: any) => p.id)).toEqual([`p2-${run}`]);

    // Changelog: drafts only, linked to shipped feedback
    // completedAfter follows status changes, not votes or comments
    const since = new Date(Date.now() - 60_000).toISOString();
    expect((await call(client, "list_feedback", { completedAfter: since })).data.posts).toHaveLength(0);
    await call(client, "update_feedback", { id: `p3-${run}`, status: "progress" });
    await call(client, "update_feedback", { id: `p3-${run}`, status: "completed" });
    const shipped = await call(client, "list_feedback", { completedAfter: since, notInChangelog: true });
    expect(shipped.data.posts.map((p: any) => p.id)).toEqual([`p3-${run}`]);
    expect((await call(client, "list_feedback", { completedAfter: new Date(Date.now() + 60_000).toISOString() })).data.posts).toHaveLength(0);
    const draft = await call(client, "create_changelog_draft", {
      title: "Faster dashboard", content: "## Improvements\n\n- The dashboard loads **3x faster**", tags: ["New"], relatedFeedbackIds: [`p3-${run}`],
    });
    expect(draft.isError).toBe(false);
    expect(draft.data).toMatchObject({ status: "draft", tags: ["New"], relatedFeedbackIds: [`p3-${run}`], url: null });
    const [entry] = await db.select().from(changelogEntry).where(eq(changelogEntry.id, draft.data.id));
    expect([entry.status, entry.authorId, entry.relatedPostIds]).toEqual(["draft", ids.owner, [`p3-${run}`]]);
    expect((await call(client, "list_feedback", { completedAfter: since, notInChangelog: true })).data.posts).toHaveLength(0);
    // Snoozed posts are hidden unless asked for
    await db.update(post).set({ snoozedUntil: new Date(Date.now() + 86_400_000) }).where(eq(post.id, `p3-${run}`));
    expect((await call(client, "list_feedback", { status: ["completed"] })).data.posts).toHaveLength(0);
    expect((await call(client, "list_feedback", { status: ["completed"], includeSnoozed: true })).data.posts).toHaveLength(1);
    await db.update(post).set({ snoozedUntil: null }).where(eq(post.id, `p3-${run}`));
    const edited = await call(client, "update_changelog_draft", { id: draft.data.id, title: "A faster dashboard" });
    expect(edited.data).toMatchObject({ title: "A faster dashboard", status: "draft" });
    expect((await call(client, "create_changelog_draft", { title: "x", content: "y", relatedFeedbackIds: [`p4-${run}`] })).data.error.code).toBe("unknown_feedback");
    expect((await call(client, "list_changelog_entries", { status: "draft" })).data.entries).toHaveLength(1);
    await db.update(changelogEntry).set({ status: "published", publishedAt: new Date() }).where(eq(changelogEntry.id, draft.data.id));
    expect((await call(client, "update_changelog_draft", { id: draft.data.id, title: "pwn" })).data.error.code).toBe("not_a_draft");

    // Tenant isolation: the other workspace's post is invisible
    expect((await call(client, "get_feedback", { id: `p4-${run}` })).data.error.code).toBe("not_found");
    expect((await call(client, "update_feedback", { id: `p4-${run}`, status: "closed" })).data.error.code).toBe("not_found");
    expect((await call(client, "merge_feedback", { duplicateId: `p1-${run}`, targetId: `p4-${run}` })).data.error.code).toBe("not_found");

    // Scopes are checked per tool: an older changelog-only key can draft but not triage
    const legacy = await connect(await createKey(ids.ws, ["changelog:read", "changelog:write"]));
    const denied = await call(legacy, "list_feedback");
    expect([denied.isError, denied.data.error.code]).toEqual([true, "insufficient_scope"]);
    expect((await call(legacy, "list_changelog_entries")).isError).toBe(false);

    // The REST endpoints share the same service; query booleans parse "false" as false
    const untaggedFalse = await feedbackRoute.GET(new Request("http://localhost/api/v1/feedback?untagged=false", { headers: { authorization: `Bearer ${key}` } }));
    expect(((await untaggedFalse.json()) as any).data.posts).toHaveLength(2);
    const rest = await feedbackRoute.GET(new Request("http://localhost/api/v1/feedback?status=planned,completed&sort=votes", { headers: { authorization: `Bearer ${key}` } }));
    expect(rest.status).toBe(200);
    expect(((await rest.json()) as any).data.posts.map((p: any) => p.id)).toEqual([`p3-${run}`, `p1-${run}`]);
    const patch = await feedbackOne.PATCH(
      new Request(`http://localhost/api/v1/feedback/p3-${run}`, { method: "PATCH", headers: { authorization: `Bearer ${key}` }, body: JSON.stringify({ tags: [] }) }),
      { params: Promise.resolve({ id: `p3-${run}` }) },
    );
    expect(((await patch.json()) as any).data.tags).toEqual([]);

    await client.close();
    await legacy.close();
  } finally {
    await cleanup();
  }
}, 30000);
