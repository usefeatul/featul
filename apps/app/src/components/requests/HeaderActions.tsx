"use client"

import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import SearchAction from "./actions/SearchAction"
import FiltersAction from "./actions/FiltersAction"
import SortAction from "./actions/SortAction"
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction"

export default function HeaderActions({ className = "" }: { className?: string }) {
  return (
    <Toolbar size="sm" className={className}>
      <SearchAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <FiltersAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <SortAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <WorkspaceNotificationsAction />
    </Toolbar>
  )
}
