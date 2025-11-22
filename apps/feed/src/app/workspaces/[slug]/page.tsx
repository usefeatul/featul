import { notFound, redirect } from "next/navigation"
import UserInfo from "@/components/auth/UserInfo"
import { getServerSession } from "@feedgot/auth/session"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import { Button } from "@feedgot/ui/components/button"

export const dynamic = "force-dynamic"

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}`)
  }

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) notFound()

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{ws.name}</h1>
          <p className="text-sm text-accent">Workspace: {ws.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <a href={`https://${ws.slug}.feedgot.com`} aria-label="Open workspace subdomain">
              Open {ws.slug}.feedgot.com
            </a>
          </Button>
          <UserInfo />
        </div>
      </div>
    </section>
  )
}