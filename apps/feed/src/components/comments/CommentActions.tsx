"use client"

import React from "react"
import { MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover"

interface CommentActionsProps {
  isAuthor: boolean
  canDelete?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
}

export default function CommentActions({
  isAuthor,
  canDelete = false,
  onEdit,
  onDelete,
  onReport,
}: CommentActionsProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" list>
        <PopoverList>
          {isAuthor ? (
            <>
              {onEdit && (
                <PopoverListItem onClick={() => { onEdit(); setOpen(false); }}>
                  <Pencil className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm">Edit</span>
                </PopoverListItem>
              )}
              {canDelete && onDelete && (
                <PopoverListItem
                  onClick={() => { onDelete(); setOpen(false); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm">Delete</span>
                </PopoverListItem>
              )}
            </>
          ) : (
            <>
              {canDelete && onDelete && (
                <PopoverListItem
                  onClick={() => { onDelete(); setOpen(false); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm">Delete</span>
                </PopoverListItem>
              )}
              {onReport && (
                <PopoverListItem onClick={() => { onReport(); setOpen(false); }}>
                  <Flag className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm">Report</span>
                </PopoverListItem>
              )}
            </>
          )}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}

