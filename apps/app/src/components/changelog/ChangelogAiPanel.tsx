"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@featul/ui/components/sheet";
import { AiIcon } from "@featul/ui/icons/ai";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { cn } from "@featul/ui/lib/utils";
import { client } from "@featul/api/client";
import StatusIcon from "@/components/requests/StatusIcon";
import { SelectionControl } from "@/components/selection/SelectionControl";
import type { FeedEditorRef } from "@/components/editor/editor";

type AiAction = "prompt" | "format" | "improve" | "summary" | "generateFromPosts";
type AiTone = "user-friendly" | "technical" | "brief";
type AiPanelTab = "shipped" | "refine";

type SourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  roadmapStatus: string | null;
  updatedAt: string | Date | null;
};

interface ChangelogAiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  title: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
}

const TONE_OPTIONS: Array<{ value: AiTone; label: string; description: string }> = [
  { value: "user-friendly", label: "Friendly", description: "Clear, benefit-focused copy" },
  { value: "technical", label: "Technical", description: "Detailed, implementation-aware" },
  { value: "brief", label: "Brief", description: "Short bullets, minimal prose" },
];

const REFINE_ACTIONS: Array<{
  action: Exclude<AiAction, "prompt" | "generateFromPosts">;
  label: string;
  description: string;
}> = [
  { action: "format", label: "Format", description: "Fix structure and markdown" },
  { action: "improve", label: "Improve", description: "Sharpen clarity and flow" },
  { action: "summary", label: "Summary", description: "Write a list preview line" },
];

function formatStatusLabel(status: string | null) {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return status ?? "Unknown";
}

export function ChangelogAiPanel({
  open,
  onOpenChange,
  workspaceSlug,
  title,
  setTitle,
  setSummary,
  editorRef,
  setIsDirty,
}: ChangelogAiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AiPanelTab>("shipped");
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [sourcePosts, setSourcePosts] = useState<SourcePost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!open) {
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
  }, [open, workspaceSlug]);

  const allSelected =
    sourcePosts.length > 0 && selectedPostIds.length === sourcePosts.length;

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

  const runAction = async (action: AiAction) => {
    if (isLoading) return;

    if (action === "prompt" && !prompt.trim()) {
      toast.error("Enter a prompt to generate content");
      return;
    }

    if (action === "generateFromPosts" && selectedPostIds.length === 0) {
      toast.error("Select at least one shipped item");
      return;
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
        sourcePostIds: action === "generateFromPosts" ? selectedPostIds : undefined,
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
      if (action === "generateFromPosts") {
        onOpenChange(false);
      }
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

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPostIds([]);
      return;
    }
    setSelectedPostIds(sourcePosts.map((post) => post.id));
  };

  const selectedCountLabel = useMemo(() => {
    if (selectedPostIds.length === 0) return "Select items to generate";
    return `${selectedPostIds.length} selected`;
  }, [selectedPostIds.length]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border p-0 sm:max-w-[420px]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 pr-12 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card dark:bg-black/40">
              <AiIcon className="size-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold">Write with AI</SheetTitle>
              <SheetDescription className="text-xs">
                Draft changelogs from shipped feedback or refine what you already wrote.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="border-b border-border px-5 py-3">
          <div className="flex rounded-md border border-border bg-card p-0.5 dark:bg-black/40">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "shipped"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("shipped")}
            >
              Shipped items
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "refine"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("refine")}
            >
              Refine entry
            </button>
          </div>
        </div>

        {activeTab === "shipped" ? (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
              <span className="text-xs text-muted-foreground">{selectedCountLabel}</span>
              {sourcePosts.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoadingPosts ? (
                <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  Loading shipped items…
                </div>
              ) : sourcePosts.length === 0 ? (
                <div className="mx-5 my-6 rounded-md border border-dashed border-border bg-card px-4 py-8 text-center dark:bg-black/20">
                  <p className="text-sm font-medium text-foreground">No shipped items yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Move feedback to In progress or Completed on your roadmap, then come back
                    here to generate a changelog draft.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {sourcePosts.map((post) => {
                    const checked = selectedPostIds.includes(post.id);
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => togglePostSelection(post.id, !checked)}
                        className={cn(
                          "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors",
                          checked
                            ? "bg-primary/5"
                            : "bg-card hover:bg-muted/30 dark:bg-black/20 dark:hover:bg-black/30",
                        )}
                      >
                        <SelectionControl
                          checked={checked}
                          label={checked ? `Deselect ${post.title}` : `Select ${post.title}`}
                          onCheckedChange={(value) =>
                            togglePostSelection(post.id, value === true)
                          }
                          onClick={(event) => event.stopPropagation()}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium leading-snug text-foreground">
                              {post.title}
                            </p>
                            {post.upvotes > 0 ? (
                              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                {post.upvotes} votes
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <StatusIcon
                              status={post.roadmapStatus || "pending"}
                              className="size-3.5"
                            />
                            <span>{formatStatusLabel(post.roadmapStatus)}</span>
                          </div>
                          {post.content ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {post.content}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-auto border-t border-border bg-background px-5 py-4">
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tone
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-left transition-colors",
                        tone === option.value
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-card hover:bg-muted/30 dark:bg-black/20",
                      )}
                    >
                      <span className="block text-xs font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <TextareaAutosize
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                minRows={2}
                maxRows={4}
                placeholder="Optional instructions for the draft"
                className="mb-3 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
              />

              <Button
                className="w-full"
                onClick={() => runAction("generateFromPosts")}
                disabled={isLoading || selectedPostIds.length === 0}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Generating draft…
                  </>
                ) : (
                  "Generate draft"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-3 text-xs text-muted-foreground">
                Quick actions for the current entry. Add content in the editor first for
                format, improve, and summary.
              </p>
              <div className="grid gap-2">
                {REFINE_ACTIONS.map((item) => (
                  <button
                    key={item.action}
                    type="button"
                    disabled={isLoading}
                    onClick={() => runAction(item.action)}
                    className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/30 disabled:opacity-50 dark:bg-black/20"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <AiIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-border bg-background px-5 py-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Custom prompt
              </p>
              <div className="relative">
                <TextareaAutosize
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onEnterPress={() => runAction("prompt")}
                  minRows={3}
                  maxRows={6}
                  placeholder="Describe what changed, or ask AI to rewrite this entry"
                  className={cn(
                    "w-full resize-none rounded-md border border-border bg-card px-3 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20",
                    isLoading && "opacity-70",
                  )}
                />
                <Button
                  variant="nav"
                  size="icon-sm"
                  className="absolute right-2 bottom-2"
                  onClick={() => runAction("prompt")}
                  disabled={isLoading || !prompt.trim()}
                  aria-label="Run custom prompt"
                >
                  {isLoading ? (
                    <LoaderIcon className="size-4 animate-spin" />
                  ) : (
                    <AiIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ChangelogAiPanel;
