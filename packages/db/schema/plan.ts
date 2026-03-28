import { pgTable, text, timestamp, boolean, integer, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'

// Plan tiers
export const planTier = ['free', 'starter', 'professional'] as const
export type PlanTier = typeof planTier[number]
export const billingNotificationKind = ['upgrade', 'payment_failed', 'payment_due'] as const
export type BillingNotificationKind = typeof billingNotificationKind[number]

// Subscription table for workspace billing
// Note: workspace.plan is denormalized for performance (quick limit checks)
// This table mirrors Better Auth Stripe subscription records for workspace billing.
export const subscription = pgTable('subscription', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    plan: text('plan', { enum: planTier })
        .notNull()
        .default('free'),
    referenceId: text('reference_id')
        .notNull()
        .references(() => workspace.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    status: text('status', {
        enum: ['active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid']
    }).default('incomplete'),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    cancelAt: timestamp('cancel_at'),
    canceledAt: timestamp('canceled_at'),
    endedAt: timestamp('ended_at'),
    seats: integer('seats'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    billingInterval: text('billing_interval', { enum: ['month', 'year'] }),
    stripeScheduleId: text('stripe_schedule_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    subscriptionReferenceIdx: index('subscription_reference_idx').on(table.referenceId),
}))

export type Subscription = typeof subscription.$inferSelect

export const billingNotification = pgTable('billing_notification', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
        .notNull()
        .references(() => workspace.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: billingNotificationKind })
        .notNull(),
    stripeEventId: text('stripe_event_id')
        .notNull(),
    stripeInvoiceId: text('stripe_invoice_id'),
    sentAt: timestamp('sent_at')
        .notNull()
        .defaultNow(),
}, (table) => ({
    billingNotificationStripeEventIdx: uniqueIndex('billing_notification_stripe_event_idx').on(table.stripeEventId),
    billingNotificationWorkspaceIdx: index('billing_notification_workspace_idx').on(table.workspaceId, table.kind),
}))

export type BillingNotification = typeof billingNotification.$inferSelect
