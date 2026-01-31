"use client";

import React, { useEffect } from "react";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { getInitials } from "@/utils/user-utils";
import { PostHeader } from "../../post/PostHeader";
import { PostContent } from "../../post/PostContent";
import { PostFooter } from "../../post/PostFooter";
import { useCreatePostData } from "@/hooks/useCreatePostData";
import { usePostUpdate } from "@/hooks/usePostUpdate";
import { usePostImageUpload } from "@/hooks/usePostImageUpload";
import DocumentTextIcon from "@featul/ui/icons/document-text";

interface EditablePost {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  boardSlug: string;
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
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  } = usePostImageUpload(workspaceSlug);

  const { title, setTitle, content, setContent, isPending, updatePost } =
    usePostUpdate({
      postId: post.id,
      onSuccess: () => {
        onOpenChange(false);
      },
    });

  // Pre-fill data
  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setContent(post.content || "");
      if (post.image) {
        setUploadedImage({
          url: post.image,
          name: "image", // Placeholder name since we don't have it
          type: "image/png", // Placeholder type
        });
      } else {
        setUploadedImage(null);
      }
    }
  }, [open, post, setTitle, setContent, setUploadedImage]);

  // Sync selected board if boards are loaded and post has boardSlug
  useEffect(() => {
    if (boards.length > 0 && post.boardSlug) {
      const b = boards.find((b) => b.slug === post.boardSlug);
      if (b) setSelectedBoard(b);
    }
  }, [boards, post.boardSlug, setSelectedBoard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If uploadedImage is null but post had an image, it means it was removed. Pass null.
    // If uploadedImage is set, pass the url.
    // If uploadedImage is null and post didn't have an image, pass null (no change effectively).
    const imageToUpdate = uploadedImage ? uploadedImage.url : null;

    await updatePost(selectedBoard, imageToUpdate);
  };

  const initials = user?.name ? getInitials(user.name) : "?";

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit post"
      width="widest"
      offsetY="20%"
      icon={<DocumentTextIcon className="size-3.5" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          handleRemoveImage={handleRemoveImage}
        />

        <PostFooter
          isPending={isPending}
          disabled={
            !title || !content || !selectedBoard || isPending || uploadingImage
          }
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
          submitLabel="Save Changes"
        />
      </form>
    </SettingsDialogShell>
  );
}
