import type { Metadata } from "next"
import { headers } from "next/headers"
import { createPageMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import BoardsView from "@/components/boards/BoardsView"

export const dynamic = "force-dynamic"

async function findWorkspaceByHost(host: string) {
  const base = (host ?? "localhost").replace(/:\d+$/, "")
  const parts = base.split(".")
  const slug: string = parts.length > 1 ? (parts[0] || "localhost") : (base || "localhost")
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  return ws || null
}

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers()
  const host = hdrs.get("host") || "localhost"
  const ws = await findWorkspaceByHost(host)
  const name = ws?.name || host
  const proto = new URL(SITE_URL).protocol.replace(":", "")
  const baseUrl = `${proto}://${host}`
  return createPageMetadata({ title: `Roadmap - ${name}`, description: `Planned and in-progress updates for ${name}.`, path: "/roadmap", absoluteTitle: true, baseUrl })
}

export default async function RoadmapPage() {
  const hdrs = await headers()
  const host = hdrs.get("host") || "localhost"
  const ws = await findWorkspaceByHost(host)
  const slug = ws?.slug || (host.split(".")[0] || "")
  const name = ws?.name || slug
  return <BoardsView workspaceSlug={slug} workspaceName={name} defaultTab={"roadmap"} />
}
