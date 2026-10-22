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
        className="block w-full px-5 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="text-sm text-accent flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium shrink-0">{format(new Date(item.createdAt), "LLL d")}</span>
          <span className="min-w-0 flex-1">
            <MemberActivityDescription item={item} />
          </span>
        </div>
      </Link>
    </li>
  )
}
