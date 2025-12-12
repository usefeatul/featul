I will implement the similar posts search feature to surface related posts during creation.

### Backend Implementation
1.  **Define Validator**: Add `getSimilarSchema` in `packages/api/src/validators/post.ts` accepting `title` and `boardSlug`.
2.  **Add API Procedure**: Implement `getSimilar` in `packages/api/src/router/post.ts`.
    *   This will search for posts in the specified board where the title contains the search term (case-insensitive).
    *   It will limit results to 5 and return relevant fields (id, title, slug, upvotes, commentCount).

### Frontend Implementation
1.  **Create Utility Hook**: Add `apps/feed/src/hooks/useDebounce.ts` to debounce the title input and prevent excessive API calls.
2.  **Create UI Component**: Create `apps/feed/src/components/post/SimilarPosts.tsx`.
    *   This component will display the list of similar posts.
    *   It will link to the posts so users can check them.
3.  **Integrate in Modal**:
    *   Modify `apps/feed/src/components/subdomain/CreatePostModal.tsx` to:
        *   Use `useDebounce` on the `title` state.
        *   Fetch similar posts using the new API endpoint when the debounced title has sufficient length (e.g., > 2 chars).
        *   Pass the `similarPosts` data to `PostContent`.
4.  **Update Content View**: Modify `apps/feed/src/components/post/PostContent.tsx` to render the `SimilarPosts` component below the title input.
