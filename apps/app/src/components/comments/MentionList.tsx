"use client"

import React, { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover"

export interface MentionCandidate {
  id: string
  name: string
  image?: string | null
  email?: string | null
}

interface MentionListProps {
  candidates: MentionCandidate[]
  selectedIndex: number
  onSelect: (user: MentionCandidate) => void
  className?: string
}

function mentionOptionId(userId: string) {
  return `mention-option-${userId}`
}

export default function MentionList({ candidates, selectedIndex, onSelect, className }: MentionListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedCandidate = candidates[selectedIndex]

  useEffect(() => {
    if (listRef.current && candidates.length > 0) {
      const options = listRef.current.querySelectorAll<HTMLElement>('[role="option"]')
      const activeOption = options.item(selectedIndex)
      activeOption?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex, candidates.length])

  if (candidates.length === 0) return null

  return (
    <div
      ref={listRef}
      className={cn(
        "absolute z-50 min-w-40 max-h-60 overflow-auto rounded-sm border bg-card p-0 text-popover-foreground shadow-md outline-hidden animate-in fade-in-0 zoom-in-95 whitespace-nowrap",
        className,
      )}
      role="listbox"
      tabIndex={-1}
      aria-activedescendant={selectedCandidate ? mentionOptionId(selectedCandidate.id) : undefined}
    >
      <PopoverList className="py-1">
        {candidates.map((user, index) => (
          <PopoverListItem
            key={user.id}
            id={mentionOptionId(user.id)}
            type="button"
            onClick={() => onSelect(user)}
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
            role="option"
            aria-selected={index === selectedIndex}
            className={cn(
              "gap-2 text-sm focus-visible:bg-muted focus-visible:outline-none",
              index === selectedIndex ? "bg-muted/50" : "",
            )}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-xs">{getInitials(user.name || "U")}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="font-medium leading-none truncate">{user.name}</span>
              {/* {user.email ? <span className="text-xs text-accent truncate">{user.email}</span> : null} */}
            </div>
          </PopoverListItem>
        ))}
      </PopoverList>
    </div>
  )
}
