"use client";

import RoadmapFiltersAction from "./actions/RoadmapFiltersAction";
import RoadmapSortAction from "./actions/RoadmapSortAction";
import RoadmapShortcutsHint from "./RoadmapShortcutsHint";
import { cn } from "@featul/ui/lib/utils";

const actionButtonClass =
  "size-8 rounded-md border-0 bg-black/5 p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08] hover:text-foreground dark:bg-[#292929] dark:hover:bg-[#303030]";

export default function RoadmapHeaderActions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={cn("ml-auto flex shrink-0 items-center gap-1", className)}>
      <RoadmapFiltersAction className={actionButtonClass} />
      <RoadmapSortAction className={actionButtonClass} />
      <RoadmapShortcutsHint className={actionButtonClass} />
    </div>
  );
}
