"use client";

import type { Role } from "@/types/team";
import { cn } from "@featul/ui/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip";
import { StarIcon } from "@featul/ui/icons/star";

interface RoleBadgeProps {
  role?: Role | null;
  isOwner?: boolean;
  isFeatul?: boolean;
  className?: string;
}

function getRoleColor(role?: Role | null, isOwner?: boolean, isFeatul?: boolean): string {
  if (isFeatul) return "text-amber-500 dark:text-amber-400";
  if (isOwner) return "text-primary";
  if (role === "admin") return "text-orange-500 dark:text-orange-400";
  if (role === "viewer") return "text-green-500 dark:text-green-400";
  if (role === "member") return "text-blue-500 dark:text-blue-400";
  return "text-muted-foreground";
}

function getTooltipClasses(role?: Role | null, isOwner?: boolean, isFeatul?: boolean): string {
  if (isFeatul) return "bg-amber-500 dark:bg-amber-600 text-white border-transparent";
  if (isOwner) return "bg-primary text-black dark:text-white border-transparent";
  if (role === "admin")
    return "bg-orange-500 dark:bg-orange-600 text-white border-transparent";
  if (role === "viewer")
    return "bg-green-500 dark:bg-green-600 text-white border-transparent";
  return "bg-blue-500 dark:bg-blue-600 text-white border-transparent";
}

function getTooltipText(role?: Role | null, isOwner?: boolean, isFeatul?: boolean): string {
  if (isFeatul) return "featul";
  if (isOwner) return "Owner";
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  if (role === "viewer") return "Viewer";
  return "";
}

export default function RoleBadge({
  role,
  isOwner,
  isFeatul,
  className,
}: RoleBadgeProps) {
  if (!role && !isOwner && !isFeatul) return null;

  return (
    <div
      className={cn(
        "absolute -bottom-1 -right-1 rounded-full bg-card dark:bg-black p-0.5 z-10 pointer-events-auto",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <StarIcon
            className={cn("size-2.5", getRoleColor(role, isOwner, isFeatul))}
            aria-label={getTooltipText(role, isOwner, isFeatul)}
          />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={4}
          className={cn(
            "w-auto whitespace-nowrap",
            getTooltipClasses(role, isOwner, isFeatul)
          )}
        >
          {getTooltipText(role, isOwner, isFeatul)}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
