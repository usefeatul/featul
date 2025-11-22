import { notFound } from "next/navigation"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) notFound()

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">{ws.name}</h1>
        <p className="text-accent text-sm">{ws.slug}.feedgot.com</p>
        <div className="mt-6 text-sm text-accent">Domain: {ws.domain}</div>
      </div>
    </main>
  )
}