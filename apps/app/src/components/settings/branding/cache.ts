import type { QueryClient } from "@tanstack/react-query"
import type { Ws } from "@/hooks/useWorkspaceSwitcher"
import { workspaceQueryKeys } from "@/lib/workspace/client"

export type WorkspacesQueryResult = Ws[] | { workspaces: Ws[] }

function asWorkspaceList(prev: WorkspacesQueryResult | undefined): Ws[] {
  if (Array.isArray(prev)) return prev
  if (prev && Array.isArray(prev.workspaces)) return prev.workspaces
  return []
}

function isWrappedList(
  prev: WorkspacesQueryResult | undefined,
): prev is { workspaces: Ws[] } {
  return Boolean(prev && !Array.isArray(prev) && "workspaces" in prev)
}

function patchWorkspace(
  queryClient: QueryClient,
  slug: string,
  patch: Partial<Pick<Ws, "name" | "logo">>,
) {
  queryClient.setQueryData<Ws | null>(workspaceQueryKeys.bySlug(slug), (prev) =>
    prev ? { ...prev, ...patch } : prev,
  )
  queryClient.setQueryData<WorkspacesQueryResult>(
    workspaceQueryKeys.list(),
    (prev) => {
      const list = asWorkspaceList(prev)
      const next = list.map((workspace) =>
        workspace?.slug === slug ? { ...workspace, ...patch } : workspace,
      )
      return isWrappedList(prev) ? { ...prev, workspaces: next } : next
    },
  )
}

/** Patch workspace name in slug and list caches. Supports array or `{ workspaces }`. */
export function updateWorkspaceNameInCache(
  queryClient: QueryClient,
  slug: string,
  name: string,
) {
  patchWorkspace(queryClient, slug, { name })
}

/** Patch workspace logo in slug and list caches. Supports array or `{ workspaces }`. */
export function updateWorkspaceLogoInCache(
  queryClient: QueryClient,
  slug: string,
  logo: string,
) {
  patchWorkspace(queryClient, slug, { logo })
}
