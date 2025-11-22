import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"
import Board from "@/components/boards/Board"

export const dynamic = "force-dynamic"

export default async function SitePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ tab?: string }> }) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  const tab = sp?.tab === "roadmap" || sp?.tab === "changelog" ? sp.tab! : "issues"

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  const name = ws?.name || slug

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-accent text-sm">{slug}.feedgot.com</p>

        <nav className="mt-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-6">
          {["issues","roadmap","changelog"].map(k => (
            <a key={k} href={`?tab=${k}`} className={tab===k ? "py-3 text-primary border-b-2 border-primary" : "py-3 text-accent hover:text-primary"}>
              {k!.charAt(0).toUpperCase() + k!.slice(1)}
            </a>
          ))}
        </nav>

        {tab==="issues" && <Board workspaceSlug={slug} boardSlug="issues" className="mt-6" />}

        {tab==="roadmap" && <Board workspaceSlug={slug} boardSlug="roadmap" className="mt-6" />}

        {tab==="changelog" && <Board workspaceSlug={slug} boardSlug="changelog" className="mt-6" />}
      </div>
    </main>
  )
}