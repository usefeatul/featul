import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import BoardsView from "@/components/boards/BoardsView"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  const name = ws?.name || slug
  const domain = ws?.domain || `${slug}.feedgot.com`
  const proto = new URL(SITE_URL).protocol.replace(":", "")
  const baseUrl = SITE_URL.includes("localhost") ? SITE_URL : `${proto}//${domain}`
  const path = "/"
  const title = `All Feedback - ${name}`
  const description = `Public feedback and ideas for ${name}.`

  return createPageMetadata({ title, description, path, absoluteTitle: true, baseUrl })
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  const name = ws?.name || slug

  return (
    <BoardsView workspaceSlug={slug} workspaceName={name} defaultTab={"issues"} />
  )
}
