"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedEditor } from "@/components/editor/editor";
import type { JSONContent, MentionSuggestionItem } from "@featul/editor";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import type { EditorAction } from "./EditorHeaderContext";
import { CoverImageUploader } from "./CoverImageUploader";
import { SparklesIcon } from "@/components/global/icons";

import type { WorkspaceTag } from "@/types/changelog";
import type { Member } from "@/types/team";
import { useChangelogEntry } from "../../hooks/useChangelogEntry";
import { fetchWorkspaceMembers } from "@/lib/team/client";
import ChangelogAiPanel from "./ChangelogAiPanel";
import { getChangelogAiSlashSuggestions } from "./ai/slash";
import { getPublishCheckIssues } from "./ai/publishCheck";
import WorkspaceHeader from "@/components/global/WorkspaceHeader";
import { useAssistantPanel } from "@/hooks/useAssistantPanel";
import { PANEL_SHORTCUT_LABEL, usePanelShortcut } from "@/hooks/shortcut";

import { Related } from "./related";
import { PublishPanel } from "./PublishPanel";
import { SaveStatus } from "./SaveStatus";
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
    scheduledAt?: Date | null;
    publishedAt?: Date | null;
    /** Public URL segment; only known once the entry exists. */
    slug?: string;
  };
  availableTags: WorkspaceTag[];
  /** Credited authors; a new entry starts with whoever creates it. */
  initialAuthorIds?: string[];
}

export function ChangelogEditor({
  workspaceSlug,
  mode,
  initialAiOpen = mode === "create",
  initialAiWidth,
  entryId,
  initialData,
  availableTags,
  initialAuthorIds,
}: ChangelogEditorProps) {
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
  const [members, setMembers] = useState<Member[]>([]);
  const [entrySlug, setEntrySlug] = useState(initialData?.slug ?? "");
  const [publishedAt, setPublishedAt] = useState<Date | null>(
    initialData?.publishedAt ?? null,
  );

  const {
    editorRef,
    title,
    setTitle,
    summary,
    setSummary,
    coverImage,
    setCoverImage,
    selectedTags,
    setSelectedTags,
    relatedPostIds,
    setRelatedPostIds,
    authorIds,
    setAuthorIds,
    isDraft,
    setIsDraft,
    scheduledAt,
    setScheduledAt,
    isSaving,
    isDirty,
    setIsDirty,
    handleImageUpload,
    handleSave,
    requestSave,
  } = useChangelogEntry({
    workspaceSlug,
    mode,
    entryId,
    initialData,
    initialAuthorIds,
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
    if (!isDraft || scheduledAt) {
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
  }, [isDraft, scheduledAt, title, coverImage, editorRef, handleSave]);

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
      setMembers(members.filter((member) => member.userId && member.isActive !== false));

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
    {
      key: "publish",
      label: "Publishing",
      type: "custom",
      onClick: () => {},
      render: () => (
        <PublishPanel
          workspaceSlug={workspaceSlug}
          entryId={entryId}
          entrySlug={entrySlug}
          onEntrySlugChange={setEntrySlug}
          isDraft={isDraft}
          scheduledAt={scheduledAt}
          publishedAt={publishedAt}
          onPublish={() => {
            setIsDraft(false);
            setPublishedAt((current) => current ?? new Date());
            requestSave();
          }}
          onUnpublish={() => {
            setIsDraft(true);
            requestSave();
          }}
          onScheduleChange={(next) => {
            setScheduledAt(next);
            requestSave();
          }}
          members={members}
          authorIds={authorIds}
          onAuthorIdsChange={(ids) => {
            setAuthorIds(ids);
            setIsDirty(true);
          }}
          tags={workspaceTags}
          selectedTagIds={selectedTags}
          onTagIdsChange={(tags) => {
            setSelectedTags(tags);
            setIsDirty(true);
          }}
        />
      ),
    },
    ...(ENABLE_CHANGELOG_AI && !isAiOpen
      ? [
          {
            key: "ai",
            label: "Show AI assistant",
            type: "button" as const,
            variant: "plain" as const,
            shortcut: PANEL_SHORTCUT_LABEL,
            icon: <SparklesIcon className="size-4" aria-hidden="true" />,
            onClick: openAiPanel,
          },
        ]
      : []),
  ];

  return (
    <div
      data-changelog-editor
      className="relative min-h-[calc(100dvh-var(--workspace-mobile-nav-height))] bg-background lg:flex lg:h-(--workspace-frame-height) lg:min-h-(--workspace-frame-height) lg:overflow-hidden"
    >
      <div
        className="flex min-w-0 flex-1 flex-col bg-background lg:min-h-0"
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
          <SaveStatus
            isSaving={isSaving}
            isDirty={isDirty}
            onSave={() => void saveWithCheck()}
            className="fixed bottom-[calc(var(--workspace-mobile-nav-height)+1rem)] left-4 lg:absolute lg:bottom-4"
          />
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
          summary={summary}
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
