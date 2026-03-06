import React from "react"
import { useQuery } from "@tanstack/react-query"
import { buildTopNav, buildMiddleNav } from "@/config/nav"
import {
  fetchWorkspaceBySlug,
  fetchWorkspaceDomainInfo,
  fetchWorkspaceStatusCounts,
  workspaceQueryKeys,
  type WorkspaceDomainInfo,
  type WorkspaceSummary,
} from "@/lib/workspace-client"

export function useWorkspaceNav(
  slug: string,
  initialWorkspace?: WorkspaceSummary | null,
  initialCounts?: Record<string, number> | null,
  initialDomainInfo?: WorkspaceDomainInfo | null,
) {
  const primaryNav = React.useMemo(() => buildTopNav(slug), [slug])
  const { data: wsInfo } = useQuery<WorkspaceSummary | null>({
    queryKey: workspaceQueryKeys.bySlug(slug),
    queryFn: () => fetchWorkspaceBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: false,
    initialData: initialWorkspace ?? undefined,
  })
  const customDomain = wsInfo?.customDomain ?? null
  const { data: domainInfo } = useQuery<WorkspaceDomainInfo | null>({
    queryKey: workspaceQueryKeys.domainInfo(slug),
    queryFn: () => fetchWorkspaceDomainInfo(slug),
    enabled: !!slug,
    staleTime: 30_000,
    gcTime: 120_000,
    refetchOnMount: false,
    initialData: initialDomainInfo ?? null,
  })
  const verifiedCustomDomain = domainInfo?.domain?.status === "verified" ? (customDomain || domainInfo?.domain?.host || null) : null
  // console.log("[client] verifiedCustomDomain", { slug, customDomain, status: domainInfo?.domain?.status, host: domainInfo?.domain?.host, verifiedCustomDomain })
  const middleNav = React.useMemo(() => buildMiddleNav(slug, verifiedCustomDomain), [slug, verifiedCustomDomain])
  const { data: statusCounts } = useQuery<Record<string, number> | null>({
    queryKey: workspaceQueryKeys.statusCounts(slug),
    queryFn: () => fetchWorkspaceStatusCounts(slug),
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: initialCounts,
  })

  return { primaryNav, middleNav, statusCounts, wsInfo, domainInfo, verifiedCustomDomain }
}
