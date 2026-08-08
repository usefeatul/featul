"use client";

import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverSeparator,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { AiIcon } from "@featul/ui/icons/ai";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { cn } from "@featul/ui/lib/utils";
import { client } from "@featul/api/client";
import StatusIcon from "@/components/requests/StatusIcon";
import { SelectionControl } from "@/components/selection/SelectionControl";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import type { ChangelogAiBridge } from "./changelog-ai-bridge";

type AiAction =
  | "prompt"
  | "format"
  | "improve"
  | "expand"
  | "summary"
  | "generateFromPosts";
type AiTone = "user-friendly" | "technical" | "brief";
type AiDetailLevel = "standard" | "detailed";
type DialogTab = "generate" | "refine";

type SourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  roadmapStatus: string | null;
  updatedAt: string | Date | null;
};

interface ChangelogAiToolbarProps {
  bridgeRef: RefObject<ChangelogAiBridge | null>;
}

const QUICK_ACTIONS: Array<{
  action: Exclude<AiAction, "prompt" | "generateFromPosts">;
  label: string;
}> = [
  { action: "expand", label: "Expand detail" },
  { action: "improve", label: "Improve writing" },
  { action: "format", label: "Fix formatting" },
  { action: "summary", label: "Write summary" },
];

function formatStatusLabel(status: string | null) {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return status ?? "Unknown";
}

function getBridge(bridgeRef: RefObject<ChangelogAiBridge | null>) {
  return bridgeRef.current;
}

