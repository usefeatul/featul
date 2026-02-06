import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import type { RequestFlagKey, RequestFlags } from "@/types/request"

interface UseRequestFlagsProps {
    item: {
        id: string
    } & RequestFlags
}

type FlagsState = Record<RequestFlagKey, boolean>

const toFlagsState = (flags: RequestFlags): FlagsState => ({
    isPinned: !!flags.isPinned,
    isLocked: !!flags.isLocked,
    isFeatured: !!flags.isFeatured,
})

export function useRequestFlags({ item }: UseRequestFlagsProps) {
    const router = useRouter()
    const [_, startTransition] = useTransition()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [optimisticFlags, setOptimisticFlags] = React.useState<FlagsState>(() => toFlagsState(item))

    React.useEffect(() => {
        setOptimisticFlags(toFlagsState(item))
    }, [item.isPinned, item.isLocked, item.isFeatured])

    const toggleFlag = async (key: RequestFlagKey) => {
        if (isUpdating) return
        const prev = optimisticFlags
        const nextValue = !prev[key]
        const next: FlagsState = { ...prev, [key]: nextValue }
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
