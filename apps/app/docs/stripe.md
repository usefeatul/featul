# Stripe Billing with Better Auth

This workspace now uses Stripe through Better Auth's Stripe plugin for checkout, subscription management, and billing portal access.

## Required environment variables

```env
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER_MONTHLY=price_...
STRIPE_PRICE_ID_STARTER_YEARLY=price_...
STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_ID_PROFESSIONAL_YEARLY=price_...
```

## Better Auth endpoints

- Checkout and plan changes: `/api/auth/subscription/upgrade`
- Active workspace subscriptions: `/api/auth/subscription/list`
- Billing portal: `/api/auth/subscription/billing-portal`
- Stripe webhook: `/api/auth/stripe/webhook`

## Webhook events

Configure Stripe to send these events to `/api/auth/stripe/webhook`:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Notes

- Billing is workspace-scoped by `referenceId = workspace.id`.
- Only the workspace owner can manage billing in this version.
- The detailed plugin behavior and schema contract are documented in [`/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md`](/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md).
