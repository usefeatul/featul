"use client"

import React from "react"
import { SearchIcon } from "@oreilla/ui/icons/search"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@oreilla/ui/components/button"
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

export interface SearchActionProps {
  slug: string
  className?: string
}

export function SearchAction({ slug, className = "" }: SearchActionProps) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(searchParams.get("search") || "")

  React.useEffect(() => {
    setValue(searchParams.get("search") || "")
  }, [searchParams])

  function buildSearchUrl(nextSearch: string): string {
    const base = pathname || "/"
    const url = new URL(base, "http://dummy")
    searchParams.forEach((v, k) => {
      if (k !== "search") url.searchParams.set(k, v)
    })
    const trimmed = nextSearch.trim()
    if (trimmed) {
      url.searchParams.set("search", trimmed)
    } else {
      url.searchParams.delete("search")
    }
    const query = url.searchParams.toString()
    return `${url.pathname}${query ? `?${query}` : ""}`
  }

  const runSearch = () => {
    const href = buildSearchUrl(value)
    router.push(href)
    setOpen(false)
  }

  const clearSearch = () => {
    setValue("")
    const href = buildSearchUrl("")
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
            if (e.key === "Escape") clearSearch()
          }}
        />
        <CommandList>
          <CommandEmpty />
          {isLoading ? null : results.length > 0 ? (
            <CommandGroup>
              {results.map((r) => (
                <CommandItem key={r.id} onSelect={() => router.push(`/p/${r.slug}`)}>
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
