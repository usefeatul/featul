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
- `invoice.payment_failed`
- `invoice.upcoming`

## Notes

- Billing is workspace-scoped by `referenceId = workspace.id`.
- Only the workspace owner can manage billing in this version.
- Billing emails are sent to the workspace owner when a paid plan is activated or changed, when a payment fails, and when a renewal is approaching.
- In Stripe Dashboard, set the webhook endpoint's upcoming renewal reminder to `3` days so `invoice.upcoming` arrives on the intended schedule.
- The detailed plugin behavior and schema contract are documented in [`/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md`](/Users/dalyjean/Desktop/featul/docs/better-auth-stripe.md).
