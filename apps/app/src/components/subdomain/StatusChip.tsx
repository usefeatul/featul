import StatusIcon from "@/components/requests/StatusIcon"
import { statusLabel } from "@/lib/roadmap"
import { cn } from "@featul/ui/lib/utils"

const TEXT: Record<string, string> = {
  planned: "text-sky-700 dark:text-sky-300",
  progress: "text-violet-700 dark:text-violet-300",
  review: "text-amber-700 dark:text-amber-300",
  completed: "text-emerald-700 dark:text-emerald-300",
  closed: "text-muted-foreground",
  pending: "text-muted-foreground",
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
