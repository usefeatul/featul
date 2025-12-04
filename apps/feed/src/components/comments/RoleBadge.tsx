"use client"

import React from "react"
import type { Role } from "@/types/team"
import { cn } from "@feedgot/ui/lib/utils"
import { StarIcon } from "@feedgot/ui/icons/star"

interface RoleBadgeProps {
  role?: Role | null
  isOwner?: boolean
  className?: string
}

function getRoleColor(role?: Role | null, isOwner?: boolean): string {
  if (isOwner) return "text-primary"
  if (role === "admin") return "text-orange-500"
  if (role === "viewer") return "text-green-500"
  if (role === "member") return "text-blue-500"
  return "text-muted-foreground"
}

export default function RoleBadge({ role, isOwner, className }: RoleBadgeProps) {
  if (!role && !isOwner) return null

  return (
    <div
      className={cn(
        "absolute -top-0.5 -right-0.5 rounded-full bg-background p-0.5 shadow-sm border border-border/50 z-10 pointer-events-none",
        className
      )}
    >
      <StarIcon
        className={cn("h-3 w-3", getRoleColor(role, isOwner))}
        aria-label={isOwner ? "Owner" : role === "admin" ? "Admin" : role === "member" ? "Member" : role === "viewer" ? "Viewer" : ""}
      />
    </div>
  )
}

