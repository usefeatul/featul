"use client"

import React from "react"
import { client } from "@feedgot/api/client"

type Role = "admin" | "member" | "viewer"

function useWorkspaceRole(slug: string): { loading: boolean; role: Role | null; isOwner: boolean } {
  const [loading, setLoading] = React.useState(true)
  const [role, setRole] = React.useState<Role | null>(null)
  const [isOwner, setIsOwner] = React.useState(false)
  React.useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const res = await client.team.membersByWorkspaceSlug.$get({ slug })
        const d = await res.json()
        const meId = (d as any)?.meId
        const members = (d as any)?.members || []
        const me = Array.isArray(members) ? members.find((m: any) => m?.userId === meId) : null
        if (mounted) {
          setIsOwner(Boolean(me?.isOwner))
          setRole((me?.role as Role) || null)
        }
      } catch {}
      finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [slug])
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

