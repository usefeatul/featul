I will implement the "Create Post" feature in the sidebar.

1. **Modify** **`usePostSubmission.ts`**:

   * Update the hook to accept an optional `redirect` callback or `redirectPath` to handle the custom redirection logic requested (to `/workspaces/[slug]/requests/`).

   * This ensures we can reuse the existing submission logic while changing the post-submission behavior.

2. **Create** **`CreatePostModal.tsx`**:

   * Create a new component at `apps/feed/src/components/post/CreatePostModal.tsx`.

   * This modal will:

     * Use the `Dialog` component for the UI.

     * Integrate `PostHeader`, `PostContent`, and `PostFooter` components.

     * Fetch the available boards for the workspace.

     * Handle the form state (title, content, selected board).

     * Use the updated `usePostSubmission` hook to submit the post and redirect to the request detail page upon success.

3. **Update** **`Sidebar.tsx`**:

   * Modify `apps/feed/src/components/sidebar/Sidebar.tsx`.

   * Add a "Create Post" button (using `Button` and a `Plus` icon) prominently in the sidebar.

   * Add state to manage the open/closed status of the `CreatePostModal`.

   * Render the `CreatePostModal` when the button is clicked.

