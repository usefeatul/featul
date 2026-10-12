# Featul Web

`apps/web` is the public-facing Featul website. It covers the landing page, docs, blog, pricing, legal pages, SEO pages, integrations content, and the library of business tools and definitions used to attract and educate users.

## What Lives Here

- Marketing homepage and conversion-focused site pages
- Docs pages under `src/app/(docs)`
- Blog routes and content rendering
- Pricing, legal, integrations, use-case, alternatives, and glossary pages
- SEO-focused business calculators and content templates
- Static assets including the dashboard screenshots and brand imagery in `public/`

## Important Folders

```text
src/
├── app/                       # Public routes, docs routes, and API proxy routes
├── components/home/           # Landing page sections
├── components/docs/           # Docs layouts and markdown rendering
├── components/blog/           # Blog UI
├── components/tools/          # Calculator and tool components
├── components/seo/            # SEO templates and structured data components
├── content/legal/             # Legal markdown content
├── config/                    # Navigation, footer, tools, legal, and SEO config
├── data/                      # FAQ and structured content data
└── lib/                       # Query, markdown, SEO, and content helpers
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Markdown content rendering
- Marble CMS integration for blog content
- Structured data and SEO helpers

## Setup

From the repo root, create the local env file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Common values in this env file include:

- Marble CMS credentials
- public site and dashboard URLs
- consent tooling URLs
- analytics tokens
- optional search-console verification

## Running The Site

Recommended from the repo root:

```bash
bun run web:dev
```

Or from inside this folder:

```bash
bun dev
```

## Main Route Groups

- `/` for the marketing homepage
- `/docs/*` for product documentation
- `/blog/*` for content and articles
- `/tools/*` for calculator pages
- `/alternatives/*` for comparison pages
- `/use-cases/*` for use-case landing pages
- `/integrations/*` for integration pages
- `/definitions/*` for glossary terms
- `/pricing`, `/privacy`, `/terms`, and `/gdpr` for commercial and legal pages

## Notes

This workspace is best read alongside the root README because it is designed to work with the shared UI, data, and auth packages from the monorepo.

## Hosted consent

This app uses `c15t@3.0.0` (upgraded from `@c15t/nextjs` 2.x). The root
`src/app/layout.tsx` mounts one `ConsentProvider` from
`src/components/legal/consent.tsx`, including on documentation routes. Consent
resolves in the browser so static pages and ISR remain cacheable. The banner,
preferences dialog and persistent **Privacy choices** control share that provider.

- Organization: `daly-jean-111nte1o`; project: `featul`.
- Runtime: `https://featul-daly-jean-111nte1o.inth.app/`.
- Public build variable: `NEXT_PUBLIC_C15T_URL`, also listed in `turbo.json`.
  The supplied project URL is the fallback. Rebuild after changing this variable.
- Registered trusted origins supplied for setup: `*`, including local ports such
  as `localhost:3100`, production `featul.com`, and preview hosts.
- [Consent overview](https://inth.com/dashboard/daly-jean-111nte1o/featul/consent/overview)
  and [settings](https://inth.com/dashboard/daly-jean-111nte1o/featul/consent/settings/general).

Optional tools require both effective permission and a recorded explicit grant,
including under regional policies that otherwise permit loading without a choice.
`useScriptLoader` is c15t's loader; there is no separate vendor bootstrap. c15t
reloads after withdrawal to stop already-executed vendor code. The hosted policy
controls when the banner appears; configure an opt-in policy for the UK with
measurement and functionality in scope.

| Tool | Category and configuration | Previous loading path | Event callers |
| --- | --- | --- | --- |
| Seline | `measurement`; custom script in `src/lib/scripts.ts`, retaining `https://cdn.seline.com/seline.js` and `NEXT_PUBLIC_SELINE_TOKEN` | Unconditional `next/script` in the root layout, removed | No custom event calls found; the permitted vendor script owns page measurement |
| Google preferred source | `functionality`; custom script in `src/lib/scripts.ts`, retaining the publisher URL and `preferred-sources-control="manual"` | `ensurePreferredSourceScript` in `src/lib/preferred-source.ts`, removed | `src/components/preferred-source/button.tsx` retains theme/language initialization and `addPreferredSource`; before permission the button opens preferences |

Neither tool has a helper in `@c15t/integrations@3.0.0`; these use the documented
custom-script API, so the unused integrations package was removed. There are no
Google Analytics, GTM containers, pixels, or app-owned browser metrics endpoints
in this workspace. Marble CMS requests retrieve content, and JSON-LD scripts and
scroll-position storage are site functionality. PostHog, Sentry and server-side
product events belong to `apps/app` and were outside this change.

The old `/api/c15t` proxy, its helper and proxy-specific tests were removed.
The marketing app no longer writes the shared `featul_analytics` cookie or uses
its old callbacks. That cookie and its consumers remain in the product app;
marketing consent no longer grants product analytics. c15t reads its own supported
v2 choices during migration; custom product choices are not imported.

### Verification and remaining setup

On 12 October 2026, typecheck, lint, SEO validation, the production build and the
36 remaining security tests passed. Exactly one `@c15t/core` version is resolved:
3.0.0. The complete documented codemod sequence ran first in dry-run mode, then
for real; all migration TODOs were resolved.

The supplied runtime returned `404 Not Found` for `/init` and `/manifest`.
A fresh Chrome session on the production server at `localhost:3100` made no
optional vendor requests and stored no choice while initialization failed.
No hosted consent save has been verified.

Local browser journeys use simulated responses generated from the installed
c15t policy schema, intercepted vendor scripts, and a temporary Seline test token.
Passed: first-visit blocking, reject and accept persistence, client navigation,
one load per vendor, withdrawal/reload, granular measurement-only choices,
no-prompt US policy, unknown-location fallback, blocked backend, keyboard focus
trapping/return, a 375px viewport, reduced motion and dark mode. These validate
client behavior only, not Inth persistence or real vendor events. Existing v2
cookie migration and non-English translations have not been browser-tested.
The actual deployment still needs `NEXT_PUBLIC_SELINE_TOKEN` if analytics is wanted.

The Inth project owner needs to restore/provision the supplied runtime and verify
its UK policy, then repeat the real accept/reject/withdraw journeys and confirm
successful consent POSTs in the overview. The runtime issue could not be reported
through feedback because the CLI had no authenticated session; no feedback
reference was issued. Reproduction: GET either runtime `/init` or `/manifest`
returns HTTP 404 rather than policy JSON (Vercel trace for `/init`:
`lhr1::fra1::bjs5m-1791834598412-20d6cab51d9a`). No account, organization or project
was created, and nothing was deployed.

Changed files: `apps/web/package.json`, `bun.lock`, `turbo.json`,
`apps/web/.env.example`, the existing ignored `apps/web/.env.local`, this README,
`apps/web/src/app/layout.tsx`, `apps/web/src/app/(site)/layout.tsx`,
`apps/web/src/app/globals.css`, `apps/web/src/components/legal/consent.tsx`,
`apps/web/src/components/preferred-source/button.tsx`,
`apps/web/src/lib/preferred-source.ts`, and new `apps/web/src/lib/scripts.ts`.
Removed: `apps/web/src/app/api/c15t/[...path]/route.ts`,
`apps/web/src/lib/consent.ts`, and `tests/security/consent.test.ts`; the obsolete
proxy test was also removed from `tests/security/storage.test.ts`.
