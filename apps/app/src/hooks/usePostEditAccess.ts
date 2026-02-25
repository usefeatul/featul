"use client"

import { useSession } from "@featul/auth/client"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"

export function usePostEditAccess({
  workspaceSlug,
  viewerCanEdit,
}: {
  workspaceSlug: string
  viewerCanEdit?: boolean
}): { canEdit: boolean; isSignedIn: boolean } {
  const { isOwner, role } = useWorkspaceRole(workspaceSlug)
  const { data: session, isPending } = useSession()
  const isSignedIn = isPending ? Boolean(viewerCanEdit) : Boolean(session?.user)
  const canEdit = isSignedIn && (Boolean(viewerCanEdit) || isOwner || role === "admin")

  return { canEdit, isSignedIn }
}
