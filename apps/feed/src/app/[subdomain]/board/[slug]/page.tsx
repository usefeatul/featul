import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getWorkspacePosts, getWorkspacePostsCount, getSidebarPositionBySlug, getWorkspaceBoards } from "@/lib/workspace"
import { readHasVotedForPost } from "@/lib/vote.server"
import { MainContent } from "@/components/subdomain/MainContent"

export const revalidate = 0
export const dynamic = "force-dynamic"

export async function generateMetadata({ params, searchParams }: { params: Promise<{ subdomain: string; slug: string }>; searchParams: Promise<{ board?: string }> }): Promise<Metadata> {
  const { subdomain, slug } = await params
  return createWorkspaceSectionMetadata(subdomain, "feedback", { boardSlug: slug })
}
const PAGE_SIZE = 15
export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; slug: string }>
  searchParams: Promise<{ page?: string; order?: "newest" | "oldest" | "likes" }>
}) {
  const { subdomain, slug: boardSlug } = await params
  const sp = await searchParams

  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, subdomain))
    .limit(1)
  if (!ws) notFound()

  const page = Math.max(1, Number(sp.page ?? "1") || 1)
  const offset = (page - 1) * PAGE_SIZE
  const orderParam = String(sp.order || "likes").toLowerCase()
  const order = orderParam === "oldest" ? "oldest" : orderParam === "likes" ? "likes" : "newest"

  const rows = await getWorkspacePosts(subdomain, {
    order,
    limit: PAGE_SIZE,
    offset,
    boardSlugs: [boardSlug],
  })

  const items = await Promise.all(
    (rows as any[]).map(async (r) => ({ ...r, hasVoted: await readHasVotedForPost(r.id) }))
  )

  const totalCount = await getWorkspacePostsCount(subdomain, {
    boardSlugs: [boardSlug],
  })
  const sidebarPosition = await getSidebarPositionBySlug(subdomain)
  const initialBoards = await getWorkspaceBoards(subdomain)
  return (
    <MainContent
      subdomain={subdomain}
      slug={subdomain}
      items={items as any}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      sidebarPosition={sidebarPosition}
      initialBoards={initialBoards as any}
      selectedBoard={boardSlug}
      linkPrefix="/board/p"
    />
  )
}
