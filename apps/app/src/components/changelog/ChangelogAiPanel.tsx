"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import {
  overlayDialogClass,
  overlayDialogInnerClass,
} from "@featul/ui/lib/overlay";
import type { FeedEditorRef } from "@/components/editor/editor";
import { useAiSourcePosts } from "@/features/changelog/hooks/useAiSourcePosts";
import { runChangelogAiStream } from "@/features/changelog/hooks/useChangelogAiStream";
import type { AiChatMessage, AiChatStarter } from "@/features/changelog/types";
import StatusIcon from "@/components/requests/StatusIcon";
import type { AiSourcePost } from "./AiSourcePostItem";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedCount?: number;
  status?: "pending" | "error";
};

type PendingPrompt = {
  text: string;
  attachFeedback?: boolean;
};

type AtQuery = {
  start: number;
  query: string;
};

interface ChangelogAiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  title: string;
  setTitle: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
  onGeneratingChange?: (generating: boolean) => void;
  pendingPrompt?: PendingPrompt | null;
  onPendingPromptHandled?: () => void;
}

const STARTERS: AiChatStarter[] = [
  {
    label: "Draft from feedback",
    prompt: "Write a changelog from the attached shipped feedback.",
    attachFeedback: true,
  },
  {
    label: "Improve the writing",
    prompt: "Improve the writing: clearer, tighter, and more user-friendly.",
  },
  {
    label: "Make it technical",
    prompt: "Rewrite this for a more technical audience. Keep it concrete.",
  },
  {
    label: "Add more detail",
    prompt: "Expand this changelog with more useful detail and user benefits.",
  },
];

function nextId() {
  return crypto.randomUUID();
}

function getAtQuery(value: string, caret: number): AtQuery | null {
  const before = value.slice(0, caret);
  const match = before.match(/(^|[\s])@([^\n@]*)$/);
  if (!match) return null;

  const query = match[2] ?? "";
  if (query.includes("  ")) return null;

  return {
    start: before.length - query.length - 1,
    query,
  };
}

function assistantCopy(input: {
  hadContent: boolean;
  title?: string;
  sourceCount: number;
}) {
  if (!input.hadContent && input.sourceCount > 0) {
    const countLabel = `${input.sourceCount} shipped item${input.sourceCount === 1 ? "" : "s"}`;
    return input.title
      ? `Drafted “${input.title}” from ${countLabel}. What should we change?`
      : `Drafted the changelog from ${countLabel}. What should we change?`;
  }

  if (!input.hadContent) {
    return input.title
      ? `Wrote a draft titled “${input.title}”. Keep chatting to refine it.`
      : "Wrote a draft into the entry. Keep chatting to refine it.";
  }

  return "Updated the entry. Ask if you want another pass.";
}

