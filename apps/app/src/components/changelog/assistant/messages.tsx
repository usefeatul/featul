"use client";

import type { RefObject } from "react";
import { Check } from "lucide-react";
import { cn } from "@featul/ui/lib/utils";
import { Content } from "./content";
import { withoutEmDash } from "./config";
import {
  Progress,
  type AssistantActivity,
  type AssistantPhase,
} from "./progress";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "pending" | "streaming" | "error";
  phase?: AssistantPhase;
  activity?: AssistantActivity;
  startedAt?: number;
  durationMs?: number;
  suggestedTags?: string[];
  effect?: string;
};

export function Messages({
  messages,
  bottomRef,
  onRetry,
}: {
  messages: AssistantMessage[];
  bottomRef: RefObject<HTMLDivElement | null>;
  onRetry: (content: string) => void;
}) {
  return (
    <div className="space-y-5 px-4 py-5">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", message.role === "user" && "justify-end")}
        >
          <div
            className={cn(
              "min-w-0 text-sm leading-relaxed",
              message.role === "user"
                ? "max-w-[88%] rounded-xl bg-black/5 px-3 py-2.5 dark:bg-white/[0.06]"
                : "flex-1 pt-0.5",
              message.status === "error" && "text-destructive",
            )}
          >
            {message.status === "pending" ? (
              <Progress
                phase={message.phase ?? "reading"}
                activity={message.activity ?? "ask"}
                startedAt={message.startedAt}
              />
            ) : message.role === "assistant" ? (
              <>
                {message.status === "streaming" ? (
                  <div className="mb-2.5">
                    <Progress
                      phase={message.phase ?? "writing"}
                      activity={message.activity ?? "ask"}
                      startedAt={message.startedAt}
                      compact
                    />
                  </div>
                ) : null}
                {!message.status && message.activity && message.durationMs ? (
                  <div className="mb-4">
                    <Progress
                      phase={
                        message.activity === "ask" ? "writing" : "applying"
                      }
                      activity={message.activity}
                      durationMs={message.durationMs}
                      complete
                    />
                  </div>
                ) : null}
                <Content>{withoutEmDash(message.content)}</Content>
              </>
            ) : (
              <span className="whitespace-pre-wrap">{message.content}</span>
            )}

            {message.attachedTitles?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.attachedTitles.map((title) => (
                  <span
                    key={title}
                    className="inline-flex max-w-full truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  >
                    @{title}
                  </span>
                ))}
              </div>
            ) : null}

            {message.suggestedTags?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {message.suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-black/5 px-2 py-1 text-[11px] font-medium text-muted-foreground dark:bg-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {message.effect ? (
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" />
                {message.effect}
              </div>
            ) : null}

            {message.status === "error" ? (
              <button
                type="button"
                className="mt-2 block text-xs font-medium underline underline-offset-2"
                onClick={() => onRetry(message.content)}
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
