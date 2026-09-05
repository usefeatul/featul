"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { ArrowUp, Square, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { GitHubIcon } from "@featul/ui/icons/github";
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
import type { WorkspaceTag } from "./TagSelector";
import {
  detectChatIntent,
  extractGithubUrls,
  isWithinPastWeek,
} from "./ai/intent";
import {
  loadChangelogAiChat,
  saveChangelogAiChat,
} from "./ai/persist";
import { getPublishCheckIssues } from "./ai/publishCheck";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "pending" | "error";
};

type PendingPrompt = {
  text: string;
  attachFeedback?: boolean;
  attachThisWeek?: boolean;
  publishCheck?: boolean;
};

type AtQuery = {
  start: number;
  query: string;
};

type EditorSnapshot = {
  markdown: string;
  title: string;
  tags: string[];
};

interface ChangelogAiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  entryId?: string;
  title: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  selectedTags: string[];
  setSelectedTags: (value: string[]) => void;
  availableTags: WorkspaceTag[];
  coverImage?: string | null;
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
    primary: true,
  },
  {
    label: "Draft this week",
    prompt: "Draft this week's changelog from the attached completed posts.",
    attachThisWeek: true,
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
  {
    label: "Publish check",
    prompt: "Review this changelog for publish readiness. What should we fix?",
    publishCheck: true,
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
  intent: "ask" | "rewrite" | "patch";
  hadContent: boolean;
  title?: string;
  sourceCount: number;
  reply?: string;
}) {
  if (input.intent === "ask") {
    return input.reply || "Here's what I noticed.";
  }
  if (input.intent === "patch") {
    return "Updated the selected text. Ask if you want another pass.";
  }
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
  entryId,
  title,
  setTitle,
  setSummary,
  selectedTags,
  setSelectedTags,
  availableTags,
  coverImage,
  editorRef,
  setIsDirty,
  onGeneratingChange,
  pendingPrompt,
  onPendingPromptHandled,
}: ChangelogAiPanelProps) {
  const restored = useRef(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [mention, setMention] = useState<AtQuery | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [undoSnapshot, setUndoSnapshot] = useState<EditorSnapshot | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionRef = useRef<AtQuery | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const undoSnapshotRef = useRef<EditorSnapshot | null>(null);
  const { sourcePosts, isLoadingPosts } = useAiSourcePosts(workspaceSlug, open);

  mentionRef.current = mention;

  useEffect(() => {
    if (!open || restored.current) return;
    restored.current = true;
    const stored = loadChangelogAiChat(workspaceSlug, entryId);
    if (!stored) return;
    setMessages(stored.messages);
    setSelectedPostIds(stored.selectedPostIds);
  }, [open, workspaceSlug, entryId]);

  useEffect(() => {
    if (!open) return;
    saveChangelogAiChat(workspaceSlug, entryId, {
      messages,
      selectedPostIds,
    });
  }, [open, workspaceSlug, entryId, messages, selectedPostIds]);

  const completedThisWeek = useMemo(
    () =>
      sourcePosts.filter(
        (post) =>
          (post.roadmapStatus || "").toLowerCase() === "completed" &&
          isWithinPastWeek(post.updatedAt || post.publishedAt),
      ),
    [sourcePosts],
  );

  const filteredPosts = useMemo(() => {
    if (!mention) return sourcePosts;
    const query = mention.query.trim().toLowerCase();
    if (!query) return sourcePosts;
    return sourcePosts.filter((post) => {
      const haystack = `${post.title} ${post.githubUrl ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [mention, sourcePosts]);

  const completedPosts = filteredPosts.filter(
    (post) => (post.roadmapStatus || "").toLowerCase() === "completed",
  );
  const progressPosts = filteredPosts.filter(
    (post) => (post.roadmapStatus || "").toLowerCase() !== "completed",
  );

  const mentionItems = useMemo(() => {
    const items: Array<{ kind: "week" } | { kind: "post"; post: AiSourcePost }> =
      [];
    if (mention && !mention.query.trim() && completedThisWeek.length > 0) {
      items.push({ kind: "week" });
    }
    for (const post of filteredPosts) {
      items.push({ kind: "post", post });
    }
    return items;
  }, [mention, completedThisWeek, filteredPosts]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mention?.query, mentionItems.length]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "z" &&
        !event.shiftKey
      ) {
        const target = event.target as HTMLElement | null;
        const inEditor = Boolean(target?.closest(".ProseMirror"));
        if (!inEditor && undoSnapshot) {
          event.preventDefault();
          restoreSnapshot();
        }
        return;
      }

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
  }, [open, onOpenChange, undoSnapshot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  const updateMention = (value: string, caret: number) => {
    setMention(getAtQuery(value, caret));
  };

  const captureSnapshot = () => {
    const snapshot = {
      markdown: editorRef.current?.getMarkdown() ?? "",
      title,
      tags: selectedTags,
    };
    undoSnapshotRef.current = snapshot;
    setUndoSnapshot(snapshot);
  };

  const restoreSnapshot = () => {
    const snapshot = undoSnapshotRef.current;
    if (!snapshot) return;
    editorRef.current?.setContentFromMarkdown(snapshot.markdown);
    setTitle(snapshot.title);
    setSelectedTags(snapshot.tags);
    undoSnapshotRef.current = null;
    setUndoSnapshot(null);
    setIsDirty(true);
  };

  const applySuggestedTags = (names?: string[]) => {
    if (!names?.length) return;
    const matched = availableTags
      .filter((tag) =>
        names.some((name) => name.toLowerCase() === tag.name.toLowerCase()),
      )
      .map((tag) => tag.id);
    if (matched.length === 0) return;
    setSelectedTags(Array.from(new Set([...selectedTags, ...matched])));
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

  const attachWeekPosts = () => {
    const ids = completedThisWeek.map((post) => post.id);
    setSelectedPostIds((current) => Array.from(new Set([...current, ...ids])));
    setMention(null);
    if (!prompt.trim()) {
      setPrompt("Draft this week's changelog from the attached completed posts.");
    }
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
    const hasSelection = Boolean(editorRef.current?.hasTextSelection());
    const selectionMarkdown = editorRef.current?.getSelectedText() || "";
    const intent = detectChatIntent({
      text,
      hasSelection: hasSelection && Boolean(selectionMarkdown.trim()),
    });
    const history: AiChatMessage[] = messages
      .filter((message) => !message.status)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
    const attachedPosts = sourcePosts.filter((post) => postIds.includes(post.id));
    const githubUrls = Array.from(
      new Set([
        ...extractGithubUrls(text),
        ...attachedPosts
          .map((post) => post.githubUrl)
          .filter((url): url is string => Boolean(url)),
      ]),
    ).filter((url) => {
      try {
        return Boolean(new URL(url));
      } catch {
        return false;
      }
    });

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
      attachedTitles: attachedPosts.map((post) => post.title),
    };
    const assistantId = nextId();
    const pendingLabel =
      intent === "ask"
        ? "Thinking…"
        : intent === "patch"
          ? "Updating the selection…"
          : "Writing into the entry…";

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: pendingLabel,
        status: "pending",
      },
    ]);
    setPrompt("");
    setIsLoading(true);
    onGeneratingChange?.(true);

    if (intent !== "ask") {
      captureSnapshot();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let appliedTitle: string | undefined;
      let replyText: string | undefined;

      await runChangelogAiStream(
        {
          slug: workspaceSlug,
          action: "chat",
          prompt: text,
          title: title.trim() || undefined,
          contentMarkdown: contentMarkdown?.trim() || undefined,
          sourcePostIds: postIds.length > 0 ? postIds : undefined,
          messages: history.length > 0 ? history : undefined,
          intent,
          selectionMarkdown:
            intent === "patch" ? selectionMarkdown : undefined,
          githubUrls: githubUrls.length > 0 ? githubUrls : undefined,
          availableTagNames: availableTags.map((tag) => tag.name),
        },
        {
          editorRef,
          usesStructuredSections: !hadContent && intent === "rewrite",
          applyToEditor: intent === "rewrite",
          patchSelection: intent === "patch",
          signal: controller.signal,
          onTitle: (value) => {
            appliedTitle = value;
            setTitle(value);
          },
          onReplyDelta: (accumulated) => {
            replyText = accumulated;
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: accumulated }
                  : message,
              ),
            );
          },
          onComplete: (result) => {
            if (result.title) {
              appliedTitle = result.title;
              setTitle(result.title);
            }
            if (result.summary) {
              setSummary(result.summary);
            }
            applySuggestedTags(result.suggestedTags);
            if (intent === "ask") {
              replyText = result.reply || replyText;
              return;
            }
            if (intent === "patch" && result.contentMarkdown) {
              editorRef.current?.replaceSelectionWithMarkdown(
                result.contentMarkdown,
              );
            } else if (result.contentMarkdown) {
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
                  intent,
                  hadContent,
                  title: appliedTitle,
                  sourceCount: postIds.length,
                  reply: replyText,
                }),
              }
            : message,
        ),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (intent !== "ask") {
          restoreSnapshot();
        }
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, status: undefined, content: "Stopped." }
              : message,
          ),
        );
      } else {
        const msg = err instanceof Error ? err.message : "Failed to run AI assist";
        toast.error(msg);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, status: "error", content: msg }
              : message,
          ),
        );
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
      onGeneratingChange?.(false);
    }
  };

  const runPublishCheck = (text: string) => {
    const issues = getPublishCheckIssues({
      title,
      contentMarkdown: editorRef.current?.getMarkdown(),
      coverImage,
      attachedPostTitles: sourcePosts
        .filter((post) => selectedPostIds.includes(post.id))
        .map((post) => post.title),
    });
    const local = issues.length
      ? `Publish check:\n${issues.map((issue) => `• ${issue}`).join("\n")}`
      : "Local check looks good. Asking AI for a second pass.";
    setMessages((current) => [
      ...current,
      {
        id: nextId(),
        role: "assistant",
        content: local,
      },
    ]);
    void sendMessage(text);
  };

  useEffect(() => {
    if (!open || !pendingPrompt) return;
    onPendingPromptHandled?.();

    if (pendingPrompt.attachThisWeek) {
      attachWeekPosts();
      setPrompt(pendingPrompt.text);
      return;
    }

    if (pendingPrompt.publishCheck) {
      runPublishCheck(pendingPrompt.text);
      return;
    }

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
          mentionItems.length === 0 ? 0 : (index + 1) % mentionItems.length,
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMentionIndex((index) =>
          mentionItems.length === 0
            ? 0
            : (index - 1 + mentionItems.length) % mentionItems.length,
        );
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const item = mentionItems[mentionIndex];
        if (item?.kind === "week") attachWeekPosts();
        else if (item?.kind === "post") insertPostMention(item.post);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const item = mentionItems[mentionIndex];
        if (item?.kind === "week") attachWeekPosts();
        else if (item?.kind === "post") insertPostMention(item.post);
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
  const showStarters = !prompt.trim();

  const renderPostGroup = (label: string, posts: AiSourcePost[]) => {
    if (posts.length === 0) return null;
    return (
      <>
        <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {posts.map((post) => {
          const index = mentionItems.findIndex(
            (item) => item.kind === "post" && item.post.id === post.id,
          );
          return (
            <PopoverListItem
              key={post.id}
              type="button"
              onMouseDown={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
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
              <span className="min-w-0 flex-1 truncate">{post.title}</span>
              {post.githubUrl ? (
                <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground" />
              ) : null}
            </PopoverListItem>
          );
        })}
      </>
    );
  };

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-3 lg:bottom-5 lg:left-60">
      <div className="pointer-events-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        {showStarters ? (
          <div className="mb-2 flex flex-wrap justify-center gap-1.5">
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  if (starter.attachThisWeek) {
                    attachWeekPosts();
                    setPrompt(starter.prompt);
                    return;
                  }
                  if (starter.publishCheck) {
                    runPublishCheck(starter.prompt);
                    return;
                  }
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
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
                  starter.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-card text-foreground hover:bg-muted/40 dark:bg-black",
                )}
              >
                {starter.label}
              </button>
            ))}
          </div>
        ) : null}

        {messages.length > 0 ? (
          <div
            className={cn(
              overlayDialogClass,
              "mb-2 max-h-[min(28rem,50vh)] overflow-hidden shadow-lg",
            )}
          >
            <div
              className={cn(
                overlayDialogInnerClass,
                "max-h-[min(28rem,50vh)] space-y-2 overflow-y-auto p-3 scrollbar-hide",
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
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    )}
                    {message.attachedTitles?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {message.attachedTitles.map((attachedTitle) => (
                          <span
                            key={attachedTitle}
                            className={cn(
                              "inline-flex max-w-[10rem] truncate rounded-lg px-1.5 py-0.5 text-[10px]",
                              message.role === "user"
                                ? "bg-background/15 text-background"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            @{attachedTitle}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {message.status === "error" ? (
                      <button
                        type="button"
                        className="mt-1.5 text-[10px] font-medium underline"
                        onClick={() => {
                          const lastUser = [...messages]
                            .reverse()
                            .find((entry) => entry.role === "user");
                          if (lastUser) void sendMessage(lastUser.content);
                        }}
                      >
                        Retry
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        ) : null}

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
                ) : mentionItems.length === 0 ? (
                  <p className="px-3 py-6 text-xs text-muted-foreground">
                    No posts match “{mention.query}”.
                  </p>
                ) : (
                  <PopoverList className="flex w-full max-h-56 flex-col overflow-y-auto scrollbar-hide">
                    {mentionItems[0]?.kind === "week" ? (
                      <PopoverListItem
                        type="button"
                        onMouseDown={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
                        onClick={attachWeekPosts}
                        onMouseEnter={() => setMentionIndex(0)}
                        className={cn(
                          "w-full text-sm font-medium text-primary",
                          mentionIndex === 0 && "bg-muted/40",
                        )}
                      >
                        All completed this week ({completedThisWeek.length})
                      </PopoverListItem>
                    ) : null}
                    {renderPostGroup("Completed", completedPosts)}
                    {renderPostGroup("In progress", progressPosts)}
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
                    className="inline-flex max-w-[12rem] cursor-pointer items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15"
                  >
                    <StatusIcon
                      status={post.roadmapStatus || undefined}
                      className="size-3 shrink-0"
                    />
                    {post.githubUrl ? (
                      <GitHubIcon className="size-3 shrink-0" />
                    ) : null}
                    <span className="truncate">@{post.title}</span>
                    <XMarkIcon className="size-2.5 shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-end gap-1 p-1.5">
              {undoSnapshot ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Undo last AI edit"
                  onClick={restoreSnapshot}
                  className="mb-0.5 shrink-0"
                >
                  <Undo2 className="size-3.5" />
                </Button>
              ) : null}
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
              {isLoading ? (
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Stop"
                  onClick={() => abortRef.current?.abort()}
                  className="mb-0.5 shrink-0"
                >
                  <Square className="size-3 fill-current" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Send"
                  disabled={!prompt.trim()}
                  onClick={() => void sendMessage(prompt)}
                  className="mb-0.5 shrink-0"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangelogAiPanel;
