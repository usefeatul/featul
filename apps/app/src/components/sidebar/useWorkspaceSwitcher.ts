"use client"

import React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { useWorkspaceLogo } from "@/lib/branding-store"

export type Ws = {
  id: string
  name: string
  slug: string
  logo?: string | null
  domain?: string | null
  customDomain?: string | null
  plan?: "free" | "starter" | "professional" | null
}

export function useWorkspaceSwitcher(slug: string, initialWorkspace?: Ws | null, initialWorkspaces?: Ws[]) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const { data: workspaces = [] } = useQuery<Ws[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await client.workspace.listMine.$get()
      const data = await res.json()
      return (data?.workspaces || []) as Ws[]
    },
    initialData: initialWorkspaces || [],
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: wsInfo } = useQuery<Ws | null>({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await client.workspace.bySlug.$get({ slug })
      const d = await res.json()
      const w = (d as { workspace?: Ws | null })?.workspace
      return (w || null) as Ws | null
    },
    enabled: !!slug,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: false,
    initialData: initialWorkspace || null,
  })

  const liveLogo = useWorkspaceLogo(slug || "")

  const current = React.useMemo(() => {
    return workspaces.find((w) => w.slug === slug) || null
  }, [workspaces, slug])

  const currentLogo: string | null = liveLogo ?? wsInfo?.logo ?? current?.logo ?? null
  const currentName: string = wsInfo?.name ?? current?.name ?? (slug || "Current")

  const handleSelectWorkspace = React.useCallback(
    (targetSlug: string) => {
      let targetPath = `/workspaces/${targetSlug}`

      // Check if we are currently in a workspace path
      if (pathname?.startsWith(`/workspaces/${slug}`)) {
        // Replace the current slug with the target slug
        targetPath = pathname.replace(`/workspaces/${slug}`, `/workspaces/${targetSlug}`)
        // Append query parameters if any
        if (searchParams?.toString()) {
          targetPath += `?${searchParams.toString()}`
        }
      }

      try {
        router.prefetch(targetPath)
      } catch {
        console.error("Failed to prefetch", targetPath)
      }
      try {
        queryClient.prefetchQuery({
          queryKey: ["status-counts", targetSlug],
          queryFn: async () => {
            const res = await client.workspace.statusCounts.$get({ slug: targetSlug })
            const data = await res.json()
            return (data?.counts || null) as Record<string, number> | null
          },
          staleTime: 300_000,
          gcTime: 300_000,
        })
      } catch {
        console.error("Failed to prefetch status counts for", targetSlug)
      }
      router.push(targetPath)
    },
    [router, queryClient, slug, pathname, searchParams]
  )

  const handleCreateNew = React.useCallback(() => {
    router.push("/workspaces/new")
  }, [router])

  return { workspaces, all: workspaces, current, wsInfo, liveLogo, currentLogo, currentName, handleSelectWorkspace, handleCreateNew }
}