export function ChangelogAiPanel({
  open,
  onOpenChange,
  workspaceSlug,
  title,
  setTitle,
  editorRef,
  setIsDirty,
  onGeneratingChange,
  pendingPrompt,
  onPendingPromptHandled,
}: ChangelogAiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [mention, setMention] = useState<AtQuery | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionRef = useRef<AtQuery | null>(null);
  const { sourcePosts, isLoadingPosts } = useAiSourcePosts(workspaceSlug, open);

  mentionRef.current = mention;

  const filteredPosts = useMemo(() => {
    if (!mention) return sourcePosts;
    const query = mention.query.trim().toLowerCase();
    if (!query) return sourcePosts;
    return sourcePosts.filter((post) =>
      post.title.toLowerCase().includes(query),
    );
  }, [mention, sourcePosts]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mention?.query, filteredPosts.length]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (mentionRef.current) {
        setMention(null);
        return;
      }
      onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  const updateMention = (value: string, caret: number) => {
    setMention(getAtQuery(value, caret));
  };

  const insertPostMention = (post: AiSourcePost) => {
    const field = inputRef.current;
    const caret = field?.selectionStart ?? prompt.length;
    const active = mention ?? getAtQuery(prompt, caret);
    if (!active) return;

    const nextValue = `${prompt.slice(0, active.start)}${prompt.slice(caret).replace(/^\s*/, " ")}`;
    setPrompt(nextValue.trimStart());
    setSelectedPostIds((current) =>
      current.includes(post.id) ? current : [...current, post.id],
    );
    setMention(null);

    window.requestAnimationFrame(() => {
      const nextCaret = Math.min(active.start, nextValue.length);
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const sendMessage = async (
    rawText: string,
    postIds = selectedPostIds,
  ) => {
    const text = rawText.trim();
    if (!text || isLoading) return;

    if (mention) setMention(null);

    if (
      /attached shipped feedback/i.test(text) &&
      postIds.length === 0 &&
      sourcePosts.length > 0
    ) {
      setPrompt(text.endsWith("@") ? text : `${text} @`);
      setMention({
        start: text.endsWith("@") ? text.length - 1 : text.length + 1,
        query: "",
      });
      toast.info("Type @ and pick a post, then send.");
      return;
    }

    const contentMarkdown = editorRef.current?.getMarkdown();
    const hadContent = Boolean(contentMarkdown?.trim());
    const history: AiChatMessage[] = messages
      .filter((message) => !message.status)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
      attachedCount: postIds.length || undefined,
    };
    const assistantId = nextId();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "Writing into the entry…",
        status: "pending",
      },
    ]);
    setPrompt("");
    setIsLoading(true);
    onGeneratingChange?.(true);

    try {
      let appliedTitle: string | undefined;

      await runChangelogAiStream(
        {
          slug: workspaceSlug,
          action: "chat",
          prompt: text,
          title: title.trim() || undefined,
          contentMarkdown: contentMarkdown?.trim() || undefined,
          sourcePostIds: postIds.length > 0 ? postIds : undefined,
          messages: history.length > 0 ? history : undefined,
        },
        {
          editorRef,
          usesStructuredSections: !hadContent,
          onTitle: (value) => {
            appliedTitle = value;
            setTitle(value);
          },
          onComplete: (result) => {
            if (result.title) {
              appliedTitle = result.title;
              setTitle(result.title);
            }
            if (result.contentMarkdown) {
              editorRef.current?.setContentFromMarkdown(result.contentMarkdown);
            }
            setIsDirty(true);
          },
        },
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                status: undefined,
                content: assistantCopy({
                  hadContent,
                  title: appliedTitle,
                  sourceCount: postIds.length,
                }),
              }
            : message,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to run AI assist";
      toast.error(msg);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, status: "error", content: msg }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
      onGeneratingChange?.(false);
    }
  };

  useEffect(() => {
    if (!open || !pendingPrompt) return;
    onPendingPromptHandled?.();

    if (pendingPrompt.attachFeedback) {
      const next = pendingPrompt.text.endsWith("@")
        ? pendingPrompt.text
        : `${pendingPrompt.text} @`;
      setPrompt(next);
      setMention({ start: next.lastIndexOf("@"), query: "" });
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(next.length, next.length);
      });
      return;
    }

    void sendMessage(pendingPrompt.text);
  }, [open, pendingPrompt, onPendingPromptHandled]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mention) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setMentionIndex((index) =>
          filteredPosts.length === 0 ? 0 : (index + 1) % filteredPosts.length,
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMentionIndex((index) =>
          filteredPosts.length === 0
            ? 0
            : (index - 1 + filteredPosts.length) % filteredPosts.length,
        );
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const post = filteredPosts[mentionIndex];
        if (post) insertPostMention(post);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const post = filteredPosts[mentionIndex];
        if (post) insertPostMention(post);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(prompt);
    }
  };

  const selectedPosts = sourcePosts.filter((post) =>
    selectedPostIds.includes(post.id),
  );

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-3 lg:bottom-5 lg:left-60">
      <div className="pointer-events-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        {messages.length === 0 ? (
          <div className="mb-2 flex flex-wrap justify-center gap-1.5">
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  if (starter.attachFeedback) {
                    setPrompt(`${starter.prompt} @`);
                    setMention({
                      start: `${starter.prompt} @`.lastIndexOf("@"),
                      query: "",
                    });
                    inputRef.current?.focus();
                    return;
                  }
                  void sendMessage(starter.prompt);
                }}
                className="cursor-pointer rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black"
              >
                {starter.label}
              </button>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              overlayDialogClass,
              "mb-2 max-h-44 overflow-hidden shadow-lg",
            )}
          >
            <div
              className={cn(
                overlayDialogInnerClass,
                "max-h-40 space-y-2 overflow-y-auto p-3",
              )}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                      message.role === "user"
                        ? "rounded-br-md bg-foreground text-background"
                        : "rounded-bl-md bg-muted/50 text-foreground",
                      message.status === "error" && "text-destructive",
                    )}
                  >
                    {message.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <LoaderIcon className="size-3 animate-spin" />
                        {message.content}
                      </span>
                    ) : (
                      message.content
                    )}
                    {message.attachedCount ? (
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          message.role === "user"
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {message.attachedCount} attached
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        <div className={cn(overlayDialogClass, "shadow-lg")}>
          <div className={cn(overlayDialogInnerClass, "overflow-hidden p-0")}>
            {mention ? (
              <div className="border-b border-border/70">
                <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Posts
                </p>
                {isLoadingPosts ? (
                  <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
                    <LoaderIcon className="size-3.5 animate-spin" />
                    Loading posts…
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <p className="px-3 py-6 text-xs text-muted-foreground">
                    No posts match “{mention.query}”.
                  </p>
                ) : (
                  <PopoverList className="flex w-full max-h-56 flex-col overflow-y-auto">
                    {filteredPosts.map((post, index) => (
                      <PopoverListItem
                        key={post.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertPostMention(post)}
                        onMouseEnter={() => setMentionIndex(index)}
                        className={cn(
                          "w-full gap-2 whitespace-normal text-sm",
                          index === mentionIndex && "bg-muted/40",
                        )}
                      >
                        <StatusIcon
                          status={post.roadmapStatus || undefined}
                          className="size-4 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {post.title}
                        </span>
                      </PopoverListItem>
                    ))}
                  </PopoverList>
                )}
              </div>
            ) : null}

            {selectedPosts.length > 0 ? (
              <div className="flex flex-wrap gap-1 border-b border-border/70 px-2 py-1.5">
                {selectedPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() =>
                      setSelectedPostIds((current) =>
                        current.filter((id) => id !== post.id),
                      )
                    }
                    className="inline-flex max-w-[12rem] cursor-pointer items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground hover:bg-muted/40"
                  >
                    <span className="truncate">@{post.title}</span>
                    <XMarkIcon className="size-2.5 shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-end gap-1 p-1.5">
              <TextareaAutosize
                ref={inputRef}
                value={prompt}
                onChange={(event) => {
                  const value = event.target.value;
                  setPrompt(value);
                  updateMention(value, event.target.selectionStart ?? value.length);
                }}
                onClick={(event) => {
                  const field = event.currentTarget;
                  updateMention(field.value, field.selectionStart ?? field.value.length);
                }}
                onKeyUp={(event) => {
                  const field = event.currentTarget;
                  updateMention(field.value, field.selectionStart ?? field.value.length);
                }}
                onKeyDown={handleInputKeyDown}
                minRows={1}
                maxRows={4}
                placeholder="Ask AI, or type @ to add posts…"
                className="min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <Button
                type="button"
                size="icon-sm"
                aria-label="Send"
                disabled={isLoading || !prompt.trim()}
                onClick={() => void sendMessage(prompt)}
                className="mb-0.5 shrink-0"
              >
                {isLoading ? (
                  <LoaderIcon className="size-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangelogAiPanel;
