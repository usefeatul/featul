"use client";

import { LockIcon, MergeIcon } from "@/components/global/icons";
import { ImageIcon } from "lucide-react";
import {
  Toolbar,
  ToolbarSeparator,
  toolbarItemClass,
} from "@featul/ui/components/toolbar";
import { Button } from "@featul/ui/components/button";
import { OverlayChip } from "@featul/ui/components/overlay-chip";
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { PendingIcon } from "@featul/ui/icons/pending";
import { ReviewIcon } from "@featul/ui/icons/review";
import { PlannedIcon } from "@featul/ui/icons/planned";
import { ProgressIcon } from "@featul/ui/icons/progress";
import { CompletedIcon } from "@featul/ui/icons/completed";
import { ClosedIcon } from "@featul/ui/icons/closed";
import { subtleOverlayShellClass } from "@featul/ui/lib/overlay";
import { Preview, PreviewStep, Engagement } from "./preview";

// Status labels and artwork follow requests/meta/StatusPicker in the workspace.
const statuses = [
  { label: "Pending", Icon: PendingIcon },
  { label: "Review", Icon: ReviewIcon },
  { label: "Planned", Icon: PlannedIcon },
  { label: "Progress", Icon: ProgressIcon },
  { label: "Completed", Icon: CompletedIcon },
  { label: "Closed", Icon: ClosedIcon },
];

export function StatusPreview() {
  return (
    <Preview className="relative min-h-[238px] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">CSV import</span>
        <span className="flex items-center gap-1.5 rounded-md bg-foreground/5 px-2.5 py-2 text-xs font-medium">
          <PendingIcon className="size-4" />
          Pending
        </span>
      </div>
      <PreviewStep className="mt-5 space-y-4 pr-32 text-xs min-[375px]:pr-36">
        <div>
          <p className="text-accent">Board</p>
          <p className="mt-1 font-medium">Feature requests</p>
        </div>
        <div>
          <p className="mb-1.5 text-accent">Activity</p>
          <Engagement votes={42} />
        </div>
      </PreviewStep>
      <PreviewStep
        className={`absolute right-4 top-[58px] ${subtleOverlayShellClass}`}
      >
        <PopoverList className="max-h-none w-28 min-[375px]:w-32">
          {statuses.map(({ label, Icon }, index) => (
            <PopoverListItem
              as="div"
              key={label}
              className="gap-2 py-1 text-xs"
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
              {index === 0 && <span className="ml-auto">✓</span>}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PreviewStep>
    </Preview>
  );
}

/** Matches the related-post list in the app’s create-post dialog. */
export function SimilarPreview() {
  return (
    <Preview className="overflow-hidden">
      <div className="border-b border-border/60 px-4 py-3 text-xs font-medium text-accent">
        Create post
      </div>
      <PreviewStep className="px-4 py-3">
        <p className="text-base font-semibold">
          Dark mode
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-primary" />
        </p>
        <p className="mt-1 text-xs text-accent">Add post contents</p>
      </PreviewStep>
      <div className="border-t border-border/50 px-4 py-2 text-[10px] font-extralight uppercase tracking-wide text-accent">
        Similar posts
      </div>
      {[
        { title: "A dark mode for late nights", votes: 24, comments: 3 },
        { title: "Follow my system theme", votes: 12, comments: 2 },
      ].map((post) => (
        <PreviewStep
          key={post.title}
          className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3"
        >
          <p className="min-w-0 truncate text-xs font-light">{post.title}</p>
          <Engagement votes={post.votes} comments={post.comments} />
        </PreviewStep>
      ))}
    </Preview>
  );
}

/** The real request detail shows merged-source chips beneath the parent post. */
export function MergePreview() {
  return (
    <Preview className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-accent">
          <ReviewIcon className="size-3.5" />
          Review
        </div>
        <p className="mt-2 text-base font-semibold">
          A dark mode for late nights
        </p>
        <p className="mt-1 text-xs text-accent">
          All the feedback, together in one place.
        </p>
        <div className="mt-3">
          <Engagement votes={36} comments={5} />
        </div>
      </div>
      <PreviewStep className="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MergeIcon className="size-3.5" />
          Merged here
        </span>
        {["Night theme", "OLED mode"].map((title) => (
          <OverlayChip
            key={title}
            innerClassName="h-6 min-h-6 gap-1 px-1.5 text-[11px] font-medium text-foreground"
          >
            <PendingIcon className="size-3" />
            {title}
          </OverlayChip>
        ))}
      </PreviewStep>
    </Preview>
  );
}

/** Mirrors CommentHeader's neutral Internal badge and the workspace composer. */
export function DiscussionPreview() {
  return (
    <Preview className="overflow-hidden p-4">
      <PreviewStep className="flex gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-accent">
          MK
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold">Maya</span>
            <span className="text-[10px] text-muted-foreground/60">
              Just now
            </span>
            <span className="inline-flex h-5 items-center gap-1 rounded-md bg-black/5 px-1.5 text-[10px] font-medium text-accent dark:bg-[#292929]">
              <LockIcon className="size-2.5" />
              Internal
            </span>
          </div>
          <p className="mt-2 text-xs leading-5">
            <span className="rounded bg-primary/10 px-1 text-primary">
              @Jamie
            </span>{" "}
            Can we include this in our next release?
          </p>
        </div>
      </PreviewStep>
      <PreviewStep className="mt-4 space-y-2.5 border-t border-border/50 pt-3">
        <p className="min-h-10 py-1.5 text-xs text-accent">
          Leave an internal reply…
        </p>
        <div className="flex items-center justify-between gap-2">
          <Toolbar variant="soft" size="sm" className="w-fit">
            <span
              className={`${toolbarItemClass} flex w-8 items-center justify-center`}
            >
              <ImageIcon className="size-4 text-accent" />
            </span>
            <ToolbarSeparator className="self-stretch bg-border/40 dark:bg-white/10" />
            <span
              className={`${toolbarItemClass} flex w-8 items-center justify-center bg-primary/10`}
            >
              <LockIcon
                className="size-4"
                style={{ color: "var(--primary)" }}
              />
            </span>
          </Toolbar>
          <Button
            asChild
            size="xs"
            variant="outline"
            className="h-8 bg-black/5 px-4 dark:bg-white/5"
          >
            <span>Comment</span>
          </Button>
        </div>
      </PreviewStep>
    </Preview>
  );
}
