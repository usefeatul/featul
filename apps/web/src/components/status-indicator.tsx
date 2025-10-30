"use client"

import { cn } from "@feedgot/ui/lib/utils"

type StatusIndicatorProps = {
  status?: "operational" | "degraded" | "partial-outage" | "major-outage"
  pulse?: boolean
  className?: string
  srLabel?: string
}

function colorForStatus(status: StatusIndicatorProps["status"]) {
  switch (status) {
    case "degraded":
      return "bg-yellow-500"
    case "partial-outage":
      return "bg-orange-500"
    case "major-outage":
      return "bg-red-500"
    case "operational":
    default:
      return "bg-green-500"
  }
}

export function StatusIndicator({
  status = "operational",
  pulse = true,
  className,
  srLabel,
}: StatusIndicatorProps) {
  const color = colorForStatus(status)
  const label =
    srLabel ??
    (status === "operational"
      ? "Status: Operational"
      : `Status: ${status.replace("-", " ")}`)

  return (
    <span className={cn("relative inline-block size-2.5", className)}>
      {pulse && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full opacity-75 animate-ping",
            color
          )}
        />
      )}
      <span className={cn("relative block size-2.5 rounded-full", color)} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default StatusIndicator