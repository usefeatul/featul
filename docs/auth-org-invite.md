# Auth: Organization & Invites

## Organization (Workspace) handling

- Server enables org support with Better Auth plugin: `packages/auth/src/auth.ts:46`.
- React client exposes org helpers: `packages/auth/src/client.ts:13`, `packages/auth/src/client.ts:25-28`.
- Set active workspace (server): `packages/auth/src/workspace.ts:5-12` using `auth.api.setActiveOrganization`.
- Set active workspace (client): `packages/auth/src/workspace.ts:14-18` using `authClient.organization.setActive`.
- Middleware redirects based on session and last workspace: `apps/feed/src/middleware/auth.ts:5-22`, `apps/feed/src/middleware/auth.ts:27-45`, `apps/feed/src/middleware/auth.ts:47-58`.

## Invite lifecycle

1. Create invite (admins/managers/owner only): `packages/api/src/router/team.ts:133-190`.
   - Enforces plan member limits: `packages/api/src/router/team.ts:151-158`.
   - Writes `workspace_invite` with `token` and `expiresAt`: `packages/api/src/router/team.ts:162-169`.
   - Sends email: `packages/auth/src/email.ts:18-22`.

2. List pending invites: `packages/api/src/router/team.ts:192-226` (not expired, not accepted).

3. Revoke invite: `packages/api/src/router/team.ts:228-256`.

4. Accept invite: `packages/api/src/router/team.ts:324-372`.
   - Validates token, email match, expiry.
   - Enforces plan limits again: `packages/api/src/router/team.ts:345-356`.
   - Inserts membership into `workspace_member`: `packages/api/src/router/team.ts:357-364`.
   - Marks invite accepted: `packages/api/src/router/team.ts:366-371`.

5. Decline invite: `packages/api/src/router/team.ts:374-390`.

6. Invite landing UI: `apps/feed/src/components/invite/Invite.tsx:51-92` loads session+invite; redirects to sign-in if needed.
   - Accept: `apps/feed/src/components/invite/Invite.tsx:98-126` then route to the workspace.
   - Decline: `apps/feed/src/components/invite/Invite.tsx:128-141` then route to `/start`.

## Data models

- `workspace_member`: roles and permissions map — `packages/db/schema/workspace.ts:61-106`.
- `workspace_invite`: tokenized email invites — `packages/db/schema/workspace.ts:108-135`.
- `workspace`: core workspace record — `packages/db/schema/workspace.ts:4-31`.

## Team UI (management)

- Members + invites list: `apps/feed/src/components/settings/team/Team.tsx:28-39`, `apps/feed/src/components/settings/team/Team.tsx:118-121`.
- Invite member modal: `apps/feed/src/components/settings/team/InviteMemberModal.tsx:23-43`.

## Notes

- Permissions are derived from role via `mapPermissions`: `packages/api/src/router/team.ts:18-47`.
- Plan limits enforced in team routes via `getPlanLimits`: `packages/api/src/router/team.ts:151-158`, `packages/api/src/router/team.ts:350-356`.
 - Centralized role→permissions mapping: `packages/api/src/shared/permissions.ts` and used in team routes.

## Endpoints summary (team router)

- `membersByWorkspaceSlug` GET — input `slug`; returns active members and pending invites. `packages/api/src/router/team.ts:51-131`
- `invite` POST — input `slug`, `email`, `role`; creates token and emails invite. `packages/api/src/router/team.ts:133-190`
- `listInvites` GET — input `slug`; lists unexpired, unaccepted invites. `packages/api/src/router/team.ts:192-226`
- `revokeInvite` POST — input `slug`, `inviteId`; deletes invite. `packages/api/src/router/team.ts:228-256`
- `updateRole` POST — input `slug`, `userId`, `role`; updates member role. `packages/api/src/router/team.ts:258-284`
- `removeMember` POST — input `slug`, `userId`; removes member and related invites. `packages/api/src/router/team.ts:286-322`
- `acceptInvite` POST — input `token`; validates and inserts membership. `packages/api/src/router/team.ts:324-372`
- `declineInvite` POST — input `token`; deletes invite. `packages/api/src/router/team.ts:374-390`
- `inviteByToken` GET — input `token`; returns display info for invite page. `packages/api/src/router/team.ts:392-417`

## Organization plugin and invites

- We DO use Better Auth’s organization plugin to manage active workspace context and client helpers:
  - Server enables it: `packages/auth/src/auth.ts:46`.
  - Client wires it: `packages/auth/src/client.ts:13`, helpers exported `packages/auth/src/client.ts:25-28`.
- Inviting members is NOT handled by the Better Auth organization plugin; it is implemented in our API using `workspace_invite` and `workspace_member`:
  - Create/accept/decline/revoke invite logic lives in `packages/api/src/router/team.ts:133-190`, `packages/api/src/router/team.ts:324-372`, `packages/api/src/router/team.ts:374-390`, `packages/api/src/router/team.ts:228-256`.
- After a user accepts an invite and becomes a member, you can set the active workspace using the org plugin:
  - Server-side: `packages/auth/src/workspace.ts:5-12`.
  - Client-side (recommended after accept): `packages/auth/src/workspace.ts:14-18`.
  - Example flow: accept invite → fetch `workspace.slug` → call `authClient.organization.setActive({ organizationSlug: slug })` → navigate to `/workspaces/:slug`.
