/** Read-only release gate. Supply the intended environment explicitly; never prints secrets. */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { productionConfigurationErrors } from "@featul/auth/configuration";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import Stripe from "stripe";
import { HeadBucketCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import { createStorageContext } from "../src/storage/signer";
import { checkStorageCleanup } from "../src/storage/health";

const errors = productionConfigurationErrors(process.env);
if (errors.length) {
  console.error(JSON.stringify({ ready: false, configuration: errors }, null, 2));
  process.exit(1);
}
class ReadinessError extends Error {}

const results: { check: string; ok: boolean; detail?: string }[] = [];
async function check(name: string, run: () => Promise<void>) {
  try { await run(); results.push({ check: name, ok: true }); }
  catch (error) { results.push({ check: name, ok: false, detail: error instanceof ReadinessError ? error.message : "Service unavailable or access denied; inspect the named service securely" }); }
}
await Promise.all([
  check("database migrations and account identities", async () => {
    const query = neon(process.env.DATABASE_URL!);
    const journal = JSON.parse(await readFile(new URL("../../db/drizzle/meta/_journal.json", import.meta.url), "utf8")) as { entries: { tag: string; when: number }[] };
    const [rows = [], duplicate = []] = await query.transaction([
      query("select hash,created_at from drizzle.__drizzle_migrations order by created_at"),
      query("select count(*)::int as count from (select provider_id,account_id from account group by provider_id,account_id having count(*)>1) duplicates"),
    ], { readOnly: true, fetchOptions: { signal: AbortSignal.timeout(15000) } });
    if (rows.length !== journal.entries.length || duplicate.length !== 1 || Number(duplicate[0]?.count)) throw new ReadinessError("Migration or identity mismatch");
    for (const [i, entry] of journal.entries.entries()) {
      const hash = createHash("sha256").update(await readFile(new URL(`../../db/drizzle/${entry.tag}.sql`, import.meta.url))).digest("hex");
      if (rows[i]?.hash !== hash || Number(rows[i]?.created_at) !== entry.when) throw new ReadinessError("Migration mismatch");
    }
  }),
  check("shared Redis", async () => {
    const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN!, retry: false });
    if (await redis.ping() !== "PONG") throw new ReadinessError("Unavailable");
  }),
  check("daily storage cleanup heartbeat", checkStorageCleanup),
  check("private storage and upload CORS", async () => {
    const { s3 } = createStorageContext();
    const input = { Bucket: process.env.R2_PRIVATE_BUCKET! };
    await s3.send(new HeadBucketCommand(input), { abortSignal: AbortSignal.timeout(15000) });
    const cors = await s3.send(new GetBucketCorsCommand(input), { abortSignal: AbortSignal.timeout(15000) });
    const origin = new URL(process.env.NEXT_PUBLIC_APP_URL!).origin;
    if (!cors.CORSRules?.some(rule => rule.AllowedMethods?.includes("PUT") && rule.AllowedOrigins?.some(value => value === "*" || value === origin))) throw new ReadinessError("Upload origin missing");
  }),
  check("live Stripe prices and webhook endpoint", async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { timeout: 15000, maxNetworkRetries: 0 });
    const account = await stripe.accounts.retrieve();
    if (!account.charges_enabled || !account.payouts_enabled) throw new ReadinessError("Stripe charges or payouts are disabled");
    const priceIds: string[] = [];
    for (const [name, interval, amount] of [
      ["STARTER_MONTHLY", "month", 1800], ["STARTER_YEARLY", "year", 18000],
      ["PROFESSIONAL_MONTHLY", "month", 3500], ["PROFESSIONAL_YEARLY", "year", 35000],
    ] as const) {
      const price = await stripe.prices.retrieve(process.env[`STRIPE_PRICE_ID_${name}`]!);
      priceIds.push(price.id);
      if (!price.active || !price.livemode || price.currency !== "gbp" || price.unit_amount !== amount || price.recurring?.interval !== interval || price.recurring.interval_count !== 1) throw new ReadinessError(`${name}: expected active live GBP ${amount / 100}/${interval}; received ${price.active ? "active" : "inactive"} ${price.livemode ? "live" : "test"} ${price.currency.toUpperCase()} ${(price.unit_amount ?? 0) / 100}/${price.recurring?.interval || "one-time"}`);
    }
    const portals = await stripe.billingPortal.configurations.list({ limit: 100, expand: ["data.features.subscription_update.products"] });
    const portal = portals.data.find(config => config.active && config.is_default && config.livemode);
    const features = portal?.features;
    const update = features?.subscription_update;
    const allowedPrices = new Set(update?.products?.flatMap(product => product.prices) || []);
    if (!features?.payment_method_update.enabled || !features.invoice_history.enabled
      || !features.subscription_cancel.enabled || !update?.enabled
      || !update.default_allowed_updates.includes("price") || !priceIds.every(id => allowedPrices.has(id))) {
      throw new ReadinessError("Customer portal must support payment methods, invoices, cancellation, and all four plan prices");
    }
    const expected = new URL("/api/auth/stripe/webhook", process.env.NEXT_PUBLIC_APP_URL!).href;
    const { billingEvents } = await import("@featul/auth/billing/events");
    const required = [...billingEvents];
    let found = false;
    for await (const endpoint of stripe.webhookEndpoints.list({ limit: 100 })) {
      if (endpoint.url === expected && endpoint.status === "enabled" && endpoint.livemode && required.every(event => endpoint.enabled_events.includes("*") || (endpoint.enabled_events as string[]).includes(event))) found = true;
    }
    if (!found) throw new ReadinessError("Webhook missing");
  }),
]);
console.log(JSON.stringify({ automatedChecksPassed: results.every(result => result.ok), checks: results, manualChecks: ["backup restore", "legacy attachment migration and cache purge", "OAuth/passkey/2FA and email delivery", "Stripe end-to-end checkout and webhook retries", "consent and custom-domain sessions", "cron and alert delivery"] }, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
