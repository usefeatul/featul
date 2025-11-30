## Diagnosis
- The workspace list and logo rely on React Query caches with long `staleTime` and no invalidation. After creating a workspace, `['workspaces']` remains “fresh” and is not refetched, so the dropdown misses the new entry until a full refresh. Similarly, branding updates only set a "live" logo in the branding store for the current workspace, but the dropdown renders logos from the cached `['workspaces']` list which is never mutated.

## Changes
### After Workspace Creation
- Update client caches immediately before navigating:
  - Add `useQueryClient` and set `['workspaces']` to include the newly created workspace.
  - Set `['workspace', createdSlug]` to the created object so the current logo/name render without waiting.
  - File: `apps/feed/src/components/wizard/Wizard.tsx`
    - Reference: creation handler at apps/feed/src/components/wizard/Wizard.tsx:81–109; insert cache updates after apps/feed/src/components/wizard/Wizard.tsx:100–103.

### After Branding Logo Change
- Mutate both the current workspace cache and the list cache so the dropdown reflects the new logo instantly:
  - Update `['workspace', slug]` with `logo`.
  - Update `['workspaces']` by mapping and replacing the matching `slug` entry’s `logo`.
  - File: `apps/feed/src/components/settings/branding/Branding.tsx`
    - Reference: save handler at apps/feed/src/components/settings/branding/Branding.tsx:89–139; extend logic near apps/feed/src/components/settings/branding/Branding.tsx:131 to also call `queryClient.setQueryData` for both keys.

### Optional Query Behavior Tweaks
- Consider enabling `refetchOnMount: true` or shortening `staleTime` for `['workspaces']` in `useWorkspaceSwitcher` to make page-to-page navigation more reactive.
  - File: `apps/feed/src/components/sidebar/useWorkspaceSwitcher.ts`
    - Reference: list query config at apps/feed/src/components/sidebar/useWorkspaceSwitcher.ts:22–34.
- Keep current behavior for `['workspace', slug]` but ensure we set initial cache on creation to avoid a blank logo.

## Verification
- Create a new workspace via the wizard and confirm:
  - The logo appears in the switcher immediately (no refresh).
  - The new workspace is listed in the dropdown.
- Upload a new logo in Branding and confirm:
  - Current workspace button updates.
  - Dropdown logo updates for the same workspace without refresh.

## Implementation Details
- Use `queryClient.setQueryData(['workspaces'], updater)` that supports both array and `{ workspaces }` shapes (same pattern as name update in apps/feed/src/components/settings/branding/Branding.tsx:111–119).
- Also call `queryClient.setQueryData(['workspace', slug], (prev) => prev ? { ...prev, logo } : prev)` to keep the single-workspace cache in sync.

If you approve, I will apply these changes and run a quick local validation.