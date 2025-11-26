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

export async function getBrandingColorsBySlug(slug: string): Promise<{ primary: string; accent?: string }> {
  let primary = "#3b82f6"
  let accent: string | undefined
  const [row] = await db
    .select({ primaryColor: brandingConfig.primaryColor, accentColor: brandingConfig.accentColor })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (row?.primaryColor) primary = row.primaryColor
  if (row?.accentColor) accent = row.accentColor
  return { primary, accent }
}

export function parseArrayParam(v: any): string[] {
  try {
    if (!v) return []
    const s = Array.isArray(v) ? v[0] : v
    const arr = typeof s === "string" ? JSON.parse(s) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function normalizeStatus(s: string): string {
  const t = (s || "").trim().toLowerCase()
  if (t === "pending") return "pending"
  if (t === "review" || t === "under-review" || t === "underreview") return "under-review"
  if (t === "planned") return "planned"
  if (t === "progress" || t === "inprogress" || t === "in-progress") return "in-progress"
  if (t === "complete" || t === "completed") return "completed"
  if (t === "closed" || t === "close") return "closed"
  return t
}

export async function getWorkspaceBySlug(slug: string): Promise<{ id: string; name: string; slug: string } | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug })
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

export async function getWorkspacePosts(slug: string, opts?: { statuses?: string[]; boardSlugs?: string[]; tagSlugs?: string[]; order?: "newest" | "oldest"; search?: string }) {
  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return []

  const statuses = (opts?.statuses || []).map(normalizeStatus).filter(Boolean)
  const boardSlugs = (opts?.boardSlugs || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
  const tagSlugs = (opts?.tagSlugs || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
  const order = opts?.order === "oldest" ? asc(post.createdAt) : desc(post.createdAt)
  const search = (opts?.search || "").trim()

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
  }

  const filters: any[] = [eq(board.workspaceId, ws.id), eq(board.isSystem, false)]
  if (statuses.length > 0) filters.push(inArray(post.roadmapStatus, statuses))
  if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs))
  if (tagPostIds && tagPostIds.length > 0) filters.push(inArray(post.id, tagPostIds))
  if (search) {
    const wildcard = `%${search}%`
    filters.push(sql`(${post.title} ilike ${wildcard} or ${post.content} ilike ${wildcard})`)
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
  for (const key of ["planned", "in-progress", "under-review", "completed", "pending", "closed"]) {
    if (typeof counts[key] !== "number") counts[key] = 0
  }
  return counts
}
