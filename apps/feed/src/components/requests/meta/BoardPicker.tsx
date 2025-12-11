"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"
import { client } from "@oreilla/api/client"
import { cn } from "@oreilla/ui/lib/utils"

type Board = { id: string; name: string; slug: string }

export default function BoardPicker({ workspaceSlug, postId, value, onChange, className }: { workspaceSlug: string; postId: string; value: { name: string; slug: string }; onChange: (v: { name: string; slug: string }) => void; className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [boards, setBoards] = React.useState<Board[]>([])

  React.useEffect(() => {
    let mounted = true
    client.board.settingsByWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res: Response) => {
      if (!mounted) return
      const data = await res.json().catch(() => null)
      const rows = (((data as any)?.boards) || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }))
      const filtered = rows.filter((b: any) => b.slug !== "roadmap" && b.slug !== "changelog")
      setBoards(filtered)
    })
    return () => {
      mounted = false
    }
  }, [workspaceSlug])

  const select = async (slug: string, name: string) => {
    if (saving) return
    setSaving(true)
    try {
      await client.board.updatePostBoard.$post({ postId, boardSlug: slug })
      onChange({ name, slug })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="nav"
          size="sm"
          className={cn(
            "h-6 px-2.5  border text-xs font-medium transition-colors hover:bg-muted",
            className
          )}
        >
          <span className="">{value?.name || "Board"}</span>
          <DropdownIcon className="ml-1.5 opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="w-fit">
        <PopoverList>
          {boards.map((b) => (
            <PopoverListItem key={b.slug} role="menuitemradio" aria-checked={value?.slug === b.slug} onClick={() => select(b.slug, b.name)}>
              <span className="text-sm">{b.name}</span>
              {value?.slug === b.slug ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
