"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/core";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import { WidgetAuthorAvatar } from "./AuthorAvatar";

export type WidgetChangelogEntry = {
  id: string;
  title: string;
  slug?: string;
  summary?: string | null;
  preview?: string | null;
  content?: unknown;
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

export function WidgetUpdates({
  entries,
  accent = "#3b82f6",
  selectedId = null,
  onOpen,
  onBack: _onBack,
}: Props) {
  const selected = selectedId
    ? entries.find((entry) => entry.id === selectedId) || null
    : null;

  if (selected) {
    return <UpdateDetail entry={selected} accent={accent} />;
  }

  if (!entries.length) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-medium text-[rgb(var(--widget-fg))]">No updates yet</p>
        <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
          Published product changes will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {entries.map((entry, index) => {
        const tag = primaryTag(entry);
        const dateLabel = formatUpdateDate(entry.publishedAt);
        const preview = (entry.summary || entry.preview || "").trim();

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onOpen(entry)}
            className={`w-full cursor-pointer px-5 py-5 text-left transition-colors hover:bg-[rgb(var(--widget-fg)/0.03)] ${
              index > 0 ? "border-t border-dashed border-[rgb(var(--widget-fg)/0.12)]" : ""
            }`}
          >
            {(dateLabel || tag) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-[0.08em]">
                {dateLabel ? (
                  <span className="text-[rgb(var(--widget-fg)/0.4)]">{dateLabel}</span>
                ) : null}
                {dateLabel && tag ? (
                  <span className="text-[rgb(var(--widget-fg)/0.25)]" aria-hidden>
                    ·
                  </span>
                ) : null}
                {tag ? (
                  <span style={{ color: tag.color || accent }}>{tag.name}</span>
                ) : null}
              </div>
            )}

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
                    <p className="truncate text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                      {entry.authorRoleLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function UpdateDetail({
  entry,
  accent,
}: {
  entry: WidgetChangelogEntry;
  accent: string;
}) {
  const tag = primaryTag(entry);
  const dateLabel = formatUpdateDate(entry.publishedAt);
  const content = entry.content as JSONContent | null | undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" data-widget-scroll="">
      <div className="px-5 pb-8 pt-1">
        {(dateLabel || tag) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-[0.08em]">
            {dateLabel ? (
              <span className="text-[rgb(var(--widget-fg)/0.4)]">{dateLabel}</span>
            ) : null}
            {dateLabel && tag ? (
              <span className="text-[rgb(var(--widget-fg)/0.25)]" aria-hidden>
                ·
              </span>
            ) : null}
            {tag ? <span style={{ color: tag.color || accent }}>{tag.name}</span> : null}
          </div>
        )}

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
                <p className="truncate text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                  {entry.authorRoleLabel}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="my-5 border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]" />

        {entry.coverImage ? (
          <div className="mb-5 overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.coverImage}
              alt=""
              className="max-h-56 w-full object-cover"
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
    </div>
  );
}
