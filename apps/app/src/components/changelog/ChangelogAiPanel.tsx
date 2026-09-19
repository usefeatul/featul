"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { client } from "@featul/api/client";
import type { FeedEditorRef } from "@/components/editor/editor";
import { useAiSourcePosts } from "@/features/changelog/hooks/useAiSourcePosts";
import { runChangelogAiStream } from "@/features/changelog/hooks/useChangelogAiStream";
import type { AiChatMessage } from "@/features/changelog/types";
import type { AiSourcePost } from "./AiSourcePostItem";
import type { WorkspaceTag } from "./TagSelector";
import { Actions, type AssistantAction } from "./assistant/actions";
import { Composer } from "./assistant/composer";
import {
  Messages,
  type AssistantMessage,
} from "./assistant/messages";
import {
  assistantCopy,
  getAtQuery,
  nextId,
  STARTERS,
  type AtQuery,
} from "./assistant/config";
import { Attachments, Sources, type SourceItem } from "./assistant/sources";
import {
  detectChatIntent,
  extractGithubUrls,
  isWithinPastWeek,
} from "./ai/intent";
import {
  clearChangelogAiChat,
  loadChangelogAiChat,
  saveChangelogAiChat,
} from "./ai/persist";
import { getPublishCheckIssues } from "./ai/publishCheck";

