"use client"

import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import BoardsAction from "./actions/BoardsAction"
import StatusAction from "./actions/StatusAction"
import TagsAction from "./actions/TagsAction"
import SortAction from "./actions/SortAction"
import SearchAction from "./actions/SearchAction"
import StaleFilterAction from "./actions/StaleFilterAction"
import SnoozedFilterAction from "./actions/SnoozedFilterAction"
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction"

export default function HeaderActions({ className = "" }: { className?: string }) {
  return (
    <Toolbar size="sm" className={className}>
      <SearchAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <BoardsAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <StatusAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <TagsAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <SortAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <StaleFilterAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <SnoozedFilterAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <WorkspaceNotificationsAction />
    </Toolbar>
  )
}
