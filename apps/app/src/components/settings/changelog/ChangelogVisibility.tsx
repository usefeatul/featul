"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog"

type ChangelogSettingsResponse = {
  isVisible?: boolean
}

type ChangelogSettingsCache = {
  isVisible: boolean
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error.trim()) return error
  return fallback
}

export default function ChangelogVisibility({ slug, initialIsVisible }: { slug: string; initialIsVisible?: boolean }) {
  const queryClient = useQueryClient()
  const { data = { isVisible: Boolean(initialIsVisible) } } = useQuery<ChangelogSettingsCache>({
    queryKey: ["changelog-settings", slug],
    queryFn: async () => {
      const res = await client.changelog.settings.$get({ slug })
      const data = (await res
        .json()
        .catch(() => null)) as ChangelogSettingsResponse | null
      return { isVisible: Boolean(data?.isVisible) }
    },
    initialData: initialIsVisible !== undefined ? { isVisible: Boolean(initialIsVisible) } : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const visible = Boolean(data?.isVisible)

  const handleToggleVisible = async (v: boolean) => {
    try {
      queryClient.setQueryData<ChangelogSettingsCache>(["changelog-settings", slug], {
        isVisible: v,
      })
      const res = await client.changelog.toggleVisibility.$post({ slug, isVisible: v })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Update failed")
      }
      captureAnalyticsEvent(analyticsEvents.changelogVisibilityChanged, {
        workspace_slug: slug,
        is_visible: v,
      })
      const msg = v ? "Changelog is now visible on your public site" : "Changelog is hidden from your public site"
      toast.success(msg)
      queryClient.setQueryData<ChangelogSettingsCache>(["changelog-settings", slug], {
        isVisible: v,
      })
    } catch (e: unknown) {
      queryClient.setQueryData<ChangelogSettingsCache>(["changelog-settings", slug], {
        isVisible: !v,
      })
      const m = readErrorMessage(e, "Couldn't update changelog visibility")
      toast.error(m)
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Changelog Visibility</div>
      <div className="text-sm text-accent">Show or hide your changelog on the public site.</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm">Visible on public site</div>
        <Switch checked={visible} onCheckedChange={handleToggleVisible} aria-label="Toggle Changelog Visibility" />
      </div>
    </div>
  )
}
