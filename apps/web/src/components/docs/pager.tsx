import Link from "next/link"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import type { DocsNavEntry } from "@/config/docsNav"

export function DocsPager({
  prev,
  next,
}: {
  prev: DocsNavEntry | null
  next: DocsNavEntry | null
}) {
  if (!prev && !next) return null

  return (
    <div className="flex items-center gap-1.5">
      {prev ? (
        <Link
          href={prev.href}
          aria-label={`Previous: ${prev.label}`}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border text-accent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeftIcon size={14} />
        </Link>
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-md border border-border text-accent/40">
          <ChevronLeftIcon size={14} />
        </span>
      )}
      {next ? (
        <Link
          href={next.href}
          aria-label={`Next: ${next.label}`}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border text-accent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRightIcon size={14} />
        </Link>
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-md border border-border text-accent/40">
          <ChevronRightIcon size={14} />
        </span>
      )}
    </div>
  )
}
