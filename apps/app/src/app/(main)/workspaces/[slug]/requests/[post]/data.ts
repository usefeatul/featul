import { db, workspace, board, post, user, workspaceMember, postTag, tag, postMerge, postReport } from "@featul/db"
import { and, eq, sql } from "drizzle-orm"
import { client } from "@featul/api/client"
import { readHasVotedForPost } from "@/lib/vote.server"
import { getPostNavigation, normalizeStatus } from "@/lib/workspace"
import { readInitialCollapsedCommentIds } from "@/lib/comments.server"
import { parseArrayParam } from "@/utils/request-filters"
import { createHash } from "crypto"
import { randomAvatarUrl } from "@/utils/avatar"
import type { RequestDetailData } from "@/components/requests/RequestDetail"
import type { CommentData } from "@/types/comment"

export type RequestDetailSearchParams = Record<string, string | string[] | undefined>

export type RequestDetailNavigation = {
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export type RequestDetailPageData = {
  workspaceSlug: string
  post: RequestDetailData
  initialComments: CommentData[]
  initialCollapsedIds: string[]
  navigation: RequestDetailNavigation
}

type WorkspaceRecord = {
  id: string
  name: string
  ownerId: string
}

type PMetadata = {
  attachments?: { name: string; url: string; type: string }[]
  integrations?: { github?: string; jira?: string }
  customFields?: Record<string, unknown>
  fingerprint?: string
}

type RawPostRecord = RequestDetailData & {
  authorId: string | null
  metadata: PMetadata | null
  author:
  | {
    name: string | null
    image: string | null
    email: string | null
  }
  | null
}

export async function loadRequestDetailPageData({
  workspaceSlug,
  postSlug,
  searchParams,
}: {
  workspaceSlug: string
  postSlug: string
  searchParams?: RequestDetailSearchParams
}): Promise<RequestDetailPageData | null> {
  const ws = await loadWorkspace(workspaceSlug)
  if (!ws) return null

  const rawPost = await loadPostWithAuthorAndBoard(ws.id, postSlug)
  if (!rawPost) return null

  const postWithAuthor = ensureAuthorAvatar(rawPost)
  const { role, isOwner } = await loadAuthorRoleAndOwnership({
    workspaceId: ws.id,
    workspaceOwnerId: ws.ownerId,
    authorId: rawPost.authorId,
  })

  const tags = await loadPostTags(rawPost.id)
  const hasVoted = await readHasVotedForPost(rawPost.id)
  const { initialComments, initialCollapsedIds } = await loadComments(rawPost.id)
  const navigation = await loadNavigation({
    workspaceSlug,
    postId: rawPost.id,
    searchParams,
  })

  let reportCount = 0
  if (isOwner) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postReport)
      .where(eq(postReport.postId, rawPost.id))
      .limit(1)
    reportCount = Number(row?.count || 0)
  }

  const post: RequestDetailData = {
    ...postWithAuthor,
    role,
    isOwner,
    isFeatul: rawPost.authorId === "featul-founder",
    tags,
    hasVoted,
    reportCount,
  } as RequestDetailData & { reportCount: number }

  return {
    workspaceSlug,
    post,
    initialComments,
    initialCollapsedIds,
    navigation,
  }
}

async function loadWorkspace(slug: string): Promise<WorkspaceRecord | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  return ws ?? null
}

async function loadPostWithAuthorAndBoard(workspaceId: string, postSlug: string): Promise<RawPostRecord | null> {
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
      duplicateOfId: post.duplicateOfId,
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
        eq(board.workspaceId, workspaceId),
        sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
        eq(post.slug, postSlug)
      )
    )
    .limit(1)

  if (!p) return null

  const mergedCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(postMerge)
    .where(eq(postMerge.targetPostId, p.id))
    .limit(1)

  const mergedCount = Number(mergedCountRow?.[0]?.count || 0)
  let mergedInto:
    | {
      id: string
      slug: string
      title: string
      roadmapStatus?: string | null
      mergedAt?: string | null
      boardName?: string
      boardSlug?: string
    }
    | null = null

  if (p.duplicateOfId) {
    const [target] = await db
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        roadmapStatus: post.roadmapStatus,
        boardName: board.name,
        boardSlug: board.slug,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(and(eq(board.workspaceId, workspaceId), eq(post.id, p.duplicateOfId)))
      .limit(1)
    const [mergeRow] = await db
      .select({ createdAt: postMerge.createdAt })
      .from(postMerge)
      .where(and(eq(postMerge.sourcePostId, p.id), eq(postMerge.targetPostId, p.duplicateOfId)))
      .limit(1)
    if (target) {
      mergedInto = {
        id: target.id,
        slug: target.slug,
        title: target.title,
        roadmapStatus: target.roadmapStatus,
        mergedAt: mergeRow?.createdAt ? new Date(mergeRow.createdAt).toISOString() : null,
        boardName: target.boardName,
        boardSlug: target.boardSlug,
      }
    }
  }

  const mergedSourcesRows = await db
    .select({
      id: post.id,
      slug: post.slug,
      title: post.title,
      roadmapStatus: post.roadmapStatus,
      mergedAt: postMerge.createdAt,
      boardName: board.name,
      boardSlug: board.slug,
    })
    .from(postMerge)
    .innerJoin(post, eq(post.id, postMerge.sourcePostId))
    .innerJoin(board, eq(post.boardId, board.id))
    .where(eq(postMerge.targetPostId, p.id))
    .orderBy(sql`${postMerge.createdAt} desc`)
    .limit(3)
  const mergedSources = mergedSourcesRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    roadmapStatus: r.roadmapStatus ?? null,
    mergedAt: r.mergedAt ? new Date(r.mergedAt).toISOString() : null,
    boardName: r.boardName,
    boardSlug: r.boardSlug,
  }))

  return {
    ...p,
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    createdAt: new Date(p.createdAt).toISOString(),
    mergedCount,
    mergedInto,
    mergedSources
  } as RawPostRecord
}

