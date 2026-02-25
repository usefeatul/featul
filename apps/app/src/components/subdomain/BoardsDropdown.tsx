"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down"
import { ListIcon } from "@featul/ui/icons/list"
import { useBoards, type Board } from "@/hooks/useBoards"

export function BoardsDropdown({ slug, initialBoards, selectedBoard }: { slug: string; initialBoards?: Board[]; selectedBoard?: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const selected = selectedBoard || search.get("board") || "__all__"
  const [open, setOpen] = React.useState(false)

  const { boards, loading } = useBoards({ slug, initialBoards })

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
        <Button type="button" variant="nav" className="justify-start gap-2" disabled={loading}>
          <ListIcon className="size-4" />
          <span className="truncate">{label}</span>
          <span className="ml-auto" />
          <ChevronDownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id={`popover-${slug}-boards`} align="start" list className="min-w-[9rem] w-fit">
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
