# Billing Flow (Free → Paid)

## Overview
- Plans are stored directly on `user.plan` and `workspace.plan` as enums (`free`, `starter`, `professional`).
- There is no foreign key to a `plan` table; features are gated in code by reading these enum fields.
- Stripe identifiers and subscription lifecycle live on `workspace`.

## Data Model
- `packages/db/schema/auth.ts:12–14` — `user.plan` enum with default `free`
- `packages/db/schema/workspace.ts:12–14` — `workspace.plan` enum with default `free`
- `packages/db/schema/workspace.ts:24–31` — Stripe and subscription fields:
  - `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `trialEndsAt`, `subscriptionEndsAt`

## New User Journey
- Sign up (email/password or social) via Better Auth
  - User is created with `user.plan = 'free'`
- First workspace creation
  - Workspace is created with `workspace.plan = 'free'`
- Access and features
  - The app checks `workspace.plan` (and/or `user.plan`) to enable/disable paid features

## Upgrade to Paid (Stripe)
- Start checkout
  - Frontend initiates Stripe checkout with the chosen tier (`starter` or `professional`)
  - Pass `workspace.id` so the webhook can update the right record
- Payment success webhook
  - On `checkout.session.completed` / `invoice.paid`:
    - Set `workspace.stripeCustomerId`
    - Set `workspace.stripeSubscriptionId`
    - Set `workspace.subscriptionStatus = 'active'`
    - Update `workspace.plan` to the selected tier (`starter` or `professional`)
    - Optionally set `workspace.trialEndsAt` / `workspace.subscriptionEndsAt`
- Post-upgrade UX
  - Frontend reads `workspace.plan` and unlocks features accordingly

## Downgrade / Cancel
- When a cancellation or non-payment occurs (Stripe webhook):
  - Update `workspace.subscriptionStatus` (e.g., `canceled`, `past_due`)
  - Optionally set `workspace.subscriptionEndsAt`
  - If access should revert, set `workspace.plan = 'free'`

## Feature Gating (Examples)
- Example checks in server routes or components:
  - `if (workspace.plan === 'free') { /* hide paid feature */ }`
  - `const canUseCustomDomain = workspace.plan !== 'free'`
  - `const maxBoards = workspace.plan === 'free' ? 1 : Infinity`

## Operational Notes
- Environment var `DATABASE_URL` must point to the Neon instance used by your app (`packages/db/index.ts:5–10`).
- If Neon still enforces old constraints, drop them:
  - `ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_plan_plan_slug_fk;`
  - `ALTER TABLE "workspace" DROP CONSTRAINT IF EXISTS workspace_plan_plan_slug_fk;`
- Rebuild DB artifacts and push schema:
  - `pnpm --filter @oreilla/db db:generate`
  - `pnpm --filter @oreilla/db db:push`

## Optional: Reintroduce `plan` Metadata
- If you later want centralized pricing/features:
  - Recreate `plan` table for metadata (display name, prices, limits)
  - Seed rows (`free`, `starter`, `professional`)
  - Keep `user.plan`/`workspace.plan` as enums and simply join in code for display/limits
  - Avoid re-adding FKs unless you need strong DB-level integrity

