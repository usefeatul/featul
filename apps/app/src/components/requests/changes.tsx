"use client";

import type {
  ActivityChange,
  ActivityKind,
} from "@featul/api/activity/details";
import {
  ArrowRight,
  BoardIcon,
  Clock,
  EditIcon,
  History,
  ImageIcon,
  LockIcon,
  MergeIcon,
  PinIcon,
  PlusIcon,
  StarIcon,
  TagIcon,
  ChevronDownIcon,
} from "@/components/global/icons";
import StatusIcon from "./StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { cn } from "@featul/ui/lib/utils";

const icons = {
  created: PlusIcon,
  updated: History,
  status: History,
  title: EditIcon,
  content: EditIcon,
  board: BoardIcon,
  tags: TagIcon,
  pinned: PinIcon,
  locked: LockIcon,
  featured: StarIcon,
  snooze: Clock,
  merge: MergeIcon,
  images: ImageIcon,
};

export function ActivitySymbol({
  kind,
  status,
  className,
}: {
  kind: ActivityKind;
  status?: string;
  className?: string;
}) {
  if (kind === "status" && status)
    return <StatusIcon status={status} className={className} />;
  const Icon = icons[kind] ?? History;
  return <Icon className={className} />;
}

const chip = "inline-flex max-w-full items-center gap-1.5 text-xs font-medium";

function Transition({
  change,
}: {
  change: Extract<ActivityChange, { before: string }>;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={`${change.kind === "status" ? "Status" : "Board"} change`}
    >
      <span className={cn(chip, "text-muted-foreground")}>
        {change.kind === "status" && (
          <StatusIcon status={change.before} className="size-3.5 shrink-0" />
        )}
        <span className="wrap-break-word">
          {change.kind === "status"
            ? statusLabel(change.before)
            : change.before}
        </span>
      </span>
      <ArrowRight
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-label="changed to"
      />
      <span className={chip}>
        {change.kind === "status" && (
          <StatusIcon status={change.after} className="size-3.5 shrink-0" />
        )}
        <span className="wrap-break-word">
          {change.kind === "status" ? statusLabel(change.after) : change.after}
        </span>
      </span>
    </div>
  );
}

function TextChange({
  change,
}: {
  change: Extract<ActivityChange, { before: string }>;
}) {
  const preview = (
    <div className="space-y-3 border-l-2 border-border/60 pl-3 text-xs leading-6">
      {(["before", "after"] as const).map((side) => (
        <div key={side} className="min-w-0">
          <div className="mb-0.5 text-xs text-muted-foreground">
            {side === "before" ? "Before" : "After"}
          </div>
          <p
            className={cn(
              "max-h-48 overflow-y-auto whitespace-pre-wrap wrap-break-word",
              side === "before" && "text-muted-foreground",
            )}
          >
            {change[side] || <span className="italic">Empty</span>}
          </p>
        </div>
      ))}
    </div>
  );
  return (
    <details className="group/change">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon className="size-3.5 -rotate-90 transition-transform group-open/change:rotate-0" />
        View {change.kind === "title" ? "title" : "description"} changes
      </summary>
      <div className="mt-2">{preview}</div>
    </details>
  );
}

export default function Changes({
  changes,
  inline = false,
}: {
  changes: ActivityChange[];
  inline?: boolean;
}) {
  if (!changes.length) return null;
  return (
    <div
      className={
        inline ? "inline-flex flex-wrap items-center gap-2" : "mt-1.5 space-y-2"
      }
    >
      {changes.map((change, index) => {
        const key = `${change.kind}-${index}`;
        switch (change.kind) {
          case "status":
          case "board":
            return <Transition key={key} change={change} />;
          case "title":
          case "content":
            return <TextChange key={key} change={change} />;
          case "tags":
            return (
              <div key={key} className="flex flex-wrap gap-1.5">
                {(["removed", "added"] as const).flatMap((operation) =>
                  change[operation].map((tag, i) => (
                    <span
                      key={`${operation}-${i}`}
                      className={cn(
                        chip,
                        "rounded bg-muted/50 px-1.5 leading-5",
                      )}
                    >
                      <span
                        className="text-muted-foreground"
                        aria-label={operation}
                      >
                        {operation === "added" ? "+" : "−"}
                      </span>
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
                        style={
                          tag.color ? { backgroundColor: tag.color } : undefined
                        }
                      />
                      <span
                        className={cn(
                          "wrap-break-word",
                          operation === "removed" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {tag.name}
                      </span>
                    </span>
                  )),
                )}
              </div>
            );
          case "pinned":
          case "locked":
          case "featured":
            return (
              <span key={key} className={chip}>
                <ActivitySymbol kind={change.kind} className="size-3.5" />
                {change.enabled
                  ? {
                      pinned: "Pinned",
                      locked: "Locked",
                      featured: "Featured",
                    }[change.kind]
                  : {
                      pinned: "Unpinned",
                      locked: "Unlocked",
                      featured: "Unfeatured",
                    }[change.kind]}
              </span>
            );
          case "snooze":
            return (
              <p key={key} className="text-xs text-muted-foreground">
                {change.until ? (
                  <>
                    Snoozed until{" "}
                    <time dateTime={change.until}>
                      {new Date(change.until).toLocaleString()}
                    </time>
                  </>
                ) : (
                  "Snooze removed"
                )}
              </p>
            );
          case "merge":
            return (
              <div key={key} className={chip}>
                <MergeIcon className="size-3.5 shrink-0" />
                <span className="wrap-break-word">{change.title}</span>
              </div>
            );
          case "images":
            return (
              <p key={key} className="text-xs text-muted-foreground">
                {[
                  change.added
                    ? `${change.added} image${change.added === 1 ? "" : "s"} added`
                    : "",
                  change.removed
                    ? `${change.removed} image${change.removed === 1 ? "" : "s"} removed`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            );
        }
      })}
    </div>
  );
}
