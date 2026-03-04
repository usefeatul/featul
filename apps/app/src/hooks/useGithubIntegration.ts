"use client"

import { useState, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"

export type GithubConnectionState = {
  id: string
  installationId: string
  repositoryId: string
  repositoryName: string
  repositoryOwner: string
  repositoryFullName: string
  targetBoardId: string | null
  labelAllowlist: string[]
  statusLabelMap: Record<string, string>
  isActive: boolean
  lastSyncAt: Date | string | null
  createdAt: Date | string
}

export type GithubRepository = {
  id: string
  name: string
  fullName: string
  owner: string
  private: boolean
}

export type GithubSuggestionItem = {
  id: string
  postId: string
  issueId: string
  issueNumber: string
  issueUrl: string
  issueState: string
  issueLabels: string[]
  suggestedRoadmapStatus: string | null
  suggestionConfidence: number | null
  suggestionReason: string | null
  suggestionState: "pending" | "accepted" | "rejected"
  suggestedAt: Date | string | null
  hasContentConflict: boolean
  postTitle: string
  postRoadmapStatus: string | null
  postSlug: string
}

export type GithubSyncResult = {
  ok: boolean
  mode: "backfill" | "incremental"
  nextCursor: string | null
  processed: number
  created: number
  updated: number
  skipped: number
  suggested: number
  conflicts: number
}

type Props = {
  workspaceSlug: string
}

export function useGithubIntegration({ workspaceSlug }: Props) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [repositories, setRepositories] = useState<GithubRepository[]>([])

  const connectionQuery = useQuery({
    queryKey: ["github-connection", workspaceSlug],
    queryFn: async () => {
      const res = await client.integration.githubConnectionGet.$get({ workspaceSlug })
      if (!res.ok) {
        throw new Error("Failed to load GitHub integration")
      }
      return await res.json()
    },
    staleTime: 30_000,
  })

  const suggestionsQuery = useQuery({
    queryKey: ["github-suggestions", workspaceSlug],
    queryFn: async () => {
      const res = await client.integration.githubSuggestionsList.$get({
        workspaceSlug,
        state: "pending",
        limit: 50,
      })
      if (!res.ok) {
        return { suggestions: [] as GithubSuggestionItem[] }
      }
      return await res.json()
    },
    staleTime: 10_000,
  })

  const connection = (connectionQuery.data?.connection || null) as GithubConnectionState | null
  const suggestions = (suggestionsQuery.data?.suggestions || []) as GithubSuggestionItem[]
  const pendingSuggestions = Number(connectionQuery.data?.pendingSuggestions || 0)
  const configured = Boolean(connectionQuery.data?.configured)

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["github-connection", workspaceSlug] }),
      queryClient.invalidateQueries({ queryKey: ["github-suggestions", workspaceSlug] }),
      queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
    ])
  }

  const startConnect = async (): Promise<void> => {
    startTransition(async () => {
      try {
        const res = await client.integration.githubConnectStart.$post({ workspaceSlug })
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          toast.error((payload as { message?: string })?.message || "Failed to start GitHub connect")
          return
        }
        const data = await res.json()
        const url = String((data as { url?: string }).url || "")
        if (!url) {
          toast.error("GitHub install URL was missing")
          return
        }
        window.location.href = url
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to start GitHub connect")
      }
    })
  }

  const completeConnection = async (installationId: string, state?: string): Promise<GithubRepository[]> => {
    const res = await client.integration.githubConnectionComplete.$post({
      workspaceSlug,
      installationId,
      state: state || undefined,
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error((payload as { message?: string })?.message || "Failed to complete GitHub connection")
    }

    const data = await res.json()
    const repos = ((data as { repositories?: GithubRepository[] })?.repositories || []) as GithubRepository[]
    setRepositories(repos)
    await refresh()
    return repos
  }

  const selectRepo = async (input: {
    installationId: string
    repositoryId: string
    repositoryName: string
    repositoryOwner: string
    repositoryFullName: string
    labelAllowlist: string[]
    statusLabelMap?: Record<string, string>
  }): Promise<boolean> => {
    try {
      const res = await client.integration.githubSelectRepo.$post({
        workspaceSlug,
        ...input,
        statusLabelMap: input.statusLabelMap || {},
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        toast.error((payload as { message?: string })?.message || "Failed to save repository configuration")
        return false
      }
      toast.success("GitHub repository connected")
      await refresh()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save repository configuration")
      return false
    }
  }

  const syncNow = async (mode: "backfill" | "incremental", cursor?: string): Promise<GithubSyncResult> => {
    const res = await client.integration.githubSyncNow.$post({
      workspaceSlug,
      mode,
      cursor,
      limit: 30,
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error((payload as { message?: string })?.message || "Sync failed")
    }
    const data = (await res.json()) as GithubSyncResult
    await refresh()
    return data
  }

  const runInitialBackfill = async (): Promise<GithubSyncResult> => {
    let cursor: string | undefined
    const totals: GithubSyncResult = {
      ok: true,
      mode: "backfill",
      nextCursor: null,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      suggested: 0,
      conflicts: 0,
    }

    while (true) {
      const step = await syncNow("backfill", cursor)
      totals.processed += Number(step.processed || 0)
      totals.created += Number(step.created || 0)
      totals.updated += Number(step.updated || 0)
      totals.skipped += Number(step.skipped || 0)
      totals.suggested += Number(step.suggested || 0)
      totals.conflicts += Number(step.conflicts || 0)
      totals.nextCursor = step.nextCursor || null

      if (!step.nextCursor) break
      cursor = step.nextCursor
    }

    return totals
  }

  const applySuggestion = async (issueLinkId: string, action: "accept" | "reject"): Promise<boolean> => {
    try {
      const res = await client.integration.githubSuggestionApply.$post({
        workspaceSlug,
        issueLinkId,
        action,
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        toast.error((payload as { message?: string })?.message || "Failed to apply suggestion")
        return false
      }
      toast.success(action === "accept" ? "Suggestion accepted" : "Suggestion rejected")
      await refresh()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply suggestion")
      return false
    }
  }

  const disconnect = async (): Promise<boolean> => {
    try {
      const res = await client.integration.githubDisconnect.$post({ workspaceSlug })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        toast.error((payload as { message?: string })?.message || "Failed to disconnect GitHub")
        return false
      }
      setRepositories([])
      toast.success("GitHub integration disconnected")
      await refresh()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect GitHub")
      return false
    }
  }

  return {
    configured,
    connection,
    repositories,
    suggestions,
    pendingSuggestions,
    isLoading: connectionQuery.isLoading,
    isSuggestionsLoading: suggestionsQuery.isLoading,
    isPending,
    startConnect,
    completeConnection,
    selectRepo,
    syncNow,
    runInitialBackfill,
    applySuggestion,
    disconnect,
    refresh,
  }
}
