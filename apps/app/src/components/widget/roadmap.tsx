"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { toPlain } from "./utils";
import type { IdentifiedUser, WidgetApiBase } from "./types";
import { WidgetAuthorAvatar } from "./avatar";
import { WidgetEmpty, WidgetSectionEmpty } from "./empty";
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
  const pinnedRef = React.useRef<number[]>([]);
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
    const found = root?.closest("[data-widget-scroll]");
    const scroller = found instanceof HTMLElement ? found : null;
    if (!root || !scroller) {
      pinnedRef.current = [];
      setPinnedIndexes([]);
      return;
    }

    const scrollerTop = scroller.getBoundingClientRect().top;
    const next: number[] = [];

    // Once a section header reaches the stack, keep it pinned until the
    // user scrolls back above it. Never drop earlier headers when entering
    // a later section (that was the glitch).
    for (let index = 0; index < SECTIONS.length; index += 1) {
      const sectionEl = sectionRefs.current[index];
      if (!sectionEl) continue;
      const rect = sectionEl.getBoundingClientRect();
      const pinLine = scrollerTop + next.length * HEADER_HEIGHT;
      if (rect.top <= pinLine + 1) {
        next.push(index);
      }
    }

    const prev = pinnedRef.current;
    const changed =
      prev.length !== next.length || prev.some((value, i) => value !== next[i]);
    if (!changed) return;
    pinnedRef.current = next;
    setPinnedIndexes(next);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    const found = root?.closest("[data-widget-scroll]");
    const scroller = found instanceof HTMLElement ? found : null;
    if (!scroller) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updatePinned);
    };

    updatePinned();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updatePinned, items]);

  const lastEmpty = grouped[SECTIONS[SECTIONS.length - 1].key].length === 0;

  const jumpToSection = (index: number) => {
    const sectionEl = sectionRefs.current[index];
    const found = rootRef.current?.closest("[data-widget-scroll]");
    const scroller = found instanceof HTMLElement ? found : null;
    if (!sectionEl || !scroller) return;

    const aboveCount = pinnedIndexes.filter((value) => value < index).length;
    const nodeRect = sectionEl.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const nextTop =
      scroller.scrollTop + (nodeRect.top - scrollerRect.top) - aboveCount * HEADER_HEIGHT;
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  };

  if (!hasAny) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <WidgetEmpty
          title="No roadmap yet"
          description="Public items will show up here when they’re ready to share."
        />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={lastEmpty ? "relative flex min-h-full flex-1 flex-col" : "relative pb-[30vh]"}
    >
      {/* Overlay stack: no layout height, so pinning never jumps/glitches */}
      <div className="pointer-events-none sticky top-0 z-50 h-0">
        <div
          className="pointer-events-auto relative overflow-hidden bg-[rgb(var(--widget-surface))]"
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
                className="absolute left-0 right-0 flex w-full cursor-pointer items-center gap-2 border-b border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-surface))] px-5 text-left"
                style={{
                  top: stackIndex * HEADER_HEIGHT,
                  height: HEADER_HEIGHT,
                }}
                aria-label={`Jump to ${section.label}`}
              >
                <StatusIcon status={section.status} className="size-4 shrink-0" />
                <h3 className="flex-1 text-sm font-semibold text-[rgb(var(--widget-fg))]">{section.label}</h3>
                <span className="tabular-nums text-xs text-[rgb(var(--widget-fg)/0.4)]">
                  {String(grouped[section.key].length).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {SECTIONS.map((section, index) => {
        const sectionItems = grouped[section.key];
        const expanded = Boolean(expandedByKey[section.key]);
        const visible = expanded ? sectionItems : sectionItems.slice(0, INITIAL_VISIBLE);
        const canShowMore = sectionItems.length > INITIAL_VISIBLE && !expanded;
        const isPinned = pinnedIndexes.includes(index);

        const isLast = index === SECTIONS.length - 1;

        return (
          <section
            key={section.key}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className={isLast && !sectionItems.length ? "flex min-h-0 flex-1 flex-col" : undefined}
          >
            <button
              type="button"
              onClick={() => jumpToSection(index)}
              className={`flex w-full items-center gap-2 border-b border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-surface))] px-5 text-left ${
                isPinned
                  ? "pointer-events-none text-transparent"
                  : "cursor-pointer"
              }`}
              style={{
                height: HEADER_HEIGHT,
                // Keep spacer height stable; hide label when the overlay clone is shown
                visibility: isPinned ? "hidden" : "visible",
              }}
              aria-hidden={isPinned}
              tabIndex={isPinned ? -1 : 0}
            >
              <StatusIcon status={section.status} className="size-4 shrink-0" />
              <h3 className="flex-1 text-sm font-semibold text-[rgb(var(--widget-fg))]">{section.label}</h3>
              <span className="tabular-nums text-xs text-[rgb(var(--widget-fg)/0.4)]">
                {String(sectionItems.length).padStart(2, "0")}
              </span>
            </button>

            {sectionItems.length ? (
              <div className="relative bg-[rgb(var(--widget-surface))]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-4 left-[27px] top-2 w-px bg-[rgb(var(--widget-fg)/0.1)]"
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
                    className="flex w-full cursor-pointer items-center gap-1 bg-[rgb(var(--widget-surface))] px-5 py-3 pl-[46px] text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.7)]"
                  >
                    Show more
                    <ChevronDown className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : (
              <WidgetSectionEmpty>Nothing here yet</WidgetSectionEmpty>
            )}
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
    <div className="relative border-b border-[rgb(var(--widget-fg)/0.1)] transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]">
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
      <div className="flex items-center gap-3 bg-[rgb(var(--widget-surface))] px-5 py-3">
        <div className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--widget-surface))]">
          <StatusIcon status={status} className="size-3.5" />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-[rgb(var(--widget-fg)/0.9)]">{item.title}</p>
        {doneDate ? (
          <span className="shrink-0 text-xs text-[rgb(var(--widget-fg)/0.35)]">{doneDate}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-[rgb(var(--widget-surface))] px-5 py-3">
      <div className="mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--widget-surface))]">
        <StatusIcon status={status} className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-[rgb(var(--widget-fg))]">{item.title}</p>
        {excerpt ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.4)]">{excerpt}</p>
        ) : null}
        <p className="mt-1.5 truncate text-[11px] text-[rgb(var(--widget-fg)/0.35)]">{author}</p>
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
