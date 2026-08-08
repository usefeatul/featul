"use client";

import { useEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import { AiIcon } from "@featul/ui/icons/ai";
import { cn } from "@featul/ui/lib/utils";
import { client } from "@featul/api/client";
import { Checkbox } from "@featul/ui/components/checkbox";
import type { FeedEditorRef } from "@/components/editor/editor";

type AiAction = "prompt" | "format" | "improve" | "summary" | "generateFromPosts";
type AiTone = "user-friendly" | "technical" | "brief";
type AiPanelTab = "ask" | "shipped";

type SourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  roadmapStatus: string | null;
  updatedAt: string | Date | null;
};

interface ChangelogAiBarProps {
  workspaceSlug: string;
  title: string;
  summary: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
}

const TONE_OPTIONS: Array<{ value: AiTone; label: string }> = [
  { value: "user-friendly", label: "User-friendly" },
  { value: "technical", label: "Technical" },
  { value: "brief", label: "Brief" },
];

function formatStatusLabel(status: string | null) {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return status ?? "Unknown";
}

export function ChangelogAiBar({
  workspaceSlug,
  title,
  setTitle,
  setSummary,
  editorRef,
  setIsDirty,
}: ChangelogAiBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AiPanelTab>("shipped");
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [sourcePosts, setSourcePosts] = useState<SourcePost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!isOpen || activeTab !== "shipped") {
      return;
    }

    let cancelled = false;

    const loadSourcePosts = async () => {
      setIsLoadingPosts(true);
      try {
        const res = await client.changelog.aiSourcePostsList.$get({
          slug: workspaceSlug,
          limit: 30,
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok || !("ok" in data) || !data.ok || !Array.isArray(data.posts)) {
          setSourcePosts([]);
          return;
        }

        setSourcePosts(data.posts as SourcePost[]);
      } catch {
        if (!cancelled) {
          setSourcePosts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPosts(false);
        }
      }
    };

    loadSourcePosts();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab, workspaceSlug]);

  const applyAiResult = (data: {
    title?: unknown;
    contentMarkdown?: unknown;
    summary?: unknown;
  }) => {
    if (data.title && typeof data.title === "string") {
      setTitle(data.title);
      setIsDirty(true);
    }

    if (data.contentMarkdown && typeof data.contentMarkdown === "string") {
      editorRef.current?.setContentFromMarkdown(data.contentMarkdown);
      setIsDirty(true);
    }

    if (data.summary && typeof data.summary === "string") {
      setSummary(data.summary);
      setIsDirty(true);
    }
  };

  const runAction = async (action: AiAction, options?: { sourcePostIds?: string[] }) => {
    if (isLoading) return;

    if (action === "prompt" && !prompt.trim()) {
      toast.error("Enter a prompt to generate content");
      return;
    }

    if (action === "generateFromPosts") {
      const postIds = options?.sourcePostIds ?? selectedPostIds;
      if (postIds.length === 0) {
        toast.error("Select at least one shipped item");
        return;
      }
    }

    if (action !== "prompt" && action !== "generateFromPosts") {
      const markdown = editorRef.current?.getMarkdown();
      if (!markdown || !markdown.trim()) {
        toast.error("Add some content before using this action");
        return;
      }
    }

    setIsLoading(true);
    try {
      const contentMarkdown =
        action === "prompt" || action === "generateFromPosts"
          ? undefined
          : editorRef.current?.getMarkdown();

      const res = await client.changelog.aiAssist.$post({
        slug: workspaceSlug,
        action,
        prompt:
          action === "prompt" || action === "generateFromPosts"
            ? prompt.trim() || undefined
            : undefined,
        title: title.trim() || undefined,
        contentMarkdown: contentMarkdown?.trim() || undefined,
        sourcePostIds:
          action === "generateFromPosts"
            ? options?.sourcePostIds ?? selectedPostIds
            : undefined,
        tone: action === "generateFromPosts" ? tone : undefined,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !("ok" in data) || !data.ok) {
        const msg = (data as { message?: string })?.message || "Failed to run AI assist";
        toast.error(msg);
        return;
      }

      applyAiResult(data);

      if (action === "prompt") {
        setPrompt("");
      }

      toast.success("AI draft applied");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to run AI assist";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePostSelection = (postId: string, checked: boolean) => {
    setSelectedPostIds((current) => {
      if (checked) {
        if (current.includes(postId)) return current;
        return [...current, postId];
      }
      return current.filter((id) => id !== postId);
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-16 lg:bottom-6 z-40 pointer-events-none">
      <motion.div
        className="mx-auto w-full px-4 pointer-events-auto"
        initial={false}
        animate={{ maxWidth: isOpen ? 860 : 180 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="border border-border bg-background shadow-2xl rounded-md"
        >
          {!isOpen ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
              onClick={() => setIsOpen(true)}
              aria-expanded="false"
            >
              <AiIcon className="size-4 text-primary" />
              <span className="flex-1 text-left font-medium">AI assist</span>
            </button>
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                key="ai-panel"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="flex h-[620px] flex-col"
              >
                <div className="flex items-center justify-between border-b border-border p-4 pb-3">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <AiIcon className="size-4" />
                    <span className="text-sm font-medium">Changelog AI</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                    aria-expanded="true"
                  >
                    Minimize
                  </button>
                </div>

                <div className="flex gap-1 border-b border-border px-4">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 text-sm transition-colors border-b-2 -mb-px",
                      activeTab === "shipped"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setActiveTab("shipped")}
                  >
                    From shipped items
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-2 text-sm transition-colors border-b-2 -mb-px",
                      activeTab === "ask"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setActiveTab("ask")}
                  >
                    Ask AI
                  </button>
                </div>

                {activeTab === "shipped" ? (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Select completed or in-progress feedback items and generate a draft
                        changelog that references what users asked for.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {TONE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs transition-colors",
                              tone === option.value
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => setTone(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                      {isLoadingPosts ? (
                        <p className="text-sm text-muted-foreground">Loading shipped items…</p>
                      ) : sourcePosts.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                          <p className="text-sm font-medium text-foreground">
                            No shipped items yet
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Mark feedback as in progress or completed on your roadmap to use this.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sourcePosts.map((post) => {
                            const checked = selectedPostIds.includes(post.id);
                            return (
                              <label
                                key={post.id}
                                className={cn(
                                  "flex cursor-pointer gap-3 rounded-md border p-3 transition-colors",
                                  checked
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border hover:bg-muted/40",
                                )}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) =>
                                    togglePostSelection(post.id, value === true)
                                  }
                                  aria-label={`Select ${post.title}`}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                      {post.title}
                                    </span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                      {formatStatusLabel(post.roadmapStatus)}
                                    </span>
                                    {post.upvotes > 0 ? (
                                      <span className="text-[11px] text-muted-foreground">
                                        {post.upvotes} votes
                                      </span>
                                    ) : null}
                                  </div>
                                  {post.content ? (
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                      {post.content}
                                    </p>
                                  ) : null}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border p-4">
                      <TextareaAutosize
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        minRows={1}
                        maxRows={3}
                        placeholder="Optional: add extra instructions for the draft"
                        className="mb-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Button
                        className="w-full"
                        onClick={() => runAction("generateFromPosts")}
                        disabled={isLoading || selectedPostIds.length === 0}
                      >
                        {isLoading
                          ? "Generating draft…"
                          : `Generate draft${selectedPostIds.length ? ` (${selectedPostIds.length})` : ""}`}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-6 text-center">
                      <div className="flex size-12 items-center justify-center rounded-md bg-muted/50 text-foreground/50">
                        <AiIcon className="size-6" />
                      </div>
                      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/50 p-4 text-sm text-muted-foreground transition-all hover:border-border hover:bg-muted/50 hover:text-foreground"
                          onClick={() => runAction("format")}
                          disabled={isLoading}
                        >
                          <span>Fix formatting</span>
                        </button>
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/50 p-4 text-sm text-muted-foreground transition-all hover:border-border hover:bg-muted/50 hover:text-foreground"
                          onClick={() => runAction("improve")}
                          disabled={isLoading}
                        >
                          <span>Improve writing</span>
                        </button>
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/50 p-4 text-sm text-muted-foreground transition-all hover:border-border hover:bg-muted/50 hover:text-foreground"
                          onClick={() => runAction("summary")}
                          disabled={isLoading}
                        >
                          <span>Add summary</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-border p-4 pt-2">
                      <div className="relative">
                        <TextareaAutosize
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onEnterPress={() => runAction("prompt")}
                          minRows={1}
                          maxRows={5}
                          placeholder="Describe what changed, or ask AI to rewrite this entry"
                          className={cn(
                            "w-full resize-none rounded-md border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50",
                            isLoading && "opacity-70",
                          )}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-md hover:bg-muted"
                          onClick={() => runAction("prompt")}
                          disabled={isLoading || !prompt.trim()}
                          aria-label="Send prompt"
                        >
                          <AiIcon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ChangelogAiBar;
