"use client";

import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar";
import RoadmapSearchAction from "./actions/RoadmapSearchAction";
import RoadmapFiltersAction from "./actions/RoadmapFiltersAction";
import RoadmapSortAction from "./actions/RoadmapSortAction";
import RoadmapShortcutsHint from "./RoadmapShortcutsHint";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import { cn } from "@featul/ui/lib/utils";

export default function RoadmapHeaderActions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Toolbar size="sm" className={className}>
      <RoadmapSearchAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <RoadmapFiltersAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <RoadmapSortAction className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <RoadmapShortcutsHint className={cn(toolbarItemClass, "px-3")} />
      <ToolbarSeparator />
      <WorkspaceNotificationsAction />
    </Toolbar>
  );
}
