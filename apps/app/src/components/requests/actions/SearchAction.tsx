"use client"

import React from "react"
import { SearchIcon } from "@featul/ui/icons/search"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { Input } from "@featul/ui/components/input"
import { cn } from "@featul/ui/lib/utils"
import { buildRequestsUrl } from "@/utils/request-filters"
import { getSlugFromPath } from "@/config/nav"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"

export default function SearchAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [pendingHref, setPendingHref] = React.useState<string | null>(null)

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])
  const [value, setValue] = React.useState(sp.get("search") || "")

  React.useEffect(() => {
    setValue(sp.get("search") || "")
  }, [sp])

  const runSearch = () => {
    const href = buildRequestsUrl(slug, sp, { search: value })
    setOpen(false)
    setPendingHref(href)
  }

  React.useEffect(() => {
    if (!pendingHref) return
    router.push(pendingHref)
    setPendingHref(null)
  }, [pendingHref, router])

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", slug, value],
    enabled: open && value.trim().length >= 2,
    queryFn: async () => {
      const res = await client.board.searchPostsByWorkspaceSlug.$get({ slug, q: value.trim() })
      const data = await res.json()
      return (data?.posts || []) as { id: string; title: string; slug: string }[]
    },
    staleTime: 10_000,
  })

  const hasQuery = value.trim().length >= 2

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-sm dark:bg-black/40 border bg-card px-2 py-2 cursor-pointer",
            className,
          )}
          aria-label="Search"
        >
          <SearchIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" list className="min-w-[240px] w-64">
        <div className="p-2 border-b">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search requests"
            aria-label="Search requests"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch()
            }}
          />
        </div>
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Searching...</div>
        ) : results.length > 0 ? (
          <PopoverList className="max-h-64 overflow-y-auto">
            {results.map((r) => (
              <PopoverListItem
                key={r.id}
                onClick={() => {
                  setOpen(false)
                  setPendingHref(`/workspaces/${slug}/requests/${r.slug}`)
                }}
              >
                <span className="text-sm truncate">{r.title}</span>
              </PopoverListItem>
            ))}
          </PopoverList>
        ) : hasQuery ? (
          <div className="p-3 text-sm text-accent">No results</div>
        ) : (
          <div className="p-3 text-xs text-accent">Type at least 2 characters to search</div>
        )}
      </PopoverContent>
    </Popover>
  )
}
