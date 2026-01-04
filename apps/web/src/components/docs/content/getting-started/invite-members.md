---
title: Invite members
description: Bring your team into featul with roles and fine-grained permissions.
---

## Member model

Team access in featul is based on three main tables in `@featul/db/schema/workspace.ts`:

- `workspace` – the workspace itself.
- `workspace_member` – active members with roles and permissions.
- `workspace_invite` – pending invitations.

Each member is linked to a user account from the `user` table and to a workspace by `workspaceId`.

## Roles and permissions

Every member has a **role**:

- `admin`
- `member`
- `viewer`

On top of the role there is a `permissions` JSON field on `workspace_member` that can enable or disable capabilities:

- `canManageWorkspace`
- `canManageBilling`
- `canManageMembers`
- `canManageBoards`
- `canModerateAllBoards`
- `canConfigureBranding`

The UI uses these flags to decide which settings sections and actions to show for a given user.

## Inviting a new member

1. Open your workspace in the app.
2. Go to **Settings → Team** or the members section.
3. Click **Invite member**.
4. Enter the teammate’s email address.
5. Choose a **role** (admin, member, viewer).
6. Send the invite.

This creates a record in `workspace_invite` with:

- `workspaceId`
- `email`
- `role`
- `token`
- `expiresAt`

When the recipient accepts the invite:

- A corresponding `workspace_member` record is created.
- The invite is marked as accepted with `acceptedAt`.

## Managing membership

From the team settings page you can:

- Change a member’s role and permissions.
- Deactivate a member (sets `isActive = false`).
- Resend or revoke pending invites.

These actions are reflected directly in the `workspace_member` and `workspace_invite` tables and control what each user can see and do across boards, roadmap, and changelog.

