# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Featul is a SaaS feedback management platform built as a Turborepo monorepo. It enables workspaces with multi-tenant subdomain routing, feedback boards, roadmaps, and changelogs.

## Commands

```bash
# Development
bun run dev              # Run all apps
bun run web:dev          # Run web app only (marketing/docs)
bun run app:dev          # Run main app only (via turbo filter)
# Build & Lint
bun run build            # Build all packages
bun run lint             # Lint all packages
bun run format           # Format with Prettier

# Database (Drizzle ORM)
bun run db:generate      # Generate migrations
bun run db:push          # Push schema to database
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
```

## Architecture

### Monorepo Structure

- **apps/app** - Main Next.js 16 application (App Router, Turbopack)
- **apps/web** - Marketing/docs site (Next.js)
- **packages/api** - API layer using jstack (type-safe RPC over Hono)
- **packages/auth** - Authentication with better-auth
- **packages/db** - Database schema and Drizzle ORM setup
- **packages/ui** - Shared component library (Radix UI + Tailwind)
- **packages/editor** - Tiptap rich text editor

### API Layer (packages/api)

Uses **jstack** for type-safe RPC. Key patterns:

```typescript
// Procedure types in jstack.ts
const baseProcedure = j.procedure.use(databaseMiddleware)
const authenticatedProcedure = baseProcedure.use(authMiddleware)
export const publicProcedure = baseProcedure.use(rateLimitMiddlewarePublic)
export const privateProcedure = authenticatedProcedure.use(rateLimitMiddlewarePrivate)

// Router definition pattern
export function createWorkspaceRouter() {
  return j.router({
    bySlug: publicProcedure
      .input(zodSchema)
      .get(async ({ ctx, input, c }) => {
        // ctx.db has database, ctx.session has auth
        return c.superjson({ data })
      }),
  })
}
```

Routers are in `packages/api/src/router/` - one file per domain:
- Core: workspace, board, post, comment, member, team, account
- Features: changelog, changelog-automation, storage, branding, integration
- Other: reservation, comment-mentions

Client usage: `client.workspace.bySlug.$post({ slug: "..." })`

### Authentication (packages/auth)

Uses **better-auth** with:
- Email/password + OTP verification
- Google/GitHub OAuth
- Passkeys and two-factor authentication
- Cross-subdomain cookies for multi-tenant auth
- Organization plugin for workspace membership
- Stripe integration for billing

Session access:
- Server: `getServerSession()` from `@featul/auth/session`
- API: `ctx.session` in private procedures

### Database (packages/db)

PostgreSQL via **Neon serverless** with **Drizzle ORM**.

Schema files in `packages/db/schema/`:
- `auth.ts` - user, session, account, verification, passkey, twoFactor
- `workspace.ts` - workspace, workspaceMember, workspaceDomain
- `post.ts` - post, tag, postTag
- `comment.ts` - comment, commentReaction, commentMention
- `vote.ts` - vote, voteAggregate
- `feedback.ts` - board configuration
- `plan.ts` - billing plans and subscriptions
- `integration.ts` - GitHub integration
- `branding.ts`, `changelog.ts`, `reservation.ts`, `notra.ts`

### Multi-Tenancy

Subdomain routing handled in `apps/app/src/middleware/host.ts`:
- Reserved: www, app, featul, feedgot, staging
- Pattern: `{workspace-slug}.featul.com`
- Custom domains via workspaceDomain table with DNS verification

### State Management

- **Server state**: React Query (TanStack Query)
- **Client state**: Zustand stores in `apps/app/src/lib/` (selection-store, branding-store, filter-store)

## Key Files

- `apps/app/src/app/api/[[...route]]/route.ts` - API catch-all route
- `packages/api/src/index.ts` - Router aggregation
- `packages/api/src/jstack.ts` - Middleware and procedure definitions
- `packages/auth/src/auth.ts` - Better-auth configuration
- `packages/db/schema/index.ts` - Schema exports
- `apps/app/src/middleware.ts` - Next.js middleware entry
- `packages/api/src/services/ratelimiter.ts` - Upstash Redis rate limiting
