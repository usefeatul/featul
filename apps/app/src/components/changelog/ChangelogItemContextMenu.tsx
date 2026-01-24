"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useChangelogEntryActions } from "./useChangelogEntryActions"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverList,
    PopoverListItem,
    PopoverSeparator,
} from "@featul/ui/components/popover"
import { EditIcon } from "@featul/ui/icons/edit"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { TrashIcon } from "@featul/ui/icons/trash"
import { PenIcon } from "@featul/ui/icons/pen"
import { ChangelogDeleteDialog } from "./ChangelogDeleteDialog"
import type { ChangelogEntryWithTags } from "@/app/(main)/workspaces/[slug]/changelog/data"

interface ChangelogItemContextMenuProps {
    children: React.ReactNode
    item: ChangelogEntryWithTags
    workspaceSlug: string
}

export function ChangelogItemContextMenu({
    children,
    item,
    workspaceSlug,
}: ChangelogItemContextMenuProps) {
    const router = useRouter()
    const { publish, unpublish, isPending } = useChangelogEntryActions({
        workspaceSlug,
        entryId: item.id
    })
    const [open, setOpen] = React.useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setPosition({ x: e.clientX, y: e.clientY })
        setOpen(true)
    }

    const onEdit = () => {
        router.push(`/workspaces/${workspaceSlug}/changelog/${item.id}/edit`)
    }

    const onDelete = () => {
        setShowDeleteDialog(true)
    }

    return (
        <>
            <ChangelogDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                workspaceSlug={workspaceSlug}
                entryId={item.id}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {/* Virtual trigger positioned at mouse coordinates */}
                    <div
                        className="fixed w-px h-px z-50 pointer-events-none opacity-0"
                        style={{
                            top: position?.y ?? 0,
                            left: position?.x ?? 0,
                        }}
                    />
                </PopoverTrigger>

                <div onContextMenu={handleContextMenu}>
                    {children}
                </div>

                <PopoverContent align="start" className="fit" list>
                    <PopoverList>
                        <PopoverListItem onClick={onEdit}>
                            <EditIcon className="size-4" />
                            <span className="text-sm">Edit</span>
                        </PopoverListItem>

                        {item.status === "draft" && (
                            <PopoverListItem onClick={publish} disabled={isPending}>
                                {isPending ? (
                                    <LoaderIcon className="size-4 animate-spin" />
                                ) : (
                                    <LoaderIcon className="size-4" />
                                )}
                                <span className="text-sm">Publish</span>
                            </PopoverListItem>
                        )}

                        {item.status === "published" && (
                            <PopoverListItem onClick={unpublish} disabled={isPending}>
                                {isPending ? (
                                    <LoaderIcon className="size-4 animate-spin" />
                                ) : (
                                    <PenIcon className="size-4" />
                                )}
                                <span className="text-sm">Unpublish</span>
                            </PopoverListItem>
                        )}

                        <PopoverSeparator />

                        <PopoverListItem
                            onClick={onDelete}
                            className="text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        >
                            <TrashIcon className="size-4" />
                            <span className="text-sm">Delete</span>
                        </PopoverListItem>
                    </PopoverList>
                </PopoverContent>
            </Popover>
        </>
    )
}
