import { randomUUID } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { activityLog, comment, commentReaction, db, post } from "@featul/db"

type CommentValues = typeof comment.$inferInsert

type Creation = {
  values: CommentValues
  reaction: Omit<typeof commentReaction.$inferInsert, "commentId" | "type">
  activity?: Omit<typeof activityLog.$inferInsert, "entityId">
}

/** Neon batch executes every statement in one transaction, including rollback. */
export async function createCommentAtomically(database: typeof db, { values, reaction, activity }: Creation) {
  const id = randomUUID()
  const results = await database.batch([
    database.insert(comment).values({ ...values, id, upvotes: 1 }).returning(),
    database.insert(commentReaction).values({ ...reaction, commentId: id, type: "upvote" }),
    database.update(post).set({ commentCount: sql`coalesce(${post.commentCount}, 0) + 1` }).where(eq(post.id, values.postId)).returning({ commentCount: post.commentCount }),
    ...(values.parentId ? [database.update(comment).set({ replyCount: sql`coalesce(${comment.replyCount}, 0) + 1` }).where(eq(comment.id, values.parentId))] : []),
    ...(activity ? [database.insert(activityLog).values({ ...activity, entityId: id })] : []),
  ])
  return { comment: results[0][0]!, commentCount: results[2][0]?.commentCount ?? 0 }
}
