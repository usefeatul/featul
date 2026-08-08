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
import { SelectionToolbar } from "@/components/selection/SelectionToolbar";
import type { FeedEditorRef } from "@/components/editor/editor";
import AiSourcePostItem, { type AiSourcePost } from "./AiSourcePostItem";

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

interface ChangelogAiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  title: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  editorRef: RefObject<FeedEditorRef | null>;
  setIsDirty: (value: boolean) => void;
  initialTab?: AiPanelTab;
  autoRunAction?: Exclude<AiAction, "prompt" | "generateFromPosts"> | null;
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
  action: Exclude<AiAction, "prompt" | "generateFromPosts">;
  label: string;
  description: string;
}> = [
  { action: "expand", label: "Expand", description: "Add depth, examples, and detail" },
  { action: "improve", label: "Improve", description: "Polish clarity and flow" },
  { action: "format", label: "Format", description: "Fix headings, lists, and structure" },
  { action: "summary", label: "Summary", description: "Write the list preview line" },
];

function OptionPill<T extends string>({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-left transition-all",
        active
          ? "border-primary/50 bg-primary/8 shadow-sm"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/20 dark:bg-black/20",
      )}
    >
      <span className="block text-xs font-medium text-foreground">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </button>
  );
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
  initialTab,
  autoRunAction,
  onAutoRunActionHandled,
}: ChangelogAiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating draft…");
  const [activeTab, setActiveTab] = useState<AiPanelTab>("shipped");
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [detailLevel, setDetailLevel] = useState<AiDetailLevel>("detailed");
  const [sourcePosts, setSourcePosts] = useState<AiSourcePost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;

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

        setSourcePosts(data.posts as AiSourcePost[]);
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
  }, [open, workspaceSlug]);

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

    const messages: Partial<Record<AiAction, string>> = {
      generateFromPosts: "Writing your changelog draft…",
      prompt: "Generating from your prompt…",
      expand: "Expanding with more detail…",
      improve: "Polishing your entry…",
      format: "Fixing formatting…",
      summary: "Writing summary…",
    };

    setLoadingMessage(messages[action] ?? "Working…");
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
      if (action === "generateFromPosts") onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to run AI assist";
      toast.error(msg);
    } finally {
      setIsLoading(false);
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
        {isLoading ? (
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
                  "flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
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
              <div className="border-t border-b border-border/70 px-5 py-3">
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
            ) : null}

            <div
              className={cn(
                "bg-muted/10 px-5 py-4 dark:bg-black/10",
                selectedPosts.length === 0 && "border-t border-border/70",
              )}
            >
              <div className="mb-4 grid grid-cols-2 gap-2">
                {DETAIL_OPTIONS.map((option) => (
                  <OptionPill
                    key={option.value}
                    active={detailLevel === option.value}
                    label={option.label}
                    hint={option.hint}
                    onClick={() => setDetailLevel(option.value)}
                  />
                ))}
              </div>

              <div className="mb-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tone
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value)}
                      className={cn(
                        "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                        tone === option.value
                          ? "border-primary/40 bg-primary/8 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground dark:bg-black/20",
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
                minRows={2}
                maxRows={4}
                placeholder="Optional: mention audience, rollout notes, or extra context"
                className="mb-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
              />

              <Button
                className="w-full"
                onClick={() => runAction("generateFromPosts")}
                disabled={isLoading || selectedPostIds.length === 0}
              >
                Generate detailed draft
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Use these on the current entry. For thin drafts, start with{" "}
                <span className="font-medium text-foreground">Expand</span> to add
                depth before publishing.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REFINE_ACTIONS.map((item) => (
                  <button
                    key={item.action}
                    type="button"
                    disabled={isLoading}
                    onClick={() => runAction(item.action)}
                    className="rounded-md border border-border bg-card px-3 py-3 text-left transition-colors hover:border-border/80 hover:bg-muted/20 disabled:opacity-50 dark:bg-black/20"
                  >
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border bg-muted/10 px-5 py-4 dark:bg-black/10">
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
                  placeholder="Ask for a full changelog with sections, bullets, and user benefits"
                  className={cn(
                    "w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20",
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
