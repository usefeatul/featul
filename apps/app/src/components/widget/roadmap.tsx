"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
  { key: "progress", label: "In progress", status: "progress", color: "#3b82f6" },
  { key: "planned", label: "Planned", status: "planned", color: "#f59e0b" },
  { key: "completed", label: "Done", status: "completed", color: "#15CF59" },
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

    // Keep headers in place until the user actually scrolls. Pinning on
    // load stacks every status at the top and pulls items away from it.
    if (scroller.scrollTop > 0) {
      for (let index = 0; index < SECTIONS.length; index += 1) {
        const sectionEl = sectionRefs.current[index];
        if (!sectionEl) continue;
        const rect = sectionEl.getBoundingClientRect();
        const pinLine = scrollerTop + next.length * HEADER_HEIGHT;
        if (rect.top <= pinLine + 1) {
          next.push(index);
        }
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
          icon={<FillRoadmapIcon className="size-5" size={20} />}
        >
          <WidgetEmptyPlaceholders />
        </WidgetEmpty>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative pb-[30vh]">
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

        return (
          <section
            key={section.key}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className="shrink-0"
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
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-8 left-5 top-4 z-0 flex w-4 justify-center"
                >
                  <div
                    className="h-full w-px rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${section.color}00 0%, ${section.color}55 18%, ${section.color}55 82%, ${section.color}00 100%)`,
                    }}
                  />
                </div>
                {visible.map((item) => (
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
                ))}
                {canShowMore ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedByKey((prev) => ({ ...prev, [section.key]: true }))
                    }
                    className="flex w-full cursor-pointer items-center gap-1 px-5 py-3 pl-12 text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.7)]"
                  >
                    Show more
                    <ChevronDown className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : null}
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
  const doneDate = formatDoneDate(item.createdAt);
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";
  const excerpt = toPlain(item.content);

  return (
    <div className="relative z-[1] flex items-start gap-3 px-5 py-3.5">
      <span
        className="relative mt-0.5 flex w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--widget-surface))] shadow-[0_0_0_3px_rgb(var(--widget-surface))]"
        aria-hidden
      >
        <StatusIcon status={status} className="size-4" />
      </span>
      <button
        type="button"
        onClick={() => onOpen?.(item)}
        className="min-w-0 flex-1 cursor-pointer text-left"
        aria-label={item.title}
      >
        <p className="pr-2 text-sm font-semibold leading-snug text-[rgb(var(--widget-fg))]">
          {item.title}
        </p>
        {excerpt ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
            {excerpt}
          </p>
        ) : null}
        <div className="mt-2.5 flex items-center gap-1.5">
          <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-4" />
          <span className="truncate text-[11px] text-[rgb(var(--widget-fg)/0.45)]">{author}</span>
        </div>
      </button>
      {compact ? (
        doneDate ? (
          <span className="relative z-[2] shrink-0 pt-0.5 text-xs text-[rgb(var(--widget-fg)/0.35)]">
            {doneDate}
          </span>
        ) : null
      ) : (
        <WidgetVoteButton
          postId={item.id}
          upvotes={item.upvotes || 0}
          hasVoted={Boolean(item.hasVoted)}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          variant="plain"
          className="relative z-[2] shrink-0 self-start"
          onChange={({ upvotes, hasVoted }) => onVoteChange?.(item.id, upvotes, hasVoted)}
        />
      )}
    </div>
  );
}
