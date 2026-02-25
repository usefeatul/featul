"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { buildRequestsUrl, buildWorkspaceUrl } from "@/utils/request"
import PaginationHotkeys from "@/components/pagination/PaginationHotkeys"
import type { RequestPaginationProps as Props } from "@/types/pagination"
import type { PostDeletedEventDetail, RequestsPageRefreshingDetail } from "@/types/events"

export default function RequestPagination({ workspaceSlug, page, pageSize, totalCount, variant = "requests" }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [deletedCount, setDeletedCount] = useState(0)
  const [isPageRefreshing, setIsPageRefreshing] = useState(false)
  const mk = variant === "workspace" ? buildWorkspaceUrl : buildRequestsUrl

  const effectiveTotal = Math.max(totalCount - deletedCount, 0)

  useEffect(() => {
    setDeletedCount(0)
    setIsPageRefreshing(false)
  }, [workspaceSlug, totalCount])

  useEffect(() => {
    if (!workspaceSlug) return
    if (typeof window === "undefined") return
    const handlePostDeleted = (event: CustomEvent<PostDeletedEventDetail>) => {
      const detail = event.detail
      if (detail.workspaceSlug !== workspaceSlug) return
      setDeletedCount((prev) => prev + 1)
    }
    window.addEventListener("post:deleted", handlePostDeleted as EventListener)
    return () => window.removeEventListener("post:deleted", handlePostDeleted as EventListener)
  }, [workspaceSlug])

  useEffect(() => {
    if (!workspaceSlug) return
    if (typeof window === "undefined") return
    const handlePageRefreshing = (event: CustomEvent<RequestsPageRefreshingDetail>) => {
      const detail = event.detail
      if (detail.workspaceSlug !== workspaceSlug) return
      setIsPageRefreshing(true)
    }
    window.addEventListener("requests:page-refreshing", handlePageRefreshing as EventListener)
    return () => window.removeEventListener("requests:page-refreshing", handlePageRefreshing as EventListener)
  }, [workspaceSlug])

  const { totalPages, prevHref, nextHref } = useMemo(() => {
    const tp = Math.max(1, Math.ceil(Math.max(effectiveTotal, 0) / Math.max(pageSize, 1)))
    const pPrev = Math.max(page - 1, 1)
    const pNext = Math.min(page + 1, tp)
    return {
      totalPages: tp,
      prevHref: mk(workspaceSlug, params as URLSearchParams, { page: pPrev }),
      nextHref: mk(workspaceSlug, params as URLSearchParams, { page: pNext }),
    }
  }, [workspaceSlug, page, pageSize, effectiveTotal, params, mk])

  if (isPageRefreshing) return null
  if (effectiveTotal <= pageSize) return null

  return (
    <div className="mt-2 mb-2 flex w-full flex-col items-stretch justify-center gap-2 sm:mb-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <PaginationHotkeys
        onPrev={() => router.push(prevHref as string)}
        onNext={() => router.push(nextHref as string)}
        isFirstPage={page <= 1}
        isLastPage={page >= totalPages || effectiveTotal === 0}
      />
      <div className="order-1 flex min-w-0 w-full flex-col items-end gap-2 sm:order-2 sm:w-auto">
        <div className="flex items-center gap-2">
          <Toolbar size="sm">
            <Button asChild variant="card" size="sm" disabled={page <= 1} className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card">
              <Link prefetch={false} href={prevHref} rel="prev" aria-label="Previous page" aria-keyshortcuts="z" title="Prev (Z)" className="group">
                <span className="text-xs font-medium">Prev</span>
                <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
              </Link>
            </Button>
            <ToolbarSeparator />
            <Button asChild variant="card" size="sm" disabled={page >= totalPages || effectiveTotal === 0} className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card">
              <Link prefetch={false} href={nextHref} rel="next" aria-label="Next page" aria-keyshortcuts="x" title="Next (X)" className="group">
                <span className="text-xs font-medium">Next</span>
                <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">X</span>
              </Link>
            </Button>
          </Toolbar>
        </div>
        <div className="text-xs text-accent tabular-nums">
          Page {Math.min(page, totalPages)} of {totalPages}
        </div>
      </div>
    </div>
  )
}
