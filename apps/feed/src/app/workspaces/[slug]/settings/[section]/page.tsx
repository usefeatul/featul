import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { db, workspace, board, brandingConfig } from "@feedgot/db"
import { and, eq } from "drizzle-orm"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string; section: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const m = getSectionMeta(section)
  return createPageMetadata({
    title: `${m.label}`,
    description: m.desc,
    path: `/workspaces/${slug}/settings/${section}`,
    indexable: false,
  })
}

export default async function SettingsSectionPage({ params }: Props) {
  const { slug, section } = await params
  let initialChangelogVisible: boolean | undefined
  let initialHidePoweredBy: boolean | undefined
  let initialPlan: string | undefined
  try {
    const [ws] = await db
      .select({ id: workspace.id, plan: workspace.plan })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    if (ws?.id) {
      initialPlan = String((ws as any)?.plan || "free")
      const [b] = await db
        .select({ isVisible: board.isVisible, isPublic: board.isPublic })
        .from(board)
        .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog" as any)))
        .limit(1)
      initialChangelogVisible = Boolean(b?.isVisible)
      const [br] = await db
        .select({ hidePoweredBy: brandingConfig.hidePoweredBy })
        .from(brandingConfig)
        .where(eq(brandingConfig.workspaceId, ws.id))
        .limit(1)
      initialHidePoweredBy = Boolean((br as any)?.hidePoweredBy)
    }
  } catch {}
  return <SettingsTabs slug={slug} selectedSection={section} initialChangelogVisible={initialChangelogVisible} initialHidePoweredBy={initialHidePoweredBy} initialPlan={initialPlan} />
}
