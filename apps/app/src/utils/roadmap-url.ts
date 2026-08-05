import { parseSortOrder, type SortOrder } from "@/types/sort";
import { encodeArray, parseArrayParam } from "@/utils/request";

type SearchParamsLike = { get: (key: string) => string | null };

export type ParsedRoadmapFilters = {
  board: string[];
  tag: string[];
  order: SortOrder;
  search: string;
};

export function parseRoadmapFiltersFromSearchParams(
  params: SearchParamsLike,
): ParsedRoadmapFilters {
  return {
    board: parseArrayParam(params.get("board")),
    tag: parseArrayParam(params.get("tag")),
    order: parseSortOrder(params.get("order")),
    search: params.get("search") || "",
  };
}

export function buildRoadmapUrl(
  slug: string,
  prev: SearchParamsLike,
  overrides: Partial<{
    board: string[];
    tag: string[];
    order: string;
    search: string;
  }>,
): string {
  const params = new URLSearchParams();
  const board =
    overrides.board !== undefined
      ? encodeArray(overrides.board)
      : prev.get("board") || encodeArray([]);
  const tag =
    overrides.tag !== undefined
      ? encodeArray(overrides.tag)
      : prev.get("tag") || encodeArray([]);
  const order = overrides.order || prev.get("order") || "newest";
  const search = overrides.search ?? prev.get("search") ?? "";

  if (board !== encodeArray([])) params.set("board", board);
  if (tag !== encodeArray([])) params.set("tag", tag);
  if (order !== "newest") params.set("order", order);
  if (search) params.set("search", search);

  const qs = params.toString();
  return `/workspaces/${slug}/roadmap${qs ? `?${qs}` : ""}`;
}
