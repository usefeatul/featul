import React from "react"

export default function SectionCard({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-md border">
      <div className="p-4 border-b">
        <div className="text-sm font-medium">{title}</div>
        {description ? <div className="text-xs text-accent mt-0.5">{description}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

