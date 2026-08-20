"use client"

import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"
import SearchAction from "./actions/SearchAction"
import FiltersAction from "./actions/FiltersAction"
import SortAction from "./actions/SortAction"
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction"
import { cn } from "@featul/ui/lib/utils"

export default function HeaderActions({ className = "" }: { className?: string }) {
  return (
    <Toolbar size="sm" className={className}>
      <SearchAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <FiltersAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <SortAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <WorkspaceNotificationsAction />
    </Toolbar>
  )
}
