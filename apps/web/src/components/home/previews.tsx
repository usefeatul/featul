"use client";

import { X } from "lucide-react";
import {
  ChangelogIcon,
  FeedbackIcon,
  LockIcon,
  RoadmapIcon,
} from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { HomeIcon } from "@featul/ui/icons/home";
import { PlannedIcon } from "@featul/ui/icons/planned";
import { ProgressIcon } from "@featul/ui/icons/progress";
import { ReviewIcon } from "@featul/ui/icons/review";
import { Preview, PreviewStep, Engagement } from "./preview";

/** Compact presentation of subdomain/PostCard and the public portal navigation. */
export function PortalPreview() {
  return (
    <Preview className="overflow-hidden">
      <div className="flex items-center justify-center gap-2 border-b border-border px-3 py-2.5 text-[10px] text-accent">
        <LockIcon className="size-3" /> feedback.yourbrand.com
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <FeedbackIcon className="size-4" />
          <span className="hidden min-[375px]:inline">Feedback</span>
        </span>
        <div className="flex gap-2 text-[10px] text-accent">
          <span className="text-foreground">Feedback</span>
          <span>Roadmap</span>
          <span>Changelog</span>
        </div>
      </div>
      <div className="p-3">
        <PreviewStep className="rounded-lg border border-border/70 bg-background p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-accent">
            <ReviewIcon className="size-3.5" />
            Review
          </div>
          <p className="mt-1.5 text-sm font-semibold">
            A dark mode for late nights
          </p>
          <p className="mt-1 text-[11px] leading-4 text-accent">
            A little easier on the eyes after hours.
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px]">
                JD
              </span>
              <span className="truncate text-[10px] text-accent">
                Jamie · Just now
              </span>
            </div>
            <Engagement votes={24} comments={3} />
          </div>
        </PreviewStep>
        <PreviewStep className="mt-2 flex items-center gap-2 px-2 text-[11px] text-accent">
          <PlannedIcon className="size-3.5" />
          <span className="flex-1 truncate">Slack notifications</span>
          <Engagement votes={18} />
        </PreviewStep>
      </div>
    </Preview>
  );
}

/** Mirrors widget/chrome, header, home and nav with local demonstration content. */
export function WidgetPreview() {
  return (
    <Preview className="max-w-[340px] bg-background p-1.5">
      <div className="overflow-hidden rounded-md bg-card ring-1 ring-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground/5">
            <FeedbackIcon className="size-4" />
          </span>
          <span className="flex-1 text-sm font-semibold tracking-tight">
            Your workspace
          </span>
          <X className="size-3.5 text-accent" />
        </div>
        <PreviewStep className="flex items-center justify-between gap-2 border-b border-dashed border-foreground/15 px-4 py-3">
          <span className="text-xs text-accent">What’s on your mind?</span>
          <Button asChild size="sm" className="h-8 px-3 text-xs font-semibold">
            <span>Post</span>
          </Button>
        </PreviewStep>
        <PreviewStep className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-accent">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-widest">
              <ProgressIcon className="size-3.5" />
              Roadmap
            </span>
            <span>See roadmap</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <PlannedIcon className="size-3.5" />
            <span className="flex-1">Slack notifications</span>
            <Engagement votes={18} />
          </div>
        </PreviewStep>
        <PreviewStep className="grid grid-cols-4 gap-1 border-t border-border/60 p-2">
          {[
            { label: "Home", Icon: HomeIcon },
            { label: "Feedback", Icon: FeedbackIcon },
            { label: "Roadmap", Icon: RoadmapIcon },
            { label: "Updates", Icon: ChangelogIcon },
          ].map(({ label, Icon }, index) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[9px] ${index === 0 ? "bg-foreground/5 font-semibold text-primary" : "text-accent"}`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </PreviewStep>
      </div>
    </Preview>
  );
}
