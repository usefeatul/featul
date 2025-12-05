import { notFound } from "next/navigation"
import { db, workspace, board, post } from "@feedgot/db"
import { eq, and, sql } from "drizzle-orm"
import RequestDetail from "@/components/requests/RequestDetail"
import { client } from "@feedgot/api/client"
import { readHasVotedForPost } from "@/lib/vote.server"
import { getPostNavigation, normalizeStatus } from "@/lib/workspace"
import { parseArrayParam } from "@/utils/request-filters"

export const revalidate = 30

type Props = { params: Promise<{ slug: string; post: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }

export default async function RequestDetailPage({ params, searchParams }: Props) {
  const { slug, post: postSlug } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) return notFound()

  const [p] = await db
    .select({
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      upvotes: post.upvotes,
      commentCount: post.commentCount,
      roadmapStatus: post.roadmapStatus,
      isFeatured: post.isFeatured,
      isLocked: post.isLocked,
      isPinned: post.isPinned,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      boardName: board.name,
      boardSlug: board.slug,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`, eq(post.slug, postSlug)))
    .limit(1)
  if (!p) return notFound()

  const hasVoted = await readHasVotedForPost(p.id)
  const commentsRes = await client.comment.list.$get({ postId: p.id })
  const commentsJson = await commentsRes.json().catch(() => ({ comments: [] }))
  const initialComments = Array.isArray((commentsJson as any)?.comments) ? (commentsJson as any).comments : []

  let sp: any = {}
  if (searchParams) {
    try {
      sp = await searchParams
    } catch {}
  }

  const statusRaw = parseArrayParam(sp.status)
  const boardRaw = parseArrayParam(sp.board)
  const tagRaw = parseArrayParam(sp.tag)
  const order = typeof sp.order === "string" && sp.order ? sp.order : "newest"
  const search = typeof sp.search === "string" ? sp.search : ""

  const navigation = await getPostNavigation(slug, p.id, {
    statuses: statusRaw.map(normalizeStatus),
    boardSlugs: boardRaw.map((b: string) => b.trim().toLowerCase()).filter(Boolean),
    tagSlugs: tagRaw.map((t: string) => t.trim().toLowerCase()).filter(Boolean),
    order: order === "oldest" ? "oldest" : order === "likes" ? "likes" : "newest",
    search,
  })

  return (
    <RequestDetail
      post={{ ...p, hasVoted } as any}
      workspaceSlug={slug}
      initialComments={initialComments as any}
      navigation={{
        prev: navigation.prev ? { slug: navigation.prev.slug, title: navigation.prev.title } : null,
        next: navigation.next ? { slug: navigation.next.slug, title: navigation.next.title } : null,
      }}
    />
  )
}
