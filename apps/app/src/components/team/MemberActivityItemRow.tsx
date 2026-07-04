"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import type { ActivityItem } from "@/types/activity"

interface MemberActivityItemRowProps {
  item: ActivityItem
  href: string
}

export function MemberActivityItemRow({
  item,
  href,
}: MemberActivityItemRowProps) {
  return (
    <li className="py-0">
      <Link
        href={href}
        className="block rounded-md px-2.5 py-2.5 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <span className="min-w-0 flex-1 text-xs leading-4 text-foreground">
            <MemberActivityDescription item={item} />
          </span>
          <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
            {format(new Date(item.createdAt), "h:mm a")}
          </span>
        </div>
      </Link>
    </li>
  )
}
