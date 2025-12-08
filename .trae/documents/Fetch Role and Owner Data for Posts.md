I will update the data fetching logic to ensure user roles (`admin`, `member`, `viewer`) and ownership status (`isOwner`) are retrieved from the database and passed to the frontend components.

### Plan:

1.  **Update `getWorkspaceBySlug` in `apps/feed/src/lib/workspace.ts`**
    *   Modify the function to also select and return `ownerId` from the `workspace` table. This is required to determine if a post author is the workspace owner.

2.  **Update `getWorkspacePosts` in `apps/feed/src/lib/workspace.ts`**
    *   Modify the `db.select` query to:
        *   `leftJoin` the `workspaceMember` table on `workspaceMember.userId = post.authorId` AND `workspaceMember.workspaceId = ws.id`.
        *   Select the `role` column from `workspaceMember`.
    *   Update the returned object map to include:
        *   `role`: The fetched role.
        *   `isOwner`: Boolean check `post.authorId === ws.ownerId`.

3.  **Update Post Detail Page (`apps/feed/src/app/[subdomain]/board/p/[slug]/page.tsx`)**
    *   Update the initial workspace query to include `ownerId`.
    *   Update the post query to:
        *   `leftJoin` `workspaceMember` on `userId` and `workspaceId`.
        *   Select `role: workspaceMember.role` and `authorId: post.authorId`.
    *   Pass `role` and `isOwner` (calculated as `p.authorId === ws.ownerId`) to the `SubdomainRequestDetail` component.

4.  **Verification**
    *   This ensures that both the list view (powered by `getWorkspacePosts`) and the detail view (powered by the page's custom query) have the necessary data to render the `RoleBadge` I previously implemented.
