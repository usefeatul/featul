import StatusIcon from "@/components/requests/StatusIcon"
import { statusLabel } from "@/lib/roadmap"
import { cn } from "@featul/ui/lib/utils"

const TONES: Record<string, string> = {
  planned: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  progress: "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
  review: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  completed: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  closed: "bg-muted text-muted-foreground ring-border/60",
  pending: "bg-muted text-muted-foreground ring-border/60",
}

/** Tinted roadmap status pill with the matching status icon. */
export function StatusChip({ status, className }: { status?: string | null; className?: string }) {
  const key = (status || "pending").toLowerCase()
  const label = key === "progress" ? "In progress" : key === "review" ? "In review" : statusLabel(key)
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium ring-1 ring-inset",
        TONES[key] || TONES.pending,
        className,
      )}
    >
      <StatusIcon status={key} className="size-3.5" />
      {label}
    </span>
  )
}
