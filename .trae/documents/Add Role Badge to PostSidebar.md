I will add the role badge to the `PostSidebar` component, ensuring it displays the star icon for workspace members and owners, consistent with other parts of the application.

### Plan:

1.  **Update `apps/feed/src/components/subdomain/PostSidebar.tsx`**
    *   Import `RoleBadge` from `../comments/RoleBadge`.
    *   Update `PostSidebarProps` to include `role` ("admin" | "member" | "viewer") and `isOwner` (boolean) in the `post` object definition.
    *   Update the `Avatar` component within the "Author" section:
        *   Increase size to `size-8` (from `size-5`) to match the updated design.
        *   Add `className="relative overflow-visible"` to `Avatar`.
        *   Add `className="text-xs bg-muted text-muted-foreground"` to `AvatarFallback`.
        *   Insert the `<RoleBadge />` component, passing `post.role` and `post.isOwner`.

2.  **Verification**
    *   Since I have already updated the data fetching logic in the previous step to include `role` and `isOwner` in the post data, no further backend changes are needed. The `PostSidebar` receives the full `post` object, so these new properties will be available.
