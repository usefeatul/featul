"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import type { ActivityItem } from "@/types/activity"

interface MemberActivityItemRowProps {
  item: ActivityItem
  href: string
}

export function MemberActivityItemRow({ item, href }: MemberActivityItemRowProps) {
  return (
    <li className="py-0">
      <Link
        href={href}
        className="block -mx-2 rounded-sm px-2 py-2.5 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="text-xs text-accent flex items-center gap-2 min-w-0">
          <span className="font-medium shrink-0">{format(new Date(item.createdAt), "LLL d")}</span>
          <span className="min-w-0 flex-1">
            <MemberActivityDescription item={item} />
          </span>
        </div>
      </Link>
    </li>
  )
}
