"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { DropdownIcon } from "@feedgot/ui/icons/dropdown"
import { client } from "@feedgot/api/client"

type Board = { id: string; name: string; slug: string }

export default function BoardPicker({ workspaceSlug, postId, value, onChange }: { workspaceSlug: string; postId: string; value: { name: string; slug: string }; onChange: (v: { name: string; slug: string }) => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [boards, setBoards] = React.useState<Board[]>([])

  React.useEffect(() => {
    let mounted = true
    client.board.byWorkspaceSlug.$get({ slug: workspaceSlug }).then((res: any) => {
      if (!mounted) return
      const rows = (res?.boards || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }))
      setBoards(rows)
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
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
          <span className="rounded-md  px-2 py-0.5">{value?.name || "Board"}</span>
          <DropdownIcon className="ml-1 opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
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