type PendingPrompt = {
  text: string;
  attachFeedback?: boolean;
  attachThisWeek?: boolean;
  publishCheck?: boolean;
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
  onAvailableTagsChange: (value: WorkspaceTag[]) => void;
  coverImage?: string | null;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
  onGeneratingChange?: (generating: boolean) => void;
  pendingPrompt?: PendingPrompt | null;
  onPendingPromptHandled?: () => void;
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
  onAvailableTagsChange,
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
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
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
    const items: SourceItem[] = [];
    if (mention && !mention.query.trim() && completedThisWeek.length > 0) {
      items.push({ kind: "week" });
    }
    for (const post of filteredPosts) {
      items.push({ kind: "post", post });
    }
    return items;
  }, [mention, completedThisWeek, filteredPosts]);

  const captureSnapshot = useCallback(() => {
    const snapshot = {
      markdown: editorRef.current?.getMarkdown() ?? "",
      title,
      tags: selectedTags,
    };
    undoSnapshotRef.current = snapshot;
    setUndoSnapshot(snapshot);
  }, [editorRef, selectedTags, title]);

  const restoreSnapshot = useCallback(() => {
    const snapshot = undoSnapshotRef.current;
    if (!snapshot) return;
    editorRef.current?.setContentFromMarkdown(snapshot.markdown);
    setTitle(snapshot.title);
    setSelectedTags(snapshot.tags);
    undoSnapshotRef.current = null;
    setUndoSnapshot(null);
    setIsDirty(true);
  }, [editorRef, setIsDirty, setSelectedTags, setTitle]);

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
  }, [open, onOpenChange, restoreSnapshot, undoSnapshot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  const updateMention = (value: string, caret: number) => {
    setMention(getAtQuery(value, caret));
  };

  const applySuggestedTags = async (names?: string[]) => {
    const suggestions = Array.from(
      new Set(
        (names ?? [])
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => name.slice(0, 40)),
      ),
    ).slice(0, 4);
    if (suggestions.length === 0) return [];

    const nextTags = [...availableTags];
    const applied: WorkspaceTag[] = [];

    for (const name of suggestions) {
      const existing = nextTags.find(
        (tag) => tag.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        applied.push(existing);
        continue;
      }

      try {
        const response = await client.changelog.tagsCreate.$post({
          slug: workspaceSlug,
          name,
        });
        if (!response.ok) {
          throw new Error("Could not create the suggested tag");
        }
        const data = await response.json();
        const created = (data as { tag?: WorkspaceTag }).tag;
        if (created) {
          nextTags.push(created);
          applied.push(created);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create a tag",
        );
      }
    }

    if (nextTags.length !== availableTags.length) {
      onAvailableTagsChange(nextTags);
    }
    if (applied.length > 0) {
      setSelectedTags(
        Array.from(new Set([...selectedTags, ...applied.map((tag) => tag.id)])),
      );
      setIsDirty(true);
    }

    return applied.map((tag) => tag.name);
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

    const userMessage: AssistantMessage = {
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
      let suggestedTags: string[] | undefined;

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
            suggestedTags = result.suggestedTags;
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

      const appliedTags = await applySuggestedTags(suggestedTags);

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
                  appliedTags,
                }),
                effect:
                  intent === "ask"
                    ? undefined
                    : appliedTags.length > 0
                      ? `Applied edit · ${appliedTags.length} tag${appliedTags.length === 1 ? "" : "s"} added`
                      : intent === "patch"
                        ? "Selection updated"
                        : "Entry updated",
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

  const pendingActionsRef = useRef({
    attachWeekPosts,
    runPublishCheck,
    sendMessage,
  });
  pendingActionsRef.current = {
    attachWeekPosts,
    runPublishCheck,
    sendMessage,
  };

  useEffect(() => {
    if (!open || !pendingPrompt) return;
    onPendingPromptHandled?.();

    if (pendingPrompt.attachThisWeek) {
      pendingActionsRef.current.attachWeekPosts();
      setPrompt(pendingPrompt.text);
      return;
    }

    if (pendingPrompt.publishCheck) {
      pendingActionsRef.current.runPublishCheck(pendingPrompt.text);
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

    void pendingActionsRef.current.sendMessage(pendingPrompt.text);
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

  const runStarter = (starter: AssistantAction) => {
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
  };

  const startAttachment = () => {
    const next = prompt.trim() ? `${prompt} @` : "@";
    setPrompt(next);
    setMention({ start: next.lastIndexOf("@"), query: "" });
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(next.length, next.length);
    });
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setMessages([]);
    setSelectedPostIds([]);
    setPrompt("");
    setMention(null);
    setUndoSnapshot(null);
    undoSnapshotRef.current = null;
    clearChangelogAiChat(workspaceSlug, entryId);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (!open) return null;

  return (
    <aside className="fixed inset-0 z-40 flex animate-in flex-col bg-background duration-200 slide-in-from-right-2 dark:bg-[#191919] lg:left-auto lg:w-[22rem] lg:border-l lg:border-border/60">
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <h2 className="text-sm font-medium">Assistant</h2>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="plain"
            size="icon-sm"
            className="size-8 rounded-md border-0 bg-transparent text-muted-foreground shadow-none before:hidden hover:bg-black/5 hover:text-foreground dark:hover:bg-white/[0.06]"
            onClick={clearConversation}
            aria-label="New conversation"
            title="New conversation"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="plain"
            size="icon-sm"
            className="size-8 rounded-md border-0 bg-transparent text-muted-foreground shadow-none before:hidden hover:bg-black/5 hover:text-foreground dark:hover:bg-white/[0.06]"
            onClick={() => onOpenChange(false)}
            aria-label="Close assistant"
            title="Close assistant"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium">How can I help?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              I can correct wording, update selected text, improve formatting,
              and create relevant tags from this changelog.
            </p>
            <div className="mt-5">
              <Actions
                actions={STARTERS}
                disabled={isLoading}
                onSelect={runStarter}
              />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground/70">
              Tip: select a few words in the editor, then tell me how to change
              them. Only the selection will be replaced.
            </p>
          </div>
        ) : (
          <Messages
            messages={messages}
            bottomRef={bottomRef}
            onRetry={() => {
              const lastUser = [...messages]
                .reverse()
                .find((message) => message.role === "user");
              if (lastUser) void sendMessage(lastUser.content);
            }}
          />
        )}
      </div>

      <div className="shrink-0 p-3 pt-1">
        {mention ? (
          <Sources
            query={mention.query}
            isLoading={isLoadingPosts}
            items={mentionItems}
            selectedIndex={mentionIndex}
            completedThisWeekCount={completedThisWeek.length}
            completedPosts={completedPosts}
            progressPosts={progressPosts}
            onSelectWeek={attachWeekPosts}
            onSelectPost={insertPostMention}
            onHighlight={setMentionIndex}
          />
        ) : null}

        <Attachments
          posts={selectedPosts}
          onRemove={(id) =>
            setSelectedPostIds((current) =>
              current.filter((postId) => postId !== id),
            )
          }
        />

        {messages.length > 0 && !mention && !prompt.trim() ? (
          <div className="mb-2">
            <Actions
              actions={STARTERS.slice(0, 4)}
              disabled={isLoading}
              onSelect={runStarter}
            />
          </div>
        ) : null}

        <Composer
          inputRef={inputRef}
          value={prompt}
          isLoading={isLoading}
          canUndo={Boolean(undoSnapshot)}
          onChange={(value, caret) => {
            setPrompt(value);
            updateMention(value, caret);
          }}
          onClick={(event) => {
            const field = event.currentTarget;
            updateMention(
              field.value,
              field.selectionStart ?? field.value.length,
            );
          }}
          onKeyUp={(event) => {
            const field = event.currentTarget;
            updateMention(
              field.value,
              field.selectionStart ?? field.value.length,
            );
          }}
          onKeyDown={handleInputKeyDown}
          onAttach={startAttachment}
          onUndo={restoreSnapshot}
          onSend={() => void sendMessage(prompt)}
          onStop={() => abortRef.current?.abort()}
        />
      </div>
    </aside>
  );
}

export default ChangelogAiPanel;
