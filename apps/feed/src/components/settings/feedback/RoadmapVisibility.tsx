"use client"

import React from "react"
import { Switch } from "@oreilla/ui/components/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"

export default function RoadmapVisibility({ slug, initialBoards }: { slug: string; initialBoards?: any[] }) {
  const queryClient = useQueryClient()
  const { data: boards = [], refetch } = useQuery({
    queryKey: ["feedback-boards", slug],
    queryFn: async () => {
      const res = await client.board.settingsByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return (d as any)?.boards || []
    },
    initialData: Array.isArray(initialBoards) ? initialBoards : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const roadmap = React.useMemo(() => (boards || []).find((b: any) => String(b.slug) === "roadmap"), [boards])

  const updateRoadmap = async (v: boolean) => {
    try {
      queryClient.setQueryData(["feedback-boards", slug], (prev: any) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.map((it: any) => it.slug === "roadmap" ? { ...it, isVisible: v } : it)
      })
    } catch {}
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
      <div className="rounded-md  border bg-card p-3 flex items-center  justify-between">
        <div className="text-sm">Enable Roadmap </div>
        <Switch
          checked={Boolean(roadmap?.isVisible)}
          onCheckedChange={(v) => updateRoadmap(v)}
          aria-label="Toggle Roadmap Visibility"
        />
      </div>
    </div>
  )
}
