"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"

export interface FeedbackBoardSettings {
  id: string
  name: string
  slug: string
  isPublic: boolean
  isVisible: boolean
  isActive: boolean
  allowAnonymous: boolean
  allowComments: boolean
  hidePublicMemberIdentity: boolean
  sortOrder: number
  postCount: number
}

export type ToggleKey = keyof Pick<FeedbackBoardSettings, "allowAnonymous" | "allowComments" | "hidePublicMemberIdentity">

export function useGlobalBoardToggle(
  slug: string,
  key: ToggleKey,
  successMessage?: string,
  initialBoards?: FeedbackBoardSettings[]
) {
  const queryClient = useQueryClient()
  const { data: boards = [], refetch } = useQuery<FeedbackBoardSettings[]>({
    queryKey: ["feedback-boards", slug],
    queryFn: async () => {
      const res = await client.board.settingsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      const boardsData = (d as { boards?: FeedbackBoardSettings[] } | null)?.boards
      return Array.isArray(boardsData) ? boardsData : []
    },
    initialData: Array.isArray(initialBoards) ? initialBoards : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const otherBoards = React.useMemo(
    () => (boards || []).filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"),
    [boards],
  )
  const allTrue = React.useCallback(
    (k: ToggleKey) =>
      (otherBoards || []).length > 0 && (otherBoards || []).every((b) => Boolean(b[k])),
    [otherBoards],
  )
  const [value, setValue] = React.useState<boolean>(allTrue(key))

  React.useEffect(() => { setValue(allTrue(key)) }, [allTrue, key])

  const onToggle = async (v: boolean) => {
    try {
      setValue(v)
      queryClient.setQueryData<FeedbackBoardSettings[]>(["feedback-boards", slug], (prev) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.map((it) =>
          it.slug !== "roadmap" && it.slug !== "changelog" ? { ...it, [key]: v } : it,
        )
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
