# Implementation Plan - Comprehensive Pagination System

I will implement the pagination system by ensuring the "Next/Prev" post navigation in the Detail view mirrors the filtered list order from the List view, using URL Search Params to maintain state.

## 1. Backend Logic (`apps/feed/src/lib/workspace.ts`)
- **Refactor**: Extract the filter construction logic from `getWorkspacePosts` into a reusable helper.
- **New Function**: `getPostNavigation(slug, currentPostId, opts)`
  - Accepts the same filter options as the list (`status`, `tag`, `board`, `order`, `search`).
  - Fetches the ordered list of Post IDs and Slugs matching the filters.
  - Finds the index of the `currentPostId`.
  - Returns `{ prev: { slug, title } | null, next: { slug, title } | null }`.
  - *Optimization*: Use a lightweight query selecting only `id` and `slug` to minimize overhead.

## 2. Reusable UI Component (`apps/feed/src/components/requests/RequestNavigation.tsx`)
- **Create**: A new component `RequestNavigation` to render the "Previous" and "Next" buttons.
  - **Design**: Symmetrical layout, specific icons (ArrowLeft/ArrowRight or Chevron), clear hover states.
  - **Props**: `prevHref`, `nextHref`, `prevLabel`, `nextLabel`, `onPrev`, `onNext`, `isLoading`.
  - **Accessibility**: `aria-label`, keyboard focus styles.

## 3. Shared Hook (`apps/feed/src/hooks/useRequestNavigation.ts`)
- **Create**: A custom hook to manage navigation state and URL params.
  - **Functionality**: 
    - wrappers for `useSearchParams` to preserve filters when generating links.
    - Keyboard shortcuts listener (e.g., ArrowLeft/ArrowRight or J/K) to trigger navigation.

## 4. Component Updates
### `RequestItem.tsx`
- Update the post link to append the current `searchParams`. This ensures that when a user clicks a post, the Detail view knows the context (e.g., "Sorted by Top Voted").

### `RequestPagination.tsx` (List View)
- Refactor to use the new `RequestNavigation` UI component for consistency.
- Maintain existing page-based logic but update visuals.

### `RequestDetail.tsx` (Detail View)
- Update to accept `prevPost` and `nextPost` props.
- Render `RequestNavigation` buttons at the top/bottom.
- Use `useRequestNavigation` to handle hotkeys and preserve filters in the "Back" or "Next" links.

### `[post]/page.tsx` (Server Page)
- Read `searchParams`.
- Call `getPostNavigation` with the slug, post ID, and search params.
- Pass the result to `RequestDetail`.

## 5. Testing
- **Unit Tests**: Create tests for `getPostNavigation` logic (mocking DB) or `useRequestNavigation` hook (testing param preservation).
- **Verification**: Verify UI states (hover, disabled at boundaries) and functional flow (List -> Detail -> Next Post -> List).

## 6. Edge Cases
- **Empty List**: Handled by existing `EmptyRequests`.
- **Boundaries**: `getPostNavigation` returns null; buttons become disabled or hidden.
- **Filter Preservation**: Handled by passing `searchParams` in links.
