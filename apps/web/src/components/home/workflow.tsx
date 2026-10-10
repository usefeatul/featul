"use client";

import { useState } from "react";
import {
  CheckmarkIcon,
  ChevronDownIcon,
  ArticleIcon,
  LockIcon,
  EditIcon,
  MergeIcon,
  SearchIcon,
  TagIcon,
} from "@/components/global/icons";
import { PendingIcon } from "@featul/ui/icons/pending";
import { ReviewIcon } from "@featul/ui/icons/review";
import { PlannedIcon } from "@featul/ui/icons/planned";
import { ProgressIcon } from "@featul/ui/icons/progress";
import { CompletedIcon } from "@featul/ui/icons/completed";
import { ClosedIcon } from "@featul/ui/icons/closed";
import { Button } from "@featul/ui/components/button";
import { Avatar, AvatarFallback } from "@featul/ui/components/avatar";
import {
  Toolbar,
  ToolbarSeparator,
  toolbarItemClass,
} from "@featul/ui/components/toolbar";
import { OverlayChip } from "@featul/ui/components/overlay-chip";
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { Select } from "./select";
import { cn } from "@featul/ui/lib/utils";
import { Preview, Engagement, previewControl } from "./preview";

const statuses = [
  { label: "Pending", Icon: PendingIcon },
  { label: "Review", Icon: ReviewIcon },
  { label: "Planned", Icon: PlannedIcon },
  { label: "Progress", Icon: ProgressIcon },
  { label: "Completed", Icon: CompletedIcon },
  { label: "Closed", Icon: ClosedIcon },
];

export function StatusPreview() {
  const [selected, setSelected] = useState(statuses[0]!);
  const [open, setOpen] = useState(true);
  return (
    <Preview label="Request status" className="relative h-[282px] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-accent">Feature requests</span>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Choose request status"
          onClick={() => setOpen(!open)}
          className={cn(
            previewControl,
            "flex items-center gap-1.5 bg-foreground/5 px-2 py-1.5 text-[11px]",
          )}
        >
          <selected.Icon className="size-3.5" />
          {selected.label}
          <ChevronDownIcon className="size-3" />
        </button>
      </div>
      <p className="mt-4 pr-32 text-sm font-semibold">Add keyboard shortcuts</p>
      <p className="mt-2 pr-32 text-xs leading-5 text-accent">
        Move around your workspace faster.
      </p>
      <div className="mt-4">
        <Engagement votes={24} comments={3} title="Add keyboard shortcuts" />
      </div>
      {open && (
        <PopoverList
          role="group"
          aria-label="Request statuses"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="absolute right-4 top-[50px] z-10 w-32 rounded-md border border-border bg-card p-1 shadow-md"
        >
          {statuses.map((status) => (
            <PopoverListItem
              type="button"
              key={status.label}
              aria-pressed={selected.label === status.label}
              onClick={() => {
                setSelected(status);
                setOpen(false);
              }}
              className={cn(
                previewControl,
                "flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px]",
              )}
            >
              <status.Icon className="size-3.5" />
              {status.label}
              {selected.label === status.label && (
                <CheckmarkIcon aria-hidden className="ml-auto size-3" />
              )}
            </PopoverListItem>
          ))}
        </PopoverList>
      )}
    </Preview>
  );
}

const suggestions = [
  {
    title: "Add keyboard shortcuts for search",
    votes: 14,
    comments: 2,
    initiallyVoted: true,
  },
  { title: "Add keyboard shortcuts for notifications", votes: 28, comments: 4 },
  { title: "Add keyboard shortcuts for dashboard", votes: 0, comments: 1 },
];

