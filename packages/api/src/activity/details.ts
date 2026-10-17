import { ACTIVITY_ACTIONS } from "./actions";

export type ActivityTag = { name: string; color: string | null };
export type ActivityChange =
  | {
      kind: "status" | "title" | "content" | "board";
      before: string;
      after: string;
    }
  | { kind: "tags"; added: ActivityTag[]; removed: ActivityTag[] }
  | { kind: "pinned" | "locked" | "featured"; enabled: boolean }
  | { kind: "snooze"; until: string | null }
  | { kind: "merge"; title: string }
  | { kind: "images"; added: number; removed: number };
export type ActivityKind = ActivityChange["kind"] | "created" | "updated";

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function tags(value: unknown): ActivityTag[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== "object") return [];
    const tag = item as Record<string, unknown>;
    if (typeof tag.name !== "string" || !tag.name.trim()) return [];
    return [
      {
        name: tag.name,
        color:
          typeof tag.color === "string" && /^#[\da-f]{6}$/i.test(tag.color)
            ? tag.color
            : null,
      },
    ];
  });
}

/** Explicitly project safe display fields. Historical text and private properties stay in the workspace. */
export function getPostActivityDetails(
  action: string,
  metadata: unknown,
  internal: boolean,
): {
  kind: ActivityKind;
  changes: ActivityChange[];
} {
  const data =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>)
      : {};
  const changes: ActivityChange[] = [];
  const from = text(data.fromStatus);
  const to = text(data.toStatus);
  if (from && to && from !== to)
    changes.push({ kind: "status", before: from, after: to });

  if (internal) {
    for (const [kind, beforeKey, afterKey] of [
      ["title", "previousTitle", "nextTitle"],
      ["content", "previousContent", "nextContent"],
      ["board", "fromBoardName", "toBoardName"],
    ] as const) {
      const before = text(data[beforeKey]);
      const after = text(data[afterKey]);
      if (before !== undefined && after !== undefined && before !== after)
        changes.push({ kind, before, after });
    }
    const added = tags(data.addedTags);
    const removed = tags(data.removedTags);
    if (added.length || removed.length)
      changes.push({ kind: "tags", added, removed });
    for (const [key, kind] of [
      ["isPinned", "pinned"],
      ["isLocked", "locked"],
      ["isFeatured", "featured"],
    ] as const) {
      if (typeof data[key] === "boolean")
        changes.push({ kind, enabled: data[key] });
    }
    if (
      data.snoozedUntil === null ||
      (typeof data.snoozedUntil === "string" &&
        Number.isFinite(Date.parse(data.snoozedUntil)))
    ) {
      changes.push({
        kind: "snooze",
        until: data.snoozedUntil as string | null,
      });
    }
    if (
      action === ACTIVITY_ACTIONS.POST_MERGED &&
      typeof data.sourcePostTitle === "string"
    )
      changes.push({ kind: "merge", title: data.sourcePostTitle });
    const imagesAdded =
      typeof data.imagesAdded === "number" &&
      Number.isSafeInteger(data.imagesAdded) &&
      data.imagesAdded > 0
        ? data.imagesAdded
        : 0;
    const imagesRemoved =
      typeof data.imagesRemoved === "number" &&
      Number.isSafeInteger(data.imagesRemoved) &&
      data.imagesRemoved > 0
        ? data.imagesRemoved
        : 0;
    if (imagesAdded || imagesRemoved)
      changes.push({
        kind: "images",
        added: imagesAdded,
        removed: imagesRemoved,
      });
  }

  const kind: ActivityKind =
    changes[0]?.kind ??
    (action === ACTIVITY_ACTIONS.POST_CREATED
      ? "created"
      : action === ACTIVITY_ACTIONS.POST_MERGED
        ? "merge"
        : action === ACTIVITY_ACTIONS.POST_BOARD_UPDATED
          ? "board"
          : data.hasTitleChange === true
            ? "title"
            : data.hasContentChange === true
              ? "content"
              : internal && data.hasTagsChange === true
                ? "tags"
                : "updated");
  return { kind, changes };
}
