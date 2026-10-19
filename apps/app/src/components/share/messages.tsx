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

  const preview = {
    community: (
      <Surface label="# product-feedback" meta="Today">
        <div className="flex gap-3 px-4 py-4">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-semibold">{userName}</span>
              <span className="ml-2 text-[11px] text-accent">9:41 AM</span>
            </p>
            <div className="mt-0.5">{copy}</div>
          </div>
        </div>
      </Surface>
    ),
    email: (
      <Surface label="New message">
        <dl className="divide-y divide-border/50 text-xs dark:divide-white/8">
          {[
            ["From", `${userName} · ${name}`],
            ["To", "Your customers"],
            ["Subject", subject ?? `Help shape ${name}`],
          ].map(([term, value]) => (
            <div key={term} className="flex gap-3 px-4 py-2">
              <dt className="w-14 shrink-0 text-accent">{term}</dt>
              <dd
                className={cn(
                  "min-w-0 truncate",
                  term === "Subject" && "font-medium",
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-border/50 px-4 py-4 dark:border-white/8">
          {copy}
        </div>
      </Surface>
    ),
    support: (
      <Surface label="Re: Feature request" meta="Ticket #1042">
        <div className="space-y-3 px-4 py-4">
          <p className="w-fit max-w-[85%] rounded-lg bg-muted/60 px-3 py-2 text-sm text-accent dark:bg-white/5">
            It would be great if {name} could…
          </p>
          <div className="ml-auto max-w-[92%] rounded-lg border border-border/50 px-3 py-2 dark:border-white/8">
            {copy}
            <p className="mt-2 text-[11px] text-accent">{userName}</p>
          </div>
        </div>
      </Surface>
    ),
    developer: (
      <Surface label="Issue" meta="Open">
        <div className="px-4 py-4">
          <p className="text-sm font-semibold">{firstLine}</p>
          <p className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-foreground/80">
            <Linkified text={restLines.join("\n").trim()} />
          </p>
        </div>
      </Surface>
    ),
    shipped: (
      <Surface label="Product update" meta="Newsletter">
        <div className="px-6 py-6">
          <p className="text-[11px] font-medium tracking-[0.08em] text-accent uppercase">
            {name}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            {subject ?? "You asked, we built it"}
          </p>
          <div className="mt-4">{copy}</div>
        </div>
      </Surface>
    ),
    banner: (
      <Surface label={name} meta="Your app">
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
            <span
              aria-hidden
              className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
            />
            <div className="min-w-0 flex-1">{copy}</div>
            <span aria-hidden className="text-xs text-accent">
              ✕
            </span>
          </div>
          <div aria-hidden className="space-y-2.5">
            {["w-2/5", "w-full", "w-11/12", "w-3/4", "w-full", "w-2/3"].map(
              (width, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2.5 rounded-full bg-muted-foreground/10",
                    index === 0 && "h-3.5",
                    width,
                  )}
                />
              ),
            )}
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
          <div className="relative isolate flex h-[26rem] overflow-hidden bg-primary p-5 sm:px-10 sm:py-8">
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
