"use client"

import React from "react"
import { MoreVertical } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@oreilla/ui/components/popover"
import CommentDeleteAction from "./CommentDeleteAction"
import CommentReportAction from "./CommentReportAction"
import CommentEditAction from "./CommentEditAction"
import CommentPinAction from "./CommentPinAction"
import CommentReportDialog from "./CommentReportDialog"

interface CommentActionsProps {
  commentId: string
  postId: string
  isAuthor: boolean
  canDelete?: boolean
  canPin?: boolean
  isPinned?: boolean
  onEdit?: () => void
  onDeleteSuccess?: () => void
}

export default function CommentActions({
  commentId,
  postId,
  isAuthor,
  canDelete = false,
  canPin = false,
  isPinned = false,
  onEdit,
  onDeleteSuccess,
}: CommentActionsProps) {
  const [open, setOpen] = React.useState(false)
  const [showReportDialog, setShowReportDialog] = React.useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="h-6 w-6 flex items-center justify-center rounded-md  text-xs text-muted-foreground/60 hover:text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" list>
          <PopoverList>
            {canPin && (
              <CommentPinAction
                commentId={commentId}
                isPinned={isPinned}
                onSuccess={onDeleteSuccess}
                onCloseMenu={() => setOpen(false)}
              />
            )}
            {isAuthor ? (
              <>
                {onEdit && (
                  <CommentEditAction onEdit={onEdit} onCloseMenu={() => setOpen(false)} />
                )}
                {canDelete && (
                  <CommentDeleteAction 
                    commentId={commentId}
                    postId={postId}
                    onSuccess={onDeleteSuccess}
                    onCloseMenu={() => setOpen(false)} 
                  />
                )}
              </>
            ) : (
              <>
                {canDelete && (
                  <CommentDeleteAction 
                    commentId={commentId}
                    postId={postId}
                    onSuccess={onDeleteSuccess} 
                    onCloseMenu={() => setOpen(false)} 
                  />
                )}
                <CommentReportAction 
                  onClick={() => {
                    setOpen(false)
                    setShowReportDialog(true)
                  }}
                />
              </>
            )}
          </PopoverList>
        </PopoverContent>
      </Popover>
      
      <CommentReportDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog} 
        commentId={commentId} 
      />
    </>
  )
}
