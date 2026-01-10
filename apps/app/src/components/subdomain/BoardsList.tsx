"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { client } from "@featul/api/client"
import { DocumentTextIcon } from "@featul/ui/icons/document-text"

type Board = { id: string; name: string; slug: string; postCount?: number }

export function BoardsList({ slug, subdomain, initialBoards, selectedBoard }: { slug: string; subdomain: string; initialBoards?: Board[]; selectedBoard?: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const current = selectedBoard || search.get("board") || "__all__"
  function sortBoards(list: Board[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }
  const [boards, setBoards] = React.useState<Board[]>(() => {
    const list = Array.isArray(initialBoards) ? initialBoards : []
    return sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))
  })
  const [loading, setLoading] = React.useState(() => !(Array.isArray(initialBoards) && initialBoards.length > 0))

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await client.board.byWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const list = (data?.boards || []) as Board[]
        const filtered = sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))
        if (mounted) setBoards(filtered)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [slug])

  const total = boards.reduce((sum, b) => sum + (Number(b.postCount) || 0), 0)

  function go(value: string) {
    if (value === "__all__") {
      router.push("/")
    } else {
      router.push(`/board/${value}`)
    }
  }

  const Item = ({ active, label, count, onClick }: { active?: boolean; label: string; count?: number; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm cursor-pointer ${
        active ? "bg-muted dark:bg-black/40" : "hover:bg-muted dark:hover:bg-black/60"
      }`}
      disabled={loading}
    >
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-md bg-primary" />
        {label}
      </span>
      <span className="text-xs text-accent w-10 text-right tabular-nums font-mono">{Number(count) || 0}</span>
    </button>
  )

  return (
    <div className="rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border bg-card p-4 min-h-[160px]">
      <div className="mb-2 text-sm font-medium flex items-center gap-2">
        <DocumentTextIcon className="size-4 text-muted-foreground" />
        Boards
      </div>
      <div className="space-y-1">
        <Item active={current === "__all__"} label="All Feedback" count={total} onClick={() => go("__all__")} />
        {boards.map((b) => (
          <Item key={b.id} active={current === b.slug} label={b.name} count={b.postCount} onClick={() => go(b.slug)} />
        ))}
      </div>
    </div>
  )
}
