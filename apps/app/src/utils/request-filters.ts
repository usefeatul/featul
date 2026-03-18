import { parseSortOrder, type SortOrder } from "@/types/sort";
import { parseArrayParam } from "@/utils/request";
import { getSingleSearchParam, type SearchParamValue } from "@/utils/search-params";

type RequestFilterKey = "status" | "board" | "tag" | "order" | "search";
type SearchParamsLike = { get: (key: RequestFilterKey) => string | null };

export type RequestFilterQueryShape = {
  status?: SearchParamValue;
  board?: SearchParamValue;
  tag?: SearchParamValue;
  order?: SearchParamValue;
  search?: SearchParamValue;
};

export type ParsedRequestFilters = {
  status: string[];
  board: string[];
  tag: string[];
  order: SortOrder;
  search: string;
};

function parseRequestFilters(params: SearchParamsLike): ParsedRequestFilters {
  return {
    status: parseArrayParam(params.get("status")).map((s) =>
      String(s).toLowerCase()
    ),
    board: parseArrayParam(params.get("board")),
    tag: parseArrayParam(params.get("tag")),
    order: parseSortOrder(params.get("order")),
    search: params.get("search") || "",
  };
}

export function parseRequestFiltersFromSearchParams(
  params: SearchParamsLike
): ParsedRequestFilters {
  return parseRequestFilters(params);
}

export function parseRequestFiltersFromRecord(
  params: RequestFilterQueryShape
): ParsedRequestFilters {
  return parseRequestFilters({
    get: (key: RequestFilterKey) => getSingleSearchParam(params[key]),
  });
}
