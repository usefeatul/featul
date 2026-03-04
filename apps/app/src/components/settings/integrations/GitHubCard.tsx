"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import SettingsCard from "../../global/SettingsCard"
import { Button } from "@featul/ui/components/button"
import GitHubIcon from "@featul/ui/icons/github"
import GitHubRepoPicker from "./GitHubRepoPicker"
import GitHubSuggestionQueue from "./GitHubSuggestionQueue"
import { useGithubIntegration } from "@/hooks/useGithubIntegration"

type Props = {
  slug: string
  disabled?: boolean
}

export default function GitHubCard({ slug, disabled = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    configured,
    connection,
    repositories,
    suggestions,
    pendingSuggestions,
    isLoading,
    isPending,
    startConnect,
    completeConnection,
    selectRepo,
    syncNow,
    runInitialBackfill,
    applySuggestion,
    disconnect,
  } = useGithubIntegration({ workspaceSlug: slug })

  const [repoPickerOpen, setRepoPickerOpen] = React.useState(false)
  const [repoPickerInstallationId, setRepoPickerInstallationId] = React.useState("")
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isBackfilling, setIsBackfilling] = React.useState(false)
  const [isApplying, setIsApplying] = React.useState(false)
  const [isDisconnecting, setIsDisconnecting] = React.useState(false)
  const [setupHandled, setSetupHandled] = React.useState(false)

  const installationIdFromQuery = String(searchParams.get("github_installation_id") || "").trim()
  const stateFromQuery = String(searchParams.get("github_state") || "").trim()

  React.useEffect(() => {
    if (setupHandled) return
    if (!installationIdFromQuery || !stateFromQuery) return

    let cancelled = false
    ;(async () => {
      try {
        const repos = await completeConnection(installationIdFromQuery, stateFromQuery)
        if (cancelled) return
        setRepoPickerInstallationId(installationIdFromQuery)
        setRepoPickerOpen(true)
        if (repos.length === 0) {
          toast.error("No repositories available for this installation")
        } else {
          toast.success("GitHub installation connected. Select a repository to continue.")
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to complete GitHub setup")
        }
      } finally {
        if (!cancelled) {
          setSetupHandled(true)
          const sp = new URLSearchParams(searchParams.toString())
          sp.delete("github_installation_id")
          sp.delete("github_state")
          const next = sp.toString()
          router.replace(next ? `${pathname}?${next}` : pathname)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [completeConnection, installationIdFromQuery, pathname, router, searchParams, setupHandled, stateFromQuery])

  const openRepoPicker = async () => {
    const installationId = String(connection?.installationId || repoPickerInstallationId || "").trim()
    if (!installationId) {
      toast.error("Installation ID is missing. Reconnect GitHub first.")
      return
    }

    try {
      await completeConnection(installationId)
      setRepoPickerInstallationId(installationId)
      setRepoPickerOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load repositories")
    }
  }

  const handleIncrementalSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncNow("incremental")
      toast.success(`Synced ${result.processed} issues (${result.created} created, ${result.updated} updated)`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBackfill = async () => {
    setIsBackfilling(true)
    try {
      const result = await runInitialBackfill()
      toast.success(`Backfill complete: ${result.processed} processed, ${result.created} created, ${result.updated} updated`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Backfill failed")
    } finally {
      setIsBackfilling(false)
    }
  }

  const handleSuggestion = async (id: string, action: "accept" | "reject") => {
    setIsApplying(true)
    try {
      return await applySuggestion(id, action)
    } finally {
      setIsApplying(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnect()
    } finally {
      setIsDisconnecting(false)
    }
  }

  const isConnected = Boolean(connection)
  const description = !configured
    ? "GitHub integration is not configured in this environment."
    : isConnected
    ? `Connected to ${connection?.repositoryFullName || "repository"}. Sync uses label allowlist and creates feedback posts in the GitHub Issues board. Pending suggestions: ${pendingSuggestions}.`
    : "Connect your GitHub repository to sync labeled issues into feedback posts and review AI roadmap status suggestions."

  const actionDisabled = disabled || isLoading || isPending || isSyncing || isBackfilling || isDisconnecting

  return (
    <div className="space-y-3">
      <SettingsCard
        icon={<GitHubIcon className="w-5 h-5" />}
        title="GitHub"
        description={description}
        disabled={actionDisabled}
        isConnected={isConnected}
      >
        {!isConnected ? (
          <Button size="xs" onClick={() => startConnect()} disabled={!configured || actionDisabled}>
            Connect
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="xs" onClick={handleIncrementalSync} disabled={actionDisabled}>
              Sync
            </Button>
            <Button size="xs" variant="card" onClick={handleBackfill} disabled={actionDisabled}>
              Backfill
            </Button>
            <Button size="xs" variant="card" onClick={openRepoPicker} disabled={actionDisabled}>
              Configure
            </Button>
            <Button size="xs" variant="destructive" onClick={handleDisconnect} disabled={actionDisabled}>
              Disconnect
            </Button>
          </div>
        )}
      </SettingsCard>

      {isConnected ? (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <h4 className="text-sm font-medium text-foreground">AI Suggestion Queue</h4>
          <GitHubSuggestionQueue items={suggestions} isPending={isApplying || actionDisabled} onApply={handleSuggestion} />
        </div>
      ) : null}

      <GitHubRepoPicker
        open={repoPickerOpen}
        onOpenChange={setRepoPickerOpen}
        repositories={repositories}
        installationId={repoPickerInstallationId}
        defaultLabels={connection?.labelAllowlist || ["feature", "feedback"]}
        defaultStatusMap={(connection?.statusLabelMap || {}) as Record<string, string>}
        isPending={actionDisabled}
        onSave={selectRepo}
      />
    </div>
  )
}
