import type { Metadata } from "next"
import SettingsServer from "@/components/settings/global/SettingsServer"
import { db, workspace, board, brandingConfig, workspaceMember, workspaceInvite, user } from "@feedgot/db"
import { and, eq } from "drizzle-orm"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"
import { getBrandingBySlug } from "@/lib/workspace"
import { client } from "@feedgot/api/client"
import { getServerSession } from "@feedgot/auth/session"

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
  const session = await getServerSession()
  let initialChangelogVisible: boolean | undefined
  let initialHidePoweredBy: boolean | undefined
  let initialPlan: string | undefined
  let initialWorkspaceName: string | undefined
  let initialTeam: { members: any[]; invites: any[]; meId: string | null } | undefined
  let initialChangelogTags: any[] | undefined
  let initialDomainInfo: any | undefined
  let initialDefaultDomain: string | undefined
  let initialBrandingConfig: any | undefined
  let wsOwnerId: string | undefined
  try {
    const [ws] = await db
      .select({ id: workspace.id, plan: workspace.plan, name: workspace.name, logo: workspace.logo, ownerId: workspace.ownerId })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    if (ws?.id) {
      initialPlan = String((ws as any)?.plan || "free")
      initialWorkspaceName = String((ws as any)?.name || "")
      wsOwnerId = String((ws as any)?.ownerId || "")
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

      const members = await db
        .select({
          userId: workspaceMember.userId,
          role: workspaceMember.role,
          joinedAt: workspaceMember.joinedAt,
          isActive: workspaceMember.isActive,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(workspaceMember)
        .innerJoin(user, eq(user.id, workspaceMember.userId))
        .where(eq(workspaceMember.workspaceId, ws.id))
      const invites = await db
        .select({
          id: workspaceInvite.id,
          email: workspaceInvite.email,
          role: workspaceInvite.role,
          invitedBy: workspaceInvite.invitedBy,
          expiresAt: workspaceInvite.expiresAt,
          acceptedAt: workspaceInvite.acceptedAt,
          createdAt: workspaceInvite.createdAt,
        })
        .from(workspaceInvite)
        .where(eq(workspaceInvite.workspaceId, ws.id))
      initialTeam = {
        members: members.map((m) => ({ ...m, isOwner: String(wsOwnerId || "") === String(m.userId || "") })),
        invites,
        meId: session?.user?.id || null,
      }
    }
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
