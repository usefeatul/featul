"use client";

import React from "react";
import { TagIcon } from "@featul/ui/icons/tag";
import { client } from "@featul/api/client";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSlugFromPath } from "@/config/nav";
import { RequestMultiSelectFilter } from "@/components/requests/actions/request-multi-select-filter";
import { useRoadmapMultiSelectFilter } from "./useRoadmapMultiSelectFilter";

type TagItem = {
  id: string;
  name: string;
  slug: string;
};

export default function RoadmapTagsAction({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tags", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
      const data = (await res.json().catch(() => null)) as {
        tags?: Array<{ id?: string; name?: string; slug?: string }>;
      } | null;
      return (Array.isArray(data?.tags) ? data.tags : [])
        .filter(
          (tag): tag is TagItem =>
            typeof tag?.id === "string" &&
            typeof tag?.name === "string" &&
            typeof tag?.slug === "string",
        )
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }));
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const tagValues = React.useMemo(() => items.map((item) => item.slug), [items]);
  const tagFilter = useRoadmapMultiSelectFilter({
    filterKey: "tag",
    popoverKey: "roadmap-tags",
    values: tagValues,
  });

  return (
    <RequestMultiSelectFilter
      open={tagFilter.open}
      onOpenChange={tagFilter.setOpen}
      className={className}
      ariaLabel="Tags"
      icon={<TagIcon className="size-4" size={16} />}
      items={items.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.slug,
      }))}
      selected={tagFilter.selected}
      isAllSelected={tagFilter.isAllSelected}
      onToggle={tagFilter.toggle}
      onSelectAll={tagFilter.selectAll}
      isLoading={isLoading}
      emptyLabel="No tags"
    />
  );
}
