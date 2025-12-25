"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@oreilla/ui/components/command"
import { MergeIcon } from "@oreilla/ui/icons/merge"
import { client } from "@oreilla/api/client"
import { useQuery } from "@tanstack/react-query"

export interface MergePopoverProps {
  postId: string
  workspaceSlug: string
}

export function MergePopover({ postId, workspaceSlug }: MergePopoverProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"merge_into" | "merge_here" | null>(null)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["merge-candidates", postId, query],
    enabled: searchOpen && query.trim().length >= 2,
    queryFn: async () => {
      const res = await client.post.searchMergeCandidates.$get({
        postId,
        query: query.trim(),
        excludeSelf: true,
      } as any)
      const data = await res.json()
      return (data?.candidates || []) as { id: string; title: string; slug: string }[]
    },
    staleTime: 10_000,
  })

  function start(modeSel: "merge_into" | "merge_here") {
    setMode(modeSel)
    setOpen(false)
    setSearchOpen(true)
  }

  async function onSelectCandidate(targetId: string, slug: string) {
    if (!mode) return
    if (mode === "merge_into") {
      await client.post.merge.$post({ postId, targetPostId: targetId, mergeType: "merge_into" } as any)
      setSearchOpen(false)
      router.push(`/workspaces/${workspaceSlug}/requests/${slug}`)
    } else {
      await client.post.mergeHere.$post({ postId, sourcePostIds: [targetId] } as any)
      setSearchOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="nav"
            size="icon-sm"
            className="rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-destructive/5"
            aria-label="Merge"
          >
            <MergeIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" list className="w-52">
          <PopoverList>
            <PopoverListItem onClick={() => start("merge_into")}>
              <span className="text-sm">Merge with other</span>
            </PopoverListItem>
            <PopoverListItem onClick={() => start("merge_here")}>
              <span className="text-sm">Merge other here</span>
            </PopoverListItem>
          </PopoverList>
        </PopoverContent>
      </Popover>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Merge"  width="wide">
        <CommandInput
          value={query}
          onValueChange={(v) => setQuery(v)}
          placeholder="Search posts"
          aria-label="Search posts"
          onKeyDown={(e) => {
            if (e.key === "Enter" && candidates[0]) onSelectCandidate(candidates[0].id, candidates[0].slug)
          }}
        />
        <CommandList>
          <CommandEmpty />
          {isLoading ? null : candidates.length > 0 ? (
            <CommandGroup>
              {candidates.map((r) => (
                <CommandItem key={r.id} onSelect={() => onSelectCandidate(r.id, r.slug)}>
                  {r.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
