import React from "react"

export default function SectionCard({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-mdborder border-border">
      <div className="p-2 border-b border-background">
        <div className="text-lg font-heading">{title}</div>
        {description ? <div className="text-sm text-accent mt-1">{description}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
