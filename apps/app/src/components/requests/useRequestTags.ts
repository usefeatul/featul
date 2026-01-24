import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { client } from "@featul/api/client"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Tag {
    id: string
    name: string
    slug: string
    color?: string | null
}

interface UseRequestTagsProps {
    item: {
        id: string
        tags?: Array<any>
    }
    workspaceSlug: string
    enabled?: boolean
}

export function useRequestTags({ item, workspaceSlug, enabled = false }: UseRequestTagsProps) {
    const router = useRouter()
    const [_, startTransition] = useTransition()
    const [hasPendingUpdates, setHasPendingUpdates] = React.useState(false)
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
        enabled,
        staleTime: 300_000,
    })

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

    const triggerPendingRefresh = () => {
        if (hasPendingUpdates) {
            startTransition(() => {
                router.refresh()
            })
            setHasPendingUpdates(false)
        }
    }

    return {
        availableTags,
        optimisticTags,
        toggleTag,
        triggerPendingRefresh,
        hasPendingUpdates,
    }
}
