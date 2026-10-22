"use client"

import React from "react"
import { format } from "date-fns"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import { MemberActivityItemRow } from "@/components/team/MemberActivityItemRow"
import SectionCard from "@/components/settings/global/SectionCard"
import {
  getActivityHref,
  type ActivityDayGroup,
} from "@/components/team/activity/utils"

interface MemberActivityDaySectionProps {
  dayGroup: ActivityDayGroup
  expandedGroups: Record<string, boolean>
  onToggleGroup: (key: string) => void
  workspaceSlug: string
}

const groupButtonClassName =
  "block w-full px-5 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"

const groupRowClassName = "text-sm text-accent flex items-center gap-2 min-w-0"

const counterClassName =
  "inline-flex shrink-0 items-center rounded-lg border border-border bg-muted px-2 py-0.5 text-[11px] text-accent"

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
          <span className="text-xs font-medium shrink-0">{format(new Date(createdAt), "LLL d")}</span>
          <span className="min-w-0 flex-1">
            <MemberActivityDescription item={item} />
          </span>
          <span className={counterClassName}>{count}x</span>
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
    <SectionCard title={dayGroup.label} contentClassName="p-0">
      <ul className="w-full min-w-0 divide-y divide-border/50">
        {dayGroup.rows.map((row) => {
          if (row.kind === "item") {
            return <MemberActivityItemRow key={row.key} item={row.item} href={row.href} />
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
                <li className="px-5 py-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleGroup(row.key)}
                    className="text-xs text-accent hover:text-foreground"
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
    </SectionCard>
  )
}
