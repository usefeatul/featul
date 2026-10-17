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
    // Serialize creates/deletes for this post before acquiring child-row locks.
    database.execute(sql`select id from post where id = ${values.postId} for no key update`),
    database.insert(comment).values({ ...values, id, upvotes: 1 }).returning(),
    database.insert(commentReaction).values({ ...reaction, commentId: id, type: "upvote" }),
    database.update(post).set({ commentCount: sql`coalesce(${post.commentCount}, 0) + 1` }).where(eq(post.id, values.postId)).returning({ commentCount: post.commentCount }),
    ...(values.parentId ? [database.update(comment).set({ replyCount: sql`coalesce(${comment.replyCount}, 0) + 1` }).where(eq(comment.id, values.parentId))] : []),
    ...(activity ? [database.insert(activityLog).values({ ...activity, entityId: id })] : []),
  ])
  return { comment: results[1][0]!, commentCount: results[3][0]?.commentCount ?? 0 }
}

export async function deleteCommentAtomically(database: typeof db, input: {
  commentId: string
  postId: string
  parentId: string | null
  activity: Omit<typeof activityLog.$inferInsert, "entityId">
}) {
  const { activity } = input
  const result = await database.batch([
    database.execute(sql`select id from post where id = ${input.postId} for no key update`),
    database.execute(sql`with removed as (
      delete from comment where id = ${input.commentId} and post_id = ${input.postId} returning id
    ), logged as (
      insert into activity_log (id, workspace_id, user_id, action, action_type, entity, entity_id, title, metadata)
      select ${randomUUID()}, ${activity.workspaceId}, ${activity.userId ?? null}, ${activity.action},
        ${activity.actionType}, ${activity.entity}, id, ${activity.title ?? null}, ${JSON.stringify(activity.metadata ?? {})}::json
      from removed
    ) select id from removed`),
    // The prior statement has completed cascade deletes; this fresh snapshot includes them.
    database.update(post).set({ commentCount: sql`(select count(*)::int from comment where post_id = ${input.postId} and status = 'published')` }).where(eq(post.id, input.postId)),
    ...(input.parentId ? [database.update(comment).set({ replyCount: sql`(select count(*)::int from comment where parent_id = ${input.parentId})` }).where(eq(comment.id, input.parentId))] : []),
  ])
  return result[1].rows.length > 0
}
