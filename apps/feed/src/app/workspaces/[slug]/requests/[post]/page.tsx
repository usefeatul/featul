import { notFound } from "next/navigation"
import { db, workspace, board, post, user, workspaceMember, postTag, tag } from "@oreilla/db"
import { eq, and, sql } from "drizzle-orm"
import RequestDetail from "@/components/requests/RequestDetail"
import { client } from "@oreilla/api/client"
import { readHasVotedForPost } from "@/lib/vote.server"
import { getPostNavigation, normalizeStatus } from "@/lib/workspace"
import { readInitialCollapsedCommentIds } from "@/lib/comments.server"
import { parseArrayParam } from "@/utils/request-filters"
import { createHash } from "crypto"
import { randomAvatarUrl } from "@/utils/avatar"

export const revalidate = 0

type Props = { params: Promise<{ slug: string; post: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }

export default async function RequestDetailPage({ params, searchParams }: Props) {
  const { slug, post: postSlug } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) return notFound()

  const [p] = await db
    .select({
      id: post.id,
      authorId: post.authorId,
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
      metadata: post.metadata,
      author: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .where(
      and(
        eq(board.workspaceId, ws.id),
        sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
        eq(post.slug, postSlug)
      )
    )
    .limit(1)
  if (!p) return notFound()

  if ((!p.author || !p.author.name) && (p.metadata as any)?.fingerprint) {
    const avatarSeed = createHash("sha256").update((p.metadata as any).fingerprint).digest("hex")
    if (!p.author) {
      // @ts-ignore
      p.author = { name: "Guest", image: null, email: null }
    }
    // @ts-ignore
    p.author!.image = randomAvatarUrl(avatarSeed)
    // @ts-ignore
    p.author!.name = "Guest"
  }

  // Map author's workspace role / ownership for RoleBadge
  let role: "admin" | "member" | "viewer" | null = null
  let isOwner = false
  if (p.authorId) {
    isOwner = p.authorId === ws.ownerId
    if (isOwner) {
      role = "admin"
    } else {
      const [member] = await db
        .select({ role: workspaceMember.role })
        .from(workspaceMember)
        .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, p.authorId)))
        .limit(1)
      role = (member?.role as "admin" | "member" | "viewer") || null
    }
  }

  // Load tags for this post
  const tags = await db
    .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, p.id))

  const hasVoted = await readHasVotedForPost(p.id)
  const commentsRes = await client.comment.list.$get({ postId: p.id })
  const commentsJson = await commentsRes.json().catch(() => ({ comments: [] }))
  const initialComments = Array.isArray((commentsJson as any)?.comments) ? (commentsJson as any).comments : []
  const initialCollapsedIds = await readInitialCollapsedCommentIds(p.id)

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
      post={{ ...p, role, isOwner, tags, hasVoted } as any}
      workspaceSlug={slug}
      initialComments={initialComments as any}
      initialCollapsedIds={initialCollapsedIds}
      navigation={{
        prev: navigation.prev ? { slug: navigation.prev.slug, title: navigation.prev.title } : null,
        next: navigation.next ? { slug: navigation.next.slug, title: navigation.next.title } : null,
      }}
    />
  )
}
