"use client"

import * as React from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverList,
    PopoverListItem,
    PopoverSeparator,
} from "@featul/ui/components/popover"
import { TrashIcon } from "@featul/ui/icons/trash"
import { LayersIcon } from "@featul/ui/icons/layers"
import { TagIcon } from "@featul/ui/icons/tag"
import { FlagIcon } from "@featul/ui/icons/flag"
import { useRequestItemActions } from "../../hooks/useRequestItemActions"
import { RequestDeleteDialog } from "./RequestDeleteDialog"
import type { RequestItemData } from "@/types/request"
import { useRequestTags } from "../../hooks/useRequestTags"
import { useRequestFlags } from "../../hooks/useRequestFlags"
import { StatusSubmenu, TagsSubmenu, FlagsSubmenu } from "./RequestItemSubmenus"

interface RequestItemContextMenuProps {
    children: React.ReactNode
    item: RequestItemData
    workspaceSlug: string
    className?: string
}

export function RequestItemContextMenu({
    children,
    item,
    workspaceSlug,
    className,
}: RequestItemContextMenuProps) {
    const [open, setOpen] = React.useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [currentSubmenu, setCurrentSubmenu] = React.useState<"main" | "status" | "tags" | "flags">("main")
    const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)

    const isTagsMenu = currentSubmenu === "tags"

    const {
        availableTags,
        optimisticTags,
        toggleTag,
        triggerPendingRefresh
    } = useRequestTags({
        item,
        workspaceSlug,
        enabled: open && isTagsMenu
    })

    const { optimisticFlags, toggleFlag } = useRequestFlags({ item })

    const { updateStatus, deleteRequest, isPending } = useRequestItemActions({
        requestId: item.id,
        workspaceSlug,
        roadmapStatus: item.roadmapStatus,
        onSuccess: () => {
            setOpen(false)
            setShowDeleteDialog(false)
        }
    })

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setPosition({ x: e.clientX, y: e.clientY })
        setOpen(true)
        setCurrentSubmenu("main")
    }

    const handleDelete = () => {
        setShowDeleteDialog(true)
    }

    const menuContent = (() => {
        if (currentSubmenu === "status") {
            return (
                <StatusSubmenu
                    currentStatus={item.roadmapStatus || "pending"}
                    isPending={isPending}
                    onBack={() => setCurrentSubmenu("main")}
                    onUpdateStatus={updateStatus}
                />
            )
        }

        if (currentSubmenu === "tags") {
            return (
                <TagsSubmenu
                    availableTags={availableTags}
                    optimisticTags={optimisticTags}
                    onBack={() => setCurrentSubmenu("main")}
                    onToggleTag={toggleTag}
                />
            )
        }

        if (currentSubmenu === "flags") {
            return (
                <FlagsSubmenu
                    flags={optimisticFlags}
                    onBack={() => setCurrentSubmenu("main")}
                    onToggleFlag={toggleFlag}
                />
            )
        }

        return (
            <PopoverList>
                <PopoverListItem onClick={() => setCurrentSubmenu("status")}>
                    <LayersIcon className="size-4" />
                    <span className="text-sm">Status</span>
                </PopoverListItem>

                <PopoverListItem onClick={() => setCurrentSubmenu("tags")}>
                    <TagIcon className="size-4" />
                    <span className="text-sm">Tags</span>
                </PopoverListItem>

                <PopoverListItem onClick={() => setCurrentSubmenu("flags")}>
                    <FlagIcon className="size-4" />
                    <span className="text-sm">Flags</span>
                </PopoverListItem>

                <PopoverSeparator />

                <PopoverListItem
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                >
                    <TrashIcon className="size-4" />
                    <span className="text-sm">Delete</span>
                </PopoverListItem>
            </PopoverList>
        )
    })()

    return (
        <>
            <RequestDeleteDialog
                open={showDeleteDialog}
                isPending={isPending}
                onOpenChange={setShowDeleteDialog}
                onConfirmDelete={deleteRequest}
            />
            <Popover
                open={open}
                onOpenChange={(v) => {
                    setOpen(v)
                    if (!v) {
                        triggerPendingRefresh()
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <div
                        className="fixed w-px h-px z-50 pointer-events-none opacity-0"
                        style={{
                            top: position?.y ?? 0,
                            left: position?.x ?? 0,
                        }}
                    />
                </PopoverTrigger>

                <div onContextMenu={handleContextMenu} className={className}>
                    {children}
                </div>

                <PopoverContent align="start" className="fit" list>
                    {menuContent}
                </PopoverContent>
            </Popover>
        </>
    )
}
