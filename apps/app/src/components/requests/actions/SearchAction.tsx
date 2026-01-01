"use client"

import React from "react"
import { SearchIcon } from "@featul/ui/icons/search"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@featul/ui/components/command"
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
    <>
      <Button
        type="button"
        variant="nav"
        size="icon-sm"
        aria-label="Search"
        className={className}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4" size={16} />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        width="wide"
        icon={<SearchIcon className="size-3.5 opacity-80" />}
      >
        <CommandInput
          value={value}
          onValueChange={(v) => setValue(v)}
          placeholder="Search requests"
          aria-label="Search requests"
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch()
          }}
        />
        <CommandList>
          <CommandEmpty />
          {isLoading ? null : results.length > 0 ? (
            <CommandGroup>
              {results.map((r) => (
                <CommandItem
                  key={r.id}
                  onSelect={() => {
                    setOpen(false)
                    setPendingHref(`/workspaces/${slug}/requests/${r.slug}`)
                  }}
                >
                  {r.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : hasQuery ? (
            <CommandGroup>
              <CommandItem disabled>No results</CommandItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
