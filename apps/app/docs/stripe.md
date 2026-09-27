# Stripe billing

Better Auth 1.5.5 creates customers, checkout sessions and portal sessions. The app owns webhook processing and checkout-return synchronization. Customers remain user-scoped; subscriptions use `referenceId = workspace.id`.

## Configuration

```env
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER_MONTHLY=price_...
STRIPE_PRICE_ID_STARTER_YEARLY=price_...
STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_ID_PROFESSIONAL_YEARLY=price_...
NEXT_PUBLIC_APP_URL=https://your-app.example
CRON_SECRET=your_scheduler_secret
RESEND_API_KEY=re_...
RESEND_FROM=Your App <billing@your-domain.example>
```

Use separate test/live prices, API keys and webhook secrets. Keep old prices mapped until subscriptions using them have been migrated. An unrecognized price on an unfinished subscription causes synchronization to fail instead of silently granting or removing access.

## Deploying this update

1. Apply `packages/db/drizzle/0024_billing_reliability.sql` **before deploying the application code**. Use `bun run db:migrate` only if the database has a populated, consistent migration history. An existing database maintained with schema pushes can have an empty migration journal; in that case, inspect the schema and apply only the missing billing SQL in a transaction. Do not replay the entire migration history or rerun this SQL after its tables already exist. It adds `billing_state`, `billing_event`, and recoverable delivery fields to `billing_notification`. Existing notification records retain their sent timestamps. No existing workspace plan is reset.
2. Deploy the app. The webhook URL remains `/api/auth/stripe/webhook`; an explicit route now takes precedence over Better Auth's catch-all. Do not register a second webhook destination for the same integration.
3. Configure the event list below in Stripe and verify a signed test event reaches the explicit route.
4. Set `CRON_SECRET` and schedule authenticated `GET /api/cron/billing` calls every five minutes. The repository's Vercel configuration includes this schedule. Vercel Hobby only supports daily cron jobs, so use a suitable Vercel plan or an external scheduler and adjust `vercel.json` accordingly. External schedulers must send `Authorization: Bearer <CRON_SECRET>`.
5. Exercise test-mode checkout, trial expiry, cancellation, payment recovery, two workspaces belonging to one owner, and deletion. Check pending events and reconciliation failures before deploying live payments.

The migration is additive except for making notification `sent_at` nullable and removing its default. Coordinate rollback: older code treats notification insertion as delivery. Do not run old and new webhook processors against the same endpoint concurrently.

## State and retry behavior

- `billing/sync.ts` refreshes all subscriptions for the relevant customers, filters by workspace metadata and known subscription IDs, and rejects conflicting customer/workspace bindings. It never selects an arbitrary customer's first subscription.
- A database lease serializes synchronization, checkout preparation and deletion for each workspace. Subscription rows, `workspace.plan`, and `billing_state` are updated in a fenced, atomic Neon batch. An expired worker cannot publish its old response.
- `getEffectiveWorkspacePlan` uses the verified projection for five minutes. When refreshing fails, an existing verified projection can retain access for up to 24 hours; a 30-second retry backoff avoids repeatedly calling Stripe. Older or absent projections fail closed with an error. A failed Stripe request never writes a free-plan downgrade.
- `active`, `trialing`, and `past_due` retain paid access, preserving the previous dunning policy. `paused`, `incomplete`, `incomplete_expired`, `unpaid`, and `canceled` do not. Cancellation scheduled for period end retains access while the subscription remains active.
- Verified webhook events are persisted before processing. Failed work returns HTTP 500, remains pending, and can retry through either Stripe or the scheduled worker. Duplicate completed events are ignored. Event payloads identify resources; access is always derived from fresh Stripe data.
- The worker retries up to 20 due events and refreshes up to 20 stale workspaces per invocation, subject to a 40-second work budget. Oldest attempts run first to avoid one failing workspace blocking the queue. Monitor backlog size and oldest `synced_at`; increase worker capacity if this does not cover your workspace volume.
- Notification claims expire after two minutes. The rendered payload is persisted, and `sent_at` is set only after delivery succeeds. Retries use the same payload and Resend idempotency key. Resend's idempotency window is 24 hours; a crash after provider acceptance followed by recovery outside that window can still produce a duplicate.

## Checkout and deletion

- `/api/auth/subscription/upgrade` verifies owner access, expires previous open checkouts for that workspace, refreshes Stripe, and supplies the existing subscription ID server-side. Unpaid, paused, incomplete or duplicate subscriptions must be resolved before another checkout starts.
- `/api/billing/success` verifies the authenticated owner and the exact checkout's workspace/customer binding, then runs the shared synchronizer. It supports trials. The legacy `/api/auth/subscription/success` URL uses the same handler for checkouts created before deployment.
- Portal returns also use the shared synchronizer. The portal remains customer-wide, so an owner can see their other workspace subscriptions there.
- Workspace deletion expires open checkout sessions and verifies no unfinished Stripe subscription remains. Scheduled cancellation alone is insufficient: the subscription must have ended. Stripe lookup failures block deletion.
- Do **not** enable Stripe's customer-wide one-subscription restriction while one customer can subscribe multiple workspaces.
- Complimentary subscriptions and development overrides remain supported.

## Stripe webhook events

Configure the existing `/api/auth/stripe/webhook` destination for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.pending_update_applied`
- `customer.subscription.pending_update_expired`
- `customer.subscription.trial_will_end`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.upcoming`
- `invoice.marked_uncollectible`

Set the upcoming renewal reminder to three days in Stripe if that is the desired email timing. Subscription lifecycle changes perform reconciliation directly; there are no trial callbacks incorrectly attached to the root plugin configuration.

## Verification

```sh
bun test packages/api/tests/billing.test.ts
```

The integration suite needs a fresh, disposable local PostgreSQL database whose name starts with `billing_test`. It creates and drops its own tables, runs the actual billing migrations and SQL, and mocks Stripe, authentication and email delivery. Run it in its own process because it replaces module dependencies:

```sh
BILLING_TEST_DATABASE_URL=postgres://localhost/billing_test bun test packages/api/tests/billing.integration.test.ts
```

Also run `check-types` in `packages/auth`, `packages/db`, `packages/api`, and `apps/app`. For end-to-end testing, use `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook` with test-mode credentials. Automated tests do not verify dashboard configuration, live payments, or scheduler delivery.

References: [Stripe recommendations](https://github.com/t3dotgg/stripe-recommendations), [Stripe webhooks](https://docs.stripe.com/webhooks), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).
