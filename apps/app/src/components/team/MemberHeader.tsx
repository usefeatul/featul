"use client"

import React from "react"
import type { Member } from "@/types/team"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar"
import { getInitials } from "@/utils/user"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/role-badge"
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

export function MemberHeader({ member, userId, stats }: MemberHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar className="size-16 ring-1 ring-border/70">
            <AvatarImage
              src={member?.image || ""}
              alt={member?.name || member?.email || ""}
            />
            <AvatarFallback>
              {getInitials(member?.name || member?.email || "")}
            </AvatarFallback>
          </Avatar>
          <RoleBadge
            role={member?.role}
            isOwner={member?.isOwner}
            className="-bottom-0 -right-0"
          />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold leading-tight text-foreground">
              {member?.name || member?.email || userId}
            </h1>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs capitalize",
                roleBadgeClass(member?.role || "member", member?.isOwner),
              )}
            >
              {member?.isOwner ? "owner" : member?.role}
            </span>
          </div>
          <div className="truncate text-sm text-accent">{member?.email}</div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-accent">
            {member?.joinedAt ? (
              <span>
                Joined {format(new Date(member.joinedAt), "LLL d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-base text-accent">
        <span>
          <strong className="font-semibold text-foreground tabular-nums">
            {Number(stats.posts || 0)}
          </strong>{" "}
          requests
        </span>
        <span aria-hidden className="text-border">
          ·
        </span>
        <span>
          <strong className="font-semibold text-foreground tabular-nums">
            {Number(stats.comments || 0)}
          </strong>{" "}
          comments
        </span>
        <span aria-hidden className="text-border">
          ·
        </span>
        <span>
          <strong className="font-semibold text-foreground tabular-nums">
            {Number(stats.upvotes || 0)}
          </strong>{" "}
          votes
        </span>
      </div>
    </div>
  )
}
