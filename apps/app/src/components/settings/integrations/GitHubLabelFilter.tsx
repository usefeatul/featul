"use client"

import React from "react"
import { Input } from "@featul/ui/components/input"
import { Button } from "@featul/ui/components/button"

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}

export default function GitHubLabelFilter({ value, onChange, disabled = false }: Props) {
  const [draft, setDraft] = React.useState("")

  const addLabel = () => {
    const label = draft.trim().toLowerCase()
    if (!label) return
    if (value.includes(label)) {
      setDraft("")
      return
    }
    onChange([...value, label])
    setDraft("")
  }

  const removeLabel = (label: string) => {
    onChange(value.filter((it) => it !== label))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add label (e.g. feature-request)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addLabel()
            }
          }}
          disabled={disabled}
        />
        <Button type="button" variant="card" onClick={addLabel} disabled={disabled || !draft.trim()}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((label) => (
          <button
            key={label}
            type="button"
            className="px-2 py-1 text-xs rounded-md border border-border bg-muted hover:bg-muted/80"
            onClick={() => removeLabel(label)}
            disabled={disabled}
          >
            {label} ×
          </button>
        ))}
      </div>
    </div>
  )
}
