"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftIcon,
  ListFilterIcon,
  EditIcon,
  HomeIcon,
  FeedbackIcon,
  RoadmapIcon,
  ChangelogIcon,
  SearchIcon,
} from "@/components/global/icons";
import { PlannedIcon } from "@featul/ui/icons/planned";
import { ReviewIcon } from "@featul/ui/icons/review";
import { ProgressIcon } from "@featul/ui/icons/progress";
import { Button } from "@featul/ui/components/button";
import { SegmentedControl } from "@featul/ui/components/segmented-control";
import { Avatar, AvatarFallback } from "@featul/ui/components/avatar";
import { cn } from "@featul/ui/lib/utils";
import { Preview, Engagement, previewControl } from "./preview";

const sections = ["Feedback", "Roadmap", "Changelog"] as const;
type Section = (typeof sections)[number];

type FeedPost = {
  title: string;
  detail: string;
  votes: number;
  comments: number;
  initiallyVoted: boolean;
  author: string;
  initials: string;
  status: string;
  StatusIcon: typeof ReviewIcon;
};
const feedPosts: FeedPost[] = [
  {
    title: "Add keyboard shortcuts",
    detail: "Move around your workspace a little faster.",
    votes: 24,
    comments: 3,
    initiallyVoted: true,
    author: "Jamie",
    initials: "JD",
    status: "Review",
    StatusIcon: ReviewIcon,
  },
  {
    title: "Slack notifications",
    detail: "Keep the team in the loop.",
    votes: 18,
    comments: 6,
    initiallyVoted: false,
    author: "Maya",
    initials: "MK",
    status: "Planned",
    StatusIcon: PlannedIcon,
  },
];
type FeedProps = {
  section: Section | "Home";
  widget?: boolean;
  extraPost?: FeedPost | null;
};
function Feed({ section, widget = false, extraPost }: FeedProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      key={section}
      initial={{ opacity: reduceMotion ? 1 : 0.85 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }}
    >
      <FeedContent section={section} widget={widget} extraPost={extraPost} />
    </motion.div>
  );
}

