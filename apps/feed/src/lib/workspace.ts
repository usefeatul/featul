import { db, workspace, workspaceMember, brandingConfig, board, post, postTag, tag } from "@feedgot/db"
import { eq, and, inArray, desc, asc, sql } from "drizzle-orm"

export async function findFirstAccessibleWorkspaceSlug(userId: string): Promise<string | null> {
  const [owned] = await db
    .select({ slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.ownerId, userId))
    .limit(1)

  if (owned?.slug) return owned.slug

  const [memberWs] = await db
    .select({ slug: workspace.slug })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(eq(workspaceMember.userId, userId))
    .limit(1)

  return memberWs?.slug || null
}

export async function getBrandingColorsBySlug(slug: string): Promise<{ primary: string }> {
  let primary = "#3b82f6"
  const [row] = await db
    .select({ primaryColor: brandingConfig.primaryColor })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (row?.primaryColor) primary = row.primaryColor
  return { primary }
}


export function normalizeStatus(s: string): string {
  const raw = (s || "").trim().toLowerCase()
  const t = raw.replace(/-/g, "")
  const map: Record<string, string> = {
    pending: "pending",
    review: "review",
    underreview: "review",
    planned: "planned",
    progress: "progress",
    inprogress: "progress",
    completed: "completed",
    complete: "completed",
    closed: "closed",
    close: "closed",
  }
  return map[t] || raw
}

export async function getWorkspaceBySlug(slug: string): Promise<{ id: string; name: string; slug: string; logo?: string | null; domain?: string | null } | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  return ws || null
}

export async function getWorkspaceTimezoneBySlug(slug: string): Promise<string | null> {
  const [ws] = await db
    .select({ timezone: workspace.timezone })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  return (ws as any)?.timezone || null
}

export async function getWorkspacePosts(slug: string, opts?: { statuses?: string[]; boardSlugs?: string[]; tagSlugs?: string[]; order?: "newest" | "oldest"; search?: string; limit?: number; offset?: number }) {
  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return []

  const normalizedStatuses = (opts?.statuses || []).map(normalizeStatus).filter(Boolean)
  const matchStatuses = Array.from(new Set(normalizedStatuses))
  const boardSlugs = (opts?.boardSlugs || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
  const tagSlugs = (opts?.tagSlugs || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
  const order = opts?.order === "oldest" ? asc(post.createdAt) : desc(post.createdAt)
  const search = (opts?.search || "").trim()
  const lim = Math.min(Math.max(Number(opts?.limit ?? 50), 1), 200)
  const off = Math.max(Number(opts?.offset ?? 0), 0)

  let tagPostIds: string[] | null = null
  if (tagSlugs.length > 0) {
    const rows = await db
      .select({ postId: postTag.postId })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .innerJoin(post, eq(postTag.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), inArray(tag.slug, tagSlugs)))
    tagPostIds = Array.from(new Set(rows.map((r) => r.postId)))
    if (tagPostIds.length === 0) {
      return []
    }
  }

  const filters: any[] = [eq(board.workspaceId, ws.id), eq(board.isSystem, false)]
  if (matchStatuses.length > 0) filters.push(inArray(post.roadmapStatus, matchStatuses))
  if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs))
  if (tagPostIds) filters.push(inArray(post.id, tagPostIds))
  if (search) {
    filters.push(sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, '')) @@ plainto_tsquery('english', ${search})`)
  }

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      image: post.image,
      commentCount: post.commentCount,
      upvotes: post.upvotes,
      roadmapStatus: post.roadmapStatus,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      boardSlug: board.slug,
      boardName: board.name,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(...filters) as any)
    .orderBy(order)
    .limit(lim)
    .offset(off)

  return rows
}
export async function getWorkspaceStatusCounts(slug: string): Promise<Record<string, number>> {
  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return {}

  const rows = await db
    .select({ status: post.roadmapStatus, count: sql<number>`count(*)` })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
    .groupBy(post.roadmapStatus)

  const counts: Record<string, number> = {}
  for (const r of rows as any[]) {
    const s = normalizeStatus(String(r.status))
    counts[s] = (counts[s] || 0) + Number(r.count)
  }
  for (const key of ["planned", "progress", "review", "completed", "pending", "closed"]) {
    if (typeof counts[key] !== "number") counts[key] = 0
  }
  return counts
}
