"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@featul/ui/components/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { cn } from "@featul/ui/lib/utils"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { loadMoreRequests } from "@/lib/requests.actions"
import { normalizeRoadmapStatus } from "@/lib/roadmap"
import StatusIcon from "./StatusIcon"
import Attributes from "./attributes"
import FiltersAction from "./actions/FiltersAction"
import { PanelIcon } from "@featul/ui/icons/panel"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { motion, useReducedMotion } from "framer-motion"

export default function Navigator({ workspaceSlug, postId, open, onClose }: {
  workspaceSlug: string
  postId: string
  open: boolean
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const searchParams = useSearchParams()
  const [filterQuery, setFilterQuery] = useState(searchParams.toString())
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])
  const params = new URLSearchParams(filterQuery)
  params.set("search", debouncedSearch)
  params.delete("page")
  const query = params.toString()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState(postId)
  useEffect(() => setSelectedId(postId), [postId])
  const { data, hasNextPage, isFetching, isError, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ["request-navigator", workspaceSlug, query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => loadMoreRequests({ slug: workspaceSlug, offset: pageParam, variant: "requests", query }),
    getNextPageParam: (page, _pages, previousOffset) =>
      page.hasMore && page.items.length > 0 && page.nextOffset > previousOffset ? page.nextOffset : undefined,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
  const listItems = [...new Map((data?.pages.flatMap((page) => page.items) ?? []).map((item) => [item.id, item])).values()]
  const isInitialLoading = !data && isFetching
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = queryClient.getQueryData<number>(["request-navigator-scroll", workspaceSlug, query]) ?? 0
    }
  }, [queryClient, workspaceSlug, query])
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!open || !sentinel || !hasNextPage || isFetching || isError) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void fetchNextPage()
    }, { root: scrollRef.current, rootMargin: "0px 0px 600px 0px" })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasNextPage, isFetching, isError, fetchNextPage])

  return (
    <motion.aside
      id="request-navigator"
      aria-label="Request list"
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{ width: open ? "var(--panel-width)" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute inset-y-0 left-0 z-30 overflow-hidden bg-background [--panel-width:100%] md:relative md:inset-auto md:shrink-0 md:[--panel-width:22rem] dark:bg-[#191919]", !open && "pointer-events-none")}
    >
      <div className="flex h-full w-[var(--panel-width)] flex-col md:border-r md:border-border/50">

      <div className="flex min-h-13 shrink-0 items-center justify-between px-4">
        <h2 className="text-sm font-medium">Requests</h2>
        <div className="flex items-center gap-1">
          <FiltersAction query={query} onQueryChange={setFilterQuery} showClear className="size-7 rounded-md border-0 bg-black/5 p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08] dark:bg-[#292929] dark:hover:bg-[#303030] [&_svg]:size-3.5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="plain" onClick={onClose} aria-label="Hide request list" aria-expanded={true} aria-controls="request-navigator" className="size-8 rounded-md border-0 bg-transparent p-0 text-accent shadow-none hover:bg-black/10 dark:bg-transparent dark:hover:bg-white/10">
              <PanelIcon className="size-4 text-neutral-400 dark:text-neutral-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>Hide request list</TooltipContent>
        </Tooltip>
        </div>
      </div>
      <div className="px-2 pb-3">
        <label className="flex h-8 items-center gap-2 rounded-md bg-black/5 px-3 text-accent focus-within:ring-1 focus-within:ring-ring dark:bg-[#292929]">
          <Search className="size-4 shrink-0" />
          <input aria-label="Search request list" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests…" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-accent" />
        </label>
      </div>
      <div ref={scrollRef} onScroll={(event) => queryClient.setQueryData(["request-navigator-scroll", workspaceSlug, query], event.currentTarget.scrollTop)} data-workspace-scroll className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3" aria-busy={isFetching}>
        {isInitialLoading ? (
          <div role="status" aria-label="Loading requests" className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
            <LoaderIcon className="size-4 animate-spin motion-reduce:animate-none" size={16} />
          </div>
        ) : (
          <ul className="m-0 min-w-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-border/30 dark:[&>li+li]:border-white/5">
            {listItems.map((item) => (
              <li key={item.id}>
                <div className={cn("relative px-3.5 py-2.5 transition-colors hover:bg-muted/30 dark:hover:bg-white/[0.025]", item.id === selectedId && "bg-muted/40 dark:bg-white/[0.035]")}>
                <Link href={`/workspaces/${workspaceSlug}/requests/${item.slug}?${query}`} scroll={false} prefetch={true}
                  onClick={() => { setSelectedId(item.id); if (window.matchMedia("(max-width: 767px)").matches) onClose() }}
                  aria-current={item.id === selectedId ? "page" : undefined}
                  aria-label={item.title}
                  className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" />
                  <div className="pointer-events-none relative flex items-start gap-2">
                    <span className="flex w-5 shrink-0 justify-center pt-0.5">
                      <StatusIcon status={normalizeRoadmapStatus(item.roadmapStatus)} className="size-3.5 text-foreground/70" />
                    </span>
                    <span className="line-clamp-2 text-[13px] font-medium leading-[18px] text-foreground/90">{item.title}</span>
                  </div>
                  <Attributes item={item} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {data && !hasNextPage && !listItems.length && !isFetching && !isError ? <p className="px-3 py-6 text-center text-sm text-accent">No requests found.</p> : null}
        <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
          {isError ? <Button variant="plain" size="sm" onClick={() => void (data ? fetchNextPage() : refetch())}>Retry</Button> : null}
          {!isError && data && isFetching ? <LoaderIcon className="size-3.5 animate-spin text-muted-foreground motion-reduce:animate-none" size={14} /> : null}
        </div>
      </div>
      </div>
    </motion.aside>
  )
}
