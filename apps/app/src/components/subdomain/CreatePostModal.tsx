"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import DocumentTextIcon from "@featul/ui/icons/document-text";
import { ExpandIcon } from "@featul/ui/icons/expand";
import { CollapseIcon } from "@featul/ui/icons/collapse";
import { getInitials } from "@/utils/user";
import { PostHeader } from "../post/PostHeader";
import { PostContent } from "../post/PostContent";
import { PostFooter } from "../post/PostFooter";
import { useCreatePostData } from "../../hooks/useCreatePostData";
import { usePostSubmission } from "../../hooks/usePostSubmission";
import { usePostImageUpload } from "../../hooks/usePostImageUpload";
import { useSimilarPosts } from "@/hooks/useSimilarPosts";
import { SimilarPosts } from "../post/SimilarPosts";
import { canSubmitPostForm } from "@/hooks/postSubmitGuard";
import SubdomainAuthModal from "./SubdomainAuthModal";
import { useSubdomainAuthModal } from "@/hooks/useSubdomainAuthModal";
import { useCloseThenOpenAuth } from "@/hooks/useCloseThenOpenAuth";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  boardSlug: string;
}

export default function CreatePostModal({
  open,
  onOpenChange,
  workspaceSlug,
  boardSlug,
}: CreatePostModalProps) {
  const [expanded, setExpanded] = React.useState(false);
  const {
    isOpen: isAuthOpen,
    mode: authMode,
    redirectTo: authRedirect,
    setOpen: setAuthOpen,
    setMode: setAuthMode,
    openAuth,
  } = useSubdomainAuthModal();

  const { closeThenOpenAuth } = useCloseThenOpenAuth({
    closeCurrent: () => onOpenChange(false),
    openAuth,
  });

  const { user, boards, selectedBoard, setSelectedBoard } = useCreatePostData({
    open,
    workspaceSlug,
    boardSlug,
  });

  const {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  } = usePostImageUpload(workspaceSlug, selectedBoard?.slug);

  const { title, setTitle, content, setContent, isPending, submitPost } =
    usePostSubmission({
      workspaceSlug,
      onSuccess: () => {
        onOpenChange(false);
        setUploadedImage(null);
      },
      onAuthRequired: () => closeThenOpenAuth("sign-in"),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPost(selectedBoard, user, uploadedImage?.url);
  };

  const { posts: similarPosts } = useSimilarPosts({
    title,
    boardSlug: selectedBoard?.slug,
    workspaceSlug,
    enabled: open,
  });

  const initials = user?.name ? getInitials(user.name) : "?";
  const canSubmit = canSubmitPostForm({
    title,
    hasSelectedBoard: !!selectedBoard,
    isPending,
    uploadingImage,
  });
  const expandLabel = expanded ? "Collapse composer" : "Expand composer";

  React.useEffect(() => {
    if (!open) {
      setExpanded(false);
    }
  }, [open]);

  return (
    <>
      <SettingsDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Create post"
        width={expanded ? "xl" : "widest"}
        offsetY={expanded ? "14%" : "12%"}
        verticalAnchor="top"
        icon={<DocumentTextIcon className="size-3.5" />}
        dialogClassName="duration-150 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
        bodyClassName="overflow-hidden p-0"
        layoutTransition={{ duration: 0.16, ease: "easeOut" }}
        headerActions={
          <Button
            type="button"
            variant="card"
            size="icon-sm"
            className="size-7 rounded-md text-accent hover:text-foreground"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expandLabel}
            title={expandLabel}
          >
            {expanded ? (
              <CollapseIcon className="size-4" />
            ) : (
              <ExpandIcon className="size-4" />
            )}
          </Button>
        }
      >
        <form
          onSubmit={handleSubmit}
          className={cn("flex flex-col", expanded && "min-h-0")}
          style={expanded ? { height: "min(58dvh, 560px)" } : undefined}
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
            uploadedImage={uploadedImage}
            uploadingImage={uploadingImage}
            handleRemoveImage={handleRemoveImage}
            expanded={expanded}
          />

          <PostFooter
            isPending={isPending}
            disabled={!canSubmit}
            uploadedImage={uploadedImage}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
          />

          <SimilarPosts
            posts={similarPosts}
            onLinkClick={() => onOpenChange(false)}
          />
        </form>
      </SettingsDialogShell>

      <SubdomainAuthModal
        open={isAuthOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        redirectTo={authRedirect}
      />
    </>
  );
}
