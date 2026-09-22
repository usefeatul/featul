"use client"

import { useSession } from "@featul/auth/client"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkspaceViewer } from "@/lib/team/client"
import { teamQueryKeys } from "@/lib/team/keys"

type Role = "admin" | "member" | "viewer"

/** Viewer role and owner flag for a workspace slug. Skips fetch until session user id exists. */
function useWorkspaceRole(slug: string): { loading: boolean; role: Role | null; isOwner: boolean } {
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id || null
  const { data, isLoading } = useQuery({
    queryKey: teamQueryKeys.viewer(slug, userId),
    queryFn: () => fetchWorkspaceViewer(slug),
    enabled: Boolean(slug && userId),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  if (!slug) {
    return { loading: false, role: null, isOwner: false }
  }

  if (!userId) {
    return { loading: Boolean(isPending), role: null, isOwner: false }
  }

  return {
    loading: Boolean(isPending || isLoading),
    role: data?.role ?? null,
    isOwner: Boolean(data?.isOwner),
  }
}

/** Owner, admin, or member may edit branding. */
export function useCanEditBranding(slug: string): { loading: boolean; canEditBranding: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canEditBranding = Boolean(isOwner || role === "admin" || role === "member")
  return { loading, canEditBranding }
}

/** Owner or admin may edit custom domain. */
export function useCanEditDomain(slug: string): { loading: boolean; canEditDomain: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canEditDomain = Boolean(isOwner || role === "admin")
  return { loading, canEditDomain }
}

/** Owner or admin may invite members. */
export function useCanInvite(slug: string): { loading: boolean; canInvite: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canInvite = Boolean(isOwner || role === "admin")
  return { loading, canInvite }
}

export { useWorkspaceRole }
