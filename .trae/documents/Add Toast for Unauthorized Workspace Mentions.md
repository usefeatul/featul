I will implement a toast message for when a user (who is signed in but not a member of the workspace) tries to mention someone.

### Backend Verification
- The `membersByWorkspaceSlug` endpoint (called in `CommentForm.tsx` lines 230-235) likely returns a 403 or 401 if the user doesn't have access to list members.
- However, the `client.team.membersByWorkspaceSlug` call is wrapped in a `try/catch` block (line 229-236) which currently swallows errors.

### Frontend Changes
**File:** `apps/feed/src/components/comments/CommentForm.tsx`
- Modify the error handling in the `membersByWorkspaceSlug` fetch:
    - Capture the response status.
    - If `res.status === 403`, display `toast.error("You must be a member of this workspace to mention users")`.
    - If `res.status === 401`, display `toast.error("Please sign in to mention users")` (though this is partly covered by the earlier session check, the API call might fail if the session is invalid).

I will update the code to handle these specific error cases instead of silently failing.