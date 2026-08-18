"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/core";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TickIcon } from "@featul/ui/icons/tick";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import { WidgetAuthorAvatar } from "./avatar";
import { WidgetEmpty } from "./empty";
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
  authorRoleLabel?: string | null;
};

type Props = {
  entries: WidgetChangelogEntry[];
  accent?: string;
  selectedId?: string | null;
  onOpen: (entry: WidgetChangelogEntry) => void;
  onBack: () => void;
};

function formatUpdateDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

function primaryTag(entry: WidgetChangelogEntry): {
  name: string;
  color?: string | null;
} | null {
  const tag = entry.tags?.find((item) => item.name?.trim());
  if (!tag) return null;
  return { name: tag.name.trim().toUpperCase(), color: tag.color };
}

export function changelogBadge(
  entry: WidgetChangelogEntry,
  options?: { fallback?: string | null },
): { name: string; color?: string | null } | null {
  const tag = primaryTag(entry);
  if (tag) return tag;
  const fallback = options?.fallback;
  if (!fallback) return null;
  return { name: fallback.toUpperCase(), color: null };
}

export function UpdateMetaRow({
  entry,
  accent = "#3b82f6",
  fallbackBadge = "Just Shipped",
  className = "",
}: {
  entry: WidgetChangelogEntry;
  accent?: string;
  fallbackBadge?: string | null;
  className?: string;
}) {
  const dateLabel = formatUpdateDate(entry.publishedAt);
  const badge = changelogBadge(entry, { fallback: fallbackBadge });
  if (!dateLabel && !badge) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}
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
  accent = "#3b82f6",
  selectedId = null,
  onOpen,
  onBack: _onBack,
}: Props) {
  const reduceMotion = useReducedMotion();
  const selected = selectedId
    ? entries.find((entry) => entry.id === selectedId) || null
    : null;

  const viewTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  if (!entries.length && !selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <WidgetEmpty
          title="No updates yet"
          description="Published product changes will show up here."
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {selected ? (
          <motion.div
            key={`detail-${selected.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
            transition={viewTransition}
            className="absolute inset-0 flex min-h-0 flex-col"
          >
            <UpdateDetail
              entry={selected}
              accent={accent}
              recentEntries={entries.slice(0, 5)}
              onOpen={onOpen}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={viewTransition}
            className="absolute inset-0 flex min-h-0 flex-col overflow-y-auto scrollbar-hide"
          >
            {entries.map((entry, index) => {
              const preview = (entry.summary || entry.preview || "").trim();
              const isRecent = index < 5;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onOpen(entry)}
                  className={`w-full cursor-pointer px-5 py-5 text-left transition-colors hover:bg-[rgb(var(--widget-fg)/0.03)] ${
                    index > 0 ? "border-t border-dashed border-[rgb(var(--widget-fg)/0.12)]" : ""
                  }`}
                >
                  <UpdateMetaRow
                    entry={entry}
                    accent={accent}
                    fallbackBadge={isRecent ? "Just Shipped" : null}
                  />

                  <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
                    {entry.title}
                  </h3>

                  {preview ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.5)]">
                      {preview}
                    </p>
                  ) : null}

                  {entry.authorName ? (
                    <div className="mt-4 flex items-center gap-2.5">
                      <WidgetAuthorAvatar
                        name={entry.authorName}
                        image={entry.authorImage}
                        className="size-7"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                          {entry.authorName}
                        </p>
                        {entry.authorRoleLabel ? (
                          <p className="truncate font-heading text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                            {entry.authorRoleLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
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
}: {
  entry: WidgetChangelogEntry;
  accent: string;
  recentEntries: WidgetChangelogEntry[];
  onOpen: (entry: WidgetChangelogEntry) => void;
}) {
  const content = entry.content && typeof entry.content === "object" ? entry.content : null;
  const shipped = recentEntries.slice(0, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide" data-widget-scroll="">
      <div className="px-5 pb-4 pt-1">
        <UpdateMetaRow entry={entry} accent={accent} fallbackBadge="Just Shipped" />

        <h1 className="mt-3 text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
          {entry.title}
        </h1>

        {entry.authorName ? (
          <div className="mt-4 flex items-center gap-2.5">
            <WidgetAuthorAvatar
              name={entry.authorName}
              image={entry.authorImage}
              className="size-8"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                {entry.authorName}
              </p>
              {entry.authorRoleLabel ? (
                <p className="truncate font-heading text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                  {entry.authorRoleLabel}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]" />

      <div className="px-5 pb-4 pt-5">
        {entry.coverImage ? (
          <div className="mb-5 overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)]">
            <WidgetImage
              url={entry.coverImage}
              alt=""
              className="w-full"
              imgClassName="max-h-56 w-full object-cover"
            />
          </div>
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

      {shipped.length ? (
        <section className="mt-2 border-t border-dashed border-[rgb(var(--widget-fg)/0.14)] pb-6">
          <div className="flex items-center gap-2 px-5 py-4">
            <TickIcon className="size-4 shrink-0" width={16} height={16} />
            <h2 className="text-sm font-semibold text-[rgb(var(--widget-fg))]">Recently shipped</h2>
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
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                    isCurrent
                      ? "cursor-default bg-[rgb(var(--widget-fg)/0.03)]"
                      : "cursor-pointer hover:bg-[rgb(var(--widget-fg)/0.03)]"
                  }`}
                >
                  <p className="min-w-0 flex-1 truncate text-sm text-[rgb(var(--widget-fg)/0.9)]">
                    {item.title}
                  </p>
                  <TickIcon className="size-4 shrink-0" width={16} height={16} aria-label="Done" />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