export function SimilarPreview() {
  const [title, setTitle] = useState("Add keyboard shortcuts");
  const [content, setContent] = useState("");
  const [board, setBoard] = useState("Features");
  const [status, setStatus] = useState("Pending");
  const [tag, setTag] = useState("Tags");
  const [created, setCreated] = useState(false);
  const words = title.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = words.length
    ? suggestions.filter((post) =>
        words.every((word) => post.title.toLowerCase().includes(word)),
      )
    : [];
  const StatusIcon = statuses.find((item) => item.label === status)!.Icon;
  return (
    <Preview label="Create post" className="flex h-[338px] flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-2">
          <ArticleIcon className="size-3.5" />
          {created ? board : "Create post"}
        </span>
        {created && (
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={() => setCreated(false)}
            className="h-6 px-1.5 text-[10px]"
          >
            <EditIcon className="size-3" />
            Edit
          </Button>
        )}
      </div>
      {created ? (
        <div className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] text-accent">
            <StatusIcon className="size-3.5" />
            {status}
          </p>
          <p className="mt-3 break-words text-base font-semibold">{title}</p>
          {content && (
            <p className="mt-3 max-h-32 overflow-auto break-words text-xs leading-5 text-accent">
              {content}
            </p>
          )}
          <div className="mt-4">
            <Engagement
              key={title}
              title={title}
              votes={1}
              initiallyVoted
              comments={0}
            />
          </div>
        </div>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim().length >= 3) setCreated(true);
          }}
        >
          <div className="flex items-center gap-2 px-3 pt-3">
            <Avatar className="hidden size-6 shrink-0 min-[400px]:flex">
              <AvatarFallback className="text-[9px]">JD</AvatarFallback>
            </Avatar>
            <Toolbar variant="soft" size="sm" className="h-7 max-w-full">
              <Select
                label="Choose board"
                value={board}
                onChange={setBoard}
                options={["Features", "Bugs"].map((label) => ({
                  label,
                  icon: <span className="size-1.5 rounded-full bg-primary" />,
                }))}
              />
              <ToolbarSeparator className="self-stretch" />
              <Select
                label="Post status"
                value={status}
                onChange={setStatus}
                options={statuses.map(({ label, Icon }) => ({
                  label,
                  icon: <Icon className="size-3" />,
                }))}
              />
              <ToolbarSeparator className="self-stretch" />
              <Select
                label="Post tags"
                value={tag}
                onChange={setTag}
                options={["Tags", "Design", "UX"].map((label) => ({
                  label,
                  icon: <TagIcon className="size-3" />,
                }))}
              />
            </Toolbar>
          </div>
          <div className="px-4 py-3">
            <input
              aria-label="Post title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Post title"
              className="w-full rounded-sm bg-transparent text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <textarea
              aria-label="Post contents"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Add post contents"
              className="mt-1 h-6 w-full resize-none rounded-sm bg-transparent text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {matches.length > 0 && (
              <>
                <p className="border-t border-border/50 px-4 py-2 text-[9px] font-light uppercase tracking-wide text-accent">
                  Similar posts
                </p>
                <div className="divide-y divide-border/60">
                  {matches.map((post) => (
                    <div
                      key={post.title}
                      className="flex items-center justify-between gap-2 px-4 py-1.5 hover:bg-muted/30"
                    >
                      <p
                        title={post.title}
                        className="min-w-0 truncate text-[11px] font-light"
                      >
                        {post.title}
                      </p>
                      <Engagement {...post} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end px-3 py-2.5">
            <Button
              type="submit"
              disabled={title.trim().length < 3}
              size="sm"
              className="h-7 px-4 text-xs"
            >
              Create
            </Button>
          </div>
        </form>
      )}
    </Preview>
  );
}

const mergeCandidates = [
  "Show a clear activity history for voting",
  "Show a clear activity history for integrations",
  "Show a clear activity history for comments",
  "Show a clear activity history for mobile navigation",
];

