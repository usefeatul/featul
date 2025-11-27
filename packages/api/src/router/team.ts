import { HTTPException } from "hono/http-exception"
import { and, eq, gt, isNull } from "drizzle-orm"
import { j, privateProcedure, publicProcedure } from "../jstack"
import { workspace, workspaceMember, workspaceInvite, user } from "@feedgot/db"
import { sendWorkspaceInvite } from "@feedgot/auth/email"
import {
  byWorkspaceInputSchema,
  inviteMemberInputSchema,
  updateMemberRoleInputSchema,
  removeMemberInputSchema,
  listInvitesInputSchema,
  revokeInviteInputSchema,
  acceptInviteInputSchema,
  addExistingMemberInputSchema,
} from "../validators/team"

function mapPermissions(role: "admin" | "member" | "viewer") {
  if (role === "admin") {
    return {
      canManageWorkspace: true,
      canManageBilling: true,
      canManageMembers: true,
      canManageBoards: true,
      canModerateAllBoards: true,
      canConfigureBranding: true,
    }
  }
  if (role === "member") {
    return {
      canManageWorkspace: false,
      canManageBilling: false,
      canManageMembers: false,
      canManageBoards: true,
      canModerateAllBoards: true,
      canConfigureBranding: false,
    }
  }
  return {
    canManageWorkspace: false,
    canManageBilling: false,
    canManageMembers: false,
    canManageBoards: false,
    canModerateAllBoards: false,
    canConfigureBranding: false,
  }
}

