import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { SQL } from "bun"
import { AsyncLocalStorage } from "node:async_hooks"
import { readFile } from "node:fs/promises"
import { drizzle } from "drizzle-orm/pg-proxy"
import Stripe from "stripe"
import * as schema from "@featul/db/schema"

// Opt-in: only a disposable local database. Stripe, auth and email are mocked;
// every projection, transaction, lease and migration runs against real Postgres.
const testUrl = process.env.BILLING_TEST_DATABASE_URL
describe.skipIf(!testUrl)("billing integration", () => {
  if (!testUrl) return
  const parsed = new URL(testUrl)
  if (!["localhost", "127.0.0.1"].includes(parsed.hostname) || !parsed.pathname.startsWith("/billing_test")) {
    throw new Error("BILLING_TEST_DATABASE_URL must name a disposable local billing_test database")
  }
  const connection = new SQL(testUrl)
  const transaction = new AsyncLocalStorage<Pick<SQL, "unsafe">>()
  const database = drizzle(async (query, params, _method, typings) => {
    const client = transaction.getStore() || connection
    // Neon accepts serialized JSON while Bun SQL encodes JSON parameters itself.
    const values = params.map((value, index) => typings?.[index] === "json" && typeof value === "string" ? JSON.parse(value) : value)
    const rows = await client.unsafe(query, values).values()
    return { rows: rows.map((row: unknown[]) => row.map((value) => value instanceof Date ? value.toISOString().replace("T", " ").replace("Z", "") : value)) }
  })
  const db = Object.assign(database, {
    batch: (queries: PromiseLike<unknown>[]) => connection.begin(async (tx) => transaction.run(tx, async () => {
      const results = []
      for (const query of queries) results.push(await query)
      return results
    })),
  })
  mock.module("@featul/db", () => ({ ...schema, db }))

  let subscriptions: Stripe.Subscription[] = []
  let openCheckouts: Stripe.Checkout.Session[] = []
  let stripeFailure = false
  let emailFailure = false
  let sessionUser = "owner"
  let returnedCheckout: Stripe.Checkout.Session | null = null
  const delivered: unknown[] = []
  const fakeStripe = {
    webhooks: new Stripe("sk_test_billing_test").webhooks,
    subscriptions: {
      list: ({ customer }: { customer: string }) => (async function* () {
        if (stripeFailure) throw new Error("Stripe unavailable")
        for (const row of subscriptions) if (row.customer === customer) yield structuredClone(row)
      })(),
      retrieve: async (id: string) => {
        if (stripeFailure) throw new Error("Stripe unavailable")
        const row = subscriptions.find((row) => row.id === id)
        if (!row) throw new Error("Subscription not found")
        return structuredClone(row)
      },
    },
    checkout: { sessions: {
      list: () => (async function* () { for (const checkout of [...openCheckouts]) yield checkout })(),
      expire: async (id: string) => { openCheckouts = openCheckouts.filter((row) => row.id !== id) },
      retrieve: async () => returnedCheckout,
    } },
  }
  let sync: typeof import("@featul/auth/billing/sync")
  let locks: typeof import("@featul/auth/billing/lock")
  let mutations: typeof import("@featul/auth/billing/mutations")
  let events: typeof import("@featul/auth/billing/events")
  let billing: typeof import("@featul/auth/billing")
  let http: typeof import("@featul/auth/billing/http")
  let webhook: typeof import("@featul/auth/billing/webhook")
  const env = { ...process.env }
  beforeAll(async () => {
    process.env.STRIPE_PRICE_ID_STARTER_MONTHLY = "price_starter"
    process.env.STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY = "price_pro"
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_billing_test"
    const stripeModule = await import("@featul/auth/stripe")
    mock.module("@featul/auth/stripe", () => ({ ...stripeModule, getStripeClient: () => fakeStripe }))
    mock.module("../../auth/src/email/transport", () => ({ sendEmail: async (payload: unknown) => {
      if (emailFailure) throw new Error("Email unavailable")
      delivered.push(payload)
    } }))
    mock.module("../../auth/src/posthog", () => ({ captureServerAnalyticsEvent: async () => {} }))
    mock.module("../../auth/src/auth", () => ({ auth: { api: { getSession: async () => ({ user: { id: sessionUser } }) } } }))
    sync = await import("@featul/auth/billing/sync")
    locks = await import("@featul/auth/billing/lock")
    mutations = await import("@featul/auth/billing/mutations")
    events = await import("@featul/auth/billing/events")
    billing = await import("@featul/auth/billing")
    http = await import("@featul/auth/billing/http")
    webhook = await import("@featul/auth/billing/webhook")

    await connection.unsafe(`
      create table "user" (id text primary key, name text, email text, stripe_customer_id text);
      create table workspace (id text primary key, owner_id text references "user"(id), name text, slug text, plan text default 'free', updated_at timestamp default now());
    `).simple()
    const cutover = await readFile(new URL("../../db/drizzle/0015_stripe_cutover.sql", import.meta.url), "utf8")
    await connection.unsafe(cutover.slice(cutover.indexOf('CREATE TABLE "subscription"'))).simple()
    await connection.unsafe(await readFile(new URL("../../db/drizzle/0016_cute_frightful_four.sql", import.meta.url), "utf8")).simple()
    await connection.unsafe(await readFile(new URL("../../db/drizzle/0024_billing_reliability.sql", import.meta.url), "utf8")).simple()
  })

  beforeEach(async () => {
    await connection`truncate billing_event, billing_notification, billing_state, subscription, workspace, "user" cascade`
    await connection`insert into "user" (id, name, email, stripe_customer_id) values ('owner', 'Owner', 'owner@example.test', 'cus_owner')`
    await connection`insert into workspace (id, owner_id, name, slug) values ('ws_one', 'owner', 'One', 'one'), ('ws_two', 'owner', 'Two', 'two')`
    subscriptions = []; openCheckouts = []; delivered.length = 0
    stripeFailure = false; emailFailure = false; sessionUser = "owner"; returnedCheckout = null
  })
  afterAll(async () => {
    await connection.unsafe('drop table billing_event, billing_notification, billing_state, subscription, workspace, "user" cascade').simple()
    await connection.close()
    for (const key of ["STRIPE_PRICE_ID_STARTER_MONTHLY", "STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY", "STRIPE_WEBHOOK_SECRET"]) {
      if (env[key] === undefined) delete process.env[key]
      else process.env[key] = env[key]
    }
    mock.restore()
  })

  function live(id = "sub_one", workspaceId = "ws_one", status = "trialing", price = "price_starter") {
    return {
      id, customer: "cus_owner", metadata: { referenceId: workspaceId, subscriptionId: `local_${id}` }, status,
      cancel_at_period_end: false, trial_start: 1000, trial_end: 2000,
      items: { data: [{ price: { id: price, recurring: { interval: "month" } }, current_period_start: 1000, current_period_end: 2000 }] },
    } as unknown as Stripe.Subscription
  }
  function event(id: string, type: Stripe.Event.Type = "customer.subscription.created") {
    return { id, type, data: { object: live() } } as Stripe.Event
  }

  test("repairs a checkout row and isolates two workspaces sharing a customer", async () => {
    subscriptions = [live(), live("sub_two", "ws_two", "active", "price_pro")]
    await connection`insert into subscription (id, reference_id, stripe_customer_id) values ('local_sub_one', 'ws_one', 'cus_owner')`
    expect((await sync.syncWorkspaceBilling("ws_one")).plan).toBe("starter")
    const rows = await connection`select id, stripe_subscription_id, status from subscription`
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: "local_sub_one", stripe_subscription_id: "sub_one", status: "trialing" })
    expect((await connection`select plan from workspace where id = 'ws_two'`)[0].plan).toBe("free")
  })

  test("out-of-order events use current Stripe state and duplicate delivery does not resend", async () => {
    subscriptions = [live()]
    await events.receiveBillingEvent(event("evt_created"))
    await events.receiveBillingEvent(event("evt_created"))
    expect(delivered).toHaveLength(1)
    subscriptions = [live("sub_one", "ws_one", "canceled")]
    await events.receiveBillingEvent(event("evt_old_update", "customer.subscription.updated"))
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("free")
    expect((await connection`select status from subscription`)[0].status).toBe("canceled")
  })

  test("payment recovery and pause/resume refresh the same projection", async () => {
    const invoice = {
      id: "in_one", customer: "cus_owner", amount_due: 1000, currency: "usd",
      parent: { subscription_details: { subscription: "sub_one" } }, lines: { data: [] },
    }
    subscriptions = [live("sub_one", "ws_one", "past_due")]
    await events.receiveBillingEvent({ id: "evt_failed", type: "invoice.payment_failed", data: { object: invoice } } as unknown as Stripe.Event)
    expect((await connection`select status from subscription`)[0].status).toBe("past_due")
    expect(delivered).toHaveLength(1)
    subscriptions = [live("sub_one", "ws_one", "active")]
    await events.receiveBillingEvent({ id: "evt_paid", type: "invoice.paid", data: { object: invoice } } as unknown as Stripe.Event)
    expect((await connection`select status from subscription`)[0].status).toBe("active")
    subscriptions = [live("sub_one", "ws_one", "paused")]
    await events.receiveBillingEvent(event("evt_paused", "customer.subscription.paused"))
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("free")
    subscriptions = [live("sub_one", "ws_one", "active")]
    await events.receiveBillingEvent(event("evt_resumed", "customer.subscription.resumed"))
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("starter")
  })

  test("a conflicting global subscription binding aborts the entire projection", async () => {
    subscriptions = [live()]
    await connection`insert into subscription (id, reference_id, stripe_customer_id, stripe_subscription_id) values ('wrong', 'ws_two', 'cus_owner', 'sub_one')`
    await expect(sync.syncWorkspaceBilling("ws_one")).rejects.toThrow()
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("free")
    expect((await connection`select synced_at from billing_state where workspace_id = 'ws_one'`)[0].synced_at).toBeNull()
  })

  test("a failed email leaves durable work and a retry delivers once", async () => {
    subscriptions = [live()]; emailFailure = true
    await expect(events.receiveBillingEvent(event("evt_retry"))).rejects.toThrow("Email unavailable")
    expect((await connection`select completed_at from billing_event`)[0].completed_at).toBeNull()
    expect((await connection`select sent_at, payload from billing_notification`)[0].sent_at).toBeNull()
    emailFailure = false
    await events.processBillingEvent("evt_retry")
    await events.processBillingEvent("evt_retry")
    expect(delivered).toHaveLength(1)
    expect((await connection`select sent_at from billing_notification`)[0].sent_at).not.toBeNull()
  })

  test("a crashed worker is recoverable and preserves the original email payload", async () => {
    subscriptions = [live()]; emailFailure = true
    await expect(events.receiveBillingEvent(event("evt_crash"))).rejects.toThrow()
    const original = (await connection`select payload from billing_notification`)[0].payload
    await connection`update billing_event set lock_token = 'crashed', locked_until = now() - interval '1 minute'`
    await connection`update billing_notification set lock_token = 'crashed', locked_until = now() - interval '1 minute'`
    await connection`update "user" set email = 'changed@example.test', name = 'Changed'`
    emailFailure = false
    await events.processBillingEvent("evt_crash")
    expect(delivered[0]).toMatchObject(original)
    expect(delivered).toHaveLength(1)
  })

  test("two subscriptions created against one pending row remain visible for duplicate detection", async () => {
    subscriptions = [live(), { ...live("sub_duplicate"), metadata: live().metadata }]
    await connection`insert into subscription (id, reference_id, stripe_customer_id) values ('local_sub_one', 'ws_one', 'cus_owner')`
    await sync.syncWorkspaceBilling("ws_one")
    expect(await connection`select id from subscription`).toHaveLength(2)
    await expect(locks.withBillingLock("ws_one", mutations.prepareWorkspaceCheckout)).rejects.toThrow("Multiple subscriptions")
  })

  test("webhooks verify raw signatures and return an error while failed events remain retryable", async () => {
    subscriptions = [live()]
    const payload = JSON.stringify(event("evt_signed"))
    const signed = async () => new Request("https://app.test/api/auth/stripe/webhook", {
      method: "POST", body: payload,
      headers: { "stripe-signature": await fakeStripe.webhooks.generateTestHeaderStringAsync({ payload, secret: "whsec_billing_test" }) },
    })
    expect((await webhook.handleStripeWebhook(new Request("https://app.test/api/auth/stripe/webhook", { method: "POST", body: payload }))).status).toBe(400)
    expect(await connection`select id from billing_event`).toHaveLength(0)
    stripeFailure = true
    expect((await webhook.handleStripeWebhook(await signed())).status).toBe(500)
    expect((await connection`select completed_at from billing_event`)[0].completed_at).toBeNull()
    stripeFailure = false
    expect((await webhook.handleStripeWebhook(await signed())).status).toBe(200)
    expect(delivered).toHaveLength(1)
  })

  test("concurrent webhooks wait for checkout's lease and complete without duplicate activation emails", async () => {
    subscriptions = [live()]
    let responses: Promise<Response[]> | undefined
    await locks.withBillingLock("ws_one", async () => {
      responses = Promise.all(["evt_parallel_one", "evt_parallel_two"].map(async (id) => {
        const payload = JSON.stringify(event(id))
        return webhook.handleStripeWebhook(new Request("https://app.test/api/auth/stripe/webhook", {
          method: "POST", body: payload,
          headers: { "stripe-signature": await fakeStripe.webhooks.generateTestHeaderStringAsync({ payload, secret: "whsec_billing_test" }) },
        }))
      }))
      await Bun.sleep(400)
      expect(await connection`select id from billing_event where completed_at is not null`).toHaveLength(0)
    })
    expect((await responses!).map((response) => response.status)).toEqual([200, 200])
    expect(await connection`select id from billing_event where completed_at is not null`).toHaveLength(2)
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("starter")
    expect(delivered).toHaveLength(1)
  })

  test("waiting for a busy lease is bounded and never runs the blocked work", async () => {
    let calls = 0
    await locks.withBillingLock("ws_one", async () => {
      await expect(locks.withBillingLock("ws_one", async () => { calls++ }, 50)).rejects.toThrow("being updated")
    })
    expect(calls).toBe(0)
    await locks.withBillingLock("ws_one", async () => { calls++ }, 50)
    expect(calls).toBe(1)
  })

  test("leases reject parallel work and fence a stale writer", async () => {
    subscriptions = [live()]
    await locks.withBillingLock("ws_one", async (lease) => {
      await expect(sync.syncWorkspaceBilling("ws_one")).rejects.toThrow("being updated")
      await connection`update billing_state set lock_token = 'replacement' where workspace_id = 'ws_one'`
      await expect(sync.syncBillingUnderLease(lease)).rejects.toThrow("being updated")
      expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("free")
      expect(await connection`select * from subscription`).toHaveLength(0)
    })
  })

  test("parallel first-time feature checks share the verified result", async () => {
    subscriptions = [live()]
    expect(await Promise.all([billing.getEffectiveWorkspacePlan("ws_one"), billing.getEffectiveWorkspacePlan("ws_one")])).toEqual(["starter", "starter"])
  })

  test("deletion blocks scheduled cancellations and expires checkouts before deleting an ended workspace", async () => {
    subscriptions = [{ ...live(), cancel_at_period_end: true }]
    await expect(mutations.deleteWorkspaceAfterBillingCheck("ws_one")).rejects.toThrow("End your Stripe")
    subscriptions = [live("sub_one", "ws_one", "canceled")]
    openCheckouts = [{ id: "cs_open", client_reference_id: "ws_one" } as Stripe.Checkout.Session]
    await mutations.deleteWorkspaceAfterBillingCheck("ws_one")
    expect(openCheckouts).toHaveLength(0)
    expect(await connection`select id from workspace where id = 'ws_one'`).toHaveLength(0)
  })

  test("an outage preserves a recent verified plan and never writes a downgrade", async () => {
    subscriptions = [live()]
    await sync.syncWorkspaceBilling("ws_one")
    await connection`update billing_state set synced_at = now() - interval '10 minutes'`
    stripeFailure = true
    expect(await billing.getEffectiveWorkspacePlan("ws_one")).toBe("starter")
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("starter")
    await connection`update billing_state set synced_at = now() - interval '25 hours'`
    await expect(billing.getEffectiveWorkspacePlan("ws_one")).rejects.toThrow("Stripe unavailable")
  })

  test("checkout returns synchronize trials and reject another workspace's session", async () => {
    subscriptions = [live(), live("sub_two", "ws_two", "active", "price_pro")]
    returnedCheckout = { id: "cs_one", status: "complete", mode: "subscription", customer: "cus_owner", subscription: "sub_one", client_reference_id: "ws_one" } as Stripe.Checkout.Session
    const response = await http.handleBillingReturn(new Request("https://app.test/api/billing/success?workspaceId=ws_one&session_id=cs_one"))
    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toBe("https://app.test/workspaces/one/settings/billing")
    expect((await connection`select plan from workspace where id = 'ws_one'`)[0].plan).toBe("starter")
    const mismatch = await http.handleBillingReturn(new Request("https://app.test/api/billing/success?workspaceId=ws_two&session_id=cs_one"))
    expect(mismatch.status).toBe(400)
    sessionUser = "other"
    expect((await http.handleBillingReturn(new Request("https://app.test/api/billing/success?workspaceId=ws_one"))).status).toBe(403)
  })

  test("checkout resolves the existing subscription on the server and blocks unpaid replacements", async () => {
    subscriptions = [live()]
    let forwarded: Record<string, unknown> | undefined
    const request = () => new Request("https://app.test/api/auth/subscription/upgrade", {
      method: "POST", headers: { origin: "https://app.test", "content-type": "application/json" },
      body: JSON.stringify({ referenceId: "ws_one", plan: "professional", subscriptionId: "sub_wrong" }),
    })
    expect((await http.handleBillingUpgrade(request(), async (req) => {
      forwarded = await req.json(); return Response.json({ ok: true })
    })).status).toBe(200)
    expect(forwarded?.subscriptionId).toBe("sub_one")
    subscriptions = [live("sub_one", "ws_one", "unpaid")]
    const response = await http.handleBillingUpgrade(request(), async () => { throw new Error("Must not create checkout") })
    expect(response.status).toBe(409)
  })
})
