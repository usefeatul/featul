# Trial behavior

Starter has a seven-day trial; Professional has a three-day trial. Checkout uses `payment_method_collection: "if_required"`, preserving the existing option to start a trial without collecting a payment method.

Trial eligibility in the pinned Better Auth Stripe 1.5.5 implementation is checked against subscription history for the **reference ID**, which this app sets to the workspace ID. An earlier version of this document incorrectly described account-wide eligibility. This update preserves the implemented workspace-scoped behavior; an account-wide lifetime-trial policy would require separate enforcement, including across concurrent workspace checkouts.

Trialing subscriptions grant their configured plan. The shared billing synchronizer records trial dates and handles subsequent active, paused, canceled and payment-failure states. The checkout-return handler synchronizes trialing subscriptions immediately, without waiting for a webhook. The app does not rely on the plugin's unused root-level trial callbacks.

The billing page checks the workspace's complete subscription history, including canceled and expired subscriptions. It offers “Start trial” and trial copy only when no trial has been used and no existing subscription needs to be managed. Otherwise, paid plans show “Choose plan” and “Paid plan. Cancel anytime.” The server still enforces eligibility when creating checkout.

A trial that moves to `paused`, `unpaid`, `canceled`, or `incomplete_expired` loses paid access after synchronization. `past_due` retains access under the existing dunning policy. See [Stripe billing](stripe.md) for cache freshness, outage grace, webhook events and deployment instructions.

Verify trial expiry and missing-payment-method behavior in Stripe test mode with your actual account settings before rollout.
