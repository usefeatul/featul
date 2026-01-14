import { pgTable, text, timestamp, boolean, integer, json, uuid, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { post } from './post'
import { comment } from './comment'
import { user } from './auth'
import { fingerprintColumn } from './shared'

export const vote = pgTable(
  'vote',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    postId: text('post_id')
      .references(() => post.id, { onDelete: 'cascade' }),
    commentId: text('comment_id')
      .references(() => comment.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' }),
    ...fingerprintColumn,
    type: text('type', { enum: ['upvote'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    votePostUserUnique: uniqueIndex('vote_post_user_unique').on(table.postId, table.userId),
    votePostAnonUnique: uniqueIndex('vote_post_anon_unique').on(table.postId, table.fingerprint),
    voteCommentUserUnique: uniqueIndex('vote_comment_user_unique').on(table.commentId, table.userId),
    voteCommentAnonUnique: uniqueIndex('vote_comment_anon_unique').on(table.commentId, table.fingerprint),
  } as const)
)

export type Vote = typeof vote.$inferSelect