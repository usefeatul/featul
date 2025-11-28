import React from "react"

export default function SectionCard({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-md shadow-md shadow-zinc-950/5">
      <div className="p-4 border-b ">
        <div className="text-md font-medium">{title}</div>
        {description ? <div className="text-sm text-accent mt-0.5">{description}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
