import type { ReactNode } from "react"
import Link from "next/link"
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card"
import { AlternativeIcon } from "@featul/ui/icons/alternative"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"
import { cn } from "@featul/ui/lib/utils"
import type { FeatureSupport } from "@/config/alternatives"
import { StatusIcon, featureSupportLabel } from "./icon"

export function ComparisonTable({
  caption,
  children,
  minWidthClassName = "min-w-[36rem]",
}: {
  caption: string
  children: ReactNode
  minWidthClassName?: string
}) {
  return (
    <OverlayCard className="h-auto w-full">
      <OverlayCardPanel className="overflow-x-auto p-0">
        <table className={cn("w-full border-collapse text-sm [&_tbody_tr:hover]:bg-muted/20", minWidthClassName)}>
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </OverlayCardPanel>
    </OverlayCard>
  )
}

export function ComparisonThead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-border bg-primary/20">{children}</thead>
}

export function ComparisonTh({
  children,
  className,
  scope = "col",
  align = "left",
}: {
  children: ReactNode
  className?: string
  scope?: "col" | "row"
  align?: "left" | "center"
}) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-3 py-3 text-xs font-semibold text-foreground sm:px-4 sm:text-sm",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  )
}

export function ComparisonTd({
  children,
  className,
  align = "left",
}: {
  children: ReactNode
  className?: string
  align?: "left" | "center"
}) {
  return (
    <td
      className={cn(
        "px-3 py-3 text-xs leading-6 text-accent sm:px-4 sm:text-sm",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  )
}

export function ComparisonTr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border last:border-b-0">{children}</tr>
}

const STATUS_COLUMN_CLASS = "w-[7.75rem] min-w-[7.75rem] sm:w-36 sm:min-w-36"

export function ComparisonStatusHeader({
  name,
  href,
  slug,
  featured = false,
  layout = "stack",
}: {
  name: string
  href?: string
  slug?: string
  featured?: boolean
  layout?: "stack" | "inline"
}) {
  const mark = featured ? (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-border/70">
      <FeatulLogoIcon className="size-4 text-primary" size={16} />
    </span>
  ) : slug ? (
    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/70">
      <AlternativeIcon
        slug={slug}
        alt=""
        size={28}
        className="size-full object-cover"
      />
    </span>
  ) : null

  const label = (
    <span
      className={cn(
        "inline-flex gap-1.5",
        layout === "stack" ? "flex-col items-center" : "flex-row items-center",
      )}
    >
      {mark}
      <span className={cn("leading-none", featured && "text-primary")}>{name}</span>
    </span>
  )

  if (!href) return label

  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-flex hover:underline underline-offset-4"
    >
      {label}
    </Link>
  )
}

export function ComparisonStatusCell({ value }: { value: FeatureSupport }) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
      <StatusIcon value={value} />
      <span className="text-xs font-medium text-foreground">
        {featureSupportLabel(value)}
      </span>
    </span>
  )
}

export { STATUS_COLUMN_CLASS }
