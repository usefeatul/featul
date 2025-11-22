import "dotenv/config"
import { db, user, workspace, workspaceMember, board, post, comment } from "@feedgot/db"
import { eq, and } from "drizzle-orm"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

async function main() {
  const userId = process.env.SEED_USER_ID || "AlJUeMxYUo2r6nJ56e2kVibAFA3tIBCN"
  const slug = process.env.SEED_WORKSPACE_SLUG || "youtube"
  const workspaceName = process.env.SEED_WORKSPACE_NAME || "YouTube Feedback"
  const domain = process.env.SEED_WORKSPACE_DOMAIN || "https://youtube.com"

  const [u] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)
  if (!u) {
    process.stderr.write("User not found\n")
    process.exit(1)
  }

  const [existingWs] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  let wsId = existingWs?.id
  if (!wsId) {
    const [createdWs] = await db
      .insert(workspace)
      .values({ name: workspaceName, slug, domain, ownerId: userId, timezone: "UTC" })
      .returning({ id: workspace.id })
    wsId = createdWs!.id
  }

  const [member] = await db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(and(eq(workspaceMember.workspaceId, wsId), eq(workspaceMember.userId, userId)))
    .limit(1)
  if (!member) {
    await db.insert(workspaceMember).values({
      workspaceId: wsId,
      userId,
      role: "admin",
      permissions: {
        canManageWorkspace: true,
        canManageBilling: true,
        canManageMembers: true,
        canManageBoards: true,
        canModerateAllBoards: true,
        canConfigureBranding: true,
      },
      joinedAt: new Date(),
    })
  }

  const ensureBoard = async (bslug: string, name: string, type: "feedback" | "roadmap" | "updates") => {
    const [b] = await db
      .select({ id: board.id })
      .from(board)
      .where(and(eq(board.workspaceId, wsId!), eq(board.slug, bslug)))
      .limit(1)
    if (b) return b.id
    const [created] = await db
      .insert(board)
      .values({ workspaceId: wsId!, name, slug: bslug, type, isPublic: true, isActive: true, createdBy: userId })
      .returning({ id: board.id })
    return created!.id
  }

  const issuesBoardId = await ensureBoard("issues", "Issues", "feedback")
  const roadmapBoardId = await ensureBoard("roadmap", "Roadmap", "roadmap")
  const changelogBoardId = await ensureBoard("changelog", "Changelog", "updates")

  const issueTitles = ["Enable dark mode", "Improve search", "Mobile layout tweaks"]
  for (const t of issueTitles) {
    const pslug = slugify(t)
    const [exists] = await db
      .select({ id: post.id })
      .from(post)
      .where(and(eq(post.boardId, issuesBoardId), eq(post.slug, pslug)))
      .limit(1)
    if (exists) continue
    await db.insert(post).values({
      boardId: issuesBoardId,
      title: t,
      content: t,
      slug: pslug,
      authorId: userId,
      upvotes: Math.floor(Math.random() * 50) + 1,
    })
  }

  const roadmapItems = [
    { title: "SSO", status: "planned" },
    { title: "Real-time comments", status: "in-progress" },
    { title: "Voting", status: "completed" },
  ]
  for (const r of roadmapItems) {
    const pslug = slugify(r.title)
    const [exists] = await db
      .select({ id: post.id })
      .from(post)
      .where(and(eq(post.boardId, roadmapBoardId), eq(post.slug, pslug)))
      .limit(1)
    if (exists) continue
    await db.insert(post).values({
      boardId: roadmapBoardId,
      title: r.title,
      content: r.title,
      slug: pslug,
      authorId: userId,
      roadmapStatus: r.status,
    })
  }

  const changelogItems = [
    { title: "v0.2 – Voting", date: new Date() },
    { title: "v0.1 – Initial release", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  ]
  for (const c of changelogItems) {
    const pslug = slugify(c.title)
    const [exists] = await db
      .select({ id: post.id })
      .from(post)
      .where(and(eq(post.boardId, changelogBoardId), eq(post.slug, pslug)))
      .limit(1)
    if (exists) continue
    await db.insert(post).values({
      boardId: changelogBoardId,
      title: c.title,
      content: c.title,
      slug: pslug,
      authorId: userId,
      publishedAt: c.date,
    })
  }

  const [firstIssue] = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.boardId, issuesBoardId))
    .limit(1)
  if (firstIssue) {
    const comments = ["Love this", "Please add soon"]
    for (const c of comments) {
      await db.insert(comment).values({
        postId: firstIssue.id,
        content: c,
        authorId: userId,
      })
    }
  }

  process.stdout.write("Seed completed\n")
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + "\n")
  process.exit(1)
})