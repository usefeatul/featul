import React from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { buildTopNav, buildMiddleNav } from "@/config/nav"

export function useWorkspaceNav(
  slug: string,
  initialCounts?: Record<string, number> | null,
  initialDomainInfo?: { domain: { status: string; host?: string } | null } | null,
) {
  const primaryNav = React.useMemo(() => buildTopNav(slug), [slug])
  const { data: wsInfo } = useQuery<{ id: string; name: string; slug: string; logo?: string | null; domain?: string | null; customDomain?: string | null } | null>({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await client.workspace.bySlug.$get({ slug })
      const data = (await res.json()) as { workspace: { id: string; name: string; slug: string; logo?: string | null; domain?: string | null; customDomain?: string | null } | null }
      // log the workspace data
      // console.log("[client] workspace.bySlug", { slug, workspace: data.workspace })
      return data.workspace
    },
    enabled: !!slug,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: false,
    initialData: null,
  })
  const customDomain = wsInfo?.customDomain ?? null
  const { data: domainInfo } = useQuery<{ domain: { status: string; host?: string } | null } | null>({
    queryKey: ["workspace-domain-info", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await client.workspace.domainInfo.$get({ slug })
      const data = (await res.json()) as { domain: { status: string; host?: string } | null }
      // console.log("[client] workspace.domainInfo", { slug, data })
      return data
    },
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
    queryKey: ["status-counts", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await client.workspace.statusCounts.$get({ slug })
      const data = (await res.json()) as { counts?: Record<string, number> }
      return data?.counts || null
    },
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: initialCounts,
  })

  return { primaryNav, middleNav, statusCounts, wsInfo, domainInfo, verifiedCustomDomain }
}
