"use client"

import * as React from "react"
import { cn } from "@featul/ui/lib/utils"

/** Detail-page sidebar group: small uppercase heading over plain rows. */
export function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * Label on the left, value on the right; no frame. Use inside a `<dl>`.
 * `alignTop` keeps the label on the first line when the value wraps (e.g. 24px chips).
 */
export function DetailRow({
  label,
  children,
  alignTop,
}: {
  label: string
  children: React.ReactNode
  alignTop?: boolean
}) {
  return (
    <div className={cn("flex min-h-8 justify-between gap-3 px-2.5 py-1", alignTop ? "items-start" : "items-center")}>
      <dt className={cn("shrink-0 text-sm text-muted-foreground", alignTop && "leading-6")}>{label}</dt>
      <dd className="flex min-w-0 justify-end text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

/** Icon + label row button for a sidebar Actions list. Use inside a `<ul>`. */
export function SidebarActionItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
          destructive
            ? "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
        {label}
      </button>
    </li>
  )
}
