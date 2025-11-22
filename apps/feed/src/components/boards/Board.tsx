"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@feedgot/api/client"

type BoardItem = {
  id: string
  name: string
  slug: string
  type: "feedback" | "roadmap" | "updates"
  description?: string | null
  isPublic: boolean
  allowAnonymous: boolean
  allowVoting: boolean
  allowComments: boolean
}

type PostItem = {
  id: string
  title: string
  slug: string
  upvotes: number | null
  roadmapStatus: string | null
  publishedAt?: string | Date | null
}

export function Board({ workspaceSlug, boardSlug, className = "" }: { workspaceSlug: string; boardSlug: string; className?: string }) {
  const boardsQ = useQuery({
    queryKey: ["boards", workspaceSlug],
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug: workspaceSlug })
      const data = await res.json()
      return (data?.boards || []) as BoardItem[]
    },
  })

  const board = useMemo(() => (boardsQ.data || []).find((b) => b.slug === boardSlug), [boardsQ.data, boardSlug])

  const postsQ = useQuery({
    enabled: !!board,
    queryKey: ["posts", workspaceSlug, boardSlug],
    queryFn: async () => {
      const res = await client.board.postsByBoard.$get({ slug: workspaceSlug, boardSlug })
      const data = await res.json()
      return (data?.posts || []) as PostItem[]
    },
  })

  return (
    <section className={className}>
      {!boardsQ.isSuccess ? (
        <div className="text-sm text-accent">Loading…</div>
      ) : !board ? (
        <div className="text-sm text-accent">Board not found.</div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{board.name}</h2>
            {board.description ? <p className="text-sm text-accent">{board.description}</p> : null}
          </div>
          {!postsQ.isSuccess ? (
            <div className="text-sm text-accent">Loading posts…</div>
          ) : postsQ.data.length === 0 ? (
            <div className="text-sm text-accent">No posts yet.</div>
          ) : (
            <ul className="space-y-3">
              {postsQ.data.map((p) => (
                <li key={p.id} className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.title}</span>
                    {board.type === "updates" ? (
                      <span className="text-xs text-accent">{typeof p.publishedAt === "string" ? p.publishedAt : p.publishedAt?.toString() || ""}</span>
                    ) : board.type === "roadmap" ? (
                      <span className="text-xs text-accent">{p.roadmapStatus || ""}</span>
                    ) : (
                      <span className="text-xs text-accent">▲ {p.upvotes ?? 0}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default Board