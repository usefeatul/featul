"use client";

import RoadmapSearchAction from "./actions/RoadmapSearchAction";
import RoadmapFiltersAction from "./actions/RoadmapFiltersAction";
import RoadmapSortAction from "./actions/RoadmapSortAction";
import RoadmapShortcutsHint from "./RoadmapShortcutsHint";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const actionButtonClass = cn(
  raisedSurfaceClass,
  "size-8 rounded-lg p-0 text-accent ring-0 before:hidden hover:text-foreground hover:brightness-[0.98] dark:hover:brightness-125",
);

export default function RoadmapHeaderActions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={cn("ml-auto flex shrink-0 items-center gap-1", className)}>
      <RoadmapSearchAction compact className={actionButtonClass} />
      <RoadmapFiltersAction className={actionButtonClass} />
      <RoadmapSortAction className={actionButtonClass} />
      <RoadmapShortcutsHint className={actionButtonClass} />
    </div>
  );
}
