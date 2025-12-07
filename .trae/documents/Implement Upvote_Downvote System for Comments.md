I will implement a simple upvote/downvote system for comments, replacing the existing complex reaction system.

### 1. Database Schema Update
**File:** `packages/db/schema/comment.ts`
- Update `commentReaction` table: Change `type` enum from `["like", "love", ...]` to `["upvote", "downvote"]`.
- Update `comment` table: Add `downvotes` column (integer, default 0).

### 2. API Validation Update
**File:** `packages/api/src/validators/comment.ts`
- Rename `upvoteCommentInputSchema` to `voteCommentInputSchema`.
- Add `voteType` field: `z.enum(["upvote", "downvote"])`.

### 3. API Router Update
**File:** `packages/api/src/router/comment.ts`
- **List Procedure:**
  - Include `downvotes` in the selection.
  - Return `userVote` ("upvote" | "downvote" | null) instead of `hasVoted`.
- **Vote Procedure (Renamed from `upvote`):**
  - Accept `voteType` input.
  - Logic:
    - **Toggle Off:** If user clicks the same vote type, remove the reaction and decrement count.
    - **New Vote:** If no existing vote, add reaction and increment count.
    - **Switch Vote:** If user has a different vote type, remove old reaction (decrement old count), add new reaction (increment new count).

### 4. Frontend Update
**File:** `apps/feed/src/components/comments/CommentVote.tsx`
- Replace `Heart` icon with `ThumbsUp` and `ThumbsDown` from `lucide-react`.
- Update state to track `userVote` (type) and both `upvotes`/`downvotes` counts.
- Implement handlers for both buttons to call the new `vote` API.
- Display the vote score (Upvotes - Downvotes) or separate counts based on simple design.

**File:** `apps/feed/src/components/comments/CommentItem.tsx` (if necessary)
- Pass `downvotes` and `userVote` props to `CommentVote`.
