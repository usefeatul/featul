"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ChevronDownIcon } from "@feedgot/ui/icons/chevron-down"
import { ListIcon } from "@feedgot/ui/icons/list"
import { client } from "@feedgot/api/client"

type Board = { id: string; name: string; slug: string; type?: string | null }

export function BoardsDropdown({ slug, subdomain, initialBoards, selectedBoard }: { slug: string; subdomain: string; initialBoards?: Board[]; selectedBoard?: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const selected = selectedBoard || search.get("board") || "__all__"
  const [open, setOpen] = React.useState(false)
  function sortBoards(list: Board[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }
  const [boards, setBoards] = React.useState<Board[]>(() => {
    const list = Array.isArray(initialBoards) ? initialBoards : []
    const filtered = list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog")
    return sortBoards(filtered)
  })
  const [loading, setLoading] = React.useState(() => !(Array.isArray(initialBoards) && initialBoards.length > 0))

  React.useEffect(() => {
    let mounted = true
    const key = `boards:${slug}`
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
      if (raw) {
        const cached = JSON.parse(raw)
        const list = ((cached?.boards || cached?.data) || []) as Board[]
        const filtered = sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))
        if (mounted) {
          if (boards.length === 0) setBoards(filtered)
          setLoading(false)
        }
      }
    } catch {}
    ;(async () => {
      try {
        const res = await client.board.byWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const list = (data?.boards || []) as Board[]
        const filtered = sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))
        if (mounted) setBoards(filtered)
        try {
          if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify({ boards: filtered, ts: Date.now() }))
        } catch {}
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [slug])

  const label = selected === "__all__" ? "All Feedback" : boards.find((b) => b.slug === selected)?.name || "Select board"

  function go(value: string) {
    setOpen(false)
    if (value === "__all__") {
      router.push("/")
    } else {
      router.push(`/board/${value}`)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="nav" className="justify-start gap-2 dark:bg-black/40" disabled={loading}>
          <ListIcon className="size-3" />
          <span className="truncate">{label}</span>
          <span className="ml-auto" />
          <ChevronDownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id={`popover-${subdomain}-${slug}-boards`} align="start" list className="min-w-[9rem] w-fit">
        <div className="px-3 py-2 text-xs font-medium text-accent">Boards</div>
        <PopoverList>
          <PopoverListItem onClick={() => go("__all__")}> 
            <span className="text-sm">All Feedback</span>
          </PopoverListItem>
          {boards.map((b) => (
            <PopoverListItem key={b.id} onClick={() => go(b.slug)}>
              <span className="text-sm">{b.name}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
