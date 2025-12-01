import React from "react"
import { notFound } from "next/navigation"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import { Container } from "@/components/global/container"
import { DomainHeader } from "@/components/domain/DomainHeader"
import BrandVarsEffect from "@/components/global/BrandVarsEffect"
import { getBrandingBySlug } from "@/lib/workspace"
import SubdomainThemeProvider from "@/components/domain/SubdomainThemeProvider"
import { DomainBrandingProvider } from "@/components/domain/DomainBrandingProvider"
import { PoweredBy } from "@/components/domain/PoweredBy"


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
          <div className="bg-card dark:bg-[#111113] border-b flex-1" />
        </div>
        {(() => {
          const maxW = branding.layoutStyle === "compact" ? "4xl" : branding.layoutStyle === "spacious" ? "6xl" : "5xl"
          return (
            <Container maxWidth={maxW}>
              <DomainHeader workspace={ws} subdomain={subdomain} />
              <div className="mt-4 pb-16 md:pb-0">{children}</div>
            </Container>
          )
        })()}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="mx-auto max-w-5xl px-4 sm:px-8 lg:px-16 xl:px-20 pb-3">
            <PoweredBy />
          </div>
        </div>
        </DomainBrandingProvider>
      </SubdomainThemeProvider>
    </>
  )
}
