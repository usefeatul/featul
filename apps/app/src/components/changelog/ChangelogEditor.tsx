"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedEditor } from "@/components/editor/editor";
import type { JSONContent, MentionSuggestionItem } from "@featul/editor";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import type { EditorAction } from "./EditorHeaderContext";
import { CoverImageUploader } from "./CoverImageUploader";
import { InfoIcon } from "@/components/global/icons";
import { TickIcon } from "@/components/global/icons";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ChevronLeftIcon, PanelIcon } from "@/components/global/icons";

import { TagSelector, type WorkspaceTag } from "./TagSelector";
import { useChangelogEntry } from "../../hooks/useChangelogEntry";
import { fetchWorkspaceMembers } from "@/lib/team/client";
import ChangelogAiPanel from "./ChangelogAiPanel";
import { getChangelogAiSlashSuggestions } from "./ai/slash";
import { getPublishCheckIssues } from "./ai/publishCheck";
import WorkspaceHeader from "@/components/global/WorkspaceHeader";
import { cn } from "@featul/ui/lib/utils";
import { useAssistantPanel } from "@/hooks/useAssistantPanel";
import { PANEL_SHORTCUT_LABEL, usePanelShortcut } from "@/hooks/shortcut";

import { Related } from "./related";
import { Timeline } from "./timeline";

const ENABLE_CHANGELOG_AI = true;

interface ChangelogEditorProps {
  workspaceSlug: string;
  mode: "create" | "edit";
  initialAiOpen?: boolean;
  initialAiWidth?: number;
  entryId?: string;
  initialData?: {
    title: string;
    content: JSONContent;
    summary?: string | null;
    coverImage?: string | null;
    tags: string[];
    relatedPostIds?: string[];
    status: "draft" | "published";
  };
  availableTags: WorkspaceTag[];
}

