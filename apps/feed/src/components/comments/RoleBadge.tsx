"use client";

import React from "react";
import type { Role } from "@/types/team";
import { cn } from "@oreilla/ui/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@oreilla/ui/components/tooltip";
import { StarIcon } from "@oreilla/ui/icons/star";


interface RoleBadgeProps {
  role?: Role | null;
  isOwner?: boolean;
  className?: string;
}

function getRoleColor(role?: Role | null, isOwner?: boolean): string {
  if (isOwner) return "text-primary";
  if (role === "admin") return "text-orange-500";
  if (role === "viewer") return "text-green-500";
  if (role === "member") return "text-blue-500";
  return "text-muted-foreground";
}

function getTooltipClasses(role?: Role | null, isOwner?: boolean): string {
  if (isOwner) return "bg-primary text-white border-transparent";
  if (role === "admin") return "bg-orange-500 text-white border-transparent";
  if (role === "viewer") return "bg-green-500 text-white border-transparent";
  return "bg-blue-500 text-white border-transparent";
}

export default function RoleBadge({
  role,
  isOwner,
  className,
}: RoleBadgeProps) {
  if (!role && !isOwner) return null;

  return (
    <div
      className={cn(
        "absolute -bottom-2 -right-1 ml-4 rounded-full bg-background p-0.5 z-10 pointer-events-auto",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <StarIcon
            className={cn("h-3 w-3", getRoleColor(role, isOwner))}
            aria-label={
              isOwner
                ? "Owner"
                : role === "admin"
                  ? "Admin"
                  : role === "member"
                    ? "Member"
                    : role === "viewer"
                      ? "Viewer"
                      : ""
            }
          />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={4}
          className={cn(
            "w-auto whitespace-nowrap",
            getTooltipClasses(role, isOwner)
          )}
        >
          {isOwner
            ? "Owner"
            : role === "admin"
              ? "Admin"
              : role === "member"
                ? "Member"
                : role === "viewer"
                  ? "Viewer"
                  : ""}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
