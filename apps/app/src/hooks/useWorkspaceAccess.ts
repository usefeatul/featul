"use client"

import React from "react"
import { client } from "@featul/api/client"
import { useSession } from "@featul/auth/client"

type Role = "admin" | "member" | "viewer"

function useWorkspaceRole(slug: string): { loading: boolean; role: Role | null; isOwner: boolean } {
  const [loading, setLoading] = React.useState(true)
  const [role, setRole] = React.useState<Role | null>(null)
  const [isOwner, setIsOwner] = React.useState(false)
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id || null
  React.useEffect(() => {
    let mounted = true
    if (!slug) {
      if (mounted) {
        setRole(null)
        setIsOwner(false)
        setLoading(false)
      }
      return () => { mounted = false }
    }
    if (!userId) {
      if (mounted) {
        if (!isPending) {
          setRole(null)
          setIsOwner(false)
        }
        setLoading(Boolean(isPending))
      }
      return () => { mounted = false }
    }
    setLoading(true)
    void (async () => {
      try {
        const res = await client.team.membersByWorkspaceSlug.$get({ slug })
        if (!res.ok) throw new Error("Failed to load workspace members")
        const d = (await res.json().catch(() => null)) as
          | { meId?: string; members?: { userId: string; role: Role; isOwner: boolean }[] }
          | null
        const meId = d?.meId
        const members = d?.members || []
        const me = Array.isArray(members) ? members.find((m: { userId: string; role: Role; isOwner: boolean }) => m?.userId === meId) : null
        if (mounted) {
          setIsOwner(Boolean(me?.isOwner))
          setRole((me?.role as Role) || null)
        }
      } catch {
        if (mounted) {
          setIsOwner(false)
          setRole(null)
        }
      }
      finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [slug, userId, isPending])
  return { loading, role, isOwner }
}

export function useCanEditBranding(slug: string): { loading: boolean; canEditBranding: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canEditBranding = Boolean(isOwner || role === "admin" || role === "member")
  return { loading, canEditBranding }
}

export function useCanEditDomain(slug: string): { loading: boolean; canEditDomain: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canEditDomain = Boolean(isOwner || role === "admin")
  return { loading, canEditDomain }
}

export function useCanInvite(slug: string): { loading: boolean; canInvite: boolean } {
  const { loading, role, isOwner } = useWorkspaceRole(slug)
  const canInvite = Boolean(isOwner || role === "admin")
  return { loading, canInvite }
}

export { useWorkspaceRole }
