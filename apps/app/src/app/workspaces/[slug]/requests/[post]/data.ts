import { db, board, post, user, workspaceMember, postTag, tag, postReport } from "@featul/db"
import { and, eq, sql } from "drizzle-orm"
import { readHasVotedForPost } from "@/lib/vote.server"
import { getPostNavigation, normalizeStatus } from "@/lib/workspace"
import { parseArrayParam } from "@/utils/request-filters"
import {
  buildPostSelect,
  ensureAuthorAvatar,
  loadMergedPostData,
  loadPostComments,
  loadWorkspaceBySlug,
} from "@/lib/request-detail"
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
  const ws = await loadWorkspaceBySlug(workspaceSlug)
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
  const { initialComments, initialCollapsedIds } = await loadPostComments(rawPost.id)
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

async function loadPostWithAuthorAndBoard(workspaceId: string, postSlug: string): Promise<RawPostRecord | null> {
  const [p] = await db
    .select(buildPostSelect())
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
  const { mergedCount, mergedInto, mergedSources } = await loadMergedPostData({
    workspaceId,
    postId: p.id,
    duplicateOfId: p.duplicateOfId,
    includeSources: true,
  })

  return {
    ...p,
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    createdAt: new Date(p.createdAt).toISOString(),
    mergedCount,
    mergedInto,
    mergedSources,
  } as RawPostRecord
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
