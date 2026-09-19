"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedEditor } from "@/components/editor/editor";
import type { JSONContent, MentionSuggestionItem } from "@featul/editor";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { useEditorHeaderActions } from "./EditorHeaderContext";
import { CoverImageUploader } from "./CoverImageUploader";
import { InfoIcon } from "@featul/ui/icons/info";
import { TickIcon } from "@featul/ui/icons/tick";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { Sparkles } from "lucide-react";
import { TagSelector, type WorkspaceTag } from "./TagSelector";
import { useChangelogEntry } from "../../hooks/useChangelogEntry";
import { fetchWorkspaceMembers } from "@/lib/team/client";
import ChangelogAiPanel from "./ChangelogAiPanel";
import { getChangelogAiSlashSuggestions } from "./ai/slash";
import { getPublishCheckIssues } from "./ai/publishCheck";
import { clearChangelogAiChat } from "./ai/persist";

const ENABLE_CHANGELOG_AI = true;

interface ChangelogEditorProps {
    workspaceSlug: string;
    mode: "create" | "edit";
    entryId?: string;
    initialData?: {
        title: string;
        content: JSONContent;
        summary?: string | null;
        coverImage?: string | null;
        tags: string[];
        status: "draft" | "published";
    };
    availableTags: WorkspaceTag[];
}

export function ChangelogEditor({
    workspaceSlug,
    mode,
    entryId,
    initialData,
    availableTags,
}: ChangelogEditorProps) {
    const router = useRouter();
    const { setActions, clearActions } = useEditorHeaderActions();
    const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestionItem[]>([]);
    const [isAiOpen, setIsAiOpen] = useState(mode === "create");
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
    }, []);

    const openAiForSelection = useCallback(() => {
        setIsAiOpen(true);
        setAiComposerFocusRequest((request) => request + 1);
    }, []);

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
            clearChangelogAiChat(workspaceSlug, entryId);
        }
        await handleSave();
    }, [
        isDraft,
        title,
        coverImage,
        editorRef,
        workspaceSlug,
        entryId,
        handleSave,
    ]);

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
                        member.email?.split("@")[0] ||
                        member.userId.slice(0, 8);

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

    useEffect(() => {
        setActions([
            ...(ENABLE_CHANGELOG_AI
                ? [
                      {
                          key: "ai",
                          label: "AI",
                          type: "button" as const,
                          variant: "plain" as const,
                          icon: <Sparkles className="size-4" />,
                          active: isAiOpen,
                          onClick: () => {
                              setIsAiOpen((open) => !open);
                          },
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
                icon: isSaving ? <LoaderIcon className="size-4 animate-spin" /> : isDirty ? <InfoIcon className="size-4" /> : <TickIcon className="size-4" />,
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
        ]);

        return () => clearActions();
    }, [setActions, clearActions, saveWithCheck, isSaving, isDraft, isDirty, isAiOpen, router, workspaceSlug, setIsDraft, setIsDirty]);

    return (
        <div
            data-changelog-editor
            className="relative min-h-[calc(100dvh-3rem)] bg-background dark:bg-[#191919]"
        >
            <article
                className={`flex min-h-[calc(100dvh-3rem)] w-full min-w-0 flex-col bg-background transition-[padding] duration-200 dark:bg-[#191919] ${isAiOpen ? "lg:pr-[22rem]" : ""}`}
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

            {ENABLE_CHANGELOG_AI ? (
                <ChangelogAiPanel
                    open={isAiOpen}
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
