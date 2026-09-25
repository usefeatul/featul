"use client"

import React from "react"
import { PopoverListItem } from "@featul/ui/components/popover"
import { EditIcon } from "@/components/global/icons"

interface CommentEditActionProps {
  onEdit?: () => void
  onCloseMenu?: () => void
}

export default function CommentEditAction({ onEdit, onCloseMenu }: CommentEditActionProps) {
  const handleEdit = () => {
    onEdit?.()
    onCloseMenu?.()
  }

  return (
    <PopoverListItem onClick={handleEdit}>
      <EditIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-sm">Edit</span>
    </PopoverListItem>
  )
}

