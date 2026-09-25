"use client";

import { History, MessageSquareText, Trash2 } from "@/components/global/icons";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { cn } from "@featul/ui/lib/utils";
import { relativeTime } from "@/lib/time";
import type { ChangelogAiConversationSummary } from "@/features/changelog/history";

function formatUpdatedAt(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return relativeTime(date.toISOString());
}

export function ConversationHistory({
  conversations,
  activeId,
  loading,
  onSelect,
  onDelete,
}: {
  conversations: ChangelogAiConversationSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
}) {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label="Conversation history"
      aria-busy={loading}
    >
      <div className="shrink-0 px-3 pb-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground/70 dark:bg-[#242424]">
            <MessageSquareText className="size-3.5" />
          </span>
          <span>Synced to your account</span>
          {loading ? (
            <LoaderIcon
              className="ml-auto size-3.5"
              aria-label="Loading conversations"
            />
          ) : (
            <span className="ml-auto text-[10px] text-muted-foreground/70">
              Saved automatically
            </span>
          )}
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        {!loading && conversations.length === 0 ? (
          <div className="flex h-full min-h-52 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <History className="size-[18px]" />
            </span>
            <h3 className="text-sm font-medium">No conversations yet</h3>
            <p className="mt-1 max-w-52 text-xs leading-relaxed text-muted-foreground">
              Your previous AI conversations will appear here.
            </p>
          </div>
        ) : null}

        <ul className="m-0 min-w-0 list-none divide-y divide-border/50 pb-2 dark:divide-white/[0.07]">
          {conversations.map((conversation) => {
            const active = conversation.id === activeId;
            const updatedAt = formatUpdatedAt(conversation.updatedAt);
            return (
              <li
                key={conversation.id}
                className={cn(
                  "transition-colors",
                  active
                    ? "bg-muted/65 dark:bg-white/[0.055]"
                    : "hover:bg-muted/35 dark:hover:bg-white/[0.03]",
                )}
              >
                <div className="group/history relative overflow-hidden px-5 py-3">
                  <button
                    type="button"
                    className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={active ? "page" : undefined}
                    aria-label={conversation.title}
                  />

                  <div className="pointer-events-none relative min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-2 min-w-0 flex-1 text-[13px] font-semibold leading-[18px] text-foreground/90">
                        {conversation.title}
                      </p>
                      <span className="shrink-0 pl-1 text-[10px] font-medium leading-[18px] tabular-nums">
                        <time className="text-muted-foreground/70">
                          {updatedAt}
                        </time>
                      </span>
                    </div>

                    <div className="mt-1 flex min-h-6 items-center gap-2 pr-8 text-[10px] text-muted-foreground">
                      <span className="inline-flex h-5 items-center rounded-md bg-muted px-2 font-medium dark:bg-[#242424]">
                        {conversation.messageCount}{" "}
                        {conversation.messageCount === 1 ? "message" : "messages"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="absolute bottom-2 right-3 z-10 flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-100 transition hover:bg-black/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:opacity-0 sm:group-hover/history:opacity-100 sm:focus-visible:opacity-100 dark:hover:bg-white/5"
                    onClick={() => onDelete(conversation.id)}
                    aria-label={`Delete ${conversation.title}`}
                    title="Delete conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
