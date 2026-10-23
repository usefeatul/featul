import { and, eq, isNotNull, lte, asc } from "drizzle-orm"
import { activityLog, board, changelogEntry } from "@featul/db"
import { ACTIVITY_ACTIONS } from "../activity/actions"
import { notifyChangelogSubscribers } from "./notify"

/** Caps one cron run; anything left over goes out on the next tick. */
const PUBLISH_BATCH = 100

/** Publishes scheduled drafts whose time has passed. Safe to run concurrently. */
export async function publishScheduledChangelogEntries(db: any, now = new Date()) {
  const due: Array<{
    id: string
    publishedAt: Date | null
    scheduledAt: Date
    workspaceId: string
  }> = await db
    .select({
      id: changelogEntry.id,
      publishedAt: changelogEntry.publishedAt,
      scheduledAt: changelogEntry.scheduledAt,
      workspaceId: board.workspaceId,
    })
    .from(changelogEntry)
    .innerJoin(board, eq(changelogEntry.boardId, board.id))
    .where(
      and(
        eq(changelogEntry.status, "draft"),
        isNotNull(changelogEntry.scheduledAt),
        lte(changelogEntry.scheduledAt, now),
      ),
    )
    .orderBy(asc(changelogEntry.scheduledAt))
    .limit(PUBLISH_BATCH)

  let published = 0
  let failures = 0

  for (const item of due) {
    try {
      // Re-check the schedule in the update so an edit or a parallel run
      // between the select and here can't publish (or announce) it twice.
      const [entry] = await db
        .update(changelogEntry)
        .set({
          status: "published",
          // A schedule is an explicit go-live date, so it wins over an earlier publish date
          // from before the entry was moved back to drafts.
          publishedAt: item.scheduledAt,
          scheduledAt: null,
        })
        .where(
          and(
            eq(changelogEntry.id, item.id),
            eq(changelogEntry.status, "draft"),
            isNotNull(changelogEntry.scheduledAt),
            lte(changelogEntry.scheduledAt, now),
          ),
        )
        .returning({
          id: changelogEntry.id,
          title: changelogEntry.title,
          authorId: changelogEntry.authorId,
          tags: changelogEntry.tags,
        })
      if (!entry) continue

      published++
      await db.insert(activityLog).values({
        workspaceId: item.workspaceId,
        userId: entry.authorId,
        action: ACTIVITY_ACTIONS.CHANGELOG_ENTRY_PUBLISHED,
        actionType: "update",
        entity: "changelog_entry",
        entityId: String(entry.id),
        title: entry.title,
        metadata: { status: "published", scheduled: true },
      })

      // Subscribers were already emailed the first time it went live.
      if (!item.publishedAt) await notifyChangelogSubscribers(db, entry.id)
    } catch (error) {
      failures++
      console.error(`Scheduled changelog publish failed for ${item.id}:`, error)
    }
  }

  return { due: due.length, published, failures }
}
