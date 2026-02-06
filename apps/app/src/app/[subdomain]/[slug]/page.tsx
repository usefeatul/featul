import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db, workspace } from "@featul/db"
import { eq } from "drizzle-orm"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getWorkspacePosts, getWorkspacePostsCount, getSidebarPositionBySlug, getWorkspaceBoards } from "@/lib/workspace"
import { readHasVotedForPost } from "@/lib/vote.server"
import { toRequestItemData } from "@/lib/request-item"
import { MainContent } from "@/components/subdomain/MainContent"
import type { RequestItemData } from "@/types/request"

export const revalidate = 0
export const dynamic = "force-dynamic"

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ board?: string }> }): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  return createWorkspaceSectionMetadata(slug, "feedback", { boardSlug: sp.board })
}
const PAGE_SIZE = 20
export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; slug: string }>
  searchParams: Promise<{ page?: string; board?: string; order?: "newest" | "oldest" | "likes" }>
}) {
  const { subdomain, slug } = await params
  const sp = await searchParams

  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) notFound()

  const page = Math.max(1, Number(sp.page ?? "1") || 1)
  const offset = (page - 1) * PAGE_SIZE
  const boardSlug = sp.board || undefined
  const orderParam = String(sp.order || "likes").toLowerCase()
  const order = orderParam === "oldest" ? "oldest" : orderParam === "likes" ? "likes" : "newest"

  const rows = await getWorkspacePosts(slug, {
    order,
    limit: PAGE_SIZE,
    offset,
    boardSlugs: boardSlug ? [boardSlug] : undefined,
    publicOnly: true,
  })

  const items: RequestItemData[] = await Promise.all(
    rows.map(async (r) =>
      toRequestItemData({
        ...r,
        hasVoted: await readHasVotedForPost(r.id),
      })
    )
  )

  const totalCount = await getWorkspacePostsCount(slug, {
    boardSlugs: boardSlug ? [boardSlug] : undefined,
    publicOnly: true,
  })
  const sidebarPosition = await getSidebarPositionBySlug(slug)
  const initialBoards = await getWorkspaceBoards(slug)
  return (
    <MainContent
      subdomain={subdomain}
      slug={slug}
      items={items}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      sidebarPosition={sidebarPosition}
      initialBoards={initialBoards}
      linkPrefix="/board/p"
    />
  )
}
