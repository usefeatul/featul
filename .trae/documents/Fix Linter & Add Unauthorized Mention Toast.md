I will fix the linter error and implement the toast notification for unauthorized mentions.

### Backend Fix
**File:** `packages/api/src/router/comment.ts`
- Fix the linter error by explicitly typing the variable in `forEach` loop: `(v: { commentId: string })`.

### Frontend Updates
**File:** `apps/feed/src/components/comments/CommentList.tsx`
- Import `getBrowserFingerprint`.
- Fetch fingerprint on mount and pass it to the `comments` query.

**File:** `apps/feed/src/components/comments/CommentForm.tsx`
- Import `useSession` from `@feedgot/auth/client`.
- Check session status in the `onChange` handler for the textarea.
- If a user types `@` and is not logged in:
    - Prevent opening the mention list.
    - Display `toast.error("Please sign in to mention users")`.

I will execute these changes to ensure persistent upvotes for anonymous users and proper feedback for unauthorized actions.