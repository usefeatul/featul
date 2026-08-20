"use client"

import React from "react"
import type { Member } from "@/types/team"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { getInitials } from "@/utils/user"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/RoleBadge"
import { cn } from "@featul/ui/lib/utils"
import RoleBadge from "@/components/global/RoleBadge"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

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
    <div>
      <div className="text-xs text-accent">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

export function MemberHeader({ member, userId, stats }: MemberHeaderProps) {
  return (
    <section className={cn(settingsCardShellClass, "w-full")}>
      <header className="flex min-w-0 items-center gap-3 py-2">
        <div className="relative shrink-0">
          <Avatar className="relative size-10 overflow-visible">
            <AvatarImage src={member?.image || ""} alt={member?.name || member?.email || ""} />
            <AvatarFallback className="bg-muted text-sm text-muted-foreground">
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
          <div className="truncate text-sm font-semibold text-foreground">
            {member?.name || member?.email || userId}
          </div>
          <div className="truncate text-xs text-accent">{member?.email}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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
      <div className={settingsCardInnerClass}>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Posts" value={Number(stats.posts || 0)} />
          <StatCard label="Comments" value={Number(stats.comments || 0)} />
          <StatCard label="Upvotes" value={Number(stats.upvotes || 0)} />
        </div>
      </div>
    </section>
  )
}
