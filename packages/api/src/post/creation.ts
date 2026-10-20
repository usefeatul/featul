import { randomUUID } from "node:crypto"
import { sql } from "drizzle-orm"
import { activityLog, db, post, postTag, vote } from "@featul/db"

type Creation = {
  values: typeof post.$inferInsert
  workspaceId: string
  voter: Omit<typeof vote.$inferInsert, "postId" | "type">
  tagIds?: string[]
  activity?: Omit<typeof activityLog.$inferInsert, "entityId">
}

/** Content, initial vote, activity and delivery intents either all commit or all roll back. */
export async function createPostAtomically(database: typeof db, { values, workspaceId, voter, tagIds = [], activity }: Creation) {
  const id = randomUUID()
  const results = await database.batch([
    database.insert(post).values({ ...values, id, upvotes: 1 }).returning(),
    database.insert(vote).values({ ...voter, postId: id, type: "upvote" }),
    ...(tagIds.length ? [database.insert(postTag).values([...new Set(tagIds)].map(tagId => ({ postId: id, tagId })))] : []),
    ...(activity ? [database.insert(activityLog).values({ ...activity, entityId: id })] : []),
    database.execute(sql`insert into webhook_delivery (id, post_id, integration_id)
      select ${id} || ':' || id, ${id}, id from workspace_integration
      where workspace_id = ${workspaceId} and is_active = true
      on conflict (post_id, integration_id) do nothing`),
  ])
  return results[0][0]!
}
