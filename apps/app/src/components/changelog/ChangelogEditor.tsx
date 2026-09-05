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
import { getChangelogAiSlashSuggestions } from "./ai/slash";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";

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
    const [pendingPrompt, setPendingPrompt] = useState<{
        text: string;
        attachFeedback?: boolean;
    } | null>(null);

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

    const openAiPanel = useCallback(() => {
        setIsAiOpen(true);
    }, []);

    const additionalSlashSuggestions = useCallback(
        ({ query }: { query: string }) => {
            if (query && !query.startsWith("ai")) {
                return [];
            }

            return getChangelogAiSlashSuggestions({
                onOpenPanel: openAiPanel,
                onStartPrompt: (text, attachFeedback) => {
                    setPendingPrompt({ text, attachFeedback });
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
                          icon: <AiIcon className="size-4" />,
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
                onClick: handleSave,
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
    }, [setActions, clearActions, handleSave, isSaving, isDraft, isDirty, isAiOpen, router, workspaceSlug, setIsDraft, setIsDirty]);

    return (
        <div className="relative">
            <article
                className={cn(
                    settingsCardShellClass,
                    "min-h-[calc(100vh-6.125rem)] w-full min-w-0 max-lg:min-h-[calc(100dvh-12.5rem)]",
                )}
            >
                <div className={cn(settingsCardInnerClass, "mb-2 w-full shrink-0 overflow-hidden p-0")}>
                    <CoverImageUploader
                        variant="image"
                        workspaceSlug={workspaceSlug}
                        coverImage={coverImage}
                        onCoverImageChange={(url) => {
                            setCoverImage(url);
                            setIsDirty(true);
                        }}
                    />
                </div>

                <div className={cn(settingsCardInnerClass, "w-full flex-1 p-0")}>
                    <header className="flex shrink-0 justify-center px-2 py-2">
                        <Toolbar size="sm" className="w-fit max-w-full">
                            <TagSelector
                                availableTags={availableTags}
                                selectedTags={selectedTags}
                                onTagsChange={(tags) => {
                                    setSelectedTags(tags);
                                    setIsDirty(true);
                                }}
                            />
                            <ToolbarSeparator />
                            <CoverImageUploader
                                workspaceSlug={workspaceSlug}
                                coverImage={coverImage}
                                onCoverImageChange={(url) => {
                                    setCoverImage(url);
                                    setIsDirty(true);
                                }}
                            />
                        </Toolbar>
                    </header>

                    <div className="flex-1 px-4 py-3 pb-28">
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
                        <div className="min-h-[calc(100%-4rem)] [&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-0">
                            <FeedEditor
                                ref={editorRef}
                                initialContent={initialData?.content}
                                placeholder="Start typing or type /ai for AI commands"
                                className="min-h-full"
                                mentionSuggestions={mentionSuggestions}
                                onImageUpload={handleImageUpload}
                                additionalSlashSuggestions={additionalSlashSuggestions}
                                onUpdate={() => setIsDirty(true)}
                            />
                        </div>
                    </div>
                </div>
            </article>

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
                    pendingPrompt={pendingPrompt}
                    onPendingPromptHandled={() => setPendingPrompt(null)}
                />
            ) : null}
        </div>
    );
}

export default ChangelogEditor;
