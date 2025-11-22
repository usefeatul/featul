"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@feedgot/api/client"
import { Button } from "@feedgot/ui/components/button"
import Link from "next/link"

export default function Sidebar({ workspaceSlug, className = "" }: { workspaceSlug: string; className?: string }) {
  const boardsQ = useQuery({
    queryKey: ["boards", workspaceSlug],
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug: workspaceSlug })
      const data = await res.json()
      return (data?.boards || []) as { id: string; name: string; slug: string; type: string; postCount?: number }[]
    },
  })

  return (
    <aside className={className + " space-y-4"}>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-4 shadow-sm">
        <div className="text-sm font-medium">Got an idea?</div>
        <Button className="mt-3 w-full" variant="default">Submit a Post</Button>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-4 shadow-sm">
        <div className="text-sm font-medium mb-3">Boards</div>
        {!boardsQ.isSuccess ? (
          <div className="text-xs text-accent">Loading…</div>
        ) : (
          <ul className="space-y-2">
            {boardsQ.data.map((b) => {
              const href = b.type === "roadmap" ? "/roadmap" : b.type === "updates" ? "/changelog" : "/issues"
              return (
                <li key={b.id} className="flex items-center justify-between">
                  <Link href={href} className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full" style={{ backgroundColor: b.type === "roadmap" ? "#10b981" : b.type === "updates" ? "#f59e0b" : "#ef4444" }} />
                    <span className="text-sm">{b.name}</span>
                  </Link>
                  <span className="text-xs text-accent">{b.postCount ?? 0}</span>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-4 text-[10px] text-accent">Powered by Feedgot</div>
      </div>
    </aside>
  )
}
