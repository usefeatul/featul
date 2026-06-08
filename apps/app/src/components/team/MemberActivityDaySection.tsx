"use client"

import React from "react"
import { format } from "date-fns"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import { MemberActivityItemRow } from "@/components/team/MemberActivityItemRow"
import {
  getActivityHref,
  type ActivityDayGroup,
} from "@/components/team/member-activity-utils"

interface MemberActivityDaySectionProps {
  dayGroup: ActivityDayGroup
  expandedGroups: Record<string, boolean>
  onToggleGroup: (key: string) => void
  workspaceSlug: string
}

const sectionClassName =
  "space-y-2 border-t border-border/70 pt-5 first:border-t-0 first:pt-0"

const headingClassName = "text-xs font-semibold leading-none text-foreground"

const groupButtonClassName =
  "block w-full rounded-md px-2.5 py-2.5 text-left hover:bg-card"

const groupRowClassName = "flex min-w-0 items-start justify-between gap-4"

const counterClassName =
  "inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-accent"

function GroupSummaryRow({
  createdAt,
  count,
  onExpand,
  item,
}: {
  createdAt: string | Date
  count: number
  onExpand: () => void
  item: React.ComponentProps<typeof MemberActivityDescription>["item"]
}) {
  return (
    <li className="py-0">
      <button type="button" onClick={onExpand} className={groupButtonClassName}>
        <div className={groupRowClassName}>
          <span className="min-w-0 flex-1 text-xs leading-4 text-foreground">
            <MemberActivityDescription item={item} />
          </span>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">
              {format(new Date(createdAt), "h:mm a")}
            </span>
            <span className={counterClassName}>{count}x</span>
          </div>
        </div>
      </button>
    </li>
  )
}

export function MemberActivityDaySection({
  dayGroup,
  expandedGroups,
  onToggleGroup,
  workspaceSlug,
}: MemberActivityDaySectionProps) {
  return (
    <section className={sectionClassName}>
      <div className={headingClassName}>{dayGroup.label}</div>

      <ul className="divide-y divide-border/60">
        {dayGroup.rows.map((row) => {
          if (row.kind === "item") {
            return (
              <MemberActivityItemRow
                key={row.key}
                item={row.item}
                href={row.href}
              />
            )
          }

          const isExpanded = Boolean(expandedGroups[row.key])
          if (isExpanded) {
            return (
              <React.Fragment key={row.key}>
                {row.items.map((entry, index) => (
                  <MemberActivityItemRow
                    key={`${row.key}-entry-${entry.id}-${index}`}
                    item={entry}
                    href={getActivityHref(entry, workspaceSlug)}
                  />
                ))}
                <li className="py-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleGroup(row.key)}
                    className="rounded-md px-2.5 py-2 text-xs text-accent hover:bg-card hover:text-foreground"
                  >
                    Show less
                  </button>
                </li>
              </React.Fragment>
            )
          }

          return (
            <GroupSummaryRow
              key={row.key}
              createdAt={row.item.createdAt}
              count={row.items.length}
              item={row.item}
              onExpand={() => onToggleGroup(row.key)}
            />
          )
        })}
      </ul>
    </section>
  )
}
