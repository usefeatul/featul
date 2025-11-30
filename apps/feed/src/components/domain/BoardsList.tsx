"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { client } from "@feedgot/api/client"

type Board = { id: string; name: string; slug: string; postCount?: number }

export function BoardsList({ slug, subdomain }: { slug: string; subdomain: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const current = search.get("board") || "__all__"
  const [boards, setBoards] = React.useState<Board[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await client.board.byWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const list = (data?.boards || []) as Board[]
        const filtered = list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog")
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
    const base = `/${subdomain}/${slug}`
    const url = value === "__all__" ? base : `${base}?board=${encodeURIComponent(value)}`
    router.push(url)
  }

  const Item = ({ active, label, count, onClick }: { active?: boolean; label: string; count?: number; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
        active ? "bg-muted" : "hover:bg-muted"
      }`}
      disabled={loading}
    >
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        {label}
      </span>
      <span className="text-xs text-accent">{Number(count) || 0}</span>
    </button>
  )

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-2 text-sm font-medium">Boards</div>
      <div className="space-y-1">
        <Item active={current === "__all__"} label="All Feedback" count={total} onClick={() => go("__all__")} />
        {boards.map((b) => (
          <Item key={b.id} active={current === b.slug} label={b.name} count={b.postCount} onClick={() => go(b.slug)} />
        ))}
      </div>
    </div>
  )
}
