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
