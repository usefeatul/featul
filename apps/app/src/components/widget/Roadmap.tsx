"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { toPlain } from "./utils";
import type { IdentifiedUser, WidgetApiBase } from "./types";
import { WidgetVoteButton } from "./VoteButton";

export type WidgetRoadmapItem = {
  id: string;
  title: string;
  content?: string | null;
  roadmapStatus: string | null;
  upvotes: number | null;
  hasVoted?: boolean;
  authorName?: string | null;
  authorImage?: string | null;
  isAnonymous?: boolean | null;
};

const SECTIONS = [
  { key: "progress", label: "In progress", status: "progress" },
  { key: "planned", label: "Planned", status: "planned" },
  { key: "completed", label: "Done", status: "completed" },
] as const;

const INITIAL_VISIBLE = 4;

type Props = {
  items: WidgetRoadmapItem[];
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
};

export function WidgetRoadmap({
  items,
  apiBase,
  userId,
  identity,
  onVoteChange,
}: Props) {
  const grouped = React.useMemo(() => {
    const buckets: Record<(typeof SECTIONS)[number]["key"], WidgetRoadmapItem[]> = {
      progress: [],
      planned: [],
      completed: [],
    };
    for (const item of items) {
      const status = normalizeRoadmapStatus(item.roadmapStatus, "planned");
      if (status === "progress") buckets.progress.push(item);
      else if (status === "completed") buckets.completed.push(item);
      else if (status === "planned") buckets.planned.push(item);
    }
    return buckets;
  }, [items]);

  const hasAny = SECTIONS.some((section) => grouped[section.key].length > 0);

  return (
    <div className="space-y-6 pb-2">
      {!hasAny ? (
        <p className="px-1 text-sm text-white/45">No public roadmap items yet.</p>
      ) : null}
      {SECTIONS.map((section) => (
        <RoadmapSection
          key={section.key}
          label={section.label}
          status={section.status}
          items={grouped[section.key]}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          onVoteChange={onVoteChange}
          alwaysShow={hasAny}
        />
      ))}
    </div>
  );
}

function RoadmapSection({
  label,
  status,
  items,
  apiBase,
  userId,
  identity,
  onVoteChange,
  alwaysShow = false,
}: {
  label: string;
  status: string;
  items: WidgetRoadmapItem[];
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  alwaysShow?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  if (!alwaysShow && !items.length) return null;

  const visible = expanded ? items : items.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, items.length - visible.length);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <StatusIcon status={status} className="size-4 shrink-0" />
        <h3 className="flex-1 text-sm font-semibold text-white">{label}</h3>
        <span className="tabular-nums text-xs text-white/35">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      {items.length ? (
        <div className="relative space-y-0">
          <div
            aria-hidden
            className="absolute bottom-3 left-[7px] top-3 w-px bg-white/10"
          />
          {visible.map((item) => (
            <RoadmapItem
              key={item.id}
              item={item}
              status={status}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              onVoteChange={onVoteChange}
            />
          ))}
        </div>
      ) : (
        <p className="pb-1 pl-6 text-xs text-white/30">Nothing here yet</p>
      )}

      {!expanded && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 pl-6 text-xs text-white/45 transition-colors hover:text-white/75"
        >
          Show more
          <ChevronDown className="size-3.5" />
        </button>
      ) : null}
      {expanded && items.length > INITIAL_VISIBLE ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 pl-6 text-xs text-white/45 transition-colors hover:text-white/75"
        >
          Show less
          <ChevronDown className="size-3.5 rotate-180" />
        </button>
      ) : null}
    </section>
  );
}

function RoadmapItem({
  item,
  status,
  apiBase,
  userId,
  identity,
  onVoteChange,
}: {
  item: WidgetRoadmapItem;
  status: string;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";
  const excerpt = toPlain(item.content);

  return (
    <div className="relative flex items-start gap-3 py-3">
      <div className="relative z-[1] mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[#171717]">
        <StatusIcon status={status} className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-white">{item.title}</p>
        {excerpt ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">{excerpt}</p>
        ) : null}
        <p className="mt-1.5 truncate text-[11px] text-white/35">{author}</p>
      </div>
      <WidgetVoteButton
        postId={item.id}
        upvotes={item.upvotes || 0}
        hasVoted={Boolean(item.hasVoted)}
        apiBase={apiBase}
        userId={userId}
        identity={identity}
        variant="plain"
        className="shrink-0"
        onChange={({ upvotes, hasVoted }) => onVoteChange?.(item.id, upvotes, hasVoted)}
      />
    </div>
  );
}
