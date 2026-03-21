"use client";

import React from "react";
import { TagIcon } from "@featul/ui/icons/tag";
import { client } from "@featul/api/client";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSlugFromPath } from "@/config/nav";
import {
  RequestMultiSelectFilter,
  useRequestMultiSelectFilter,
} from "./request-multi-select-filter";

type TagItem = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  count?: number;
};

type TagsResponse = {
  tags?: Array<{
    id?: string;
    name?: string;
    slug?: string;
    color?: string | null;
    count?: number;
  }>;
};

function parseTagsResponse(payload: TagsResponse | null): TagItem[] {
  const tags = Array.isArray(payload?.tags) ? payload.tags : [];
  return tags
    .filter(
      (
        tag,
      ): tag is Required<Pick<TagItem, "id" | "name" | "slug">> &
        Pick<TagItem, "color" | "count"> =>
        typeof tag?.id === "string" &&
        typeof tag?.name === "string" &&
        typeof tag?.slug === "string",
    )
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color ?? null,
      count: typeof tag.count === "number" ? tag.count : undefined,
    }));
}

export default function TagsAction({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";
  const queryClient = useQueryClient();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tags", slug],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
      const data = (await res.json().catch(() => null)) as TagsResponse | null;
      return parseTagsResponse(data);
    },
    staleTime: 300_000,
    gcTime: 300_000,
    enabled: Boolean(slug),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const tagValues = React.useMemo(
    () => items.map((item) => item.slug),
    [items],
  );
  const { open, setOpen, selected, isAllSelected, toggle, selectAll } =
    useRequestMultiSelectFilter({
      filterKey: "tag",
      popoverKey: "tags",
      values: tagValues,
    });

  React.useEffect(() => {
    if (open) {
      queryClient.prefetchQuery({
        queryKey: ["tags", slug],
        queryFn: async () => {
          const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
          const data = (await res
            .json()
            .catch(() => null)) as TagsResponse | null;
          return parseTagsResponse(data);
        },
        staleTime: 300_000,
        gcTime: 300_000,
      });
    }
  }, [open, queryClient, slug]);

  return (
    <RequestMultiSelectFilter
      open={open}
      onOpenChange={setOpen}
      className={className}
      ariaLabel="Tags"
      icon={<TagIcon className="w-4 h-4" size={16} />}
      items={items.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.slug,
        meta:
          typeof item.count === "number" ? (
            <span className="ml-auto text-xs text-accent tabular-nums">
              {item.count}
            </span>
          ) : undefined,
      }))}
      selected={selected}
      isAllSelected={isAllSelected}
      onToggle={toggle}
      onSelectAll={selectAll}
      isLoading={isLoading}
      emptyLabel="No tags"
    />
  );
}
