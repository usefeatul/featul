"use client"

import React from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { PostDeletedEventDetail } from "@/types/events"

export function WorkspaceEvents({ slug }: { slug: string }) {
    const queryClient = useQueryClient()

    const normalizeStatus = React.useCallback((value: string | null | undefined): string | null => {
        const raw = (value || "").trim().toLowerCase()
        if (!raw) return null
        const t = raw.replace(/-/g, "")
        const map: Record<string, string> = {
            pending: "pending",
            review: "review",
            planned: "planned",
            progress: "progress",
            completed: "completed",
            closed: "closed",
        }
        return map[t] || raw
    }, [])

    React.useEffect(() => {
        if (!slug) return
        if (typeof window === "undefined") return
        const handlePostDeleted = (event: Event) => {
            const detail = (event as CustomEvent<PostDeletedEventDetail>).detail
            if (!detail) {
                queryClient.invalidateQueries({ queryKey: ["status-counts", slug] })
                return
            }
            if (detail.workspaceSlug && detail.workspaceSlug !== slug) return
            const key = normalizeStatus(detail.status || null)
            if (!key) {
                queryClient.invalidateQueries({ queryKey: ["status-counts", slug] })
                return
            }
            try {
                queryClient.setQueryData<Record<string, number> | null>(["status-counts", slug], (prev) => {
                    if (!prev) return prev
                    const next: Record<string, number> = { ...prev }
                    const current = next[key]
                    if (typeof current === "number" && current > 0) {
                        next[key] = current - 1
                    }
                    return next
                })
            } catch {
                // ignore
            }
            try {
                queryClient.invalidateQueries({ queryKey: ["status-counts", slug] })
            } catch {
                // ignore
            }
        }
        window.addEventListener("post:deleted", handlePostDeleted)
        return () => {
            window.removeEventListener("post:deleted", handlePostDeleted)
        }
    }, [slug, queryClient, normalizeStatus])

    return null
}
