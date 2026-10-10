# Trial behavior

Starter has a seven-day trial; Professional has a three-day trial. Each account gets one trial total across all workspaces and both plans. Eligible checkout uses `payment_method_collection: "if_required"`; accounts that used a trial get a paid checkout with payment collection required.

The app overrides Better Auth Stripe's workspace-scoped trial parameters. Eligibility checks the owner's durable `billing_account.trial_used_at`, subscription history across owned workspaces, and live Stripe customer history (including canceled subscriptions). Synchronization records trial use permanently at the account level, so deleting a workspace cannot restore eligibility. Migration `0025_account_trial.sql` backfills existing recorded trials. Existing subscriptions and trials are not shortened or canceled by this policy change.

Checkout creation holds an account-level database lease as well as the workspace lease. Before creating a new checkout, it expires the account's previous open app subscription checkouts, then checks live history. This prevents concurrent workspaces or older checkout links from granting multiple trials. Abandoning a checkout without starting a subscription does not consume the allowance. If Stripe cannot verify unused eligibility, checkout fails instead of offering an unverified trial; the billing UI hides the trial offer until verification recovers.

Trialing subscriptions grant their configured plan. The shared billing synchronizer records trial dates and handles subsequent active, paused, canceled and payment-failure states. The checkout-return handler synchronizes trialing subscriptions immediately, without waiting for a webhook. The app does not rely on the plugin's unused root-level trial callbacks.

The billing page checks account eligibility and the current workspace's subscription state. Eligible accounts see “Start 7-day free trial” on Starter and “Start 3-day free trial” on Professional, with a Free trial row showing the duration. After either trial is used, all workspaces show “Choose plan”, “Paid plan. Cancel anytime.”, and a trial status of “Not available”. The server independently enforces eligibility when creating checkout.

A trial that moves to `paused`, `unpaid`, `canceled`, or `incomplete_expired` loses paid access after synchronization. `past_due` retains access under the existing dunning policy. See [Stripe billing](stripe.md) for cache freshness, outage grace, webhook events and deployment instructions.

Verify trial expiry and missing-payment-method behavior in Stripe test mode with your actual account settings before rollout.
