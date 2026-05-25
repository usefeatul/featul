"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@featul/ui/components/command"
import { MergeIcon } from "@featul/ui/icons/merge"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { client } from "@featul/api/client"
import { useQuery } from "@tanstack/react-query"
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog"

type MergeCandidate = {
  id: string
  title: string
  slug: string
}

type MergeCandidatesResponse = {
  candidates?: MergeCandidate[]
}

export interface MergePopoverProps {
  postId: string
  workspaceSlug: string
}

export function MergePopover({ postId, workspaceSlug }: MergePopoverProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"merge_into" | "merge_here" | null>(
    null,
  )
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["merge-candidates", postId, query],
    enabled: searchOpen,
    queryFn: async () => {
      const res = await client.post.searchMergeCandidates.$get({
        postId,
        query: query.trim(),
        excludeSelf: true,
      })
      const data = (await res
        .json()
        .catch(() => null)) as MergeCandidatesResponse | null
      return Array.isArray(data?.candidates) ? data.candidates : []
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
      await client.post.merge.$post({
        postId,
        targetPostId: targetId,
        mergeType: "merge_into",
      })
      captureAnalyticsEvent(analyticsEvents.postsMerged, {
        post_id: postId,
        target_post_id: targetId,
        merge_type: "merge_into",
      })
      setSearchOpen(false)
      router.push(`/workspaces/${workspaceSlug}/requests/${slug}`)
    } else {
      await client.post.mergeHere.$post({ postId, sourcePostIds: [targetId] })
      captureAnalyticsEvent(analyticsEvents.postsMerged, {
        post_id: postId,
        target_post_id: targetId,
        merge_type: "merge_here",
      })
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
            className="rounded-md border-2 border-border bg-[var(--workspace-surface)] shadow-sm ring-1 ring-border/60 ring-offset-1 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-primary/40 hover:bg-card"
            aria-label="Merge"
          >
            <MergeIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          list
          className="fit min-w-60 rounded-lg border-2 border-border bg-background p-1 shadow-lg ring-1 ring-border/50"
        >
          <PopoverList className="space-y-1">
            <PopoverListItem
              onClick={() => start("merge_into")}
              className="rounded-md border border-transparent bg-background px-2.5 py-2.5 hover:border-border hover:bg-card"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
                <MergeIcon className="size-3.5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Merge with other
                </span>
                <span className="text-xs text-muted-foreground">
                  Move this post into another request
                </span>
              </span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            </PopoverListItem>
            <PopoverListItem
              onClick={() => start("merge_here")}
              className="rounded-md border border-transparent bg-background px-2.5 py-2.5 hover:border-border hover:bg-card"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
                <MergeIcon className="size-3.5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Merge other here
                </span>
                <span className="text-xs text-muted-foreground">
                  Keep this post as the main request
                </span>
              </span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            </PopoverListItem>
          </PopoverList>
        </PopoverContent>
      </Popover>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title={mode === "merge_here" ? "Merge other here" : "Merge with other"}
        width="wide"
        icon={<MergeIcon className="size-3.5 text-primary" />}
      >
        <CommandInput
          value={query}
          onValueChange={(v) => setQuery(v)}
          placeholder="Search posts"
          aria-label="Search posts"
          onKeyDown={(e) => {
            if (e.key === "Enter" && candidates[0])
              onSelectCandidate(candidates[0].id, candidates[0].slug)
          }}
        />
        <CommandList className="mt-2 rounded-lg border-2 border-border bg-background p-1">
          <CommandEmpty />
          {isLoading ? null : candidates.length > 0 ? (
            <CommandGroup>
              {candidates.map((r) => (
                <CommandItem
                  key={r.id}
                  onSelect={() => onSelectCandidate(r.id, r.slug)}
                  className="my-1 rounded-md border border-transparent bg-background px-2.5 py-2.5 text-foreground hover:border-border hover:bg-card aria-selected:border-primary/30 aria-selected:bg-card aria-selected:text-foreground"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <MergeIcon className="size-3.5 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {r.title}
                  </span>
                  <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
