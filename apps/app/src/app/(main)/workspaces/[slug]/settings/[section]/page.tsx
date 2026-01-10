import type { Metadata } from "next"
import SettingsServer from "@/components/settings/global/SettingsServer"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"
import { getSettingsInitialData } from "@/lib/workspace"
import { getServerSession } from "@featul/auth/session"

export const revalidate = 30

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
  const {
    initialPlan,
    initialWorkspaceId,
    initialWorkspaceName,
    initialTeam,
    initialChangelogVisible,
    initialChangelogTags,
    initialHidePoweredBy,
    initialBrandingConfig,
    initialDomainInfo,
    initialDefaultDomain,
    initialFeedbackBoards,
    initialFeedbackTags,
    initialIntegrations,
  } = await getSettingsInitialData(slug, session?.user?.id)
  
  return (
    <SettingsServer
      slug={slug}
      selectedSection={section}
      initialChangelogVisible={initialChangelogVisible}
      initialHidePoweredBy={initialHidePoweredBy}
      initialPlan={initialPlan}
      initialWorkspaceId={initialWorkspaceId}
      initialWorkspaceName={initialWorkspaceName}
      initialTeam={initialTeam as any}
      initialChangelogTags={initialChangelogTags}
      initialBrandingConfig={initialBrandingConfig}
      initialDomainInfo={initialDomainInfo}
      initialDefaultDomain={initialDefaultDomain}
      initialFeedbackBoards={initialFeedbackBoards}
      initialFeedbackTags={initialFeedbackTags}
      initialIntegrations={initialIntegrations}
    />
  )
}
