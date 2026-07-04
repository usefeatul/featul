"use client"

import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar"
import Link from "next/link"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/role-badge"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import RoleBadge from "@/components/global/RoleBadge"
import { fetchWorkspaceMembers } from "@/lib/team-client"
import { teamQueryKeys } from "@/lib/team-query-keys"

interface Props {
  slug: string
  initialMembers?: Member[]
}

export default function MemberList({ slug, initialMembers = [] }: Props) {
  const { data = initialMembers, isLoading } = useQuery<Member[]>({
    queryKey: teamQueryKeys.members(slug),
    queryFn: () => fetchWorkspaceMembers(slug),
    initialData: initialMembers,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const items = data

  return (
    <div className="overflow-hidden bg-[var(--workspace-surface)]">
      <ul className="m-0 list-none divide-y divide-border/60 border-y border-border/60 p-0">
        {items.length === 0 && !isLoading ? (
          <li className="px-4 py-6 text-sm text-accent sm:px-6">No members</li>
        ) : (
          items.map((m) => (
            <li key={m.userId}>
              <Link
                href={`/workspaces/${slug}/members/${m.userId}`}
                className="grid min-h-[3.25rem] grid-cols-[minmax(0,1fr)] items-center gap-3 bg-[var(--workspace-surface)] px-4 py-3 transition-colors hover:bg-card sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="size-8 ring-1 ring-border/70">
                      <AvatarImage
                        src={m.image || ""}
                        alt={m.name || m.email || ""}
                      />
                      <AvatarFallback>
                        {getInitials(m.name || m.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <RoleBadge role={m.role} isOwner={m.isOwner} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {m.name || m.email || m.userId}
                    </div>
                    <div className="truncate text-xs text-accent">
                      {m.email}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "hidden h-6 rounded-md px-2 text-xs capitalize leading-6 sm:inline-block",
                    roleBadgeClass(m.role, m.isOwner),
                  )}
                >
                  {m.isOwner ? "owner" : m.role}
                </span>
                <span className="hidden w-12 text-right text-xs text-muted-foreground sm:block">
                  {m.joinedAt ? format(new Date(m.joinedAt), "MMM d") : "—"}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
