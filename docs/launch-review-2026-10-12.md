# Launch readiness review — 12 October 2026

## Follow-up fixes in the working tree

The original assessment below records the pre-fix baseline. The four requested findings are now addressed in source; this is not a production deployment or a new launch certification.

- **Passwords:** shared validation now runs before token and email-OTP reset handlers, preserving valid reset credentials and existing sessions when a weak password is rejected.
- **Atomic writes:** dashboard/widget post creation batches content, vote, tags, activity and notification intents in one transaction. Comment creation/deletion serialize on the post row; cascade deletion, activity and count updates commit together.
- **Notifications:** a database outbox retains delivery attempts across process termination, retries with backoff, and uses expiring worker leases. The API schedules immediate delivery after responding; the existing five-minute billing cron provides recovery and reports failed/overdue delivery through its monitor. Stored URLs are revalidated; provider requests have an eight-second timeout and refuse redirects. Delivery is at least once: an ambiguous provider response can cause a duplicate. Disabled integrations, unavailable posts and ineligible workspaces are skipped.
- **Consent:** optional product analytics initializes only after an explicit current grant. Dashboard controls allow rejection/withdrawal, marketing preferences share the same consent cookie on featul.com, and GPC/embedded frames prevent collection. Autocapture and replay remain disabled. Server-side signup/billing analytics were removed because those handlers have no durable user consent record; operational billing and email remain enabled.

### Follow-up verification

- `bun run test`: **99 passed, 0 failed** (49 API/editor/host, 49 security, one AI cancellation test).
- `bun run test:integration` with disposable PostgreSQL and a local Neon HTTP transaction bridge: **3 passed, 0 failed, 45 assertions**. Covers rollback, concurrent comment changes, durable delivery retries, competing workers and expired lease recovery. Outgoing webhook sends were mocked.
- `bun run check-types --force`: **8 tasks passed**, no cached tasks.
- `bun run lint --force`: **3 tasks passed**, no cached tasks.
- Frozen install and production build in an isolated copy with synthetic environment values: **11 tasks passed**, two unchanged tasks cached. Both Next.js apps compiled successfully.
- `git diff --check`: passed.

### Rollout requirements

Apply `packages/db/drizzle/0027_webhook_delivery.sql` through the normal migration workflow to the intended, already-baselined database **before deploying the new app**. Post creation deliberately fails atomically if the outbox table is missing. Deploy both app and marketing consent changes. Keep the existing authenticated billing cron enabled and verify its monitor after deployment. Existing posts are not backfilled into the notification queue.

The new migration was applied successfully against a disposable PostgreSQL database using the current schema. A full fresh replay of historical migrations is still blocked by a pre-existing UUID/text foreign-key mismatch in migration `0001`; this follow-up does not repair that separate historical bootstrap issue. No production database, notifications or deployments were touched during verification.


## Verdict and scores

**Overall: 7.5/10. Suitable for a controlled initial rollout; I would not give an unconditional go-ahead for a broad launch yet.** The foundation is solid and the previous major security findings have been substantially addressed. The remaining concerns are specific validation, data-integrity, delivery, privacy and verification gaps, rather than a failing build or a newly demonstrated critical exploit.

These are engineering judgment scores, not measured security guarantees. “10” means consistently maintainable code, strong automated coverage and demonstrated production behavior under failure and realistic load.

| Area | Score | Assessment |
| --- | --- | --- |
| Structure and maintainability | 7/10 | Sensible app/package boundaries, but several central modules exceed 1,000 lines and important boundaries still use `any`. |
| Code security and access controls | 8/10 | Shared resource checks, origin restrictions, private attachment delivery, rate limiting and clean dependency audit; reset-policy inconsistency remains. |
| Reliability and data integrity | 7/10 | Billing reconciliation and some atomic writes are strong; post creation and comment deletion still have partial-write risks. |
| Tests and release confidence | 6.5/10 | 94 tests pass, types/lint/builds pass; database integration tests are outside CI and no committed browser acceptance suite was found. |
| Privacy controls | 6.5/10 | Sentry default PII/replay disabled and analytics identifiers reduced, but product analytics initialization is not consent-gated in source. |
| Operations and deployment | 8/10, provisional | Good release gate, cron checks and documented restore/payment acceptance. Current provider state was not independently rechecked in this review. |
| Performance and scale | 6.5/10, provisional | Some query limits exist, but unbounded lists and no measured load test prevent a stronger rating. |

