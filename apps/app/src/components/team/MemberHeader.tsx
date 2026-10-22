"use client"

import React from "react"
import type { Member } from "@/types/team"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { getInitials } from "@/utils/user"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/RoleBadge"
import { cn } from "@featul/ui/lib/utils"
import RoleBadge from "@/components/global/RoleBadge"

interface MemberHeaderProps {
  member?: Member
  userId: string
}

export function MemberHeader({ member, userId }: MemberHeaderProps) {
  return (
    <section className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <header className="flex min-w-0 items-start gap-4">
        <div className="relative shrink-0">
          <Avatar className="relative size-14 overflow-visible">
            <AvatarImage src={member?.image || ""} alt={member?.name || member?.email || ""} />
            <AvatarFallback className="bg-muted text-lg text-muted-foreground">
              {getInitials(member?.name || member?.email || "")}
            </AvatarFallback>
            <RoleBadge
              role={member?.role}
              isOwner={member?.isOwner}
              className="-bottom-0 -right-0"
            />
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate pb-0.5 text-xl font-semibold leading-none tracking-tight text-foreground sm:text-2xl sm:leading-none">
            {member?.name || member?.email || userId}
          </h1>
          <div className="mt-1.5 truncate text-sm text-accent">{member?.email}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={cn(roleBadgeClass(member?.role || "member", member?.isOwner))}>
              {member?.isOwner ? "owner" : member?.role}
            </span>
            {member?.joinedAt ? (
              <span className="text-accent">
                <span aria-hidden className="mr-2 text-accent/50">·</span>
                Joined {format(new Date(member.joinedAt), "LLL d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>
      </header>
    </section>
  )
}
