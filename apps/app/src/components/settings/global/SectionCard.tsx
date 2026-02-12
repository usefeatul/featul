import React from "react"

export default function SectionCard({ title, description, children, action }: { title: string; description?: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-card dark:bg-black/40 rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border border-border shadow-md mb-2">
      <div className="p-4 border-b border-background flex items-center justify-between">
        <div>
          <div className="text-lg font-heading">{title}</div>
          {description ? <div className="text-sm text-accent mt-1">{description}</div> : null}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="px-2 pt-2 pb-2">{children}</div>
    </div>
  )
}
