# Security Best Practices Report

Date: February 22, 2026
Scope: `/Users/dalyjean/Desktop/featul/apps/app`, `/Users/dalyjean/Desktop/featul/packages/api`, `/Users/dalyjean/Desktop/featul/packages/auth`

## Executive Summary
The review found multiple high-impact authorization and cross-origin trust issues. The most severe finding is a cross-origin trust model that allows credentialed API access from tenant-controlled origins, combined with cookie/session settings and no API-level CSRF validation. Additional findings include private-board data exposure via public endpoints, PII leakage (commenter emails), and upload abuse paths.

## Critical Findings

### [CRIT-001] Cross-origin credentialed access can be granted to tenant-controlled origins (cross-tenant CSRF/data exfil risk)
**Impact:** A malicious tenant-controlled origin can perform authenticated state-changing requests and read sensitive API responses for logged-in victims.

**Evidence**
- Trusted-origin decision allows DB-derived domains/custom domains: `packages/auth/src/trust.ts:31`, `packages/auth/src/trust.ts:33`, `packages/auth/src/trust.ts:35`.
- CORS allows credentials for trusted origins: `packages/auth/src/trust.ts:44`.
- CORS wrapper is applied globally to API and auth handlers: `apps/app/src/app/api/[[...route]]/route.ts:6`, `apps/app/src/app/api/[[...route]]/route.ts:7`, `apps/app/src/app/api/auth/[...all]/route.ts:8`, `apps/app/src/app/api/auth/[...all]/route.ts:10`.
- Session cookies are configured as cross-site (`SameSite=None`): `packages/auth/src/auth.ts:167`.
- API auth middleware validates session but does not validate Origin/CSRF token: `packages/api/src/jstack.ts:15`, `packages/api/src/jstack.ts:17`.
- Custom domains are persisted without ownership verification in the fast path: `packages/api/src/router/workspace.ts:348`, `packages/api/src/router/workspace.ts:357`.

**Why this is exploitable**
1. Browser requests from attacker-controlled trusted origin can pass preflight and include cookies.
2. API private procedures trust cookie session and do not require CSRF token/origin checks.
3. Responses are readable due credentialed CORS.

**Recommended fix**
- Remove DB-derived origin trust for privileged endpoints; use a strict static allowlist for auth/private APIs.
- Enforce CSRF protection on all cookie-authenticated mutating endpoints (Origin/Referer + CSRF token).
- Narrow `withCors` usage to explicitly public, read-only routes.
- Do not treat `workspace.customDomain` as trusted until DNS ownership is verified.

## High Findings

### [HIGH-001] Public endpoints leak private-board metadata by omitting `isPublic` filters
**Impact:** Unauthenticated users can enumerate private workspace activity and content metadata.

**Evidence**
- Public search endpoint filters `board.isSystem` but not `board.isPublic`: `packages/api/src/router/board.ts:356`, `packages/api/src/router/board.ts:379`.
- Public count endpoint filters `board.isSystem` but not `board.isPublic`: `packages/api/src/router/board.ts:700`, `packages/api/src/router/board.ts:723`.
- Public workspace status counts similarly omit `board.isPublic`: `packages/api/src/router/workspace.ts:128`, `packages/api/src/router/workspace.ts:142`.

**Recommended fix**
- Add `eq(board.isPublic, true)` to all public queries returning post/status/tag/search data.
- Add regression tests that verify private boards are invisible via public procedures.

### [HIGH-002] Public comment listing returns commenter email addresses (PII disclosure)
**Impact:** Any unauthenticated caller can harvest commenter emails for phishing/spam.

**Evidence**
- Public comment list procedure: `packages/api/src/router/comment.ts:62`.
- Selects `authorEmail`: `packages/api/src/router/comment.ts:119`.
- Returns spread row to clients (includes email): `packages/api/src/router/comment.ts:199`, `packages/api/src/router/comment.ts:212`.

**Recommended fix**
- Remove `authorEmail` from public response models.
- Keep email server-only or expose only to authorized workspace staff via private procedures.

### [HIGH-003] Post/comment creation paths do not enforce workspace membership or board visibility
**Impact:** Unauthorized users can create content in non-public boards when they know slugs/IDs.

**Evidence**
- `post.create` is public: `packages/api/src/router/post.ts:13`.
- Creation permission only checks anonymous case and `allowAnonymous`; no membership/`isPublic` check for authenticated users: `packages/api/src/router/post.ts:44`, `packages/api/src/router/post.ts:45`.
- `comment.create` is public and only checks comment lock/allow-comments; no `isPublic` or membership authorization: `packages/api/src/router/comment.ts:216`, `packages/api/src/router/comment.ts:223`, `packages/api/src/router/comment.ts:244`, `packages/api/src/router/comment.ts:250`.

**Recommended fix**
- Enforce explicit access policy per action:
  - public board + anonymous setting for anonymous writes,
  - workspace membership/role for private board writes.
- Add integration tests for unauthorized create attempts against private boards/posts.

## Medium Findings

### [MED-001] Upload URL issuance is overly permissive and abuse-prone
**Impact:** Attackers can request signed upload URLs and upload arbitrary content with minimal validation, increasing storage abuse and active-content risk.

**Evidence**
- Public signed upload URL endpoint: `packages/api/src/router/storage.ts:101`.
- Only workspace existence is checked; no authz/rate limit/content restrictions: `packages/api/src/router/storage.ts:104`, `packages/api/src/router/storage.ts:117`.
- Input validation allows any `contentType`/filename shape without allowlists: `packages/api/src/validators/storage.ts:6`, `packages/api/src/validators/storage.ts:20`.
- Global API rate limiting middleware is currently disabled: `packages/api/src/jstack.ts:24`, `packages/api/src/jstack.ts:55`.

**Recommended fix**
- Require auth + permission checks (or strict abuse controls) for upload URL issuance.
- Enforce MIME/extension allowlists and object size limits.
- Scope upload prefixes to immutable, policy-checked paths.
- Re-enable route-level rate limiting for upload-related procedures.

## Notes
- Security headers/CSP were not fully assessed at runtime edge/CDN level in this review.
- Findings are code-based and prioritized by exploitability and impact.
