## Goal
Transform the current filter summary into a top‑center anchored chips bar that appears whenever filters are active. Each chip shows the active filter and can be removed individually; a clear‑all control resets everything.

## Current
- `src/components/requests/FilterSummary.tsx` renders a single “N filters” button that clears all.
- It is placed by `src/components/global/WorkspaceHeader.tsx` near the page title.

## Changes
1. Replace the summary UI with a fixed, top‑center anchored container:
   - `fixed top-2 left-1/2 -translate-x-1/2 z-40` with `bg-card border rounded-md  px-2 py-1`.
   - Horizontal list of chips; wraps on small screens; `overflow-x-auto` with gap.
2. Render one chip per active filter:
   - Status chips use labels from `StatusAction` options (e.g., Pending, Review, ...).
   - Board chips fetch board names via `client.board.byWorkspaceSlug.$get({ slug })` and map selected slugs to labels.
   - Tag chips fetch tag names via `client.board.tagsByWorkspaceSlug.$get({ slug })` and map selected slugs to labels.
   - Order chip appears when `order === "oldest"`.
3. Interactions:
   - Clicking a chip removes only that filter and updates the URL using `buildRequestsUrl` (for status/board/tag). Order chip sets order back to `newest`.
   - “Clear all” control resets to `workspaceBase(slug)`.
   - Preserve non‑removed filters and `page` param via `buildRequestsUrl` merging with current `SearchParams`.
4. Visibility:
   - Component returns `null` when no filters are active; otherwise it shows as an anchored overlay (not tied to header layout).
5. Accessibility:
   - Buttons have `aria-label`s, focus states, and are keyboard clickable.

## Files Updated
- Edit `src/components/requests/FilterSummary.tsx` only. No other code paths or styles changed.

## Edge Cases
- Missing labels while queries load: show slugs and replace with names when data arrives.
- Many chips: enable horizontal scroll with `max-w-[min(100vw-24px,900px)]` and `overflow-x-auto`.
- Mobile: use `top-2` spacing and wrapping; maintain high z-index.

## Verification
- Open a workspace Requests view, apply boards/tags/status/order filters.
- Confirm chips bar appears at the top center; each chip removes itself; clear‑all resets all.
- Validate behavior across reloads and mobile widths.

If this plan looks good, I’ll implement the anchored chips bar in `FilterSummary.tsx`. 