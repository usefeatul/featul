import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getWorkspacePosts, getWorkspacePostsCount, getSidebarPositionBySlug, getWorkspaceBoards } from "@/lib/workspace"
import { MainContent } from "@/components/subdomain/MainContent"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ board?: string }> }): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  return createWorkspaceSectionMetadata(slug, "feedback", { boardSlug: sp.board })
}
const PAGE_SIZE = 15
export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; slug: string }>
  searchParams: Promise<{ page?: string; board?: string; order?: "newest" | "oldest" }>
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
  const order = sp.order === "oldest" ? "oldest" : "newest"

  const rows = await getWorkspacePosts(slug, {
    order,
    limit: PAGE_SIZE,
    offset,
    boardSlugs: boardSlug ? [boardSlug] : undefined,
  })

  const totalCount = await getWorkspacePostsCount(slug, {
    boardSlugs: boardSlug ? [boardSlug] : undefined,
  })
  const sidebarPosition = await getSidebarPositionBySlug(slug)
  const initialBoards = await getWorkspaceBoards(slug)
  return (
    <MainContent
      subdomain={subdomain}
      slug={slug}
      items={rows as any}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      sidebarPosition={sidebarPosition}
      initialBoards={initialBoards as any}
    />
  )
}
