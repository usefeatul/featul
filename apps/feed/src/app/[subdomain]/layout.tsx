import React from "react"
import { notFound } from "next/navigation"
import { db, workspace, board } from "@feedgot/db"
import { eq, and } from "drizzle-orm"
import { Container } from "@/components/global/container"
import { DomainHeader } from "@/components/subdomain/DomainHeader"
import BrandVarsEffect from "@/components/global/BrandVarsEffect"
import { getBrandingBySlug } from "@/lib/workspace"
import SubdomainThemeProvider from "@/components/subdomain/SubdomainThemeProvider"
import { DomainBrandingProvider } from "@/components/subdomain/DomainBrandingProvider"
import { PoweredBy } from "@/components/subdomain/PoweredBy"
import { getServerSession } from "@feedgot/auth/session"


export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain, logo: workspace.logo })
    .from(workspace)
    .where(eq(workspace.slug, subdomain))
    .limit(1)

  if (!ws) notFound()

  const branding = await getBrandingBySlug(subdomain)
  const session = await getServerSession()
  const [b] = await db
    .select({ id: board.id, isVisible: board.isVisible, isPublic: board.isPublic })
    .from(board)
    .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog" as any)))
    .limit(1)
  const changelogVisible = Boolean(b?.isVisible) && Boolean(b?.isPublic)
  const hidePoweredBy = Boolean(branding.hidePoweredBy)
  const p = branding.primary
  return (
    <>
      <SubdomainThemeProvider theme={branding.theme}>
        <DomainBrandingProvider hidePoweredBy={hidePoweredBy} sidebarPosition={branding.sidebarPosition}>
        <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
        <BrandVarsEffect primary={p} />
        <div className="fixed inset-0 -z-10 flex flex-col">
          <div className="bg-background  dark:bg-background dark:border-background/60 border-b border-2 h-44 sm:h-52" />
          <div className="bg-card dark:bg-black/40 border-b flex-1" />
        </div>
        {(() => {
          const maxW = branding.layoutStyle === "compact" ? "4xl" : branding.layoutStyle === "spacious" ? "6xl" : "5xl"
          return (
            <Container maxWidth={maxW}>
              <DomainHeader
                workspace={ws}
                subdomain={subdomain}
                changelogVisible={changelogVisible}
                initialUser={session?.user ? { name: session.user.name, email: session.user.email, image: session.user.image } : null}
              />
              <div className="mt-6 pb-16 md:pb-0">{children}</div>
            </Container>
          )
        })()}
        {/* <div className="fixed bottom-0 left-0 right-0 z-30">
          {(() => {
            const maxW = branding.layoutStyle === "compact" ? "4xl" : branding.layoutStyle === "spacious" ? "6xl" : "5xl"
            return (
              <Container maxWidth={maxW} className="flex  justify-end items-end">
                <PoweredBy />
              </Container>
            )
          })()}
        </div> */}
        </DomainBrandingProvider>
      </SubdomainThemeProvider>
    </>
  )
}
