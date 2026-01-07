import { pgTable, text, timestamp, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { user } from './auth'

export const workspaceSlugReservation = pgTable(
  'workspace_slug_reservation',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text('slug').notNull().unique(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    status: text('status', { enum: ['reserved', 'claimed', 'expired', 'cancelled'] })
      .notNull()
      .default('reserved'),
    expiresAt: timestamp('expires_at').notNull(),
    claimedAt: timestamp('claimed_at'),
    claimedByUserId: text('claimed_by_user_id').references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
    blockedReason: text('blocked_reason'),
  },
  (table) => ({
    workspaceSlugReservationEmailIdx: index('workspace_slug_reservation_email_idx').on(table.email),
    workspaceSlugReservationActiveIdx: index('workspace_slug_reservation_active_idx').on(
      table.slug,
      table.status,
      table.expiresAt,
    ),
  } as const),
)

export type WorkspaceSlugReservation = typeof workspaceSlugReservation.$inferSelect
