import type { QueryClient } from "@tanstack/react-query"
import type { Ws } from "@/hooks/useWorkspaceSwitcher"

export type WorkspacesQueryResult = Ws[] | { workspaces: Ws[] }

/** Patch workspace name in slug and list caches. Supports array or `{ workspaces }`. */
export function updateWorkspaceNameInCache(queryClient: QueryClient, slug: string, name: string) {
  queryClient.setQueryData<Ws | null>(["workspace", slug], (prev) =>
    prev ? { ...prev, name } : prev,
  )
  queryClient.setQueryData<WorkspacesQueryResult>(["workspaces"], (prev) => {
    const list = Array.isArray(prev) ? prev : prev?.workspaces || []
    const next = list.map((w) => (w?.slug === slug ? { ...w, name } : w))
    return prev && "workspaces" in prev ? { ...prev, workspaces: next } : next
  })
}

/** Patch workspace logo in slug and list caches. Supports array or `{ workspaces }`. */
export function updateWorkspaceLogoInCache(queryClient: QueryClient, slug: string, logo: string) {
  queryClient.setQueryData<Ws | null>(["workspace", slug], (prev) =>
    prev ? { ...prev, logo } : prev,
  )
  queryClient.setQueryData<WorkspacesQueryResult>(["workspaces"], (prev) => {
    const list = Array.isArray(prev) ? prev : prev?.workspaces || []
    const next = list.map((w) => (w?.slug === slug ? { ...w, logo } : w))
    return prev && "workspaces" in prev ? { ...prev, workspaces: next } : next
  })
}
