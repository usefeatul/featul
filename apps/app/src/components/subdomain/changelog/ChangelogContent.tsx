import React from "react";
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
  tags?: Array<{ id: string; name: string }>;
}

interface ChangelogContentProps {
  entry: ChangelogEntryData;
}

export function ChangelogContent({ entry }: ChangelogContentProps) {
  return (
    <article className={cn(settingsCardShellClass, "w-full min-w-0 max-w-none justify-self-stretch")}>
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
