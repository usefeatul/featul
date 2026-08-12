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
  createdAt?: string | Date | null;
};

const SECTIONS = [
  { key: "progress", label: "In progress", status: "progress" },
  { key: "planned", label: "Planned", status: "planned" },
  { key: "completed", label: "Done", status: "completed" },
] as const;

const HEADER_HEIGHT = 44;
const INITIAL_VISIBLE = 6;

type SectionKey = (typeof SECTIONS)[number]["key"];

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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Array<HTMLElement | null>>([]);
  const [pinnedIndexes, setPinnedIndexes] = React.useState<number[]>([]);
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

  const updatePinned = React.useCallback(() => {
    const root = rootRef.current;
    const scroller = root?.closest("[data-widget-scroll]") as HTMLElement | null;
    if (!root || !scroller) {
      setPinnedIndexes([]);
      return;
    }

    const scrollerTop = scroller.getBoundingClientRect().top;
    const next: number[] = [];

    SECTIONS.forEach((_, index) => {
      const sectionEl = sectionRefs.current[index];
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      // Pin while this section has reached the stack and has not fully left the viewport top.
      const stackTop = scrollerTop + next.length * HEADER_HEIGHT;
      if (rect.top <= stackTop + 0.5 && rect.bottom > scrollerTop + HEADER_HEIGHT) {
        next.push(index);
      }
    });

    setPinnedIndexes((prev) => {
      if (prev.length === next.length && prev.every((value, i) => value === next[i])) {
        return prev;
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    const scroller = root?.closest("[data-widget-scroll]") as HTMLElement | null;
    if (!scroller) return;

    updatePinned();
    scroller.addEventListener("scroll", updatePinned, { passive: true });
    window.addEventListener("resize", updatePinned);
    return () => {
      scroller.removeEventListener("scroll", updatePinned);
      window.removeEventListener("resize", updatePinned);
    };
  }, [updatePinned, items]);

  const jumpToSection = (index: number) => {
    const sectionEl = sectionRefs.current[index];
    const scroller = rootRef.current?.closest("[data-widget-scroll]") as HTMLElement | null;
    if (!sectionEl || !scroller) return;

    // Place section under the headers that stay pinned above it.
    const aboveCount = pinnedIndexes.filter((value) => value < index).length;
    const nodeRect = sectionEl.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const nextTop =
      scroller.scrollTop + (nodeRect.top - scrollerRect.top) - aboveCount * HEADER_HEIGHT;
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  };

  if (!hasAny) {
    return <p className="px-5 py-6 text-sm text-white/45">No public roadmap items yet.</p>;
  }

  return (
    <div ref={rootRef} className="relative pb-[30vh]">
      {/* Packed sticky stack — overlays without double-spacing */}
      <div
        className="sticky top-0 z-50 bg-[#171717]"
        style={{ height: pinnedIndexes.length * HEADER_HEIGHT }}
      >
        {pinnedIndexes.map((sectionIndex, stackIndex) => {
          const section = SECTIONS[sectionIndex];
          if (!section) return null;
          return (
            <button
              key={`pin-${section.key}`}
              type="button"
              onClick={() => jumpToSection(sectionIndex)}
              className="absolute left-0 right-0 flex w-full cursor-pointer items-center gap-2 border-b border-white/10 bg-[#171717] px-5 text-left"
              style={{
                top: stackIndex * HEADER_HEIGHT,
                height: HEADER_HEIGHT,
              }}
              aria-label={`Jump to ${section.label}`}
            >
              <StatusIcon status={section.status} className="size-4 shrink-0" />
              <h3 className="flex-1 text-sm font-semibold text-white">{section.label}</h3>
              <span className="tabular-nums text-xs text-white/40">
                {String(grouped[section.key].length).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {SECTIONS.map((section, index) => {
        const sectionItems = grouped[section.key];
        const expanded = Boolean(expandedByKey[section.key]);
        const visible = expanded ? sectionItems : sectionItems.slice(0, INITIAL_VISIBLE);
        const canShowMore = sectionItems.length > INITIAL_VISIBLE && !expanded;
        const isPinned = pinnedIndexes.includes(index);

        return (
          <section
            key={section.key}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
          >
            <button
              type="button"
              onClick={() => jumpToSection(index)}
              className={`flex w-full items-center gap-2 bg-[#171717] px-5 text-left ${
                isPinned
                  ? "pointer-events-none overflow-hidden border-0 opacity-0"
                  : "cursor-pointer border-b border-white/10"
              }`}
              style={{ height: isPinned ? 0 : HEADER_HEIGHT }}
              aria-hidden={isPinned}
              tabIndex={isPinned ? -1 : 0}
            >
              <StatusIcon status={section.status} className="size-4 shrink-0" />
              <h3 className="flex-1 text-sm font-semibold text-white">{section.label}</h3>
              <span className="tabular-nums text-xs text-white/40">
                {String(sectionItems.length).padStart(2, "0")}
              </span>
            </button>

            {sectionItems.length ? (
              <div className="relative bg-[#171717]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-4 left-[27px] top-2 w-px bg-white/10"
                />
                {visible.map((item) => (
                  <RoadmapItem
                    key={item.id}
                    item={item}
                    status={section.status}
                    apiBase={apiBase}
                    userId={userId}
                    identity={identity}
                    onVoteChange={onVoteChange}
                    compact={section.key === "completed"}
                  />
                ))}
                {canShowMore ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedByKey((prev) => ({ ...prev, [section.key]: true }))
                    }
                    className="flex w-full cursor-pointer items-center gap-1 bg-[#171717] px-5 py-3 pl-[46px] text-xs text-white/45 transition-colors hover:text-white/70"
                  >
                    Show more
                    <ChevronDown className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="bg-[#171717] px-5 py-3 pl-11 text-xs text-white/30">
                Nothing here yet
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function formatDoneDate(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RoadmapItem({
  item,
  status,
  apiBase,
  userId,
  identity,
  onVoteChange,
  compact,
}: {
  item: WidgetRoadmapItem;
  status: string;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  compact?: boolean;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";
  const excerpt = toPlain(item.content);
  const doneDate = formatDoneDate(item.createdAt);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-[#171717] px-5 py-3">
        <div className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[#171717]">
          <StatusIcon status={status} className="size-3.5" />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-white/90">{item.title}</p>
        {doneDate ? (
          <span className="shrink-0 text-xs text-white/35">{doneDate}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-[#171717] px-5 py-3">
      <div className="mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[#171717]">
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
