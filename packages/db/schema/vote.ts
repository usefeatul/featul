import { pgTable, text, timestamp, boolean, integer, json, uuid, uniqueIndex } from 'drizzle-orm/pg-core'
import { post } from './post'
import { comment } from './comment'
import { user } from './auth'

export const vote = pgTable(
  'vote',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .references(() => post.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => comment.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    fingerprint: text('fingerprint'),
    type: text('type', { enum: ['upvote', 'downvote'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    votePostUserUnique: uniqueIndex('vote_post_user_unique').on(table.postId, table.userId),
    voteCommentUserUnique: uniqueIndex('vote_comment_user_unique').on(table.commentId, table.userId),
    votePostAnonUnique: uniqueIndex('vote_post_anon_unique').on(table.postId, table.ipAddress, table.fingerprint),
    voteCommentAnonUnique: uniqueIndex('vote_comment_anon_unique').on(
      table.commentId,
      table.ipAddress,
      table.fingerprint,
    ),
  } as const)
)

// Vote aggregation table for performance
export const voteAggregate = pgTable(
  'vote_aggregate',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .references(() => post.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => comment.id, { onDelete: 'cascade' }),
    upvotes: integer('upvotes').default(0),
    downvotes: integer('downvotes').default(0),
    totalVotes: integer('total_votes').default(0),
    score: integer('score').default(0),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    voteAggregateTargetUnique: uniqueIndex('vote_aggregate_target_unique').on(table.postId, table.commentId),
  } as const)
)

// User voting history for recommendations and analytics
export const userVoteHistory = pgTable('user_vote_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // Voting patterns
  totalVotes: integer('total_votes').default(0),
  upvotesGiven: integer('upvotes_given').default(0),
  downvotesGiven: integer('downvotes_given').default(0),
  
  // Engagement metrics
  lastVotedAt: timestamp('last_voted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Vote = typeof vote.$inferSelect
export type VoteAggregate = typeof voteAggregate.$inferSelect
export type UserVoteHistory = typeof userVoteHistory.$inferSelect