# Launch readiness — 29 September 2026

**Code fixes completed; hold the public launch until production billing and operational checks are complete.** This is a targeted review, not an exhaustive audit. Changes are local and have not been deployed.

## Fixed

- Account deletion preserves boards and authored contributions in other owners' workspaces. Required creator references transfer to the surviving workspace owner; historical votes are anonymized.
- Account deletion checks live Stripe subscriptions, including orphaned subscriptions, and blocks unfinished subscriptions and scheduled cancellations. Checkout and workspace billing leases serialize the operation. The final deletion and reference transfers run in one fenced transaction; failures roll everything back.
- Post/comment votes and vote-status reads now authorize published content, active workspace membership, board visibility, and internal-comment access. Widget routes share public-board filtering.
- Similar-request search excludes drafts, pending approval, spam, and archived requests; hidden/private boards require active membership.
- Vote changes, counts, and activity records commit atomically. Concurrent toggles no longer produce mismatched counts.
- Production email fails explicitly when its provider key is missing. Production startup validates required configuration without exposing secret values.
- Board settings fetch post counts with one grouped query instead of one query per board.
- Generated coverage is excluded from lint. Existing lint warnings were resolved. Both Next apps now run TypeScript validation during their own builds.
- Automated tests and GitHub Actions workflows were subsequently removed at the owner's request. Release verification is now manual.
- Billing reconciliation reports failed/overdue events to Sentry. Billing and storage cleanup use monitored cron jobs. Alert recipients and delivery still require verification.
- Added `apps/app/vercel.json`: Vercel's actual app project root is `apps/app`. The root configuration remains available for root-based tooling. See [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Database baseline completed

The database selected by local app configuration had an empty Drizzle journal. The new `packages/db/scripts/migrations/baseline.ts` checked all 36 expected tables' columns, defaults, nullability, primary keys, indexes, unique constraints, foreign-key delete/update actions, and the account-trial backfill. No differences were found.

Recorded all 26 existing migration hashes/timestamps atomically; a subsequent read confirmed 26 journal entries. **No application rows changed.** A receipt was written locally to `/tmp/featul-migration-baseline.json`. This establishes the current state; it does not claim historical migrations actually ran. The older Stripe cutover must not be replayed because it drops/recreates subscriptions and resets plans.

The baseline applies only to that configured database. Production may use a different database and must be checked separately. The script defaults to read-only verification; `--apply` refuses a nonempty journal.

## Historical verification before test removal

These results describe the earlier review. The automated suites are no longer included in this workspace.

| Check | Result |
| --- | --- |
| Root type checks | Passed, 8 tasks |
| Root lint | Passed, 3 tasks, no warnings |
| Production builds, including Next TypeScript checks | Passed, 11 tasks |
| Default test run | 51 passed; 14 database search tests skipped |
| Billing integration, disposable PostgreSQL | 19 passed |
| Access/deletion/concurrency integration, disposable PostgreSQL | 8 passed |
| Search tests, read-only database fixtures | 14 passed |
| Total executed tests | 92 passed, 0 failed |
| Whitespace/diff checks | Passed |

Integration tests mock Stripe and email but exercise real PostgreSQL transactions, constraints, locks, and rollback. These do not prove live provider delivery or deployed user journeys. Source-map uploads were suppressed during local builds.

## Production launch blockers

Read-only Vercel inspection found project `jeandaly/app`, root `apps/app`, Node 22. Its production environment variable inventory **does not contain**:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_STARTER_MONTHLY`, `STRIPE_PRICE_ID_STARTER_YEARLY`
- `STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY`, `STRIPE_PRICE_ID_PROFESSIONAL_YEARLY`
- `CRON_SECRET`

Do not deploy these changes as launch-ready until those are configured. The new production validator deliberately rejects incomplete billing configuration. Use the intended live Stripe account and real price IDs; never copy the localhost CLI signing secret or test keys into production. Email/storage/Redis/auth variable names exist in Vercel, but their values and actual delivery were not verified.

Before launch:

1. Configure live Stripe keys/prices and a deployed webhook at `/api/auth/stripe/webhook`; verify webhook signatures, retries, plan updates, and account-wide trial eligibility.
2. Set a securely generated `CRON_SECRET`, ensure the hosting plan supports five-minute jobs (or configure an external authenticated scheduler), deploy, and verify both cron jobs execute successfully.
3. Verify production migrations and backups. Restore a provider snapshot into a disposable database; manually verify schema, representative row counts, login and billing reads there.
4. Configure Sentry recipients for failures, overdue billing events and missed cron check-ins; verify delivery. Enable provider backup-failure alerts separately.
5. Run controlled deployed acceptance checks: signup/verification, password reset, invite/revoke, private-board isolation, uploads/deletion, checkout return, webhook retry, trial expiry, cancellation, and safe account deletion. Real payment/email actions were not performed in this review.

For future releases, back up before schema changes, review generated migration SQL, run `db:migrate` against the explicit target, deploy compatible application changes, and verify cron/webhook health. Prefer forward corrective migrations; restore into a separate database and validate before switching traffic when a restore is necessary. Do not use schema push as the normal production migration workflow.
