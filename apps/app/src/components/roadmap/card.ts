import { normalizeRoadmapStatus, type RoadmapStatus } from "@/lib/roadmap";

export type RoadmapStatusTone = {
  footer: string;
  icon: string;
};

const ROADMAP_STATUS_TONES: Record<RoadmapStatus, RoadmapStatusTone> = {
  pending: {
    footer: "bg-zinc-100/80 dark:bg-zinc-500/10",
    icon: "text-zinc-500 dark:text-zinc-300",
  },
  review: {
    footer: "bg-violet-50/80 dark:bg-violet-500/10",
    icon: "text-violet-500 dark:text-violet-300",
  },
  planned: {
    footer: "bg-amber-50/80 dark:bg-amber-500/10",
    icon: "text-amber-500 dark:text-amber-300",
  },
  progress: {
    footer: "bg-blue-50/80 dark:bg-blue-500/10",
    icon: "text-blue-500 dark:text-blue-300",
  },
  completed: {
    footer: "bg-emerald-50/80 dark:bg-emerald-500/10",
    icon: "text-emerald-500 dark:text-emerald-300",
  },
  closed: {
    footer: "bg-red-50/80 dark:bg-red-500/10",
    icon: "text-red-500 dark:text-red-300",
  },
};

function toPlainText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function getRoadmapStatusTone(status?: string | null): RoadmapStatusTone {
  const normalizedStatus = normalizeRoadmapStatus(status);
  return ROADMAP_STATUS_TONES[normalizedStatus];
}

export function buildRoadmapPreview(
  content?: string | null,
  boardName?: string | null,
): string {
  const plainContent = toPlainText(content);
  if (plainContent) return plainContent;
  const boardLabel = boardName?.trim() || "Board";
  return `In ${boardLabel} board`;
}

export function formatRoadmapCardDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(parsed);
}
