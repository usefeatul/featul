"use client";

import React from "react";
import { LayersIcon } from "@featul/ui/icons/layers";
import { client } from "@featul/api/client";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSlugFromPath } from "@/config/nav";
import { RequestMultiSelectFilter } from "@/components/requests/actions/request-multi-select-filter";
import { useRoadmapMultiSelectFilter } from "./useRoadmapMultiSelectFilter";

type BoardItem = {
  id: string;
  name: string;
  slug: string;
};

export default function RoadmapBoardsAction({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["boards", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug });
      const data = (await res.json().catch(() => null)) as {
        boards?: Array<{ id?: string; name?: string; slug?: string }>;
      } | null;
      return (Array.isArray(data?.boards) ? data.boards : [])
        .filter(
          (board): board is BoardItem =>
            typeof board?.id === "string" &&
            typeof board?.name === "string" &&
            typeof board?.slug === "string" &&
            board.slug !== "roadmap" &&
            board.slug !== "changelog",
        )
        .map((board) => ({
          id: board.id,
          name: board.name,
          slug: board.slug,
        }));
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const boardValues = React.useMemo(
    () => items.map((item) => item.slug),
    [items],
  );
  const boardFilter = useRoadmapMultiSelectFilter({
    filterKey: "board",
    popoverKey: "roadmap-boards",
    values: boardValues,
  });

  return (
    <RequestMultiSelectFilter
      open={boardFilter.open}
      onOpenChange={boardFilter.setOpen}
      className={className}
      ariaLabel="Boards"
      icon={<LayersIcon className="size-4" size={16} />}
      items={items.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.slug,
      }))}
      selected={boardFilter.selected}
      isAllSelected={boardFilter.isAllSelected}
      onToggle={boardFilter.toggle}
      onSelectAll={boardFilter.selectAll}
      isLoading={isLoading}
      emptyLabel="No boards"
    />
  );
}
