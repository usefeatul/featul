# UserJot Trial Behavior

This document explains how billing trials work in UserJot, what scope each rule applies to, and what policy we want to keep as the default going forward.

## Overview

- `free` is a permanent plan, not a time-limited trial.
- Intended paid-plan trial policy:
  - `starter`: 7-day free trial
  - `professional`: 3-day free trial
- Billing access during a trial should behave like a paid subscription while the subscription is in `trialing`.

## The Important Scope Split

Two different scopes are involved in UserJot billing:

- Billing and subscriptions are workspace-scoped.
- Trial eligibility is account-scoped.

That distinction matters:

- A Stripe subscription is attached to a workspace through `referenceId = workspace.id`.
- Only the workspace owner is allowed to start checkout or manage billing for that workspace.
- Trial reuse prevention comes from the Better Auth Stripe plugin, and that rule is enforced per account, not per workspace.

Result:

- A trial is not effectively "one trial per workspace".
- With the current plugin behavior, it is effectively "one lifetime trial per account across paid plans".

## What the Current Code Enforces

### Workspace-scoped billing

The billing integration authorizes subscription actions against a workspace reference ID and checks that the current user owns that workspace.

Code references:

- [`/Users/dalyjean/Desktop/featul/packages/auth/src/auth.ts`](/Users/dalyjean/Desktop/featul/packages/auth/src/auth.ts)
- [`/Users/dalyjean/Desktop/featul/packages/auth/src/billing.ts`](/Users/dalyjean/Desktop/featul/packages/auth/src/billing.ts)

Current enforced behavior:

- The subscription plugin is configured with `referenceId = workspace.id`.
- `authorizeReference` checks `isWorkspaceBillingOwner(workspaceId, user.id)`.
- Only the workspace owner can create, upgrade, or manage a subscription for that workspace.

### Trialing is treated as paid access

UserJot already treats `trialing` as a paid-access subscription state.

Code references:

- [`/Users/dalyjean/Desktop/featul/packages/auth/src/billing.ts`](/Users/dalyjean/Desktop/featul/packages/auth/src/billing.ts)
- [`/Users/dalyjean/Desktop/featul/apps/app/src/lib/workspace.ts`](/Users/dalyjean/Desktop/featul/apps/app/src/lib/workspace.ts)

Current enforced behavior:

- `trialing`, `active`, and `past_due` are treated as paid states when resolving the effective workspace plan.
- If no valid paid or trialing Stripe subscription is found, the workspace resolves back to `free`.
- The app already reads `trialEnd` from the subscription row and surfaces it in workspace billing state.

## Trial Lifecycle

The expected lifecycle is:

1. The workspace owner starts checkout from the billing page.
2. Stripe creates a subscription for that workspace.
3. If the plan has a trial configured, the subscription enters `trialing`.
4. While the subscription is `trialing`, the workspace gets the paid plan's entitlements.
5. If the trial ends without a successful paid conversion, the workspace should no longer resolve to the paid plan and should fall back to `free`.

The subscription schema already supports this lifecycle with:

- `status`
- `trialStart`
- `trialEnd`
- `stripeSubscriptionId`
- `referenceId`

Related schema and docs:

- [`/Users/dalyjean/Desktop/featul/packages/db/schema/plan.ts`](/Users/dalyjean/Desktop/featul/packages/db/schema/plan.ts)
- [`/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md`](/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md)

## Trial Reuse Rules

The Better Auth Stripe plugin automatically prevents users from getting multiple free trials across plans.

Source reference:

- [`/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md`](/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md)

What this means in practice:

- If a user account has already consumed a trial on `starter`, that same account should not get a new trial on `professional`.
- This remains true even if the second checkout is for a different workspace owned by the same account.
- A different owner account can still be eligible for a trial, even if another account has already used one.

## Examples

### Example 1: Same account, different workspace

- User A owns Workspace A and starts a 7-day `starter` trial.
- Later, User A creates Workspace B and tries to start a 3-day `professional` trial.
- Expected result: no second trial is offered, because the same account has already consumed a trial.

### Example 2: Different account, different workspace

- User A has already used a trial on one workspace.
- User B creates a separate workspace and is the billing owner.
- Expected result: User B can still be eligible, because trial reuse prevention is per account.

### Example 3: Existing paid workspace

- User A has a paid workspace with no trial involved.
- User A later tries to start a trial on another paid plan or another workspace.
- Eligibility depends on whether that same account has already consumed a trial before.
- The key decision point is trial history for the account, not simply whether a workspace exists.

## Implementation Notes

The Better Auth Stripe plan shape supports per-plan trials through `freeTrial.days`.

Expected configuration shape:

```ts
{
  name: "starter",
  priceId: "...",
  freeTrial: { days: 7 }
}

{
  name: "professional",
  priceId: "...",
  freeTrial: { days: 3 }
}
```

Important note about the current repository state:

- The app already has trial lifecycle hooks such as `onTrialStart`, `onTrialEnd`, and `onTrialExpired`.
- The subscription table already stores `trialStart` and `trialEnd`.
- The current codebase does not yet define per-plan `freeTrial.days` inside [`/Users/dalyjean/Desktop/featul/packages/auth/src/auth.ts`](/Users/dalyjean/Desktop/featul/packages/auth/src/auth.ts).

So:

- Trial support is already wired structurally.
- The exact 7-day and 3-day durations described here are the intended policy and need to be configured in the Stripe plan definitions before they are live.

## Decision and Caveat

### Current recommended policy

Stick with:

- workspace-scoped billing
- account-scoped trial eligibility
- one lifetime trial per account across paid plans

Reasons:

- This matches the current Better Auth Stripe plugin behavior.
- It keeps trial abuse prevention simple.
- It avoids custom state and edge-case logic for "trial per workspace".

### What "trial per workspace" would mean

If the business later wants "one trial per workspace", the current plugin default is not enough on its own.

That change would likely require custom logic such as:

- app-controlled eligibility checks before checkout
- custom persistence for trial consumption rules
- explicit handling for owner changes, duplicate workspaces, and anti-abuse cases

Recommendation:

- Do not move to "trial per workspace" unless there is a strong business reason that justifies the additional complexity.

## Source of Truth

Use this file as the internal reference for trial behavior and policy.

For related billing setup details, see:

- [`/Users/dalyjean/Desktop/featul/apps/app/docs/stripe.md`](/Users/dalyjean/Desktop/featul/apps/app/docs/stripe.md)
- [`/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md`](/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md)
