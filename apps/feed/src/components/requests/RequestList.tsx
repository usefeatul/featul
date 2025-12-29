"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import RequestItem, { type RequestItemData } from "./RequestItem"
import EmptyRequests from "./EmptyRequests"
import { Button } from "@oreilla/ui/components/button"
import { Checkbox } from "@oreilla/ui/components/checkbox"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useSelection, setSelecting, toggleSelectionId, selectAllForKey, getSelectedIds, removeSelectedIds } from "@/lib/selection-store"
import type { PostDeletedEventDetail, RequestsPageRefreshingDetail } from "@/types/events"
import { BulkDeleteConfirmDialog } from "./BulkDeleteConfirmDialog"

interface RequestListProps {
  items: RequestItemData[]
  workspaceSlug: string
  linkBase?: string
  initialTotalCount?: number
}

interface SelectionToolbarProps {
  allSelected: boolean
  selectedCount: number
  isPending: boolean
  onToggleAll: () => void
  onConfirmDelete: () => void
}

function SelectionToolbar({ allSelected, selectedCount, isPending, onToggleAll, onConfirmDelete }: SelectionToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/60 bg-muted/50">
      <Checkbox
        checked={allSelected}
        onCheckedChange={onToggleAll}
        aria-label="Select all"
        className="cursor-pointer border-border dark:border-border data-[state=checked]:border-primary"
      />
      <span className="text-xs text-accent">Selected {selectedCount}</span>
      <Button type="button" variant="ghost" size="sm" className="h-7 px-3" onClick={onToggleAll}>
        {allSelected ? "Clear" : "Select All"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="h-7 px-3 ml-auto group"
        disabled={selectedCount === 0 || isPending}
        onClick={onConfirmDelete}
      >
        <span>{isPending ? "Deleting…" : "Delete"}</span>
        {!isPending && selectedCount > 0 ? (
          <span className="ml-1 rounded-sm border px-1 py-0.5 text-xs leading-none text-accent bg-card dark:bg-black transition-colors group-hover:bg-card">
            D
          </span>
        ) : null}
      </Button>
    </div>
  )
}

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

function useBulkDeleteRequests({
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
          } catch {}
          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {}
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
            } catch {}
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
        setSelecting(listKey, false)
      }
    })
  }, [listKey, listItems, queryClient, workspaceSlug, totalCount, router, onComplete])

  return {
    isPending,
    isRefetching,
    totalCount,
    handleBulkDelete,
  }
}

function RequestListBase({ items, workspaceSlug, linkBase, initialTotalCount }: RequestListProps) {
  const [listItems, setListItems] = useState<RequestItemData[]>(items)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const listKey = workspaceSlug
  const selection = useSelection(listKey)
  const isSelecting = selection.isSelecting
  const selectingRef = useRef(isSelecting)

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteRequests({
    workspaceSlug,
    listKey,
    listItems,
    initialTotalCount,
    onItemsChange: setListItems,
    onComplete: () => setConfirmOpen(false),
  })

  useEffect(() => {
    selectingRef.current = isSelecting
  }, [isSelecting])

  useEffect(() => {
    setListItems(items)
  }, [items])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName
        if (tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable) {
          return
        }
      }

      const key = event.key.toLowerCase()

      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault()
        setSelecting(listKey, !selectingRef.current)
        return
      }

      if (!event.metaKey && !event.ctrlKey && key === "d") {
        if (!isSelecting) return
        if (isPending) return
        if (selection.selectedIds.length === 0) return
        event.preventDefault()
        setConfirmOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [listKey, isSelecting, isPending, selection.selectedIds.length])

  const allSelected = useMemo(() => listItems.length > 0 && listItems.every((i) => selection.selectedIds.includes(i.id)), [selection, listItems])
  const selectedCount = selection.selectedIds.length

  const toggleId = useCallback(
    (id: string, checked?: boolean) => {
      toggleSelectionId(listKey, id, checked)
    },
    [listKey]
  )

  const toggleAll = useCallback(() => {
    if (allSelected) {
      removeSelectedIds(listKey, listItems.map((i) => i.id))
      return
    }
    selectAllForKey(listKey, listItems.map((i) => i.id))
  }, [allSelected, listItems, listKey])

  if (listItems.length === 0) {
    if (isRefetching) {
      return null
    }
    return <EmptyRequests workspaceSlug={workspaceSlug} />
  }

  return (
    <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-background bg-card dark:bg-black/40 border border-border">
      {isSelecting && (
        <SelectionToolbar
          allSelected={allSelected}
          selectedCount={selectedCount}
          isPending={isPending}
          onToggleAll={toggleAll}
          onConfirmDelete={() => setConfirmOpen(true)}
        />
      )}
      <ul className="m-0 list-none p-0">
        {listItems.map((p) => (
          <RequestItem
            key={p.id}
            item={p}
            workspaceSlug={workspaceSlug}
            linkBase={linkBase}
            isSelecting={isSelecting}
            isSelected={selection.selectedIds.includes(p.id)}
            onToggle={(checked) => toggleId(p.id, checked)}
            disableLink={isSelecting}
          />
        ))}
      </ul>

      <BulkDeleteConfirmDialog
        open={confirmOpen}
        selectedCount={selectedCount}
        isPending={isPending}
        onOpenChange={setConfirmOpen}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  )
}

export default React.memo(RequestListBase)
