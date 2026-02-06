"use client"

import { useCallback, useEffect, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { getSelectedIds, removeSelectedIds } from "@/lib/selection-store"
import type { PostDeletedEventDetail, RequestsPageRefreshingDetail } from "@/types/events"
import type { RequestItemData } from "@/types/request"

interface UseBulkDeleteRequestsParams {
  workspaceSlug: string
  listKey: string
  listItems: RequestItemData[]
  initialTotalCount?: number
  onItemsChange: (next: RequestItemData[]) => void
  onComplete?: () => void
}

interface UseBulkDeleteRequestsResult {
  isPending: boolean
  isRefetching: boolean
  totalCount: number | null
  handleBulkDelete: () => void
}

export function useBulkDeleteRequests({
  workspaceSlug,
  listKey,
  listItems,
  initialTotalCount,
  onItemsChange,
  onComplete,
}: UseBulkDeleteRequestsParams): UseBulkDeleteRequestsResult {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isRefetching, setIsRefetching] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(typeof initialTotalCount === "number" ? initialTotalCount : null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (typeof initialTotalCount === "number") {
      setTotalCount(initialTotalCount)
    }
  }, [initialTotalCount])

  const handleBulkDelete = useCallback(() => {
    startTransition(async () => {
      try {
        const ids = getSelectedIds(listKey)
        if (ids.length === 0) {
          if (onComplete) {
            onComplete()
          }
          return
        }
        const results = await Promise.allSettled(ids.map((postId) => client.post.delete.$post({ postId })))
        const okIds: string[] = []
        const failed: number = results.reduce((acc, r, idx) => {
          const id = ids[idx]
          if (!id) return acc + 1
          if (r.status === "fulfilled" && r.value?.ok) {
            okIds.push(id)
            return acc
          }
          return acc + 1
        }, 0)
        if (okIds.length > 0) {
          try {
            okIds.forEach((postId) => {
              const item = listItems.find((p) => p.id === postId)
              if (!item) return
              const detail: PostDeletedEventDetail = {
                postId,
                workspaceSlug,
                status: item.roadmapStatus ?? null,
              }
              window.dispatchEvent(new CustomEvent<PostDeletedEventDetail>("post:deleted", { detail }))
            })
          } catch {
            toast.error("Failed to delete posts")
          }
          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {
            toast.error("Failed to invalidate queries")
          }
          const remainingItems = listItems.filter((i) => !okIds.includes(i.id))
          const nextLength = remainingItems.length
          const prevTotal = totalCount
          const nextTotal = typeof prevTotal === "number" ? Math.max(prevTotal - okIds.length, 0) : prevTotal
          if (typeof nextTotal === "number") {
            setTotalCount(nextTotal)
          }
          onItemsChange(remainingItems)
          removeSelectedIds(listKey, okIds)
          if (nextLength === 0 && typeof nextTotal === "number" && nextTotal > 0) {
            setIsRefetching(true)
            try {
              const detail: RequestsPageRefreshingDetail = { workspaceSlug }
              window.dispatchEvent(new CustomEvent<RequestsPageRefreshingDetail>("requests:page-refreshing", { detail }))
              router.refresh()
            } catch {
              toast.error("Failed to refresh page")
            }
          }
          toast.success(`Deleted ${okIds.length} ${okIds.length === 1 ? "post" : "posts"}`)
        }
        if (failed > 0) {
          toast.error(`Failed to delete ${failed} ${failed === 1 ? "post" : "posts"}`)
        }
      } catch {
        toast.error("Failed to delete posts")
      } finally {
        if (onComplete) {
          onComplete()
        }
      }
    })
  }, [listKey, listItems, queryClient, workspaceSlug, totalCount, router, onComplete, onItemsChange])

  return {
    isPending,
    isRefetching,
    totalCount,
    handleBulkDelete,
  }
}
