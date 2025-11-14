/Users/dalyjean/Desktop/feedgot/docs/seo-playbook.md
# Feedgot SEO Playbook

A practical, engineering-friendly plan to grow organic rankings and traffic across product feedback, roadmaps, changelogs, and SaaS metrics tools.

## Goals
- Rank for high‑intent keywords around “customer feedback platform”, “public roadmap”, “changelog”, and “SaaS calculators/metrics”.
- Build topical authority using clusters: Definitions → Guides → Calculators → Alternatives → Blog.
- Improve Core Web Vitals for better crawl, UX, and SERP performance.
- Earn links via linkable tools and research.

## Quick Wins
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical/OG/sitemap are correct (`apps/web/src/config/seo.ts:1`)
- [ ] Add blur placeholders to LCP images (Hero) to lower LCP and CLS (`apps/web/src/components/home/hero.tsx:33–39`)
- [ ] Add `BlogPosting` JSON‑LD to blog posts (`apps/web/src/app/(site)/blog/[slug]/page.tsx`)
- [ ] Add `BreadcrumbList` JSON‑LD to definitions and blog pages
- [ ] Add global `SiteNavigationElement` + `SoftwareApplication` (product) JSON‑LD in layout (`apps/web/src/app/layout.tsx`)
- [ ] Use real `lastModified` in `sitemap.ts` where available (`apps/web/src/app/sitemap.ts`)
- [ ] Strengthen internal links between definitions, tools, alternatives, and blog posts

---

## Content Strategy (Clusters)
Create interlinked clusters to signal topical authority.

- Customer Feedback Platform
  - Definition: “Customer Feedback” (you have `/definitions`)
  - Guide: “How to Collect and Prioritize Feedback”
  - Tool: “Feedback Categorization” or “NPS Calculator”
  - Alternatives: “Top X Alternatives” + “X vs Feedgot”
  - Blog: case studies, frameworks

- Public Roadmap
  - Definition + Guide
  - Tool: “Feature Adoption”, “Cohorts” calculators
  - Alternatives + Comparisons
  - Blog: roadmap best practices

- Changelog
  - Definition + Guide to impactful releases
  - Tool: engagement rate / announcement CTR
  - Alternatives
  - Blog: release note templates

- SaaS Metrics (calculators)
  - Tools: LTV, ARPU, ARR, CAC, churn, growth rate (already present)
  - Definitions: each metric’s term page (already present)
  - Guides: “How to improve X”
  - Blog: metrics benchmarks, analyses

Internal linking pattern:
- Each definition links to relevant calculators and guides
- Each calculator links back to the core definition and related blog
- Alternatives and comparisons link to product pages and related tools

---

## Structured Data (Rich Results)
You already emit strong schema for tools and definitions. Extend coverage:

- Blog posts (`apps/web/src/app/(site)/blog/[slug]/page.tsx`)
  - Add `BlogPosting` JSON‑LD: `headline`, `author`, `datePublished`, `image`, `mainEntityOfPage`
  - Add `BreadcrumbList`: `"/blog"` → `"/blog/[slug]"`

- Definitions (`apps/web/src/app/(site)/definitions/[term]/page.tsx:33–36`)
  - Keep `DefinedTerm` + FAQ JSON‑LD
  - Add `BreadcrumbList`: `"/definitions"` → current term

- Global (`apps/web/src/app/layout.tsx`)
  - Keep `Organization` JSON‑LD (`components/seo/OrganizationJsonLd.tsx`)
  - Add `SiteNavigationElement` with key nav labels/URLs
  - Add `SoftwareApplication` or `WebApplication` describing Feedgot:
    - `name`, `url`, `applicationCategory`, `operatingSystem="Web"`, `offers` (free), `logo`

Validate with:
- Google Rich Results Test
- Schema Markup Validator

---

## Technical SEO
- Canonicals: already set via `alternates.canonical` in `lib/seo.ts`. Ensure no duplicate routes.
- Sitemap: use real timestamps where possible
  - Blog: you already use `post.publishedAt` (`apps/web/src/app/sitemap.ts:61`)
  - Definitions/tools: if you store `publishedAt`/`updatedAt`, pass those instead of `now`
- Robots: OK (`apps/web/src/app/robots.ts`); keep `sitemap.xml` current
- Verification: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (`apps/web/src/app/layout.tsx:59–61`)

---

