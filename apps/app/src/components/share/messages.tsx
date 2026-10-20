"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import { DitherClouds } from "@featul/ui/components/clouds";
import { cn } from "@featul/ui/lib/utils";
import { buildShareMessages } from "@/lib/share";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

const hints: Record<string, string> = {
  community: "Slack, Discord, forums",
  email: "Your customer list",
  support: "Help desk replies",
  developer: "Whoever ships it",
  shipped: "Close the loop",
  banner: "Inside your product",
  chat: "Intercom, Crisp, help chat",
  social: "X, LinkedIn, Threads",
};

function Linkified({ text }: { text: string }) {
  return text.split(/(https?:\/\/\S+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <span key={index} className="text-primary underline underline-offset-2">
        {part.replace(/^https?:\/\//, "")}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

function Surface({
  label,
  meta,
  children,
}: {
  label: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-black/10 bg-card shadow-[0_2px_4px_rgba(0,0,0,0.06),0_24px_48px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#151515]">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-2.5 text-[11px] text-accent dark:border-white/8">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {meta ? <span className="shrink-0">{meta}</span> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export default function Messages({
  name,
  boardUrl,
  userName,
  userImage,
}: {
  name: string;
  boardUrl: string;
  userName: string;
  userImage?: string | null;
}) {
  const templates = buildShareMessages(name, boardUrl);
  const [selected, setSelected] = useState(templates[0]!.id);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const current =
    templates.find((template) => template.id === selected) ?? templates[0]!;
  const text = drafts[current.id] ?? current.text;
  const edited = text !== current.text;

  const subjectMatch = text.match(/^Subject:\s*(.*)\n+/);
  const subject = subjectMatch?.[1];
  const body = subjectMatch ? text.slice(subjectMatch[0].length) : text;
  const [firstLine, ...restLines] = body.split("\n");

  const avatar = (
    <Avatar className="size-8 rounded-md">
      {userImage ? <AvatarImage src={userImage} alt="" /> : null}
      <AvatarFallback className="rounded-md text-xs font-medium">
        {userName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
  const copy = (
    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
      <Linkified text={body} />
    </p>
  );

  const domain = boardUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const initial = name.charAt(0).toUpperCase();
  const logo = (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
      {initial}
    </span>
  );
  const person = (label: string, tone: string) => (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white",
        tone,
      )}
    >
      {label}
    </span>
  );
  const paragraphs = (value: string) =>
    value
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph, index) => (
        <p
          key={index}
          className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90"
        >
          <Linkified text={paragraph} />
        </p>
      ));

  const preview = {
    community: (
      <Surface label="# product-feedback" meta="128 members">
        <div className="flex h-full flex-col">
          <div className="flex flex-1 gap-3 px-4 py-4">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-bold">{userName}</span>
                <span className="ml-2 text-[11px] text-accent">9:41 AM</span>
              </p>
              <div className="mt-0.5">{copy}</div>
              <div className="mt-2 flex gap-2 border-l-4 border-primary/60 pl-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{name} Feedback</p>
                  <p className="text-xs text-accent">
                    Share ideas and vote on what we build next.
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5">
                  👍 <span className="tabular-nums">12</span>
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 dark:border-white/10">
                  🙌 <span className="tabular-nums">5</span>
                </span>
                <span className="ml-1 font-medium text-primary">4 replies</span>
              </div>
            </div>
          </div>
          <div className="mx-4 mb-4 rounded-lg border border-border/60 px-3 py-2 text-xs text-accent dark:border-white/10">
            Message #product-feedback
          </div>
        </div>
      </Surface>
    ),
    email: (
      <Surface label="Inbox">
        <div className="px-5 py-5">
          <p className="text-lg font-normal tracking-tight">
            {subject ?? `Help shape ${name}`}
          </p>
          <div className="mt-4 flex items-start gap-3">
            {avatar}
            <div className="min-w-0 flex-1 text-xs">
              <p>
                <span className="text-sm font-semibold">{userName}</span>
                <span className="ml-1.5 text-accent">via {name}</span>
              </p>
              <p className="text-accent">to me</p>
            </div>
            <span className="shrink-0 text-[11px] text-accent">9:41 AM</span>
          </div>
          <div className="mt-4 space-y-3 sm:pl-11">{paragraphs(body)}</div>
          <div className="mt-5 flex gap-2 sm:pl-11">
            {["Reply", "Forward"].map((action) => (
              <span
                key={action}
                className="rounded-full border border-border/70 px-4 py-1.5 text-xs font-medium dark:border-white/15"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </Surface>
    ),
    support: (
      <Surface
        label="Feature request: CSV export"
        meta={
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
            Open · #1042
          </span>
        }
      >
        <div className="space-y-4 px-4 py-4">
          <div className="flex gap-3">
            {person("S", "bg-emerald-600")}
            <div className="min-w-0 flex-1">
              <p className="text-xs">
                <span className="font-semibold">Sam Lee</span>
                <span className="ml-1.5 text-accent">via email · 2h ago</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/90">
                It would be great if {name} could export reports to CSV.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/60 dark:border-white/10">
            <div className="flex gap-4 border-b border-border/50 px-3 text-xs dark:border-white/8">
              <span className="border-b-2 border-primary py-2 font-medium">
                Public reply
              </span>
              <span className="py-2 text-accent">Internal note</span>
            </div>
            <div className="px-3 py-3">{copy}</div>
            <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-[11px] text-accent dark:border-white/8">
              <span>{userName}</span>
              <span className="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground">
                Submit as Solved
              </span>
            </div>
          </div>
        </div>
      </Surface>
    ),
    developer: (
      <Surface label={`${handle}/app · Issues`}>
        <div className="px-5 py-5">
          <p className="text-lg leading-snug">
            <span className="font-semibold">{firstLine}</span>{" "}
            <span className="text-accent">#128</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-accent">
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 font-medium text-white">
              ◉ Open
            </span>
            <span>
              <span className="font-semibold text-foreground">{userName}</span>{" "}
              opened this issue now
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-border/60 dark:border-white/10">
            <p className="border-b border-border/50 bg-muted/40 px-3 py-2 text-xs dark:border-white/8 dark:bg-white/[0.03]">
              <span className="font-semibold">{userName}</span>
              <span className="text-accent"> commented</span>
            </p>
            <div className="space-y-3 px-3 py-3">
              {paragraphs(restLines.join("\n").trim())}
            </div>
          </div>
          <div className="mt-3 flex gap-1.5 text-[11px] font-medium">
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-600 dark:text-sky-400">
              enhancement
            </span>
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-600 dark:text-violet-400">
              feedback
            </span>
          </div>
        </div>
      </Surface>
    ),
    shipped: (
      <Surface label="Inbox" meta="Newsletter">
        <div className="mx-auto max-w-md px-6 py-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {logo}
            {name}
          </div>
          <p className="mt-5 text-xl font-semibold tracking-tight">
            {subject ?? "You asked, we built it"}
          </p>
          <div className="mt-3 space-y-3">{paragraphs(body)}</div>
          <span className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
            See what’s next →
          </span>
          <p className="mt-6 border-t border-border/50 pt-3 text-[11px] text-accent dark:border-white/8">
            You’re receiving this because you use {name}. Unsubscribe
          </p>
        </div>
      </Surface>
    ),
    banner: (
      <Surface label={`app.${domain.split(".").slice(-2).join(".")}`}>
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 dark:border-white/8">
          {logo}
          <span className="text-xs font-semibold">{name}</span>
          <span aria-hidden className="ml-auto flex gap-3">
            {["w-10", "w-12", "w-8"].map((width) => (
              <span
                key={width}
                className={cn(
                  "h-2 rounded-full bg-muted-foreground/15",
                  width,
                )}
              />
            ))}
          </span>
        </div>
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
            <span aria-hidden className="mt-0.5 text-sm">
              💡
            </span>
            <div className="min-w-0 flex-1">{copy}</div>
            <span aria-hidden className="text-xs text-accent">
              ✕
            </span>
          </div>
          <div aria-hidden className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-border/50 p-3 dark:border-white/8"
              >
                <div className="h-2 w-1/2 rounded-full bg-muted-foreground/15" />
                <div className="h-4 w-3/4 rounded-full bg-muted-foreground/10" />
              </div>
            ))}
          </div>
          <div aria-hidden className="space-y-2.5">
            {["w-full", "w-11/12", "w-3/4"].map((width) => (
              <div
                key={width}
                className={cn(
                  "h-2.5 rounded-full bg-muted-foreground/10",
                  width,
                )}
              />
            ))}
          </div>
        </div>
      </Surface>
    ),
    chat: (
      <div className="mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-black/10 bg-card shadow-[0_2px_4px_rgba(0,0,0,0.06),0_24px_48px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#151515]">
        <div className="flex items-center gap-3 bg-foreground px-4 py-3 text-background">
          {avatar}
          <div className="min-w-0">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-[11px] opacity-70">
              {userName} · Typically replies in minutes
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
            Any chance you could add dark mode?
          </p>
          <div className="flex items-end gap-2">
            {avatar}
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted/60 px-3 py-2 dark:bg-white/6">
              {copy}
            </div>
          </div>
          <p className="pl-10 text-[11px] text-accent">{userName} · Just now</p>
        </div>
        <div className="border-t border-border/50 px-4 py-3 text-xs text-accent dark:border-white/8">
          Write a reply…
        </div>
      </div>
    ),
    social: (
      <Surface label="Post">
        <div className="flex gap-3 px-4 py-4">
          {person(initial, "bg-primary")}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              <span className="font-bold">{name}</span>
              <span className="ml-1.5 text-accent">@{handle} · 2m</span>
            </p>
            <div className="mt-1 space-y-3">{paragraphs(body)}</div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 dark:border-white/10">
              <div className="relative h-24 bg-primary">
                <div aria-hidden className="absolute inset-0">
                  <DitherClouds primary fit="cover" />
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs text-accent">{domain}</p>
                <p className="text-sm">{name} Feedback</p>
              </div>
            </div>
            <div className="mt-3 flex max-w-xs justify-between text-xs text-accent tabular-nums">
              <span>💬 24</span>
              <span>🔁 12</span>
              <span>♡ 148</span>
              <span>📊 8.4K</span>
            </div>
          </div>
        </div>
      </Surface>
    ),
  }[current.id];

  return (
    <ShareSection
      title="Messages"
      description="A first draft for every place you talk to users."
    >
      <div
        className={cn(
          shareCardClass,
          "grid sm:grid-cols-[200px_minmax(0,1fr)]",
        )}
      >
        <div
          role="tablist"
          aria-label="Message templates"
          aria-orientation="vertical"
          className="flex gap-1 overflow-x-auto border-b border-border/50 p-2 sm:flex-col sm:border-b-0 sm:border-r"
        >
          {templates.map((template, index) => {
            const active = template.id === current.id;
            return (
              <button
                key={template.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="share-message-panel"
                onClick={() => {
                  setSelected(template.id);
                  setEditing(false);
                }}
                className={cn(
                  "flex shrink-0 items-baseline gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-muted/60 dark:bg-white/6" : "hover:bg-muted/30",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      active ? "font-medium text-foreground" : "text-accent",
                    )}
                  >
                    {template.label}
                  </span>
                  <span className="hidden text-[11px] text-muted-foreground sm:block">
                    {hints[template.id]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div id="share-message-panel" role="tabpanel" className="min-w-0">
          <div className="relative isolate flex h-[30rem] overflow-hidden bg-primary p-5 sm:px-10 sm:py-8">
            <div aria-hidden className="absolute inset-0 -z-10">
              <DitherClouds primary fit="cover" />
            </div>
            {editing ? (
              <Surface label={`Editing · ${current.label}`}>
                <label htmlFor="share-message" className="sr-only">
                  {current.label} message
                </label>
                <textarea
                  id="share-message"
                  autoFocus
                  value={text}
                  onChange={(event) =>
                    setDrafts((previous) => ({
                      ...previous,
                      [current.id]: event.target.value,
                    }))
                  }
                  className="block h-full w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 outline-none"
                  spellCheck
                />
              </Surface>
            ) : (
              preview
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5">
            <span className="mr-auto text-[11px] text-muted-foreground tabular-nums">
              {text.length} characters{edited ? " · edited" : ""}
            </span>
            {edited ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDrafts(({ [current.id]: _, ...rest }) => rest)
                }
                className="text-accent"
              >
                Reset
              </Button>
            ) : null}
            <Button
              type="button"
              variant="card"
              size="sm"
              aria-pressed={editing}
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? "Preview" : "Edit"}
            </Button>
            <CopyButton text={text} label="Copy" primary />
          </div>
        </div>
      </div>
    </ShareSection>
  );
}
