## Scope
- Rename brand, package scope, imports, URLs, emails, and dev hostnames from `feedgot` to `oreilla`.
- Keep environment variable names as-is; update their values to the new domain.
- Avoid changing data already stored in the database unless explicitly migrated.

## What To Rename
- NPM scope and package names:
  - `@oreilla/{ui,api,auth,db,tsconfig}` → `@oreilla/{ui,api,auth,db,tsconfig}`
  - Root `package.json` `name: "feedgot"` → `"oreilla"`
- Imports in app and packages:
  - Example: `/apps/feed/src/app/api/[[...route]]/route.ts:1` `import { app } from "@oreilla/api/elysia"` → `"@oreilla/api/elysia"`
- Domains/URLs/emails:
  - `oreilla.com` → `oreilla.com`
  - `app.oreilla.com` → `app.oreilla.com`
  - `status.oreilla.com` → `status.oreilla.com`
  - `origin.oreilla.com` → `origin.oreilla.com`
  - `contact@oreilla.com` → `contact@oreilla.com`, `no-reply@oreilla.com` → `no-reply@oreilla.com`
  - API/CDN/widget endpoints under `/plan/*.md` → `api.oreilla.com`, `cdn.oreilla.com`, `widget.oreilla.com`
- Display branding strings:
  - `Feedgot`/`FeedGot` → `Oreilla` (case-sensitive replacements in SEO configs and UI)
- Dev hostname:
  - `app.oreillalocalhost` → `app.oreilla.localhost`

## Replacement Map
- Text replacements (code and content):
  - `@oreilla/` → `@oreilla/`
  - `feedgot` → `oreilla` (lowercase identifiers, slugs, folder names when appropriate)
  - `Feedgot` → `Oreilla` (brand)
  - `FeedGot` → `Oreilla` (rare; unify casing)
  - URLs: `https://oreilla.com`, `https://app.oreilla.com`, `https://status.oreilla.com`, `https://{slug}.oreilla.com`, `origin.oreilla.com`
  - Emails: `contact@oreilla.com`, `no-reply@oreilla.com`

## Automated Changes (Commands)
- Preview matches:
  - `rg -n --glob 'apps/**' --glob 'packages/**' '(@oreilla|feedgot|Feedgot|FeedGot|origin\.oreilla\.com|status\.oreilla\.com)'`
- Update imports and scope:
  - `rg -l --glob 'apps/**' --glob 'packages/**' '@oreilla/' | xargs sed -i '' -E 's/@oreilla\//@oreilla\//g'`
- Update package names and inter-deps:
  - `rg -l --glob 'packages/**/package.json' '"name":\s*"@oreilla/' | xargs sed -i '' -E 's/"@oreilla\//"@oreilla\//g'`
  - `rg -l --glob 'apps/**/package.json' --glob 'packages/**/package.json' '@oreilla/(ui|api|auth|db|tsconfig)' | xargs sed -i '' -E 's/@oreilla\//@oreilla\//g'`
  - Root name: `sed -i '' -E 's/"name":\s*"feedgot"/"name": "oreilla"/g' package.json`
- Update branding strings:
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'Feedgot|FeedGot' | xargs sed -i '' -E 's/Feedgot/Oreilla/g; s/FeedGot/Oreilla/g'`
- Update domains/URLs/emails:
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'feedgot\.com' | xargs sed -i '' -E 's/feedgot\.com/oreilla.com/g'`
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'app\.oreilla\.com' | xargs sed -i '' -E 's/app\.oreilla\.com/app.oreilla.com/g'`
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'status\.oreilla\.com' | xargs sed -i '' -E 's/status\.oreilla\.com/status.oreilla.com/g'`
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'origin\.oreilla\.com' | xargs sed -i '' -E 's/origin\.oreilla\.com/origin.oreilla.com/g'`
  - `rg -l --glob 'apps/**' --glob 'packages/**' 'contact@oreilla\.com|no-reply@oreilla\.com' | xargs sed -i '' -E 's/contact@oreilla\.com/contact@oreilla.com/g; s/no-reply@oreilla\.com/no-reply@oreilla.com/g'`
- Exclusions:
  - Add `--glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**'` to all commands.

## Manual Updates
- Environment values:
  - `/apps/web/.env.example`: set `NEXT_PUBLIC_*` to `oreilla.com` and `app.oreilla.com`.
  - `/apps/feed/.env.example`: set `NEXT_PUBLIC_APP_URL`, `AUTH_COOKIE_DOMAIN=oreilla.com`, `AUTH_TRUSTED_ORIGINS` to `https://oreilla.com, https://app.oreilla.com, https://*.oreilla.com`.
  - Local `.env` files under `/apps/{web,feed}/` similar changes.
- CNAME target defaults:
  - `/packages/db/schema/workspace.ts` and drizzle files: replace `'origin.oreilla.com'` with `'origin.oreilla.com'`.
- UI and SEO configs:
  - `/apps/web/src/config/seo.ts`, `/apps/feed/src/config/seo.ts`: update `DEFAULT_TITLE`, `TITLE_TEMPLATE`, organization name, emails.
- Dev hostname:
  - `/apps/feed/package.json`: dev command hostname to `app.oreilla.localhost`.
- Middleware and URL builders:
  - `/apps/feed/src/middleware/host.ts`, `/apps/feed/src/config/nav.ts`, `/apps/feed/src/lib/seo.ts`: update `.oreilla.com` logic.
- Emails:
  - `/packages/auth/src/email/**`: update from address and URLs.

## Database & Data Safety
- Do not mass-rewrite stored records. Only update default values and generated URLs.
- If you need to migrate existing `*.oreilla.com` records, run a targeted migration with backups and audit logs.

## Verification
- Reinstall and link: `pnpm install`
- Build and typecheck: `pnpm -r build`; `pnpm -r lint`; `pnpm -r typecheck`
- Run dev apps and smoke test:
  - Web: check branding, links, demo/status URLs.
  - Feed: verify subdomain routing, CNAME target, email templates.
- Validate envs: cookies domain, trusted origins, SEO metadata.

## Risks & Rollback
- Commit changes on a branch and push for CI.
- If issues arise, revert specific replacements or adjust mapping.
- Coordinate DNS/SSL updates for `oreilla.com` subdomains and API/CDN endpoints before production deploy.

## Next Step
- After you confirm, I will execute the replacements, update configs, and verify builds locally end-to-end.