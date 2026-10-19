"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import type { JSONContent } from "@featul/editor";
import type { FeedEditorRef } from "@/components/editor/editor";
import { IMAGE_UPLOAD_CONTENT_TYPES, CHANGELOG_IMAGE_UPLOAD_MAX_BYTES } from "@featul/api/upload/policy";
import { uploadFileToSignedUrl } from "@/lib/upload";
import { useRefreshHelpTree } from "./useHelpTree";

export type HelpArticleFormData = {
  title: string;
  summary: string | null;
  content: JSONContent;
  collectionId: string | null;
  status: "draft" | "published";
};

type Props = {
  workspaceSlug: string;
  mode: "create" | "edit";
  articleId?: string;
  initialData?: HelpArticleFormData;
  initialCollectionId?: string | null;
};

/** Help article form state, image upload, save, and 5s dirty autosave once the article exists. */
export function useHelpArticle({ workspaceSlug, mode, articleId, initialData, initialCollectionId }: Props) {
  const router = useRouter();
  const refreshTree = useRefreshHelpTree(workspaceSlug);
  const editorRef = useRef<FeedEditorRef>(null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [collectionId, setCollectionId] = useState<string | null>(
    initialData?.collectionId ?? initialCollectionId ?? null,
  );
  const [isDraft, setIsDraft] = useState(initialData?.status !== "published");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!IMAGE_UPLOAD_CONTENT_TYPES.includes(file.type as (typeof IMAGE_UPLOAD_CONTENT_TYPES)[number])) {
        throw new Error("Unsupported file type");
      }
      if (file.size > CHANGELOG_IMAGE_UPLOAD_MAX_BYTES) {
        throw new Error("Image too large. Maximum size is 5MB.");
      }
      const res = await client.storage.getUploadUrl.$post({
        slug: workspaceSlug,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        folder: "help/content",
      });
      const data = await res.json();
      if ("uploadUrl" in data && "publicUrl" in data) {
        await uploadFileToSignedUrl(data.uploadUrl, file);
        return data.publicUrl;
      }
      throw new Error("Failed to upload image");
    },
    [workspaceSlug],
  );

  const handleSave = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      const content = editorRef.current?.getContent();
      if (!title.trim()) {
        if (!silent) toast.error("Please enter a title");
        return;
      }
      if (!content || !content.content?.length) {
        if (!silent) toast.error("Please add some content");
        return;
      }
      setIsSaving(true);
      const status = isDraft ? "draft" : "published";
      try {
        if (mode === "create" || !articleId) {
          const res = await client.help.articlesCreate.$post({
            slug: workspaceSlug,
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content as { type: string; content?: unknown[] },
            collectionId,
            status,
          });
          const data = await res.json();
          if (!("ok" in data) || !data.ok) throw new Error("Failed to create article");
          setIsDirty(false);
          void refreshTree();
          toast.success(isDraft ? "Draft saved" : "Article published");
          router.replace(`/workspaces/${workspaceSlug}/help/${data.article.id}/edit`);
        } else {
          const res = await client.help.articlesUpdate.$post({
            slug: workspaceSlug,
            articleId,
            title: title.trim(),
            summary: summary.trim() || null,
            content: content as { type: string; content?: unknown[] },
            collectionId,
            status,
          });
          const data = await res.json();
          if (!("ok" in data) || !data.ok) throw new Error("Failed to save article");
          setIsDirty(false);
          void refreshTree();
          if (!silent) toast.success("Changes saved");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setIsSaving(false);
      }
    },
    [mode, articleId, workspaceSlug, title, summary, collectionId, isDraft, router, refreshTree],
  );

  // New articles wait for an explicit save so a half-typed title never creates a row.
  useEffect(() => {
    if (mode !== "edit" || !isDirty || isSaving) return;
    const timer = setTimeout(() => void handleSave({ silent: true }), 5000);
    return () => clearTimeout(timer);
  }, [mode, isDirty, isSaving, handleSave]);

  return {
    editorRef,
    title,
    setTitle,
    summary,
    setSummary,
    collectionId,
    setCollectionId,
    isDraft,
    setIsDraft,
    isSaving,
    isDirty,
    setIsDirty,
    handleImageUpload,
    handleSave,
  };
}
