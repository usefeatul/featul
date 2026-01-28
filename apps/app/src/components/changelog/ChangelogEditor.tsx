"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeedEditor } from "@/components/editor/editor";
import type { JSONContent } from "@featul/editor";
import TextareaAutosize from "react-textarea-autosize";
import { useEditorHeaderActions } from "./EditorHeaderContext";
import { CoverImageUploader } from "./CoverImageUploader";
import { InfoIcon } from "@featul/ui/icons/info";
import { TickIcon } from "@featul/ui/icons/tick";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { TagSelector, type WorkspaceTag } from "./TagSelector";
import { useChangelogEntry } from "../../hooks/useChangelogEntry";

interface ChangelogEditorProps {
    workspaceSlug: string;
    mode: "create" | "edit";
    entryId?: string;
    initialData?: {
        title: string;
        content: JSONContent;
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
    } = useChangelogEntry({ workspaceSlug, mode, entryId, initialData });

    // Register actions with the header context
    useEffect(() => {
        setActions([
            {
                key: "status",
                label: "Published", // Label for Switch
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
                // Show InfoIcon if dirty (unsaved), TickIcon if clean (saved), Loader if saving
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
            <main className="mx-auto max-w-3xl px-4 pt-0 pb-8">
                {/* Cover Image (when present) */}
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

                {/* Tags and Add Cover Image Row */}
                <div className="mb-4 flex items-center gap-1 flex-wrap">
                    <TagSelector
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onTagsChange={(tags) => {
                            setSelectedTags(tags);
                            setIsDirty(true);
                        }}
                    />

                    {/* Add Cover Image Button (Always visible) */}
                    <CoverImageUploader
                        workspaceSlug={workspaceSlug}
                        coverImage={null}
                        onCoverImageChange={(url) => {
                            setCoverImage(url);
                            setIsDirty(true);
                        }}
                    />
                </div>

                {/* Title */}
                <TextareaAutosize
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                    placeholder="Enter a title"
                    className="w-full resize-none border-none bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 mb-8 overflow-hidden"
                    minRows={1}
                    autoFocus={mode === "create"}
                />

                {/* Content Editor */}
                <div className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-0">
                    <FeedEditor
                        ref={editorRef}
                        initialContent={initialData?.content}
                        placeholder="Start typing or press '/' for commands"
                        className="min-h-[400px]"
                        onImageUpload={handleImageUpload}
                        onUpdate={() => setIsDirty(true)}
                    />
                </div>
            </main>
        </div>
    );
}

export default ChangelogEditor;
