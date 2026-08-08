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
import { SelectionToolbar } from "@/components/selection/SelectionToolbar";
import type { FeedEditorRef } from "@/components/editor/editor";
import { AiSegmentedControl } from "@/features/changelog-ai/components/AiSegmentedControl";
import { useAiSourcePosts } from "@/features/changelog-ai/hooks/useAiSourcePosts";
import { runChangelogAiStream } from "@/features/changelog-ai/hooks/useChangelogAiStream";
import type {
  AiAction,
  AiDetailLevel,
  AiPanelTab,
  AiTone,
} from "@/features/changelog-ai/types";
import AiSourcePostItem from "./AiSourcePostItem";

interface ChangelogAiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  title: string;
  setTitle: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
  onGeneratingChange?: (generating: boolean) => void;
  initialTab?: AiPanelTab;
  autoRunAction?: Exclude<AiAction, "prompt" | "generateFromPosts" | "summary"> | null;
  onAutoRunActionHandled?: () => void;
}

const TONE_OPTIONS: Array<{ value: AiTone; label: string }> = [
  { value: "user-friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
  { value: "brief", label: "Brief" },
];

const DETAIL_OPTIONS: Array<{ value: AiDetailLevel; label: string; hint: string }> = [
  { value: "detailed", label: "Detailed", hint: "Full release notes" },
  { value: "standard", label: "Standard", hint: "Balanced length" },
];

const REFINE_ACTIONS: Array<{
  action: Exclude<AiAction, "prompt" | "generateFromPosts" | "summary">;
  label: string;
  description: string;
}> = [
  { action: "expand", label: "Expand", description: "Add depth, examples, and detail" },
  { action: "improve", label: "Improve", description: "Polish clarity and flow" },
  { action: "format", label: "Format", description: "Fix headings, lists, and structure" },
];

export function ChangelogAiPanel({
  open,
  onOpenChange,
  workspaceSlug,
  title,
  setTitle,
  editorRef,
  setIsDirty,
  onGeneratingChange,
  initialTab,
  autoRunAction,
  onAutoRunActionHandled,
}: ChangelogAiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating draft…");
  const [activeTab, setActiveTab] = useState<AiPanelTab>("shipped");
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [detailLevel, setDetailLevel] = useState<AiDetailLevel>("detailed");
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const { sourcePosts, isLoadingPosts } = useAiSourcePosts(workspaceSlug, open);

  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const allSelected =
    sourcePosts.length > 0 && selectedPostIds.length === sourcePosts.length;

  const selectedPosts = useMemo(
    () => sourcePosts.filter((post) => selectedPostIds.includes(post.id)),
    [sourcePosts, selectedPostIds],
  );

  const applyAiResult = (data: {
    title?: string;
    contentMarkdown?: string;
  }) => {
    if (data.title) {
      setTitle(data.title);
    }

    if (data.contentMarkdown) {
      editorRef.current?.setContentFromMarkdown(data.contentMarkdown);
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

    const messages: Partial<Record<AiAction, string>> = {
      generateFromPosts: "Writing your changelog draft…",
      prompt: "Generating from your prompt…",
      expand: "Expanding with more detail…",
      improve: "Polishing your entry…",
      format: "Fixing formatting…",
    };

    const startMessage = messages[action] ?? "Working…";
    const toastId = toast.loading(startMessage);

    setLoadingMessage(startMessage);
    setIsLoading(true);
    setIsStreaming(true);
    onGeneratingChange?.(true);
    onOpenChange(false);

    const contentMarkdown = editorRef.current?.getMarkdown();
    const usesStructuredSections =
      action === "generateFromPosts" || action === "prompt";

    editorRef.current?.focus();

    try {
      await runChangelogAiStream(
        {
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
        },
        {
          editorRef,
          usesStructuredSections,
          onTitle: setTitle,
          onComplete: (result) => {
            applyAiResult(result);
            setIsDirty(true);
          },
        },
      );

      if (action === "prompt") setPrompt("");

      toast.success("AI changes applied", { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to run AI assist";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      onGeneratingChange?.(false);
    }
  };

  useEffect(() => {
    if (!open || !autoRunAction) return;
    onAutoRunActionHandled?.();
    void runAction(autoRunAction);
  }, [open, autoRunAction, onAutoRunActionHandled]);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden border-border p-0 sm:max-w-[460px]"
      >
        {isLoading && !isStreaming ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm">
            <LoaderIcon className="size-5 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
            <p className="max-w-[240px] text-center text-xs text-muted-foreground">
              This may take a few seconds for detailed drafts.
            </p>
          </div>
        ) : null}

        <SheetHeader className="space-y-3 border-b border-border bg-card/40 px-5 py-4 pr-12 text-left dark:bg-black/20">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-sm">
              <AiIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold tracking-tight">
                Write with AI
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs leading-relaxed">
                Turn shipped feedback into a detailed changelog, or refine what you
                already wrote.
              </SheetDescription>
            </div>
          </div>

          <div className="flex rounded-md border border-border bg-background p-0.5 dark:bg-black/30">
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
                  "flex-1 cursor-pointer rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        {activeTab === "shipped" ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoadingPosts ? (
                <div className="flex items-center gap-2 px-5 py-10 text-sm text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  Loading shipped items…
                </div>
              ) : sourcePosts.length === 0 ? (
                <div className="mx-5 my-8 rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">Nothing to ship yet</p>
                  <p className="mx-auto mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                    Mark feedback as In progress or Completed on your roadmap, then
                    generate a changelog that references what users asked for.
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <SelectionToolbar
                    allSelected={allSelected}
                    selectedCount={selectedPostIds.length}
                    totalCount={sourcePosts.length}
                    itemLabel="item"
                    itemLabelPlural="items"
                    isPending={false}
                    onToggleAll={toggleSelectAll}
                    hideDelete
                    className="px-5"
                  />
                  <ul className="m-0 w-full list-none p-0">
                    {sourcePosts.map((post) => {
                      const checked = selectedPostIds.includes(post.id);
                      return (
                        <AiSourcePostItem
                          key={post.id}
                          post={post}
                          isSelected={checked}
                          onToggle={(value) => togglePostSelection(post.id, value)}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {selectedPosts.length > 0 ? (
              <div className="border-t border-b border-border/70">
                <div className="px-5 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Will write about
                    <span className="ml-1.5 normal-case tracking-normal text-foreground/70">
                      ({selectedPosts.length})
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {selectedPosts.slice(0, 4).map((post) => (
                      <li
                        key={post.id}
                        className="truncate text-xs leading-relaxed text-foreground"
                      >
                        {post.title}
                      </li>
                    ))}
                    {selectedPosts.length > 4 ? (
                      <li className="text-xs text-muted-foreground">
                        +{selectedPosts.length - 4} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                "bg-muted/10 dark:bg-black/10",
                selectedPosts.length === 0 && "border-t border-border/70",
              )}
            >
              <div className="border-b border-border/70 px-5 py-4">
                <AiSegmentedControl
                  label="Length"
                  options={DETAIL_OPTIONS}
                  value={detailLevel}
                  onChange={setDetailLevel}
                />
              </div>

              <div className="border-b border-border/70 px-5 py-4">
                <AiSegmentedControl
                  label="Tone"
                  options={TONE_OPTIONS}
                  value={tone}
                  onChange={setTone}
                />
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Context{" "}
                    <span className="normal-case tracking-normal text-muted-foreground/80">
                      (optional)
                    </span>
                  </p>
                  <TextareaAutosize
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    minRows={2}
                    maxRows={4}
                    placeholder="Mention audience, rollout notes, or extra context"
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
                  />
                </div>

                <Button
                  className="w-full cursor-pointer"
                  onClick={() => runAction("generateFromPosts")}
                  disabled={isLoading || selectedPostIds.length === 0}
                >
                  Generate detailed draft
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use these on the current entry. For thin drafts, start with{" "}
                <span className="font-medium text-foreground">Expand</span> to add
                depth before publishing.
              </p>
            </div>

            <div className="border-t border-border/70 bg-muted/10 dark:bg-black/10">
              <div className="space-y-2 border-b border-border/70 px-5 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Quick actions
                </p>
                {REFINE_ACTIONS.map((item) => (
                  <button
                    key={item.action}
                    type="button"
                    disabled={isLoading}
                    onClick={() => runAction(item.action)}
                    className="w-full cursor-pointer rounded-md border border-border bg-card px-3 py-3 text-left transition-colors hover:border-border/80 hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black/20"
                  >
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Custom prompt
                  </p>
                  <TextareaAutosize
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onEnterPress={() => runAction("prompt")}
                    minRows={3}
                    maxRows={6}
                    placeholder="Ask for a full changelog with sections, bullets, and user benefits"
                    className={cn(
                      "w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20",
                      isLoading && "opacity-70",
                    )}
                  />
                </div>

                <Button
                  className="w-full cursor-pointer"
                  onClick={() => runAction("prompt")}
                  disabled={isLoading || !prompt.trim()}
                >
                  Run custom prompt
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
