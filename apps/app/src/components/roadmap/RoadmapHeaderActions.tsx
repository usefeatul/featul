"use client";

import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar";
import RoadmapSearchAction from "./actions/RoadmapSearchAction";
import RoadmapFiltersAction from "./actions/RoadmapFiltersAction";
import RoadmapSortAction from "./actions/RoadmapSortAction";
import RoadmapShortcutsHint from "./RoadmapShortcutsHint";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";

export default function RoadmapHeaderActions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Toolbar size="sm" className={className}>
      <RoadmapSearchAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapFiltersAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapSortAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapShortcutsHint className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <WorkspaceNotificationsAction />
    </Toolbar>
  );
}
