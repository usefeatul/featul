"use client";

import React, { useEffect } from "react";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { getInitials } from "@/utils/user";
import { PostHeader } from "../../post/PostHeader";
import { PostContent } from "../../post/PostContent";
import { PostFooter } from "../../post/PostFooter";
import { useCreatePostData } from "@/hooks/useCreatePostData";
import { usePostUpdate } from "@/hooks/usePostUpdate";
import { usePostImageUpload } from "@/hooks/usePostImageUpload";
import { canSubmitPostForm } from "@/hooks/postSubmitGuard";
import DocumentTextIcon from "@featul/ui/icons/document-text";
import { createPostImageTransferHandlers } from "@/lib/post-image-transfer";
import { listPostImages } from "@/lib/post-images";

interface EditablePost {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  boardSlug: string;
  metadata?: unknown;
}

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  post: EditablePost;
}

export default function EditPostModal({
  open,
  onOpenChange,
  workspaceSlug,
  post,
}: EditPostModalProps) {
  const { user, boards, selectedBoard, setSelectedBoard } = useCreatePostData({
    open,
    workspaceSlug,
    boardSlug: post.boardSlug,
  });

  const {
    uploadedImages,
    uploadingImage,
    fileInputRef,
    setUploadedImages,
    handleFileSelect,
    handleImageFiles,
    handleRemoveImage,
    maxFiles,
    ALLOWED_IMAGE_TYPES,
  } = usePostImageUpload(workspaceSlug, selectedBoard?.slug);

  const { title, setTitle, content, setContent, isPending, updatePost } =
    usePostUpdate({
      postId: post.id,
      onSuccess: () => {
        onOpenChange(false);
      },
    });

  useEffect(() => {
    if (!open) {
      return;
    }
    setTitle(post.title);
    setContent(post.content || "");
    setUploadedImages(listPostImages(post.image, post.metadata));
  }, [
    open,
    post.id,
    post.title,
    post.content,
    post.image,
    post.metadata,
    setTitle,
    setContent,
    setUploadedImages,
  ]);

  useEffect(() => {
    if (boards.length > 0 && post.boardSlug) {
      const b = boards.find((b) => b.slug === post.boardSlug);
      if (b) setSelectedBoard(b);
    }
  }, [boards, post.boardSlug, setSelectedBoard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePost(selectedBoard, uploadedImages);
  };

  const initials = user?.name ? getInitials(user.name) : "?";
  const canSubmit = canSubmitPostForm({
    title,
    hasSelectedBoard: !!selectedBoard,
    isPending,
    uploadingImage,
  });
  const imageTransfer = createPostImageTransferHandlers({
    onImageFiles: handleImageFiles,
    uploading: uploadingImage,
    imageCount: uploadedImages.length,
    maxImages: maxFiles,
  });

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit post"
      width="widest"
      offsetY="20%"
      icon={<DocumentTextIcon className="size-3.5" />}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
        {...imageTransfer}
      >
        <PostHeader
          user={user}
          initials={initials}
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
        />

        <PostContent
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          uploadedImages={uploadedImages}
          uploadingImage={uploadingImage}
          handleRemoveImage={handleRemoveImage}
        />

        <PostFooter
          isPending={isPending}
          disabled={!canSubmit}
          uploadedImages={uploadedImages}
          uploadingImage={uploadingImage}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
          maxImages={maxFiles}
          submitLabel="Save Changes"
        />
      </form>
    </SettingsDialogShell>
  );
}
