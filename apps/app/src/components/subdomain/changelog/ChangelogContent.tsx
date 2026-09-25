import React from "react";
import Link from "next/link";
import StatusIcon from "@/components/requests/StatusIcon";
import { ArrowIcon } from "@/components/global/icons";
import type { RelatedPost } from "@featul/api/changelog/related";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import type { JSONContent } from "@tiptap/core";
import type { Role } from "@/types/team";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
import { cn } from "@featul/ui/lib/utils";

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

export function ChangelogContent({ entry }: ChangelogContentProps) {
  return (
    <article
      className={cn(
        settingsCardShellClass,
        "w-full min-w-0 max-w-none justify-self-stretch",
      )}
    >
      {entry.coverImage ? (
        <div className={cn(settingsCardInnerClass, "mb-2 overflow-hidden p-0")}>
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={entry.coverImage}
              alt={entry.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className={settingsCardInnerClass}>
        <h1 className="text-xl font-semibold text-foreground mb-4">
          {entry.title}
        </h1>

        {entry.content ? (
          <div className="max-w-none">
            <ChangelogRenderer content={entry.content} />
          </div>
        ) : null}

        {entry.relatedPosts?.length ? (
          <section
            className="mt-6 border-t border-border/60 pt-4"
            aria-label="Related posts"
          >
            <h2 className="mb-3 text-sm font-medium">Related posts</h2>
            <ul className="space-y-1">
              {entry.relatedPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/board/p/${encodeURIComponent(post.slug)}`}
                    className="group flex items-center gap-2.5 rounded-md px-2 py-3 text-sm transition-colors hover:bg-muted/40 dark:hover:bg-muted/30 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <StatusIcon
                      status={post.roadmapStatus ?? undefined}
                      className="size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 break-words">
                      {post.title}
                    </span>
                    <ArrowIcon className="size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {entry.tags && entry.tags.length > 0 ? (
          <div className="pt-4 mt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs rounded-md bg-muted px-2 py-1 text-muted-foreground font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
