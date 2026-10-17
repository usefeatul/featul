"use client";

import { useState } from "react";
import { cn } from "@featul/ui/lib/utils";
import { buildShareMessages } from "@/lib/share";
import {
  Code2,
  Mail,
  MessageSquareText,
  ChevronRight,
} from "@/components/global/icons";
import { shareCardClass, shareFooterClass } from "./styles";
import CopyButton from "./copy";

const icons = [MessageSquareText, Mail, MessageSquareText, Code2];

export default function Messages({
  name,
  boardUrl,
}: {
  name: string;
  boardUrl: string;
}) {
  const templates = buildShareMessages(name, boardUrl);
  const [selected, setSelected] = useState("community");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const current =
    templates.find((template) => template.id === selected) ?? templates[0]!;
  const text = drafts[current.id] ?? current.text;

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-sm font-medium">Find the words to get started</h3>
        <p className="mt-1 text-xs text-accent">
          Choose a message, make it your own, and share it with your users.
        </p>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
        <div
          className="grid grid-cols-2 gap-1 md:grid-cols-1"
          role="group"
          aria-label="Message templates"
        >
          {templates.map((template, index) => {
            const Icon = icons[index]!;
            return (
              <button
                key={template.id}
                type="button"
                aria-pressed={selected === template.id}
                onClick={() => setSelected(template.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-3 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected === template.id
                    ? "bg-muted/60 font-medium text-foreground"
                    : "text-accent hover:bg-muted/30 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{template.label}</span>
                {selected === template.id ? (
                  <ChevronRight className="hidden size-3.5 md:block" />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className={shareCardClass}>
          <div className="border-b border-border/35 px-5 py-4">
            <label htmlFor="share-message" className="text-sm font-medium">
              {current.label}
            </label>
            <p
              id="share-message-description"
              className="mt-1 text-xs leading-5 text-accent"
            >
              {current.description}
            </p>
          </div>
          <div className="min-w-0">
            <textarea
              id="share-message"
              aria-describedby="share-message-description"
              value={text}
              onChange={(event) =>
                setDrafts((previous) => ({
                  ...previous,
                  [current.id]: event.target.value,
                }))
              }
              className="min-h-64 w-full resize-y bg-transparent px-5 py-4 text-sm leading-7 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              spellCheck
            />
          </div>
          <div className={shareFooterClass}>
            <span className="text-xs text-accent">
              Edit the text before you copy.
            </span>
            <CopyButton text={text} label="Copy message" primary />
          </div>
        </div>
      </div>
    </section>
  );
}
