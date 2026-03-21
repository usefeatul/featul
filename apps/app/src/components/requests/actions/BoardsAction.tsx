"use client";

import React from "react";
import { LayersIcon } from "@featul/ui/icons/layers";
import { client } from "@featul/api/client";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSlugFromPath } from "@/config/nav";
import {
  RequestMultiSelectFilter,
  useRequestMultiSelectFilter,
} from "./request-multi-select-filter";

type BoardItem = {
  id: string;
  name: string;
  slug: string;
};

type BoardsResponse = {
  boards?: Array<{
    id?: string;
    name?: string;
    slug?: string;
  }>;
};

export default function BoardsAction({
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
      const data = (await res
        .json()
        .catch(() => null)) as BoardsResponse | null;
      const boards = (Array.isArray(data?.boards) ? data.boards : []).filter(
        (board): board is Required<Pick<BoardItem, "id" | "name" | "slug">> =>
          typeof board?.id === "string" &&
          typeof board?.name === "string" &&
          typeof board?.slug === "string" &&
          board.slug !== "roadmap" &&
          board.slug !== "changelog",
      );
      return boards.map(
        (board): BoardItem => ({
          id: board.id,
          name: board.name,
          slug: board.slug,
        }),
      );
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const boardValues = React.useMemo(
    () => items.map((item) => item.slug),
    [items],
  );
  const boardFilter = useRequestMultiSelectFilter({
    filterKey: "board",
    popoverKey: "boards",
    values: boardValues,
  });

  return (
    <RequestMultiSelectFilter
      open={boardFilter.open}
      onOpenChange={boardFilter.setOpen}
      className={className}
      ariaLabel="Boards"
      icon={<LayersIcon className="w-4 h-4" size={16} />}
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
