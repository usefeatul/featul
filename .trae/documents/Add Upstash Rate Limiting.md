## Overview
- Add rate limiting using Upstash Redis for both public and private API procedures and the Elysia health endpoint.
- Create `packages/api/src/services/ratemiliter.ts` to encapsulate Upstash client and limiter.
- Wire a JStack middleware into `publicProcedure` and `privateProcedure` so all routers inherit limits.
- Add env keys to `apps/feed/.env.example` and dependencies to `@oreilla/api`.

## Files and Changes
- Create: `packages/api/src/services/ratemiliter.ts`
  - Initialize Upstash (`url`/`token` from `process.env`).
  - Export `ratelimitPublic` and `ratelimitPrivate` instances (sliding window).
  - Export helper `limit(key: string)` that returns `{ success, remaining, reset }`.
  - Derive request key: user id when authenticated, else IP from headers (`x-forwarded-for`/`cf-connecting-ip`).
- Update: `packages/api/src/jstack.ts`
  - Add `rateLimitMiddlewarePublic` and `rateLimitMiddlewarePrivate` using the service.
  - Attach to procedures:
    - `publicProcedure = j.procedure.use(databaseMiddleware).use(rateLimitMiddlewarePublic)`
    - `privateProcedure = publicProcedure.use(authMiddleware).use(rateLimitMiddlewarePrivate)`
- Update: `packages/api/src/elysia.ts`
  - Wrap `/api/elysia-health` handler with rate limit check using the service.
  - Skip `OPTIONS` and still allow mounting of JStack router.
- Update: `apps/feed/.env.example`
  - Add
    - `UPSTASH_REDIS_REST_URL=`
    - `UPSTASH_REDIS_REST_TOKEN=`
  - Keep actual secrets in `.env.local` per best practices.
- Update: `packages/api/package.json`
  - Add dependencies: `@upstash/redis`, `@upstash/ratelimit`.

## Limits
- Public endpoints: `60 requests / 60s` per IP.
- Private endpoints: `120 requests / 60s` per user id.
- Health endpoint: `30 requests / 60s` per IP.
- All `OPTIONS` requests bypass limiting.

## Error Handling
- On exceed: throw `HTTPException(429, { message: "Too Many Requests" })` and set `Retry-After`.
- On misconfiguration (missing token/url) or Upstash errors (e.g., WRONGPASS): respond `500` for private, `429`-safe for public if desired; log internally.

## Integration Points (References)
- Elysia mount: `packages/api/src/elysia.ts:4-6`.
- JStack procedures: `packages/api/src/jstack.ts:24-25`.
- Example router usage already inherits procedures: `packages/api/src/router/workspace.ts:12-18,28-31,51-67`.

## Verification
- Add the env values locally (without committing secrets).
- Hit `GET /api/workspace/ping` repeatedly; expect 429 after 60 requests/min.
- Auth and test a private route (e.g., `createWorkspace`); expect higher threshold with per-user key.
- Hit `GET /api/elysia-health`; expect 429 after 30 requests/min.
- Use `curl` examples:
  - `curl -I https://localhost:3000/api/workspace/ping`
  - Loop 65 times and confirm 429 with `Retry-After`.

## Notes
- The provided URL/token values should be placed in runtime env; keep them out of VCS.
- We will implement with official Upstash SDK to avoid custom REST logic and ensure correctness.