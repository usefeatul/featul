import React from "react";
import Link from "next/link";
import StatusIcon from "@/components/requests/StatusIcon";
import { ArrowIcon } from "@/components/global/icons";
import type { RelatedPost } from "@featul/api/changelog/related";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import type { JSONContent } from "@tiptap/core";
import type { Role } from "@/types/team";

export interface ChangelogEntryData {
  id: string;
  title: string;
  slug: string;
  content?: JSONContent | null;
  summary?: string | null;
  coverImage?: string | null;
  publishedAt?: string | Date | null;
  author?: {
    name?: string | null;
    image?: string | null;
    role?: Role | null;
    isOwner?: boolean;
  };
  relatedPosts?: RelatedPost[];
  tags?: Array<{ id: string; name: string }>;
}

interface ChangelogContentProps {
  entry: ChangelogEntryData;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Plain changelog entry: date and tags, title, cover, body, related posts. */
export function ChangelogContent({ entry }: ChangelogContentProps) {
  const date = formatDate(entry.publishedAt);
  return (
    <article className="w-full min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {date ? (
          <time
            className="text-muted-foreground"
            dateTime={entry.publishedAt ? new Date(entry.publishedAt).toISOString() : undefined}
          >
            {date}
          </time>
        ) : null}
        {entry.tags?.map((tag) => (
          <React.Fragment key={tag.id}>
            <span className="text-muted-foreground/50">·</span>
            <span className="font-medium text-primary">{tag.name}</span>
          </React.Fragment>
        ))}
      </div>

      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
        {entry.title}
      </h1>

      {entry.coverImage ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img src={entry.coverImage} alt={entry.title} className="h-full w-full object-cover" />
        </div>
      ) : null}

      {entry.content ? (
        <div className="mt-6 max-w-none">
          <ChangelogRenderer content={entry.content} />
        </div>
      ) : null}

      {entry.relatedPosts?.length ? (
        <section className="mt-10" aria-label="Related posts">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Related posts
          </h2>
          <ul className="divide-y divide-border/60 dark:divide-white/[0.07]">
            {entry.relatedPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/board/p/${encodeURIComponent(post.slug)}`}
                  className="group flex items-center gap-2.5 py-3 text-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <StatusIcon status={post.roadmapStatus ?? undefined} className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 break-words">{post.title}</span>
                  <ArrowIcon className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