function FeedContent({ section, widget, extraPost }: FeedProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FeedPost | null>(null);
  const posts = extraPost ? [extraPost, ...feedPosts] : feedPosts;
  if (selected && section === "Feedback")
    return (
      <div className="scrollbar-hide h-[208px] overflow-y-auto px-4 py-3">
        <button
          type="button"
          className={cn(
            previewControl,
            "mb-3 flex items-center gap-1 text-xs text-accent",
          )}
          onClick={() => setSelected(null)}
        >
          <ArrowLeftIcon className="size-3.5" />
          Feedback
        </button>
        <p className="flex items-center gap-1 text-[11px] text-accent">
          <selected.StatusIcon className="size-3.5" />
          {selected.status}
        </p>
        <p className="mt-2 text-sm font-semibold">{selected.title}</p>
        <p className="mt-2 text-xs leading-5 text-accent">{selected.detail}</p>
        <div className="mt-3">
          <Engagement {...selected} />
        </div>
      </div>
    );
  if (section === "Home")
    return (
      <div className="h-[208px] p-4">
        <p className="text-sm font-semibold">Welcome to your workspace</p>
        <p className="mt-2 text-xs leading-5 text-accent">
          Share an idea, explore what’s coming, and catch up on the latest
          updates.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-border/60 p-2 text-xs">
          <PlannedIcon className="size-3.5" />
          Slack notifications
          <span className="ml-auto text-[10px] text-accent">Planned</span>
        </div>
      </div>
    );
  if (section === "Roadmap")
    return (
      <div className="grid h-[208px] grid-cols-2 gap-2 p-3">
        {[
          { label: "Planned", Icon: PlannedIcon, title: "Keyboard shortcuts" },
          {
            label: "Progress",
            Icon: ProgressIcon,
            title: "Slack notifications",
          },
        ].map(({ label, Icon, title }) => (
          <div
            key={label}
            className="rounded-lg border border-border/60 bg-card p-2.5"
          >
            <p className="flex items-center gap-1 text-[11px]">
              <Icon className="size-3.5" />
              {label}
            </p>
            <p className="mt-3 rounded-md border border-border/60 bg-card p-2 text-xs leading-5">
              {title}
            </p>
          </div>
        ))}
      </div>
    );
  if (section === "Changelog")
    return (
      <div className="h-[208px] p-4">
        <span className="rounded bg-primary/10 px-2 py-1 text-[10px] text-primary">
          New
        </span>
        <p className="mt-3 text-sm font-semibold">
          A better way to collect feedback
        </p>
        <p className="mt-2 text-xs leading-5 text-accent">
          Your ideas, roadmap, and product updates. Now connected in one
          workspace.
        </p>
      </div>
    );
  return (
    <div className="scrollbar-hide h-[208px] overflow-y-auto overscroll-contain">
      {widget && (
        <label className="mx-3 mb-1 flex items-center gap-2 rounded-md border border-border/40 bg-foreground/5 px-2.5 py-2 text-accent">
          <SearchIcon className="size-3.5" />
          <input
            aria-label="Search feedback"
            placeholder="Search feedback"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </label>
      )}
      <div className="divide-y divide-border/60">
        {posts
          .filter((post) =>
            post.title.toLowerCase().includes(query.toLowerCase()),
          )
          .map((post) => (
            <div
              key={post.title}
              className="relative px-4 py-3 motion-safe:transition-colors hover:bg-muted/30"
            >
              {widget ? (
                <div className="flex items-start gap-2.5">
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    <AvatarFallback className="bg-muted text-[9px] text-accent">
                      {post.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSelected(post)}
                      className={cn(
                        previewControl,
                        "text-left text-xs font-semibold leading-5",
                      )}
                    >
                      {post.title}
                    </button>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                      {post.detail}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground">
                      <span>{post.author} · Just now ·</span>
                      <post.StatusIcon className="size-3" />
                      {post.status}
                    </div>
                  </div>
                  <Engagement
                    title={post.title}
                    votes={post.votes}
                    initiallyVoted={post.initiallyVoted}
                  />
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-[11px] text-accent">
                    <post.StatusIcon className="size-3.5" />
                    {post.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(post)}
                    className={cn(
                      previewControl,
                      "mt-1.5 text-left text-sm font-semibold",
                    )}
                  >
                    {post.title}
                  </button>
                  <p className="mt-1.5 text-xs leading-5 text-accent">
                    {post.detail}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-muted text-[9px] text-accent">
                          {post.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-accent">
                        {post.author}
                        <span className="block text-[9px] text-muted-foreground">
                          Just now
                        </span>
                      </span>
                    </div>
                    <Engagement {...post} />
                  </div>
                </>
              )}
            </div>
          ))}
        {!posts.some((post) =>
          post.title.toLowerCase().includes(query.toLowerCase()),
        ) && (
          <p className="px-4 py-5 text-xs text-accent">No feedback found.</p>
        )}
      </div>
    </div>
  );
}

export function PortalPreview() {
  const [section, setSection] = useState<Section>("Feedback");
  return (
    <Preview label="Feedback portal">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 p-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <FeedbackIcon className="size-4" />
          Your workspace
        </span>
        <SegmentedControl
          aria-label="Portal sections"
          size="sm"
          value={section}
          onValueChange={setSection}
          itemClassName="text-[10px]"
          options={sections.map((item) => ({ value: item, label: item }))}
        />
      </div>
      <div className="flex items-center gap-1.5 px-3 pt-3 text-[10px] text-accent">
        <ListFilterIcon className="size-3" />
        {section === "Feedback" ? "All feedback" : section}
      </div>
      <Feed section={section} />
    </Preview>
  );
}

export function WidgetPreview() {
  const [section, setSection] = useState("Feedback");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [content, setContent] = useState("");
  const [createdPost, setCreatedPost] = useState<FeedPost | null>(null);
  const nav = [
    { label: "Home", Icon: HomeIcon },
    { label: "Feedback", Icon: FeedbackIcon },
    { label: "Roadmap", Icon: RoadmapIcon },
    { label: "Updates", Icon: ChangelogIcon },
  ];
  return (
    <Preview label="Feedback widget">
      <div className="flex items-center gap-2 px-3 py-3">
        {composing ? (
          <button
            type="button"
            aria-label="Back to widget"
            onClick={() => setComposing(false)}
            className={cn(previewControl, "p-1")}
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        ) : (
          <FeedbackIcon className="size-5" />
        )}
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {composing ? "Give feedback" : "Your workspace"}
        </span>
        {!composing && (
          <Button
            type="button"
            size="sm"
            onClick={() => setComposing(true)}
            className="h-8 gap-1.5 px-2.5 text-[11px]"
          >
            <EditIcon className="size-3.5" />
            Give feedback
          </Button>
        )}
      </div>
      {composing ? (
        <form
          className="flex h-[208px] flex-col px-4 pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim().length < 3) return;
            setCreatedPost({
              title: draft.trim(),
              detail: content.trim(),
              votes: 1,
              comments: 0,
              initiallyVoted: true,
              author: "You",
              initials: "Y",
              status: "Review",
              StatusIcon: ReviewIcon,
            });
            setDraft("");
            setContent("");
            setSection("Feedback");
            setComposing(false);
          }}
        >
          <input
            aria-label="Feedback title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What's on your mind?"
            maxLength={120}
            className="w-full rounded-sm bg-transparent py-2 text-base font-semibold outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary"
          />
          <textarea
            aria-label="Feedback details"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add more detail..."
            className="scrollbar-hide min-h-0 flex-1 resize-none rounded-sm bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              size="sm"
              disabled={draft.trim().length < 3}
              className="h-8 px-5 text-xs"
            >
              Post
            </Button>
          </div>
        </form>
      ) : (
        <Feed
          widget
          extraPost={createdPost}
          section={
            section === "Updates"
              ? "Changelog"
              : section === "Roadmap"
                ? "Roadmap"
                : section === "Home"
                  ? "Home"
                  : "Feedback"
          }
        />
      )}
      <nav
        aria-label="Widget navigation"
        className="grid grid-cols-4 gap-1 border-t border-border/60 p-2"
      >
        {nav.map(({ label, Icon }) => (
          <button
            type="button"
            key={label}
            aria-pressed={section === label && !composing}
            onClick={() => {
              setSection(label);
              setComposing(false);
            }}
            className={cn(
              previewControl,
              "flex flex-col items-center gap-1 py-1.5 text-[9px] text-accent",
              section === label && !composing && "bg-foreground/5 text-primary",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </nav>
      <p className="border-t border-border/60 py-1 text-center text-[9px] text-muted-foreground">
        Powered by featul
      </p>
    </Preview>
  );
}
