I have analyzed the codebase and identified the necessary changes to support usernames with spaces in mentions. The changes span both the frontend (for detection and rendering) and the backend (for parsing and persistence).

### Plan

#### 1. Frontend: Update Mention Detection Logic
**File:** `apps/feed/src/components/comments/CommentForm.tsx`
- Modify the mention trigger regex in the `onChange` handler.
- Update `const valid = /^[A-Za-z0-9._-]*$/.test(after)` to include `\s` (whitespace).
- **Goal:** Allow the mention suggestions list to remain open and filter correctly while the user types a name containing spaces (e.g., "@John Daly").

#### 2. Frontend: Improve Mention Rendering
**File:** `apps/feed/src/components/comments/CommentItem.tsx`
- Update `renderContent` to sort the mentions list by length (descending) before creating the highlighting RegExp.
- **Goal:** Ensure that if both "John" and "John Daly" are valid users, "@John Daly" is highlighted as a single entity rather than just "@John".

#### 3. Backend: enhance Mention Parsing
**File:** `packages/api/src/router/comment.ts`
- In the `create` procedure, replace the current regex-based mention extraction (which assumes no spaces) with a more robust approach:
    1. Check if the content contains an "@" symbol.
    2. If yes, fetch all active workspace members.
    3. Construct a regex pattern from the member names (sorted by length descending to prioritize longest matches).
    4. Match the content against this pattern to identify mentioned users.
- **Goal:** Correctly identify and store mentions for users with spaces in their names, ensuring notifications and metadata are generated accurately.
