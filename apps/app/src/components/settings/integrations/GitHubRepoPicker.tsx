"use client"

import React from "react"
import { SettingsDialogShell } from "../global/SettingsDialogShell"
import { Button } from "@featul/ui/components/button"
import { Textarea } from "@featul/ui/components/textarea"
import GitHubLabelFilter from "./GitHubLabelFilter"
import type { GithubRepository } from "@/hooks/useGithubIntegration"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  repositories: GithubRepository[]
  installationId: string
  defaultLabels?: string[]
  defaultStatusMap?: Record<string, string>
  isPending?: boolean
  onSave: (input: {
    installationId: string
    repositoryId: string
    repositoryName: string
    repositoryOwner: string
    repositoryFullName: string
    labelAllowlist: string[]
    statusLabelMap: Record<string, string>
  }) => Promise<boolean>
}

function serializeMap(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}:${v}`)
    .join("\n")
}

function parseMap(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const idx = trimmed.indexOf(":")
    if (idx <= 0) continue
    const label = trimmed.slice(0, idx).trim().toLowerCase()
    const status = trimmed.slice(idx + 1).trim().toLowerCase()
    if (!label || !status) continue
    out[label] = status
  }
  return out
}

export default function GitHubRepoPicker({
  open,
  onOpenChange,
  repositories,
  installationId,
  defaultLabels,
  defaultStatusMap,
  isPending = false,
  onSave,
}: Props) {
  const [repositoryId, setRepositoryId] = React.useState("")
  const [labels, setLabels] = React.useState<string[]>(defaultLabels || [])
  const [statusMapRaw, setStatusMapRaw] = React.useState(serializeMap(defaultStatusMap || {}))
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (repositories.length > 0 && !repositoryId) {
      const firstRepo = repositories[0]
      if (firstRepo?.id) setRepositoryId(firstRepo.id)
    }
  }, [repositories, repositoryId])

  React.useEffect(() => {
    if (!open) {
      setError(null)
    }
  }, [open])

  const selected = repositories.find((repo) => repo.id === repositoryId) || null

  const handleSave = async () => {
    setError(null)
    if (!selected) {
      setError("Select a repository")
      return
    }
    const cleanedLabels = Array.from(new Set(labels.map((it) => it.trim().toLowerCase()).filter(Boolean)))
    if (cleanedLabels.length === 0) {
      setError("At least one label is required")
      return
    }

    const success = await onSave({
      installationId,
      repositoryId: selected.id,
      repositoryName: selected.name,
      repositoryOwner: selected.owner,
      repositoryFullName: selected.fullName,
      labelAllowlist: cleanedLabels,
      statusLabelMap: parseMap(statusMapRaw),
    })

    if (success) onOpenChange(false)
  }

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Select GitHub Repository"
      description="Choose one repository and labels to sync as feedback posts."
      width="wide"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Repository</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={repositoryId}
            onChange={(e) => setRepositoryId(e.target.value)}
            disabled={isPending}
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Label allowlist</label>
          <GitHubLabelFilter value={labels} onChange={setLabels} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Optional status map</label>
          <Textarea
            placeholder="feature:planned\npriority-high:review"
            value={statusMapRaw}
            onChange={(e) => setStatusMapRaw(e.target.value)}
            disabled={isPending}
            rows={4}
          />
          <p className="text-xs text-accent">Format each entry as `label:status` (one per line).</p>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="card" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || repositories.length === 0}>
            Save
          </Button>
        </div>
      </div>
    </SettingsDialogShell>
  )
}
