"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import type { Board } from "@/types/board"

export default function RoadmapVisibility({ slug, initialBoards }: { slug: string; initialBoards?: Board[] }) {
  const queryClient = useQueryClient()
  const { data: boards = [], refetch } = useQuery({
    queryKey: ["feedback-boards", slug],
    queryFn: async () => {
      const res = await client.board.settingsByWorkspaceSlug.$get({ slug })
      const d = await res.json() as { boards?: Board[] }
      return d?.boards || []
    },
    initialData: Array.isArray(initialBoards) ? initialBoards : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const roadmap = React.useMemo(() => (boards || []).find((b) => b.slug === "roadmap"), [boards])

  const updateRoadmap = async (v: boolean) => {
    try {
      queryClient.setQueryData<Board[]>(["feedback-boards", slug], (prev) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.map((it) => it.slug === "roadmap" ? { ...it, isVisible: v } : it)
      })
    } catch { /* Optimistic update - errors handled in API call below */ }
    try {
      const res = await client.board.updateSettings.$post({ slug, boardSlug: "roadmap", patch: { isVisible: v } })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Update failed")
      }
      await refetch()
      toast.success(v ? "Roadmap is now visible" : "Roadmap is hidden")
    } catch (e: unknown) {
      await refetch()
      toast.error((e as { message?: string })?.message || "Failed to update")
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Roadmap Visibility</div>
      <div className="text-sm text-accent">Show or hide your roadmap on the public site.</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm ">Enable Roadmap </div>
        <Switch
          checked={Boolean(roadmap?.isVisible)}
          onCheckedChange={(v) => updateRoadmap(v)}
          aria-label="Toggle Roadmap Visibility"
        />
      </div>
    </div>
  )
}
