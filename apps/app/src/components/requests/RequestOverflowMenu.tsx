"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MoreVertical } from "lucide-react"
import { Button } from "@featul/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverSeparator,
  PopoverTrigger,
} from "@featul/ui/components/popover"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@featul/ui/components/command"
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog"
import { MergeIcon } from "@featul/ui/icons/merge"
import { TrashIcon } from "@featul/ui/icons/trash"
import { client } from "@featul/api/client"
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog"
import {
  deletePostById,
  dispatchPostDeletedEvent,
  invalidateMemberActivityQueries,
} from "@/lib/post-deletion"
import { toast } from "sonner"

type MergeCandidate = {
  id: string
  title: string
  slug: string
}

type MergeCandidatesResponse = {
  candidates?: MergeCandidate[]
}

export type RequestOverflowMenuProps = {
  postId: string
  workspaceSlug: string
  backHref?: string
}

export function RequestOverflowMenu({
  postId,
  workspaceSlug,
  backHref,
}: RequestOverflowMenuProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"merge_into" | "merge_here" | null>(null)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isDeleting, startDeleteTransition] = React.useTransition()

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["merge-candidates", postId, query],
    enabled: searchOpen,
    queryFn: async () => {
      const res = await client.post.searchMergeCandidates.$get({
        postId,
        query: query.trim(),
        excludeSelf: true,
      })
      const data = (await res.json().catch(() => null)) as MergeCandidatesResponse | null
      return Array.isArray(data?.candidates) ? data.candidates : []
    },
    staleTime: 10_000,
  })

  function start(modeSel: "merge_into" | "merge_here") {
    setMode(modeSel)
    setMenuOpen(false)
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

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const result = await deletePostById(postId)
        if (result.ok) {
          toast.success("Post deleted successfully")
          dispatchPostDeletedEvent({ postId, workspaceSlug, status: null })
          void invalidateMemberActivityQueries(queryClient)
          const target = backHref || "/"
          router.push(target)
          router.refresh()
        } else {
          toast.error(result.message)
        }
      } finally {
        setDeleteOpen(false)
      }
    })
  }

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="nav"
            size="icon-sm"
            className="rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-background"
            aria-label="More actions"
          >
            <MoreVertical className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" list className="fit min-w-0">
          <PopoverList>
            <PopoverListItem onClick={() => start("merge_into")}>
              <MergeIcon className="size-3.5" />
              <span className="text-sm">Merge with other</span>
            </PopoverListItem>
            <PopoverListItem onClick={() => start("merge_here")}>
              <MergeIcon className="size-3.5" />
              <span className="text-sm">Merge other here</span>
            </PopoverListItem>
            <PopoverSeparator />
            <PopoverListItem
              onClick={() => {
                setMenuOpen(false)
                setDeleteOpen(true)
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <TrashIcon className="size-3.5" />
              <span className="text-sm">Delete</span>
            </PopoverListItem>
          </PopoverList>
        </PopoverContent>
      </Popover>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Merge" width="wide">
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

      <DestructiveConfirmDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          if (isDeleting) return
          setDeleteOpen(next)
        }}
        isPending={isDeleting}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description="This will permanently delete this post."
      />
    </>
  )
}
