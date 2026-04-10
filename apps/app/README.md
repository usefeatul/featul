# Featul App

`apps/app` is the main Featul product application. This workspace contains the signed-in dashboard experience, authentication flows, workspace setup, request management, public board and changelog routes, widget endpoints, and the product settings area.

## What Lives Here

- Next.js 16 app-router application for the core product
- Auth flows including sign-in, sign-up, password reset, verification, and two-factor routes
- Workspace routes for dashboard, requests, roadmap, changelog, invite, reserve, and onboarding flows
- Public subdomain pages for boards, roadmap, changelog, and request detail pages
- Widget routes under `src/app/widget`
- Shared UI and product components under `src/components`

## Important Folders

```text
src/
├── app/                 # Route handlers, pages, auth flows, widget routes, workspace routes
├── components/          # Product UI for requests, settings, sidebar, changelog, roadmap, editor
├── hooks/               # React hooks used across the app
├── lib/                 # Helpers, server utilities, and app-specific logic
├── middleware/          # Middleware-related code
├── config/              # App configuration
└── types/               # Shared types for this workspace
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Better Auth
- Drizzle ORM with Postgres/Neon
- TanStack React Query
- Zustand
- Sentry and PostHog integrations

## Setup

From the repo root, create the local env file:

```bash
cp apps/app/.env.example apps/app/.env.local
```

The app env file includes values for:

- app URL and cookie domain
- Better Auth secrets and trusted origins
- database access
- Redis
- GitHub app integration
- Stripe billing
- passkeys
- analytics and error monitoring

## Running The App

Recommended from the repo root:

```bash
bun run app:dev
```

Or from inside this folder:

```bash
bun dev
```

By default the app uses the Next.js dev server with Turbopack.

## Related Packages

- `@featul/api` for shared routers, validators, and services
- `@featul/auth` for auth and billing logic
- `@featul/db` for database schema and migrations
- `@featul/editor` for editor primitives
- `@featul/ui` for shared UI components and icons

## Notes

If you also run `apps/web` locally at the same time, one of the apps may move off port `3000` automatically depending on which dev server starts first. optionnaly you can run `bun run app:dev --port 3001` to run the app on port 3001
