"use client";

import { Fragment, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { buildShareMessages } from "@/lib/share";
import {
  Check,
  Code2,
  Headset,
  Mail,
  Undo2,
  UsersRound,
} from "@/components/global/icons";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

const channels: Record<
  string,
  { icon: typeof Mail; hint: string; tone: string; ring: string }
> = {
  community: {
    icon: UsersRound,
    hint: "Slack · Discord",
    tone: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    ring: "ring-violet-500/40",
  },
  email: {
    icon: Mail,
    hint: "Customer inbox",
    tone: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500/40",
  },
  support: {
    icon: Headset,
    hint: "Ticket reply",
    tone: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/40",
  },
  developer: {
    icon: Code2,
    hint: "Engineering",
    tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/40",
  },
};

function Linkified({ text }: { text: string }) {
  return text.split(/(https?:\/\/\S+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <span
        key={index}
        className="rounded bg-primary/10 px-1 py-0.5 text-primary"
      >
        {part.replace(/^https?:\/\//, "")}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
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
  const channel = channels[current.id] ?? channels.community!;
  const text = drafts[current.id] ?? current.text;
  const edited = text !== current.text;

  const subjectMatch = text.match(/^Subject:\s*(.*)\n+/);
  const subject = subjectMatch?.[1];
  const body = subjectMatch ? text.slice(subjectMatch[0].length) : text;

  return (
    <ShareSection
      title="Messages"
      description="Pick where you're posting. We'll write the first draft."
    >
      <div
        role="tablist"
        aria-label="Message templates"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {templates.map((template) => {
          const meta = channels[template.id] ?? channels.community!;
          const Icon = meta.icon;
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
                shareCardClass,
                "flex items-center gap-3 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? cn("ring-2", meta.ring)
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  meta.tone,
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {template.label}
                </span>
                <span className="block truncate text-[11px] text-accent">
                  {meta.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="share-message-panel"
        role="tabpanel"
        className={cn(shareCardClass, "bg-muted/20 dark:bg-black/20")}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5">
          <span className="truncate text-xs text-accent">
            {current.description}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {edited ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDrafts(({ [current.id]: _, ...rest }) => rest)
                }
                className="gap-1.5 text-accent"
              >
                <Undo2 className="size-3.5" />
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
              {editing ? (
                <>
                  <Check className="size-3.5" /> Done
                </>
              ) : (
                "Edit"
              )}
            </Button>
            <CopyButton text={text} label="Copy" primary />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {editing ? (
            <>
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
                rows={Math.min(text.split("\n").length + 2, 16)}
                className="block w-full resize-y rounded-xl border border-border/50 bg-card px-4 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-white/8 dark:bg-black/30"
                spellCheck
              />
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-xl border border-border/50 bg-card shadow-sm dark:border-white/8 dark:bg-black/40">
              {subject ? (
                <div className="space-y-1 border-b border-border/50 px-5 py-3 text-xs">
                  <p>
                    <span className="inline-block w-14 text-accent">To</span>
                    Your customers
                  </p>
                  <p>
                    <span className="inline-block w-14 text-accent">
                      Subject
                    </span>
                    <span className="font-medium">{subject}</span>
                  </p>
                </div>
              ) : null}
              <div className="flex gap-3 px-5 py-4">
                <Avatar className="size-8">
                  {userImage ? <AvatarImage src={userImage} alt="" /> : null}
                  <AvatarFallback className="text-xs font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2 text-sm">
                    <span className="font-medium">{userName}</span>
                    <span className="text-[11px] text-accent">just now</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                    <Linkified text={body} />
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShareSection>
  );
}
