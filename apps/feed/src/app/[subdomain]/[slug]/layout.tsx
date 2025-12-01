import React from "react"
import { notFound } from "next/navigation"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import { Container } from "@/components/global/container"
import { DomainHeader } from "@/components/domain/DomainHeader"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string; slug: string }>
}) {
  const { subdomain, slug } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain, logo: workspace.logo })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) notFound()

  return (
    <>
      <div className="fixed inset-0 -z-10 flex flex-col">
        <div className="bg-muted/50 border-b border-accent/10 h-44 sm:h-56" />
        <div className="border-b flex-1" />
      </div>
      <Container maxWidth="5xl">
        <DomainHeader workspace={ws} subdomain={subdomain} />
      </Container>
      <Container maxWidth="5xl">{children}</Container>
    </>
  )
}
