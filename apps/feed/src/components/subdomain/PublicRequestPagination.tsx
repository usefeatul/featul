"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@oreilla/ui/components/button"
import PaginationHotkeys from "@/components/pagination/PaginationHotkeys"

export function PublicRequestPagination({
  subdomain,
  slug,
  page,
  pageSize,
  totalCount,
}: {
  subdomain: string
  slug: string
  page: number
  pageSize: number
  totalCount: number
}) {
  const router = useRouter()
  const params = useSearchParams()

  const base = `/`

  const { totalPages, prevHref, nextHref } = useMemo(() => {
    const tp = Math.max(1, Math.ceil(Math.max(totalCount, 0) / Math.max(pageSize, 1)))
    const makeHref = (p: number) => {
      const u = new URL(base, "http://dummy")
      u.searchParams.set("page", String(p))
      const board = params.get("board")
      const order = params.get("order")
      if (board) u.searchParams.set("board", board)
      if (order) u.searchParams.set("order", order)
      const q = u.search ? `?${u.searchParams.toString()}` : ""
      return `${base}${q}`
    }
    const pPrev = Math.max(page - 1, 1)
    const pNext = Math.min(page + 1, tp)
    return {
      totalPages: tp,
      prevHref: makeHref(pPrev),
      nextHref: makeHref(pNext),
    }
  }, [base, page, pageSize, totalCount, params])

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
        <div className="flex items-center gap-2">
          <Button asChild variant="nav" size="sm" disabled={page <= 1}>
            <Link prefetch={false} href={prevHref} rel="prev" aria-label="Previous page" aria-keyshortcuts="z" title="Prev (Z)" className="group">
              Prev <span className="ml-1 rounded-md border px-1 py-0.5 text-[10px] leading-none text-accent transition-colors group-hover:bg-card">Z</span>
            </Link>
          </Button>
          <Button asChild variant="nav" size="sm" disabled={page >= totalPages || totalCount === 0}>
            <Link prefetch={false} href={nextHref} rel="next" aria-label="Next page" aria-keyshortcuts="x" title="Next (X)" className="group">
              Next <span className="ml-1 rounded-md border px-1 py-0.5 text-[10px] leading-none text-accent transition-colors group-hover:bg-card">X</span>
            </Link>
          </Button>
        </div>
        <div className="text-xs text-accent tabular-nums">
          Page {Math.min(page, totalPages)} of {totalPages}
        </div>
      </div>
    </div>
  )
}
