"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import type { JSONContent } from "@featul/editor";
import type { FeedEditorRef } from "@/components/editor/editor";

interface UseChangelogEntryProps {
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
}

export function useChangelogEntry({
    workspaceSlug,
    mode,
    entryId,
    initialData,
}: UseChangelogEntryProps) {
    const router = useRouter();
    const editorRef = useRef<FeedEditorRef>(null);

    const [title, setTitle] = useState(initialData?.title || "");
    const [summary, setSummary] = useState(initialData?.summary || "");
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
    const [isDraft, setIsDraft] = useState(initialData?.status !== "published");
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Image upload handler
    const handleImageUpload = useCallback(async (file: File): Promise<string> => {
        const res = await client.storage.getUploadUrl.$post({
            slug: workspaceSlug,
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            folder: "changelog/content",
        });
        const data = await res.json();

        if ("uploadUrl" in data && "publicUrl" in data) {
            await fetch(data.uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });
            return data.publicUrl;
        }
        throw new Error("Failed to upload image");
    }, [workspaceSlug]);

    const handleSave = useCallback(async () => {
        const content = editorRef.current?.getContent();

        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        if (!content || !content.content?.length) {
            toast.error("Please add some content");
            return;
        }

        setIsSaving(true);
        try {
            if (mode === "create") {
                const res = await client.changelog.entriesCreate.$post({
                    slug: workspaceSlug,
                    title: title.trim(),
                    content: content as { type: string; content?: unknown[] },
                    summary: summary.trim() ? summary.trim() : undefined,
                    coverImage: coverImage || undefined,
                    tags: selectedTags,
                    status: isDraft ? "draft" : "published",
                });
                const data = await res.json();
                if ("ok" in data && data.ok) {
                    toast.success(isDraft ? "Draft saved" : "Entry published");
                    setIsDirty(false);
                    router.replace(`/workspaces/${workspaceSlug}/changelog/${data.entry.id}/edit`);
                } else {
                    toast.error("Failed to create entry");
                }
            } else if (entryId) {
                const res = await client.changelog.entriesUpdate.$post({
                    slug: workspaceSlug,
                    entryId,
                    title: title.trim(),
                    content: content as { type: string; content?: unknown[] },
                    summary: summary.trim() ? summary.trim() : null,
                    coverImage: coverImage,
                    tags: selectedTags,
                    status: isDraft ? "draft" : "published",
                });
                const data = await res.json();
                if ("ok" in data && data.ok) {
                    toast.success("Changes saved");
                    setIsDirty(false);
                } else {
                    toast.error("Failed to update entry");
                }
            }
        } catch (err) {
            toast.error("Something went wrong");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    }, [mode, workspaceSlug, entryId, title, summary, coverImage, selectedTags, isDraft, router]);

    // Auto-save effect
    useEffect(() => {
        if (isDirty && !isSaving) {
            const timer = setTimeout(() => {
                handleSave();
            }, 5000); // Auto-save after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isDirty, isSaving, handleSave]);

    return {
        editorRef,
        title,
        setTitle,
        summary,
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
    };
}
