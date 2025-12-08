I will update the avatar design in `PostCard.tsx` and `RequestContent.tsx` to match the style used in `CommentItem.tsx`, ensuring the role badge (star) appears correctly.

### Plan:

1.  **Update `apps/feed/src/components/subdomain/PostCard.tsx`**
    *   Change the `Avatar` component's className to `"size-8 relative overflow-visible"` (increasing size from 6 to 8 and removing explicit border/background to match comments).
    *   Add `className="text-xs bg-muted text-muted-foreground"` to `AvatarFallback`.

2.  **Update `apps/feed/src/components/subdomain/request-detail/RequestContent.tsx`**
    *   Change the `Avatar` component's className to `"size-8 relative overflow-visible"`.
    *   Add `className="text-xs bg-muted text-muted-foreground"` to `AvatarFallback`.

3.  **Verification**
    *   This will align the user profile and role badge presentation across the post list, post detail, and comments sections.
