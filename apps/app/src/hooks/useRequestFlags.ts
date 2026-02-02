import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { client } from "@featul/api/client"
import { toast } from "sonner"

export type RequestFlags = {
    isPinned?: boolean
    isLocked?: boolean
    isFeatured?: boolean
}

interface UseRequestFlagsProps {
    item: {
        id: string
        isPinned?: boolean
        isLocked?: boolean
        isFeatured?: boolean
    }
}

export function useRequestFlags({ item }: UseRequestFlagsProps) {
    const router = useRouter()
    const [_, startTransition] = useTransition()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [optimisticFlags, setOptimisticFlags] = React.useState<RequestFlags>({
        isPinned: !!item.isPinned,
        isLocked: !!item.isLocked,
        isFeatured: !!item.isFeatured,
    })

    React.useEffect(() => {
        setOptimisticFlags({
            isPinned: !!item.isPinned,
            isLocked: !!item.isLocked,
            isFeatured: !!item.isFeatured,
        })
    }, [item.isPinned, item.isLocked, item.isFeatured])

    const toggleFlag = async (key: keyof RequestFlags) => {
        if (isUpdating) return
        const prev = optimisticFlags
        const nextValue = !prev[key]
        const next = { ...prev, [key]: nextValue }
        setOptimisticFlags(next)
        setIsUpdating(true)

        try {
            const res = await client.board.updatePostMeta.$post({
                postId: item.id,
                [key]: nextValue,
            })

            if (res.ok) {
                startTransition(() => {
                    router.refresh()
                })
            } else {
                toast.error("Failed to update flags")
                setOptimisticFlags(prev)
            }
        } catch {
            toast.error("Failed to update flags")
            setOptimisticFlags(prev)
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        optimisticFlags,
        toggleFlag,
        isUpdating,
    }
}