## Core Web Vitals & Performance
- LCP
  - Use `next/image` `placeholder="blur"` for hero LCP (`apps/web/src/components/home/hero.tsx`)
  - Ensure primary font is swap/preloaded if text is LCP (`apps/web/src/app/fonts.ts`)
- CLS
  - Reserve space for dynamic elements; keep aspect ratios for images
- TTFB/INP
  - CDN for static assets; minimize render‑blocking scripts
- Monitoring
  - PageSpeed Insights for field data
  - Lighthouse CI to prevent regressions in CI
  - WebPageTest for network diagnostics

---

## Internal Linking (Checklists)
- Definitions → Calculators/Guides/Blog
  - Add “Use this in calculator” links near formula sections (`apps/web/src/components/definitions/DefinitionDetail.tsx`)
- Tools → Definitions/Blog
  - Link the key term definition and a deeper guide from each calculator
- Alternatives → Product & Tools
  - Ensure “Compare” pages link to relevant tools and case studies
- Site Navigation
  - Include key hubs (Tools, Definitions, Blog, Alternatives) in nav; reflect in `SiteNavigationElement`

---

## Off‑Page & Digital PR
- Earn links via linkable assets
  - Calculators and benchmarks: promote in communities (SaaS, product)
  - Resource pages and directories (Product Hunt, GitHub, Crunchbase)
- HARO/Connectively: provide expert quotes for contextual links
- Guest posts: publish “framework + calculator” articles on partner blogs
- Press page: make it easy for journalists (logo, facts, contact)

---

## Monitoring & Analytics
- Search Console: track impressions/CTR, submit `sitemap.xml`, fix coverage
- Rank tracking: Ahrefs/Semrush/AccuRanker for target queries
- Dashboards: Looker Studio from GSC API (by page type: tools, definitions, alternatives, blog)
- Alerts: Lighthouse CI, GSC coverage changes, backlink alerts

---

## 30/60/90 Plan
- 30 Days
  - Implement JSON‑LD coverage for BlogPosting, Breadcrumbs, SiteNavigationElement, SoftwareApplication
  - Fix LCP/CLS on hero
  - Strengthen internal links across top 20 pages
  - Publish 4 supporting posts (one per cluster)

- 60 Days
  - Ship 6 new calculators + 6 definitions with crosslinks
  - Add 6 comparison/alternatives pages based on demand
  - Begin outreach (resource pages, guest posts, HARO)

- 90 Days
  - Audit and optimize top performers with Clearscope/Surfer
  - Expand clusters based on GSC query data
  - Integrate Lighthouse CI + scheduled crawls (Screaming Frog/Sitebulb)

---

## Tool Stack (Recommended)
- Discovery: Google Search Console, Google Trends, Ahrefs/Semrush, AlsoAsked/AnswerThePublic, LowFruits
- On‑Page: Clearscope/Surfer/Frase/NeuronWriter, Grammarly/Hemingway
- Technical: Screaming Frog, Lighthouse/PSI, WebPageTest, ContentKing
- Structured Data: Rich Results Test, Schema Validator, Merkle generator
- Tracking: Ahrefs Rank Tracker / Semrush Position Tracking, GSC + Looker Studio

---

## Implementation Notes (Code References)
- Global metadata and verification: `apps/web/src/app/layout.tsx:11–62`
- Organization JSON‑LD: `apps/web/src/components/seo/OrganizationJsonLd.tsx:4–8`
- Tools JSON‑LD (FAQ + Breadcrumbs): `apps/web/src/app/(site)/tools/categories/[category]/[tool]/page.tsx:58–71`
- Definitions JSON‑LD: `apps/web/src/app/(site)/definitions/[term]/page.tsx:33–36`
- Sitemap generation: `apps/web/src/app/sitemap.ts:8–78`
- Robots: `apps/web/src/app/robots.ts:4–12`
- Site URL and defaults: `apps/web/src/config/seo.ts:1–36`
- Hero image (LCP): `apps/web/src/components/home/hero.tsx:33–39`
- Fonts (swap): `apps/web/src/app/fonts.ts:4–15`

---

## Success Metrics
- Primary: organic clicks, conversions from organic, rankings for target clusters
- Secondary: Core Web Vitals (LCP/CLS/INP), crawl coverage, CTR per page type
- Cadence: weekly PSI/Lighthouse; monthly GSC and rank tracker reviews
