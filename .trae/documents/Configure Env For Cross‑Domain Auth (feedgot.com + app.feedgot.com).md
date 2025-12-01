## Summary
- Align environment variables so Better Auth shares secure httpOnly cookies across `feedgot.com` and `app.feedgot.com` and the client points at the centralized auth API.
- Update the web site env and the app env; include production and local‑dev notes.

## What To Set (Production)
### apps/web/.env.example
- `NEXT_PUBLIC_SITE_URL=https://feedgot.com`
- `NEXT_PUBLIC_DASHBOARD_URL=https://app.feedgot.com`
- `NEXT_PUBLIC_LIVE_DEMO_URL=https://feedgot.com` (or your demo URL)

### apps/feed (create or update .env.example / .env)
- `NEXT_PUBLIC_APP_URL=https://app.feedgot.com`
- `AUTH_COOKIE_DOMAIN=feedgot.com`
- `AUTH_TRUSTED_ORIGINS=https://feedgot.com,https://app.feedgot.com,https://*.feedgot.com`
- `BETTER_AUTH_SECRET=` strong secret (or `AUTH_SECRET`) — generate with `openssl rand -base64 32`

## Why These Vars
- `NEXT_PUBLIC_APP_URL` is read by the auth client (`packages/auth/src/client.ts:11`) to send requests to the centralized API.
- `AUTH_COOKIE_DOMAIN` sets the cookie domain to `feedgot.com` so cookies are shared across subdomains (see cookies reference).
- `AUTH_TRUSTED_ORIGINS` constrains accepted origins; wildcards must include protocol (see options reference). Our server reads this list (`packages/auth/src/auth.ts`, trustedOrigins).
- `BETTER_AUTH_SECRET` signs/encrypts cookies and tokens.

## Local Development Notes
- Cross‑subdomain cookies don’t work on bare `localhost`. Use real dev domains (e.g., `*.feedgot.test`) with HTTPS, or disable cross‑subdomain cookies by omitting `AUTH_COOKIE_DOMAIN` locally.
- Example local env (same‑origin dev):
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - `AUTH_TRUSTED_ORIGINS=http://localhost:3000`
  - Leave `AUTH_COOKIE_DOMAIN` unset to avoid incorrect domain cookies.

## Validation
- Confirm cookies show `Secure`, `HttpOnly`, and `Domain=feedgot.com` in production.
- From `app.feedgot.com`, sign in and open a workspace at `workspace.feedgot.com`; header should show authenticated UI.
- Ensure `204 OPTIONS` preflights succeed and the actual POSTs return 200/302 as expected.

## Next Steps
- I will update `apps/web/.env.example` and add `apps/feed/.env.example` entries with the above values, then run a smoke test across `feedgot.com` and `app.feedgot.com`. 