No new critical/high-severity vulnerability was demonstrated in the paths reviewed. That does not establish that none exist elsewhere. Visual checks were limited, so there is no separate whole-product accessibility or design score.

## Scope and fresh verification

Reviewed commit `af07896d` plus the current working tree. Password/session changes were being edited concurrently: the final review includes `packages/auth/src/credentials.ts` and `tests/security/password.test.ts`, as well as the changed auth screens. These were pre-existing/concurrent work, not fixes made by this review. Application source and deployment configuration were left unchanged.

| Check | Result on this review |
| --- | --- |
| `bun run test` | **94 passed, 0 failed**: 49 API/editor/host tests, 44 security/session tests, one AI cancellation test. |
| `bun run check-types --force` | **8 tasks passed**, all executed without Turbo cache. Subsequent builds checked the updated auth source too. |
| `bun run lint` | **3 tasks passed**; shared UI result came from cache. This does not imply all backend packages have lint scripts. |
| `bun audit` | **No known vulnerabilities reported** for the current Bun lockfile. |
| Fresh frozen install | Passed in an isolated source copy with `--ignore-scripts`. |
| Production builds | Both apps and widget built successfully: **11 tasks passed**. After the concurrent credential extraction, rebuilt the affected source successfully; five unaffected tasks were cached. |
| `bun run test:integration` | **Two tests skipped** because disposable PostgreSQL/Neon HTTP test services were not configured. Not counted as passing. |
| Additional audit probes | Two isolated reproductions passed: password reset policy bypass and partial post creation after an injected vote-write failure. These are demonstrations of findings, not regression passes. |
| Live HTTP smoke checks | Eight expected responses: home, pricing, privacy, terms and sign-in returned 200; billing/cleanup cron routes returned 401 without credentials; invalid image key returned 404. |
| Safari check | Homepage content, rejection of marketing cookies, navigation to sign-in, sign-in layout and password-recovery navigation checked. No account or payment was submitted. |
| Tracked secret-pattern scan | 1,634 tracked paths inventoried; no matches for the selected private-key/provider-key patterns. Only example env files are tracked. This is a bounded pattern scan, not a complete historical secret audit. |

Builds used synthetic service settings without real env files or provider credentials. They prove compilation, not live delivery or payments. Logs are under `/tmp/featul-launch-*.log`; isolated snapshot location is recorded in `/tmp/featul-launch-review-path` and is temporary.

The [10 October remediation record](security-remediation.md) reports production migrations, restored backups, private-storage cutover, sandbox billing lifecycles, delivered alerts/emails and account acceptance. That is useful prior evidence, clearly distinguished here from checks repeated today. The older report's resolved findings should not be presented as current blockers.

## Medium-priority findings

### 01 — Password reset does not enforce the same server-side password policy

**Rule:** NEXT-INPUT-001. **Confidence:** reproduced against the actual auth configuration and Better Auth with an in-memory database.

**Location:** [credentials.ts](../packages/auth/src/credentials.ts), lines 15–24; policy in [password.ts](../packages/auth/src/password.ts), lines 9–17.

The validation hook covers `/sign-up/email`, `/change-password` and `/set-password`, but omits `/reset-password` and `/email-otp/reset-password`. A synthetic signup using `abcdefgh` returned 400; a valid OTP reset to that same password returned 200, and subsequent sign-in succeeded.

**Impact:** a caller with a valid recovery code can bypass the application's advertised password rules. This is not a bypass of recovery-code verification or evidence of arbitrary account takeover. The default minimum length still applies. The latest session-revocation tests pass.

**Fix:** apply one intended password policy to both reset endpoints as well, using the correct request field for each. Add a regression checking rejection of a password that signup rejects. Password-policy design can evolve separately; the issue is inconsistent server enforcement.

### 02 — Some core writes can partially succeed or leave stale counters

**Rule:** application data-integrity boundary. **Confidence:** source trace plus synthetic failure injection for post creation; comment race not executed against PostgreSQL today.

**Locations:** [post.ts](../packages/api/src/router/post.ts), lines 192–228; [comment.ts](../packages/api/src/router/comment.ts), lines 847–883.

Post creation separately inserts the post, tags and initial vote, then updates the vote count and inserts activity. There is no transaction around this sequence. Injecting an error during the vote insert made the real route throw after its post-insert operation had already completed.

