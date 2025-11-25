import type { Metadata } from "next"
import { getServerSession } from "@feedgot/auth/session"
import { db, workspace, board, post, postTag, tag } from "@feedgot/db"
import { eq, and, inArray, desc, asc, sql } from "drizzle-orm"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

type SearchParams = {
  status?: string | string[]
  board?: string | string[]
  tag?: string | string[]
  order?: string
  search?: string
}

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Requests",
    description: "Workspace requests",
    path: `/workspaces/${slug}/requests`,
    indexable: false,
  })
}

function parseArrayParam(v: any): string[] {
  try {
    if (!v) return []
    const s = Array.isArray(v) ? v[0] : v
    const arr = typeof s === "string" ? JSON.parse(s) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function normalizeStatus(s: string): string {
  const t = (s || "").trim().toLowerCase()
  if (t === "pending") return "pending"
  if (t === "review" || t === "under-review" || t === "underreview") return "under-review"
  if (t === "planned") return "planned"
  if (t === "progress" || t === "inprogress" || t === "in-progress") return "in-progress"
  if (t === "complete" || t === "completed") return "completed"
  if (t === "closed" || t === "close") return "closed"
  return t
}

export default async function RequestsPage({ params, searchParams }: Props) {
  const { slug } = await params
  let sp: SearchParams = {}
  if (searchParams) {
    try {
      sp = await searchParams
    } catch {}
  }

  try {
    await getServerSession()
  } catch {}

  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) {
    return (
      <section className="space-y-4">
        <div className="text-accent">Workspace not found</div>
      </section>
    )
  }

  const statusRaw = parseArrayParam((sp as any).status)
  const boardRaw = parseArrayParam((sp as any).board)
  const tagRaw = parseArrayParam((sp as any).tag)
  const order = typeof (sp as any).order === "string" && (sp as any).order ? (sp as any).order : "newest"

  const statusFilter = statusRaw.map(normalizeStatus)
  if (statusFilter.length === 0) statusFilter.push("pending", "under-review", "planned", "in-progress")

  let tagPostIds: string[] | null = null
  if (tagRaw.length > 0) {
    const tagSlugs = tagRaw.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
    if (tagSlugs.length > 0) {
      const rows = await db
        .select({ postId: postTag.postId })
        .from(postTag)
        .innerJoin(tag, eq(postTag.tagId, tag.id))
        .innerJoin(post, eq(postTag.postId, post.id))
        .innerJoin(board, eq(post.boardId, board.id))
        .where(
          and(
            eq(board.workspaceId, ws.id),
            sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
            inArray(tag.slug, tagSlugs)
          ) as any
        )
      tagPostIds = Array.from(new Set(rows.map((r) => r.postId)))
    }
  }

  const filters: any[] = [
    eq(board.workspaceId, ws.id),
    sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
    inArray(post.roadmapStatus, statusFilter),
  ]
  if (boardRaw.length > 0) {
    const boardSlugs = boardRaw.map((b: string) => b.trim().toLowerCase()).filter(Boolean)
    if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs))
  }
  if (tagPostIds && tagPostIds.length > 0) filters.push(inArray(post.id, tagPostIds))

  const orderBy = order === "oldest" ? asc(post.createdAt) : desc(post.createdAt)

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
    .orderBy(orderBy)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Requests</div>
        <div className="text-sm text-accent">{rows.length} items</div>
      </div>
      <ul className="space-y-2">
        {rows.map((p) => (
          <li key={p.id} className="rounded-md border bg-card p-3">
            <div className="flex items-start gap-3">
              {p.image ? <img src={p.image} alt="" className="w-16 h-16 rounded-md object-cover border" /> : null}
              <div className="flex-1">
                <div className="text-sm font-medium">{p.title}</div>
                <div className="text-xs text-accent mt-0.5">{p.boardName}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-accent">
                  <span className="rounded-md bg-muted px-2 py-0.5">{p.roadmapStatus || "pending"}</span>
                  <span>↑ {p.upvotes}</span>
                  <span>💬 {p.commentCount}</span>
                  <span>{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
