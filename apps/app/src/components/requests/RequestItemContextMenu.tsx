"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { CheckIcon } from "@featul/ui/icons/check"
import StatusIcon from "./StatusIcon"
import { useRequestItemActions } from "./useRequestItemActions"
import { RequestDeleteDialog } from "./RequestDeleteDialog"
import type { RequestItemData } from "./RequestItem"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { client } from "@featul/api/client"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"


const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Review", value: "review" },
    { label: "Planned", value: "planned" },
    { label: "Progress", value: "progress" },
    { label: "Complete", value: "completed" },
    { label: "Closed", value: "closed" },
]

interface RequestItemContextMenuProps {
    children: React.ReactNode
    item: RequestItemData
    workspaceSlug: string
    className?: string
}

interface Tag {
    id: string
    name: string
    slug: string
    color?: string | null
}

export function RequestItemContextMenu({
    children,
    item,
    workspaceSlug,
    className,
}: RequestItemContextMenuProps) {
    const router = useRouter()
    const [isPendingRefresh, startTransition] = React.useTransition()
    const [open, setOpen] = React.useState(false)
    const [hasPendingUpdates, setHasPendingUpdates] = React.useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [currentSubmenu, setCurrentSubmenu] = React.useState<"main" | "status" | "tags">("main")
    const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)

    // Optimistic tags
    const [optimisticTags, setOptimisticTags] = React.useState<Tag[]>([])

    // Sync optimistic tags with items.tags when props change
    React.useEffect(() => {
        if (item.tags) {
            setOptimisticTags(item.tags as Tag[])
        }
    }, [item.tags])

    // Fetch tags
    const { data: availableTags = [] } = useQuery({
        queryKey: ["tags", workspaceSlug],
        queryFn: async () => {
            const res = await client.board.tagsByWorkspaceSlug.$get({ slug: workspaceSlug })
            const data = await res.json()
            return (data?.tags || []) as Tag[]
        },
        enabled: open && currentSubmenu === "tags",
        staleTime: 300_000,
    })

    // Use tags from item prop
    const toggleTag = async (tagId: string) => {
        const currentTagIds = optimisticTags.map((t) => t.id)
        const isSelected = currentTagIds.includes(tagId)

        let nextTags: string[]
        if (isSelected) {
            nextTags = currentTagIds.filter((id) => id !== tagId)
            setOptimisticTags((prev) => prev.filter((t) => t.id !== tagId))
        } else {
            nextTags = [...currentTagIds, tagId]
            const tagToAdd = availableTags.find((t) => t.id === tagId)
            if (tagToAdd) {
                setOptimisticTags((prev) => [...prev, tagToAdd])
            }
        }

        try {
            const res = await client.post.update.$post({
                postId: item.id,
                tags: nextTags,
            })

            if (res.ok) {
                setHasPendingUpdates(true)
            } else {
                toast.error("Failed to update tags")
                // Revert on error
                setOptimisticTags(item.tags as Tag[] || [])
            }
        } catch {
            toast.error("Failed to update tags")
            setOptimisticTags(item.tags as Tag[] || [])
        }
    }

    const { updateStatus, deleteRequest, isPending } = useRequestItemActions({
        requestId: item.id,
        onSuccess: () => {
            setOpen(false)
            setShowDeleteDialog(false)
        }
    })

    const handleContextMenu = (e: React.MouseEvent) => {
        // Only prevent default if we're not selecting text? 
        // Actually, typically we prevent default to show our menu.
        e.preventDefault()
        e.stopPropagation()
        setPosition({ x: e.clientX, y: e.clientY })
        setOpen(true)
        setCurrentSubmenu("main")
    }

    // We need to implement tags differently as it requires fetching. 
    // For now, let's implement Status and Delete.
    // The user asked for Tags too. I'll add a placeholder action or submenu for tags 
    // but fetching tags for a specific item inside a context menu might be complex if we want checkmarks.
    // Let's stick to the plan: Status and Delete first, then maybe Tags if I can fetch them easily.
    // Actually, `TagsAction.tsx` fetches all tags for workspace. I can do the same here.

    const handleDelete = () => {
        setShowDeleteDialog(true)
    }

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
                    if (!v && hasPendingUpdates) {
                        startTransition(() => {
                            router.refresh()
                        })
                        setHasPendingUpdates(false)
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

                <PopoverContent align="start" className="w-fit min-w-[220px] p-0" list>
                    {currentSubmenu === "status" ? (
                        <PopoverList>
                            <PopoverListItem onClick={() => setCurrentSubmenu("main")} className="text-muted-foreground">
                                <span className="text-sm">← Back</span>
                            </PopoverListItem>
                            <PopoverSeparator />
                            {statusOptions.map((option) => (
                                <PopoverListItem
                                    key={option.value}
                                    onClick={() => updateStatus(option.value)}
                                    disabled={isPending || item.roadmapStatus === option.value}
                                    className={item.roadmapStatus === option.value ? "opacity-50 pointer-events-none" : ""}
                                >
                                    {isPending && item.roadmapStatus === option.value ? (
                                        <LoaderIcon className="size-4 animate-spin" />
                                    ) : (
                                        <StatusIcon status={option.value} className="size-4" />
                                    )}
                                    <span className="text-sm">{option.label}</span>
                                </PopoverListItem>
                            ))}
                        </PopoverList>
                    ) : currentSubmenu === "tags" ? (
                        <PopoverList>
                            <PopoverListItem onClick={() => setCurrentSubmenu("main")} className="text-muted-foreground">
                                <span className="text-sm">← Back</span>
                            </PopoverListItem>
                            <PopoverSeparator />
                            {availableTags.length === 0 ? (
                                <div className="p-2 text-xs text-muted-foreground text-center">No tags available</div>
                            ) : (
                                availableTags.map((tag) => {
                                    const isChecked = optimisticTags.some((t) => t.id === tag.id)
                                    return (
                                        <PopoverListItem
                                            key={tag.id}
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleTag(tag.id)
                                            }}
                                            className="gap-2"
                                        >
                                            <div className="size-4 flex items-center justify-center shrink-0">
                                                {isChecked && <CheckIcon className="size-3.5" />}
                                            </div>
                                            <span className="text-sm truncate">{tag.name}</span>
                                        </PopoverListItem>
                                    )
                                })
                            )}
                        </PopoverList>
                    ) : (
                        <PopoverList>
                            <PopoverListItem onClick={() => setCurrentSubmenu("status")}>
                                <LayersIcon className="size-4" />
                                <span className="text-sm">Status</span>
                                <span className="ml-auto text-xs opacity-50">→</span>
                            </PopoverListItem>

                            <PopoverListItem onClick={() => setCurrentSubmenu("tags")}>
                                <TagIcon className="size-4" />
                                <span className="text-sm">Tags</span>
                                <span className="ml-auto text-xs opacity-50">→</span>
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
                    )}
                </PopoverContent>
            </Popover>
        </>
    )
}
