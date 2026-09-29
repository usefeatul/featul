import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { SQL as Postgres } from "bun"
import { AsyncLocalStorage } from "node:async_hooks"
import { drizzle } from "drizzle-orm/pg-proxy"
import { sql } from "drizzle-orm"
import * as schema from "@featul/db/schema"
import type Stripe from "stripe"

const url = process.env.LAUNCH_TEST_DATABASE_URL
// Run in its own process: these module mocks must not leak into the unit suite.
describe.skipIf(!url)("launch regression integration", () => {
  if (!url) return
  const parsed = new URL(url)
  if (!["localhost", "127.0.0.1"].includes(parsed.hostname) || !parsed.pathname.startsWith("/launch_test")) throw new Error("Use a disposable local launch_test database")
  const connection = new Postgres(url)
  const tx = new AsyncLocalStorage<Pick<Postgres, "unsafe">>()
  const database = drizzle(async (query, params, method, typings) => {
    const client = tx.getStore() || connection
    const values = params.map((value, i) => typings?.[i] === "json" && typeof value === "string" ? JSON.parse(value) : value)
    if (method === "execute") {
      // Raw Neon queries return a result object; pg-proxy forwards rows verbatim.
      return { rows: { rows: Array.from(await client.unsafe(query, values)) } as unknown as unknown[][] }
    }
    const rows = await client.unsafe(query, values).values()
    return { rows: rows.map((row: unknown[]) => row.map(v => v instanceof Date ? v.toISOString() : v)) }
  })
  const databaseWithBatch = Object.assign(database, {
    batch: (queries: PromiseLike<unknown>[]) => connection.begin(async transaction => tx.run(transaction, async () => {
      const results = []
      for (const query of queries) results.push(await query)
      return results
    })),
  })
  mock.module("@featul/db", () => ({ ...schema, db: databaseWithBatch }))
  const db = databaseWithBatch as unknown as typeof import("@featul/db").db
  let live: Stripe.Subscription[] = []
  let stripeUnavailable = false
  let deletion: typeof import("@featul/auth/billing/deletion")
  let trial: typeof import("@featul/auth/billing/trial")
  let access: typeof import("../src/post/access")
  let voting: typeof import("../src/post/voting")
  beforeAll(async () => {
    const exported = Bun.spawnSync(["bunx", "drizzle-kit", "export", "--dialect", "postgresql", "--schema", "./schema/index.ts"], { cwd: new URL("../../db", import.meta.url).pathname })
    if (exported.exitCode !== 0) throw new Error(exported.stderr.toString())
    await connection.unsafe(exported.stdout.toString()).simple()
    const stripeModule = await import("@featul/auth/stripe")
    mock.module("@featul/auth/stripe", () => ({ ...stripeModule, getStripeClient: () => ({
      subscriptions: {
        list: ({ customer }: { customer: string }) => (async function* () {
          if (stripeUnavailable) throw new Error("Stripe unavailable")
          for (const row of live) if (row.customer === customer) yield row
        })(),
        retrieve: async (id: string) => live.find(row => row.id === id),
      },
      checkout: { sessions: { list: () => (async function* () {})(), expire: async () => {} } },
    }) }))
    deletion = await import("@featul/auth/billing/deletion")
    trial = await import("@featul/auth/billing/trial")
    access = await import("../src/post/access")
    voting = await import("../src/post/voting")
  })
  beforeEach(async () => {
    await connection`truncate "user", billing_event cascade`
    live = []; stripeUnavailable = false
    await connection`insert into "user" (id,name,email,email_verified,created_at,updated_at,stripe_customer_id) values
      ('owner','Owner','owner@example.test',true,now(),now(),'cus_owner'),
      ('other','Other','other@example.test',true,now(),now(),null),
      ('outsider','Outsider','outsider@example.test',true,now(),now(),null),
      ('inactive','Inactive','inactive@example.test',true,now(),now(),null)`
    await connection`insert into workspace(id,name,slug,domain,owner_id,widget_secret) values
      ('one','One','one','one.example.test','owner','secret'),('two','Two','two','two.example.test','other','secret')`
    await connection`insert into board(id,workspace_id,name,slug,created_by,is_public) values
      ('public','one','Public','public','owner',true),('private','two','Private','private','owner',false)`
    await connection`insert into workspace_member(id,workspace_id,user_id,role,is_active) values
      ('membership','two','owner','admin',true),('inactive-member','two','inactive','member',false)`
    await connection`insert into post(id,board_id,title,content,slug,status) values
      ('public-post','public','Search example','content','search','published'),
      ('private-post','private','Search private','content','private','published')`
    await connection`insert into comment(id,post_id,content,status,is_internal) values
      ('public-comment','public-post','hello','published',false),('internal','public-post','private note','published',true),
      ('private-comment','private-post','hello','published',false)`
  })
  afterAll(async () => {
    await connection.unsafe("drop schema public cascade; create schema public").simple()
    await connection.close()
    mock.restore()
  })

  test("private content rejects anonymous, unrelated and inactive callers while admitting owner and active member", async () => {
    for (const user of [null, "outsider", "inactive"]) {
      await expect(access.requirePostAccess(db, "private-post", user)).rejects.toThrow("Post not found")
      await expect(access.requireCommentAccess(db, "private-comment", user)).rejects.toThrow("Post not found")
    }
    for (const user of ["owner", "other"]) expect((await access.requirePostAccess(db, "private-post", user)).member).toBe(true)
    expect((await access.requirePostAccess(db, "public-post", null)).id).toBe("public-post")
    await expect(access.requireCommentAccess(db, "internal", "outsider")).rejects.toThrow("Comment not found")
    expect((await access.requireCommentAccess(db, "internal", "owner")).member).toBe(true)
  })

  test("public search excludes every unpublished status and hidden/private/inactive boards", async () => {
    for (const status of ["draft", "pending_approval", "spam", "archived"]) {
      await connection`insert into post(id,board_id,title,content,slug,status) values (${status},'public','Search example','content',${status},${status})`
    }
    const search = () => access.findSimilarVisiblePosts(db, "one", "public", null, sql`true`)
    expect((await search()).map(row => row.id)).toEqual(["public-post"])
    expect(await access.findSimilarVisiblePosts(db, "two", "private", "outsider", sql`true`)).toEqual([])
    expect(await access.findSimilarVisiblePosts(db, "two", "private", "owner", sql`true`)).toHaveLength(1)
    await connection`update board set is_visible = false where id = 'public'`
    expect(await search()).toEqual([])
    await connection`update board set is_active = false where id = 'public'`
    await expect(access.requirePostAccess(db, "public-post", "owner")).rejects.toThrow()
  })

  test("concurrent vote toggles keep counters equal to rows and support switching comment votes", async () => {
    await voting.togglePostVote(db, "public-post", { userId: "owner" })
    await Promise.all(Array.from({ length: 8 }, () => voting.togglePostVote(db, "public-post", { userId: "owner" })))
    expect((await connection`select upvotes from post where id = 'public-post'`)[0].upvotes).toBe(1)
    expect(await connection`select id from vote`).toHaveLength(1)
    expect((await voting.toggleCommentVote(db, "public-comment", "upvote", { userId: "owner" })).userVote).toBe("upvote")
    expect(await voting.toggleCommentVote(db, "public-comment", "downvote", { userId: "owner" })).toMatchObject({ upvotes: 0, downvotes: 1, userVote: "downvote" })
    await Promise.all(Array.from({ length: 8 }, () => voting.toggleCommentVote(db, "public-comment", "downvote", { userId: "owner" })))
    expect((await connection`select downvotes from comment where id = 'public-comment'`)[0].downvotes).toBe(1)
    expect(await connection`select id from comment_reaction`).toHaveLength(1)
  })

  test("failed activity insertion rolls back a vote and its counter together", async () => {
    await expect(voting.togglePostVote(db, "public-post", { userId: "owner" }, { workspaceId: "missing", title: "Fail" })).rejects.toThrow()
    expect(await connection`select id from vote`).toHaveLength(0)
    expect((await connection`select upvotes from post where id = 'public-post'`)[0].upvotes).toBe(0)
  })

  test("account deletion blocks active, trialing and scheduled-cancellation subscriptions without deleting sessions or boards", async () => {
    await connection`insert into session(id,token,user_id,expires_at,created_at,updated_at) values ('session','token','owner',now()+interval '1 day',now(),now())`
    for (const status of ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"]) {
      live = [{ id: "sub_live", customer: "cus_owner", status, cancel_at_period_end: true } as Stripe.Subscription]
      await expect(deletion.deleteAccountAfterBillingCheck("owner")).rejects.toThrow("End all subscriptions")
      expect(await connection`select id from session`).toHaveLength(1)
      expect(await connection`select id from board`).toHaveLength(2)
    }
    stripeUnavailable = true
    await expect(deletion.deleteAccountAfterBillingCheck("owner")).rejects.toThrow("Stripe unavailable")
  })

  test("account deletion cannot run alongside checkout creation", async () => {
    await trial.withAccountCheckoutLock("owner", async () => {
      await expect(deletion.deleteAccountAfterBillingCheck("owner")).rejects.toThrow("being updated")
    })
  })

  test("deleting an account preserves another owner's boards, changelog and authored contributions", async () => {
    await connection`insert into post_update(id,post_id,title,content,author_id) values ('update','private-post','Update','content','owner')`
    await connection`insert into changelog_entry(id,board_id,title,slug,content,author_id) values ('entry','private','Entry','entry','{}','owner')`
    await connection`insert into post_merge(id,source_post_id,target_post_id,merged_by,merge_type) values ('merge','public-post','private-post','owner','merge_into')`
    await voting.togglePostVote(db, "private-post", { userId: "owner" })
    // An old canceled subscription whose deleted workspace is not in the local DB.
    live = [{ id: "sub_old", customer: "cus_owner", status: "canceled", metadata: { referenceId: "old-workspace" } } as unknown as Stripe.Subscription]
    await deletion.deleteAccountAfterBillingCheck("owner")
    expect(await connection`select id from "user" where id = 'owner'`).toHaveLength(0)
    expect(await connection`select id from workspace where id = 'one'`).toHaveLength(0)
    expect((await connection`select created_by from board where id = 'private'`)[0].created_by).toBe("other")
    expect((await connection`select author_id from post_update where id = 'update'`)[0].author_id).toBe("other")
    expect((await connection`select author_id from changelog_entry where id = 'entry'`)[0].author_id).toBe("other")
    expect((await connection`select upvotes from post where id = 'private-post'`)[0].upvotes).toBe(1)
    expect((await connection`select user_id from vote`)[0].user_id).toBeNull()
  })

  test("a final deletion failure rolls back content transfers and owned-workspace deletion", async () => {
    await connection.unsafe(`create function block_test_deletion() returns trigger language plpgsql as $$ begin raise exception 'test deletion failure'; end $$;
      create trigger block_test_deletion before delete on "user" for each row execute function block_test_deletion();`).simple()
    try {
      await expect(deletion.deleteAccountAfterBillingCheck("owner")).rejects.toThrow("test deletion failure")
      expect(await connection`select id from workspace`).toHaveLength(2)
      expect((await connection`select created_by from board where id = 'private'`)[0].created_by).toBe("owner")
    } finally {
      await connection.unsafe('drop trigger block_test_deletion on "user"; drop function block_test_deletion();').simple()
    }
  })
})
