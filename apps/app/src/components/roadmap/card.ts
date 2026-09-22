import { normalizeRoadmapStatus, type RoadmapStatus } from "@/lib/roadmap";

export type RoadmapStatusTone = {
  color: string;
};

const ROADMAP_STATUS_TONES: Record<RoadmapStatus, RoadmapStatusTone> = {
  pending: {
    color: "#8A8A8A",
  },
  review: {
    color: "#a855f7",
  },
  planned: {
    color: "#f59e0b",
  },
  progress: {
    color: "#4d96e8",
  },
  completed: {
    color: "#15CF59",
  },
  closed: {
    color: "#FA3434",
  },
};

/** Strip HTML to a single-line preview. */
function toPlainText(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Display colour for a normalized roadmap status. */
export function getRoadmapStatusTone(
  status?: string | null,
): RoadmapStatusTone {
  const normalizedStatus = normalizeRoadmapStatus(status);
  return ROADMAP_STATUS_TONES[normalizedStatus];
}

/** Card preview from content, or `In {board} board` when empty. */
export function buildRoadmapPreview(
  content?: string | null,
  boardName?: string | null,
): string {
  const plainContent = toPlainText(content);
  if (plainContent) return plainContent;
  const boardLabel = boardName?.trim() || "Board";
  return `In ${boardLabel} board`;
}

/** Month + day for roadmap cards. Invalid dates return null. */
export function formatRoadmapCardDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}
