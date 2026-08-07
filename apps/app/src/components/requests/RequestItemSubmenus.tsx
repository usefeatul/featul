import * as React from "react"
import { PopoverList, PopoverListItem, PopoverSeparator } from "@featul/ui/components/popover"
import { CheckIcon } from "@featul/ui/icons/check"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { ArrowLeftIcon } from "@featul/ui/icons/arrow-left"
import StatusIcon from "./StatusIcon"
import type { TagSummary } from "@/types/post"
import { REQUEST_FLAG_OPTIONS, type RequestFlagKey, type RequestFlags } from "@/types/request"

export const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Review", value: "review" },
    { label: "Planned", value: "planned" },
    { label: "Progress", value: "progress" },
    { label: "Complete", value: "completed" },
    { label: "Closed", value: "closed" },
]

export function getStatusLabel(status: string | null | undefined) {
    return statusOptions.find((option) => option.value === status)?.label ?? "Pending"
}

function SubmenuBack({ onBack }: { onBack: () => void }) {
    return (
        <>
            <PopoverListItem onClick={onBack}>
                <ArrowLeftIcon className="size-4 shrink-0" />
                <span className="text-sm">Back</span>
            </PopoverListItem>
            <PopoverSeparator />
        </>
    )
}

interface StatusSubmenuProps {
    currentStatus: string
    isPending: boolean
    updatingStatus: string | null
    onBack: () => void
    onUpdateStatus: (status: string) => void
}

export function StatusSubmenu({
    currentStatus,
    isPending,
    updatingStatus,
    onBack,
    onUpdateStatus,
}: StatusSubmenuProps) {
    return (
        <PopoverList className="max-h-none! overflow-visible">
            <SubmenuBack onBack={onBack} />
            {statusOptions.map((option) => {
                const isCurrent = currentStatus === option.value
                const isUpdating = isPending && updatingStatus === option.value

                return (
                    <PopoverListItem
                        key={option.value}
                        onClick={() => onUpdateStatus(option.value)}
                        disabled={isPending || isCurrent}
                    >
                        <div className="size-4 flex items-center justify-center shrink-0">
                            {isUpdating ? (
                                <LoaderIcon className="size-4 animate-spin" />
                            ) : isCurrent ? (
                                <CheckIcon className="size-3.5" />
                            ) : (
                                <StatusIcon status={option.value} className="size-4" />
                            )}
                        </div>
                        <span className="text-sm">{option.label}</span>
                    </PopoverListItem>
                )
            })}
        </PopoverList>
    )
}

interface TagsSubmenuProps {
    availableTags: TagSummary[]
    optimisticTags: TagSummary[]
    onBack: () => void
    onToggleTag: (tagId: string) => void
}

export function TagsSubmenu({ availableTags, optimisticTags, onBack, onToggleTag }: TagsSubmenuProps) {
    return (
        <PopoverList>
            <SubmenuBack onBack={onBack} />
            {availableTags.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground">No tags</div>
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
                        >
                            <div className="size-4 flex items-center justify-center shrink-0">
                                {isChecked ? <CheckIcon className="size-3.5" /> : null}
                            </div>
                            <span className="text-sm">{tag.name}</span>
                        </PopoverListItem>
                    )
                })
            )}
        </PopoverList>
    )
}

interface FlagsSubmenuProps {
    flags: RequestFlags
    onBack: () => void
    onToggleFlag: (key: RequestFlagKey) => void
}

export function FlagsSubmenu({ flags, onBack, onToggleFlag }: FlagsSubmenuProps) {
    return (
        <PopoverList>
            <SubmenuBack onBack={onBack} />
            {REQUEST_FLAG_OPTIONS.map((option) => {
                const isChecked = !!flags[option.key]
                return (
                    <PopoverListItem
                        key={option.key}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleFlag(option.key)
                        }}
                    >
                        <div className="size-4 flex items-center justify-center shrink-0">
                            {isChecked ? <CheckIcon className="size-3.5" /> : null}
                        </div>
                        <span className="text-sm">{option.label}</span>
                    </PopoverListItem>
                )
            })}
        </PopoverList>
    )
}
