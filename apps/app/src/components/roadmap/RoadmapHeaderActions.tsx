"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar";
import { Button } from "@featul/ui/components/button";
import { getSlugFromPath } from "@/config/nav";
import RoadmapSearchAction from "./actions/RoadmapSearchAction";
import RoadmapBoardsAction from "./actions/RoadmapBoardsAction";
import RoadmapTagsAction from "./actions/RoadmapTagsAction";
import RoadmapSortAction from "./actions/RoadmapSortAction";
import RoadmapShortcutsHint from "./RoadmapShortcutsHint";

export default function RoadmapHeaderActions({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const swimlanes = searchParams.get("swimlanes") === "1";

  const toggleSwimlanes = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (swimlanes) params.delete("swimlanes");
    else params.set("swimlanes", "1");
    const qs = params.toString();
    router.push(`/workspaces/${slug}/roadmap${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <Toolbar size="sm" className={className}>
      <RoadmapSearchAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapBoardsAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapTagsAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <RoadmapSortAction className="h-full rounded-none border-none hover:bg-muted px-3" />
      <ToolbarSeparator />
      <Button
        type="button"
        variant="card"
        size="sm"
        className="h-full rounded-none border-none px-3 text-xs hover:bg-muted"
        aria-pressed={swimlanes}
        onClick={toggleSwimlanes}
      >
        Swimlanes
      </Button>
      <ToolbarSeparator />
      <RoadmapShortcutsHint className="h-full rounded-none border-none hover:bg-muted px-3" />
    </Toolbar>
  );
}
