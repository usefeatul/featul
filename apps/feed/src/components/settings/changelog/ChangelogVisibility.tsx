"use client"

import React from "react"
import { Switch } from "@oreilla/ui/components/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"

export default function ChangelogVisibility({ slug, initialIsVisible }: { slug: string; initialIsVisible?: boolean }) {
  const queryClient = useQueryClient()
  const { data = { isVisible: Boolean(initialIsVisible) } } = useQuery({
    queryKey: ["changelog-settings", slug],
    queryFn: async () => {
      const res = await client.changelog.settings.$get({ slug })
      const d = await res.json()
      return { isVisible: Boolean((d as any)?.isVisible) }
    },
    initialData: initialIsVisible !== undefined ? { isVisible: Boolean(initialIsVisible) } : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const visible = Boolean((data as any)?.isVisible)

  const handleToggleVisible = async (v: boolean) => {
    try {
      try {
        queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
          ...(prev || {}),
          isVisible: v,
        }))
      } catch {}
      const res = await client.changelog.toggleVisibility.$post({ slug, isVisible: v })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Update failed")
      }
      const msg = v ? "Changelog is now visible on your public site" : "Changelog is hidden from your public site"
      toast.success(msg)
      queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
        ...(prev || {}),
        isVisible: v,
      }))
    } catch (e: unknown) {
      try {
        queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
          ...(prev || {}),
          isVisible: !v,
        }))
      } catch {}
      const m = (e as { message?: string })?.message || "Couldn't update changelog visibility"
      toast.error(m)
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Changelog Visibility</div>
      <div className="text-sm text-accent">Show or hide your changelog on the public site.</div>
      <div className="rounded-md  border bg-card p-3 flex items-center justify-between">
        <div className="text-sm">Visible on public site</div>
        <Switch checked={visible} onCheckedChange={handleToggleVisible} aria-label="Toggle Changelog Visibility" />
      </div>
    </div>
  )
}
