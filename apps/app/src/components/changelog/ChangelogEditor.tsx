"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedEditor } from "@/components/editor/editor";
import type { JSONContent, MentionSuggestionItem } from "@featul/editor";
import TextareaAutosize from "react-textarea-autosize";
import { useEditorHeaderActions } from "./EditorHeaderContext";
import { CoverImageUploader } from "./CoverImageUploader";
import { InfoIcon } from "@featul/ui/icons/info";
import { TickIcon } from "@featul/ui/icons/tick";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { AiIcon } from "@featul/ui/icons/ai";
import { TagSelector, type WorkspaceTag } from "./TagSelector";
import { useChangelogEntry } from "../../hooks/useChangelogEntry";
import { fetchWorkspaceMembers } from "@/lib/team/client";
import ChangelogAiPanel from "./ChangelogAiPanel";
import type { AiPanelTab, AiQuickAction } from "@/features/changelog/types";
import { getChangelogAiSlashSuggestions } from "./ai/slash";

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
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiPanelTab, setAiPanelTab] = useState<AiPanelTab>("shipped");
    const [autoRunAction, setAutoRunAction] = useState<AiQuickAction | null>(null);

    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const {
        editorRef,
        title,
        setTitle,
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

    const openAiPanel = useCallback((tab: AiPanelTab) => {
        setAiPanelTab(tab);
        setIsAiOpen(true);
    }, []);

    const additionalSlashSuggestions = useCallback(
        ({ query }: { query: string }) => {
            if (query && !query.startsWith("ai")) {
                return [];
            }

            return getChangelogAiSlashSuggestions({
                onOpenPanel: openAiPanel,
                onQuickAction: (action) => {
                    setAutoRunAction(action);
                    openAiPanel("refine");
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
                          variant: "card" as const,
                          icon: <AiIcon className="size-4" />,
                          onClick: () => {
                              setAiPanelTab("shipped");
                              setIsAiOpen(true);
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
                variant: "card",
                icon: isSaving ? <LoaderIcon className="size-4 animate-spin" /> : isDirty ? <InfoIcon className="size-4" /> : <TickIcon className="size-4" />,
                onClick: handleSave,
                disabled: isSaving,
            },
            {
                key: "back",
                label: "",
                type: "button",
                variant: "card",
                icon: <ChevronLeftIcon className="size-3" />,
                onClick: () => router.push(`/workspaces/${workspaceSlug}/changelog`),
            },
        ]);

        return () => clearActions();
    }, [setActions, clearActions, handleSave, isSaving, isDraft, isDirty, router, workspaceSlug, setIsDraft, setIsDirty]);

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-3xl px-4 pt-0 pb-10">
                {coverImage && (
                    <CoverImageUploader
                        workspaceSlug={workspaceSlug}
                        coverImage={coverImage}
                        onCoverImageChange={(url) => {
                            setCoverImage(url);
                            setIsDirty(true);
                        }}
                    />
                )}

                <div className="mb-4 flex flex-wrap items-center gap-1">
                    <TagSelector
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onTagsChange={(tags) => {
                            setSelectedTags(tags);
                            setIsDirty(true);
                        }}
                    />

                    <CoverImageUploader
                        workspaceSlug={workspaceSlug}
                        coverImage={null}
                        onCoverImageChange={(url) => {
                            setCoverImage(url);
                            setIsDirty(true);
                        }}
                    />
                </div>

                <TextareaAutosize
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setIsDirty(true);
                    }}
                    placeholder="Enter a title"
                    className="mb-8 w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                    minRows={1}
                    autoFocus={mode === "create"}
                />

                <div className="[&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-0">
                    <FeedEditor
                        ref={editorRef}
                        initialContent={initialData?.content}
                        placeholder="Start typing or type /ai for AI commands"
                        className="min-h-[400px]"
                        mentionSuggestions={mentionSuggestions}
                        onImageUpload={handleImageUpload}
                        additionalSlashSuggestions={additionalSlashSuggestions}
                        onUpdate={() => setIsDirty(true)}
                    />
                </div>
            </main>

            {ENABLE_CHANGELOG_AI ? (
                <ChangelogAiPanel
                    open={isAiOpen}
                    onOpenChange={setIsAiOpen}
                    workspaceSlug={workspaceSlug}
                    editorRef={editorRef}
                    title={title}
                    setTitle={setTitle}
                    setIsDirty={setIsDirty}
                    onGeneratingChange={setIsAiGenerating}
                    initialTab={aiPanelTab}
                    autoRunAction={autoRunAction}
                    onAutoRunActionHandled={() => setAutoRunAction(null)}
                />
            ) : null}
        </div>
    );
}

export default ChangelogEditor;
