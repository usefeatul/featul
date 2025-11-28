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
        "inline-flex items-center align-middle gap-2 h-7 px-2.5 rounded-md text-xs",
        "border border-border/60 bg-muted/40 text-accent hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
    >
      <StatusIndicator />
      {label}
    </Link>
  )
}

export default StatusButton