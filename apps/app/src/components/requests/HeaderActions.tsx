"use client"

import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import BoardsAction from "./actions/BoardsAction"
import StatusAction from "./actions/StatusAction"
import TagsAction from "./actions/TagsAction"
import SortAction from "./actions/SortAction"
import SearchAction from "./actions/SearchAction"
import { workspaceToolbarIconButtonClassName } from "./workspaceToolbarStyles"

export default function HeaderActions({ className = "" }: { className?: string }) {
  const buttonClassName = cn(workspaceToolbarIconButtonClassName, "h-8 w-8 p-0")

  return (
    <Toolbar
      size="sm"
      variant="plain"
      className={cn("ml-auto h-8", className)}
    >
      <SearchAction className={buttonClassName} />
      <ToolbarSeparator />
      <BoardsAction className={buttonClassName} />
      <ToolbarSeparator />
      <StatusAction className={buttonClassName} />
      <ToolbarSeparator />
      <TagsAction className={buttonClassName} />
      <ToolbarSeparator />
      <SortAction className={buttonClassName} />
    </Toolbar>
  )
}
