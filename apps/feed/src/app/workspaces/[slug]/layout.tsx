import { Container } from "@/components/global/container"
import BrandVarsEffect from "@/components/global/BrandVarsEffect"
import Sidebar from "@/components/sidebar/Sidebar"
import MobileSidebar from "@/components/sidebar/MobileSidebar"
import { getBrandingColorsBySlug, getWorkspaceStatusCounts, getWorkspaceTimezoneBySlug, getWorkspaceBySlug } from "@/lib/workspace"
import WorkspaceHeader from "@/components/global/WorkspaceHeader"

export const dynamic = "force-dynamic"

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [branding, counts, timezone, ws] = await Promise.all([
    getBrandingColorsBySlug(slug),
    getWorkspaceStatusCounts(slug),
    getWorkspaceTimezoneBySlug(slug),
    getWorkspaceBySlug(slug),
  ])
  const { primary: p } = branding
  const serverNow = Date.now()
  return (
    <Container className="min-h-screen md:flex md:gap-6 !px-0" maxWidth="8xl">
      <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
      <BrandVarsEffect primary={p} />
      <Sidebar initialCounts={counts} initialTimezone={timezone} initialServerNow={serverNow} initialWorkspace={ws || undefined} />
      <main className="mt-4 w-full md:flex-1 px-3 sm:px-4 pb-20 md:pb-0">
        <WorkspaceHeader />
        {children}
      </main>
      <MobileSidebar initialCounts={counts} initialTimezone={timezone} initialServerNow={serverNow} initialWorkspace={ws || undefined} />
    </Container>
  )
}
