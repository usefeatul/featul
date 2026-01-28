"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ChangelogEntryWithTags } from "@/app/(main)/workspaces/[slug]/changelog/data"
import ChangelogItem from "./ChangelogItem"
import { useSelection, toggleSelectionId, selectAllForKey, removeSelectedIds } from "@/lib/selection-store"
import { ChangelogBulkDeleteDialog } from "./ChangelogBulkDeleteDialog"
import { SelectionToolbar } from "@/components/requests/SelectionToolbar"
import { useBulkDeleteChangelog } from "../../hooks/useBulkDeleteChangelog"
import { useBulkSelectionHotkeys } from "@/hooks/useBulkSelectionHotkeys"
import EmptyChangelog from "./EmptyChangelog"

interface ChangelogListProps {
    items: ChangelogEntryWithTags[]
    workspaceSlug: string
    initialTotalCount?: number
    initialIsSelecting?: boolean
    initialSelectedIds?: string[]
}

export function ChangelogList({ items, workspaceSlug, initialTotalCount, initialIsSelecting, initialSelectedIds }: ChangelogListProps) {
    const [listItems, setListItems] = useState<ChangelogEntryWithTags[]>(items)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const listKey = `changelog-${workspaceSlug}`
    const selection = useSelection(listKey)
    const isSelecting = selection.isSelecting
    const selectingRef = useRef(isSelecting)
    const [hydrated, setHydrated] = useState(false)

    const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteChangelog({
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
        setHydrated(true)
    }, [])

    const isSelectingForRender = hydrated ? isSelecting : initialIsSelecting ?? isSelecting
    const selectedIdsForRender = useMemo(() =>
        hydrated
            ? selection.selectedIds
            : initialSelectedIds && Array.isArray(initialSelectedIds)
                ? initialSelectedIds
                : selection.selectedIds,
        [hydrated, selection.selectedIds, initialSelectedIds]
    )

    useBulkSelectionHotkeys({
        listKey,
        isSelecting: isSelectingForRender,
        isPending,
        selectedCount: selectedIdsForRender.length,
        setConfirmOpen,
        selectingRef,
    })

    const allSelected = useMemo(
        () => listItems.length > 0 && listItems.every((i) => selectedIdsForRender.includes(i.id)),
        [listItems, selectedIdsForRender],
    )
    const selectedCount = selectedIdsForRender.length

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

    if (listItems.length === 0 && !isRefetching) {
        return <EmptyChangelog workspaceSlug={workspaceSlug} />
    }

    return (
        <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-card dark:bg-black/40 border border-border">
            {isSelectingForRender && (
                <SelectionToolbar
                    allSelected={allSelected}
                    selectedCount={selectedCount}
                    isPending={isPending}
                    onToggleAll={toggleAll}
                    onConfirmDelete={() => setConfirmOpen(true)}
                />
            )}
            <ul className="m-0 list-none p-0">
                {listItems.map((entry) => (
                    <ChangelogItem
                        key={entry.id}
                        item={entry}
                        workspaceSlug={workspaceSlug}
                        isSelecting={isSelectingForRender}
                        isSelected={selectedIdsForRender.includes(entry.id)}
                        onToggle={(checked) => toggleId(entry.id, checked)}
                    />
                ))}
            </ul>

            <ChangelogBulkDeleteDialog
                open={confirmOpen}
                selectedCount={selectedCount}
                isPending={isPending}
                onOpenChange={setConfirmOpen}
                onConfirmDelete={handleBulkDelete}
            />
        </div>
    )
}
