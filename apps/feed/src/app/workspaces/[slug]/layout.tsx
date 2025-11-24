import { Container } from "@/components/global/container"
import Sidebar from "@/components/sidebar/Sidebar"
import MobileSidebar from "@/components/sidebar/MobileSidebar"
import { db, workspace, brandingConfig } from "@feedgot/db"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const slug = params.slug
  let p = "#3b82f6"
  let a = "#60a5fa"
  try {
    const [ws] = await db
      .select({ id: workspace.id })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    if (ws?.id) {
      const [conf] = await db
        .select({ primaryColor: brandingConfig.primaryColor, accentColor: brandingConfig.accentColor })
        .from(brandingConfig)
        .where(eq(brandingConfig.workspaceId, ws.id))
        .limit(1)
      if (conf?.primaryColor) p = conf.primaryColor
      if (conf?.accentColor) a = conf.accentColor
    }
  } catch {}
  return (
    <Container className="min-h-screen flex gap-6" maxWidth="8xl">
      <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileSidebar />
    </Container>
  )
}
