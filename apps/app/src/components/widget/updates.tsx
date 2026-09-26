"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/core";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FillChangelogIcon } from "@featul/ui/icons/fill-changelog";
import { CheckIcon } from "@/components/global/icons";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import { UpdateByline } from "./byline";
import { useReleaseBadge } from "@/hooks/useReleaseBadge";
import type { RelatedPost } from "@featul/api/changelog/related";
import StatusIcon from "@/components/requests/StatusIcon";
import { ChevronRight } from "@/components/global/icons";
import { WidgetEmpty, WidgetEmptyPlaceholders } from "./empty";
import { WidgetImage } from "./image";

export type WidgetChangelogEntry = {
  id: string;
  title: string;
  slug?: string;
  summary?: string | null;
  preview?: string | null;
  content?: JSONContent | string | null;
  coverImage?: string | null;
  publishedAt?: string | Date | null;
  tags?: Array<{ id: string; name: string; color?: string | null }>;
  authorName?: string | null;
  authorImage?: string | null;
  relatedPosts?: RelatedPost[];
  authorRoleLabel?: string | null;
};

type Props = {
  entries: WidgetChangelogEntry[];
  accent?: string;
  selectedId?: string | null;
  onOpen: (entry: WidgetChangelogEntry) => void;
  onBack: () => void;
  onOpenRelatedPost: (post: RelatedPost) => void;
};

function formatUpdateDate(value: string | Date | null | undefined, uppercase = true): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return uppercase ? label.toUpperCase() : label;
}

export function UpdateMetaRow({
  entry,
  accent = "#4d96e8",
  className = "",
}: {
  entry: WidgetChangelogEntry;
  accent?: string;
  className?: string;
}) {
  const dateLabel = formatUpdateDate(entry.publishedAt);
  const badge = useReleaseBadge(entry);
  if (!dateLabel && !badge) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-1.5 font-heading text-xs font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      {dateLabel ? (
        <span className="text-[rgb(var(--widget-fg))]">{dateLabel}</span>
      ) : null}
      {dateLabel && badge ? (
        <span className="text-[rgb(var(--widget-fg)/0.35)]" aria-hidden>
          ·
        </span>
      ) : null}
      {badge ? (
        <span style={{ color: badge.color || accent }}>{badge.name}</span>
      ) : null}
    </div>
  );
}

