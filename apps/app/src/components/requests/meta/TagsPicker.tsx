"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { cn } from "@featul/ui/lib/utils"
import { client } from "@featul/api/client"

type Tag = {
  id: string
  name: string
  slug: string
  color?: string | null
}

type TagsPickerProps = {
  workspaceSlug: string
  postId: string
  value?: Array<{ id: string; name: string }>
  className?: string
  onChange?: (next: Tag[]) => void
}

export default function TagsPicker({ workspaceSlug, postId, value = [], className, onChange }: TagsPickerProps) {
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
      const data = await res.json()
      const tags = (data as any)?.tags || []
      return tags.map((t: any) => ({
        id: String(t.id),
        name: String(t.name || ""),
        slug: String(t.slug || ""),
        color: t.color ?? null,
      })) as Tag[]
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
      } as any)
      if (!res.ok) {
        throw new Error("Failed to update tags")
      }
      return nextIds
    },
    onSuccess: async (nextIds) => {
      setSelectedIds(nextIds)
      const nextTags = items.filter((t) => nextIds.includes(t.id))
      onChange?.(nextTags)
      // Invalidate any queries that might depend on this post's tags
      await queryClient.invalidateQueries({ queryKey: ["tags", workspaceSlug], exact: false })
    },
  })

  const toggleTag = (tagId: string) => {
    const exists = selectedIds.includes(tagId)
    const next = exists ? selectedIds.filter((id) => id !== tagId) : [...selectedIds, tagId]
    mutation.mutate(next)
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 rounded-md border border-border/60 bg-background px-2.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-muted/60",
              selectedIds.length > 0 && "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
              mutation.isPending && "opacity-70 cursor-wait"
            )}
            aria-label="Manage tags"
            disabled={mutation.isPending}
          >
            <span className="truncate max-w-[140px]">
              {selectedIds.length > 0 ? `${selectedIds.length} tag${selectedIds.length > 1 ? "s" : ""}` : "Tags"}
            </span>
            <DropdownIcon className="ml-1.5  size-3" />
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

    </div>
  )
}
