"use client";

import { WidgetButton } from "./button";

import { ChevronRight } from "@/components/global/icons";
import { FillChangelogIcon } from "@featul/ui/icons/fill-changelog";
import { FillFeedbackIcon } from "@featul/ui/icons/fill-feedback";
import { FillRoadmapIcon } from "@featul/ui/icons/fill-roadmap";
import StatusIcon from "@/components/requests/StatusIcon";
import { UpdateByline } from "./byline";
import { WidgetEmpty } from "./empty";
import { RoadmapRow, type WidgetRoadmapItem } from "./roadmap";
import { WidgetPostRow } from "./row";
import { Bone, WidgetPostRowSkeleton, WidgetRoadmapRowSkeleton } from "./skeleton";
import type { IdentifiedUser, WidgetApiBase, WidgetLayoutStyle, WidgetPost } from "./types";
import type { WidgetChangelogEntry } from "./updates";

type Props = {
  featuredEntry?: WidgetChangelogEntry;
  homeRoadmap: WidgetRoadmapItem[];
  homeChangelog: WidgetChangelogEntry[];
  homeRoadmapLabel: string;
  accent: string;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  changelogLoading?: boolean;
  roadmapLoading?: boolean;
  showRoadmap?: boolean;
  showChangelog?: boolean;
  showRecent?: boolean;
  recentPosts?: WidgetPost[];
  recentLoading?: boolean;
  layoutStyle?: WidgetLayoutStyle;
  onOpenChangelog: (id?: string) => void;
  onSeeUpdates: () => void;
  onSeeRoadmap: () => void;
  onSeeFeedback: () => void;
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
  onSeeFeedback,
  onCompose,
  onOpenRoadmapItem,
  onVoteChange,
  changelogLoading = false,
  roadmapLoading = false,
  showRoadmap = true,
  showChangelog = true,
  showRecent = false,
  recentPosts = [],
  recentLoading = false,
  layoutStyle = "comfortable",
}: Props) {
  const px =
    layoutStyle === "compact"
      ? "px-4"
      : layoutStyle === "spacious"
        ? "px-6"
        : "px-5";
  const sectionPy =
    layoutStyle === "compact"
      ? "py-2.5"
      : layoutStyle === "spacious"
        ? "py-6"
        : "py-5";
  const emptyPy = layoutStyle === "compact" ? "py-2" : "py-3";
  const composePrompt = (
    <button
      type="button"
      onClick={onCompose}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 border-b border-dashed border-[rgb(var(--widget-fg)/0.14)] ${px} py-4 text-left`}
    >
      <span className="text-sm text-[rgb(var(--widget-fg)/0.35)]">What’s on your mind?</span>
      <WidgetButton asChild className="h-8 px-3 text-xs font-semibold">
        <span>Post</span>
      </WidgetButton>
    </button>
  );

  const roadmapSection = showRoadmap ? (
    <section
      className={`border-b border-dashed border-[rgb(var(--widget-fg)/0.14)] ${
        !roadmapLoading && !homeRoadmap.length ? emptyPy : sectionPy
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${px} ${
          !roadmapLoading && !homeRoadmap.length ? "mb-1.5" : "mb-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <StatusIcon status="progress" className="size-3.5" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
            {homeRoadmapLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onSeeRoadmap}
          className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-primary"
        >
          See roadmap
        </button>
      </div>
      <div>
        {roadmapLoading ? (
          <div aria-busy="true" aria-label="Loading roadmap">
            {Array.from({ length: 4 }, (_, index) => (
              <WidgetRoadmapRowSkeleton key={index} />
            ))}
          </div>
        ) : homeRoadmap.length ? (
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
          <WidgetEmpty
            compact
            title="No roadmap yet"
            description="Public items will show up here when they’re ready to share."
            icon={<FillRoadmapIcon className="size-5" size={20} />}
          />
        )}
      </div>
    </section>
  ) : null;

  const updatesSection = showChangelog ? (
    <section className={!changelogLoading && !homeChangelog.length ? emptyPy : sectionPy}>
      <div
        className={`flex items-center justify-between gap-3 ${px} ${
          !changelogLoading && !homeChangelog.length ? "mb-1.5" : "mb-3"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
          Updates
        </p>
        <button
          type="button"
          onClick={onSeeUpdates}
          className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-primary"
        >
          See updates
        </button>
      </div>
      {changelogLoading ? (
        <div aria-busy="true" aria-label="Loading updates">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] ${px} py-3.5 last:border-b-0`}
            >
              <div className="flex items-center gap-2">
                <Bone className="h-2.5 w-14 rounded-full" />
                <Bone className="h-2.5 w-16 rounded-full" />
              </div>
              <Bone className="mt-1 h-3.5 w-[82%] rounded-full" />
            </div>
          ))}
        </div>
      ) : homeChangelog.length ? (
        <div>
          {homeChangelog.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpenChangelog(entry.id)}
              className={`flex w-full flex-col items-start gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] ${px} py-3.5 text-left last:border-b-0`}
            >
              <span className="min-w-0 text-sm font-medium leading-snug text-[rgb(var(--widget-fg))]">
                {entry.title}
              </span>
              <UpdateByline entry={entry} accent={accent} />
            </button>
          ))}
        </div>
      ) : (
        <WidgetEmpty
          compact
          title="No updates yet"
          description="New releases, fixes, and product changes will show up here."
          icon={<FillChangelogIcon className="size-5" size={20} />}
        />
      )}
    </section>
  ) : null;

  const recentSection = showRecent ? (
    <section
      className={!recentLoading && !recentPosts.length ? emptyPy : sectionPy}
    >
      <div
        className={`flex items-center justify-between gap-3 ${px} ${
          !recentLoading && !recentPosts.length ? "mb-1.5" : "mb-3"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
          Latest feedback
        </p>
        <button
          type="button"
          onClick={onSeeFeedback}
          className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
        >
          See all →
        </button>
      </div>
      {recentLoading ? (
        <div aria-busy="true" aria-label="Loading feedback">
          {Array.from({ length: 4 }, (_, index) => (
            <WidgetPostRowSkeleton key={index} />
          ))}
        </div>
      ) : recentPosts.length ? (
        <div>
          {recentPosts.map((post) => (
            <WidgetPostRow
              key={post.id}
              post={post}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              onOpen={onOpenRoadmapItem}
              onVoteChange={onVoteChange}
            />
          ))}
        </div>
      ) : (
        <WidgetEmpty
          compact
          title="No feedback yet"
          description="Be the first to share an idea or report a problem."
          icon={<FillFeedbackIcon className="size-5" size={20} />}
        />
      )}
    </section>
  ) : null;

  const featured = showChangelog ? featuredEntry : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {featured ? (
        <button
          type="button"
          onClick={() => onOpenChangelog(featured.id)}
          className={`group w-full cursor-pointer border-b border-dashed border-[rgb(var(--widget-fg)/0.14)] ${px} pb-6 text-left`}
        >
          <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
            {featured.title}
          </h2>
          <UpdateByline entry={featured} accent={accent} />
          {featured.preview ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.55)]">
              {featured.preview}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--widget-fg)/0.5)] transition-colors group-hover:text-primary">
            Read update
            <ChevronRight className="size-3.5" />
          </span>
        </button>
      ) : null}

      {featured ? composePrompt : null}
      {roadmapSection}
      {featured ? null : composePrompt}
      {recentSection}
      {updatesSection}
    </div>
  );
}
