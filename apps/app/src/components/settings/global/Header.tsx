import React from "react"

export default function SettingsHeader({ title, description, crumb }: { title: string; description?: string; crumb?: string }) {
  return (
    <div className="space-y-2">
      {crumb ? <div className="text-xs text-accent">{crumb}</div> : null}
      <h1 className="text-lg font-semibold">{title}</h1>
      {description ? <p className="text-sm text-accent">{description}</p> : null}
    </div>
  )
}
