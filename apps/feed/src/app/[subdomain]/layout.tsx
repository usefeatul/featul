import React from "react"
import { notFound } from "next/navigation"
import { db, workspace, brandingConfig } from "@feedgot/db"
import { eq } from "drizzle-orm"

import { Container } from "@/components/global/container"
import { DomainHeader } from "@/components/domain/DomainHeader"
import BrandVarsEffect from "@/components/global/BrandVarsEffect"
import ThemeEffect from "@/components/global/ThemeEffect"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const [ws] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      domain: workspace.domain,
      logo: workspace.logo,
      primaryColor: brandingConfig.primaryColor,
      theme: brandingConfig.theme,
      showLogo: brandingConfig.showLogo,
      showWorkspaceName: brandingConfig.showWorkspaceName,
    })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, subdomain))
    .limit(1)

  if (!ws) notFound()

  return (
    <>
      {(() => {
        const p = (ws as any)?.primaryColor || "#3b82f6"
        return <style>{`:root{--primary:${p};--ring:${p};--sidebar-primary:${p};}`}</style>
      })()}
      <BrandVarsEffect primary={(ws as any)?.primaryColor || "#3b82f6"} />
      <ThemeEffect value={(ws as any)?.theme || "system"} />
      <div className="fixed inset-0 -z-10 flex flex-col">
        <div className="bg-muted border-b h-48 sm:h-56" />
        <div className="bg-card border-b flex-1" />
      </div>
      <Container maxWidth="5xl">
        <DomainHeader workspace={ws as any} subdomain={subdomain} branding={{ showLogo: (ws as any)?.showLogo !== false, showWorkspaceName: (ws as any)?.showWorkspaceName !== false }} />
      </Container>
      <Container maxWidth="5xl">{children}</Container>
    </>
  )
}
