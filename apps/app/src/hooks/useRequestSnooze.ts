"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import {
  snoozeUntilFromDays,
  type SnoozePresetId,
  SNOOZE_PRESETS,
} from "@featul/api/shared/snooze"
import { workspaceQueryKeys } from "@/lib/workspace/client"

interface UseRequestSnoozeProps {
  postId: string
  workspaceSlug: string
  snoozedUntil?: string | null
  onSuccess?: () => void
}

export function useRequestSnooze({
  postId,
  workspaceSlug,
  snoozedUntil,
  onSuccess,
}: UseRequestSnoozeProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [optimisticUntil, setOptimisticUntil] = React.useState<string | null>(
    snoozedUntil ?? null,
  )

  React.useEffect(() => {
    setOptimisticUntil(snoozedUntil ?? null)
  }, [snoozedUntil])

  const applySnooze = async (next: Date | null, successMessage: string) => {
    if (isUpdating) return
    const prev = optimisticUntil
    setOptimisticUntil(next ? next.toISOString() : null)
    setIsUpdating(true)

    try {
      const res = await client.board.updatePostMeta.$post({
        postId,
        snoozedUntil: next ? next.toISOString() : null,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.error("[snooze] update failed", res.status, body)
        toast.error("Failed to update snooze")
        setOptimisticUntil(prev)
        return
      }

      toast.success(successMessage)
      queryClient.setQueryData<Record<string, number> | null>(
        workspaceQueryKeys.statusCounts(workspaceSlug),
        (current) => {
          const base = { ...(current ?? {}) }
          const prevCount = Number(base.snoozed ?? 0)
          if (next && !prev) base.snoozed = prevCount + 1
          if (!next && prev) base.snoozed = Math.max(0, prevCount - 1)
          return base
        },
      )
      await queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.statusCounts(workspaceSlug),
      })
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("[snooze] update error", error)
      toast.error("Failed to update snooze")
      setOptimisticUntil(prev)
    } finally {
      setIsUpdating(false)
    }
  }

  const snoozeForPreset = async (presetId: SnoozePresetId) => {
    const preset = SNOOZE_PRESETS.find((entry) => entry.id === presetId)
    if (!preset) return
    const until = snoozeUntilFromDays(preset.days)
    await applySnooze(until, `Snoozed for ${preset.label}`)
  }

  const clearSnooze = async () => {
    await applySnooze(null, "Snooze cleared")
  }

  return {
    optimisticUntil,
    isUpdating,
    snoozeForPreset,
    clearSnooze,
  }
}
