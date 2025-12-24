"use client"

import React from "react"
import { SearchIcon } from "@oreilla/ui/icons/search"
import { cn } from "@oreilla/ui/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { buildRequestsUrl } from "@/utils/request-filters"
import { getSlugFromPath } from "@/config/nav"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@oreilla/ui/components/command"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"

export default function SearchAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])
  const [value, setValue] = React.useState(sp.get("search") || "")

  React.useEffect(() => {
    setValue(sp.get("search") || "")
  }, [sp])

  const runSearch = () => {
    const href = buildRequestsUrl(slug, sp, { search: value })
    router.push(href)
    setOpen(false)
  }

  const clearSearch = () => {
    setValue("")
    const href = buildRequestsUrl(slug, sp, { search: "" })
    router.push(href)
    setOpen(false)
  }

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

  return (
    <>
      <button
        type="button"
        className={cn("rounded-sm  border bg-card dark:bg-black/40 px-2 py-2 cursor-pointer", className)}
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4" size={16} />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Find requests">
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
                <CommandItem key={r.id} onSelect={() => router.push(`/workspaces/${slug}/requests/${r.slug}`)}>
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
