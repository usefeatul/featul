import { Container } from "@/components/global/container"
import BrandVarsEffect from "@/components/global/BrandVarsEffect"
import Sidebar from "@/components/sidebar/Sidebar"
import MobileSidebar from "@/components/sidebar/MobileSidebar"
import { getBrandingColorsBySlug, getWorkspaceStatusCounts, getWorkspaceTimezoneBySlug, getWorkspaceBySlug, listUserWorkspaces, getWorkspaceDomainInfoBySlug } from "@/lib/workspace"
import WorkspaceHeader from "@/components/global/WorkspaceHeader"
import FilterSummary from "@/components/requests/FilterSummary"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import UnauthorizedWorkspace from "@/components/global/Unauthorized"
import { EditorHeaderProvider } from "@/components/changelog/EditorHeaderContext"

export const revalidate = 30

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession()
  const userId = session?.user?.id || null
  if (!userId) {
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}`)
  }
  const [branding, counts, timezone, ws, workspaceList, domainInfo] = await Promise.all([
    getBrandingColorsBySlug(slug),
    getWorkspaceStatusCounts(slug),
    getWorkspaceTimezoneBySlug(slug),
    getWorkspaceBySlug(slug),
    userId ? listUserWorkspaces(userId) : Promise.resolve([]),
    getWorkspaceDomainInfoBySlug(slug),
  ])
  const hasAccess = workspaceList.some((w) => w.slug === slug)
  const fallbackSlug = workspaceList[0]?.slug || null
  if (!hasAccess) {
    return <UnauthorizedWorkspace slug={slug} fallbackSlug={fallbackSlug} />
  }
  const { primary: p } = branding
  const serverNow = Date.now()
  return (
    <Container className="min-h-screen lg:flex lg:gap-4" maxWidth="7xl" noPadding>
      <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
      <BrandVarsEffect primary={p} />
      <Sidebar initialCounts={counts} initialTimezone={timezone} initialServerNow={serverNow} initialWorkspace={ws || undefined} initialDomainInfo={domainInfo || undefined} initialWorkspaces={workspaceList} initialUser={session?.user} />
      <main className="w-full lg:flex-1 px-4 lg:px-0 pb-10 lg:pb-0">
        <EditorHeaderProvider>
          <WorkspaceHeader />
          <FilterSummary />
          {children}
        </EditorHeaderProvider>
      </main>
      <MobileSidebar initialCounts={counts} initialTimezone={timezone} initialServerNow={serverNow} initialWorkspace={ws || undefined} initialDomainInfo={domainInfo || undefined} initialWorkspaces={workspaceList} initialUser={session?.user} />
    </Container>
  )
}
