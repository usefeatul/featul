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
import type {
  EditorTextSelection,
  FeedEditorRef,
} from "@/components/editor/editor";
import { useAiSourcePosts } from "@/features/changelog/hooks/useAiSourcePosts";
import { runChangelogAiStream } from "@/features/changelog/hooks/useChangelogAiStream";
import type { AiChatMessage } from "@/features/changelog/types";
import type { AiSourcePost } from "./AiSourcePostItem";
import type { WorkspaceTag } from "./TagSelector";
import { Actions, type AssistantAction } from "./assistant/actions";
import { Composer } from "./assistant/composer";
import { Messages, type AssistantMessage } from "./assistant/messages";
import {
  assistantCopy,
  getAtQuery,
  nextId,
  STARTERS,
  withoutEmDash,
  type AtQuery,
} from "./assistant/config";
import { Attachments, Sources, type SourceItem } from "./assistant/sources";
import {
  getFallbackTagSuggestions,
  getTagDecision,
  getTagRemovalDecision,
} from "./assistant/decisions";
import {
  detectChatIntent,
  extractGithubUrls,
  isSummaryRequest,
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
  onAvailableTagsChange?: (value: WorkspaceTag[]) => void;
  coverImage?: string | null;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
  onGeneratingChange?: (generating: boolean) => void;
  pendingPrompt?: PendingPrompt | null;
  onPendingPromptHandled?: () => void;
  composerFocusRequest?: number;
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
  composerFocusRequest = 0,
}: ChangelogAiPanelProps) {
  const restored = useRef(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [pendingTagNames, setPendingTagNames] = useState<string[]>([]);
  const [selectionContext, setSelectionContext] =
    useState<EditorTextSelection | null>(null);
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
    setPendingTagNames(stored.pendingTagNames);
  }, [open, workspaceSlug, entryId]);

  useEffect(() => {
    if (!open) return;
    saveChangelogAiChat(workspaceSlug, entryId, {
      messages,
      selectedPostIds,
      pendingTagNames,
    });
  }, [
    open,
    workspaceSlug,
    entryId,
    messages,
    selectedPostIds,
    pendingTagNames,
  ]);

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
      setSelectionContext(editorRef.current?.getTextSelection() ?? null);
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, composerFocusRequest, editorRef]);

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

  const resolveWorkspaceTags = (names?: string[]) => {
    const availableByName = new Map(
      availableTags.map((tag) => [tag.name.trim().toLowerCase(), tag]),
    );
    const resolved = new Map<string, WorkspaceTag>();
    for (const value of names ?? []) {
      const tag = availableByName.get(value.trim().toLowerCase());
      if (tag) resolved.set(tag.id, tag);
    }
    return Array.from(resolved.values()).slice(0, 4);
  };

  const applyWorkspaceTags = (names: string[]) => {
    const tags = resolveWorkspaceTags(names);
    if (tags.length === 0) return [];
    setSelectedTags(
      Array.from(new Set([...selectedTags, ...tags.map((tag) => tag.id)])),
    );
    setIsDirty(true);
    return tags.map((tag) => tag.name);
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
      setPrompt(
        "Draft this week's changelog from the attached completed posts.",
      );
    }
  };

  const sendMessage = async (rawText: string, postIds = selectedPostIds) => {
    const text = rawText.trim();
    if (!text || isLoading) return;

    if (mention) setMention(null);

    const selectedWorkspaceTags = availableTags.filter((tag) =>
      selectedTags.includes(tag.id),
    );
    const removal = getTagRemovalDecision(
      text,
      selectedWorkspaceTags.map((tag) => tag.name),
    );
    if (removal) {
      const userMessage: AssistantMessage = {
        id: nextId(),
        role: "user",
        content: text,
      };

      if (removal.kind === "ask") {
        const names = selectedWorkspaceTags
          .map((tag) => `“${tag.name}”`)
          .join(", ");
        setMessages((current) => [
          ...current,
          userMessage,
          {
            id: nextId(),
            role: "assistant",
            content:
              selectedWorkspaceTags.length > 0
                ? `Which tag would you like me to remove: ${names}?`
                : "This changelog is already untagged, so there is nothing to remove.",
          },
        ]);
        setPrompt("");
        return;
      }

      const namesToRemove =
        removal.kind === "removeAll"
          ? selectedWorkspaceTags.map((tag) => tag.name)
          : removal.names;
      const normalizedNames = new Set(
        namesToRemove.map((name) => name.trim().toLowerCase()),
      );
      const removedTags = selectedWorkspaceTags.filter((tag) =>
        normalizedNames.has(tag.name.trim().toLowerCase()),
      );

      if (removedTags.length > 0) {
        captureSnapshot();
        const removedIds = new Set(removedTags.map((tag) => tag.id));
        setSelectedTags(selectedTags.filter((id) => !removedIds.has(id)));
        setIsDirty(true);
      }

      const tagList = removedTags.map((tag) => `“${tag.name}”`).join(", ");
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: nextId(),
          role: "assistant",
          content:
            removedTags.length > 0
              ? removal.kind === "removeAll"
                ? "I have removed all tags from this changelog. It is now untagged."
                : `I have removed ${tagList} from this changelog.`
              : "This changelog is already untagged, so I have not changed anything.",
          effect:
            removedTags.length > 0
              ? `${removedTags.length} tag${removedTags.length === 1 ? "" : "s"} removed`
              : undefined,
        },
      ]);
      setPendingTagNames([]);
      setPrompt("");
      return;
    }

    if (pendingTagNames.length > 0) {
      const decision = getTagDecision(text, pendingTagNames);
      if (decision) {
        const userMessage: AssistantMessage = {
          id: nextId(),
          role: "user",
          content: text,
        };
        if (decision.kind === "decline") {
          setMessages((current) => [
            ...current,
            userMessage,
            {
              id: nextId(),
              role: "assistant",
              content:
                "No problem. I will leave the tags unchanged. We can revisit them whenever you are ready.",
            },
          ]);
          setPendingTagNames([]);
          setPrompt("");
          return;
        }

        const applied = applyWorkspaceTags(decision.names);
        const tagList = applied.map((name) => `“${name}”`).join(", ");
        setMessages((current) => [
          ...current,
          userMessage,
          {
            id: nextId(),
            role: "assistant",
            content:
              applied.length > 0
                ? `I have added ${tagList} to this changelog. Would you like help with anything else?`
                : "Those tags are no longer available in this workspace, so I have not changed anything.",
            effect:
              applied.length > 0
                ? `${applied.length} tag${applied.length === 1 ? "" : "s"} added`
                : undefined,
          },
        ]);
        setPendingTagNames([]);
        setPrompt("");
        return;
      }
    }

    const earlyIntent = detectChatIntent({ text, hasSelection: false });
    if (earlyIntent === "tags") {
      const lower = text.toLowerCase();
      const mentionedTags = availableTags.filter((tag) =>
        lower.includes(tag.name.trim().toLowerCase()),
      );

      if (mentionedTags.length > 0) {
        const newTags = mentionedTags.filter(
          (tag) => !selectedTags.includes(tag.id),
        );
        const names = mentionedTags.map((tag) => `“${tag.name}”`).join(", ");
        const userMessage: AssistantMessage = {
          id: nextId(),
          role: "user",
          content: text,
        };

        setMessages((current) => [
          ...current,
          userMessage,
          {
            id: nextId(),
            role: "assistant",
            content:
              newTags.length > 0
                ? `${names} ${mentionedTags.length === 1 ? "is" : "are"} available in this workspace and could fit this changelog. Would you like me to add ${mentionedTags.length === 1 ? "it" : "them"}?`
                : `${names} ${mentionedTags.length === 1 ? "is already" : "are already"} applied to this changelog.`,
            suggestedTags:
              newTags.length > 0 ? newTags.map((tag) => tag.name) : undefined,
          },
        ]);
        setPendingTagNames(newTags.map((tag) => tag.name));
        setPrompt("");
        return;
      }

      const unselectedTags = availableTags.filter(
        (tag) => !selectedTags.includes(tag.id),
      );
      if (unselectedTags.length === 0) {
        const selectedNames = selectedWorkspaceTags
          .map((tag) => `“${tag.name}”`)
          .join(", ");
        setMessages((current) => [
          ...current,
          { id: nextId(), role: "user", content: text },
          {
            id: nextId(),
            role: "assistant",
            content:
              selectedWorkspaceTags.length > 0
                ? `The available workspace ${selectedWorkspaceTags.length === 1 ? "tag is" : "tags are"} already applied: ${selectedNames}. There are no other existing tags to suggest.`
                : "This workspace does not have any existing tags to suggest yet.",
          },
        ]);
        setPendingTagNames([]);
        setPrompt("");
        return;
      }
    }

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
    const textSelection: EditorTextSelection | null =
      selectionContext ?? editorRef.current?.getTextSelection() ?? null;
    const selectionMarkdown = textSelection?.text ?? "";
    const intent = detectChatIntent({
      text,
      hasSelection: Boolean(textSelection && selectionMarkdown.trim()),
    });
    const summaryRequest =
      intent === "rewrite" && !textSelection && isSummaryRequest(text);
    const streamIntoEditor =
      intent === "rewrite" && !hadContent && !summaryRequest;
    const availableTagNames =
      intent === "tags"
        ? availableTags
            .filter((tag) => !selectedTags.includes(tag.id))
            .map((tag) => tag.name)
        : availableTags.map((tag) => tag.name);
    const history: AiChatMessage[] = messages
      .filter((message) => !message.status)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
    const attachedPosts = sourcePosts.filter((post) =>
      postIds.includes(post.id),
    );
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
    const startedAt = Date.now();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "pending",
        phase: "reading",
        activity: intent,
        startedAt,
      },
    ]);
    setPrompt("");
    setIsLoading(true);
    onGeneratingChange?.(true);

    if (intent === "patch" || (intent === "rewrite" && !summaryRequest)) {
      captureSnapshot();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const planningTimer = window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId && message.status === "pending"
            ? { ...message, phase: "planning" }
            : message,
        ),
      );
    }, 450);

    try {
      let appliedTitle: string | undefined;
      let replyText: string | undefined;
      let suggestedTags: string[] | undefined;

      await runChangelogAiStream(
        {
          slug: workspaceSlug,
          action: summaryRequest ? "summary" : "chat",
          prompt: text,
          title: title.trim() || undefined,
          contentMarkdown: contentMarkdown?.trim() || undefined,
          sourcePostIds: postIds.length > 0 ? postIds : undefined,
          messages: history.length > 0 ? history : undefined,
          intent,
          selectionMarkdown: intent === "patch" ? selectionMarkdown : undefined,
          githubUrls: githubUrls.length > 0 ? githubUrls : undefined,
          availableTagNames,
        },
        {
          editorRef,
          usesStructuredSections: streamIntoEditor,
          applyToEditor: streamIntoEditor,
          patchSelection: intent === "patch",
          signal: controller.signal,
          onStatus: (phase) => {
            if (phase === "generating") {
              window.clearTimeout(planningTimer);
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId && message.status === "pending"
                    ? { ...message, phase: "planning" }
                    : message,
                ),
              );
            }
          },
          onStreamStart: () => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, phase: "writing" }
                  : message,
              ),
            );
          },
          onTitle: (value) => {
            appliedTitle = value;
            setTitle(value);
          },
          onReplyDelta: (accumulated) => {
            if (intent === "tags") return;
            const formalReply = withoutEmDash(accumulated);
            replyText = formalReply;
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: formalReply,
                      status: "streaming",
                      phase: "writing",
                    }
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
            if (summaryRequest) {
              replyText = withoutEmDash(result.summary || replyText || "");
              setIsDirty(true);
              return;
            }
            suggestedTags =
              intent === "tags" ? result.suggestedTags : undefined;
            if (intent === "ask" || intent === "tags") {
              replyText = withoutEmDash(result.reply || replyText || "");
              return;
            }
            if (intent === "patch" && result.contentMarkdown) {
              const applied = textSelection
                ? editorRef.current?.replaceTextRangeWithMarkdown(
                    textSelection,
                    result.contentMarkdown,
                  )
                : false;
              if (!applied) {
                throw new Error(
                  "The selected text changed before the edit finished. Select it again and retry.",
                );
              }
              setSelectionContext(null);
            } else if (result.contentMarkdown) {
              editorRef.current?.setContentFromMarkdown(result.contentMarkdown);
            }
            setIsDirty(true);
          },
        },
      );

      let resolvedSuggestions =
        intent === "tags"
          ? resolveWorkspaceTags(suggestedTags).map((tag) => tag.name)
          : [];
      if (intent === "tags" && resolvedSuggestions.length === 0) {
        resolvedSuggestions = getFallbackTagSuggestions(
          `${title}\n${contentMarkdown ?? ""}`,
          availableTagNames,
        );
      }
      if (intent === "tags") {
        setPendingTagNames(resolvedSuggestions);
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                status: undefined,
                phase: undefined,
                durationMs: Date.now() - startedAt,
                content: assistantCopy({
                  intent,
                  hadContent,
                  title: appliedTitle,
                  sourceCount: postIds.length,
                  reply: replyText,
                  summaryUpdated: summaryRequest,
                  suggestedTags: resolvedSuggestions,
                  selectedTagNames: selectedWorkspaceTags.map(
                    (tag) => tag.name,
                  ),
                }),
                suggestedTags:
                  intent === "tags" && resolvedSuggestions.length > 0
                    ? resolvedSuggestions
                    : undefined,
                effect:
                  intent === "ask"
                    ? undefined
                    : intent === "tags"
                      ? undefined
                      : summaryRequest
                        ? "Summary updated"
                        : intent === "patch"
                          ? "Selection updated"
                          : "Entry updated",
              }
            : message,
        ),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (intent === "rewrite" || intent === "patch") {
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
        const msg =
          err instanceof Error ? err.message : "Failed to run AI assist";
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
      window.clearTimeout(planningTimer);
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
      ? `I found a few things worth checking before you publish:\n${issues.map((issue) => `• ${issue}`).join("\n")}`
      : "The basic checks look good. I will take a closer look at the writing and structure now.";
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
    const next = starter.attachFeedback
      ? `${starter.prompt} @`
      : starter.prompt;
    setPrompt(next);
    if (starter.attachFeedback) {
      setMention({
        start: next.lastIndexOf("@"),
        query: "",
      });
    }
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(next.length, next.length);
    });
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
    setPendingTagNames([]);
    setPrompt("");
    setSelectionContext(null);
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
            <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground/70">
              I can correct wording, update selected text, improve formatting,
              and create relevant tags from this changelog.
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

        {messages.length === 0 &&
        !selectionContext &&
        !mention &&
        !prompt.trim() ? (
          <div className="mb-2">
            <p className="mb-2 text-[11px] font-light leading-relaxed text-muted-foreground/70">
              Tip: Select text in the editor, then tell me how to change it.
            </p>
            <Actions
              actions={STARTERS}
              disabled={isLoading}
              onSelect={runStarter}
            />
          </div>
        ) : null}

        <Composer
          inputRef={inputRef}
          value={prompt}
          selectionText={selectionContext?.text}
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