export function ChangelogEditor({
  workspaceSlug,
  mode,
  initialAiOpen = mode === "create",
  initialAiWidth,
  entryId,
  initialData,
  availableTags,
}: ChangelogEditorProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<
    MentionSuggestionItem[]
  >([]);
  const [isAiOpen, setIsAiOpen] = useAssistantPanel(initialAiOpen);
  const [aiComposerFocusRequest, setAiComposerFocusRequest] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState<{
    text: string;
    attachFeedback?: boolean;
    attachThisWeek?: boolean;
    publishCheck?: boolean;
  } | null>(null);

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [workspaceTags, setWorkspaceTags] = useState(availableTags);

  const {
    editorRef,
    title,
    setTitle,
    setSummary,
    coverImage,
    setCoverImage,
    selectedTags,
    setSelectedTags,
    relatedPostIds,
    setRelatedPostIds,
    isDraft,
    setIsDraft,
    isSaving,
    isDirty,
    setIsDirty,
    handleImageUpload,
    handleSave,
  } = useChangelogEntry({
    workspaceSlug,
    mode,
    entryId,
    initialData,
    autoSaveSuspended: isAiGenerating,
  });

  const openAiPanel = useCallback(() => {
    setIsAiOpen(true);
  }, [setIsAiOpen]);

  usePanelShortcut(() => setIsAiOpen(!isAiOpen));

  const openAiForSelection = useCallback(() => {
    setIsAiOpen(true);
    setAiComposerFocusRequest((request) => request + 1);
  }, [setIsAiOpen]);

  const saveWithCheck = useCallback(async () => {
    if (!isDraft) {
      const issues = getPublishCheckIssues({
        title,
        contentMarkdown: editorRef.current?.getMarkdown(),
        coverImage,
        attachedPostTitles: [],
      });
      if (issues.length > 0) {
        toast.message("Publish check", {
          description: issues.join(" · "),
        });
      }
    }
    await handleSave();
  }, [isDraft, title, coverImage, editorRef, handleSave]);

  const additionalSlashSuggestions = useCallback(
    ({ query }: { query: string }) => {
      if (query && !query.startsWith("ai")) {
        return [];
      }

      return getChangelogAiSlashSuggestions({
        onOpenPanel: openAiPanel,
        onStartPrompt: (text, options) => {
          setPendingPrompt({ text, ...options });
          openAiPanel();
        },
      });
    },
    [openAiPanel],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadMentionSuggestions = async () => {
      const members = await fetchWorkspaceMembers(workspaceSlug);
      if (isCancelled) {
        return;
      }

      const mapped = members
        .filter((member) => member.userId)
        .map((member) => {
          const fallbackLabel =
            member.email?.split("@")[0] || member.userId.slice(0, 8);

          return {
            id: member.userId,
            label: member.name || fallbackLabel,
            email: member.email ?? null,
            avatarUrl: member.image ?? null,
          } satisfies MentionSuggestionItem;
        });

      setMentionSuggestions(mapped);
    };

    loadMentionSuggestions().catch(() => {
      if (!isCancelled) {
        setMentionSuggestions([]);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [workspaceSlug]);

  const headerActions: EditorAction[] = [
    ...(ENABLE_CHANGELOG_AI && !isAiOpen
      ? [
          {
            key: "ai",
            label: "Show AI assistant",
            type: "button" as const,
            variant: "plain" as const,
            shortcut: PANEL_SHORTCUT_LABEL,
            icon: <PanelIcon side="right" filled className="size-[18px]" />,
            onClick: openAiPanel,
          },
        ]
      : []),
    {
      key: "status",
      label: "Published",
      type: "switch",
      checked: !isDraft,
      onClick: () => {
        setIsDraft(!isDraft);
        setIsDirty(true);
      },
    },
    {
      key: "save",
      label: "Save",
      type: "button",
      variant: "plain",
      icon: isSaving ? (
        <LoaderIcon className="size-4" />
      ) : isDirty ? (
        <InfoIcon className="size-4 text-amber-500" />
      ) : (
        <TickIcon className="size-4 text-emerald-500" />
      ),
      onClick: saveWithCheck,
      disabled: isSaving,
    },
    {
      key: "back",
      label: "",
      type: "button",
      variant: "plain",
      icon: <ChevronLeftIcon className="size-3" />,
      onClick: () => router.push(`/workspaces/${workspaceSlug}/changelog`),
    },
  ];

  return (
    <div
      data-changelog-editor
      className={cn(
        "relative min-h-[calc(100dvh-var(--workspace-mobile-nav-height))] bg-background lg:flex lg:h-dvh lg:min-h-dvh lg:overflow-hidden lg:bg-muted/45 dark:lg:bg-black/25 lg:transition-[gap,padding-right] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:motion-reduce:transition-none",
        isAiOpen ? "lg:gap-[2px] lg:pr-1" : "lg:gap-0 lg:pr-0",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-background lg:min-h-0 lg:border-border/60 dark:lg:border-white/10 lg:transition-[border-right-width] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:motion-reduce:transition-none",
          isAiOpen ? "lg:border-r" : "lg:border-r-0",
        )}
      >
        <WorkspaceHeader
          workspaceName={workspaceSlug}
          embeddedInEditor
          editorActions={headerActions}
          editorTitle={title}
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <Timeline scrollRef={scrollRef} title={title} />
          <article
            ref={scrollRef}
            className="scrollbar-hide lg:pl-9 flex min-h-[calc(100dvh-3rem-var(--workspace-mobile-nav-height))] w-full min-w-0 flex-col bg-background lg:min-h-0 lg:w-auto lg:flex-1 lg:overflow-y-auto lg:overscroll-contain"
          >
            <div className="mx-auto w-full max-w-4xl shrink-0 px-4 pt-6 sm:px-6 sm:pt-8">
              <CoverImageUploader
                workspaceSlug={workspaceSlug}
                coverImage={coverImage}
                onCoverImageChange={(url) => {
                  setCoverImage(url);
                  setIsDirty(true);
                }}
              />
            </div>

            <header className="mx-auto w-full max-w-4xl shrink-0 px-4 pb-2 pt-4 sm:px-6">
              <div className="flex w-full flex-wrap items-center gap-1">
                <TagSelector
                  availableTags={workspaceTags}
                  selectedTags={selectedTags}
                  onTagsChange={(tags) => {
                    setSelectedTags(tags);
                    setIsDirty(true);
                  }}
                />
                <Related
                  workspaceSlug={workspaceSlug}
                  selectedIds={relatedPostIds}
                  onChange={(ids) => {
                    setRelatedPostIds(ids);
                    setIsDirty(true);
                  }}
                />
              </div>
            </header>

            <div className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-4 sm:px-6">
              <TextareaAutosize
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Enter a title"
                className="mb-6 w-full resize-none overflow-hidden border-none bg-transparent text-2xl font-semibold tracking-tight placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                minRows={1}
                autoFocus={mode === "create"}
              />
              <div className="min-h-[calc(100%-4rem)] [&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-0">
                <FeedEditor
                  ref={editorRef}
                  initialContent={initialData?.content}
                  placeholder="Start typing or type /ai for AI commands"
                  className="min-h-full"
                  mentionSuggestions={mentionSuggestions}
                  onImageUpload={handleImageUpload}
                  additionalSlashSuggestions={additionalSlashSuggestions}
                  onAiSelection={openAiForSelection}
                  onUpdate={() => setIsDirty(true)}
                />
              </div>
            </div>
          </article>
        </div>
      </div>

      {ENABLE_CHANGELOG_AI ? (
        <ChangelogAiPanel
          key={`${workspaceSlug}:${entryId ?? "draft"}`}
          open={isAiOpen}
          initialWidth={initialAiWidth}
          onOpenChange={setIsAiOpen}
          workspaceSlug={workspaceSlug}
          entryId={entryId}
          editorRef={editorRef}
          title={title}
          setTitle={setTitle}
          setSummary={setSummary}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={workspaceTags}
          onAvailableTagsChange={setWorkspaceTags}
          coverImage={coverImage}
          setIsDirty={setIsDirty}
          onGeneratingChange={setIsAiGenerating}
          pendingPrompt={pendingPrompt}
          onPendingPromptHandled={() => setPendingPrompt(null)}
          composerFocusRequest={aiComposerFocusRequest}
        />
      ) : null}
    </div>
  );
}

export default ChangelogEditor;
