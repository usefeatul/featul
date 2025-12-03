"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"

export type ToggleKey = "allowAnonymous" | "allowComments" | "hidePublicMemberIdentity"

export function useGlobalBoardToggle(slug: string, key: ToggleKey, successMessage?: string) {
  const queryClient = useQueryClient()
  const { data: boards = [], refetch } = useQuery({
    queryKey: ["feedback-boards", slug],
    queryFn: async () => {
      const res = await client.board.settingsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return (d as any)?.boards || []
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const otherBoards = React.useMemo(() => (boards || []).filter((b: any) => b.slug !== "roadmap" && b.slug !== "changelog"), [boards])
  const allTrue = React.useCallback((k: ToggleKey) => (otherBoards || []).length > 0 && (otherBoards || []).every((b: any) => Boolean(b?.[k])), [otherBoards])
  const [value, setValue] = React.useState<boolean>(allTrue(key))

  React.useEffect(() => { setValue(allTrue(key)) }, [allTrue, key])

  const onToggle = async (v: boolean) => {
    try {
      setValue(v)
      queryClient.setQueryData(["feedback-boards", slug], (prev: any) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.map((it: any) => (it.slug !== "roadmap" && it.slug !== "changelog") ? { ...it, [key]: v } : it)
      })
    } catch {}
    try {
      const res = await client.board.updateGlobalSettings.$post({ slug, patch: { [key]: v } })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Update failed")
      }
      await refetch()
      toast.success(successMessage || "Setting updated")
    } catch (e: unknown) {
      await refetch()
      toast.error((e as { message?: string })?.message || "Failed to update setting")
    }
  }

  return { value, onToggle }
}