export function ChangelogAiToolbar({ bridgeRef }: ChangelogAiToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<DialogTab>("generate");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<AiTone>("user-friendly");
  const [detailLevel, setDetailLevel] = useState<AiDetailLevel>("detailed");
  const [sourcePosts, setSourcePosts] = useState<SourcePost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const workspaceSlug = getBridge(bridgeRef)?.workspaceSlug ?? "";

  useEffect(() => {
    if (!dialogOpen || dialogTab !== "generate" || !workspaceSlug) return;

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
  }, [dialogOpen, dialogTab, workspaceSlug]);

  const allSelected =
    sourcePosts.length > 0 && selectedPostIds.length === sourcePosts.length;

  const applyAiResult = useCallback(
    (data: {
      title?: unknown;
      contentMarkdown?: unknown;
      summary?: unknown;
    }) => {
      const bridge = getBridge(bridgeRef);
      if (!bridge) return;

      if (data.title && typeof data.title === "string") {
        bridge.setTitle(data.title);
        bridge.setIsDirty(true);
      }

      if (data.contentMarkdown && typeof data.contentMarkdown === "string") {
        bridge.editorRef.current?.setContentFromMarkdown(data.contentMarkdown);
        bridge.setIsDirty(true);
      }

      if (data.summary && typeof data.summary === "string") {
        bridge.setSummary(data.summary);
        bridge.setIsDirty(true);
      }
    },
    [bridgeRef],
  );

  const runAction = useCallback(
    async (action: AiAction) => {
      if (isLoading) return;

      const bridge = getBridge(bridgeRef);
      if (!bridge) {
        toast.error("Editor is not ready");
        return;
      }

      if (action === "prompt" && !prompt.trim()) {
        toast.error("Enter a prompt first");
        return;
      }

      if (action === "generateFromPosts" && selectedPostIds.length === 0) {
        toast.error("Select at least one shipped item");
        return;
      }

      if (action !== "prompt" && action !== "generateFromPosts") {
        const markdown = bridge.editorRef.current?.getMarkdown();
        if (!markdown || !markdown.trim()) {
          toast.error("Add some content in the editor first");
          return;
        }
      }

      setIsLoading(true);
      try {
        const contentMarkdown =
          action === "prompt" || action === "generateFromPosts"
            ? undefined
            : bridge.editorRef.current?.getMarkdown();

        const res = await client.changelog.aiAssist.$post({
          slug: bridge.workspaceSlug,
          action,
          prompt:
            action === "prompt" || action === "generateFromPosts"
              ? prompt.trim() || undefined
              : undefined,
          title: bridge.title.trim() || undefined,
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
        setMenuOpen(false);
        if (action === "generateFromPosts" || action === "prompt") {
          setDialogOpen(false);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to run AI assist";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      applyAiResult,
      bridgeRef,
      detailLevel,
      isLoading,
      prompt,
      selectedPostIds,
      tone,
    ],
  );

  const openDialog = useCallback((tab: DialogTab) => {
    setDialogTab(tab);
    setDialogOpen(true);
    setMenuOpen(false);
  }, []);

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
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="h-8 gap-2 rounded-none px-3 hover:bg-muted/50"
          >
            <AiIcon className="size-4" />
            AI
          </Button>
        </PopoverTrigger>
        <PopoverContent list align="end" className="min-w-[220px]">
          <PopoverList>
            <PopoverListItem onClick={() => openDialog("generate")}>
              <span className="text-sm">Generate from feedback</span>
            </PopoverListItem>
            <PopoverListItem onClick={() => openDialog("refine")}>
              <span className="text-sm">Custom prompt</span>
            </PopoverListItem>
            <PopoverSeparator />
            {QUICK_ACTIONS.map((item) => (
              <PopoverListItem
                key={item.action}
                onClick={() => runAction(item.action)}
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </PopoverListItem>
            ))}
          </PopoverList>
        </PopoverContent>
      </Popover>

      <SettingsDialogShell
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        width="wide"
        expandable
        icon={<AiIcon className="size-4 text-primary" />}
        title={dialogTab === "generate" ? "Generate changelog" : "Custom AI prompt"}
        description={
          dialogTab === "generate"
            ? "Pick shipped feedback and Featul will draft a detailed changelog entry."
            : "Describe what you want written or changed in this entry."
        }
      >
        {dialogTab === "generate" ? (
          <div className="space-y-4 p-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedPostIds.length > 0
                  ? `${selectedPostIds.length} selected`
                  : "Select feedback to include"}
              </span>
              {sourcePosts.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              ) : null}
            </div>

            <div className="max-h-[min(40vh,320px)] overflow-y-auto rounded-md border border-border bg-background dark:bg-black/20">
              {isLoadingPosts ? (
                <div className="flex items-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  Loading shipped items…
                </div>
              ) : sourcePosts.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium">No shipped items yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mark feedback as In progress or Completed on your roadmap first.
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
                          "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
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
                          <p className="text-sm font-medium leading-snug">{post.title}</p>
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

            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-md border border-border p-0.5">
                {(["detailed", "standard"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDetailLevel(level)}
                    className={cn(
                      "rounded-sm px-2.5 py-1 text-[11px] font-medium capitalize",
                      detailLevel === level
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {(["user-friendly", "technical", "brief"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  className={cn(
                    "rounded-sm border px-2.5 py-1 text-[11px] font-medium capitalize",
                    tone === value
                      ? "border-primary/40 bg-primary/8 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value.replace("-", " ")}
                </button>
              ))}
            </div>

            <TextareaAutosize
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              minRows={2}
              maxRows={4}
              placeholder="Optional: rollout notes, audience, or extra context"
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="card" onClick={() => setDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={() => runAction("generateFromPosts")}
                disabled={isLoading || selectedPostIds.length === 0}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate draft"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-1">
            <TextareaAutosize
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              minRows={5}
              maxRows={10}
              placeholder="Example: Write a detailed changelog about our offline analytics improvements. Include sections, bullet points, and user benefits."
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-black/20"
            />

            <div className="flex flex-wrap gap-2">
              {(["user-friendly", "technical", "brief"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  className={cn(
                    "rounded-sm border px-2.5 py-1 text-[11px] font-medium capitalize",
                    tone === value
                      ? "border-primary/40 bg-primary/8 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value.replace("-", " ")}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="card" onClick={() => setDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => runAction("prompt")} disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>
        )}
      </SettingsDialogShell>
    </>
  );
}

export default ChangelogAiToolbar;
