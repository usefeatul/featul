"use client"

import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import BoardsAction from "./actions/BoardsAction"
import StatusAction from "./actions/StatusAction"
import TagsAction from "./actions/TagsAction"
import SortAction from "./actions/SortAction"
import SearchAction from "./actions/SearchAction"

export default function HeaderActions({ className = "" }: { className?: string }) {
  const buttonClassName =
    "h-8 w-8 rounded-none border-0 px-0 shadow-none ring-0 ring-offset-0 hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:bg-white/10"

  return (
    <Toolbar
      size="sm"
      variant="plain"
      className={cn(
        "ml-auto h-8 border-border bg-background shadow-none ring-0 ring-offset-0",
        className
      )}
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
