import { getServerSession } from "@feedgot/auth/session"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params
  let ws: { id?: string; name: string; slug: string } | null = null
  try {
    const session = await getServerSession()
    if (session?.user) {
      const [found] = await db
        .select({ id: workspace.id, name: workspace.name, slug: workspace.slug })
        .from(workspace)
        .where(eq(workspace.slug, slug))
        .limit(1)
      ws = found || null
    }
  } catch {}

  const name = ws?.name || `${slug} Workspace`
  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{name}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-card rounded-md border p-4">
          <div className="text-sm text-accent">Open Requests</div>
          <div className="mt-2 text-3xl font-semibold">24</div>
        </div>
        <div className="bg-card rounded-md border p-4">
          <div className="text-sm text-accent">Completed</div>
          <div className="mt-2 text-3xl font-semibold">128</div>
        </div>
        <div className="bg-card rounded-md border p-4">
          <div className="text-sm text-accent">Active Review</div>
          <div className="mt-2 text-3xl font-semibold">7</div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-card rounded-md border p-4 h-[300px] flex items-center justify-center text-accent">Graph placeholder</div>
        <div className="bg-card rounded-md border p-4 h-[300px] flex items-center justify-center text-accent">Recent activity</div>
      </div>
    </section>
  )
}
