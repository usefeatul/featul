import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'

// Plan tiers
export const planTier = ['free', 'starter', 'professional'] as const
export type PlanTier = typeof planTier[number]

// Subscription table for workspace billing
// Note: workspace.plan is denormalized for performance (quick limit checks)
// This table is the source of truth for detailed billing information with Polar
export const subscription = pgTable('subscription', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
        .notNull()
        .unique()
        .references(() => workspace.id, { onDelete: 'cascade' }),

    // Plan details
    plan: text('plan', { enum: planTier })
        .notNull()
        .default('free'),

    // Polar integration
    polarCustomerId: text('polar_customer_id').unique(),
    polarSubscriptionId: text('polar_subscription_id').unique(),
    polarProductId: text('polar_product_id'),
    polarPriceId: text('polar_price_id'),

    // Subscription status
    status: text('status', {
        enum: ['active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid']
    }),

    // Billing details
    billingCycle: text('billing_cycle', { enum: ['monthly', 'yearly'] })
        .notNull()
        .default('monthly'),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),

    // Trial information
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
})

export type Subscription = typeof subscription.$inferSelect
