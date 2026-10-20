import StatusIcon from "@/components/requests/StatusIcon"
import { statusLabel } from "@/lib/roadmap"
import { cn } from "@featul/ui/lib/utils"

/** Label colours match the fills baked into each status icon. */
const TEXT: Record<string, string> = {
  planned: "text-[#f59e0b]",
  progress: "text-[#4d96e8]",
  review: "text-[#a855f7]",
  completed: "text-[#15CF59]",
  closed: "text-[#FA3434]",
  pending: "text-[#8A8A8A]",
}

/** Roadmap status as the status icon plus a coloured label, no pill. */
export function StatusChip({ status, className }: { status?: string | null; className?: string }) {
  const key = (status || "pending").toLowerCase()
  const label = key === "progress" ? "In progress" : key === "review" ? "In review" : statusLabel(key)
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", TEXT[key] || TEXT.pending, className)}>
      <StatusIcon status={key} className="size-3.5 shrink-0" />
      {label}
    </span>
  )
}
