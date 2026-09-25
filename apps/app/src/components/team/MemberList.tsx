"use client"

import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import Link from "next/link"
import { roleBadgeClass } from "@/components/settings/team/RoleBadge"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import RoleBadge from "@/components/global/RoleBadge"
import { fetchWorkspaceMembers } from "@/lib/team/client"
import { teamQueryKeys } from "@/lib/team/keys"
import { relativeTime } from "@/lib/time"

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
    <section className="min-w-0 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-1 has-[[data-page-empty]]:flex-col" aria-busy={isLoading}>
      {items.length === 0 && !isLoading ? (
        <div data-page-empty className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
          <p className="text-sm font-medium text-foreground">No members yet</p>
          <p className="mt-1 text-xs text-accent">
            Workspace members will appear here.
          </p>
        </div>
      ) : (
        <ul className="m-0 min-w-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-border/40 dark:[&>li+li]:border-white/6">
          {items.map((member) => {
            const name = member.name || member.email || member.userId
            return (
              <li key={member.userId} className="list-none">
                <div className="group/member relative flex min-h-10 items-center gap-3 overflow-hidden px-4 py-1.5 transition-colors hover:bg-muted/50 sm:px-6 dark:hover:bg-white/[0.04]">
                  <Link
                    href={`/workspaces/${slug}/members/${member.userId}`}
                    aria-label={`View ${name}`}
                    className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                  />
                  <Avatar className="relative size-6 shrink-0 overflow-visible bg-muted">
                    <AvatarImage src={member.image || ""} alt={name} />
                    <AvatarFallback className="text-[10px] text-muted-foreground">
                      {getInitials(name)}
                    </AvatarFallback>
                    <RoleBadge role={member.role} isOwner={member.isOwner} />
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground">
                    {name}
                  </span>
                  <div className="pointer-events-none relative z-10 flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground lg:gap-3">
                    {member.email && member.email !== name ? (
                      <span className="hidden max-w-52 truncate text-sm md:inline">
                        {member.email}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "hidden h-5 rounded-md px-2 text-sm capitalize leading-5 sm:inline-block",
                        member.isOwner
                          ? "bg-muted text-primary"
                          : roleBadgeClass(member.role, member.isOwner),
                      )}
                    >
                      {member.isOwner ? "owner" : member.role}
                    </span>
                    <span className="hidden w-12 text-right tabular-nums sm:inline">
                      {member.joinedAt ? relativeTime(member.joinedAt) : "—"}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
