import type { ActivityChange, ActivityKind } from "./details";
import { ACTIVITY_ACTIONS } from "./actions";

// Deliberately excludes reports, votes and comment events (including internal notes).
export const POST_TIMELINE_ACTIONS = [
  ACTIVITY_ACTIONS.POST_CREATED,
  ACTIVITY_ACTIONS.POST_UPDATED,
  ACTIVITY_ACTIONS.POST_META_UPDATED,
  ACTIVITY_ACTIONS.POST_BOARD_UPDATED,
  ACTIVITY_ACTIONS.POST_MERGED,
] as const;

export type PostActivityItem = {
  kind: ActivityKind;
  changes: ActivityChange[];
  id: string;
  createdAt: string;
  description: string;
  actor: {
    name: string;
    image: string | null;
    role: "admin" | "member" | "viewer" | null;
    isOwner: boolean;
  };
};

export type PostActivityPage = {
  totalCount: number;
  items: PostActivityItem[];
  nextOffset: number | null;
};

function statusLabel(value: unknown) {
  return typeof value === "string" ? value.replace(/[_-]+/g, " ") : "";
}

/** Return display text only; raw audit metadata must never reach public clients. */
export function describePostActivity(
  action: string,
  metadata: unknown,
  internal: boolean,
): string {
  const data =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>)
      : {};
  if (action === ACTIVITY_ACTIONS.POST_CREATED) return "created this post";
  if (action === ACTIVITY_ACTIONS.POST_MERGED)
    return "merged a post into this request";
  if (action === ACTIVITY_ACTIONS.POST_BOARD_UPDATED)
    return "moved this post to another board";

  const changes: string[] = [];
  const from = statusLabel(data.fromStatus);
  const to = statusLabel(data.toStatus);
  if (from && to && from !== to)
    changes.push(`changed status from ${from} to ${to}`);
  if (data.hasTitleChange === true) changes.push("updated the title");
  if (data.hasContentChange === true) changes.push("updated the description");
  if (internal) {
    if (data.hasTagsChange === true) changes.push("updated tags");
    if (typeof data.isPinned === "boolean")
      changes.push(data.isPinned ? "pinned this post" : "unpinned this post");
    if (typeof data.isLocked === "boolean")
      changes.push(data.isLocked ? "locked this post" : "unlocked this post");
    if (typeof data.isFeatured === "boolean")
      changes.push(
        data.isFeatured ? "featured this post" : "unfeatured this post",
      );
    if ("snoozedUntil" in data)
      changes.push(
        data.snoozedUntil ? "snoozed this post" : "removed the snooze",
      );
  }
  return changes.length ? changes.join("; ") : "updated this post";
}
