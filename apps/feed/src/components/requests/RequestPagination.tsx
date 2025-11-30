"use client"
import React, { useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { buildRequestsUrl, buildWorkspaceUrl } from "@/utils/request-filters"
import PaginationHotkeys from "@/components/pagination/PaginationHotkeys"

type Props = {
  workspaceSlug: string
  page: number
  pageSize: number
  totalCount: number
  variant?: "requests" | "workspace"
}

export default function RequestPagination({ workspaceSlug, page, pageSize, totalCount, variant = "requests" }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const mk = variant === "workspace" ? buildWorkspaceUrl : buildRequestsUrl


  // biome-ignore lint/correctness/useHookAtTopLevel: <>
  const { totalPages, prevHref, nextHref } = useMemo(() => {
    const tp = Math.max(1, Math.ceil(Math.max(totalCount, 0) / Math.max(pageSize, 1)))
    const pPrev = Math.max(page - 1, 1)
    const pNext = Math.min(page + 1, tp)
    return {
      totalPages: tp,
      prevHref: mk(workspaceSlug, params as URLSearchParams, { page: pPrev }),
      nextHref: mk(workspaceSlug, params as URLSearchParams, { page: pNext }),
    }
  }, [workspaceSlug, page, pageSize, totalCount, params, mk])

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
            <Link prefetch={false} href={prevHref} rel="prev" aria-label="Previous page" aria-keyshortcuts="z" title="Prev (Z)">
              Prev <span className="ml-1 rounded-sm border px-1 py-0.5 text-[10px] leading-none text-accent">Z</span>
            </Link>
          </Button>
          <Button asChild variant="nav" size="sm" disabled={page >= totalPages || totalCount === 0}>
            <Link prefetch={false} href={nextHref} rel="next" aria-label="Next page" aria-keyshortcuts="x" title="Next (X)">
              Next <span className="ml-1 rounded-sm border px-1 py-0.5 text-[10px] leading-none text-accent">X</span>
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
