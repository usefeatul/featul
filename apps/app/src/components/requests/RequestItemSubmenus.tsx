import * as React from "react"
import { PopoverList, PopoverListItem, PopoverSeparator } from "@featul/ui/components/popover"
import { CheckIcon } from "@featul/ui/icons/check"
import { LoaderIcon } from "@featul/ui/icons/loader"
import StatusIcon from "./StatusIcon"
import type { Tag } from "../../hooks/useRequestTags"
import type { RequestFlags } from "../../hooks/useRequestFlags"

export const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Review", value: "review" },
    { label: "Planned", value: "planned" },
    { label: "Progress", value: "progress" },
    { label: "Complete", value: "completed" },
    { label: "Closed", value: "closed" },
]

interface StatusSubmenuProps {
    currentStatus: string
    isPending: boolean
    onBack: () => void
    onUpdateStatus: (status: string) => void
}

export function StatusSubmenu({ currentStatus, isPending, onBack, onUpdateStatus }: StatusSubmenuProps) {
    return (
        <PopoverList className="max-h-none! overflow-visible">
            <PopoverListItem onClick={onBack} className="text-muted-foreground">
                <span className="text-sm">Back</span>
            </PopoverListItem>
            <PopoverSeparator />
            {statusOptions.map((option) => (
                <PopoverListItem
                    key={option.value}
                    onClick={() => onUpdateStatus(option.value)}
                    disabled={isPending || currentStatus === option.value}
                    className={currentStatus === option.value ? "opacity-50 pointer-events-none" : ""}
                >
                    {isPending && currentStatus === option.value ? (
                        <LoaderIcon className="size-4 animate-spin" />
                    ) : (
                        <StatusIcon status={option.value} className="size-4" />
                    )}
                    <span className="text-sm">{option.label}</span>
                </PopoverListItem>
            ))}
        </PopoverList>
    )
}

interface TagsSubmenuProps {
    availableTags: Tag[]
    optimisticTags: Tag[]
    onBack: () => void
    onToggleTag: (tagId: string) => void
}

export function TagsSubmenu({ availableTags, optimisticTags, onBack, onToggleTag }: TagsSubmenuProps) {
    return (
        <PopoverList>
            <PopoverListItem onClick={onBack} className="text-muted-foreground text-center justify-center">
                <span className="text-sm ">Back</span>
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
                                onToggleTag(tag.id)
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
    )
}

const flagOptions = [
    { key: "isPinned", label: "Pinned" },
    { key: "isLocked", label: "Locked" },
    { key: "isFeatured", label: "Featured" },
] as const

interface FlagsSubmenuProps {
    flags: RequestFlags
    onBack: () => void
    onToggleFlag: (key: keyof RequestFlags) => void
}

export function FlagsSubmenu({ flags, onBack, onToggleFlag }: FlagsSubmenuProps) {
    return (
        <PopoverList>
            <PopoverListItem onClick={onBack} className="text-muted-foreground text-center justify-center">
                <span className="text-sm">Back</span>
            </PopoverListItem>
            <PopoverSeparator />
            {flagOptions.map((option) => {
                const isChecked = !!flags[option.key]
                return (
                    <PopoverListItem
                        key={option.key}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleFlag(option.key)
                        }}
                        className="gap-2"
                    >
                        <div className="size-4 flex items-center justify-center shrink-0">
                            {isChecked && <CheckIcon className="size-3.5" />}
                        </div>
                        <span className="text-sm truncate">{option.label}</span>
                    </PopoverListItem>
                )
            })}
        </PopoverList>
    )
}
