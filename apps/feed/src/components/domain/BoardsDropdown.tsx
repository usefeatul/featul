"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@feedgot/ui/components/select"
import { client } from "@feedgot/api/client"

type Board = { id: string; name: string; slug: string; type?: string | null }

export function BoardsDropdown({ slug, subdomain }: { slug: string; subdomain: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const selected = search.get("board") || "__all__"
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

  function onChange(value: string) {
    const base = `/${subdomain}/${slug}`
    const next = value === "__all__" ? base : `${base}?board=${encodeURIComponent(value)}`
    router.push(next)
  }

  return (
    <Select value={selected} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="h-8 w-44 text-sm">
        <SelectValue placeholder="Select board" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All Feedback</SelectItem>
        {boards.map((b) => (
          <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
