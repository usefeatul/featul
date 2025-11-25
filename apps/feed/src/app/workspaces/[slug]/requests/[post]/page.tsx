import { notFound } from "next/navigation"
import { db, workspace, board, post } from "@feedgot/db"
import { eq, and, sql } from "drizzle-orm"
import RequestDetail from "@/components/requests/RequestDetail"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string; post: string }> }

export default async function RequestDetailPage({ params }: Props) {
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

  return <RequestDetail post={p as any} />
}
