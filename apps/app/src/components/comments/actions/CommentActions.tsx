"use client"

import React from "react"
import { MoreVertical } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
} from "@featul/ui/components/popover"
import { Button } from "@featul/ui/components/button"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import CommentDeleteAction from "./CommentDeleteAction"
import CommentReportAction from "./CommentReportAction"
import CommentEditAction from "./CommentEditAction"
import CommentPinAction from "./CommentPinAction"
import CommentVisibilityAction from "./CommentVisibilityAction"
import CommentReportDialog from "./CommentReportDialog"
import type { CommentSurface } from "@/lib/comment/shared"

interface CommentActionsProps {
  commentId: string
  postId: string
  surface?: CommentSurface
  isAuthor: boolean
  canDelete?: boolean
  canPin?: boolean
  isPinned?: boolean
  isInternal?: boolean
  canToggleVisibility?: boolean
  onEdit?: () => void
  onDeleteSuccess?: () => void
}

export default function CommentActions({
  commentId,
  postId,
  surface = "workspace",
  isAuthor,
  canDelete = false,
  canPin = false,
  isPinned = false,
  isInternal = false,
  canToggleVisibility = false,
  onEdit,
  onDeleteSuccess,
}: CommentActionsProps) {
  const [open, setOpen] = React.useState(false)
  const [showReportDialog, setShowReportDialog] = React.useState(false)

  return (
    <>
      <Toolbar size="sm" className="w-fit">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="plain"
              size="xs"
              className={cn(toolbarItemClass, "h-8 w-8 px-0")}
              aria-label="More options"
            >
              <MoreVertical className="size-3.5" />
            </Button>
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
                {canToggleVisibility && (
                  <CommentVisibilityAction
                    commentId={commentId}
                    isInternal={isInternal}
                    onSuccess={onDeleteSuccess}
                    onCloseMenu={() => setOpen(false)}
                  />
                )}
                {canDelete && (
                  <CommentDeleteAction 
                    commentId={commentId}
                    postId={postId}
                    surface={surface}
                    onSuccess={onDeleteSuccess}
                    onCloseMenu={() => setOpen(false)} 
                  />
                )}
              </>
            ) : (
              <>
                {canToggleVisibility && (
                  <CommentVisibilityAction
                    commentId={commentId}
                    isInternal={isInternal}
                    onSuccess={onDeleteSuccess}
                    onCloseMenu={() => setOpen(false)}
                  />
                )}
                {canDelete && (
                  <CommentDeleteAction 
                    commentId={commentId}
                    postId={postId}
                    surface={surface}
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
      </Toolbar>
      
      <CommentReportDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog} 
        commentId={commentId} 
      />
    </>
  )
}
