import { db, workspace, board, post } from "@feedgot/db"
import { eq, and, desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug })
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
    .where(and(eq(board.workspaceId, ws.id), sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`))
    .orderBy(desc(post.createdAt))

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">{ws.name}</div>
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
