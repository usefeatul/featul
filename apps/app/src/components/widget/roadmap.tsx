"use client";

import * as React from "react";
import { ChevronDown } from "@/components/global/icons";
import { FillRoadmapIcon } from "@featul/ui/icons/fill-roadmap";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { toPlain } from "./utils";
import type { IdentifiedUser, WidgetApiBase } from "./types";
import { WidgetAuthorAvatar } from "./avatar";
import { WidgetEmpty, WidgetEmptyPlaceholders } from "./empty";
import { WidgetVoteButton } from "./vote";

export type WidgetRoadmapItem = {
  id: string;
  title: string;
  content?: string | null;
  slug?: string | null;
  roadmapStatus: string | null;
  upvotes: number | null;
  hasVoted?: boolean;
  authorName?: string | null;
  authorImage?: string | null;
  isAnonymous?: boolean | null;
  createdAt?: string | Date | null;
};

const SECTIONS = [
  { key: "progress", label: "In progress", status: "progress" },
  { key: "planned", label: "Planned", status: "planned" },
  { key: "completed", label: "Done", status: "completed" },
] as const;

const INITIAL_VISIBLE = 6;

type SectionKey = (typeof SECTIONS)[number]["key"];

type Props = {
  items: WidgetRoadmapItem[];
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  onOpen?: (item: WidgetRoadmapItem) => void;
};

export function WidgetRoadmap({
  items,
  apiBase,
  userId,
  identity,
  onVoteChange,
  onOpen,
}: Props) {
  const [collapsed, setCollapsed] = React.useState<Partial<Record<SectionKey, boolean>>>({});
  const roadmapId = React.useId();
  const [expandedByKey, setExpandedByKey] = React.useState<Record<string, boolean>>({});

  const grouped = React.useMemo(() => {
    const buckets: Record<SectionKey, WidgetRoadmapItem[]> = {
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

  if (!hasAny) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <WidgetEmpty
          title="No roadmap yet"
          description="Public items will show up here when they’re ready to share."
          icon={<FillRoadmapIcon className="size-5" size={20} />}
        >
          <WidgetEmptyPlaceholders />
        </WidgetEmpty>
      </div>
    );
  }

  return (
    <div className="px-4 pb-5">
      {SECTIONS.map((section) => {
        const sectionItems = grouped[section.key];
        const visible = expandedByKey[section.key] ? sectionItems : sectionItems.slice(0, INITIAL_VISIBLE);
        const isCollapsed = Boolean(collapsed[section.key]);
        return (
          <section key={section.key} aria-labelledby={`${roadmapId}-${section.key}-heading`} className="relative pb-5 last:pb-0">
            <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-[8px] top-10 w-px bg-[rgb(var(--widget-fg)/0.09)]" />
            <h3 id={`${roadmapId}-${section.key}-heading`} className="sticky top-0 z-20 bg-[rgb(var(--widget-surface))] py-2">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                aria-controls={`${roadmapId}-${section.key}-items`}
                onClick={() => setCollapsed((previous) => ({ ...previous, [section.key]: !previous[section.key] }))}
                className="flex w-full cursor-pointer items-center gap-3 rounded py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
              >
                <StatusIcon status={section.status} className="size-[18px] shrink-0" />
                <span className="flex-1 text-sm font-semibold text-[rgb(var(--widget-fg))]">{section.label}</span>
                <span className="text-xs tabular-nums text-[rgb(var(--widget-fg)/0.4)]">{sectionItems.length}</span>
                <ChevronDown className={`mr-1 size-3.5 text-[rgb(var(--widget-fg)/0.4)] transition-transform motion-reduce:transition-none ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
            </h3>
            <div id={`${roadmapId}-${section.key}-items`} hidden={isCollapsed}>
              {visible.length ? visible.map((item) => (
                <RoadmapItem
                  key={item.id}
                  item={item}
                  status={section.status}
                  apiBase={apiBase}
                  userId={userId}
                  identity={identity}
                  onVoteChange={onVoteChange}
                  onOpen={onOpen}
                  compact={section.key === "completed"}
                />
              )) : (
                <p className="py-4 pl-8 text-xs text-[rgb(var(--widget-fg)/0.45)]">No items here yet.</p>
              )}
              {visible.length < sectionItems.length ? (
                <button
                  type="button"
                  onClick={() => setExpandedByKey((prev) => ({ ...prev, [section.key]: true }))}
                  className="ml-8 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 text-xs text-[rgb(var(--widget-fg)/0.55)] hover:bg-[rgb(var(--widget-fg)/0.05)]"
                >
                  Show {sectionItems.length - visible.length} more
                  <ChevronDown className="size-3.5" />
                </button>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function RoadmapRow({
  item,
  apiBase,
  userId,
  identity,
  onOpen,
  onVoteChange,
}: {
  item: WidgetRoadmapItem;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onOpen?: () => void;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";

  return (
    <div className="relative border-b border-[rgb(var(--widget-fg)/0.1)] last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 pr-16 text-left"
        aria-label={item.title}
      >
        <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="mt-1 truncate text-xs text-[rgb(var(--widget-fg)/0.45)]">{author}</p>
        </div>
      </button>
      <div className="absolute right-5 top-1/2 -translate-y-1/2">
        <WidgetVoteButton
          postId={item.id}
          upvotes={item.upvotes || 0}
          hasVoted={Boolean(item.hasVoted)}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          variant="plain"
          onChange={({ upvotes, hasVoted }) => onVoteChange?.(item.id, upvotes, hasVoted)}
        />
      </div>
    </div>
  );
}

function RoadmapItem({
  item,
  status,
  apiBase,
  userId,
  identity,
  onVoteChange,
  onOpen,
  compact,
}: {
  item: WidgetRoadmapItem;
  status: string;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  onOpen?: (item: WidgetRoadmapItem) => void;
  compact?: boolean;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";
  const excerpt = toPlain(item.content);

  return (
    <div className="relative isolate">
      <span aria-hidden="true" className="pointer-events-none absolute left-0 top-3.5 bg-[rgb(var(--widget-surface))] py-0.5">
        <StatusIcon status={status} className="size-[18px]" />
      </span>
      <button
        type="button"
        onClick={() => onOpen?.(item)}
        className="group/post block w-full min-w-0 cursor-pointer rounded-md py-3 pl-8 pr-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={item.title}
      >
        <p className={`line-clamp-2 text-sm font-medium leading-snug text-[rgb(var(--widget-fg))] ${compact ? "" : "pr-14"}`}>
          <span className="transition-colors group-hover/post:text-primary">
            {item.title}
          </span>
        </p>
        {excerpt ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
            {excerpt}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-1.5">
          <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-4" />
          <span className="truncate text-xs text-[rgb(var(--widget-fg)/0.45)]">{author}</span>
        </div>
      </button>
      {!compact ? (
        <WidgetVoteButton
          postId={item.id}
          upvotes={item.upvotes || 0}
          hasVoted={Boolean(item.hasVoted)}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          variant="plain"
          className="absolute right-1 top-2.5"
          onChange={({ upvotes, hasVoted }) => onVoteChange?.(item.id, upvotes, hasVoted)}
        />
      ) : null}
    </div>
  );
}
