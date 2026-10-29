import { and, eq, or, sql } from "drizzle-orm"
import { activityLog, comment, post, postMerge, postTag } from "@featul/db"
import { ACTIVITY_ACTIONS } from "../activity/actions"

type PostRow = typeof post.$inferSelect

/**
 * Merges `sourcePost` into `targetPost`: votes, comments and tags move to the target and the
 * source is archived as its duplicate. Returns null when the two posts are already merged.
 * Callers check that both posts belong to `workspaceId` and that `userId` can moderate it.
 */
export async function mergePostInto(
  db: any,
  input: {
    sourcePost: PostRow
    targetPost: PostRow
    workspaceId: string
    userId: string
    mergeType: "merge_into" | "merge_here"
    reason?: string | null
    activityMetadata?: Record<string, unknown>
  },
) {
  const { sourcePost, targetPost, userId, mergeType } = input
  const reason = input.reason || null

  const [existingMerge] = await db
    .select()
    .from(postMerge)
    .where(or(
      and(eq(postMerge.sourcePostId, sourcePost.id), eq(postMerge.targetPostId, targetPost.id)),
      and(eq(postMerge.sourcePostId, targetPost.id), eq(postMerge.targetPostId, sourcePost.id))
    ))
    .limit(1)

  if (existingMerge) return null

  const [mergeRecord] = await db.insert(postMerge).values({
    sourcePostId: sourcePost.id,
    targetPostId: targetPost.id,
    mergedBy: userId,
    mergeType,
    reason,
    metadata: {
      consolidatedVotes: true,
      transferredComments: true,
      transferredTags: true,
    }
  }).returning()

  // Consolidate votes (transfer upvotes from source to target)
  await db
    .update(post)
    .set({
      upvotes: sql`${post.upvotes} + ${sourcePost.upvotes}`
    })
    .where(eq(post.id, targetPost.id))

  // Archive the source post
  await db
    .update(post)
    .set({
      status: 'archived',
      duplicateOfId: targetPost.id
    })
    .where(eq(post.id, sourcePost.id))

  // Transfer comments from source to target
  await db
    .update(comment)
    .set({ postId: targetPost.id })
    .where(eq(comment.postId, sourcePost.id))

  // Recount both posts so the moved comments show on the target's count.
  for (const postId of [sourcePost.id, targetPost.id]) {
    await db
      .update(post)
      .set({ commentCount: sql`(select count(*)::int from ${comment} where ${comment.postId} = ${postId} and ${comment.status} = 'published')` })
      .where(eq(post.id, postId))
  }

  // Transfer tags from source to target (avoiding duplicates)
  const sourceTags = await db
    .select({ tagId: postTag.tagId })
    .from(postTag)
    .where(eq(postTag.postId, sourcePost.id))

  const targetTags = await db
    .select({ tagId: postTag.tagId })
    .from(postTag)
    .where(eq(postTag.postId, targetPost.id))

  const targetTagIds = new Set((targetTags as Array<{ tagId: string }>).map((t) => t.tagId))
  const tagsToTransfer = (sourceTags as Array<{ tagId: string }>).filter((st) => !targetTagIds.has(st.tagId))

  if (tagsToTransfer.length > 0) {
    await db.insert(postTag).values(
      tagsToTransfer.map((st) => ({
        postId: targetPost.id,
        tagId: st.tagId,
      }))
    )
  }

  await db.insert(activityLog).values({
    workspaceId: input.workspaceId,
    userId,
    action: ACTIVITY_ACTIONS.POST_MERGED,
    actionType: "update",
    entity: "post",
    entityId: String(targetPost.id),
    title: targetPost.title,
    metadata: {
      sourcePostId: sourcePost.id,
      sourcePostTitle: sourcePost.title,
      mergeType,
      reason,
      roadmapStatus: targetPost.roadmapStatus,
      ...input.activityMetadata,
    },
  })

  return mergeRecord
}
