"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { client } from "@featul/api/client"

interface UseChangelogEntryActionsProps {
    workspaceSlug: string
    entryId: string
    onSuccess?: () => void
}

export function useChangelogEntryActions({ workspaceSlug, entryId, onSuccess }: UseChangelogEntryActionsProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    const publish = async () => {
        setIsPending(true)
        try {
            const res = await client.changelog.entriesPublish.$post({
                slug: workspaceSlug,
                entryId,
            })
            if (res.ok) {
                toast.success("Entry published")
                router.refresh()
                onSuccess?.()
            } else {
                toast.error("Failed to publish entry")
            }
        } catch {
            toast.error("Failed to publish entry")
        } finally {
            setIsPending(false)
        }
    }

    const unpublish = async () => {
        setIsPending(true)
        try {
            const res = await client.changelog.entriesUpdate.$post({
                slug: workspaceSlug,
                entryId,
                status: "draft",
            })
            if (res.ok) {
                toast.success("Entry unpublished")
                router.refresh()
                onSuccess?.()
            } else {
                toast.error("Failed to unpublish entry")
            }
        } catch {
            toast.error("Failed to unpublish entry")
        } finally {
            setIsPending(false)
        }
    }

    const deleteEntry = async () => {
        setIsPending(true)
        try {
            const res = await client.changelog.entriesDelete.$post({
                slug: workspaceSlug,
                entryId,
            })
            if (res.ok) {
                toast.success("Entry deleted")
                router.refresh()
                onSuccess?.()
            } else {
                toast.error("Failed to delete entry")
            }
        } catch {
            toast.error("Failed to delete entry")
        } finally {
            setIsPending(false)
        }
    }

    return {
        publish,
        unpublish,
        deleteEntry,
        isPending
    }
}
