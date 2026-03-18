"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { TagIcon } from "@featul/ui/icons/tag"
import { Button } from "@featul/ui/components/button"
import { client } from "@featul/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFilterPopover } from "@/lib/filter-store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request"
import { parseRequestFiltersFromSearchParams } from "@/utils/request-filters"

type TagItem = {
  id: string
  name: string
  slug: string
  color?: string | null
  count?: number
}

type TagsResponse = {
  tags?: Array<{
    id?: string
    name?: string
    slug?: string
    color?: string | null
    count?: number
  }>
}

function parseTagsResponse(payload: TagsResponse | null): TagItem[] {
  const tags = Array.isArray(payload?.tags) ? payload.tags : []
  return tags
    .filter(
      (tag): tag is Required<Pick<TagItem, "id" | "name" | "slug">> & Pick<TagItem, "color" | "count"> =>
        typeof tag?.id === "string" &&
        typeof tag?.name === "string" &&
        typeof tag?.slug === "string"
    )
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color ?? null,
      count: typeof tag.count === "number" ? tag.count : undefined,
    }))
}

export default function TagsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = useFilterPopover("tags")
  const queryClient = useQueryClient()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tags", slug],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
      const data = (await res.json().catch(() => null)) as TagsResponse | null
      return parseTagsResponse(data)
    },
    staleTime: 300_000,
    gcTime: 300_000,
    enabled: Boolean(slug),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const selected = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp).tag,
    [sp]
  )
  const isAllSelected = React.useMemo(() => isAllSel(items.map((i) => i.slug), selected), [items, selected])

  React.useEffect(() => {
    if (open) {
      queryClient.prefetchQuery({
        queryKey: ["tags", slug],
        queryFn: async () => {
          const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
          const data = (await res.json().catch(() => null)) as TagsResponse | null
          return parseTagsResponse(data)
        },
        staleTime: 300_000,
        gcTime: 300_000,
      })
    }
  }, [open, queryClient, slug])

  const toggle = (tagSlug: string) => {
    const next = toggleValue(selected, tagSlug)
    if (next.length === 0) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const href = buildRequestsUrl(slug, sp, { tag: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  const selectAll = () => {
    if (isAllSelected) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const next = items.map((i) => i.slug)
    const href = buildRequestsUrl(slug, sp, { tag: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label="Tags"
          className={className}
        >
          <TagIcon className="w-4 h-4" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No tags</div>
        ) : (
          <PopoverList>
            {items.map((it) => (
              <PopoverListItem
                key={it.id}
                role="menuitemcheckbox"
                aria-checked={selected.includes(it.slug)}
                onClick={() => toggle(it.slug)}
              >
                <span className="text-sm truncate">{it.name}</span>
                {typeof it.count === "number" ? <span className="ml-auto text-xs text-accent tabular-nums">{it.count}</span> : null}
                {selected.includes(it.slug) ? <span className="ml-1 text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
            <PopoverListItem onClick={selectAll} role="menuitemcheckbox" aria-checked={isAllSelected}>
              <span className="text-sm">Select all</span>
              {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  )
}
