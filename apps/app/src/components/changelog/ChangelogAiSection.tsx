"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import { AiIcon } from "@featul/ui/icons/ai";
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down";
import { LoaderIcon } from "@featul/ui/icons/loader";
import XMarkIcon from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import { client } from "@featul/api/client";
import StatusIcon from "@/components/requests/StatusIcon";
import { SelectionControl } from "@/components/selection/SelectionControl";
import type { FeedEditorRef } from "@/components/editor/editor";

type AiAction =
  | "prompt"
  | "format"
  | "improve"
  | "expand"
  | "summary"
  | "generateFromPosts";
type AiTone = "user-friendly" | "technical" | "brief";
type AiDetailLevel = "standard" | "detailed";
type AiPanelTab = "shipped" | "refine";

type SourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  roadmapStatus: string | null;
  updatedAt: string | Date | null;
};

interface ChangelogAiSectionProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  workspaceSlug: string;
  title: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
}

const TONE_OPTIONS: Array<{ value: AiTone; label: string }> = [
  { value: "user-friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
  { value: "brief", label: "Brief" },
];

const REFINE_ACTIONS: Array<{
  action: Exclude<AiAction, "prompt" | "generateFromPosts">;
  label: string;
}> = [
  { action: "expand", label: "Expand" },
  { action: "improve", label: "Improve" },
  { action: "format", label: "Format" },
  { action: "summary", label: "Summary" },
];

function formatStatusLabel(status: string | null) {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return status ?? "Unknown";
}

export function ChangelogAiSection({
  expanded,
  onExpandedChange,
  workspaceSlug,
  title,
  setTitle,
  setSummary,
  editorRef,
  setIsDirty,
}: ChangelogAiSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AiPanelTab>("shipped");
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [detailLevel, setDetailLevel] = useState<AiDetailLevel>("detailed");
  const [sourcePosts, setSourcePosts] = useState<SourcePost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!expanded) return;

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
        if (!cancelled) setSourcePosts([]);
      } finally {
        if (!cancelled) setIsLoadingPosts(false);
      }
    };

    loadSourcePosts();
    return () => {
      cancelled = true;
    };
  }, [expanded, workspaceSlug]);

  useEffect(() => {
    if (expanded && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expanded]);

  const allSelected =
    sourcePosts.length > 0 && selectedPostIds.length === sourcePosts.length;

  const selectedPosts = useMemo(
    () => sourcePosts.filter((post) => selectedPostIds.includes(post.id)),
    [sourcePosts, selectedPostIds],
  );

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
        tone: action === "generateFromPosts" || action === "prompt" ? tone : undefined,
        detailLevel: action === "generateFromPosts" ? detailLevel : undefined,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !("ok" in data) || !data.ok) {
        const msg = (data as { message?: string })?.message || "Failed to run AI assist";
        toast.error(msg);
        return;
      }

      applyAiResult(data);

      if (action === "prompt") setPrompt("");

      toast.success("AI changes applied");
      if (action === "generateFromPosts") onExpandedChange(false);
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

  const openWithTab = (tab: AiPanelTab) => {
    setActiveTab(tab);
    onExpandedChange(true);
  };

  return (
    <div ref={sectionRef} id="changelog-ai-section" className="mb-6">
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-card shadow-none transition-colors dark:bg-black/30",
          expanded && "ring-1 ring-border/60",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={expanded}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background dark:bg-black/40">
              <AiIcon className="size-3.5 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                {expanded ? "AI writing assistant" : "Need help writing this entry?"}
              </span>
              {!expanded ? (
                <span className="block truncate text-xs text-muted-foreground">
                  Draft from shipped feedback or refine your content
                </span>
              ) : null}
            </span>
            <ChevronDownIcon
              className={cn(
                "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>

          {!expanded ? (
            <div className="hidden shrink-0 items-center gap-1 sm:flex">
              <Button
                type="button"
                variant="card"
                size="sm"
                className="h-7 text-xs shadow-none"
                onClick={() => openWithTab("shipped")}
              >
                From feedback
              </Button>
              <Button
                type="button"
                variant="card"
                size="sm"
                className="h-7 text-xs shadow-none"
                onClick={() => openWithTab("refine")}
              >
                Refine
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onExpandedChange(false)}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close AI assistant"
            >
              <XMarkIcon className="size-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="ai-expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/70">
                <div className="flex gap-1 border-b border-border/70 px-3 py-2">
                  {(
                    [
                      { id: "shipped", label: "From feedback" },
                      { id: "refine", label: "Refine entry" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={cn(
                        "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "shipped" ? (
                  <div className="px-3 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {selectedPostIds.length > 0
                          ? `${selectedPostIds.length} item${selectedPostIds.length === 1 ? "" : "s"} selected`
                          : "Select shipped feedback to include"}
                      </span>
                      {sourcePosts.length > 0 ? (
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          {allSelected ? "Clear" : "Select all"}
                        </button>
                      ) : null}
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-md border border-border/70 bg-background dark:bg-black/20">
                      {isLoadingPosts ? (
                        <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
                          <LoaderIcon className="size-3.5 animate-spin" />
                          Loading shipped items…
                        </div>
                      ) : sourcePosts.length === 0 ? (
                        <div className="px-3 py-8 text-center">
                          <p className="text-sm font-medium text-foreground">No shipped items</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Mark feedback as In progress or Completed first.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/60">
                          {sourcePosts.map((post) => {
                            const checked = selectedPostIds.includes(post.id);
                            return (
                              <button
                                key={post.id}
                                type="button"
                                onClick={() => togglePostSelection(post.id, !checked)}
                                className={cn(
                                  "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                                  checked ? "bg-primary/5" : "hover:bg-muted/30",
                                )}
                              >
                                <SelectionControl
                                  checked={checked}
                                  label={`Select ${post.title}`}
                                  onCheckedChange={(value) =>
                                    togglePostSelection(post.id, value === true)
                                  }
                                  onClick={(event) => event.stopPropagation()}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium leading-snug text-foreground">
                                    {post.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <StatusIcon
                                      status={post.roadmapStatus || "pending"}
                                      className="size-3.5"
                                    />
                                    <span>{formatStatusLabel(post.roadmapStatus)}</span>
                                    {post.upvotes > 0 ? (
                                      <>
                                        <span>·</span>
                                        <span>{post.upvotes} votes</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {selectedPosts.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedPosts.map((post) => (
                          <span
                            key={post.id}
                            className="max-w-full truncate rounded-sm border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-foreground"
                          >
                            {post.title}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                        {(["detailed", "standard"] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setDetailLevel(level)}
                            className={cn(
                              "rounded-sm px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                              detailLevel === level
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {TONE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTone(option.value)}
                            className={cn(
                              "rounded-sm border px-2 py-1 text-[11px] font-medium transition-colors",
                              tone === option.value
                                ? "border-primary/40 bg-primary/8 text-foreground"
                                : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <TextareaAutosize
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      minRows={1}
                      maxRows={3}
                      placeholder="Optional notes for the draft"
                      className="mt-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
                    />

                    <Button
                      className="mt-3 w-full sm:w-auto"
                      onClick={() => runAction("generateFromPosts")}
                      disabled={isLoading || selectedPostIds.length === 0}
                    >
                      {isLoading ? (
                        <>
                          <LoaderIcon className="size-4 animate-spin" />
                          Writing draft…
                        </>
                      ) : (
                        "Generate draft"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-3">
                    <p className="mb-3 text-xs text-muted-foreground">
                      Quick fixes for the entry below. Use Expand if the draft feels too
                      short.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {REFINE_ACTIONS.map((item) => (
                        <Button
                          key={item.action}
                          type="button"
                          variant="card"
                          size="sm"
                          className="h-7 text-xs shadow-none"
                          disabled={isLoading}
                          onClick={() => runAction(item.action)}
                        >
                          {isLoading ? (
                            <LoaderIcon className="size-3.5 animate-spin" />
                          ) : null}
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="relative mt-3">
                      <TextareaAutosize
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        onEnterPress={() => runAction("prompt")}
                        minRows={2}
                        maxRows={4}
                        placeholder="Or describe what you want changed…"
                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
                      />
                      <Button
                        variant="nav"
                        size="icon-sm"
                        className="absolute right-1.5 bottom-1.5"
                        onClick={() => runAction("prompt")}
                        disabled={isLoading || !prompt.trim()}
                        aria-label="Run prompt"
                      >
                        {isLoading ? (
                          <LoaderIcon className="size-4 animate-spin" />
                        ) : (
                          <AiIcon className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChangelogAiSection;
