import { db, workspace, workspaceMember, board, post, postTag, tag } from "@feedgot/db"
import { eq, and, inArray, desc, asc, sql } from "drizzle-orm"
import { client } from "@feedgot/api/client"

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
  try {
    const res = await client.branding.byWorkspaceSlug.$get({ slug })
    const data = await res.json()
    const primary = (data?.config?.primaryColor || "#3b82f6") as string
    return { primary }
  } catch {
    return { primary: "#3b82f6" }
  }
}


export function normalizeStatus(s: string): string {
  const raw = (s || "").trim().toLowerCase()
  const t = raw.replace(/-/g, "")
  const map: Record<string, string> = {
    pending: "pending",
    review: "review",
    planned: "planned",
    progress: "progress",
    completed: "completed",
    closed: "closed",
  }
  return map[t] || raw
}

export async function getWorkspaceBySlug(slug: string): Promise<{ id: string; name: string; slug: string; logo?: string | null; domain?: string | null } | null> {
  try {
    const res = await client.workspace.bySlug.$get({ slug })
    const data = await res.json()
    return (data?.workspace || null) as any
  } catch {
    return null
  }
}

export async function getWorkspaceTimezoneBySlug(slug: string): Promise<string | null> {
  try {
    const res = await client.workspace.bySlug.$get({ slug })
    const data = await res.json()
    return (data?.workspace?.timezone || null) as string | null
  } catch {
    return null
  }
}

export async function listUserWorkspaces(userId: string): Promise<Array<{ id: string; name: string; slug: string; logo?: string | null }>> {
  const owned = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo })
    .from(workspace)
    .where(eq(workspace.ownerId, userId))

  const memberRows = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(eq(workspaceMember.userId, userId))

  const map = new Map<string, { id: string; name: string; slug: string; logo?: string | null }>()
  for (const w of owned.concat(memberRows)) map.set(w.id, w as any)
  return Array.from(map.values())
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
  try {
    const res = await client.workspace.statusCounts.$get({ slug })
    const data = await res.json()
    const counts = (data?.counts || {}) as Record<string, number>
    const keys = ["planned", "progress", "review", "completed", "pending", "closed"]
    for (const k of keys) if (typeof counts[k] !== "number") counts[k] = 0
    return counts
  } catch {
    return { planned: 0, progress: 0, review: 0, completed: 0, pending: 0, closed: 0 }
  }
}
