import { and, eq, isNotNull } from "drizzle-orm"
import {
  board,
  changelogEntry,
  changelogSubscription,
  user,
  workspace,
} from "@featul/db"

/** Public portal origin: verified custom domain first, then the featul subdomain. */
export function publicPortalOrigin(slug: string, customDomain?: string | null) {
  const host = customDomain?.trim()
  return host ? `https://${host}` : `https://${slug}.featul.com`
}

/** Send in small batches so a large list never opens hundreds of requests at once. */
const SEND_BATCH = 20

async function notifyChangelogSubscribersInternal(db: any, entryId: string) {
  const [entry] = await db
    .select({
      id: changelogEntry.id,
      title: changelogEntry.title,
      slug: changelogEntry.slug,
      summary: changelogEntry.summary,
      status: changelogEntry.status,
      authorId: changelogEntry.authorId,
      workspaceId: board.workspaceId,
      boardVisible: board.isVisible,
      boardPublic: board.isPublic,
    })
    .from(changelogEntry)
    .innerJoin(board, eq(changelogEntry.boardId, board.id))
    .where(eq(changelogEntry.id, entryId))
    .limit(1)

  // Only announce entries people can actually open on the public portal.
  if (!entry || entry.status !== "published") return
  if (!entry.boardVisible || !entry.boardPublic) return

  const [ws] = await db
    .select({ name: workspace.name, slug: workspace.slug, customDomain: workspace.customDomain })
    .from(workspace)
    .where(eq(workspace.id, entry.workspaceId))
    .limit(1)
  if (!ws?.slug) return

  const subscribers: Array<{ email: string | null; name: string | null; token: string; userId: string }> =
    await db
      .select({
        email: user.email,
        name: user.name,
        token: changelogSubscription.unsubscribeToken,
        userId: changelogSubscription.userId,
      })
      .from(changelogSubscription)
      .innerJoin(user, eq(changelogSubscription.userId, user.id))
      .where(and(eq(changelogSubscription.workspaceId, entry.workspaceId), isNotNull(user.email)))

  // The author already knows; skip them.
  const recipients = subscribers.filter((s) => s.email && s.userId !== entry.authorId)
  if (recipients.length === 0) return

  const { sendChangelogPublishedEmail } = await import("@featul/auth")
  const origin = publicPortalOrigin(ws.slug, ws.customDomain)
  const entryUrl = `${origin}/changelog/p/${entry.slug}`
  const workspaceName = ws.name || ws.slug

  for (let i = 0; i < recipients.length; i += SEND_BATCH) {
    const batch = recipients.slice(i, i + SEND_BATCH)
    await Promise.allSettled(
      batch.map((r) =>
        sendChangelogPublishedEmail(
          String(r.email),
          {
            recipientName: r.name || undefined,
            workspaceName,
            entryTitle: entry.title,
            entrySummary: entry.summary || undefined,
            entryUrl,
            unsubscribeUrl: `${origin}/changelog/unsubscribe?token=${encodeURIComponent(r.token)}`,
          },
          // Re-publishing the same entry must not email the same person twice.
          `changelog-published:${entry.id}:${r.userId}`,
        ).catch((error) => {
          console.error(`Changelog email failed for ${r.email}:`, error)
        }),
      ),
    )
  }
}

/** Email changelog subscribers when an entry is published for the first time. Never throws. */
export async function notifyChangelogSubscribers(db: any, entryId: string): Promise<void> {
  await notifyChangelogSubscribersInternal(db, entryId).catch((error) => {
    console.error("Changelog subscriber notification error:", error)
  })
}