export function createTeamRouter() {
  return j.router({
    membersByWorkspaceSlug: privateProcedure
      .input(byWorkspaceInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, name: workspace.name, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ members: [], invites: [] })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ id: workspaceMember.id, role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const rawMembers = await ctx.db
          .select({
            userId: workspaceMember.userId,
            role: workspaceMember.role,
            joinedAt: workspaceMember.joinedAt,
            isActive: workspaceMember.isActive,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(workspaceMember)
          .innerJoin(user, eq(workspaceMember.userId, user.id))
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.isActive, true)))

        const members = rawMembers.map((m: any) => ({ ...m, isOwner: m.userId === ws.ownerId }))

        if (!members.some((m: any) => m.userId === ws.ownerId)) {
          const [owner] = await ctx.db
            .select({ id: user.id, name: user.name, email: user.email, image: user.image })
            .from(user)
            .where(eq(user.id, ws.ownerId))
            .limit(1)
          if (owner) {
            members.unshift({
              userId: ws.ownerId,
              role: "admin",
              joinedAt: null,
              isActive: true,
              name: owner.name,
              email: owner.email,
              image: owner.image,
              isOwner: true,
            } as any)
          }
        }

        const now = new Date()
        const invites = await ctx.db
          .select({
            id: workspaceInvite.id,
            email: workspaceInvite.email,
            role: workspaceInvite.role,
            invitedBy: workspaceInvite.invitedBy,
            expiresAt: workspaceInvite.expiresAt,
            acceptedAt: workspaceInvite.acceptedAt,
            createdAt: workspaceInvite.createdAt,
          })
          .from(workspaceInvite)
          .where(and(eq(workspaceInvite.workspaceId, ws.id), gt(workspaceInvite.expiresAt, now), isNull(workspaceInvite.acceptedAt)))

        c.header("Cache-Control", "private, max-age=15, stale-while-revalidate=120")
        return c.superjson({ members, invites, meId })
      }),

    invite: privateProcedure
      .input(inviteMemberInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, name: workspace.name })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await ctx.db.insert(workspaceInvite).values({
          workspaceId: ws.id,
          email: input.email.trim().toLowerCase(),
          role: input.role,
          invitedBy: meId,
          token,
          expiresAt: expires,
        })

        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          const url = `${baseUrl}/invite/${token}`
          await sendWorkspaceInvite(input.email.trim().toLowerCase(), ws.name || "Workspace", url)
        } catch {}

        return c.superjson({ ok: true, token })
      }),

    listInvites: privateProcedure
      .input(listInvitesInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ invites: [] })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const now = new Date()
        const invites = await ctx.db
          .select({
            id: workspaceInvite.id,
            email: workspaceInvite.email,
            role: workspaceInvite.role,
            invitedBy: workspaceInvite.invitedBy,
            expiresAt: workspaceInvite.expiresAt,
            acceptedAt: workspaceInvite.acceptedAt,
            createdAt: workspaceInvite.createdAt,
          })
          .from(workspaceInvite)
          .where(and(eq(workspaceInvite.workspaceId, ws.id), gt(workspaceInvite.expiresAt, now), isNull(workspaceInvite.acceptedAt)))

        return c.superjson({ invites })
      }),

    revokeInvite: privateProcedure
      .input(revokeInviteInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        await ctx.db.delete(workspaceInvite).where(eq(workspaceInvite.id, input.inviteId))
        return c.json({ ok: true })
      }),

    updateRole: privateProcedure
      .input(updateMemberRoleInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        if (input.userId === ws.ownerId) throw new HTTPException(403, { message: "Cannot modify owner" })
        await ctx.db
          .update(workspaceMember)
          .set({ role: input.role, permissions: mapPermissions(input.role), updatedAt: new Date() })
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, input.userId)))

        return c.json({ ok: true })
      }),

    removeMember: privateProcedure
      .input(removeMemberInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const isSelf = input.userId === meId
        const allowed = isSelf || me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        if (input.userId === ws.ownerId) throw new HTTPException(403, { message: "Owner cannot leave" })
        const [u] = await ctx.db
          .select({ email: user.email })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1)
        await ctx.db
          .delete(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, input.userId)))
        if (u?.email) {
          try {
            await ctx.db.delete(workspaceInvite).where(and(eq(workspaceInvite.workspaceId, ws.id), eq(workspaceInvite.email, u.email)))
          } catch {}
        }

        return c.json({ ok: true })
      }),

    acceptInvite: privateProcedure
      .input(acceptInviteInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [inv] = await ctx.db
          .select({ id: workspaceInvite.id, workspaceId: workspaceInvite.workspaceId, email: workspaceInvite.email, role: workspaceInvite.role, expiresAt: workspaceInvite.expiresAt, acceptedAt: workspaceInvite.acceptedAt })
          .from(workspaceInvite)
          .where(eq(workspaceInvite.token, input.token))
          .limit(1)
        if (!inv) throw new HTTPException(404, { message: "Invalid invite" })
        if (inv.acceptedAt) return c.json({ ok: false })
        if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) throw new HTTPException(410, { message: "Invite expired" })

        const me = ctx.session.user
        if (!me?.email || me.email.toLowerCase() !== inv.email.toLowerCase()) throw new HTTPException(403, { message: "Email mismatch" })

        const [existing] = await ctx.db
          .select({ id: workspaceMember.id })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, inv.workspaceId), eq(workspaceMember.userId, me.id)))
          .limit(1)
        if (!existing) {
          await ctx.db.insert(workspaceMember).values({
            workspaceId: inv.workspaceId,
            userId: me.id,
            role: inv.role,
            permissions: mapPermissions(inv.role as any),
            joinedAt: new Date(),
          })
        }

        await ctx.db
          .update(workspaceInvite)
          .set({ acceptedAt: new Date() })
          .where(eq(workspaceInvite.id, inv.id))

        return c.json({ ok: true })
      }),

    addExisting: privateProcedure
      .input(addExistingMemberInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [u] = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, input.email.trim().toLowerCase()))
          .limit(1)

        if (u?.id) {
          const [existing] = await ctx.db
            .select({ id: workspaceMember.id })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, u.id)))
            .limit(1)
          if (!existing) {
            await ctx.db.insert(workspaceMember).values({
              workspaceId: ws.id,
              userId: u.id,
              role: input.role,
              permissions: mapPermissions(input.role),
              joinedAt: new Date(),
            })
          }
          return c.json({ ok: true, invited: false })
        }

        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await ctx.db.insert(workspaceInvite).values({
          workspaceId: ws.id,
          email: input.email.trim().toLowerCase(),
          role: input.role,
          invitedBy: meId,
          token,
          expiresAt: expires,
        })
        return c.json({ ok: true, invited: true, token })
      }),
  })
}
