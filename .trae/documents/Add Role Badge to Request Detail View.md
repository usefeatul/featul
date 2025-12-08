I will update the codebase to ensure the star badge (indicating workspace role) appears on the author's avatar in the request detail view, consistent with the `PostCard` and comments.

The `PostCard` component already appears to include the `<RoleBadge />` logic. I will focus on adding this support to the request detail view (`RequestContent`), which is currently missing it.

### Plan:

1.  **Update Type Definitions**
    *   Modify `apps/feed/src/types/subdomain.ts`:
        *   Update `SubdomainRequestDetailData` to include optional `role` ("admin" | "member" | "viewer") and `isOwner` (boolean) fields, matching the structure used in `RequestItemData`.

2.  **Update Request Detail Component**
    *   Modify `apps/feed/src/components/subdomain/request-detail/RequestContent.tsx`:
        *   Import `RoleBadge` from `../../comments/RoleBadge`.
        *   In the `Avatar` component (within the footer section), add the `<RoleBadge />` component, passing `post.role` and `post.isOwner`.

3.  **Verification**
    *   I will verify that `PostCard.tsx` is correctly set up (which it appears to be) and ensure `RequestContent.tsx` now matches that behavior.
