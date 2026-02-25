export const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const;

export type StatusKey = (typeof STATUSES)[number];

export function normalizeStatus(s: string): StatusKey {
  const raw = (s || "pending").trim().toLowerCase().replace(/[\s-]+/g, "");
  const map: Record<string, StatusKey> = {
    pending: "pending",
    backlog: "pending",
    todo: "pending",
    open: "pending",
    review: "review",
    inreview: "review",
    inreviewing: "review",
    underreview: "review",
    testing: "review",
    planned: "planned",
    plan: "planned",
    scheduled: "planned",
    progress: "progress",
    inprogress: "progress",
    indevelopment: "progress",
    active: "progress",
    completed: "completed",
    complete: "completed",
    done: "completed",
    shipped: "completed",
    closed: "closed",
    archived: "closed",
    rejected: "closed",
  };
  return map[raw] || "pending";
}
