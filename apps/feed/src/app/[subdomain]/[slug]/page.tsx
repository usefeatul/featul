import { notFound } from "next/navigation"
import { client } from "@feedgot/api/client"

export const dynamic = "force-dynamic"

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await client.workspace.bySlug.$get({ slug })
  const data = await res.json()
  const ws = data?.workspace
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