## Problem
On refresh with filters active, the UI sometimes shows the older summary instead of the new top‑center anchored chips bar.

## Cause
The `FilterSummary` is mounted inside `WorkspaceHeader` and behind conditional logic (`show`). If that component path renders differently or briefly returns null, the anchored bar isn’t mounted at refresh and you see the older layout fallback.

## Fix
1. Mount `FilterSummary` at the workspace layout level so it’s always present whenever you’re in a workspace page.
2. Remove `FilterSummary` from `WorkspaceHeader` to prevent duplicate mounts and any conditional hiding.
3. Keep `FilterSummary`’s own visibility check (`count > 0`) so it only renders when filters are active.

## Files to Update
- Edit `src/app/workspaces/[slug]/layout.tsx`: import and render `<FilterSummary />` once in `<main>`.
- Edit `src/components/global/WorkspaceHeader.tsx`: remove the `FilterSummary` import and render.

## Verification
- Navigate to Requests with filters applied and refresh; the anchored chips bar remains visible and centered.
- Confirm no duplicate bars appear; clearing and removing chips still updates the URL properly.

Shall proceed with moving the mount point and cleaning up the header reference.