export function MergePreview() {
  const [query, setQuery] = useState("activity");
  const [merged, setMerged] = useState<string | null>(null);
  const matches = mergeCandidates.filter((title) =>
    title.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <Preview label="Merge ideas" className="h-[260px]">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-xs">
        <SearchIcon className="size-3.5" />
        Merge
      </div>
      {merged ? (
        <div className="p-4" aria-live="polite">
          <p className="flex items-center gap-1.5 text-[11px] text-accent">
            <ReviewIcon className="size-3.5" />
            Review
          </p>
          <p className="mt-2 text-sm font-semibold">{merged}</p>
          <div className="mt-3">
            <Engagement
              key={merged}
              title={merged}
              votes={42}
              comments={5}
              initiallyVoted
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
            <span className="text-[11px] text-muted-foreground">
              Merged here
            </span>
            <OverlayChip innerClassName="h-6 min-h-6 gap-1 px-1.5 text-[10px]">
              <PendingIcon className="size-3" />
              Activity log
            </OverlayChip>
          </div>
          <Button
            type="button"
            variant="plain"
            size="sm"
            onClick={() => setMerged(null)}
            className="mt-3 h-7 gap-1.5 text-[11px]"
          >
            <MergeIcon className="size-3.5" />
            Merge other here
          </Button>
        </div>
      ) : (
        <>
          <label className="mx-2 mt-2 flex items-center gap-2 rounded-md bg-foreground/5 px-3 py-2">
            <SearchIcon aria-hidden className="size-4 shrink-0 text-accent" />
            <input
              aria-label="Search posts"
              placeholder="Search posts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 rounded-sm bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <div className="p-2">
            {matches.map((title) => (
              <button
                type="button"
                key={title}
                onClick={() => setMerged(title)}
                className={cn(
                  previewControl,
                  "block w-full truncate px-3 py-2.5 text-left text-[11px] hover:bg-primary/10 hover:text-primary",
                )}
                title={title}
              >
                {title}
              </button>
            ))}
            {!matches.length && (
              <p role="status" className="p-3 text-xs text-accent">
                No results found.
              </p>
            )}
          </div>
        </>
      )}
    </Preview>
  );
}

export function DiscussionPreview() {
  const [internal, setInternal] = useState(true);
  const [draft, setDraft] = useState(
    "Let’s review this with the product team before sharing an update.",
  );
  const [comments, setComments] = useState([
    {
      id: 0,
      author: "Maya",
      initials: "MK",
      text: "Can we include this in our next release?",
      internal: true,
    },
  ]);
  return (
    <Preview label="Team discussion" className="p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Comments</span>
        <span className="text-[10px] text-accent">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>
      <div
        className="mt-4 max-h-28 space-y-3 overflow-y-auto overscroll-contain"
        aria-live="polite"
      >
        {comments
          .slice()
          .reverse()
          .map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-muted text-[9px] text-accent">
                  {comment.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-[9px] text-muted-foreground/60">
                    Just now
                  </span>
                  {comment.internal && (
                    <span className="inline-flex h-5 items-center gap-1 rounded-md bg-foreground/5 px-1.5 text-[9px] text-accent">
                      <LockIcon className="size-2.5" />
                      Internal
                    </span>
                  )}
                </div>
                <p className="mt-2 break-words text-xs leading-5">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
      </div>
      <form
        className="mt-4 space-y-2.5 border-t border-border/50 pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setComments((previous) => [
            ...previous,
            {
              id: previous.length,
              author: "You",
              initials: "Y",
              text: draft.trim(),
              internal,
            },
          ]);
          setDraft("");
        }}
      >
        <textarea
          aria-label="Comment"
          placeholder={
            internal ? "Leave an internal reply..." : "Leave a reply..."
          }
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={280}
          className="h-16 w-full resize-none rounded-md border border-border/40 bg-card p-2 text-xs leading-5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <div className="flex items-center justify-between gap-2">
          <Toolbar variant="soft" size="sm" className="w-fit">
            <Button
              type="button"
              size="xs"
              variant="plain"
              aria-label={
                internal
                  ? "Disable internal comment"
                  : "Enable internal comment"
              }
              title={internal ? "Internal only" : "Make internal"}
              aria-pressed={internal}
              onClick={() => setInternal(!internal)}
              className={cn(
                toolbarItemClass,
                "w-8 px-0",
                internal && "bg-primary/10",
              )}
            >
              <LockIcon className="size-4" />
            </Button>
          </Toolbar>
          <Button
            type="submit"
            size="xs"
            variant="outline"
            disabled={!draft.trim()}
            className="h-8 bg-foreground/5 px-4 text-xs"
          >
            Comment
          </Button>
        </div>
      </form>
    </Preview>
  );
}
