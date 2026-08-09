"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";

export function useRequestFilterLabels(slug: string) {
  const { data: boardsBySlug = {} } = useQuery({
    queryKey: ["boards-map", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug });
      const data = await res.json();
      const boardsArr = (data?.boards || []).filter(
        (board: { slug: string; name?: string | null }) =>
          board?.slug !== "roadmap" && board?.slug !== "changelog",
      );
      const map: Record<string, string> = {};
      for (const board of boardsArr) {
        map[String(board.slug)] = String(board.name || board.slug);
      }
      return map;
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: tagsBySlug = {} } = useQuery({
    queryKey: ["tags-map", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
      const data = await res.json();
      const tagsArr = data?.tags || [];
      const map: Record<string, string> = {};
      for (const tag of tagsArr) {
        map[String(tag.slug)] = String(tag.name || tag.slug);
      }
      return map;
    },
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { boardsBySlug, tagsBySlug };
}
