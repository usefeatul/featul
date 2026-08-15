"use client";

import { ChevronRight } from "lucide-react";
import { FillPenIcon } from "@featul/ui/icons/fill-pen";
import StatusIcon from "@/components/requests/StatusIcon";
import { WidgetAuthorAvatar } from "./avatar";
import { RoadmapRow, type WidgetRoadmapItem } from "./roadmap";
import type { IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import { UpdateMetaRow, type WidgetChangelogEntry } from "./updates";

type Props = {
  featuredEntry?: WidgetChangelogEntry;
  homeRoadmap: WidgetRoadmapItem[];
  homeChangelog: WidgetChangelogEntry[];
  homeRoadmapLabel: string;
  accent: string;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onOpenChangelog: (id?: string) => void;
  onSeeUpdates: () => void;
  onSeeRoadmap: () => void;
  onCompose: () => void;
  onOpenRoadmapItem: (post: WidgetPost) => void;
  onVoteChange: (id: string, upvotes: number, hasVoted: boolean) => void;
};

export function Home({
  featuredEntry,
  homeRoadmap,
  homeChangelog,
  homeRoadmapLabel,
  accent,
  apiBase,
  userId,
  identity,
  onOpenChangelog,
  onSeeUpdates,
  onSeeRoadmap,
  onCompose,
  onOpenRoadmapItem,
  onVoteChange,
}: Props) {
  return (
    <div className="space-y-0">
      <button
        type="button"
        onClick={() => onOpenChangelog(featuredEntry?.id)}
        className="group w-full border-b border-[rgb(var(--widget-fg)/0.1)] px-5 pb-6 text-left"
      >
        {featuredEntry ? (
          <>
            <UpdateMetaRow entry={featuredEntry} accent={accent} fallbackBadge="Just Shipped" />
            <h2 className="mt-3 text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
              {featuredEntry.title}
            </h2>
            {featuredEntry.preview ? (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.55)]">
                {featuredEntry.preview}
              </p>
            ) : null}
            {featuredEntry.authorName || featuredEntry.authorImage ? (
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <WidgetAuthorAvatar
                    name={featuredEntry.authorName || "Author"}
                    image={featuredEntry.authorImage}
                    className="size-7"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                      {featuredEntry.authorName || "Author"}
                    </p>
                    <p
                      className="truncate font-heading text-xs font-medium"
                      style={{ color: accent }}
                    >
                      {featuredEntry.authorRoleLabel || "Team"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[rgb(var(--widget-fg)/0.4)] transition-colors group-hover:text-[rgb(var(--widget-fg)/0.7)]">
                  View updates
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            ) : (
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--widget-fg)/0.4)] transition-colors group-hover:text-[rgb(var(--widget-fg)/0.7)]">
                View updates
                <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </>
        ) : (
          <>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: accent }}
            >
              Updates
            </p>
            <h2 className="mt-3 text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
              No updates yet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.5)]">
              New releases and product changes will show up here.
            </p>
          </>
        )}
      </button>

      <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-5">
        <button
          type="button"
          onClick={onCompose}
          className="group flex w-full cursor-pointer items-center gap-3 rounded-md bg-[rgb(var(--widget-fg)/0.03)] px-3.5 py-3.5 text-left transition-colors hover:bg-[rgb(var(--widget-fg)/0.055)]"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--widget-fg)/0.06)]"
            style={{ color: accent }}
          >
            <FillPenIcon className="size-4" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-sm font-semibold tracking-tight text-[rgb(var(--widget-fg))]">
              Give feedback
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-[rgb(var(--widget-fg)/0.45)]">
              Share an idea or report an issue
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-[rgb(var(--widget-fg)/0.3)] transition-transform group-hover:translate-x-0.5 group-hover:text-[rgb(var(--widget-fg)/0.55)]" />
        </button>
      </div>

      <section className="border-b border-[rgb(var(--widget-fg)/0.1)] py-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-2">
            <StatusIcon status="progress" className="size-3.5" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
              {homeRoadmapLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onSeeRoadmap}
            className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
          >
            See roadmap →
          </button>
        </div>
        <div>
          {homeRoadmap.length ? (
            homeRoadmap.map((item) => (
              <RoadmapRow
                key={item.id}
                item={item}
                apiBase={apiBase}
                userId={userId}
                identity={identity}
                onOpen={() =>
                  onOpenRoadmapItem({
                    id: item.id,
                    title: item.title,
                    slug: item.slug || item.id,
                    content: item.content ?? null,
                    upvotes: item.upvotes,
                    commentCount: null,
                    roadmapStatus: item.roadmapStatus,
                    createdAt: item.createdAt ?? null,
                    boardId: "",
                    boardName: null,
                    boardSlug: null,
                    isAnonymous: item.isAnonymous ?? null,
                    authorName: item.authorName ?? null,
                    authorImage: item.authorImage ?? null,
                    hasVoted: Boolean(item.hasVoted),
                  })
                }
                onVoteChange={onVoteChange}
              />
            ))
          ) : (
            <p className="px-5 py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
              No public roadmap items yet.
            </p>
          )}
        </div>
      </section>

      <section className="py-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
            Updates
          </p>
          <button
            type="button"
            onClick={onSeeUpdates}
            className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
          >
            See updates →
          </button>
        </div>
        {homeChangelog.length ? (
          <div>
            {homeChangelog.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenChangelog(entry.id)}
                className="flex w-full flex-col items-start gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]"
              >
                <UpdateMetaRow entry={entry} accent={accent} fallbackBadge="Just Shipped" />
                <span className="min-w-0 text-sm font-medium leading-snug text-[rgb(var(--widget-fg))]">
                  {entry.title}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
            No updates published yet.
          </p>
        )}
      </section>
    </div>
  );
}
