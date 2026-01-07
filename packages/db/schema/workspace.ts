import { pgTable, text, timestamp, boolean, integer, json, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const workspace = pgTable('workspace', {
  id: text('id').primaryKey().$defaultFn(() => `fl${createId()}`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // for subdomain like mantlz.featul.com
  domain: text('domain').notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['free', 'starter', 'professional'] })
    .notNull()
    .default('free'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  logo: text('logo'), // URL to logo image
  primaryColor: text('primary_color').default('#3b82f6'), // hex color
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
  hideBranding: boolean('hide_branding').default(false), // "Powered by featul"
  customDomain: text('custom_domain'), // for custom domains
  timezone: text('timezone').notNull().default('UTC'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status', { 
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'] 
  }),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
})

export const workspaceDomain = pgTable(
  'workspace_domain',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    // Full host, e.g., "feedback.mantlz.com"
    host: text('host').notNull().unique(),
    // Subdomain label, e.g., "feedback"
    cnameName: text('cname_name').notNull().default('feedback'),
    // Target to point CNAME to, e.g., "origin.featul.com"
    cnameTarget: text('cname_target').notNull().default('origin.featul.com'),
    // TXT verification record name, e.g., "_acme-challenge.feedback.mantlz.com"
    txtName: text('txt_name').notNull(),
    // TXT verification token/value
    txtValue: text('txt_value').notNull(),
    status: text('status', { enum: ['pending', 'verified', 'error'] }).notNull().default('pending'),
    lastVerifiedAt: timestamp('last_verified_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    workspaceDomainWorkspaceUnique: uniqueIndex('workspace_domain_workspace_unique').on(table.workspaceId),
    workspaceDomainWorkspaceIdx: index('workspace_domain_workspace_idx').on(table.workspaceId),
  } as const)
)

export const workspaceMember = pgTable('workspace_member',{
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['admin', 'member', 'viewer'] })
      .notNull()
      .default('member'),
    permissions: json('permissions')
      .$type<{
        canManageWorkspace: boolean
        canManageBilling: boolean
        canManageMembers: boolean
        canManageBoards: boolean
        canModerateAllBoards: boolean
        canConfigureBranding: boolean
      }>()
      .notNull()
      .default({
        canManageWorkspace: false,
        canManageBilling: false,
        canManageMembers: false,
        canManageBoards: false,
        canModerateAllBoards: false,
        canConfigureBranding: false,
      }),
    invitedBy: text('invited_by')
      .references(() => user.id),
    invitedAt: timestamp('invited_at'),
    joinedAt: timestamp('joined_at'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    workspaceMemberUnique: uniqueIndex('workspace_member_workspace_user_unique').on(
      table.workspaceId,
      table.userId,
    ),
    workspaceMemberWorkspaceIdx: index('workspace_member_workspace_idx').on(table.workspaceId),
    workspaceMemberActiveIdx: index('workspace_member_workspace_active_idx').on(table.workspaceId, table.isActive),
  } as const)
)

export const workspaceInvite = pgTable(
  'workspace_invite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: text('workspace_id')
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
  },
  (table) => ({
    workspaceInviteEmailUnique: uniqueIndex('workspace_invite_workspace_email_unique').on(
      table.workspaceId,
      table.email,
    ),
    workspaceInviteWorkspaceIdx: index('workspace_invite_workspace_idx').on(table.workspaceId),
    workspaceInviteActiveIdx: index('workspace_invite_workspace_active_idx').on(table.workspaceId, table.expiresAt, table.acceptedAt),
  } as const)
)

export type Workspace = typeof workspace.$inferSelect
export type WorkspaceMember = typeof workspaceMember.$inferSelect
export type WorkspaceInvite = typeof workspaceInvite.$inferSelect
export type WorkspaceDomain = typeof workspaceDomain.$inferSelect
