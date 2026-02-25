"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data"
import ChangelogItem from "./ChangelogItem"
import { ChangelogBulkDeleteDialog } from "./ChangelogBulkDeleteDialog"
import { SelectionToolbar } from "@/components/requests/SelectionToolbar"
import { useBulkDeleteChangelog } from "../../hooks/useBulkDeleteChangelog"
import { useSelectableList } from "@/hooks/useSelectableList"
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
    const itemIds = useMemo(() => listItems.map((item) => item.id), [listItems])

    const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteChangelog({
        workspaceSlug,
        listKey,
        listItems,
        initialTotalCount,
        onItemsChange: setListItems,
        onComplete: () => setConfirmOpen(false),
    })

    useEffect(() => {
        setListItems(items)
    }, [items])

    const {
        allSelected,
        isSelectingForRender,
        selectedCount,
        selectedIdsSet,
        toggleAll,
        toggleId,
    } = useSelectableList({
        listKey,
        itemIds,
        initialIsSelecting,
        initialSelectedIds,
        isPending,
        setConfirmOpen,
    })

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
                        isSelected={selectedIdsSet.has(entry.id)}
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
