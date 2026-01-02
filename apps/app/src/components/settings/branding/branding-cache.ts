import type { QueryClient } from "@tanstack/react-query"
import type { Ws } from "@/components/sidebar/useWorkspaceSwitcher"

export type WorkspacesQueryResult = Ws[] | { workspaces: Ws[] }

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
