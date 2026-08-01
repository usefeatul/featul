"use client";

import { cn } from "@featul/ui/lib/utils";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { LayersIcon } from "@featul/ui/icons/layers";
import {
  DEMO_POSTS,
  DEMO_STATUS_LABELS,
  type DemoStatus,
} from "./data";
import { DemoStatusIcon } from "./demo-status-icon";
import { DemoAvatar } from "./demo-avatar";

const COLUMNS = ["planned", "progress", "review"] as const satisfies readonly DemoStatus[];

const COLUMN_TONES: Record<
  (typeof COLUMNS)[number],
  { footer: string; dot: string }
> = {
  planned: { footer: "bg-amber-500/10", dot: "bg-amber-500" },
  progress: { footer: "bg-sky-500/10", dot: "bg-sky-500" },
  review: { footer: "bg-violet-500/10", dot: "bg-violet-500" },
};

export function DemoRoadmap() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h3 className="text-base font-semibold text-foreground">Roadmap</h3>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden px-4 pb-4">
        {COLUMNS.map((status) => {
          const cards = DEMO_POSTS.filter((post) => post.status === status);
          const tone = COLUMN_TONES[status];
          return (
            <div
              key={status}
              className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border/70 bg-background/60"
            >
              <div className="flex items-center gap-2 border-b border-border/60 bg-card px-3 py-2">
                <DemoStatusIcon status={status} className="size-3.5" />
                <span className="flex-1 truncate text-xs font-medium text-foreground">
                  {DEMO_STATUS_LABELS[status]}
                </span>
                <span className="rounded-sm border border-border/60 bg-background px-1 text-[9px] tabular-nums text-accent">
                  {cards.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {cards.map((post) => (
                  <div
                    key={post.id}
                    className="overflow-hidden rounded-md border border-border/70 bg-card shadow-xs transition-transform hover:-translate-y-0.5"
                  >
                    <div className="px-3 pb-2 pt-2.5">
                      <div className="flex items-start gap-2">
                        <span className="line-clamp-2 min-w-0 flex-1 text-xs font-medium leading-4 text-foreground">
                          {post.title}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 size-2 shrink-0 rounded-full",
                            tone.dot
                          )}
                        />
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-accent">
                        {post.excerpt}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5",
                        tone.footer
                      )}
                    >
                      <DemoAvatar
                        name={post.author}
                        className="size-4 text-[7px]"
                      />
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-1.5 py-px text-[9px] text-accent">
                        <LayersIcon className="size-2.5" />
                        {post.board}
                      </span>
                      <span className="ml-auto text-[9px] text-accent">
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-accent">
                        <CommentsIcon size={10} />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
