## Overview
- Add a new sidebar nav item "Members" under each workspace.
- Implement a list page that shows members with avatar, role badge, and joined date + search.
- Implement a member detail page with Activity timeline, Stats (posts, comments, upvotes), and Top Posts.
- Reuse existing team router and UI primitives; add focused endpoints for stats/activity.

## Data Model
- v1: Derive activity and stats from existing tables; no new tables required.
  - Posts: `post`, `post_update`, `post_merge`.
  - Comments: `comment`, `comment_reaction`.
  - Votes: `vote`.
- v2 (optional, for full fidelity): Add `activity_log` table to capture deletes, status changes, moderation with consistent event shapes.

## API Changes
- Reuse members list: `packages/api/src/router/team.ts:95` `membersByWorkspaceSlug.get`.
- Create `member` router (new file) with:
  - `member.statsByWorkspaceSlug.get({ slug, userId })` → `{ posts, comments, upvotes }`.
    - Posts: count of `post` where `authorId=userId` and `board.workspaceId=ws.id`.
    - Comments: count of `comment` by `userId` joined via `post->board->workspace`.
    - Upvotes: count of `vote` by `userId` across posts/comments scoped to workspace.
    - Also return `topPosts`: top 5 posts created by this user sorted by `post.upvotes`.
  - `member.activityByWorkspaceSlug.get({ slug, userId, cursor? })` → paginated normalized events:
    - `post_created` from `post.createdAt`.
    - `post_updated` from `post_update.createdAt`.
    - `post_merged` from `post_merge.createdAt`.
    - `comment_created` from `comment.createdAt`.
    - `comment_edited` from `comment.editedAt` where `isEdited=true`.
    - `vote_post` / `vote_comment` from `vote.createdAt`.
  - Input validation in `packages/api/src/validators/member.ts` using Zod.
  - Access control: only members of the workspace (reuse pattern in `team.membersByWorkspaceSlug`).

## UI: Sidebar Integration
- Update `apps/feed/src/config/nav.ts:45` in `buildMiddleNav` to include `{ label: "Members", href: w(slug, "/members"), icon: SettingIcon }` (or a dedicated member icon if available).
- Sidebar and mobile sidebar automatically pick up the new item via `useWorkspaceNav` (`apps/feed/src/hooks/useWorkspaceNav.ts:45`).

## UI: Members List Page
- New route: `apps/feed/src/app/workspaces/[slug]/members/page.tsx`.
- Server component loads initial members via `client.team.membersByWorkspaceSlug.get`.
- Client component `MemberList` (new) renders:
  - Columns: Member, Role (badge from `components/settings/team/role-badge.tsx`), Joined (format `joinedAt`).
  - Avatar from `@oreilla/ui/components/avatar`; initials via `utils/user-utils.ts:getInitials`.
  - Search input filtering by name/email.
  - Clicking a row navigates to `/workspaces/[slug]/members/[userId]`.

## UI: Member Detail Page
- New route: `apps/feed/src/app/workspaces/[slug]/members/[userId]/page.tsx`.
- Header: avatar, name, email, RoleBadge, "Joined <date>".
- Right column: `MemberStats` (new) showing totals and `TopPosts` list.
- Left column: `MemberActivity` (new) timeline using grouped events by day with icons per type.
- Data loading via React Query:
  - `client.member.statsByWorkspaceSlug.get({ slug, userId })`.
  - `client.member.activityByWorkspaceSlug.get({ slug, userId, cursor })` with infinite scroll.

## Activity Event Shape
- Standard item: `{ id, type, title, entity, entityId, url, createdAt, meta }`.
- Titles examples:
  - `Changed status to In Progress on <post title>` (v2 when activity_log exists).
  - `Created post <title>`, `Updated post <title>`, `Merged <source> → <target>`, `Commented on <title>`, `Upvoted <title>`.

## Permissions & Security
- Gate both pages to workspace members using the same checks as `team.membersByWorkspaceSlug` (`packages/api/src/router/team.ts:107-115`).
- Avoid exposing emails for anonymous users; respect `isAnonymous` flags in posts/comments.

## Performance
- Use indexed joins already present in schema (`post_board_id_idx`, `post_created_at_idx`) for efficient queries.
- Paginate activity (limit 20, cursor-based on `createdAt` descending).
- Cache short-lived responses with `Cache-Control` headers like `team.membersByWorkspaceSlug` (`packages/api/src/router/team.ts:184`).

## Testing
- Add API tests for stats counts and activity pagination.
- Add UI tests: list rendering, search, navigation to detail, infinite scroll.

## Rollout
- Step 1: Add nav + list page wired to existing router; visual verification.
- Step 2: Add `member` router endpoints; hook up detail page.
- Step 3: Polish timeline, icons, and empty states; ship.