function ensureAuthorAvatar(postRecord: RawPostRecord): RawPostRecord {
  if ((!postRecord.author || !postRecord.author.name) && postRecord.metadata?.fingerprint) {
    const avatarSeed = createHash("sha256").update(postRecord.metadata.fingerprint).digest("hex")

    if (!postRecord.author) {
      postRecord.author = { name: "Guest", image: null, email: null }
    }

    postRecord.author.image = randomAvatarUrl(avatarSeed)
    postRecord.author.name = "Guest"
  }

  return postRecord
}

async function loadAuthorRoleAndOwnership({
  workspaceId,
  workspaceOwnerId,
  authorId,
}: {
  workspaceId: string
  workspaceOwnerId: string
  authorId: string | null
}): Promise<{ role: "admin" | "member" | "viewer" | null; isOwner: boolean }> {
  let role: "admin" | "member" | "viewer" | null = null
  let isOwner = false

  if (!authorId) {
    return { role, isOwner }
  }

  isOwner = authorId === workspaceOwnerId

  if (isOwner) {
    role = "admin"
  } else {
    const [member] = await db
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.userId, authorId)))
      .limit(1)

    role = (member?.role as "admin" | "member" | "viewer") || null
  }

  return { role, isOwner }
}

async function loadPostTags(postId: string) {
  return db
    .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, postId))
}

async function loadComments(postId: string): Promise<{ initialComments: CommentData[]; initialCollapsedIds: string[] }> {
  const commentsRes = await client.comment.list.$get({ postId })
  const commentsJson = (await commentsRes.json().catch(() => ({ comments: [] }))) as { comments: CommentData[] }
  const initialComments = Array.isArray(commentsJson.comments) ? commentsJson.comments : []
  const initialCollapsedIds = await readInitialCollapsedCommentIds(postId)

  return { initialComments, initialCollapsedIds }
}

async function loadNavigation({
  workspaceSlug,
  postId,
  searchParams,
}: {
  workspaceSlug: string
  postId: string
  searchParams?: RequestDetailSearchParams
}): Promise<RequestDetailNavigation> {
  const sp = searchParams ?? {}

  const statusRaw = parseArrayParam(
    typeof sp.status === "string" ? sp.status : Array.isArray(sp.status) ? sp.status[0] ?? null : null
  )
  const boardRaw = parseArrayParam(
    typeof sp.board === "string" ? sp.board : Array.isArray(sp.board) ? sp.board[0] ?? null : null
  )
  const tagRaw = parseArrayParam(typeof sp.tag === "string" ? sp.tag : Array.isArray(sp.tag) ? sp.tag[0] ?? null : null)
  const order = typeof sp.order === "string" && sp.order ? sp.order : "newest"
  const search = typeof sp.search === "string" ? sp.search : ""

  const navigation = await getPostNavigation(workspaceSlug, postId, {
    statuses: statusRaw.map(normalizeStatus),
    boardSlugs: boardRaw.map((b: string) => b.trim().toLowerCase()).filter(Boolean),
    tagSlugs: tagRaw.map((t: string) => t.trim().toLowerCase()).filter(Boolean),
    order: order === "oldest" ? "oldest" : order === "likes" ? "likes" : "newest",
    search,
  })

  return {
    prev: navigation.prev ? { slug: navigation.prev.slug, title: navigation.prev.title } : null,
    next: navigation.next ? { slug: navigation.next.slug, title: navigation.next.title } : null,
  }
}
