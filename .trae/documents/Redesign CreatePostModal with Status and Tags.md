I will redesign the `CreatePostModal` in `apps/feed/src/components/post/CreatePostModal.tsx` to include Roadmap Status and Tags selection.

Here is the plan:

### 1. Backend Updates
- **Update Validator (`packages/api/src/validators/post.ts`)**:
  - Update `createPostSchema` to include optional `roadmapStatus` and `tags` (array of strings).
- **Update Router (`packages/api/src/router/post.ts`)**:
  - Modify the `create` procedure to handle the new fields.
  - Save `roadmapStatus` to the post.
  - Insert tag associations into the `post_tag` table if tags are provided.

### 2. Frontend Updates
- **Update `usePostSubmission` Hook (`apps/feed/src/hooks/usePostSubmission.ts`)**:
  - Update `submitPost` function to accept `tags` and `roadmapStatus`.
  - Pass these values to the API creation call.
- **Update `CreatePostModal` (`apps/feed/src/components/post/CreatePostModal.tsx`)**:
  - **State Management**: Add local state for `selectedStatus` (defaulting to 'pending') and `selectedTags` (array).
  - **Data Fetching**: Fetch available tags for the workspace using `client.board.tagsByWorkspaceSlug`.
  - **UI Implementation**:
    - Add a **Status Popover**: A dropdown to select the roadmap status (Pending, Planned, In Progress, etc.).
    - Add a **Tags Popover**: A multi-select dropdown to choose tags from the workspace.
    - Position these new fields clearly between the content area and the footer.
  - **Submission**: Pass the selected status and tags to the `submitPost` function.

I will implement these changes ensuring the UI matches the existing design system (Popovers, Buttons).