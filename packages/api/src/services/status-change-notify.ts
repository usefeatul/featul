import { and, eq, isNotNull, ne } from "drizzle-orm"
import { board, post, user, vote, workspace } from "@featul/db"
import { normalizeStatus } from "../shared/status"

function statusLabel(value: string | null | undefined): string {
  const status = normalizeStatus(value || "pending")
  if (status === "progress") return "Progress"
  if (status === "review") return "Review"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

type NotifyPostStatusChangeParams = {
  db: any
  postId: string
  fromStatus: string | null | undefined
  toStatus: string | null | undefined
  actorUserId: string
}

async function collectRecipientEmails(
  db: any,
  postId: string,
  authorId: string | null,
  actorUserId: string,
): Promise<string[]> {
  const emails = new Set<string>()

  if (authorId && authorId !== actorUserId) {
    const [author] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, authorId))
      .limit(1)
    const email = String(author?.email || "").trim().toLowerCase()
    if (email) emails.add(email)
  }

  const voterRows = await db
    .select({ email: user.email })
    .from(vote)
    .innerJoin(user, eq(vote.userId, user.id))
    .where(
      and(
        eq(vote.postId, postId),
        isNotNull(vote.userId),
        ne(vote.userId, actorUserId),
      ),
    )

  for (const row of voterRows) {
    const email = String(row?.email || "").trim().toLowerCase()
    if (email) emails.add(email)
  }

  return Array.from(emails)
}

async function notifyPostStatusChangeInternal({
  db,
  postId,
  fromStatus,
  toStatus,
  actorUserId,
}: NotifyPostStatusChangeParams): Promise<void> {
  if (!toStatus) return

  const fromNormalized = normalizeStatus(fromStatus || "pending")
  const toNormalized = normalizeStatus(toStatus)
  if (fromNormalized === toNormalized) return

  const [postRow] = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      authorId: post.authorId,
      boardId: post.boardId,
    })
    .from(post)
    .where(eq(post.id, postId))
    .limit(1)

  if (!postRow) return

  const [boardRow] = await db
    .select({ workspaceId: board.workspaceId })
    .from(board)
    .where(eq(board.id, postRow.boardId))
    .limit(1)

  if (!boardRow) return

  const [ws] = await db
    .select({ name: workspace.name, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.id, boardRow.workspaceId))
    .limit(1)

  if (!ws?.slug) return

  const recipients = await collectRecipientEmails(
    db,
    postId,
    postRow.authorId ?? null,
    actorUserId,
  )
  if (recipients.length === 0) return

  const { sendPostStatusChangeEmail } = await import("@featul/auth")
  const postUrl = `https://${ws.slug}.featul.com/board/p/${postRow.slug}`
  const payload = {
    workspaceName: ws.name || ws.slug,
    postTitle: postRow.title,
    postUrl,
    fromStatusLabel: statusLabel(fromNormalized),
    toStatusLabel: statusLabel(toNormalized),
  }

  await Promise.allSettled(
    recipients.map((to) =>
      sendPostStatusChangeEmail(to, payload).catch((error) => {
        console.error(`Status change email failed for ${to}:`, error)
      }),
    ),
  )
}

/**
 * Email authenticated author + voters when roadmap status changes.
 * Fire-and-forget so request latency is not blocked.
 */
export function notifyPostStatusChange(
  params: NotifyPostStatusChangeParams,
): void {
  void notifyPostStatusChangeInternal(params).catch((error) => {
    console.error("Status change notification error:", error)
  })
}
