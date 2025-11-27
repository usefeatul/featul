"use client"

import React from "react"
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

  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 0) / Math.max(pageSize, 1)))
  const prevPage = Math.max(page - 1, 1)
  const nextPage = Math.min(page + 1, totalPages)

  const from = totalCount > 0 ? (page - 1) * pageSize + 1 : 0
  const to = totalCount > 0 ? Math.min(page * pageSize, totalCount) : 0

  const prevHref = mk(workspaceSlug, params as any, { page: prevPage })
  const nextHref = mk(workspaceSlug, params as any, { page: nextPage })

  const sizes = [10, 20, 50, 100]

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
          <Link href={prevHref} aria-label="Previous page">Prev</Link>
        </Button>
        <span className="text-xs text-accent tabular-nums">
          Page {Math.min(page, totalPages)} of {totalPages}
        </span>
        <Button asChild variant="quiet" disabled={page >= totalPages || totalCount === 0}>
          <Link href={nextHref} aria-label="Next page">Next</Link>
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