Comment deletion separately deletes the row, handles images, reads the remaining count and writes that count back. A concurrent comment creation between the count read and update can make the stored count stale; a later failure cannot undo the deletion.

**Impact:** users can receive an error even though content exists, retry and create duplicates, or see incorrect counts. This is a reliability/data-integrity defect, not a demonstrated tenant-isolation failure.

**Fix:** commit related database mutations atomically, use consistent locking or atomic counter updates, and perform external notifications/image cleanup after commit. Add failure-injection and create/delete concurrency tests. Existing atomic comment-creation and voting code provides a useful pattern.

### 03 — Slack/Discord notifications lack a reliable execution/retry boundary

**Rule:** application background-work reliability. **Confidence:** confirmed implementation; a dropped deployed notification was not reproduced.

**Locations:** [post.ts](../packages/api/src/router/post.ts), lines 271–286; [webhook.ts](../packages/api/src/services/webhook.ts), lines 283–301 and the fetch calls at 83 and 184.

The route invokes `triggerPostWebhooks(...)` without awaiting it. That function starts more unawaited notification promises. No durable outbox, retry record or explicit response-lifetime extension was found in this path, and these fetches have no application timeout.

**Impact:** a successful feedback submission can lose an advertised integration notification when the invocation ends or the provider fails. `lastTriggeredAt` also gets updated before checking delivery success, so it should not be treated as a delivery-success metric.

**Fix:** enqueue a durable notification event alongside the post write and process it with retries, timeouts and idempotency. As an interim measure, await bounded delivery or register it with the platform's supported background-work lifetime; that alone does not provide durable retry. Next documents the lifetime extension needed for [serverless work after a response](https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/after.mdx).

### 04 — Product analytics initialization does not observe a consent decision

**Rule:** privacy/data-minimization boundary. **Confidence:** source confirmed; exact deployed project settings and transmitted fields not inspected.

**Locations:** [instrumentation-client.ts](../apps/app/src/instrumentation-client.ts), lines 32–39; [posthog.ts](../apps/app/src/lib/posthog.ts), lines 67–87; [server analytics](../packages/auth/src/posthog.ts), lines 21–37; [published GDPR content](../apps/web/src/content/legal/gdpr.md), lines 58–64.

When a PostHog token is configured, the product initializes the SDK immediately. No consent lookup or default opt-out is supplied, and explicit capture/identify functions check configuration, not a privacy choice. The marketing site's cookie controls are in a separate app. The published content describes optional analytics as consent-based.

**Impact:** the product's analytics behavior can differ from the privacy choice a visitor made on the marketing site and from the expectations created by the published policy. This is a technical policy-alignment finding, not a legal-compliance determination. If the product token is absent, that collection path is inactive.

