import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

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

        {tab==="issues" && (
          <section className="mt-6">
            <ul className="space-y-3">
              {["Enable dark mode","Improve search","Mobile layout tweaks"].map((t, i) => (
                <li key={i} className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t}</span>
                    <span className="text-xs text-accent">▲ {Math.floor(Math.random()*50)+1}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab==="roadmap" && (
          <section className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "planned", name: "Planned", color: "#6b7280", items: ["SSO", "Custom themes"] },
                { id: "in-progress", name: "In Progress", color: "#f59e0b", items: ["Real-time comments"] },
                { id: "completed", name: "Completed", color: "#10b981", items: ["Voting", "Changelog page"] },
              ].map((s) => (
                <div key={s.id} className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold" style={{ color: s.color }}>{s.name}</h3>
                  <ul className="mt-3 space-y-2">
                    {s.items.map((it, i) => (
                      <li key={i} className="text-sm">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab==="changelog" && (
          <section className="mt-6">
            <ul className="space-y-3">
              {[
                { title: "v0.2 – Voting", date: "2025-11-10" },
                { title: "v0.1 – Initial release", date: "2025-11-01" },
              ].map((u, i) => (
                <li key={i} className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{u.title}</span>
                    <span className="text-xs text-accent">{u.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}