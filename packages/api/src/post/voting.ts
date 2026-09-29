import { randomUUID } from "node:crypto"
import { sql, type SQL } from "drizzle-orm"
import { db } from "@featul/db"
import { HTTPException } from "hono/http-exception"

type Voter = { userId?: string | null; widgetUserId?: string | null; fingerprint?: string | null }
type Activity = { workspaceId: string; title: string; metadata?: Record<string, unknown> }
function identity(actor: Voter): SQL {
  if (actor.userId) return sql`user_id = ${actor.userId}`
  if (actor.widgetUserId) return sql`widget_user_id = ${actor.widgetUserId}`
  if (actor.fingerprint) return sql`user_id is null and widget_user_id is null and fingerprint = ${actor.fingerprint}`
  throw new HTTPException(400, { message: "Missing identification" })
}

function activityCte(activity: Activity | undefined, actor: Voter, entity: "post" | "comment", id: string): SQL {
  if (!activity) return sql``
  const prefix = entity === "post" ? "post" : "comment"
  return sql`, logged as (insert into activity_log (id, workspace_id, user_id, action, action_type, entity, entity_id, title, metadata)
    select ${randomUUID()}, ${activity.workspaceId}, ${actor.userId || null},
      case when exists(select 1 from added) then
        case when exists(select 1 from removed) then ${`${prefix}_vote_changed`} else ${`${prefix}_voted`} end
        else ${`${prefix}_vote_removed`} end,
      case when exists(select 1 from added) then
        case when exists(select 1 from removed) then 'update' else 'create' end
        else 'delete' end,
      ${entity}, ${id}, ${activity.title}, ${JSON.stringify(activity.metadata || {})}::json
    from changed returning id)`
}

// Lock the target in a separate statement: the mutation then gets a fresh
// READ COMMITTED snapshot after any competing voter has committed.
export async function togglePostVote(database: typeof db, postId: string, actor: Voter, activity?: Activity) {
  const actorWhere = identity(actor)
  const results = await database.batch([
    database.execute(sql`select id from post where id = ${postId} for update`),
    database.execute(sql`with existing as (select id from vote where post_id = ${postId} and ${actorWhere}),
      removed as (delete from vote where id in (select id from existing) returning id),
      added as (insert into vote (id, post_id, user_id, widget_user_id, fingerprint, type)
        select ${randomUUID()}, ${postId}, ${actor.userId || null}, ${actor.widgetUserId || null}, ${actor.userId || actor.widgetUserId ? null : actor.fingerprint}, 'upvote'
        where not exists(select 1 from existing) returning id),
      changed as (update post set upvotes = greatest(0, coalesce(upvotes,0) + (select count(*) from added) - (select count(*) from removed)), updated_at = now()
        where id = ${postId} returning upvotes)
      ${activityCte(activity, actor, "post", postId)}
      select upvotes, exists(select 1 from added) as "hasVoted" from changed`),
  ])
  const row = results[1].rows[0] as { upvotes: number; hasVoted: boolean } | undefined
  if (!row) throw new HTTPException(404, { message: "Post not found" })
  return row
}

export async function toggleCommentVote(database: typeof db, commentId: string, type: "upvote" | "downvote", actor: Voter, activity?: Activity) {
  const actorWhere = identity(actor)
  const results = await database.batch([
    database.execute(sql`select id from comment where id = ${commentId} for update`),
    database.execute(sql`with existing as (select id, type from comment_reaction where comment_id = ${commentId} and ${actorWhere}),
      removed as (delete from comment_reaction where id in (select id from existing) returning type),
      added as (insert into comment_reaction (id, comment_id, user_id, widget_user_id, fingerprint, type)
        select ${randomUUID()}, ${commentId}, ${actor.userId || null}, ${actor.widgetUserId || null}, ${actor.userId || actor.widgetUserId ? null : actor.fingerprint}, ${type}
        where not exists(select 1 from existing where type = ${type}) and (select count(*) from removed) >= 0 returning type),
      changed as (update comment set
        upvotes = greatest(0, coalesce(upvotes,0) + (select count(*) from added where type = 'upvote') - (select count(*) from removed where type = 'upvote')),
        downvotes = greatest(0, coalesce(downvotes,0) + (select count(*) from added where type = 'downvote') - (select count(*) from removed where type = 'downvote')),
        updated_at = now() where id = ${commentId} returning upvotes, downvotes)
      ${activityCte(activity, actor, "comment", commentId)}
      select upvotes, downvotes, (select type from added limit 1) as "userVote" from changed`),
  ])
  const row = results[1].rows[0] as { upvotes: number; downvotes: number; userVote: "upvote" | "downvote" | null } | undefined
  if (!row) throw new HTTPException(404, { message: "Comment not found" })
  return row
}
