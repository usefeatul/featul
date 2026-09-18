"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { cn } from "@featul/ui/lib/utils"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { client } from "@featul/api/client"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { toast } from "sonner"

type Tag = {
  id: string
  name: string
  slug: string
  color?: string | null
}

type TagsByWorkspaceResponse = {
  tags?: Array<{
    id?: string | number
    name?: string
    slug?: string
    color?: string | null
  }>
}

type TagsPickerProps = {
  workspaceSlug: string
  postId: string
  value?: Array<{ id: string; name: string }>
  className?: string
  showTags?: boolean
  onChange?: (next: Tag[]) => void
}

export default function TagsPicker({ workspaceSlug, postId, value = [], className, showTags = false, onChange }: TagsPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() => value.map((t) => t.id))
  const queryClient = useQueryClient()

  React.useEffect(() => {
    setSelectedIds(value.map((t) => t.id))
  }, [value])

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tags", workspaceSlug],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug: workspaceSlug })
      const data = (await res.json().catch(() => null)) as TagsByWorkspaceResponse | null
      const tags = Array.isArray(data?.tags) ? data.tags : []
      return tags.map((tag): Tag => ({
        id: String(tag.id ?? ""),
        name: String(tag.name ?? ""),
        slug: String(tag.slug ?? ""),
        color: tag.color ?? null,
      }))
    },
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const mutation = useMutation({
    mutationFn: async (nextIds: string[]) => {
      const res = await client.post.update.$post({
        postId,
        tags: nextIds,
      })
      if (!res.ok) {
        throw new Error("Failed to update tags")
      }
      return nextIds
    },
    onError: () => toast.error("Could not update tags. Please try again."),
    onSuccess: async (nextIds) => {
      setSelectedIds(nextIds)
      const available = new Map<string, Tag>([...value.map((tag) => [tag.id, { ...tag, slug: "" }] as const), ...items.map((tag) => [tag.id, tag] as const)])
      const nextTags = nextIds.flatMap((id) => { const tag = available.get(id); return tag ? [tag] : [] })
      onChange?.(nextTags)
      await queryClient.invalidateQueries({ queryKey: ["tags", workspaceSlug], exact: false })
    },
  })

  const toggleTag = (tagId: string) => {
    if (mutation.isPending) return
    const exists = selectedIds.includes(tagId)
    const next = exists ? selectedIds.filter((id) => id !== tagId) : [...selectedIds, tagId]
    mutation.mutate(next)
  }

  return (
    <div className={cn(showTags ? "contents" : "flex min-w-0 flex-wrap items-center gap-2", className)}>
      <Toolbar variant="plain" size="sm" className="w-fit rounded-md border-0 bg-black/5 dark:bg-white/5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="plain"
              size="sm"
              className={cn(
                toolbarItemClass,
                "h-8 gap-1.5 px-2.5 text-xs font-medium",
                mutation.isPending && "opacity-70 cursor-wait"
              )}
              aria-label="Manage tags"
              disabled={mutation.isPending}
            >
              <span className="max-w-[140px] truncate">
                {selectedIds.length > 0 ? `${selectedIds.length} tag${selectedIds.length > 1 ? "s" : ""}` : "Tags"}
              </span>
            </Button>
          </PopoverTrigger>
        <PopoverContent list className="w-fit" align="end">
          {isLoading ? (
            <div className="p-3 text-sm text-accent">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-3 text-sm text-accent">No tags</div>
          ) : (
            <PopoverList>
              {items.map((it) => {
                const isSelected = selectedIds.includes(it.id)
                return (
                  <PopoverListItem
                    key={it.id}
                    role="menuitemcheckbox"
                    aria-checked={isSelected}
                    disabled={mutation.isPending}
                    onClick={() => toggleTag(it.id)}
                  >
                    <span className="text-sm truncate">{it.name}</span>
                    {isSelected ? <span className="ml-auto text-xs">✓</span> : null}
                  </PopoverListItem>
                )
              })}
            </PopoverList>
          )}
        </PopoverContent>
        </Popover>
      </Toolbar>
      {showTags ? value.map((tag) => (
        <span key={tag.id} className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-md bg-black/5 pl-2.5 pr-1.5 text-xs font-medium dark:bg-white/5">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{tag.name}</span>
          <button type="button" aria-label={`Remove ${tag.name} tag`} title={`Remove ${tag.name}`} disabled={mutation.isPending} onClick={() => toggleTag(tag.id)} className="flex size-5 shrink-0 items-center justify-center rounded text-accent hover:bg-black/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 dark:hover:bg-white/10">
            <XMarkIcon className="size-3" />
          </button>
        </span>
      )) : null}
    </div>
  )
}
