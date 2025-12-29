"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import RequestItem, { type RequestItemData } from "./RequestItem"
import EmptyRequests from "./EmptyRequests"
import { Button } from "@oreilla/ui/components/button"
import { Checkbox } from "@oreilla/ui/components/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@oreilla/ui/components/alert-dialog"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useSelection, setSelecting, toggleSelectionId, selectAllForKey, getSelectedIds, removeSelectedIds } from "@/lib/selection-store"
import type { PostDeletedEventDetail } from "../../types/events"

interface RequestListProps {
  items: RequestItemData[]
  workspaceSlug: string
  linkBase?: string
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
      <Button type="button" variant="secondary" size="sm" className="h-7 px-3" onClick={onToggleAll}>
        {allSelected ? "Clear" : "Select All"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="h-7 px-3 ml-auto"
        disabled={selectedCount === 0 || isPending}
        onClick={onConfirmDelete}
      >
        {isPending ? "Deleting…" : "Delete Selected"}
      </Button>
    </div>
  )
}

function RequestListBase({ items, workspaceSlug, linkBase }: RequestListProps) {
  const [listItems, setListItems] = useState<RequestItemData[]>(items)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()
  const listKey = workspaceSlug
  const selection = useSelection(listKey)
  const isSelecting = selection.isSelecting
  const selectingRef = useRef(isSelecting)
  useEffect(() => {
    selectingRef.current = isSelecting
  }, [isSelecting])

  useEffect(() => {
    setListItems(items)
  }, [items])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        setSelecting(listKey, !selectingRef.current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

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

  const handleBulkDelete = useCallback(() => {
    startTransition(async () => {
      try {
        const ids = getSelectedIds(listKey)
        if (ids.length === 0) {
          setConfirmOpen(false)
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
              const detail: PostDeletedEventDetail = {
                postId,
                workspaceSlug,
                status: item?.roadmapStatus ?? null,
              }
              window.dispatchEvent(new CustomEvent<PostDeletedEventDetail>("post:deleted", { detail }))
            })
          } catch {}
          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {}
          setListItems((prev) => prev.filter((i) => !okIds.includes(i.id)))
          removeSelectedIds(listKey, okIds)
          toast.success(`Deleted ${okIds.length} ${okIds.length === 1 ? "post" : "posts"}`)
        }
        if (failed > 0) {
          toast.error(`Failed to delete ${failed} ${failed === 1 ? "post" : "posts"}`)
        }
      } catch {
        toast.error("Failed to delete posts")
      } finally {
        setConfirmOpen(false)
        setSelecting(listKey, false)
      }
    })
  }, [listKey, listItems, queryClient, workspaceSlug])

  if (listItems.length === 0) {
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="p-1 bg-muted rounded-xl gap-2">
          <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <AlertDialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
              Delete selected posts?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
            <AlertDialogDescription className="space-y-3 text-sm text-accent mb-2">
              <span className="block">This will permanently delete {selectedCount} {selectedCount === 1 ? "post" : "posts"}.</span>
            </AlertDialogDescription>
            <AlertDialogFooter className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel disabled={isPending} className="h-8 px-3 text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleBulkDelete()
                }}
                disabled={isPending}
                className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
              >
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default React.memo(RequestListBase)
