"use client"

import Link from "next/link"
import { StatusIndicator } from "@/components/home/status-indicator"
import { cn } from "@feedgot/ui/lib/utils"

type StatusButtonProps = {
  href?: string
  label?: string
  className?: string
}

export function StatusButton({ href = "https://status.feedgot.com", label = "status", className }: StatusButtonProps) {
  return (
    <Link
      href={href}
      aria-label="View status page"
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 text-sm rounded-sm",
        "border border-border/50 ring-1 ring-border/50 ring-offset-1 ring-offset-background",
        "text-zinc-600 hover:text-foreground hover:bg-muted transition-colors",
        className
      )}
    >
      <StatusIndicator />
      {label}
    </Link>
  )
}

export default StatusButton