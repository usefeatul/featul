The issue is that when a reply is submitted, the success callback is triggered in `CommentItem`, which attempts to call `onReplySuccess`. However, the `CommentThread` component (which renders `CommentItem`) does not pass the `onReplySuccess` prop. As a result, the comment list is not refreshed (re-fetched) after a reply is posted.

To fix this, I will pass the `onUpdate` function (which triggers a refetch in `CommentList`) to the `onReplySuccess` prop of `CommentItem` within `CommentThread.tsx`.

**Step-by-step implementation plan:**

1.  **Modify `apps/feed/src/components/comments/CommentThread.tsx`**:
    *   Locate the `ThreadItem` component.
    *   In the `CommentItem` usage, add the prop `onReplySuccess={onUpdate}`.

This ensures that when a reply is successfully posted, the `onUpdate` function (which is `handleCommentSuccess` from `CommentList`) is called, triggering a `refetch` of the comments query, thus updating the UI automatically.