export function WidgetUpdates({
  entries,
  accent = "#4d96e8",
  selectedId = null,
  onOpen,
  onBack: _onBack,
  onOpenRelatedPost,
}: Props) {
  const reduceMotion = useReducedMotion();
  const selected = selectedId
    ? entries.find((entry) => entry.id === selectedId) || null
    : null;

  const viewTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  if (!entries.length && !selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <WidgetEmpty
          title="No updates yet"
          description="New releases, fixes, and product changes will show up here."
          icon={<FillChangelogIcon className="size-5" size={20} />}
        >
          <WidgetEmptyPlaceholders />
        </WidgetEmpty>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        {selected ? (
          <motion.div
            key={`detail-${selected.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 2, pointerEvents: "none" }}
            transition={viewTransition}
            className="absolute inset-0 flex min-h-0 flex-col"
          >
            <UpdateDetail
              entry={selected}
              accent={accent}
              recentEntries={entries.slice(0, 5)}
              onOpen={onOpen}
              onOpenRelatedPost={onOpenRelatedPost}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 2, pointerEvents: "none" }}
            transition={viewTransition}
            className="absolute inset-0 flex min-h-0 flex-col overflow-y-auto scrollbar-hide"
          >
            {entries.map((entry, index) => {
              const preview = (entry.summary || entry.preview || "").trim();

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onOpen(entry)}
                  className={`w-full cursor-pointer px-5 py-5 text-left ${
                    index > 0 ? "border-t border-dashed border-[rgb(var(--widget-fg)/0.12)]" : ""
                  }`}
                >
                  <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
                    {entry.title}
                  </h3>

                  <UpdateByline
                    entry={entry}
                    accent={accent}
                  />

                  {preview ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.5)]">
                      {preview}
                    </p>
                  ) : null}


                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UpdateDetail({
  entry,
  accent,
  recentEntries,
  onOpen,
  onOpenRelatedPost,
}: {
  entry: WidgetChangelogEntry;
  accent: string;
  recentEntries: WidgetChangelogEntry[];
  onOpen: (entry: WidgetChangelogEntry) => void;
  onOpenRelatedPost: (post: RelatedPost) => void;
}) {
  const content = entry.content && typeof entry.content === "object" ? entry.content : null;
  const shipped = recentEntries.slice(0, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide" data-widget-scroll="">
      <div className="px-5 pb-4 pt-1">
        <h1 className="text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
          {entry.title}
        </h1>

        <UpdateByline entry={entry} accent={accent} />
      </div>

      <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]" />

      <div className="px-5 pb-4 pt-5">
        {entry.coverImage ? (
          <WidgetImage
            url={entry.coverImage}
            alt=""
            className="mb-5 w-full max-h-56"
          />
        ) : null}

        {content ? (
          <ChangelogRenderer
            content={content}
            className="prose-headings:scroll-mt-4 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[rgb(var(--widget-fg))] prose-p:text-[rgb(var(--widget-fg)/0.72)] prose-p:leading-7 prose-strong:text-[rgb(var(--widget-fg))] prose-li:text-[rgb(var(--widget-fg)/0.72)] prose-a:text-[rgb(var(--widget-fg))] prose-a:underline prose-a:decoration-[rgb(var(--widget-fg)/0.35)] hover:prose-a:decoration-[rgb(var(--widget-fg)/0.7)] prose-code:rounded-md prose-code:border prose-code:border-[rgb(var(--widget-fg)/0.12)] prose-code:bg-[rgb(var(--widget-fg)/0.06)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[rgb(var(--widget-fg)/0.85)] prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-md prose-pre:border prose-pre:border-[rgb(var(--widget-fg)/0.12)] prose-pre:bg-[rgb(var(--widget-fg)/0.05)]"
          />
        ) : entry.preview ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-[rgb(var(--widget-fg)/0.72)]">
            {entry.preview}
          </p>
        ) : null}
      </div>

      {entry.relatedPosts?.length ? (
        <section className="border-t border-dashed border-[rgb(var(--widget-fg)/0.14)] px-5 py-4" aria-label="Related feedback">
          <h2 className="text-sm font-semibold text-[rgb(var(--widget-fg))]">Related feedback</h2>
          <p className="mt-1 text-xs text-[rgb(var(--widget-fg)/0.5)]">The requests behind this update.</p>
          <ul className="-mx-2 mt-3 space-y-1">
            {entry.relatedPosts.map((post) => (
              <li key={post.id}>
                <button type="button" onClick={() => onOpenRelatedPost(post)} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[rgb(var(--widget-fg)/0.05)] focus-visible:bg-[rgb(var(--widget-fg)/0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--widget-accent)]">
                  <StatusIcon status={post.roadmapStatus ?? undefined} className="size-[18px] shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm text-[rgb(var(--widget-fg)/0.85)]" title={post.title}>{post.title}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-[rgb(var(--widget-fg)/0.4)]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {shipped.length ? (
        <section className="mt-2 border-t border-dashed border-[rgb(var(--widget-fg)/0.14)] pb-6">
          <div className="flex items-center gap-2 px-5 py-4">
            <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" aria-hidden="true">
              <CheckIcon className="size-2" />
            </span>
            <h2 className="text-sm font-semibold text-[rgb(var(--widget-fg))]">Latest updates</h2>
          </div>
          <div>
            {shipped.map((item) => {
              const isCurrent = item.id === entry.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isCurrent) onOpen(item);
                  }}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left ${
                    isCurrent
                      ? "cursor-default bg-[rgb(var(--widget-fg)/0.03)]"
                      : "cursor-pointer"
                  }`}
                >
                  <p className="min-w-0 flex-1 truncate text-sm text-[rgb(var(--widget-fg)/0.9)]">
                    {item.title}
                  </p>
                  <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" role="img" aria-label="Done">
                    <CheckIcon className="size-2" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
