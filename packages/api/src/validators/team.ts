import { z } from "zod"
import { slugSchema } from "../validators/workspace"

export const roleSchema = z.enum(["admin", "member", "viewer"]) 

export const byWorkspaceInputSchema = z.object({
  slug: slugSchema,
})

export const inviteMemberInputSchema = z.object({
  slug: slugSchema,
  email: z.string().email(),
  role: roleSchema,
})

export const updateMemberRoleInputSchema = z.object({
  slug: slugSchema,
  userId: z.string().min(1),
  role: roleSchema,
})

export const removeMemberInputSchema = z.object({
  slug: slugSchema,
  userId: z.string().min(1),
})

export const listInvitesInputSchema = z.object({
  slug: slugSchema,
})

export const revokeInviteInputSchema = z.object({
  slug: slugSchema,
  inviteId: z.string().min(1),
})

export const resendInviteInputSchema = z.object({
  slug: slugSchema,
  inviteId: z.string().min(1),
})

export const acceptInviteInputSchema = z.object({
  token: z.string().min(1),
})

export const addExistingMemberInputSchema = z.object({
  slug: slugSchema,
  email: z.string().email(),
  role: roleSchema,
})
