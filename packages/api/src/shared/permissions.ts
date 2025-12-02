export type Role = "admin" | "member" | "viewer"

export type Permissions = {
  canManageWorkspace: boolean
  canManageBilling: boolean
  canManageMembers: boolean
  canManageBoards: boolean
  canModerateAllBoards: boolean
  canConfigureBranding: boolean
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canManageWorkspace: true,
    canManageBilling: true,
    canManageMembers: true,
    canManageBoards: true,
    canModerateAllBoards: true,
    canConfigureBranding: true,
  },
  member: {
    canManageWorkspace: false,
    canManageBilling: false,
    canManageMembers: false,
    canManageBoards: true,
    canModerateAllBoards: true,
    canConfigureBranding: true,
  },
  viewer: {
    canManageWorkspace: false,
    canManageBilling: false,
    canManageMembers: false,
    canManageBoards: false,
    canModerateAllBoards: false,
    canConfigureBranding: false,
  },
}

export function mapPermissions(role: Role): Permissions {
  return ROLE_PERMISSIONS[role]
}
