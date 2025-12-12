"use client"

import React, { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@oreilla/ui/components/avatar"
import { cn } from "@oreilla/ui/lib/utils"
import { getInitials } from "@/utils/user-utils"
import { PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"

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

export default function MentionList({ candidates, selectedIndex, onSelect, className }: MentionListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current && candidates.length > 0) {
      const el = listRef.current.children[selectedIndex] as HTMLElement
      if (el) {
        el.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex, candidates.length])

  if (candidates.length === 0) return null

  return (
    <div
      ref={listRef}
      className={cn(
        "absolute z-50 w-auto min-w-[10rem] max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 whitespace-nowrap",
        className
      )}
      role="listbox"
    >
      <PopoverList>
        {candidates.map((user, index) => (
          <PopoverListItem
            key={user.id}
            onClick={() => onSelect(user)}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(index === selectedIndex ? "bg-muted/50 text-accent-foreground" : "")}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-[10px]">{getInitials(user.name || "U")}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium leading-none">{user.name}</span>
            </div>
          </PopoverListItem>
        ))}
      </PopoverList>
    </div>
  )
}
