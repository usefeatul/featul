"use client"

import React from "react"
import { format } from "date-fns"
import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import type { ActivityItem } from "@/types/activity"

interface MemberActivityProps {
  items: ActivityItem[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

export function MemberActivity({ items, hasNextPage, isFetchingNextPage, onLoadMore, isLoading }: MemberActivityProps) {
  return (
    <div className="lg:col-span-2 lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>
      <ul className="divide-y divide-border">
        {isLoading && items.length === 0 ? (
          <li className="py-6">
            <LoadingSpinner label="Loading activity..." />
          </li>
        ) : items.length === 0 ? (
          <li className="py-6 text-accent text-sm text-center">No activity yet</li>
        ) : (
          items.map((it) => (
            <li key={`${it.type}-${it.id}-${String(it.createdAt)}`} className="py-3">
              <div className="text-xs text-accent flex items-center gap-2 min-w-0">
                <span className="font-medium shrink-0">{format(new Date(it.createdAt), "LLL d")}</span>
                <span className="min-w-0 flex-1">
                  <MemberActivityDescription item={it} />
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
      {hasNextPage ? (
        <div className="pt-3 mt-1 border-t flex justify-center">
          <Button variant="nav" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
