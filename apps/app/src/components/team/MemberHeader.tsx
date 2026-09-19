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
  stats: {
    posts: number
    comments: number
    upvotes: number
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 px-4 text-center first:pl-0 last:pr-0 lg:min-w-28">
      <div className="text-xs text-accent">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  )
}

export function MemberHeader({ member, userId, stats }: MemberHeaderProps) {
  return (
    <section className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <header className="flex min-w-0 items-center gap-4">
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
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {member?.name || member?.email || userId}
          </h1>
          <div className="mt-1 truncate text-sm text-accent">{member?.email}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={cn("px-2 py-0.5", roleBadgeClass(member?.role || "member", member?.isOwner))}>
              {member?.isOwner ? "owner" : member?.role}
            </span>
            {member?.joinedAt ? (
              <span className="text-accent">
                Joined {format(new Date(member.joinedAt), "LLL d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>
      </header>
      <div className="grid w-full grid-cols-3 rounded-lg bg-muted/35 px-5 py-4 lg:ml-auto lg:w-auto lg:min-w-[24rem] dark:bg-white/[0.025]">
        <StatCard label="Posts" value={Number(stats.posts || 0)} />
        <StatCard label="Comments" value={Number(stats.comments || 0)} />
        <StatCard label="Upvotes" value={Number(stats.upvotes || 0)} />
      </div>
    </section>
  )
}
