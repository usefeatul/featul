import type { Metadata } from "next"
import SettingsServer from "@/components/settings/global/SettingsServer"
import { db, workspace, board, brandingConfig } from "@feedgot/db"
import { and, eq } from "drizzle-orm"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"
import { getBrandingBySlug } from "@/lib/workspace"
import { client } from "@feedgot/api/client"

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
  let initialWorkspaceName: string | undefined
  let initialTeam: { members: any[]; invites: any[]; meId: string | null } | undefined
  let initialChangelogTags: any[] | undefined
  let initialDomainInfo: any | undefined
  let initialDefaultDomain: string | undefined
  let initialBrandingConfig: any | undefined
  try {
    const [ws] = await db
      .select({ id: workspace.id, plan: workspace.plan, name: workspace.name, logo: workspace.logo })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    if (ws?.id) {
      initialPlan = String((ws as any)?.plan || "free")
      initialWorkspaceName = String((ws as any)?.name || "")
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
      const branding = await getBrandingBySlug(slug)
      initialBrandingConfig = {
        logoUrl: (ws as any)?.logo || undefined,
        primaryColor: branding.primary,
        theme: branding.theme,
        layoutStyle: branding.layoutStyle,
        sidebarPosition: branding.sidebarPosition,
        hidePoweredBy: branding.hidePoweredBy,
      }
    }
  } catch {}
  try {
    const resTeam = await client.team.membersByWorkspaceSlug.$get({ slug })
    const dTeam = await resTeam.json()
    initialTeam = { members: (dTeam as any)?.members || [], invites: (dTeam as any)?.invites || [], meId: (dTeam as any)?.meId ?? null }
  } catch {}
  try {
    const resTags = await client.changelog.tagsList.$get({ slug })
    const dTags = await resTags.json()
    initialChangelogTags = (dTags as any)?.tags || []
  } catch {}
  try {
    const resDomain = await client.workspace.domainInfo.$get({ slug })
    const dDomain = await resDomain.json()
    initialDomainInfo = (dDomain as any)?.domain || null
    initialDefaultDomain = String((dDomain as any)?.defaultDomain || "")
  } catch {}
  return (
    <SettingsServer
      slug={slug}
      selectedSection={section}
      initialChangelogVisible={initialChangelogVisible}
      initialHidePoweredBy={initialHidePoweredBy}
      initialPlan={initialPlan}
      initialWorkspaceName={initialWorkspaceName}
      initialTeam={initialTeam as any}
      initialChangelogTags={initialChangelogTags}
      initialBrandingConfig={initialBrandingConfig}
      initialDomainInfo={initialDomainInfo}
      initialDefaultDomain={initialDefaultDomain}
    />
  )
}
