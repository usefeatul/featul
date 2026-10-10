import {
  ROADMAP_STATUSES,
  type RoadmapStatus,
} from "@/lib/roadmap";
import { parseArrayParam } from "@/utils/request";
import {
  getSingleSearchParam,
  type SearchParamValue,
} from "@/utils/search/params";

const roadmapStatusSet = new Set<string>(ROADMAP_STATUSES);

/** Read the public feedback roadmap-status filter from the URL. */
export function parseRoadmapStatusFilter(
  value: SearchParamValue,
): RoadmapStatus[] {
  return parseArrayParam(getSingleSearchParam(value)).filter(
    (status): status is RoadmapStatus => roadmapStatusSet.has(status),
  );
}
