"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import PaginationHotkeys from "@/components/pagination/PaginationHotkeys"

export function PublicRequestPagination({
  page,
  pageSize,
  totalCount,
  basePath = "/",
  keepParams = ["board", "order"],
}: {
  page: number
  pageSize: number
  totalCount: number
  basePath?: string
  keepParams?: string[]
}) {
  const router = useRouter()
  const params = useSearchParams()

  const { totalPages, prevHref, nextHref } = useMemo(() => {
    const tp = Math.max(1, Math.ceil(Math.max(totalCount, 0) / Math.max(pageSize, 1)))
    const makeHref = (p: number) => {
      const u = new URL(basePath, "http://dummy")
      u.searchParams.set("page", String(p))
      keepParams.forEach((key) => {
        const value = params.get(key)
        if (value) u.searchParams.set(key, value)
      })
      const query = u.searchParams.toString()
      return `${u.pathname}${query ? `?${query}` : ""}`
    }
    const pPrev = Math.max(page - 1, 1)
    const pNext = Math.min(page + 1, tp)
    return {
      totalPages: tp,
      prevHref: makeHref(pPrev),
      nextHref: makeHref(pNext),
    }
  }, [basePath, page, pageSize, totalCount, keepParams, params])

  if (totalCount <= pageSize) return null

  return (
    <div className="mt-2 mb-2 flex w-full flex-col items-stretch justify-center gap-2 sm:mb-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <PaginationHotkeys
        onPrev={() => router.push(prevHref as string)}
        onNext={() => router.push(nextHref as string)}
        isFirstPage={page <= 1}
        isLastPage={page >= totalPages || totalCount === 0}
      />
      <div className="order-1 flex min-w-0 w-full flex-col items-end gap-2 sm:order-2 sm:w-auto">
        <Toolbar size="sm">
          <Button asChild variant="card" size="sm" disabled={page <= 1} className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card">
            <Link prefetch={false} href={prevHref} rel="prev" aria-label="Previous page" aria-keyshortcuts="z" title="Prev (Z)" className="group">
              <span className="text-xs font-medium">Prev</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
            </Link>
          </Button>
          <ToolbarSeparator />
          <Button asChild variant="card" size="sm" disabled={page >= totalPages || totalCount === 0} className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card">
            <Link prefetch={false} href={nextHref} rel="next" aria-label="Next page" aria-keyshortcuts="x" title="Next (X)" className="group">
              <span className="text-xs font-medium">Next</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">X</span>
            </Link>
          </Button>
        </Toolbar>
        <div className="text-xs text-accent tabular-nums">
          Page {Math.min(page, totalPages)} of {totalPages}
        </div>
      </div>
    </div>
  )
}
