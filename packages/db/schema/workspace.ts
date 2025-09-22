import { pgTable, text, timestamp, boolean, integer, json, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const workspace = pgTable('workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // for subdomain like mantlz.feedgot.com
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] })
    .notNull()
    .default('free'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // Branding settings
  logo: text('logo'), // URL to logo image
  primaryColor: text('primary_color').default('#3b82f6'), // hex color
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
  hideBranding: boolean('hide_branding').default(false), // "Powered by FeedGot"
  customDomain: text('custom_domain'), // for custom domains
  // Subscription info
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status', { 
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'] 
  }),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
})

export const workspaceMember = pgTable('workspace_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] })
    .notNull()
    .default('member'),
  invitedBy: text('invited_by')
    .references(() => user.id),
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const workspaceInvite = pgTable('workspace_invite', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'member', 'viewer'] })
    .notNull()
    .default('member'),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => user.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Workspace = typeof workspace.$inferSelect
export type WorkspaceMember = typeof workspaceMember.$inferSelect
export type WorkspaceInvite = typeof workspaceInvite.$inferSelect