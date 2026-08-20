"use client"

import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import Link from "next/link"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/RoleBadge"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import RoleBadge from "@/components/global/RoleBadge"
import { fetchWorkspaceMembers } from "@/lib/team/client"
import { teamQueryKeys } from "@/lib/team/keys"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

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
    <section className={settingsCardShellClass}>
      <div className={cn(settingsCardInnerClass, "overflow-hidden p-0")}>
        {items.length === 0 && !isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-accent">No members</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {items.map((m) => (
              <li
                key={m.userId}
                className="border-b border-border/60 last:border-b-0 dark:border-b-white/10"
              >
                <Link
                  href={`/workspaces/${slug}/members/${m.userId}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="relative shrink-0">
                    <Avatar className="relative size-8 overflow-visible">
                      <AvatarImage src={m.image || ""} alt={m.name || m.email || ""} />
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                        {getInitials(m.name || m.email || "")}
                      </AvatarFallback>
                      <RoleBadge role={m.role} isOwner={m.isOwner} />
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {m.name || m.email || m.userId}
                    </div>
                    <div className="truncate text-xs text-accent">{m.email}</div>
                  </div>
                  <span
                    className={cn(
                      "hidden h-6 shrink-0 rounded-sm px-2 text-xs capitalize leading-6 sm:inline-block",
                      roleBadgeClass(m.role, m.isOwner),
                    )}
                  >
                    {m.isOwner ? "owner" : m.role}
                  </span>
                  <span className="w-16 shrink-0 text-right text-xs text-accent">
                    {m.joinedAt ? format(new Date(m.joinedAt), "MMM d") : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
