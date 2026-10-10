import { randomUUID } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { db, workspace } from "@featul/db"
import { mapPermissions, type Role } from "../shared/permissions"

type Membership = {
  workspaceId: string
  userId: string
  email: string
  role: Role
  maxMembers: number | null
  inviteToken?: string
}

/** Serialize capacity checks and activation, and consume invitations atomically. */
export async function activateMembership(database: typeof db, input: Membership) {
  const { workspaceId, userId, email, role, maxMembers, inviteToken } = input
  const eligibility = inviteToken
    ? sql`select role from workspace_invite where workspace_id = ${workspaceId}
        and token = ${inviteToken} and lower(email) = lower(${email})
        and accepted_at is null and expires_at > now()`
    : sql`select ${role}::text as role`
  const result = await database.batch([
    // A separate statement gives waiting transactions a fresh READ COMMITTED
    // snapshot for the count after the preceding activation has committed.
    database.select({ id: workspace.id }).from(workspace).where(eq(workspace.id, workspaceId)).for("update"),
    database.execute(sql`
      with eligible as (${eligibility}), activated as (
        insert into workspace_member (id, workspace_id, user_id, role, permissions, joined_at, is_active)
        select ${randomUUID()}, ${workspaceId}, ${userId}, eligible.role,
          case eligible.role
            when 'admin' then ${JSON.stringify(mapPermissions("admin"))}::json
            when 'member' then ${JSON.stringify(mapPermissions("member"))}::json
            else ${JSON.stringify(mapPermissions("viewer"))}::json end,
          now(), true
        from eligible
        where ${maxMembers}::integer is null
          or (select count(*) from workspace_member where workspace_id = ${workspaceId} and is_active) < ${maxMembers}::integer
          or exists (select 1 from workspace_member where workspace_id = ${workspaceId} and user_id = ${userId} and is_active)
        on conflict (workspace_id, user_id) do update set
          role = case when workspace_member.is_active then workspace_member.role else excluded.role end,
          permissions = case when workspace_member.is_active then workspace_member.permissions else excluded.permissions end,
          is_active = true, joined_at = coalesce(workspace_member.joined_at, now()), updated_at = now()
        returning id
      ), consumed as (
        delete from workspace_invite where workspace_id = ${workspaceId}
          and lower(email) = lower(${email}) and accepted_at is null
          and exists (select 1 from activated)
      ) select id from activated
    `),
  ])
  return result[1].rows.length > 0
}