**Fix:** explicitly decide which telemetry is essential and which is optional; connect optional analytics to a persisted consent choice and honor withdrawal. Review server-side events, provider retention and recording settings too. PostHog documents [privacy controls](https://posthog.com/docs/privacy), and its [SDK defaults](https://github.com/PostHog/posthog-js/blob/main/packages/browser/src/posthog-core.ts) include capture opt-out being disabled by default. Do not assume disabling Sentry replay also disables PostHog collection.

### 05 — Important regression coverage is not enforced by CI

**Rule:** release verification boundary. **Confidence:** confirmed scripts/workflow.

**Locations:** [checks.yml](../.github/workflows/checks.yml), lines 64–69; [package.json](../package.json), lines 24–26; [integration tests](../tests/integration/comments.test.ts), lines 5–10, and [membership tests](../tests/integration/membership.test.ts).

CI runs `bun run test`, which excludes `test:integration`. The two integration tests silently skip without their local service variables. No committed end-to-end browser suite or repeatable billing lifecycle suite was found in the default tests. Historical manual/sandbox billing acceptance is valuable but will not catch future regressions automatically.

**Impact:** a green PR can still break database concurrency, checkout entitlement transitions, invitation acceptance or a customer journey.

**Fix:** add a required CI job with disposable database services that fails if integration setup is missing. Preserve repeatable acceptance tests for signup/recovery, tenant isolation, invitation acceptance, private images, checkout returns, webhook retries and cancellation. Mock external delivery where appropriate and run scheduled staging checks against providers.

### 06 — Unbounded lists create growth and availability risk

**Rule:** resource-exhaustion/performance boundary. **Confidence:** source confirmed; no load benchmark or production outage reproduced.

**Locations:** [comment.ts](../packages/api/src/router/comment.ts), lines 238–291; [board.ts](../packages/api/src/router/board.ts), lines 547–594; [storage cleanup](../packages/api/src/storage/delete.ts), `collectReferencedImageUrls` and `runBucketOrphanGc`.

The comment list loads all published comments and related data; the legacy board list fetches all posts for the board. The cleanup job pages database reads but accumulates the complete referenced-image set in memory. Rate limits restrict request frequency, not the work or response size of one request.

**Impact:** popular threads or large customer workspaces can cause slow responses, large client payloads, elevated database costs or job timeouts.

**Fix:** cursor pagination and maximum page sizes; load replies separately; test realistic large workspaces and simultaneous visitors in staging. Measure p95/p99 latency, error rate, response size and provider cost. Move cleanup toward bounded/incremental reference processing as volume grows.

## Lower-priority hardening and structure

### 07 — CSP still allows arbitrary inline scripts

**Locations:** [app next.config.ts](../apps/app/next.config.ts), line 27; [web next.config.ts](../apps/web/next.config.ts), script policy inside `headers()`.

Both source and live response headers retain `script-src 'unsafe-inline'`. Production `unsafe-eval` is absent, and useful `object-src`, `base-uri`, frame restrictions and `nosniff` controls are present. This is defense-in-depth work, not proof of an XSS vulnerability. Introduce nonce/hash-based scripts with integration testing rather than removing the allowance blindly.

### 08 — Good package boundaries, but oversized modules and incomplete lint coverage

The split between `apps/app`, `apps/web`, API, auth, DB, widget, editor and UI is appropriate. Strict TypeScript and `noUncheckedIndexedAccess` are strengths. Shared authorization and billing helpers reduce duplicated policy.

The main maintenance pressure is inside those boundaries: `ChangelogAiPanel.tsx` is 1,453 lines, `board.ts` 1,243, `post.ts` 1,184, `workspace.ts` router 1,148, the app's workspace library 1,114, and `comment.ts` 1,098. These are review hotspots, not proof that every large file is poor code. Authentication/billing helpers are already more focused.

Split routers into focused commands/queries and separate authorization, database mutations and external effects. Extract the AI panel's conversation state and UI sections. Use single-word names for new component files, per workspace instructions. Replace `any` on DB/request boundaries first; `packages/api/src/jstack.ts:17` currently erases the DB type. Add backend lint scripts: the current root lint runs only app, web and UI. Keep Bun's lockfile authoritative and clarify the stale npm lockfile's purpose.

## What is already strong

- Legacy detail routes require membership; shared public predicates and resource checks protect private/unpublished/internal content, with passing regressions.
- Credentialed API responses use private/no-store caching and explicit trusted-origin CORS; hostile-origin regression checks pass.
- Post/comment attachments resolve access at read time through a private bucket. New content rejects legacy public URLs.
- Runtime schemas validate inputs; image policies bound size/type and use short-lived signed uploads.
- Auth uses shared Redis limiting and denies requests when configured Redis consumption fails. AI usage has atomic quotas, concurrency leases and cancellation.
- Billing uses verified webhook signatures, durable events, leases/fencing and reconciliation rather than trusting only the checkout redirect.
- Production configuration validation, frozen installs, migration-hash checks and cleanup heartbeats are present. CI actions are pinned and dependency auditing is scheduled.
- The latest recovery/session tests show that successful password changes and resets revoke sessions, while failed attempts preserve them.

## Launch decision and remaining evidence

For a **broad public launch**, I would first close findings 01–03, resolve or disable optional analytics pending finding 04, and exercise the exact release candidate's main account/payment/private-content journeys. Add the database integration job and run a bounded staging load test before substantial promotion. Broader refactoring and CSP hardening can follow in scheduled work; they need not become an open-ended launch delay.

A **controlled initial rollout** with limited traffic, responsive support and active monitoring is reasonable based on the passing checks and the earlier acceptance record, provided the known reliability/privacy limitations are addressed or explicitly scoped out.

This review did not rerun the production `release:check` with verified production credentials, inspect current backup retention/alert delivery, perform real-money checkout, log into customer accounts, execute a fresh restore, test a physical passkey, or measure mobile/accessibility/load coverage. Those items are unverified today, not asserted broken. Confirm the release gate, recent successful cron/alert history and tested rollback/restore evidence for the exact deployment before announcing a full launch. Local credential changes cannot be assumed to be deployed merely because local tests pass.
