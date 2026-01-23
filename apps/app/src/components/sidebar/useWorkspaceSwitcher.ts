"use client"

import React from "react"
import { useRouter, usePathname, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation"
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
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
      const targetPath = getWorkspaceRedirectPath(pathname, slug, targetSlug, searchParams)
      prefetchWorkspaceRoute(router, queryClient, targetPath, targetSlug)
      router.push(targetPath)
    },
    [router, queryClient, slug, pathname, searchParams]
  )

  const handleCreateNew = React.useCallback(() => {
    router.push("/workspaces/new")
  }, [router])

  return { workspaces, all: workspaces, current, wsInfo, liveLogo, currentLogo, currentName, handleSelectWorkspace, handleCreateNew }
}

/**
 * Configuration for route features that have dynamic segments.
 * Defines which routes should be stripped of specific IDs when switching workspaces.
 */
const DYNAMIC_ROUTE_CONFIG = {
  changelog: {
    // Preserve these specific paths (e.g., /changelog/new is safe across workspaces)
    preservePaths: new Set(["new"]),
    // Strip everything after this depth (0 = keep only /changelog)
    // This handles paths like /changelog/[id] and /changelog/[id]/edit
    stripAfterDepth: 0,
  },
  requests: {
    preservePaths: new Set<string>(),
    stripAfterDepth: 0,
  },
} as const

type RouteFeature = keyof typeof DYNAMIC_ROUTE_CONFIG

/**
 * Extracts the sub-path after the workspace slug.
 */
function extractSubPath(pathname: string, currentSlug: string): string {
  return pathname.slice(`/workspaces/${currentSlug}`.length)
}

/**
 * Parses the sub-path into components.
 */
function parseSubPath(subPath: string) {
  const parts = subPath.split("/").filter(Boolean)
  const feature = parts[0] as RouteFeature | undefined
  const secondSegment = parts[1]

  return { parts, feature, secondSegment }
}

/**
 * Determines if a route should be sanitized (stripped of dynamic IDs).
 */
function shouldSanitizeRoute(
  feature: string | undefined,
  secondSegment: string | undefined,
  parts: string[]
): boolean {
  if (!feature || !(feature in DYNAMIC_ROUTE_CONFIG)) {
    return false
  }

  const config = DYNAMIC_ROUTE_CONFIG[feature as RouteFeature]

  // If we have more parts than allowed depth, check if it's a preserved path
  if (parts.length > config.stripAfterDepth + 1) {
    // If the second segment is in preserve list, don't sanitize
    if (secondSegment && config.preservePaths.has(secondSegment)) {
      return false
    }
    return true
  }

  return false
}

/**
 * Builds a safe path for the route by stripping dynamic segments.
 */
function buildSafePath(targetSlug: string, feature: string): string {
  return `/workspaces/${targetSlug}/${feature}`
}

/**
 * Appends query parameters to a path.
 */
function appendQueryParams(path: string, searchParams: ReadonlyURLSearchParams | null): string {
  const queryString = searchParams?.toString()
  return queryString ? `${path}?${queryString}` : path
}

/**
 * Calculates the redirection path when switching workspaces.
 * Preserves the current route if possible, or falls back to a safe default.
 * 
 * Features:
 * - Prevents 404s on workspace-specific dynamic content
 * - Maintains query parameters during workspace switches
 * - Configurable route sanitization via DYNAMIC_ROUTE_CONFIG
 */
export function getWorkspaceRedirectPath(
  pathname: string | null,
  currentSlug: string,
  targetSlug: string,
  searchParams: ReadonlyURLSearchParams | null
): string {
  const defaultPath = `/workspaces/${targetSlug}`

  // Ensure pathname exists and we are currently in a workspace context
  if (!pathname || !pathname.startsWith(`/workspaces/${currentSlug}`)) {
    return defaultPath
  }

  // Replace the current slug with the target slug
  let targetPath = pathname.replace(`/workspaces/${currentSlug}`, `/workspaces/${targetSlug}`)

  // Extract and parse the sub-path
  const subPath = extractSubPath(pathname, currentSlug)
  const { parts, feature, secondSegment } = parseSubPath(subPath)

  // Sanitize routes with dynamic segments that may not exist in target workspace
  if (shouldSanitizeRoute(feature, secondSegment, parts)) {
    targetPath = buildSafePath(targetSlug, feature!)
  }

  // Append query parameters if any
  return appendQueryParams(targetPath, searchParams)
}

/**
 * Prefetches workspace route and related data for smoother transitions.
 */
function prefetchWorkspaceRoute(
  router: ReturnType<typeof useRouter>,
  queryClient: QueryClient,
  targetPath: string,
  targetSlug: string
) {
  // Prefetch the route
  try {
    router.prefetch(targetPath)
  } catch (error) {
    console.error("Failed to prefetch route:", targetPath, error)
  }

  // Prefetch workspace-specific data
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
  } catch (error) {
    console.error("Failed to prefetch status counts for:", targetSlug, error)
  }
}
