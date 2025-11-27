"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { buildRequestsUrl, buildWorkspaceUrl } from "@/utils/request-filters"

type Props = {
  workspaceSlug: string
  page: number
  pageSize: number
  totalCount: number
  variant?: "requests" | "workspace"
}

export default function RequestPagination({ workspaceSlug, page, pageSize, totalCount, variant = "requests" }: Props) {
  const params = useSearchParams()
  const mk = variant === "workspace" ? buildWorkspaceUrl : buildRequestsUrl

  const sizes = [10, 20, 50, 100]

  const { totalPages, from, to, prevHref, nextHref, firstHref, lastHref } = useMemo(() => {
    const tp = Math.max(1, Math.ceil(Math.max(totalCount, 0) / Math.max(pageSize, 1)))
    const pPrev = Math.max(page - 1, 1)
    const pNext = Math.min(page + 1, tp)
    const f = totalCount > 0 ? (page - 1) * pageSize + 1 : 0
    const t = totalCount > 0 ? Math.min(page * pageSize, totalCount) : 0
    return {
      totalPages: tp,
      from: f,
      to: t,
      prevHref: mk(workspaceSlug, params as any, { page: pPrev }),
      nextHref: mk(workspaceSlug, params as any, { page: pNext }),
      firstHref: mk(workspaceSlug, params as any, { page: 1 }),
      lastHref: mk(workspaceSlug, params as any, { page: tp }),
    }
  }, [workspaceSlug, page, pageSize, totalCount, params, mk])

  return (
    <div className="mt-4 flex items-center justify-between gap-3 mb-4">
      <div className="text-sm text-accent tabular-nums">
        {totalCount > 0 ? (
          <span>
            {from}–{to} of {totalCount}
          </span>
        ) : (
          <span>0</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="quiet" disabled={page <= 1}>
          <Link prefetch={false} href={firstHref} aria-label="First page">First</Link>
        </Button>
        <Button asChild variant="quiet" disabled={page <= 1}>
          <Link prefetch={false} href={prevHref} rel="prev" aria-label="Previous page">Prev</Link>
        </Button>
        <span className="text-xs text-accent tabular-nums">
          Page {Math.min(page, totalPages)} of {totalPages}
        </span>
        <Button asChild variant="quiet" disabled={page >= totalPages || totalCount === 0}>
          <Link prefetch={false} href={nextHref} rel="next" aria-label="Next page">Next</Link>
        </Button>
        <Button asChild variant="quiet" disabled={page >= totalPages || totalCount === 0}>
          <Link prefetch={false} href={lastHref} aria-label="Last page">Last</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-accent">Page size:</span>
        <div className="flex items-center gap-1">
          {sizes.map((s) => {
            const href = mk(workspaceSlug, params as any, { pageSize: s, page: 1 })
            const active = s === pageSize
            return (
              <Link
                key={s}
                prefetch={false}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md border px-2 py-1 text-xs ${active ? "bg-card text-foreground" : "bg-muted text-accent hover:text-primary"}`}
              >
                {s}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
